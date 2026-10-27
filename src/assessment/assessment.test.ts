import { describe, expect, test } from 'bun:test'
import { id, NOW } from '../core/fixtures'
import { ERRORS } from '../errors'
import {
  ASSESSMENT_ERRORS,
  ASSESSMENT_ROUTES,
  ASSESSMENT_VERDICTS,
  assessmentCompletedEvent,
  assessmentSchema,
  FINDING_CATEGORIES,
  findingSchema,
  getAssessmentRatesQuerySchema,
  getAssessmentRatesResponseSchema,
  giveFindingFeedbackRequestSchema,
  listAssessmentsQuerySchema,
} from './index'

const finding = {
  id: id('fnd'),
  category: 'unsupported_claim',
  severity: 'high',
  span: { start: 10, end: 42 },
  explanation: 'No cited source says the product is free.',
  feedback: null,
}

const assessment = {
  id: id('asm'),
  subject: { kind: 'draft', draftId: id('drf') },
  prospectId: id('prs'),
  agentKind: 'outbound',
  instructionVersion: 3,
  verdict: 'fail',
  findings: [finding],
  createdAt: NOW,
}

describe('closed lists', () => {
  test('verdicts and categories', () => {
    expect([...ASSESSMENT_VERDICTS]).toEqual(['pass', 'warn', 'fail'])
    expect([...FINDING_CATEGORIES]).toEqual([
      'unsupported_claim',
      'policy_deviation',
      'missing_disclosure',
      'tone',
    ])
    expect(findingSchema.safeParse({ ...finding, category: 'rude' }).success).toBe(false)
    expect(findingSchema.safeParse({ ...finding, severity: 'critical' }).success).toBe(false)
  })
})

describe('finding', () => {
  test('holds a span and a short explanation, never the text', () => {
    expect(findingSchema.safeParse(finding).success).toBe(true)
    expect(findingSchema.safeParse({ ...finding, body: 'the whole draft' }).success).toBe(false)
    expect(findingSchema.safeParse({ ...finding, text: 'the sentence' }).success).toBe(false)
    expect('body' in findingSchema.shape).toBe(false)
  })

  test('the span ends after it starts and is bounded', () => {
    expect(findingSchema.safeParse({ ...finding, span: { start: 5, end: 5 } }).success).toBe(false)
    expect(findingSchema.safeParse({ ...finding, span: { start: 6, end: 5 } }).success).toBe(false)
    expect(findingSchema.safeParse({ ...finding, span: { start: -1, end: 5 } }).success).toBe(false)
    expect(findingSchema.safeParse({ ...finding, span: { start: 0, end: 20_001 } }).success).toBe(
      false
    )
  })

  test('the explanation is bounded and feedback is closed', () => {
    expect(findingSchema.safeParse({ ...finding, explanation: 'x'.repeat(501) }).success).toBe(
      false
    )
    expect(findingSchema.safeParse({ ...finding, feedback: 'correct' }).success).toBe(true)
    expect(findingSchema.safeParse({ ...finding, feedback: 'maybe' }).success).toBe(false)
  })
})

describe('assessment', () => {
  test('a draft or a call turn', () => {
    expect(assessmentSchema.safeParse(assessment).success).toBe(true)
    const turn = { kind: 'call_turn', callId: id('call'), turnIndex: 4 }
    expect(assessmentSchema.safeParse({ ...assessment, subject: turn }).success).toBe(true)
    expect(
      assessmentSchema.safeParse({
        ...assessment,
        subject: { kind: 'call_turn', callId: id('call') },
      }).success
    ).toBe(false)
  })

  test('a pass has no findings and a fail has one', () => {
    expect(assessmentSchema.safeParse({ ...assessment, verdict: 'pass' }).success).toBe(false)
    expect(
      assessmentSchema.safeParse({ ...assessment, verdict: 'pass', findings: [] }).success
    ).toBe(true)
    expect(assessmentSchema.safeParse({ ...assessment, findings: [] }).success).toBe(false)
    expect(
      assessmentSchema.safeParse({ ...assessment, verdict: 'warn', findings: [] }).success
    ).toBe(true)
  })

  test('findings are bounded and the instruction version starts at 1', () => {
    const many = Array.from({ length: 51 }, () => finding)
    expect(assessmentSchema.safeParse({ ...assessment, findings: many }).success).toBe(false)
    expect(assessmentSchema.safeParse({ ...assessment, instructionVersion: 0 }).success).toBe(false)
    expect(assessmentSchema.safeParse({ ...assessment, instructionVersion: null }).success).toBe(
      true
    )
  })
})

describe('requests and queries', () => {
  test('feedback is strict', () => {
    expect(giveFindingFeedbackRequestSchema.safeParse({ feedback: 'false_alarm' }).success).toBe(
      true
    )
    expect(giveFindingFeedbackRequestSchema.safeParse({ feedback: 'x' }).success).toBe(false)
    expect(
      giveFindingFeedbackRequestSchema.safeParse({ feedback: 'correct', note: 'hi' }).success
    ).toBe(false)
  })

  test('the list takes filters, a range of both days or neither, and at most 13 months', () => {
    expect(listAssessmentsQuerySchema.parse({}).sort).toBe('newest')
    expect(
      listAssessmentsQuerySchema.safeParse({
        verdict: 'fail',
        category: 'tone',
        agentKind: 'inbound',
        sort: 'worst_first',
        from: '2026-09-01',
        to: '2026-10-01',
      }).success
    ).toBe(true)
    expect(listAssessmentsQuerySchema.safeParse({ from: '2026-09-01' }).success).toBe(false)
    expect(
      listAssessmentsQuerySchema.safeParse({ from: '2026-01-01', to: '2027-02-01' }).success
    ).toBe(false)
    expect(listAssessmentsQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
  })

  test('the weekly rate needs a range of at most 13 months', () => {
    expect(
      getAssessmentRatesQuerySchema.safeParse({ from: '2026-01-01', to: '2027-01-31' }).success
    ).toBe(true)
    expect(
      getAssessmentRatesQuerySchema.safeParse({ from: '2026-01-01', to: '2027-02-01' }).success
    ).toBe(false)
    expect(getAssessmentRatesQuerySchema.safeParse({}).success).toBe(false)
    const range = { from: '2026-01-01', to: '2026-02-01' }
    expect(getAssessmentRatesQuerySchema.safeParse({ ...range, limit: '101' }).success).toBe(false)
    expect(getAssessmentRatesQuerySchema.safeParse({ ...range, limit: '100' }).success).toBe(true)
    expect(getAssessmentRatesQuerySchema.safeParse({ ...range, cursor: 'abc' }).success).toBe(true)
  })
})

describe('weekly rates', () => {
  const item = {
    week: '2026-W43',
    weekStart: '2026-10-19',
    agentKind: 'outbound',
    instructionVersion: 2,
    category: null,
  }
  const response = (items: unknown[], nextCursor: string | null = null) => ({
    from: '2026-10-01',
    to: '2026-10-31',
    items,
    nextCursor,
  })

  test('each item has a record count and not_enough_data below 20', () => {
    const ok = { ...item, kind: 'rate', state: 'ok', value: 0.1, recordCount: 50 }
    const few = { ...item, kind: 'rate', state: 'not_enough_data', value: null, recordCount: 4 }
    expect(getAssessmentRatesResponseSchema.safeParse(response([ok, few])).success).toBe(true)
    expect(
      getAssessmentRatesResponseSchema.safeParse(response([{ ...ok, recordCount: 4 }])).success
    ).toBe(false)
    expect(
      getAssessmentRatesResponseSchema.safeParse(response([{ ...ok, week: '2026-43' }])).success
    ).toBe(false)
  })

  test('groups by category: groupBy is category only, and an item names a category or null', () => {
    const ok = { ...item, kind: 'rate', state: 'ok', value: 0.1, recordCount: 50 }
    const range = { from: '2026-01-01', to: '2026-02-01' }
    expect(getAssessmentRatesQuerySchema.safeParse({ ...range, groupBy: 'category' }).success).toBe(
      true
    )
    expect(getAssessmentRatesQuerySchema.safeParse({ ...range, groupBy: 'week' }).success).toBe(
      false
    )
    const withCategory = { ...ok, category: FINDING_CATEGORIES[0] }
    expect(getAssessmentRatesResponseSchema.safeParse(response([withCategory])).success).toBe(true)
    expect(
      getAssessmentRatesResponseSchema.safeParse(response([{ ...ok, category: 'nope' }])).success
    ).toBe(false)
    const { category: _omit, ...noCategory } = ok
    expect(getAssessmentRatesResponseSchema.safeParse(response([noCategory])).success).toBe(false)
  })

  test('is a page of at most 100 items with a next cursor', () => {
    const few = { ...item, kind: 'rate', state: 'not_enough_data', value: null, recordCount: 4 }
    const items = Array.from({ length: 101 }, () => few)
    expect(getAssessmentRatesResponseSchema.safeParse(response(items)).success).toBe(false)
    expect(getAssessmentRatesResponseSchema.safeParse(response(items.slice(0, 100))).success).toBe(
      true
    )
    expect(
      getAssessmentRatesResponseSchema.safeParse(response(items.slice(0, 100), 'abc')).success
    ).toBe(true)
  })
})

describe('assessment.completed event', () => {
  const envelope = (data: unknown) => ({
    id: id('evt', 50),
    type: 'assessment.completed',
    version: 1,
    occurredAt: NOW,
    organizationId: id('org'),
    region: 'us',
    data,
  })
  const data = {
    assessmentId: id('asm'),
    subject: { kind: 'call_turn', callId: id('call'), turnIndex: 2 },
    prospectId: null,
    agentKind: 'inbound',
    instructionVersion: 1,
    verdict: 'warn',
    findingCount: 2,
    categories: ['tone', 'missing_disclosure'],
    completedAt: NOW,
  }

  test('accepts ids and labels', () => {
    expect(assessmentCompletedEvent.safeParse(envelope(data)).success).toBe(true)
    expect(assessmentCompletedEvent.version).toBe(1)
  })

  test('refuses text, repeated categories and counts that disagree', () => {
    const bad = (extra: object) =>
      assessmentCompletedEvent.safeParse(envelope({ ...data, ...extra }))
    expect(bad({ explanation: 'x' }).success).toBe(false)
    expect(bad({ categories: ['tone', 'tone'] }).success).toBe(false)
    expect(bad({ findingCount: 0 }).success).toBe(false)
    expect(bad({ verdict: 'pass' }).success).toBe(false)
    expect(bad({ verdict: 'fail', findingCount: 0, categories: [] }).success).toBe(false)
    expect(bad({ verdict: 'pass', findingCount: 0, categories: [] }).success).toBe(true)
  })
})

describe('errors and routes', () => {
  test('a 404, a 409 and no 403', () => {
    expect(ASSESSMENT_ERRORS['assessment.not_found'].status).toBe(404)
    expect(ASSESSMENT_ERRORS['assessment.reassess_required'].status).toBe(409)
    for (const entry of Object.values(ASSESSMENT_ERRORS)) {
      expect(entry.code in ERRORS).toBe(false)
    }
  })

  test('routes name known codes, and only the feedback route writes', () => {
    const known = new Set<string>([
      ...Object.values(ASSESSMENT_ERRORS).map((e) => e.code),
      'analytics.range_too_large',
      ...Object.values(ERRORS).map((e) => e.code),
    ])
    const routes = Object.entries(ASSESSMENT_ROUTES)
    expect(routes.length).toBe(4)
    for (const [name, r] of routes) {
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
      expect(r.method).toBe(name === 'giveFindingFeedback' ? 'POST' : 'GET')
    }
    expect(ASSESSMENT_ROUTES.giveFindingFeedback.idempotent).toBe(true)
    expect(ASSESSMENT_ROUTES.giveFindingFeedback.roles).toEqual(['owner', 'admin'])
    expect(ASSESSMENT_ROUTES.listAssessments.roles).toEqual(['owner', 'admin'])
    expect(ASSESSMENT_ROUTES.getAssessmentRates.roles).toEqual(['owner', 'admin'])
    expect(ASSESSMENT_ROUTES.getAssessment.description).toContain('never 403')
    expect(ASSESSMENT_ROUTES.getAssessment.roles).toContain('rep')
  })
})
