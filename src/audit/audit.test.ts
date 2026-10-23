import { describe, expect, test } from 'bun:test'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import {
  AUDIT_ACTOR_KINDS,
  AUDIT_ERRORS,
  AUDIT_ROUTES,
  auditActorKindSchema,
  auditCsvQuerySchema,
  auditEventSchema,
  auditMetadataSchema,
  auditRecordedEvent,
  listAuditEventsQuerySchema,
  MAX_AUDIT_CSV_PAGE_SIZE,
  MAX_AUDIT_METADATA_KEYS,
  MAX_AUDIT_VERIFY_COUNT,
  verifyAuditQuerySchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const id = (prefix: string, n: number) => formatId(prefix as never, hex(n))
const NOW = '2026-10-22T10:00:00.000Z'
const HASH = 'a'.repeat(64)

const content = {
  occurredAt: NOW,
  actor: { kind: 'member', membershipId: id('mem', 1) },
  action: 'draft.approved',
  subject: { type: 'draft', id: id('drf', 2) },
  prospectId: id('prs', 3),
  instructionVersion: 2,
  requestId: null,
  metadata: { channel: 'email', count: 3, auto: false },
}

describe('actor kinds', () => {
  test('are a closed list', () => {
    expect([...AUDIT_ACTOR_KINDS]).toEqual(['member', 'agent', 'api_key', 'system'])
    expect(auditActorKindSchema.safeParse('robot').success).toBe(false)
  })
})

describe('metadata', () => {
  test('accepts ids, labels, numbers, flags and null', () => {
    expect(auditMetadataSchema.safeParse({ a: 'x', b: 1, c: true, d: null }).success).toBe(true)
  })
  test.each(['body', 'text', 'messageBody', 'reply_text', 'Body', 'transcript', 'secret'])(
    'refuses a free-text key named %s',
    (key) => {
      expect(auditMetadataSchema.safeParse({ [key]: 'hello' }).success).toBe(false)
    }
  )
  test('refuses a string over 200 characters, a control character and nested values', () => {
    expect(auditMetadataSchema.safeParse({ note: 'x'.repeat(201) }).success).toBe(false)
    expect(auditMetadataSchema.safeParse({ note: 'a\nb' }).success).toBe(false)
    expect(auditMetadataSchema.safeParse({ note: { a: 1 } }).success).toBe(false)
  })
  test('is limited to 20 entries', () => {
    const many = Object.fromEntries(
      Array.from({ length: MAX_AUDIT_METADATA_KEYS + 1 }, (_, i) => [`k${i}`, i])
    )
    expect(auditMetadataSchema.safeParse(many).success).toBe(false)
  })
})

describe('audit event', () => {
  const event = { id: id('aud', 9), sequence: 1, ...content, previousHash: null, hash: HASH }
  test('parses and drops unknown nested fields', () => {
    const parsed = auditEventSchema.parse({
      ...event,
      extra: 1,
      actor: { ...content.actor, extra: 1 },
    })
    expect('extra' in parsed).toBe(false)
    expect('extra' in parsed.actor).toBe(false)
  })
  test('needs a 64-character hex hash', () => {
    expect(auditEventSchema.safeParse({ ...event, hash: 'abc' }).success).toBe(false)
  })
})

describe('queries', () => {
  test('list page size is at most 100', () => {
    expect(listAuditEventsQuerySchema.safeParse({ limit: '100' }).success).toBe(true)
    expect(listAuditEventsQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
  })
  test('CSV page size is at most 1000', () => {
    expect(auditCsvQuerySchema.parse({}).limit).toBe(MAX_AUDIT_CSV_PAGE_SIZE)
    expect(auditCsvQuerySchema.safeParse({ limit: '1001' }).success).toBe(false)
  })
  test('verification count is at most 1000', () => {
    expect(verifyAuditQuerySchema.parse({}).count).toBe(MAX_AUDIT_VERIFY_COUNT)
    expect(verifyAuditQuerySchema.safeParse({ count: '1001' }).success).toBe(false)
  })
})

describe('audit.recorded event', () => {
  const envelope = (data: unknown) => ({
    id: id('evt', 50),
    type: 'audit.recorded',
    version: 1,
    occurredAt: NOW,
    organizationId: id('org', 1),
    region: 'us',
    data,
  })
  const data = { auditEventId: id('aud', 9), ...content }
  test('parses a sample and is at version 1', () => {
    expect(auditRecordedEvent.safeParse(envelope(data)).success).toBe(true)
    expect(auditRecordedEvent.version).toBe(1)
  })
  test('rejects empty, extra and free-text fields', () => {
    expect(auditRecordedEvent.safeParse(envelope({})).success).toBe(false)
    expect(auditRecordedEvent.safeParse(envelope({ ...data, body: 'hi' })).success).toBe(false)
    expect(
      auditRecordedEvent.safeParse(envelope({ ...data, actor: { ...content.actor, name: 'x' } }))
        .success
    ).toBe(false)
    expect(
      auditRecordedEvent.safeParse(envelope({ ...data, metadata: { messageBody: 'hi' } })).success
    ).toBe(false)
  })
})

describe('errors', () => {
  test('are area.reason codes that do not overlap the common ones', () => {
    for (const entry of Object.values(AUDIT_ERRORS)) {
      expect(entry.code).toMatch(/^audit\.[a-z_]+$/)
    }
    const common = new Set(Object.values(ERRORS).map((e) => e.code))
    for (const entry of Object.values(AUDIT_ERRORS)) {
      expect(common.has(entry.code as never)).toBe(false)
    }
    expect(AUDIT_ERRORS['audit.range_too_large'].code).toBe('audit.range_too_large')
  })
})

describe('routes', () => {
  const routes = Object.entries(AUDIT_ROUTES)
  test('there are 4 read-only routes, all used codes known', () => {
    expect(routes.length).toBe(4)
    const known = new Set<string>(
      [...Object.values(AUDIT_ERRORS), ...Object.values(ERRORS)].map((e) => e.code)
    )
    for (const [, r] of routes) {
      expect(r.method).toBe('GET')
      expect(r.path.startsWith('/v1/')).toBe(true)
      expect(r.description.length).toBeGreaterThan(40)
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
    const used = new Set(routes.flatMap(([, r]) => r.errors as string[]))
    for (const entry of Object.values(AUDIT_ERRORS)) {
      expect(used.has(entry.code)).toBe(true)
    }
  })
  test('the list says cursor and 100', () => {
    expect(AUDIT_ROUTES.listAuditEvents.description).toContain('cursor')
    expect(AUDIT_ROUTES.listAuditEvents.description).toContain('100')
  })
})
