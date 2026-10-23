import { describe, expect, test } from 'bun:test'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import { MAX_SEQUENCE_STEP, sendKeySchema } from '../mail/send'
import { encodeCursor, MAX_PAGE_SIZE } from '../pagination'
import {
  audienceCheckSchema,
  audienceSchema,
  CAMPAIGN_ERRORS,
  CAMPAIGN_EVENTS,
  CAMPAIGN_ROUTES,
  campaignCursorSchema,
  campaignSchema,
  campaignStatsSchema,
  createCampaignRequestSchema,
  ENROLL_REFUSAL_CODES,
  enrollmentSchema,
  enrollProspectsRequestSchema,
  enrollResultSchema,
  findSequenceProblems,
  invalidSequenceDetailsSchema,
  launchCheckSchema,
  listCampaignsQuerySchema,
  listEnrollmentsQuerySchema,
  listPlaysQuerySchema,
  MAX_SEQUENCE_STEPS,
  playSchema,
  type Step,
  sequenceStepsSchema,
  setSequenceRequestSchema,
  stepVariantResultsSchema,
  updateCampaignRequestSchema,
  variantGroupSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const org = formatId('org', hex(1))
const mem = formatId('mem', hex(3))
const prs = formatId('prs', hex(4))
const snd = formatId('snd', hex(5))
const cpg = formatId('cpg', hex(6))
const enr = formatId('enr', hex(7))
const ply = formatId('ply', hex(9))
const call = formatId('call', hex(11))
const deal = formatId('deal', hex(12))
const NOW = '2026-01-01T00:00:00Z'

const envelope = (type: string, data: unknown) => ({
  id: formatId('evt', hex(10)),
  type,
  version: 1,
  occurredAt: NOW,
  organizationId: org,
  region: 'us',
  data,
})

const email = (key: string, next: string, extra: object = {}): Step => ({
  kind: 'email',
  key,
  goal: 'Introduce the product',
  variants: null,
  next,
  ...extra,
})
const wait = (key: string, next: string): Step => ({ kind: 'wait', key, waitHours: 48, next })
const end = (key: string): Step => ({ kind: 'end', key })

const validSteps: Step[] = [
  email('intro', 'pause'),
  wait('pause', 'check'),
  {
    kind: 'branch',
    key: 'check',
    arms: [{ condition: { kind: 'out_of_office' }, next: 'later' }],
    default: 'followup',
  },
  wait('later', 'followup'),
  email('followup', 'done'),
  end('done'),
]

const variants = (weights: number[]) => ({
  variants: weights.map((weight, i) => ({
    key: `v${i}`,
    label: `Variant ${i}`,
    angle: 'Lead with the outcome',
    weight,
  })),
  promotion: { mode: 'manual' },
})

const window = {
  timeZone: 'America/New_York',
  days: ['mon', 'tue'],
  startMinute: 540,
  endMinute: 1020,
}
const audience = { kind: 'filter' }

const campaign = {
  id: cpg,
  name: 'Q1 outreach',
  goal: 'Book intro calls',
  state: 'draft',
  audience,
  audienceVersion: 1,
  sequenceVersion: 0,
  previewedVersion: null,
  previewedAt: null,
  approvalMode: 'review',
  language: 'en',
  sendWindow: window,
  windowZone: 'campaign',
  dailyCap: 200,
  ownerMembershipId: mem,
  teamId: null,
  playId: null,
  createdAt: NOW,
  updatedAt: NOW,
  launchedAt: null,
  archivedAt: null,
}

describe('Sequence', () => {
  test('a valid Sequence with a wait, a branch and a default parses', () => {
    expect(sequenceStepsSchema.safeParse(validSteps).success).toBe(true)
    expect(findSequenceProblems(validSteps)).toEqual([])
  })
  test('a cycle with no wait is rejected, and one through a wait is allowed', () => {
    const loop = [email('a', 'b'), email('b', 'a'), end('z')]
    expect(sequenceStepsSchema.safeParse(loop).success).toBe(false)
    const codes = findSequenceProblems(loop).map((p) => p.code)
    expect(codes).toContain('cycle_without_wait')
    const withWait = [
      email('a', 'b'),
      wait('b', 'a'),
      {
        kind: 'branch',
        key: 'out',
        arms: [{ condition: { kind: 'no_response', afterHours: 24 }, next: 'z' }],
        default: 'z',
      } as Step,
      end('z'),
    ]
    // 'out' is unreachable here, which is its own problem; the loop itself is fine.
    expect(findSequenceProblems(withWait).map((p) => p.code)).not.toContain('cycle_without_wait')
  })
  test('a Step that cannot be reached is rejected', () => {
    const steps = [email('a', 'z'), end('z'), email('orphan', 'z')]
    expect(sequenceStepsSchema.safeParse(steps).success).toBe(false)
    expect(findSequenceProblems(steps)).toContainEqual({
      code: 'unreachable_step',
      stepKey: 'orphan',
    })
  })
  test('a branch needs a default', () => {
    const branch = {
      kind: 'branch',
      key: 'check',
      arms: [{ condition: { kind: 'task_completed' }, next: 'z' }],
    }
    expect(sequenceStepsSchema.safeParse([branch, end('z')]).success).toBe(false)
    expect(sequenceStepsSchema.safeParse([{ ...branch, default: 'z' }, end('z')]).success).toBe(
      true
    )
    expect(
      sequenceStepsSchema.safeParse([{ ...branch, arms: [], default: 'z' }, end('z')]).success
    ).toBe(false)
  })
  test('there is no branch on opens, clicks or replies', () => {
    for (const kind of ['opened', 'clicked', 'replied', 'bounced']) {
      const step = {
        kind: 'branch',
        key: 'b',
        arms: [{ condition: { kind }, next: 'z' }],
        default: 'z',
      }
      expect(sequenceStepsSchema.safeParse([step, end('z')]).success).toBe(false)
    }
  })
  test('an unknown target, a duplicate key and a dead end are found', () => {
    expect(findSequenceProblems([email('a', 'nowhere'), end('z')]).map((p) => p.code)).toContain(
      'unknown_target'
    )
    expect(
      findSequenceProblems([email('a', 'z'), email('a', 'z'), end('z')]).map((p) => p.code)
    ).toContain('duplicate_key')
    const noEnd = [email('a', 'b'), wait('b', 'a')]
    expect(findSequenceProblems(noEnd).map((p) => p.code)).toContain('no_path_to_end')
  })
  test('it has 1 to 50 Steps, so a Step number fits in the send key', () => {
    expect(sequenceStepsSchema.safeParse([]).success).toBe(false)
    const many = Array.from({ length: MAX_SEQUENCE_STEPS + 1 }, (_, i) =>
      i === MAX_SEQUENCE_STEPS
        ? end('s')
        : wait(`w${i}`, i === MAX_SEQUENCE_STEPS - 1 ? 's' : `w${i + 1}`)
    )
    expect(sequenceStepsSchema.safeParse(many).success).toBe(false)
    expect(MAX_SEQUENCE_STEPS).toBeLessThanOrEqual(MAX_SEQUENCE_STEP)
    expect(
      sendKeySchema.safeParse({ enrollmentId: enr, step: MAX_SEQUENCE_STEPS - 1, attemptEpoch: 0 })
        .success
    ).toBe(true)
  })
  test('a wait is 1 hour to 90 days and a Step key is a safe token', () => {
    expect(
      sequenceStepsSchema.safeParse([{ ...wait('w', 'z'), waitHours: 0 }, end('z')]).success
    ).toBe(false)
    expect(
      sequenceStepsSchema.safeParse([{ ...wait('w', 'z'), waitHours: 2161 }, end('z')]).success
    ).toBe(false)
    expect(sequenceStepsSchema.safeParse([wait('Bad Key', 'z'), end('z')]).success).toBe(false)
  })
  test('a Step with an unknown field or kind is rejected', () => {
    expect(sequenceStepsSchema.safeParse([{ ...end('z'), extra: 1 }]).success).toBe(false)
    expect(sequenceStepsSchema.safeParse([{ kind: 'sms', key: 'z' }]).success).toBe(false)
  })
  test('the body schema rejects what the 422 codes name, and the details can be computed', () => {
    const cyclic = [email('a', 'b'), email('b', 'a'), end('z')]
    expect(setSequenceRequestSchema.safeParse({ expectedVersion: 0, steps: cyclic }).success).toBe(
      false
    )
    const problems = findSequenceProblems(cyclic)
    expect(invalidSequenceDetailsSchema.safeParse({ problems }).success).toBe(true)
    expect(CAMPAIGN_ROUTES.setSequence.description).toContain('rather than request.invalid')
  })
  test('the set request needs a version and valid Steps', () => {
    expect(
      setSequenceRequestSchema.safeParse({ expectedVersion: 0, steps: validSteps }).success
    ).toBe(true)
    expect(setSequenceRequestSchema.safeParse({ steps: validSteps }).success).toBe(false)
    expect(
      invalidSequenceDetailsSchema.safeParse({
        problems: [{ code: 'cycle_without_wait', stepKey: 'a' }],
      }).success
    ).toBe(true)
  })
})

describe('Variants', () => {
  test('two to four Variants with weights adding up to 100 parse', () => {
    expect(variantGroupSchema.safeParse(variants([50, 50])).success).toBe(true)
    expect(variantGroupSchema.safeParse(variants([40, 30, 30])).success).toBe(true)
    expect(variantGroupSchema.safeParse(variants([25, 25, 25, 25])).success).toBe(true)
  })
  test('one, five, or a wrong total is rejected', () => {
    expect(variantGroupSchema.safeParse(variants([100])).success).toBe(false)
    expect(variantGroupSchema.safeParse(variants([20, 20, 20, 20, 20])).success).toBe(false)
    expect(variantGroupSchema.safeParse(variants([50, 49])).success).toBe(false)
    expect(variantGroupSchema.safeParse(variants([60, 50])).success).toBe(false)
    expect(variantGroupSchema.safeParse(variants([100, 0])).success).toBe(false)
  })
  test('a Variant key is used once, and the policy is manual or a bounded auto', () => {
    const dup = variants([50, 50])
    dup.variants[1] = { ...dup.variants[1], key: 'v0' } as (typeof dup.variants)[number]
    expect(variantGroupSchema.safeParse(dup).success).toBe(false)
    const auto = {
      ...variants([50, 50]),
      promotion: { mode: 'auto', minSamplePerVariant: 50, marginPercentagePoints: 5 },
    }
    expect(variantGroupSchema.safeParse(auto).success).toBe(false)
    auto.promotion.minSamplePerVariant = 200
    expect(variantGroupSchema.safeParse(auto).success).toBe(true)
  })
  test('a Step with a test must have valid weights inside the Sequence', () => {
    const bad = [email('a', 'z', { variants: variants([50, 40]) }), end('z')]
    expect(sequenceStepsSchema.safeParse(bad).success).toBe(false)
    const good = [email('a', 'z', { variants: variants([50, 50]) }), end('z')]
    expect(sequenceStepsSchema.safeParse(good).success).toBe(true)
  })
  const stat = (key: string, replyRate: object | null) => ({
    key,
    sent: 120,
    delivered: 118,
    replied: 12,
    positiveReplied: null,
    bounced: 1,
    unsubscribed: 0,
    replyRate,
  })
  const rate = { estimate: 0.1, lower: 0.06, upper: 0.17 }
  test('results below the minimum sample give no interval and no winner is called', () => {
    const base = {
      campaignId: cpg,
      stepKey: 'intro',
      minimumSample: 100,
      promotion: null,
      computedAt: NOW,
    }
    expect(
      stepVariantResultsSchema.safeParse({
        ...base,
        status: 'not_enough_data',
        variants: [stat('a', null), stat('b', null)],
      }).success
    ).toBe(true)
    expect(
      stepVariantResultsSchema.safeParse({
        ...base,
        status: 'not_enough_data',
        variants: [stat('a', rate), stat('b', null)],
      }).success
    ).toBe(false)
    expect(
      stepVariantResultsSchema.safeParse({
        ...base,
        status: 'measured',
        variants: [stat('a', rate), stat('b', rate)],
      }).success
    ).toBe(true)
    expect(
      stepVariantResultsSchema.safeParse({
        ...base,
        status: 'measured',
        variants: [stat('a', rate), stat('b', null)],
      }).success
    ).toBe(false)
  })
  test('there are no open or click counts', () => {
    const r = stepVariantResultsSchema.safeParse({
      campaignId: cpg,
      stepKey: 'intro',
      status: 'measured',
      minimumSample: 100,
      variants: [{ ...stat('a', rate), opened: 3 }, stat('b', rate)],
      promotion: null,
      computedAt: NOW,
    })
    expect(r.success).toBe(false)
  })
})

describe('Campaign', () => {
  test('parses, and has no overlap setting', () => {
    expect(campaignSchema.safeParse(campaign).success).toBe(true)
    expect(campaignSchema.safeParse({ ...campaign, allowOverlap: true }).success).toBe(false)
    expect(campaignSchema.safeParse({ ...campaign, state: 'deleted' }).success).toBe(false)
  })
  test('create has safe defaults and rejects a bad cap, window or audience', () => {
    const body = {
      name: 'Q1',
      goal: 'Book calls',
      audience,
      sendWindow: window,
      dailyCap: 100,
    }
    const parsed = createCampaignRequestSchema.parse(body)
    expect(parsed.approvalMode).toBe('review')
    expect(parsed.language).toBe('en')
    expect(createCampaignRequestSchema.safeParse({ ...body, dailyCap: 0 }).success).toBe(false)
    expect(createCampaignRequestSchema.safeParse({ ...body, dailyCap: 5001 }).success).toBe(false)
    expect(createCampaignRequestSchema.safeParse({ ...body, name: '  ' }).success).toBe(false)
    expect(createCampaignRequestSchema.safeParse({ ...body, trackOpens: true }).success).toBe(false)
    expect(createCampaignRequestSchema.safeParse({ ...body, language: 'fr' }).success).toBe(false)
  })
  test('update needs at least one field', () => {
    expect(updateCampaignRequestSchema.safeParse({}).success).toBe(false)
    expect(updateCampaignRequestSchema.safeParse({ dailyCap: 10 }).success).toBe(true)
  })
  test('an audience is a filter or 1 to 500 unique Prospects', () => {
    expect(audienceSchema.safeParse({ kind: 'filter', source: 'manual' }).success).toBe(true)
    expect(audienceSchema.safeParse({ kind: 'prospects', prospectIds: [prs] }).success).toBe(true)
    expect(audienceSchema.safeParse({ kind: 'prospects', prospectIds: [] }).success).toBe(false)
    expect(audienceSchema.safeParse({ kind: 'prospects', prospectIds: [prs, prs] }).success).toBe(
      false
    )
    const many = Array.from({ length: 501 }, (_, i) => formatId('prs', hex(1000 + i)))
    expect(audienceSchema.safeParse({ kind: 'prospects', prospectIds: many }).success).toBe(false)
  })
  test('stats add up and have no open or click counts', () => {
    const stats = {
      campaignId: cpg,
      enrolled: 10,
      active: 6,
      completed: 1,
      stopped: 3,
      sent: 20,
      replied: 2,
      positiveReplied: null,
      meetings: 1,
      bounced: 1,
      unsubscribed: 0,
      computedAt: NOW,
    }
    expect(campaignStatsSchema.safeParse(stats).success).toBe(true)
    expect(campaignStatsSchema.safeParse({ ...stats, active: 7 }).success).toBe(false)
    expect(campaignStatsSchema.safeParse({ ...stats, replied: 11 }).success).toBe(false)
    expect(campaignStatsSchema.safeParse({ ...stats, opened: 4 }).success).toBe(false)
  })
})

describe('audience check and launch check', () => {
  const counts = {
    total: 100,
    verified: 90,
    unverified: 10,
    suppressed: 5,
    noConsent: 20,
    activeInOtherCampaign: 3,
    eligible: 72,
  }
  const check = {
    campaignId: cpg,
    state: 'ready',
    audienceVersion: 1,
    counts,
    requestedAt: NOW,
    completedAt: NOW,
  }
  test('a ready check has counts and a pending one has none', () => {
    expect(audienceCheckSchema.safeParse(check).success).toBe(true)
    expect(
      audienceCheckSchema.safeParse({ ...check, state: 'pending', counts: null, completedAt: null })
        .success
    ).toBe(true)
    expect(
      audienceCheckSchema.safeParse({ ...check, state: 'pending', completedAt: null }).success
    ).toBe(false)
    expect(audienceCheckSchema.safeParse({ ...check, counts: null }).success).toBe(false)
  })
  test('counts are consistent', () => {
    expect(
      audienceCheckSchema.safeParse({ ...check, counts: { ...counts, unverified: 9 } }).success
    ).toBe(false)
    expect(
      audienceCheckSchema.safeParse({ ...check, counts: { ...counts, eligible: 101 } }).success
    ).toBe(false)
    expect(
      audienceCheckSchema.safeParse({ ...check, counts: { ...counts, eligible: 100 } }).success
    ).toBe(false)
  })
  const items = (results: string[]) =>
    ['sequence', 'preview', 'audience', 'mailbox'].map((c, i) => ({
      check: c,
      result: results[i],
      code: results[i] === 'pass' ? null : 'campaign.not_previewed',
    }))
  const launch = (results: string[], canLaunch: boolean) => ({
    campaignId: cpg,
    checks: items(results),
    canLaunch,
    suppressed: 5,
    noConsent: 20,
    eligible: 72,
    dailyCapacity: 100,
    checkedAt: NOW,
  })
  test('can launch only when all four checks pass, and there is no bypass', () => {
    expect(
      launchCheckSchema.safeParse(launch(['pass', 'pass', 'pass', 'pass'], true)).success
    ).toBe(true)
    expect(
      launchCheckSchema.safeParse(launch(['pass', 'fail', 'pass', 'pass'], false)).success
    ).toBe(true)
    expect(
      launchCheckSchema.safeParse(launch(['pass', 'fail', 'pass', 'pass'], true)).success
    ).toBe(false)
    expect(
      launchCheckSchema.safeParse(launch(['pass', 'pass', 'pass', 'pending'], true)).success
    ).toBe(false)
    expect(
      launchCheckSchema.safeParse({
        ...launch(['pass', 'pass', 'pass', 'pass'], true),
        skipConsent: true,
      }).success
    ).toBe(false)
  })
  test('a code belongs to its check', () => {
    const bad = launch(['fail', 'pass', 'pass', 'pass'], false)
    bad.checks[0] = { check: 'sequence', result: 'fail', code: 'campaign.no_healthy_mailbox' }
    expect(launchCheckSchema.safeParse(bad).success).toBe(false)
  })
  test('each check appears once', () => {
    const dup = launch(['pass', 'pass', 'pass', 'pass'], true)
    dup.checks[3] = { ...dup.checks[3], check: 'sequence' } as (typeof dup.checks)[number]
    expect(launchCheckSchema.safeParse(dup).success).toBe(false)
  })
})

describe('Enrollment', () => {
  const active = {
    id: enr,
    campaignId: cpg,
    prospectId: prs,
    state: 'active',
    stopReason: null,
    currentStepKey: 'intro',
    currentStep: 0,
    attemptEpoch: 0,
    nextDueAt: NOW,
    enrolledAt: NOW,
    stoppedAt: null,
    completedAt: null,
  }
  test('states carry their own fields', () => {
    expect(enrollmentSchema.safeParse(active).success).toBe(true)
    const stopped = {
      ...active,
      state: 'stopped',
      stopReason: 'replied',
      stoppedAt: NOW,
      nextDueAt: null,
      currentStepKey: null,
      currentStep: null,
    }
    expect(enrollmentSchema.safeParse(stopped).success).toBe(true)
    expect(enrollmentSchema.safeParse({ ...stopped, stopReason: null }).success).toBe(false)
    expect(enrollmentSchema.safeParse({ ...stopped, nextDueAt: NOW }).success).toBe(false)
    expect(enrollmentSchema.safeParse({ ...active, stopReason: 'replied' }).success).toBe(false)
    expect(enrollmentSchema.safeParse({ ...active, state: 'completed' }).success).toBe(false)
    expect(enrollmentSchema.safeParse({ ...active, stopReason: 'dislikes_us' }).success).toBe(false)
  })
  test('the send key is the Enrollment, the Step position and the epoch', () => {
    expect(
      sendKeySchema.safeParse({
        enrollmentId: active.id,
        step: active.currentStep,
        attemptEpoch: active.attemptEpoch,
      }).success
    ).toBe(true)
  })
  test('enrolling takes 1 to 100 unique Prospects', () => {
    expect(enrollProspectsRequestSchema.safeParse({ prospectIds: [prs] }).success).toBe(true)
    expect(enrollProspectsRequestSchema.safeParse({ prospectIds: [] }).success).toBe(false)
    expect(enrollProspectsRequestSchema.safeParse({ prospectIds: [prs, prs] }).success).toBe(false)
    const many = Array.from({ length: 101 }, (_, i) => formatId('prs', hex(2000 + i)))
    expect(enrollProspectsRequestSchema.safeParse({ prospectIds: many }).success).toBe(false)
  })
  test('only an already_active refusal names an Enrollment', () => {
    const base = { prospectId: prs, outcome: 'refused', enrollmentId: enr }
    expect(enrollResultSchema.safeParse({ ...base, refusal: 'not_found' }).success).toBe(false)
    expect(enrollResultSchema.safeParse({ ...base, refusal: 'already_active' }).success).toBe(true)
  })
  test('a refused Prospect has a reason and an enrolled one an Enrollment', () => {
    expect(
      enrollResultSchema.safeParse({
        prospectId: prs,
        outcome: 'enrolled',
        refusal: null,
        enrollmentId: enr,
      }).success
    ).toBe(true)
    for (const refusal of ['suppressed', 'no_consent', 'already_active', 'not_found']) {
      expect(
        enrollResultSchema.safeParse({
          prospectId: prs,
          outcome: 'refused',
          refusal,
          enrollmentId: null,
        }).success
      ).toBe(true)
    }
    expect(
      enrollResultSchema.safeParse({
        prospectId: prs,
        outcome: 'refused',
        refusal: null,
        enrollmentId: null,
      }).success
    ).toBe(false)
    expect(
      enrollResultSchema.safeParse({
        prospectId: prs,
        outcome: 'enrolled',
        refusal: null,
        enrollmentId: null,
      }).success
    ).toBe(false)
  })
})

describe('Play', () => {
  const play = {
    id: ply,
    name: 'Cold intro',
    intent: 'cold_intro',
    goal: 'Book a first call',
    source: 'seeded',
    status: 'proposed',
    steps: validSteps,
    citations: [{ kind: 'moment', callId: call, dealRecordId: deal }],
    evidenceCount: 3,
    noEvidence: false,
    createdByMembershipId: null,
    createdAt: NOW,
    updatedAt: NOW,
  }
  test('cites evidence by id and says when there is none', () => {
    expect(playSchema.safeParse(play).success).toBe(true)
    expect(
      playSchema.safeParse({ ...play, citations: [], evidenceCount: 0, noEvidence: true }).success
    ).toBe(true)
    expect(playSchema.safeParse({ ...play, citations: [], evidenceCount: 0 }).success).toBe(false)
    expect(playSchema.safeParse({ ...play, noEvidence: true }).success).toBe(false)
    expect(
      playSchema.safeParse({
        ...play,
        citations: [
          { kind: 'moment', callId: call, dealRecordId: deal, snippet: 'We won because...' },
        ],
      }).success
    ).toBe(false)
  })
  test('citations are bounded and the Steps must be a valid Sequence', () => {
    const many = Array.from({ length: 21 }, () => ({
      kind: 'moment',
      callId: call,
      dealRecordId: deal,
    }))
    expect(playSchema.safeParse({ ...play, citations: many, evidenceCount: 21 }).success).toBe(
      false
    )
    expect(
      playSchema.safeParse({ ...play, steps: [email('a', 'b'), email('b', 'a'), end('z')] }).success
    ).toBe(false)
  })
})

describe('lists', () => {
  test('every list query is bounded to 100 and strict', () => {
    for (const schema of [
      listCampaignsQuerySchema,
      listEnrollmentsQuerySchema,
      listPlaysQuerySchema,
    ]) {
      expect(schema.safeParse({ limit: MAX_PAGE_SIZE }).success).toBe(true)
      expect(schema.safeParse({ limit: MAX_PAGE_SIZE + 1 }).success).toBe(false)
      expect(schema.safeParse({ limit: 0 }).success).toBe(false)
      expect(schema.safeParse({ unknown: 'x' }).success).toBe(false)
    }
  })
  test('a cursor carries a position only', () => {
    const cursor = encodeCursor({ createdAt: NOW, id: cpg })
    expect(cursor.length).toBeLessThan(512)
    expect(campaignCursorSchema.safeParse({ createdAt: NOW, id: cpg }).success).toBe(true)
    expect(
      campaignCursorSchema.safeParse({ createdAt: NOW, id: cpg, organizationId: org }).success
    ).toBe(false)
  })
})

describe('errors', () => {
  test('every code is area.reason and its key matches its code', () => {
    for (const [key, def] of Object.entries(CAMPAIGN_ERRORS)) {
      expect(key).toBe(def.code)
      expect(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/.test(def.code)).toBe(true)
      expect(['campaign', 'enrollment', 'variant', 'play']).toContain(def.code.split('.')[0] ?? '')
      expect(def.status >= 400 && def.status < 600).toBe(true)
    }
  })
  test('none collides with a shared code and the spec codes are there', () => {
    for (const code of Object.keys(CAMPAIGN_ERRORS)) {
      expect(code in ERRORS).toBe(false)
    }
    for (const code of [
      'campaign.invalid_sequence',
      'campaign.not_previewed',
      'campaign.no_healthy_mailbox',
      'campaign.audience_empty',
      'enrollment.suppressed',
      'enrollment.no_consent',
      'enrollment.already_active',
      'variant.invalid_weights',
      'play.no_evidence',
    ]) {
      expect(code in CAMPAIGN_ERRORS).toBe(true)
    }
  })
})

describe('events', () => {
  const samples: Record<string, object> = {
    'campaign.launched': {
      campaignId: cpg,
      launchedByMembershipId: mem,
      sequenceVersion: 2,
      launchedAt: NOW,
    },
    'enrollment.stopped': {
      campaignId: cpg,
      enrollmentId: enr,
      prospectId: prs,
      stopReason: 'replied',
      stoppedAt: NOW,
    },
    'step.sent': {
      campaignId: cpg,
      enrollmentId: enr,
      prospectId: prs,
      sendId: snd,
      stepKey: 'intro',
      step: 0,
      variantKey: null,
      sentAt: NOW,
    },
    'variant.promoted': {
      campaignId: cpg,
      stepKey: 'intro',
      variantKey: 'v0',
      mode: 'manual',
      promotedByMembershipId: mem,
      promotedAt: NOW,
    },
  }
  test('the registry lists exactly the events', () => {
    expect(Object.keys(CAMPAIGN_EVENTS).sort()).toEqual(Object.keys(samples).sort())
  })
  test.each(Object.keys(samples))('%s parses on the shared envelope and is strict', (type) => {
    const event = CAMPAIGN_EVENTS[type as keyof typeof CAMPAIGN_EVENTS]
    expect(event.safeParse(envelope(type, samples[type])).success).toBe(true)
    expect(event.safeParse(envelope(type, {})).success).toBe(false)
    expect(event.safeParse(envelope(type, { ...samples[type], extra: 'x' })).success).toBe(false)
  })
  test.each(Object.keys(samples))('%s carries ids, never a body, subject or address', (type) => {
    const event = CAMPAIGN_EVENTS[type as keyof typeof CAMPAIGN_EVENTS]
    for (const field of ['body', 'text', 'subject', 'email', 'address', 'token']) {
      const data = { ...samples[type], [field]: 'Hello there' }
      expect(event.safeParse(envelope(type, data)).success).toBe(false)
    }
  })
})

describe('routes', () => {
  const routes = Object.entries(CAMPAIGN_ROUTES)
  test('every code a route lists exists', () => {
    const known = new Set([...Object.keys(CAMPAIGN_ERRORS), ...Object.keys(ERRORS)])
    for (const [, r] of routes) {
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
  })
  test('every campaign code is returned by some route', () => {
    const used = new Set(routes.flatMap(([, r]) => r.errors))
    // Refusal codes are per-Prospect results inside a 200 answer, named in the route description.
    const perProspect = new Set<string>(Object.values(ENROLL_REFUSAL_CODES))
    for (const code of Object.keys(CAMPAIGN_ERRORS)) {
      if (perProspect.has(code)) {
        expect(CAMPAIGN_ROUTES.enrollProspects.description).toContain(code)
        continue
      }
      expect(used.has(code as keyof typeof CAMPAIGN_ERRORS)).toBe(true)
    }
  })
  test('method and path are unique, under /v1, and described', () => {
    const seen = new Set<string>()
    for (const [, r] of routes) {
      const key = `${r.method} ${r.path}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      expect(r.path.startsWith('/v1/')).toBe(true)
      expect(r.roles.length).toBeGreaterThan(0)
      expect(r.description.length).toBeGreaterThan(40)
    }
  })
  test('the list routes describe their cursor and maximum page size', () => {
    for (const name of [
      'listCampaigns',
      'listEnrollments',
      'listEnrollmentActivity',
      'listPlays',
    ] as const) {
      expect(CAMPAIGN_ROUTES[name].method).toBe('GET')
      expect(CAMPAIGN_ROUTES[name].description).toContain('cursor')
      expect(CAMPAIGN_ROUTES[name].description).toContain('100')
    }
  })
  test('every route that changes something needs an Idempotency-Key', () => {
    for (const [name, r] of routes) {
      if (r.method !== 'GET') {
        expect([name, r.keyRequired]).toEqual([name, true])
        expect(r.idempotent).toBe(true)
        expect(r.commonErrors).toContain('request.idempotency_key_reused')
      }
      if (r.keyRequired) {
        expect(r.description).toContain('Idempotency-Key')
      }
    }
  })
  test('launch and archive are Owner and Admin, and launch has no bypass', () => {
    expect(CAMPAIGN_ROUTES.launchCampaign.roles).toEqual(['owner', 'admin'])
    expect(CAMPAIGN_ROUTES.archiveCampaign.roles).toEqual(['owner', 'admin'])
    for (const code of [
      'campaign.invalid_sequence',
      'campaign.not_previewed',
      'campaign.audience_empty',
      'campaign.no_healthy_mailbox',
    ] as const) {
      expect(CAMPAIGN_ROUTES.launchCampaign.errors).toContain(code)
    }
    expect(CAMPAIGN_ROUTES.launchCampaign.description).toContain('no setting that skips consent')
  })
  test('the audience check starts with 202 and runs off the request path', () => {
    expect(CAMPAIGN_ROUTES.startAudienceCheck.success).toEqual([202])
    expect(CAMPAIGN_ROUTES.startAudienceCheck.description).toContain('off the request path')
  })
  test('enrolling lists the refusal codes and a Campaign out of view is a 404, never a 403', () => {
    expect(CAMPAIGN_ROUTES.enrollProspects.description).toContain('enrollment.suppressed')
    expect(CAMPAIGN_ROUTES.enrollProspects.description).toContain('enrollment.no_consent')
    expect(CAMPAIGN_ROUTES.enrollProspects.description).toContain('enrollment.already_active')
    expect(CAMPAIGN_ROUTES.enrollProspects.description).toContain('enrollment.not_found')
    expect(CAMPAIGN_ROUTES.getPlay.description).toContain('proposed or discarded')
    expect(CAMPAIGN_ROUTES.getCampaign.description).toContain('never 403')
    expect(CAMPAIGN_ROUTES.getEnrollment.description).toContain('never 403')
  })
  test('nothing reports opens or clicks, and no route carries a message text', () => {
    expect(CAMPAIGN_ROUTES.getVariantResults.description).toContain('no open or click tracking')
    expect(CAMPAIGN_ROUTES.listEnrollmentActivity.description).toContain('No response')
  })
  test('accepting a Play without evidence has its own error', () => {
    expect(CAMPAIGN_ROUTES.acceptPlay.errors).toContain('play.no_evidence')
    expect(CAMPAIGN_ROUTES.setSequence.errors).toContain('variant.invalid_weights')
  })
  test('no public path is shared with another area', async () => {
    const api = (await import('../index')) as Record<string, unknown>
    const seen = new Map<string, string>()
    for (const [name, value] of Object.entries(api)) {
      const isRegistry = name.endsWith('_ROUTES') && !name.startsWith('ALL_')
      if (!isRegistry || typeof value !== 'object' || value === null) {
        continue
      }
      for (const r of Object.values(value as Record<string, { method: string; path: string }>)) {
        const key = `${r.method} ${r.path.replace(/\{[^}]+\}/g, '{}')}`
        expect(seen.has(key) ? `${key} in ${seen.get(key)} and ${name}` : null).toBeNull()
        seen.set(key, name)
      }
    }
    expect(seen.has('GET /v1/campaigns')).toBe(true)
    expect(new Set(seen.values()).size).toBeGreaterThanOrEqual(5)
  })
  test('the area is exported from the package index', async () => {
    const api = (await import('../index')) as Record<string, unknown>
    expect(api.CAMPAIGN_ROUTES).toBe(CAMPAIGN_ROUTES)
    expect(api.CAMPAIGN_ERRORS).toBe(CAMPAIGN_ERRORS)
    expect(api.CAMPAIGN_EVENTS).toBe(CAMPAIGN_EVENTS)
  })
})
