import { describe, expect, test } from 'bun:test'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import { encodeCursor, MAX_PAGE_SIZE } from '../pagination'
import {
  completeMailboxConnectRequestSchema,
  domainCheckSchema,
  healthDailyPageSchema,
  listHealthHistoryQuerySchema,
  listMailboxesQuerySchema,
  listMailEventsQuerySchema,
  listSendsQuerySchema,
  MAIL_ERRORS,
  MAIL_EVENTS,
  MAIL_ROUTES,
  MAILBOX_RAMP_STEPS,
  MAX_TEST_SEND_SUBJECT_LENGTH,
  mailboxHealthSchema,
  mailboxLimitsSchema,
  mailboxPageSchema,
  mailboxSchema,
  mailCapacitySchema,
  mailEventPageSchema,
  mailEventSchema,
  oneClickUnsubscribeBodySchema,
  organizationMailLimitsSchema,
  sendKeySchema,
  sendKeyToString,
  sendPageSchema,
  sendRecordSchema,
  startMailboxConnectRequestSchema,
  submitSendRequestSchema,
  testSendRequestSchema,
  testSendResultSchema,
  unsubscribeParamsSchema,
  unsubscribeResultSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const org = formatId('org', hex(1))
const mbx = formatId('mbx', hex(2))
const mem = formatId('mem', hex(3))
const prs = formatId('prs', hex(4))
const snd = formatId('snd', hex(5))
const cpg = formatId('cpg', hex(6))
const enr = formatId('enr', hex(7))
const mev = formatId('mev', hex(8))
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

const limits = {
  perDay: 40,
  perHour: 10,
  minGapSeconds: 60,
  window: { timeZone: 'America/Chicago', days: ['mon', 'tue'], startMinute: 480, endMinute: 1020 },
}
const health = {
  mailboxId: mbx,
  status: 'scored',
  score: 88,
  effect: 'none',
  windowDays: 14,
  sampleSize: 120,
  minimumSample: 30,
  components: [
    {
      component: 'hard_bounce_rate',
      value: 0.01,
      weight: 30,
      warningThreshold: 0.03,
      criticalThreshold: 0.08,
      state: 'ok',
    },
  ],
  scoredAt: NOW,
}
const mailbox = {
  id: mbx,
  provider: 'gmail',
  kind: 'personal',
  address: 'rep@example.com',
  displayName: 'Rep',
  ownerMembershipId: mem,
  teamIds: [],
  state: 'warming',
  stateReason: null,
  limits,
  effectiveLimits: { perDay: 10, perHour: 10, minGapSeconds: 60 },
  ramp: { active: true, dayIndex: 2, perDayNow: 10, steps: [...MAILBOX_RAMP_STEPS] },
  health: { status: health.status, score: 88, effect: 'none', scoredAt: NOW },
  connectedAt: NOW,
  lastSyncedAt: null,
}
const sendRecord = {
  id: snd,
  campaignId: cpg,
  enrollmentId: enr,
  prospectId: prs,
  step: 0,
  attemptEpoch: 0,
  mailboxId: mbx,
  state: 'sent',
  reason: null,
  checks: [{ check: 'campaign', passed: true }],
  retryAt: null,
  decidedAt: NOW,
  sentAt: NOW,
}

describe('Mailbox', () => {
  test('parses a Mailbox', () => {
    expect(mailboxSchema.safeParse(mailbox).success).toBe(true)
  })
  test.each([
    'accessToken',
    'refreshToken',
    'access_token',
    'refresh_token',
    'clientSecret',
    'secret',
    'password',
    'code',
    'authorizationCode',
    'apiKey',
    'idToken',
  ])('a %s field never survives a parse', (field) => {
    const parsed = mailboxSchema.parse({ ...mailbox, [field]: 'sensitive-value' })
    expect(field in parsed).toBe(false)
    expect(JSON.stringify(parsed)).not.toContain('sensitive-value')
  })
  test('a token nested in the health or limits is dropped too', () => {
    const parsed = mailboxSchema.parse({
      ...mailbox,
      health: { ...mailbox.health, token: 'sensitive-value' },
      ramp: { ...mailbox.ramp, token: 'sensitive-value' },
    })
    expect(JSON.stringify(parsed)).not.toContain('sensitive-value')
  })
  test('the schema has no token or secret field to return', () => {
    for (const key of Object.keys(mailboxSchema.parse(mailbox))) {
      expect(/token|secret|password|code|key|credential/i.test(key)).toBe(false)
    }
  })
  test('a personal Mailbox names its owner, a shared one does not, and only a shared one has Teams', () => {
    expect(mailboxSchema.safeParse({ ...mailbox, ownerMembershipId: null }).success).toBe(false)
    expect(mailboxSchema.safeParse({ ...mailbox, kind: 'shared' }).success).toBe(false)
    expect(
      mailboxSchema.safeParse({ ...mailbox, kind: 'shared', ownerMembershipId: null }).success
    ).toBe(true)
    expect(
      mailboxSchema.safeParse({ ...mailbox, teamIds: [formatId('team', hex(9))] }).success
    ).toBe(false)
  })
  test('only a paused or disconnected Mailbox says why', () => {
    expect(mailboxSchema.safeParse({ ...mailbox, stateReason: 'owner_paused' }).success).toBe(false)
    expect(mailboxSchema.safeParse({ ...mailbox, state: 'paused' }).success).toBe(false)
    expect(
      mailboxSchema.safeParse({ ...mailbox, state: 'paused', stateReason: 'owner_paused' }).success
    ).toBe(true)
  })
  test('the states are the five of the spec', () => {
    for (const state of ['warming', 'healthy']) {
      expect(mailboxSchema.safeParse({ ...mailbox, state }).success).toBe(true)
    }
    expect(mailboxSchema.safeParse({ ...mailbox, state: 'banned' }).success).toBe(false)
  })
  test('a provider other than Gmail or Outlook is refused', () => {
    expect(mailboxSchema.safeParse({ ...mailbox, provider: 'yahoo' }).success).toBe(false)
  })
})

describe('requests', () => {
  test('connecting takes a provider; a personal Mailbox has no Teams', () => {
    expect(startMailboxConnectRequestSchema.parse({ provider: 'outlook' })).toEqual({
      provider: 'outlook',
      kind: 'personal',
      teamIds: [],
    })
    expect(
      startMailboxConnectRequestSchema.safeParse({
        provider: 'gmail',
        teamIds: [formatId('team', hex(9))],
      }).success
    ).toBe(false)
    expect(startMailboxConnectRequestSchema.safeParse({ provider: 'gmail', x: 1 }).success).toBe(
      false
    )
  })
  test('completing a connection takes only the state and the code', () => {
    const ok = { state: 'a'.repeat(32), code: '4/0AbCdEf' }
    expect(completeMailboxConnectRequestSchema.safeParse(ok).success).toBe(true)
    expect(completeMailboxConnectRequestSchema.safeParse({ ...ok, extra: 1 }).success).toBe(false)
    expect(
      completeMailboxConnectRequestSchema.safeParse({ ...ok, code: 'has space' }).success
    ).toBe(false)
  })
  test('limits are bounded and a window ends after it starts', () => {
    expect(mailboxLimitsSchema.safeParse(limits).success).toBe(true)
    expect(mailboxLimitsSchema.safeParse({ ...limits, perDay: 501 }).success).toBe(false)
    expect(mailboxLimitsSchema.safeParse({ ...limits, perDay: 0 }).success).toBe(false)
    expect(mailboxLimitsSchema.safeParse({ ...limits, extra: 1 }).success).toBe(false)
    expect(
      mailboxLimitsSchema.safeParse({
        ...limits,
        window: { ...limits.window, startMinute: 600, endMinute: 600 },
      }).success
    ).toBe(false)
    expect(
      mailboxLimitsSchema.safeParse({
        ...limits,
        window: { ...limits.window, days: ['mon', 'mon'] },
      }).success
    ).toBe(false)
  })
  test('the Organization limits are strict', () => {
    const ok = {
      perDayCeiling: 100,
      perHourCeiling: 20,
      minGapFloorSeconds: 30,
      organizationDailyCap: 1000,
    }
    expect(organizationMailLimitsSchema.safeParse(ok).success).toBe(true)
    expect(organizationMailLimitsSchema.safeParse({ ...ok, x: 1 }).success).toBe(false)
  })
})

describe('health', () => {
  test('a scored Mailbox has a score and not_enough_data has none and no effect', () => {
    expect(mailboxHealthSchema.safeParse(health).success).toBe(true)
    expect(mailboxHealthSchema.safeParse({ ...health, score: null }).success).toBe(false)
    expect(
      mailboxHealthSchema.safeParse({ ...health, status: 'not_enough_data', score: null }).success
    ).toBe(true)
    expect(
      mailboxHealthSchema.safeParse({ ...health, status: 'not_enough_data', score: 90 }).success
    ).toBe(false)
    expect(
      mailboxHealthSchema.safeParse({
        ...health,
        status: 'not_enough_data',
        score: null,
        effect: 'paused',
      }).success
    ).toBe(false)
  })
  test('unknown fields are dropped from health', () => {
    const parsed = mailboxHealthSchema.parse({ ...health, openRate: 0.5 })
    expect('openRate' in parsed).toBe(false)
  })
  test('there is no open or click component', () => {
    const open = { ...health.components[0], component: 'open_rate' }
    expect(mailboxHealthSchema.safeParse({ ...health, components: [open] }).success).toBe(false)
  })
})

describe('send record', () => {
  test('parses a sent record and drops unknown fields such as a body', () => {
    const parsed = sendRecordSchema.parse({ ...sendRecord, body: 'Hello', subject: 'Hi' })
    expect('body' in parsed).toBe(false)
    expect('subject' in parsed).toBe(false)
  })
  test('a refused send names its reason and a deferred one says when to retry', () => {
    const refused = { ...sendRecord, state: 'refused', sentAt: null, mailboxId: null }
    expect(sendRecordSchema.safeParse(refused).success).toBe(false)
    expect(sendRecordSchema.safeParse({ ...refused, reason: 'suppressed' }).success).toBe(true)
    const deferred = { ...refused, state: 'deferred', reason: 'outside_window' }
    expect(sendRecordSchema.safeParse(deferred).success).toBe(false)
    expect(sendRecordSchema.safeParse({ ...deferred, retryAt: NOW }).success).toBe(true)
  })
  test('a send that reached the transport names its Mailbox and a sent one its time', () => {
    expect(sendRecordSchema.safeParse({ ...sendRecord, mailboxId: null }).success).toBe(false)
    expect(sendRecordSchema.safeParse({ ...sendRecord, sentAt: null }).success).toBe(false)
  })
  test('the send key has one string form, which fits an Idempotency-Key', () => {
    const key = sendKeySchema.parse({ enrollmentId: enr, step: 2, attemptEpoch: 1 })
    expect(sendKeyToString(key)).toBe(`${enr}:2:1`)
    expect(sendKeySchema.safeParse({ enrollmentId: enr, step: -1, attemptEpoch: 0 }).success).toBe(
      false
    )
  })
  test('submitting a send takes ids and the key, never message text', () => {
    const ok = {
      campaignId: cpg,
      prospectId: prs,
      key: { enrollmentId: enr, step: 0, attemptEpoch: 0 },
    }
    expect(submitSendRequestSchema.parse(ok).acceptUnverifiedAddress).toBe(false)
    expect(submitSendRequestSchema.safeParse({ ...ok, body: 'Hello' }).success).toBe(false)
  })
})

describe('mail events', () => {
  const event = {
    id: mev,
    mailboxId: mbx,
    kind: 'hard_bounce',
    sendId: snd,
    prospectId: prs,
    enrollmentId: enr,
    providerMessageId: '<abc@example.com>',
    returnDate: null,
    occurredAt: NOW,
    recordedAt: NOW,
  }
  test('parses and drops a body', () => {
    const parsed = mailEventSchema.parse({ ...event, body: 'Hello' })
    expect('body' in parsed).toBe(false)
  })
  test('only an out-of-office has a return date', () => {
    expect(mailEventSchema.safeParse({ ...event, returnDate: '2026-02-01' }).success).toBe(false)
    expect(
      mailEventSchema.safeParse({ ...event, kind: 'out_of_office', returnDate: '2026-02-01' })
        .success
    ).toBe(true)
  })
  test('there is no open or click kind', () => {
    for (const kind of ['open', 'click']) {
      expect(mailEventSchema.safeParse({ ...event, kind }).success).toBe(false)
    }
  })
})

describe('domain check', () => {
  const ok = {
    mailboxId: mbx,
    domain: 'example.com',
    results: [
      { record: 'spf', status: 'pass', explanation: 'SPF is set.', suggestedRecord: null },
      {
        record: 'dmarc',
        status: 'missing',
        explanation: 'Add DMARC.',
        suggestedRecord: 'v=DMARC1',
      },
    ],
    checkedAt: NOW,
  }
  test('an unchecked domain has no results and a checked one has', () => {
    expect(domainCheckSchema.safeParse(ok).success).toBe(true)
    expect(domainCheckSchema.safeParse({ ...ok, results: [], checkedAt: null }).success).toBe(true)
    expect(domainCheckSchema.safeParse({ ...ok, checkedAt: null }).success).toBe(false)
    expect(domainCheckSchema.safeParse({ ...ok, results: [] }).success).toBe(false)
  })
  test('a record is reported once', () => {
    expect(
      domainCheckSchema.safeParse({ ...ok, results: [ok.results[0], ok.results[0]] }).success
    ).toBe(false)
  })
})

describe('unsubscribe', () => {
  test('the token is URL-safe and long enough', () => {
    expect(unsubscribeParamsSchema.safeParse({ token: 'a'.repeat(40) }).success).toBe(true)
    expect(unsubscribeParamsSchema.safeParse({ token: 'short' }).success).toBe(false)
    expect(unsubscribeParamsSchema.safeParse({ token: `${'a'.repeat(30)}/..` }).success).toBe(false)
  })
  test('the one-click body is exactly the RFC 8058 field', () => {
    expect(
      oneClickUnsubscribeBodySchema.safeParse({ 'List-Unsubscribe': 'One-Click' }).success
    ).toBe(true)
    expect(oneClickUnsubscribeBodySchema.safeParse({ 'List-Unsubscribe': 'yes' }).success).toBe(
      false
    )
  })
  test('the result says the same for every address and carries no address', () => {
    const parsed = unsubscribeResultSchema.parse({
      status: 'unsubscribed',
      organizationName: 'Acme',
      email: 'a@example.com',
    })
    expect('email' in parsed).toBe(false)
  })
})

describe('lists', () => {
  const queries = {
    listMailboxesQuerySchema,
    listHealthHistoryQuerySchema,
    listSendsQuerySchema,
    listMailEventsQuerySchema,
  }
  test.each(Object.keys(queries))('%s takes a cursor and a limit of at most 100', (name) => {
    const schema = queries[name as keyof typeof queries]
    const cursor = encodeCursor({ id: mbx })
    expect(schema.parse({ cursor, limit: '100' }).limit).toBe(MAX_PAGE_SIZE)
    expect(schema.safeParse({ limit: '101' }).success).toBe(false)
    expect(schema.safeParse({ limit: 0 }).success).toBe(false)
    expect(schema.safeParse({ unknown: 1 }).success).toBe(false)
  })
  const pages = {
    mailboxPageSchema,
    healthDailyPageSchema,
    sendPageSchema,
    mailEventPageSchema,
  }
  test.each(Object.keys(pages))('%s carries a next cursor and at most 100 items', (name) => {
    const schema = pages[name as keyof typeof pages]
    expect(schema.safeParse({ items: [], nextCursor: null }).success).toBe(true)
    expect(schema.safeParse({ items: [] }).success).toBe(false)
    expect(
      schema.safeParse({ items: new Array(MAX_PAGE_SIZE + 1).fill({}), nextCursor: null }).success
    ).toBe(false)
  })
})

describe('capacity and limited state', () => {
  test('capacity is a cursor page of at most 100 Mailboxes', () => {
    const base = { organizationRemainingToday: 5, organizationDailyCap: 10 }
    expect(mailCapacitySchema.safeParse({ ...base, items: [], nextCursor: null }).success).toBe(
      true
    )
    expect(mailCapacitySchema.safeParse({ ...base, items: [] }).success).toBe(false)
    expect(
      mailCapacitySchema.safeParse({ ...base, items: new Array(101).fill({}), nextCursor: null })
        .success
    ).toBe(false)
  })
  test('a limited Mailbox says why', () => {
    expect(mailboxSchema.safeParse({ ...mailbox, state: 'limited' }).success).toBe(false)
    expect(
      mailboxSchema.safeParse({ ...mailbox, state: 'limited', stateReason: 'health_warning' })
        .success
    ).toBe(true)
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
        const key = `${r.method} ${r.path}`
        expect(seen.has(key) ? `${key} in ${seen.get(key)} and ${name}` : null).toBeNull()
        seen.set(key, name)
      }
    }
  })
})

describe('errors', () => {
  test('every code is area.reason and its key matches its code', () => {
    for (const [key, def] of Object.entries(MAIL_ERRORS)) {
      expect(key).toBe(def.code)
      expect(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/.test(def.code)).toBe(true)
      expect(['mailbox', 'send', 'unsubscribe']).toContain(def.code.split('.')[0] ?? '')
      expect(def.status >= 400 && def.status < 600).toBe(true)
    }
  })
  test('the codes the spec requires exist with the right status', () => {
    const expected: Record<string, number> = {
      'mailbox.not_connected': 409,
      'mailbox.limit_reached': 429,
      'mailbox.paused': 409,
      'mailbox.auth_revoked': 409,
      'send.suppressed': 409,
      'send.no_consent': 409,
      'send.unverified_address': 422,
      'send.outside_window': 409,
      'send.duplicate': 409,
      'unsubscribe.invalid_token': 400,
    }
    for (const [code, status] of Object.entries(expected)) {
      expect(MAIL_ERRORS[code as keyof typeof MAIL_ERRORS].status).toBe(status)
    }
  })
  test('no code collides with the shared registry', () => {
    for (const code of Object.keys(MAIL_ERRORS)) {
      expect(code in ERRORS).toBe(false)
    }
  })
})

describe('events', () => {
  const ids = { mailboxId: mbx, prospectId: prs, sendId: snd, campaignId: cpg, enrollmentId: enr }
  const providerMessageId = '<abc@example.com>'
  const samples: Record<string, object> = {
    'mailbox.state_changed': {
      mailboxId: mbx,
      ownerMembershipId: mem,
      from: 'healthy',
      to: 'paused',
      reason: 'complaint_spike',
      changedAt: NOW,
    },
    'mail.bounced': { ...ids, providerMessageId, kind: 'hard', bouncedAt: NOW },
    'mail.complained': { ...ids, providerMessageId, complainedAt: NOW },
    'mail.replied': { ...ids, providerMessageId, repliedAt: NOW },
    'mail.out_of_office': { ...ids, providerMessageId, returnDate: null, receivedAt: NOW },
    'mail.unsubscribed': {
      prospectId: prs,
      mailboxId: mbx,
      sendId: snd,
      enrollmentId: enr,
      source: 'one_click',
      unsubscribedAt: NOW,
    },
  }
  test('the registry lists the events and the spec ones are there', () => {
    expect(Object.keys(MAIL_EVENTS).sort()).toEqual(Object.keys(samples).sort())
    for (const type of [
      'mailbox.state_changed',
      'mail.bounced',
      'mail.complained',
      'mail.replied',
      'mail.unsubscribed',
    ]) {
      expect(type in MAIL_EVENTS).toBe(true)
    }
  })
  test.each(Object.keys(samples))('%s parses on the shared envelope and is strict', (type) => {
    const event = MAIL_EVENTS[type as keyof typeof MAIL_EVENTS]
    expect(event.safeParse(envelope(type, samples[type])).success).toBe(true)
    expect(event.safeParse(envelope(type, {})).success).toBe(false)
    expect(event.safeParse(envelope(type, { ...samples[type], extra: 'x' })).success).toBe(false)
  })
  test.each(Object.keys(samples))('%s carries ids, never a body, subject or address', (type) => {
    const event = MAIL_EVENTS[type as keyof typeof MAIL_EVENTS]
    for (const field of ['body', 'text', 'subject', 'email', 'address', 'token']) {
      const data = { ...samples[type], [field]: 'Hello there' }
      expect(event.safeParse(envelope(type, data)).success).toBe(false)
    }
  })
})

describe('routes', () => {
  const routes = Object.entries(MAIL_ROUTES)
  test('every code a route lists exists', () => {
    const known = new Set([...Object.keys(MAIL_ERRORS), ...Object.keys(ERRORS)])
    for (const [, r] of routes) {
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
  })
  test('every mail code is returned by some route', () => {
    const used = new Set(routes.flatMap(([, r]) => r.errors))
    for (const code of Object.keys(MAIL_ERRORS)) {
      expect(used.has(code as keyof typeof MAIL_ERRORS)).toBe(true)
    }
  })
  test('method and path are unique, under /v1, /internal or /v1/public, and described', () => {
    const seen = new Set<string>()
    for (const [, r] of routes) {
      const key = `${r.method} ${r.path}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      if (r.internal) {
        expect(r.path.startsWith('/internal/')).toBe(true)
        expect(r.roles).toEqual([])
      } else if (r.public) {
        expect(r.path.startsWith('/v1/public/')).toBe(true)
        expect(r.roles).toEqual([])
      } else {
        expect(r.path.startsWith('/v1/')).toBe(true)
        expect(r.roles.length).toBeGreaterThan(0)
      }
      expect(r.description.length).toBeGreaterThan(40)
    }
  })
  test('the list routes describe their cursor and maximum page size', () => {
    for (const name of [
      'listMailboxes',
      'listMailboxHealthHistory',
      'listSends',
      'listMailEvents',
      'getMailCapacity',
    ] as const) {
      expect(MAIL_ROUTES[name].description).toContain('cursor')
      expect(MAIL_ROUTES[name].description).toContain('100')
    }
  })
  test('a route that needs a key says so, and a retried one lists the replay errors', () => {
    for (const [, r] of routes) {
      if (r.keyRequired) {
        expect(r.description).toContain('Idempotency-Key')
      }
      if (r.idempotent && !r.internal && !r.public) {
        expect(r.commonErrors).toContain('request.idempotency_key_reused')
      }
    }
  })
  test('actions with effects need an Idempotency-Key', () => {
    for (const name of [
      'startMailboxConnect',
      'completeMailboxConnect',
      'disconnectMailbox',
      'pauseMailbox',
      'resumeMailbox',
      'testSendMailbox',
      'checkMailboxDomain',
      'submitSend',
    ] as const) {
      expect(MAIL_ROUTES[name].keyRequired).toBe(true)
    }
  })
  test('a mail client cannot send a key, so the unsubscribe route does not need one', () => {
    expect(MAIL_ROUTES.confirmUnsubscribe.keyRequired).toBeFalsy()
    expect(MAIL_ROUTES.confirmUnsubscribe.public).toBe(true)
    expect(MAIL_ROUTES.confirmUnsubscribe.description).toContain('RFC 8058')
  })
  test('the send route is internal, uses the shared secret and lists the send errors', () => {
    const r = MAIL_ROUTES.submitSend
    expect(r.internal).toBe(true)
    expect(r.description).toContain('shared secret')
    for (const code of [
      'send.suppressed',
      'send.no_consent',
      'send.unverified_address',
      'send.outside_window',
      'send.duplicate',
      'mailbox.not_connected',
      'mailbox.paused',
      'mailbox.limit_reached',
      'mailbox.auth_revoked',
    ] as const) {
      expect(r.errors).toContain(code)
    }
    expect(r.description).toContain('No setting turns the suppression or consent check off')
  })
  test('a Mailbox or send record out of view is a 404, never a 403', () => {
    expect(MAIL_ROUTES.getMailbox.description).toContain('never 403')
    expect(MAIL_ROUTES.getSend.description).toContain('never 403')
  })
  test('the unsubscribe routes are public, rate limited and give the same answer for any address', () => {
    for (const name of ['getUnsubscribePage', 'confirmUnsubscribe'] as const) {
      expect(MAIL_ROUTES[name].public).toBe(true)
      expect(MAIL_ROUTES[name].errors).toContain('unsubscribe.invalid_token')
      expect(MAIL_ROUTES[name].commonErrors).toContain('rate.limited')
    }
    expect(MAIL_ROUTES.confirmUnsubscribe.description).toContain('same for an address')
  })
  test('the webhooks are public and verified by signature', () => {
    for (const name of ['receiveGmailNotification', 'receiveGraphNotification'] as const) {
      expect(MAIL_ROUTES[name].public).toBe(true)
      expect(MAIL_ROUTES[name].commonErrors).toContain('auth.unauthenticated')
    }
  })
  test('no route reports opens or clicks', () => {
    for (const [name, r] of routes) {
      expect(/open[s_]?rate|click/i.test(name)).toBe(false)
      expect(r.path.includes('click')).toBe(false)
    }
  })
  test('Rep and Manager visibility and Admin-only actions are by role', () => {
    expect(MAIL_ROUTES.listMailboxes.roles).toEqual(['owner', 'admin', 'manager', 'rep'])
    expect(MAIL_ROUTES.setOrganizationMailLimits.roles).toEqual(['owner', 'admin'])
    expect(MAIL_ROUTES.checkMailboxDomain.roles).toEqual(['owner', 'admin'])
    expect(MAIL_ROUTES.listMailEvents.roles).toEqual(['owner', 'admin', 'manager'])
  })
})

test('the area is exported from the entry point', async () => {
  const api = await import('../index')
  expect(api.MAIL_ROUTES).toBe(MAIL_ROUTES)
  expect(api.MAIL_ERRORS).toBe(MAIL_ERRORS)
})

describe('test send', () => {
  test('takes a valid recipient and an optional bounded subject, nothing else', () => {
    expect(testSendRequestSchema.parse({ to: 'A@Example.com' }).to).toBe('a@example.com')
    expect(testSendRequestSchema.safeParse({ to: 'a@example.com', subject: 'Hi' }).success).toBe(
      true
    )
    expect(testSendRequestSchema.safeParse({ to: 'a@example.com', body: 'Hello' }).success).toBe(
      false
    )
  })
  test('refuses an invalid address and a bad subject', () => {
    expect(testSendRequestSchema.safeParse({ to: 'not-an-email' }).success).toBe(false)
    expect(testSendRequestSchema.safeParse({}).success).toBe(false)
    for (const subject of [
      '',
      '   ',
      'x'.repeat(MAX_TEST_SEND_SUBJECT_LENGTH + 1),
      'a\r\nBcc: x',
    ]) {
      expect(testSendRequestSchema.safeParse({ to: 'a@example.com', subject }).success).toBe(false)
    }
    expect(
      testSendRequestSchema.safeParse({
        to: 'a@example.com',
        subject: 'x'.repeat(MAX_TEST_SEND_SUBJECT_LENGTH),
      }).success
    ).toBe(true)
  })
  test('the result carries an id and a time, never text', () => {
    const ok = { providerMessageId: 'abc', sentAt: '2026-01-01T00:00:00.000Z' }
    expect(testSendResultSchema.parse(ok)).toEqual(ok)
    expect(testSendResultSchema.safeParse({ ...ok, text: 'Hello' }).success).toBe(false)
    expect(testSendResultSchema.safeParse({ ...ok, providerMessageId: '' }).success).toBe(false)
  })
  test('the route needs a key and lists the Mailbox errors', () => {
    const r = MAIL_ROUTES.testSendMailbox
    expect(r.path).toBe('/v1/mailboxes/{mailboxId}/test-send')
    expect(r.errors).toEqual(
      expect.arrayContaining([
        'mailbox.not_found',
        'mailbox.not_connected',
        'mailbox.paused',
        'mailbox.auth_revoked',
      ])
    )
  })
})
