import { describe, expect, test } from 'bun:test'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import { citationSourceSchema } from '../messaging/index'
import { PROSPECT_ERRORS } from '../prospect/errors'
import {
  createEnrichmentRequestSchema,
  createFitCriterionRequestSchema,
  ENRICHMENT_ERRORS,
  ENRICHMENT_EVENTS,
  ENRICHMENT_ROUTES,
  type EnrichmentRouteName,
  enrichmentBudgetSchema,
  enrichmentRunSchema,
  fieldProvenanceSchema,
  fitConditionSchema,
  fitConditionSuitsField,
  fitScoreSchema,
  listEnrichmentRunsQuerySchema,
  listFitScoresQuerySchema,
  listProvidersQuerySchema,
  listSignalsQuerySchema,
  MAX_ENRICH_PROSPECTS,
  MAX_ENRICHED_VALUE_LENGTH,
  prospectEnrichmentSchema,
  providerSettingsSchema,
  recordNoteRequestSchema,
  rotateSignalWebhookResponseSchema,
  SIGNAL_KINDS,
  setBudgetRequestSchema,
  setProviderRequestSchema,
  setSignalSettingsRequestSchema,
  setWaterfallRequestSchema,
  signalSchema,
  signalWebhookRequestSchema,
  updateFitCriterionRequestSchema,
  vendorTextSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const id = (prefix: string, n: number): string => formatId(prefix, hex(n))
const NOW = '2026-01-01T00:00:00Z'
const prs = id('prs', 4)
const sig = id('sig', 5)

const run = (over: Record<string, unknown> = {}) => ({
  id: id('erun', 1),
  runSetId: id('erset', 2),
  prospectId: prs,
  status: 'complete',
  stopReason: null,
  groups: ['person'],
  attempts: [
    {
      provider: 'alpha',
      group: 'person',
      outcome: 'filled',
      failure: null,
      costMicros: 1000,
      startedAt: NOW,
      durationMs: 120,
    },
  ],
  fields: [
    {
      field: 'jobTitle',
      value: 'VP Sales',
      truncated: false,
      provider: 'alpha',
      confidence: 90,
      obtainedAt: NOW,
      costMicros: 1000,
      application: 'written',
    },
  ],
  emailVerification: null,
  costMicros: 1000,
  ceilingMicros: 50000,
  requestedByUserId: id('usr', 3),
  createdAt: NOW,
  startedAt: NOW,
  completedAt: NOW,
  ...over,
})

describe('vendor text', () => {
  test('control characters are removed and long text is cut, not refused', () => {
    const schema = vendorTextSchema(10)
    expect(schema.parse('  Hel\u0000lo\u0007 ')).toBe('Hello')
    expect(schema.parse('abcdefghijklmnop')).toBe('abcdefghij')
    expect(schema.safeParse('\u0000\u0001').success).toBe(false)
    expect(schema.safeParse('x'.repeat(10 * 20 + 1)).success).toBe(false)
  })
  test('a field value from a provider is cut to the maximum and unknown fields drop', () => {
    const parsed = fieldProvenanceSchema.parse({
      ...run().fields[0],
      value: 'v'.repeat(MAX_ENRICHED_VALUE_LENGTH + 50),
      rawVendorPayload: { secret: 1 },
    })
    expect(parsed.value.length).toBe(MAX_ENRICHED_VALUE_LENGTH)
    expect('rawVendorPayload' in parsed).toBe(false)
  })
})

describe('enrichment run', () => {
  test('a complete run parses and drops unknown fields', () => {
    const parsed = enrichmentRunSchema.parse(run({ vendorToken: 'x' }))
    expect('vendorToken' in parsed).toBe(false)
    expect(parsed.fields[0]?.provider).toBe('alpha')
  })
  test('a stop reason is set exactly when the run is stopped', () => {
    expect(enrichmentRunSchema.safeParse(run({ status: 'stopped' })).success).toBe(false)
    expect(enrichmentRunSchema.safeParse(run({ stopReason: 'run_ceiling' })).success).toBe(false)
    expect(
      enrichmentRunSchema.safeParse(run({ status: 'stopped', stopReason: 'monthly_budget' }))
        .success
    ).toBe(true)
  })
  test('a provider key is opaque lower-case and a bad one is refused', () => {
    for (const provider of ['Alpha', '1abc', 'a-b', '', 'a'.repeat(33)]) {
      const bad = run({ attempts: [{ ...run().attempts[0], provider }] })
      expect(enrichmentRunSchema.safeParse(bad).success).toBe(false)
    }
  })
  test('cost is whole non-negative micro-dollars', () => {
    for (const costMicros of [-1, 1.5, 1e13]) {
      expect(enrichmentRunSchema.safeParse(run({ costMicros })).success).toBe(false)
    }
  })
  test('the request takes 1 to 500 Prospects and refuses unknown fields', () => {
    const ok = { prospectIds: [prs] }
    expect(createEnrichmentRequestSchema.safeParse(ok).success).toBe(true)
    expect(createEnrichmentRequestSchema.safeParse({ prospectIds: [] }).success).toBe(false)
    const many = Array.from({ length: MAX_ENRICH_PROSPECTS + 1 }, (_, n) => id('prs', n + 1))
    expect(createEnrichmentRequestSchema.safeParse({ prospectIds: many }).success).toBe(false)
    expect(createEnrichmentRequestSchema.safeParse({ ...ok, phone: true }).success).toBe(false)
    expect(createEnrichmentRequestSchema.safeParse({ ...ok, groups: ['phone'] }).success).toBe(
      false
    )
    expect(createEnrichmentRequestSchema.safeParse({ ...ok, groups: ['company'] }).success).toBe(
      true
    )
  })
  test('phone is never an enriched field', () => {
    const phone = { ...run().fields[0], field: 'phone' }
    expect(fieldProvenanceSchema.safeParse(phone).success).toBe(false)
  })
  test('the Prospect view carries no email address', () => {
    const view = prospectEnrichmentSchema.parse({
      prospectId: prs,
      fields: run().fields,
      emailVerification: {
        status: 'valid',
        reason: 'accepted',
        provider: 'alpha',
        checkedAt: NOW,
        address: 'a@example.com',
      },
      costMicros: 1000,
      costByProvider: [{ provider: 'alpha', costMicros: 1000, calls: 1 }],
      lastRunId: id('erun', 1),
      lastEnrichedAt: NOW,
    })
    expect(view.emailVerification && 'address' in view.emailVerification).toBe(false)
  })
  test('list queries page with a bounded size', () => {
    expect(listEnrichmentRunsQuerySchema.safeParse({ limit: 101 }).success).toBe(false)
    expect(listEnrichmentRunsQuerySchema.safeParse({ limit: 100, status: 'stopped' }).success).toBe(
      true
    )
    expect(listEnrichmentRunsQuerySchema.safeParse({ status: 'weird' }).success).toBe(false)
  })
})

describe('provider settings, waterfall and budget', () => {
  test('the settings never carry a key and the request is write-only and strict', () => {
    const settings = providerSettingsSchema.parse({
      provider: 'alpha',
      enabled: true,
      credentialSet: true,
      credentialUpdatedAt: NOW,
      groups: ['person'],
      updatedAt: NOW,
      apiKey: 'sk_live_123456789',
    })
    expect(JSON.stringify(settings)).not.toContain('sk_live')
    expect(Object.keys(providerSettingsSchema.shape).some((k) => /key|secret|token/i.test(k))).toBe(
      false
    )
    expect(
      setProviderRequestSchema.safeParse({ enabled: true, apiKey: 'abcdefgh1234' }).success
    ).toBe(true)
    expect(setProviderRequestSchema.safeParse({ enabled: true, apiKey: null }).success).toBe(true)
    expect(setProviderRequestSchema.safeParse({ enabled: true }).success).toBe(true)
    expect(setProviderRequestSchema.safeParse({ enabled: true, apiKey: 'short' }).success).toBe(
      false
    )
    expect(
      setProviderRequestSchema.safeParse({ enabled: true, apiKey: 'has space 1234' }).success
    ).toBe(false)
    expect(setProviderRequestSchema.safeParse({ enabled: true, key: 'x' }).success).toBe(false)
    expect(listProvidersQuerySchema.safeParse({ limit: 101 }).success).toBe(false)
  })
  test('a waterfall lists a provider once per group and names the version', () => {
    const order = { person: ['alpha', 'beta'], company: [], email_verification: ['beta'] }
    expect(setWaterfallRequestSchema.safeParse({ order, expectedVersion: 0 }).success).toBe(true)
    expect(
      setWaterfallRequestSchema.safeParse({
        order: { ...order, person: ['alpha', 'alpha'] },
        expectedVersion: 0,
      }).success
    ).toBe(false)
    expect(setWaterfallRequestSchema.safeParse({ order }).success).toBe(false)
    expect(
      setWaterfallRequestSchema.safeParse({ order: { ...order, phone: [] }, expectedVersion: 0 })
        .success
    ).toBe(false)
  })
  test('the run ceiling is not above the monthly limit', () => {
    const ok = { monthlyLimitMicros: 1000, perRunCeilingMicros: 500, expectedVersion: 1 }
    expect(setBudgetRequestSchema.safeParse(ok).success).toBe(true)
    expect(setBudgetRequestSchema.safeParse({ ...ok, perRunCeilingMicros: 1001 }).success).toBe(
      false
    )
    expect(setBudgetRequestSchema.safeParse({ ...ok, monthlyLimitMicros: -1 }).success).toBe(false)
    expect(setBudgetRequestSchema.safeParse({ ...ok, extra: 1 }).success).toBe(false)
  })
  test('the budget reads with a month and a reset time', () => {
    const budget = {
      month: '2026-01',
      monthlyLimitMicros: 1000,
      perRunCeilingMicros: 100,
      spentMicros: 10,
      remainingMicros: 990,
      resetsAt: NOW,
      version: 1,
      updatedAt: NOW,
    }
    expect(enrichmentBudgetSchema.safeParse(budget).success).toBe(true)
    expect(enrichmentBudgetSchema.safeParse({ ...budget, month: '2026-13' }).success).toBe(false)
  })
})

describe('signals', () => {
  const base = {
    id: sig,
    prospectId: prs,
    source: { type: 'provider', provider: 'alpha' },
    observedAt: NOW,
    recordedAt: NOW,
    expiresAt: NOW,
    fresh: true,
  }
  const samples: Record<string, Record<string, unknown>> = {
    funding: { round: 'seed', amountMajorUnits: 1000000, currency: 'USD' },
    hiring_spike: { openRoles: 12, windowDays: 30, department: 'Sales' },
    job_change: {
      previousTitle: null,
      newTitle: 'CRO',
      previousCompany: null,
      newCompany: 'Acme',
    },
    technology_change: { technology: 'Postgres', change: 'adopted' },
    website_visit: { pageUrl: 'https://example.com/pricing', visitCount: 2 },
    note: { text: 'Met at the conference' },
  }
  test('every kind has a sample and parses with the shared signal id', () => {
    expect(Object.keys(samples).sort()).toEqual([...SIGNAL_KINDS].sort())
    for (const kind of SIGNAL_KINDS) {
      const parsed = signalSchema.parse({ ...base, kind, ...samples[kind] })
      expect<string>(parsed.id).toBe(sig)
      expect(parsed.kind).toBe(kind)
    }
  })
  test('a signal id of another prefix is refused', () => {
    expect(
      signalSchema.safeParse({ ...base, id: id('prs', 5), kind: 'note', ...samples.note }).success
    ).toBe(false)
  })
  test('vendor text is cleaned and unknown fields drop', () => {
    const parsed = signalSchema.parse({
      ...base,
      kind: 'note',
      text: 'Hi\u0000 there',
      html: '<script>',
    })
    expect(parsed.kind === 'note' && parsed.text).toBe('Hi there')
    expect('html' in parsed).toBe(false)
  })
  test('a signal is a valid Citation source and carries the same fields', () => {
    const cited = citationSourceSchema.safeParse({
      kind: 'signal',
      signalId: sig,
      observedAt: NOW,
    })
    expect(cited.success).toBe(true)
    const signal = signalSchema.parse({ ...base, kind: 'note', ...samples.note })
    expect(cited.success && cited.data).toMatchObject({ signalId: signal.id })
  })
  test('a website visit refuses a javascript address', () => {
    const bad = { ...base, kind: 'website_visit', visitCount: 1, pageUrl: 'javascript:alert(1)' }
    expect(signalSchema.safeParse(bad).success).toBe(false)
  })
  test('a note request is strict, bounded and has no control characters', () => {
    expect(recordNoteRequestSchema.safeParse({ kind: 'note', text: 'Called back' }).success).toBe(
      true
    )
    expect(recordNoteRequestSchema.safeParse({ kind: 'funding', text: 'x' }).success).toBe(false)
    expect(recordNoteRequestSchema.safeParse({ kind: 'note', text: '' }).success).toBe(false)
    expect(
      recordNoteRequestSchema.safeParse({ kind: 'note', text: 'x'.repeat(5000) }).success
    ).toBe(false)
    expect(recordNoteRequestSchema.safeParse({ kind: 'note', text: 'a\u0000b' }).success).toBe(
      false
    )
    expect(recordNoteRequestSchema.safeParse({ kind: 'note', text: 'a', extra: 1 }).success).toBe(
      false
    )
  })
  test('the list query narrows by kind and fresh', () => {
    expect(listSignalsQuerySchema.parse({ fresh: 'true' }).fresh).toBe(true)
    expect(listSignalsQuerySchema.parse({ fresh: 'false' }).fresh).toBe(false)
    expect(listSignalsQuerySchema.safeParse({ kind: 'rumour' }).success).toBe(false)
    expect(listSignalsQuerySchema.safeParse({ limit: 101 }).success).toBe(false)
  })
  test('the webhook names a Prospect by id or email and refuses anything else', () => {
    const common = {
      eventId: 'evt_12345678',
      kind: 'website_visit',
      pageUrl: 'https://example.com/pricing',
      visitedAt: NOW,
    }
    expect(signalWebhookRequestSchema.safeParse({ ...common, prospectId: prs }).success).toBe(true)
    expect(
      signalWebhookRequestSchema.safeParse({ ...common, email: 'a@example.com' }).success
    ).toBe(true)
    expect(signalWebhookRequestSchema.safeParse(common).success).toBe(false)
    expect(
      signalWebhookRequestSchema.safeParse({
        ...common,
        prospectId: prs,
        organizationId: id('org', 1),
      }).success
    ).toBe(false)
    expect(
      signalWebhookRequestSchema.safeParse({ ...common, eventId: 'short', prospectId: prs }).success
    ).toBe(false)
  })
  test('settings cover every kind once and name the version', () => {
    const kinds = SIGNAL_KINDS.map((kind) => ({ kind, enabled: true, freshnessDays: 30 }))
    expect(setSignalSettingsRequestSchema.safeParse({ kinds, expectedVersion: 0 }).success).toBe(
      true
    )
    const dup = [...kinds.slice(1), kinds[1]]
    expect(
      setSignalSettingsRequestSchema.safeParse({ kinds: dup, expectedVersion: 0 }).success
    ).toBe(false)
    expect(
      setSignalSettingsRequestSchema.safeParse({ kinds: kinds.slice(1), expectedVersion: 0 })
        .success
    ).toBe(false)
    const zero = kinds.map((k) => ({ ...k, freshnessDays: 0 }))
    expect(
      setSignalSettingsRequestSchema.safeParse({ kinds: zero, expectedVersion: 0 }).success
    ).toBe(false)
  })
  test('the rotated secret is 43 url-safe characters', () => {
    const base64 = 'A'.repeat(43)
    const body = { organizationId: id('org', 1), secret: base64, rotatedAt: NOW }
    expect(rotateSignalWebhookResponseSchema.safeParse(body).success).toBe(true)
    expect(rotateSignalWebhookResponseSchema.safeParse({ ...body, secret: 'short' }).success).toBe(
      false
    )
  })
})

describe('fit', () => {
  const criterion = {
    name: 'VP titles',
    field: 'jobTitle',
    condition: { operator: 'contains_any', values: ['VP', 'Head'] },
    weight: 20,
  }
  test('a criterion parses, defaults to enabled and refuses unknown fields', () => {
    expect(createFitCriterionRequestSchema.parse(criterion).enabled).toBe(true)
    expect(createFitCriterionRequestSchema.safeParse({ ...criterion, extra: 1 }).success).toBe(
      false
    )
  })
  test('weight is 1 to 100 and a name and values are bounded', () => {
    for (const weight of [0, 101, 1.5]) {
      expect(createFitCriterionRequestSchema.safeParse({ ...criterion, weight }).success).toBe(
        false
      )
    }
    expect(createFitCriterionRequestSchema.safeParse({ ...criterion, name: '' }).success).toBe(
      false
    )
    const values = Array.from({ length: 21 }, (_, n) => `v${n}`)
    expect(
      createFitCriterionRequestSchema.safeParse({
        ...criterion,
        condition: { operator: 'one_of', values },
      }).success
    ).toBe(false)
  })
  test('between needs a bound and min is not above max', () => {
    const between = (min: number | null, max: number | null) =>
      fitConditionSchema.safeParse({ operator: 'between', min, max }).success
    expect(between(10, 50)).toBe(true)
    expect(between(10, null)).toBe(true)
    expect(between(null, 50)).toBe(true)
    expect(between(null, null)).toBe(false)
    expect(between(60, 50)).toBe(false)
    expect(between(-1, 5)).toBe(false)
  })
  test('an operator suits its attribute: between only for employee count', () => {
    const between = fitConditionSchema.parse({ operator: 'between', min: 1, max: 5 })
    const oneOf = fitConditionSchema.parse({ operator: 'one_of', values: ['x'] })
    expect(fitConditionSuitsField('employeeCount', between)).toBe(true)
    expect(fitConditionSuitsField('employeeCount', oneOf)).toBe(false)
    expect(fitConditionSuitsField('industry', between)).toBe(false)
    expect(fitConditionSuitsField('industry', oneOf)).toBe(true)
  })
  test('an update changes at least one part', () => {
    expect(updateFitCriterionRequestSchema.safeParse({}).success).toBe(false)
    expect(updateFitCriterionRequestSchema.safeParse({ weight: 5 }).success).toBe(true)
    expect(updateFitCriterionRequestSchema.safeParse({ weight: 5, id: 'x' }).success).toBe(false)
  })
  test('a fit score never exceeds its maximum and explains every criterion', () => {
    const fit = {
      prospectId: prs,
      score: 20,
      maxScore: 30,
      matches: [{ criterionId: id('fcr', 7), name: 'VP titles', weight: 20, result: 'matched' }],
      criteriaVersion: 2,
      scoredAt: NOW,
    }
    expect(fitScoreSchema.safeParse(fit).success).toBe(true)
    expect(fitScoreSchema.safeParse({ ...fit, score: 31 }).success).toBe(false)
    expect(
      fitScoreSchema.safeParse({
        ...fit,
        matches: [{ ...fit.matches[0], result: 'maybe' }],
      }).success
    ).toBe(false)
  })
  test('the score filter takes a number or digits and is bounded', () => {
    expect(listFitScoresQuerySchema.parse({ minScore: '40' }).minScore).toBe(40)
    expect(listFitScoresQuerySchema.safeParse({ minScore: '-1' }).success).toBe(false)
    expect(listFitScoresQuerySchema.safeParse({ minScore: 999999 }).success).toBe(false)
    expect(listFitScoresQuerySchema.safeParse({ limit: 101 }).success).toBe(false)
  })
})

describe('errors', () => {
  test('every code is area.reason with a status and message', () => {
    for (const [code, def] of Object.entries(ENRICHMENT_ERRORS)) {
      expect(code).toMatch(/^(enrichment|signal|fit)\.[a-z_]+$/)
      expect(def.message.length).toBeGreaterThan(0)
      expect([401, 404, 409, 422, 429, 503]).toContain(def.status)
    }
    expect(Object.keys(ENRICHMENT_ERRORS).length).toBe(14)
    expect(ENRICHMENT_ERRORS['enrichment.budget_exceeded'].status).toBe(429)
    expect(ENRICHMENT_ERRORS['enrichment.provider_unavailable'].status).toBe(503)
    expect(ENRICHMENT_ERRORS['enrichment.version_conflict'].status).toBe(409)
    expect(ENRICHMENT_ERRORS['signal.webhook_unauthorized'].status).toBe(401)
  })
  test('no code repeats another area', () => {
    for (const code of Object.keys(ENRICHMENT_ERRORS)) {
      expect(code in PROSPECT_ERRORS).toBe(false)
      expect(code in ERRORS).toBe(false)
    }
  })
})

describe('events', () => {
  const envelope = (type: string, data: unknown) => ({
    id: id('evt', 10),
    type,
    version: 1,
    occurredAt: NOW,
    organizationId: id('org', 1),
    region: 'us',
    data,
  })
  const samples: Record<string, Record<string, unknown>> = {
    'enrichment.completed': {
      runId: id('erun', 1),
      runSetId: null,
      prospectId: prs,
      status: 'complete',
      fieldsFilled: 3,
      costMicros: 1000,
      completedAt: NOW,
    },
    'signal.recorded': {
      signalId: sig,
      prospectId: prs,
      kind: 'funding',
      observedAt: NOW,
      recordedAt: NOW,
    },
    'prospect.fit_changed': {
      prospectId: prs,
      previousScore: null,
      score: 40,
      maxScore: 60,
      criteriaVersion: 3,
      changedAt: NOW,
    },
  }
  test('the registry lists exactly the three events', () => {
    expect(Object.keys(ENRICHMENT_EVENTS).sort()).toEqual(Object.keys(samples).sort())
  })
  test.each(Object.keys(samples))('%s parses, is strict and carries no text', (type) => {
    const event = ENRICHMENT_EVENTS[type as keyof typeof ENRICHMENT_EVENTS]
    expect(event.safeParse(envelope(type, samples[type])).success).toBe(true)
    expect(event.safeParse(envelope(type, {})).success).toBe(false)
    expect(event.safeParse(envelope(type, { ...samples[type], extra: 'x' })).success).toBe(false)
    for (const name of ['text', 'value', 'email', 'address', 'pageUrl', 'apiKey', 'secret']) {
      expect(event.safeParse(envelope(type, { ...samples[type], [name]: 'x' })).success).toBe(false)
    }
  })
  test('a run ends complete, incomplete or stopped, never queued', () => {
    const event = ENRICHMENT_EVENTS['enrichment.completed']
    const data = samples['enrichment.completed']
    expect(
      event.safeParse(envelope('enrichment.completed', { ...data, status: 'queued' })).success
    ).toBe(false)
    expect(
      event.safeParse(envelope('enrichment.completed', { ...data, status: 'stopped' })).success
    ).toBe(true)
  })
})

describe('routes', () => {
  const routes = Object.entries(ENRICHMENT_ROUTES)
  const WEBHOOK: EnrichmentRouteName = 'receiveSignalWebhook'
  test('there are 26 routes', () => {
    expect(routes.length).toBe(26)
  })
  test('every code a route lists exists, and every area code is used', () => {
    const known = new Set([
      ...Object.keys(ENRICHMENT_ERRORS),
      ...Object.keys(PROSPECT_ERRORS),
      ...Object.keys(ERRORS),
    ])
    for (const [, r] of routes) {
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
    const used = new Set(routes.flatMap(([, r]) => r.errors))
    for (const code of Object.keys(ENRICHMENT_ERRORS)) {
      expect([code, used.has(code as never)]).toEqual([code, true])
    }
  })
  test('method and path are unique, under /v1, and described', () => {
    const seen = new Set<string>()
    for (const [, r] of routes) {
      const key = `${r.method} ${r.path}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      expect(r.path.startsWith('/v1/')).toBe(true)
      expect(r.description.length).toBeGreaterThan(40)
    }
  })
  test('list routes describe their cursor and maximum page size', () => {
    for (const name of [
      'listEnrichmentRuns',
      'listEnrichmentProviders',
      'listEnrichmentSpend',
      'listProspectSignals',
      'listFitCriteria',
      'listFitScores',
    ] as const) {
      expect(ENRICHMENT_ROUTES[name].method).toBe('GET')
      expect(ENRICHMENT_ROUTES[name].description).toContain('cursor')
      expect(ENRICHMENT_ROUTES[name].description).toContain('100')
    }
  })
  test('every route that changes something needs an Idempotency-Key, except the signed webhook', () => {
    for (const [name, r] of routes) {
      if (r.method === 'GET' || name === WEBHOOK) {
        continue
      }
      expect([name, r.keyRequired]).toEqual([name, true])
      expect(r.idempotent).toBe(true)
      expect(r.commonErrors).toContain('request.idempotency_key_reused')
      expect(r.description).toContain('Idempotency-Key')
    }
  })
  test('the webhook is the only public route, signed, with no user roles', () => {
    const publics = routes.filter(([, r]) => r.public === true).map(([name]) => name)
    expect(publics).toEqual([WEBHOOK])
    const hook = ENRICHMENT_ROUTES[WEBHOOK]
    expect(hook.roles).toEqual([])
    expect(hook.path.startsWith('/v1/public/')).toBe(true)
    expect(hook.errors).toContain('signal.webhook_unauthorized')
    expect(hook.description).toContain('x-closeline-signature')
    expect(hook.description).toContain('constant time')
  })
  test('settings and spend are for admins and managers, writes for Owner and Admin', () => {
    for (const name of [
      'setEnrichmentProvider',
      'setEnrichmentWaterfall',
      'setEnrichmentBudget',
      'setSignalSettings',
      'rotateSignalWebhookSecret',
      'createFitCriterion',
      'updateFitCriterion',
      'deleteFitCriterion',
      'deleteProspectEnrichment',
    ] as const) {
      expect([name, ENRICHMENT_ROUTES[name].roles]).toEqual([name, ['owner', 'admin']])
    }
    for (const name of [
      'listEnrichmentProviders',
      'getEnrichmentBudget',
      'listEnrichmentSpend',
    ] as const) {
      expect(ENRICHMENT_ROUTES[name].roles).toEqual(['owner', 'admin', 'manager'])
    }
    expect(ENRICHMENT_ROUTES.createEnrichment.roles).toContain('rep')
  })
  test('provider data is untrusted, keys are write-only and out-of-view is 404', () => {
    expect(ENRICHMENT_ROUTES.createEnrichment.description).toContain('untrusted')
    expect(ENRICHMENT_ROUTES.getProspectEnrichment.description).toContain('never 403')
    expect(ENRICHMENT_ROUTES.setEnrichmentProvider.description).toContain('never returned')
    expect(ENRICHMENT_ROUTES.rotateSignalWebhookSecret.description).toContain(
      'never returned again'
    )
  })
  test('the bulk call is accepted for later and checks the budget before each call', () => {
    expect(ENRICHMENT_ROUTES.createEnrichment.success).toEqual([202, 200])
    expect(ENRICHMENT_ROUTES.createEnrichment.description).toContain('before each provider call')
  })
  test('no route names a vendor', () => {
    const vendors =
      /zoominfo|apollo|clearbit|hunter|lusha|cognism|neverbounce|zerobounce|crunchbase|linkedin\.com|openai|anthropic/i
    for (const [, r] of routes) {
      expect(r.description).not.toMatch(vendors)
    }
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
    expect(seen.get('POST /v1/enrichment-runs')).toBe('ENRICHMENT_ROUTES')
  })
  test('the area is exported from the package index', async () => {
    const api = (await import('../index')) as Record<string, unknown>
    expect(api.ENRICHMENT_ROUTES).toBe(ENRICHMENT_ROUTES)
    expect(api.ENRICHMENT_ERRORS).toBe(ENRICHMENT_ERRORS)
    expect(api.ENRICHMENT_EVENTS).toBe(ENRICHMENT_EVENTS)
  })
})
