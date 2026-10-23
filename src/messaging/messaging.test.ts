import { describe, expect, test } from 'bun:test'
import { campaignSchema } from '../campaign/campaign'
import { CAMPAIGN_ERRORS } from '../campaign/errors'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import {
  acceptPreviewRequestSchema,
  brandVoiceSchema,
  citationSourceSchema,
  createBriefRequestSchema,
  draftCitationSchema,
  editDraftRequestSchema,
  MAX_PREVIEW_PROSPECTS,
  MESSAGING_ERRORS,
  MESSAGING_EVENTS,
  MESSAGING_ROUTES,
  outreachDraftSchema,
  previewItemSchema,
  previewRequestSchema,
  researchBriefSchema,
  setBrandVoiceRequestSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const id = (prefix: string, n: number): string => formatId(prefix, hex(n))
const NOW = '2026-01-01T00:00:00Z'

const prs = id('prs', 4)
const moment = { kind: 'moment' as const, callId: id('call', 11), dealRecordId: id('deal', 12) }
const field = { kind: 'prospect_field' as const, prospectId: prs, field: 'jobTitle' }

const check = (name: string, result: 'pass' | 'fail' = 'pass') => ({
  check: name,
  result,
  count: result === 'pass' ? 0 : 1,
})
const CHECKS = ['citations_resolve', 'claims_supported', 'banned_phrase', 'length', 'name_match']

const draft = (over: Record<string, unknown> = {}) => ({
  id: id('drf', 20),
  prospectId: prs,
  campaignId: id('cpg', 6),
  stepKey: 'intro',
  channel: 'email',
  goal: 'Book a demo',
  language: 'en',
  subject: 'A quick idea',
  body: 'Hello,\n\nA short note.',
  revision: 1,
  source: 'generated',
  citations: [
    { ...moment, applies: true, score: 0.8 },
    { ...field, applies: true },
  ],
  ungrounded: false,
  wonDealCount: 2,
  checks: CHECKS.map((name) => check(name)),
  autoSendable: true,
  brandVoiceId: id('bvo', 30),
  voiceVersion: 1,
  briefId: id('brf', 31),
  model: 'model-x',
  createdAt: NOW,
  updatedAt: NOW,
  ...over,
})

describe('citation source', () => {
  test('a moment keeps only its opaque ids: deal identifier, name and amount are stripped', () => {
    const parsed = citationSourceSchema.parse({
      ...moment,
      dealId: 'D-9',
      customerName: 'Acme Corp',
      amount: 125000,
    })
    expect<unknown>(parsed).toEqual(moment)
    const cited = draftCitationSchema.parse({
      ...moment,
      applies: true,
      score: 1,
      dealId: 'D-9',
      customerName: 'Acme Corp',
      amount: 125000,
    })
    expect(Object.keys(cited).sort()).toEqual([
      'applies',
      'callId',
      'dealRecordId',
      'kind',
      'score',
    ])
  })
  test('an unknown kind and a bad web address are refused', () => {
    expect(citationSourceSchema.safeParse({ kind: 'rumour' }).success).toBe(false)
    const web = { kind: 'web_page', retrievedAt: NOW }
    expect(citationSourceSchema.safeParse({ ...web, url: 'https://example.com/a' }).success).toBe(
      true
    )
    for (const url of ['javascript:alert(1)', 'https://user:pw@example.com', 'not a url']) {
      expect(citationSourceSchema.safeParse({ ...web, url }).success).toBe(false)
    }
  })
})

describe('research brief', () => {
  const brief = (over: Record<string, unknown> = {}) => ({
    id: id('brf', 31),
    prospectId: prs,
    statements: [{ text: 'Leads a sales team.', source: field }],
    angle: { text: 'Lead with reply speed.', origin: 'won_deals', sources: [moment] },
    droppedCount: 0,
    prospectUpdatedAt: NOW,
    language: 'en',
    model: 'model-x',
    createdAt: NOW,
    expiresAt: '2026-01-04T00:00:00Z',
    ...over,
  })
  test('parses, and a statement needs a source', () => {
    expect(researchBriefSchema.safeParse(brief()).success).toBe(true)
    const noSource = brief({ statements: [{ text: 'Leads a sales team.' }] })
    expect(researchBriefSchema.safeParse(noSource).success).toBe(false)
    expect(researchBriefSchema.safeParse(brief({ statements: [] })).success).toBe(false)
  })
  test('an angle from won Deals must cite a Moment, a default angle cites nothing', () => {
    const angle = (origin: string, sources: unknown[]) =>
      brief({ angle: { text: 'x', origin, sources } })
    expect(researchBriefSchema.safeParse(angle('won_deals', [])).success).toBe(false)
    expect(researchBriefSchema.safeParse(angle('won_deals', [field])).success).toBe(false)
    expect(researchBriefSchema.safeParse(angle('model_default', [])).success).toBe(true)
    expect(researchBriefSchema.safeParse(angle('model_default', [moment])).success).toBe(false)
  })
  test('unknown fields are refused on the brief and its statements', () => {
    expect(researchBriefSchema.safeParse(brief({ dossier: 'x' })).success).toBe(false)
    const extra = brief({ statements: [{ text: 'a', source: field, confidence: 1 }] })
    expect(researchBriefSchema.safeParse(extra).success).toBe(false)
    expect(createBriefRequestSchema.parse({})).toEqual({ refresh: false })
  })
})

describe('draft', () => {
  test('a grounded Draft with every check passed parses', () => {
    expect(outreachDraftSchema.safeParse(draft()).success).toBe(true)
  })
  test('ungrounded is true exactly when no Moment applies', () => {
    const noMoment = [{ ...field, applies: true }]
    expect(outreachDraftSchema.safeParse(draft({ citations: noMoment })).success).toBe(false)
    expect(
      outreachDraftSchema.safeParse(
        draft({ citations: noMoment, ungrounded: true, autoSendable: false })
      ).success
    ).toBe(true)
    const stale = [{ ...moment, applies: false }]
    expect(outreachDraftSchema.safeParse(draft({ citations: stale })).success).toBe(false)
  })
  test('an ungrounded Draft is never auto-sendable', () => {
    const noMoment = [{ ...field, applies: true }]
    const bad = draft({ citations: noMoment, ungrounded: true, autoSendable: true })
    expect(outreachDraftSchema.safeParse(bad).success).toBe(false)
  })
  test('a failed check blocks auto-send, and each check appears once', () => {
    const failed = CHECKS.map((name, i) => check(name, i === 3 ? 'fail' : 'pass'))
    expect(outreachDraftSchema.safeParse(draft({ checks: failed })).success).toBe(false)
    expect(
      outreachDraftSchema.safeParse(draft({ checks: failed, autoSendable: false })).success
    ).toBe(true)
    const twice = [...CHECKS.slice(1), 'length'].map((name) => check(name))
    expect(outreachDraftSchema.safeParse(draft({ checks: twice })).success).toBe(false)
    expect(
      outreachDraftSchema.safeParse(
        draft({ checks: CHECKS.map((name) => ({ check: name, result: 'pass', count: 2 })) })
      ).success
    ).toBe(false)
  })
  test('the channel is a closed list and unknown fields are refused', () => {
    expect(outreachDraftSchema.safeParse(draft({ channel: 'sms' })).success).toBe(false)
    expect(outreachDraftSchema.safeParse(draft({ copy: 'x' })).success).toBe(false)
  })
  test('an edit changes something', () => {
    expect(editDraftRequestSchema.safeParse({ expectedRevision: 1 }).success).toBe(false)
    expect(editDraftRequestSchema.safeParse({ expectedRevision: 1, body: 'New' }).success).toBe(
      true
    )
  })
})

describe('brand voice', () => {
  const settings = { tone: 'Plain and warm.', expectedVersion: 0 }
  test('defaults fill in and unknown fields are refused', () => {
    const parsed = setBrandVoiceRequestSchema.parse(settings)
    expect(parsed.bannedPhrases).toEqual([])
    expect(parsed.signOff).toBeNull()
    expect(setBrandVoiceRequestSchema.safeParse({ ...settings, persona: 'x' }).success).toBe(false)
  })
  test('lists are bounded', () => {
    const many = Array.from({ length: 101 }, (_, i) => `phrase ${i}`)
    expect(setBrandVoiceRequestSchema.safeParse({ ...settings, bannedPhrases: many }).success).toBe(
      false
    )
  })
  test('a saved version carries the author and the version', () => {
    const saved = {
      id: id('bvo', 30),
      version: 2,
      tone: 'Plain.',
      preferredWords: [],
      bannedPhrases: ['circle back'],
      signOff: null,
      maxLengthCharacters: 1500,
      createdByMembershipId: id('mem', 3),
      createdAt: NOW,
    }
    expect(brandVoiceSchema.safeParse(saved).success).toBe(true)
    expect(brandVoiceSchema.safeParse({ ...saved, version: 0 }).success).toBe(false)
  })
})

describe('preview', () => {
  const ids = (n: number) => Array.from({ length: n }, (_, i) => id('prs', 100 + i))
  test('five Prospects pass, six are refused, none and duplicates are refused', () => {
    expect(MAX_PREVIEW_PROSPECTS).toBe(5)
    expect(
      previewRequestSchema.safeParse({ sequenceVersion: 1, prospectIds: ids(5) }).success
    ).toBe(true)
    expect(
      previewRequestSchema.safeParse({ sequenceVersion: 1, prospectIds: ids(6) }).success
    ).toBe(false)
    expect(previewRequestSchema.safeParse({ sequenceVersion: 1, prospectIds: [] }).success).toBe(
      false
    )
    const dup = [ids(1)[0], ids(1)[0]]
    expect(previewRequestSchema.safeParse({ sequenceVersion: 1, prospectIds: dup }).success).toBe(
      false
    )
  })
  test('a row has a Draft or a failure code, never both or neither', () => {
    const row = { prospectId: prs, brief: null, draft: null, failureCode: null }
    expect(previewItemSchema.safeParse(row).success).toBe(false)
    expect(previewItemSchema.safeParse({ ...row, failureCode: 'research.timeout' }).success).toBe(
      true
    )
    expect(previewItemSchema.safeParse({ ...row, failureCode: 'draft.other' }).success).toBe(false)
    expect(previewItemSchema.safeParse({ ...row, draft: draft() }).success).toBe(true)
    expect(
      previewItemSchema.safeParse({ ...row, draft: draft(), failureCode: 'research.timeout' })
        .success
    ).toBe(false)
  })
  test('accepting names a Sequence version the Campaign can record as previewed', () => {
    expect(acceptPreviewRequestSchema.safeParse({ sequenceVersion: 3 }).success).toBe(true)
    expect(acceptPreviewRequestSchema.safeParse({ sequenceVersion: 0 }).success).toBe(false)
    expect(Object.keys(campaignSchema.shape)).toContain('previewedVersion')
    expect(Object.keys(campaignSchema.shape)).toContain('previewedAt')
    expect(MESSAGING_ROUTES.acceptCampaignPreview.description).toContain('campaign.not_previewed')
    expect(MESSAGING_ROUTES.previewCampaign.description).toContain('Nothing is sent')
  })
})

describe('errors', () => {
  test('every code is area.reason, listed with a status and message', () => {
    for (const [code, def] of Object.entries(MESSAGING_ERRORS)) {
      expect(code).toMatch(/^[a-z_]+\.[a-z_]+$/)
      expect(def.message.length).toBeGreaterThan(0)
      expect([404, 409, 422, 429, 503, 504]).toContain(def.status)
    }
    for (const code of [
      'draft.no_prospect_data',
      'draft.model_unavailable',
      'draft.budget_exceeded',
      'research.timeout',
      'voice.invalid',
      'preview.too_many_prospects',
    ]) {
      expect(code in MESSAGING_ERRORS).toBe(true)
    }
  })
  test('no code repeats another area', () => {
    for (const code of Object.keys(MESSAGING_ERRORS)) {
      expect(code in CAMPAIGN_ERRORS).toBe(false)
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
    'draft.created': {
      draftId: id('drf', 20),
      prospectId: prs,
      campaignId: null,
      stepKey: null,
      channel: 'email',
      ungrounded: true,
      checksPassed: false,
      voiceVersion: 1,
      createdAt: NOW,
    },
    'draft.approved_required': {
      draftId: id('drf', 20),
      prospectId: prs,
      campaignId: id('cpg', 6),
      reasons: ['ungrounded', 'check_failed'],
      requiredAt: NOW,
    },
  }
  test('the registry lists exactly the events', () => {
    expect(Object.keys(MESSAGING_EVENTS).sort()).toEqual(Object.keys(samples).sort())
  })
  test.each(Object.keys(samples))('%s parses, is strict and carries no text', (type) => {
    const event = MESSAGING_EVENTS[type as keyof typeof MESSAGING_EVENTS]
    expect(event.safeParse(envelope(type, samples[type])).success).toBe(true)
    expect(event.safeParse(envelope(type, {})).success).toBe(false)
    expect(event.safeParse(envelope(type, { ...samples[type], extra: 'x' })).success).toBe(false)
    for (const name of ['body', 'text', 'subject', 'email', 'address', 'token']) {
      expect(event.safeParse(envelope(type, { ...samples[type], [name]: 'Hello' })).success).toBe(
        false
      )
    }
  })
  test('approval reasons are a non-empty closed list', () => {
    const event = MESSAGING_EVENTS['draft.approved_required']
    const data = samples['draft.approved_required']
    expect(
      event.safeParse(envelope('draft.approved_required', { ...data, reasons: [] })).success
    ).toBe(false)
    expect(
      event.safeParse(envelope('draft.approved_required', { ...data, reasons: ['because'] }))
        .success
    ).toBe(false)
  })
})

describe('routes', () => {
  const routes = Object.entries(MESSAGING_ROUTES)
  test('every code a route lists exists, and every messaging code is used', () => {
    const known = new Set([
      ...Object.keys(MESSAGING_ERRORS),
      ...Object.keys(CAMPAIGN_ERRORS),
      ...Object.keys(ERRORS),
    ])
    for (const [, r] of routes) {
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
    const used = new Set(routes.flatMap(([, r]) => r.errors))
    for (const code of Object.keys(MESSAGING_ERRORS)) {
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
    for (const name of ['listBriefs', 'listOutreachDrafts', 'listBrandVoiceVersions'] as const) {
      expect(MESSAGING_ROUTES[name].method).toBe('GET')
      expect(MESSAGING_ROUTES[name].description).toContain('cursor')
      expect(MESSAGING_ROUTES[name].description).toContain('100')
    }
  })
  test('every route that changes something needs an Idempotency-Key', () => {
    for (const [name, r] of routes) {
      if (r.method !== 'GET') {
        expect([name, r.keyRequired]).toEqual([name, true])
        expect(r.idempotent).toBe(true)
        expect(r.commonErrors).toContain('request.idempotency_key_reused')
        expect(r.description).toContain('Idempotency-Key')
      }
    }
  })
  test('the Brand Voice is set by an Owner or Admin and read by all', () => {
    expect(MESSAGING_ROUTES.setBrandVoice.roles).toEqual(['owner', 'admin'])
    expect(MESSAGING_ROUTES.getBrandVoice.roles).toContain('rep')
  })
  test('model output is described as untrusted and out-of-view is 404', () => {
    expect(MESSAGING_ROUTES.createDraft.description).toContain('untrusted')
    expect(MESSAGING_ROUTES.getOutreachDraft.description).toContain('never 403')
  })
  test('no public path is shared with another area, the inbox included', async () => {
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
    expect(seen.get('GET /v1/drafts/{}')).toBe('INBOX_ROUTES')
    expect(seen.get('GET /v1/outreach-drafts/{}')).toBe('MESSAGING_ROUTES')
    expect(seen.get('POST /v1/campaigns/{}/preview')).toBe('MESSAGING_ROUTES')
  })
  test('the area is exported from the package index', async () => {
    const api = (await import('../index')) as Record<string, unknown>
    expect(api.MESSAGING_ROUTES).toBe(MESSAGING_ROUTES)
    expect(api.MESSAGING_ERRORS).toBe(MESSAGING_ERRORS)
    expect(api.MESSAGING_EVENTS).toBe(MESSAGING_EVENTS)
  })
})
