import { describe, expect, test } from 'bun:test'
import { AGENT_ERRORS } from '../agent'
import { CORE_ERRORS } from '../core'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import { MAX_PAGE_SIZE } from '../pagination'
import { PROSPECT_ERRORS } from '../prospect'
import {
  INQUIRY_ERRORS,
  INQUIRY_EVENTS,
  INQUIRY_ROUTES,
  inquiryIntakeRequestSchema,
  inquiryIntakeResultSchema,
  inquirySchema,
  listInquiriesQuerySchema,
  publicInquiryHeadersSchema,
  publicInquiryReceiptSchema,
  publicInquiryRequestSchema,
  qualificationQuestionSchema,
  resolvedInquiryKeySchema,
  resolveInquiryKeyRequestSchema,
  setInquiryEmbedRequestSchema,
  voiceInquiryReceivedEvent,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const org = formatId('org', hex(1))
const inq = formatId('inq', hex(2))
const prs = formatId('prs', hex(3))
const mem = formatId('mem', hex(4))
const cwd = formatId('cwd', hex(5))
const NOW = '2026-01-01T00:00:00Z'
const KEY = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'

const request = {
  name: 'Ada Lovelace',
  phone: '+14155550123',
  consentWordingId: cwd,
  consentWordingVersion: 3,
  callbackConsent: true,
  sourceUrl: 'https://acme.example/contact',
}

describe('the public Inquiry request', () => {
  test('parses with the wording version and the source URL', () => {
    const parsed = publicInquiryRequestSchema.safeParse(request)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.website).toBe('')
    }
  })
  test('is invalid without the consent wording version', () => {
    const { consentWordingVersion: _v, ...rest } = request
    expect(publicInquiryRequestSchema.safeParse(rest).success).toBe(false)
  })
  test('is invalid without the source URL', () => {
    const { sourceUrl: _s, ...rest } = request
    expect(publicInquiryRequestSchema.safeParse(rest).success).toBe(false)
  })
  test('is invalid without the wording id or the consent choice', () => {
    const { consentWordingId: _w, ...noId } = request
    const { callbackConsent: _c, ...noChoice } = request
    expect(publicInquiryRequestSchema.safeParse(noId).success).toBe(false)
    expect(publicInquiryRequestSchema.safeParse(noChoice).success).toBe(false)
  })
  test('refuses a version of zero and a non-web source URL', () => {
    expect(
      publicInquiryRequestSchema.safeParse({ ...request, consentWordingVersion: 0 }).success
    ).toBe(false)
    expect(
      publicInquiryRequestSchema.safeParse({ ...request, sourceUrl: 'javascript:alert(1)' }).success
    ).toBe(false)
  })
  test('refuses unknown fields, so no one can smuggle a Prospect id or a Rep', () => {
    expect(publicInquiryRequestSchema.safeParse({ ...request, prospectId: prs }).success).toBe(
      false
    )
  })
  test('a filled honeypot still parses so the service can answer like a real request', () => {
    const parsed = publicInquiryRequestSchema.safeParse({ ...request, website: 'http://spam' })
    expect(parsed.success).toBe(true)
  })
  test('the headers require the origin and an Idempotency-Key', () => {
    expect(
      publicInquiryHeadersSchema.safeParse({
        origin: 'https://acme.example',
        'idempotency-key': KEY,
      }).success
    ).toBe(true)
    expect(publicInquiryHeadersSchema.safeParse({ origin: 'https://acme.example' }).success).toBe(
      false
    )
    expect(publicInquiryHeadersSchema.safeParse({ 'idempotency-key': KEY }).success).toBe(false)
  })
  test('the receipt does not reveal whether a number is suppressed', () => {
    expect(publicInquiryReceiptSchema.safeParse({ received: true, receivedAt: NOW }).success).toBe(
      true
    )
    expect(
      publicInquiryReceiptSchema.safeParse({
        received: true,
        callbackExpected: true,
        receivedAt: NOW,
      }).success
    ).toBe(false)
  })
  test('the receipt carries no id', () => {
    expect(
      publicInquiryReceiptSchema.safeParse({
        received: true,
        receivedAt: NOW,
        inquiryId: inq,
      }).success
    ).toBe(false)
  })
})

describe('the embed settings', () => {
  test('origins are exact web origins, no paths and no wildcards', () => {
    const ok = (allowedOrigins: string[]) =>
      setInquiryEmbedRequestSchema.safeParse({ allowedOrigins, consentWordingId: cwd }).success
    expect(ok(['https://acme.example', 'http://localhost:3000'])).toBe(true)
    expect(ok(['https://acme.example/path'])).toBe(false)
    expect(ok(['https://*.acme.example'])).toBe(false)
    expect(ok(['http://acme.example'])).toBe(false)
    expect(ok(['*'])).toBe(false)
    expect(ok(['https://acme.example', 'https://acme.example'])).toBe(false)
  })
})

describe('the Inquiry', () => {
  const callback = {
    state: 'pending',
    skipReason: null,
    attempts: 0,
    nextAttemptAt: null,
    lastAttemptAt: null,
  }
  const inquiry = {
    id: inq,
    source: 'form',
    prospectId: prs,
    assignedToMembershipId: mem,
    chatId: null,
    callId: null,
    consent: {
      wordingId: cwd,
      wordingVersion: 3,
      sourceUrl: 'https://acme.example/c',
      phoneGranted: true,
    },
    callback,
    qualification: { answers: [], summary: null },
    receivedAt: NOW,
  }
  test('a form Inquiry parses', () => {
    expect(inquirySchema.safeParse(inquiry).success).toBe(true)
  })
  test('a form Inquiry without consent evidence is invalid', () => {
    expect(inquirySchema.safeParse({ ...inquiry, consent: null }).success).toBe(false)
  })
  test('a skipped callback says why, and only a skipped one does', () => {
    const skipped = { ...callback, state: 'skipped', skipReason: 'no_consent' }
    expect(inquirySchema.safeParse({ ...inquiry, callback: skipped }).success).toBe(true)
    expect(
      inquirySchema.safeParse({ ...inquiry, callback: { ...skipped, skipReason: null } }).success
    ).toBe(false)
    expect(
      inquirySchema.safeParse({ ...inquiry, callback: { ...callback, skipReason: 'no_consent' } })
        .success
    ).toBe(false)
  })
  test('no callback is placed without phone consent (ADR 0003)', () => {
    const noConsent = { ...inquiry.consent, phoneGranted: false }
    for (const state of ['pending', 'dialling', 'connected', 'no_answer', 'failed']) {
      expect(
        inquirySchema.safeParse({
          ...inquiry,
          consent: noConsent,
          callback: { ...callback, state },
        }).success
      ).toBe(false)
    }
    const skipped = { ...callback, state: 'skipped', skipReason: 'no_consent' }
    expect(
      inquirySchema.safeParse({ ...inquiry, consent: noConsent, callback: skipped }).success
    ).toBe(true)
    expect(
      inquirySchema.safeParse({
        ...inquiry,
        consent: noConsent,
        callback: { ...callback, state: 'dialling' },
      }).success
    ).toBe(false)
  })
  test('at most three attempts', () => {
    expect(
      inquirySchema.safeParse({ ...inquiry, callback: { ...callback, attempts: 4 } }).success
    ).toBe(false)
  })
})

describe('Qualification questions', () => {
  const question = {
    id: formatId('qst', hex(9)),
    position: 1,
    prompt: 'How many Reps do you have?',
    kind: 'number',
    choices: null,
    required: true,
    skipWhen: [],
  }
  test('a question parses and a choice question needs choices', () => {
    expect(qualificationQuestionSchema.safeParse(question).success).toBe(true)
    expect(
      qualificationQuestionSchema.safeParse({ ...question, kind: 'choice', choices: null }).success
    ).toBe(false)
    expect(
      qualificationQuestionSchema.safeParse({ ...question, kind: 'choice', choices: ['a', 'b'] })
        .success
    ).toBe(true)
  })
})

describe('lists', () => {
  test('the Inquiry list takes a cursor and a bounded limit', () => {
    expect(listInquiriesQuerySchema.safeParse({}).success).toBe(true)
    expect(listInquiriesQuerySchema.safeParse({ limit: MAX_PAGE_SIZE }).success).toBe(true)
    expect(listInquiriesQuerySchema.safeParse({ limit: MAX_PAGE_SIZE + 1 }).success).toBe(false)
    expect(listInquiriesQuerySchema.safeParse({ unknown: 1 }).success).toBe(false)
  })
})

describe('events', () => {
  const envelope = (type: string, data: unknown) => ({
    id: formatId('evt', hex(50)),
    type,
    version: 1,
    occurredAt: NOW,
    organizationId: org,
    region: 'us',
    data,
  })
  const data = {
    inquiryId: inq,
    source: 'form',
    prospectId: prs,
    chatId: null,
    callId: null,
    receivedAt: NOW,
  }
  test('voice.inquiry.received uses the envelope and carries ids and times only', () => {
    expect(
      voiceInquiryReceivedEvent.safeParse(envelope('voice.inquiry.received', data)).success
    ).toBe(true)
    expect(
      voiceInquiryReceivedEvent.safeParse(
        envelope('voice.inquiry.received', { ...data, email: 'a@b.co' })
      ).success
    ).toBe(false)
    expect(
      voiceInquiryReceivedEvent.safeParse(
        envelope('voice.inquiry.received', { ...data, message: 'hi' })
      ).success
    ).toBe(false)
  })
  test('the registry lists it', () => {
    expect(Object.keys(INQUIRY_EVENTS)).toEqual(['voice.inquiry.received'])
  })
})

describe('errors', () => {
  test('the Inquiry codes exist and none collides with another registry', () => {
    expect(Object.keys(INQUIRY_ERRORS)).toEqual(
      expect.arrayContaining(['inquiry.origin_not_allowed', 'inquiry.consent_wording_missing'])
    )
    for (const code of Object.keys(INQUIRY_ERRORS)) {
      for (const other of [ERRORS, CORE_ERRORS, PROSPECT_ERRORS, AGENT_ERRORS]) {
        expect(code in other).toBe(false)
      }
    }
  })
})

describe('routes', () => {
  const routes = Object.entries(INQUIRY_ROUTES)
  test('every code a route lists exists', () => {
    const known = new Set([
      ...Object.keys(INQUIRY_ERRORS),
      ...Object.keys(AGENT_ERRORS),
      ...Object.keys(ERRORS),
    ])
    for (const [, r] of routes) {
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
  })
  test('method and path are unique, versioned, described; roles are listed', () => {
    const seen = new Set<string>()
    for (const [, r] of routes) {
      const key = `${r.method} ${r.path}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      expect(r.path.startsWith(r.internal ? '/internal/v1/' : '/v1/')).toBe(true)
      expect(r.description.length).toBeGreaterThan(40)
      expect(r.roles.length > 0 || r.public === true || r.internal === true).toBe(true)
    }
  })
  test('the list route describes its cursor and its maximum page size', () => {
    expect(INQUIRY_ROUTES.listInquiries.description).toContain('cursor')
    expect(INQUIRY_ROUTES.listInquiries.description).toContain('100')
  })
  test('the public routes take no token, redact the key and mention Retry-After', () => {
    const pub = routes.filter(([, r]) => r.public)
    expect(pub.map(([n]) => n)).toEqual(['publicGetInquiryForm', 'publicSubmitInquiry'])
    for (const [, r] of pub) {
      expect(r.roles).toEqual([])
      expect(r.commonErrors.some((c) => c.startsWith('auth.'))).toBe(false)
      expect(r.errors).toContain('inquiry.origin_not_allowed')
      expect(r.description).toContain('no token')
      expect(r.description).toContain('redact')
      expect(r.description).toContain('Retry-After')
    }
  })
  test('submitting needs the Idempotency-Key and can refuse a missing wording', () => {
    const r = INQUIRY_ROUTES.publicSubmitInquiry
    expect(r.keyRequired).toBe(true)
    expect(r.description).toContain('Idempotency-Key')
    expect(r.description).toContain('honeypot')
    expect(r.errors).toContain('inquiry.consent_wording_missing')
  })
  test('every route that needs a key says so, and replays are listed', () => {
    for (const [, r] of routes) {
      if (r.keyRequired) {
        expect(r.description).toContain('Idempotency-Key')
      }
      if (r.idempotent) {
        expect(r.commonErrors).toContain('request.idempotency_key_reused')
      }
    }
  })
  test('roles', () => {
    expect(INQUIRY_ROUTES.setInquiryEmbed.roles).toEqual(['owner', 'admin'])
    expect(INQUIRY_ROUTES.listInquiries.roles).toEqual(['owner', 'admin', 'manager', 'rep'])
    expect(INQUIRY_ROUTES.retryInquiryCallback.errors).toEqual(
      expect.arrayContaining(['agent.paused', 'agent.consent_required', 'agent.outside_hours'])
    )
    expect(INQUIRY_ROUTES.retryInquiryCallback.errors).toContain('inquiry.retries_exhausted')
    expect(INQUIRY_ERRORS['inquiry.retries_exhausted'].status).toBe(409)
    expect(INQUIRY_ROUTES.retryInquiryCallback.description).toContain('retries_exhausted')
  })
})

describe('internal key resolution and intake', () => {
  const key = 'k'.repeat(40)
  const intake = {
    organizationId: org,
    inquiryId: inq,
    prospect: { phone: '+14155550123' },
    consent: {
      channel: 'phone',
      wordingVersion: 3,
      sourceUrl: 'https://acme.example/contact',
      capturedAt: NOW,
    },
  }
  test('a key resolves to the Organization, origins and wording', () => {
    expect(resolveInquiryKeyRequestSchema.safeParse({ publishableKey: key }).success).toBe(true)
    expect(resolveInquiryKeyRequestSchema.safeParse({ publishableKey: 'short' }).success).toBe(
      false
    )
    const ok = {
      organizationId: org,
      allowedOrigins: ['https://acme.example'],
      consentWording: { version: 3, text: 'We may call you.' },
    }
    expect(resolvedInquiryKeySchema.safeParse(ok).success).toBe(true)
    expect(resolvedInquiryKeySchema.safeParse({ ...ok, publishableKey: key }).success).toBe(false)
    expect(
      resolvedInquiryKeySchema.safeParse({ ...ok, consentWording: { text: 'x' } }).success
    ).toBe(false)
  })
  test('an intake needs a phone, the wording version and the source URL', () => {
    expect(inquiryIntakeRequestSchema.safeParse(intake).success).toBe(true)
    const full = {
      ...intake,
      prospect: { name: 'Ada', email: 'a@b.co', phone: '+14155550123', company: 'Acme' },
    }
    expect(inquiryIntakeRequestSchema.safeParse(full).success).toBe(true)
    const { wordingVersion: _v, ...noVersion } = intake.consent
    expect(inquiryIntakeRequestSchema.safeParse({ ...intake, consent: noVersion }).success).toBe(
      false
    )
    const { sourceUrl: _u, ...noUrl } = intake.consent
    expect(inquiryIntakeRequestSchema.safeParse({ ...intake, consent: noUrl }).success).toBe(false)
    expect(
      inquiryIntakeRequestSchema.safeParse({ ...intake, prospect: { name: 'Ada' } }).success
    ).toBe(false)
    expect(
      inquiryIntakeRequestSchema.safeParse({
        ...intake,
        consent: { ...intake.consent, channel: 'sms' },
      }).success
    ).toBe(false)
  })
  test('the result names the Prospect and the consent event', () => {
    const ok = { prospectId: prs, consentId: formatId('cev', hex(6)) }
    expect(inquiryIntakeResultSchema.safeParse(ok).success).toBe(true)
    expect(inquiryIntakeResultSchema.safeParse({ prospectId: prs }).success).toBe(false)
  })
  test('the routes are internal, the intake needs a key, and the unknown key is a 404', () => {
    expect(INQUIRY_ERRORS['inquiry.key_unknown'].status).toBe(404)
    const a = INQUIRY_ROUTES.resolveInquiryKey
    expect(a.internal).toBe(true)
    expect(a.errors).toContain('inquiry.key_unknown')
    expect(a.description).toContain('redact')
    const b = INQUIRY_ROUTES.createInquiryIntake
    expect(b.internal).toBe(true)
    expect(b.keyRequired).toBe(true)
    expect(b.description).toContain('Idempotency-Key')
  })
})

test('the area is exported from the entry point', async () => {
  const api = await import('../index')
  expect(api.INQUIRY_ROUTES).toBe(INQUIRY_ROUTES)
  expect(api.voiceInquiryReceivedEvent).toBe(voiceInquiryReceivedEvent)
})
