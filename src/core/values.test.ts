import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import {
  IDEMPOTENCY_KEY_HEADER,
  INVITATION_STATES,
  idempotencyKeySchema,
  invitationStateSchema,
  invitationTokenSchema,
  MAX_NAME_LENGTH,
  MAX_PERSON_NAME_LENGTH,
  organizationNameSchema,
  personNameSchema,
  storedNameSchema,
  teamNameSchema,
  timestampSchema,
} from './values'

describe.each([
  ['organizationNameSchema', organizationNameSchema],
  ['teamNameSchema', teamNameSchema],
])('%s', (_label, schema) => {
  test('accepts a name and trims it', () => {
    expect(schema.parse('  Acme Sales  ')).toBe('Acme Sales')
  })

  test('accepts exactly 200 characters and rejects 201', () => {
    expect(MAX_NAME_LENGTH).toBe(200)
    expect(schema.safeParse('a'.repeat(200)).success).toBe(true)
    expect(schema.safeParse('a'.repeat(201)).success).toBe(false)
  })

  test('trims before it bounds the length', () => {
    expect(schema.parse(`${'a'.repeat(200)} `)).toBe('a'.repeat(200))
    expect(schema.parse(` ${'a'.repeat(200)}  `)).toBe('a'.repeat(200))
    expect(schema.safeParse(` ${'a'.repeat(201)} `).success).toBe(false)
  })

  test('accepts a well-formed surrogate pair and rejects a lone surrogate', () => {
    expect(schema.safeParse('Acme \u{1F600}').success).toBe(true)
    expect(schema.safeParse('ab\ud800').success).toBe(false)
    expect(schema.safeParse('\udc00ab').success).toBe(false)
    expect(schema.safeParse('a\ud800b').success).toBe(false)
  })

  test('judges surrogates at the edges of their ranges', () => {
    expect(schema.safeParse('\ud800\udc00').success).toBe(true)
    expect(schema.safeParse('\udbff\udfff').success).toBe(true)
    expect(schema.safeParse('a\u{10FFFF}b').success).toBe(true)
    expect(schema.safeParse('ab\udbff').success).toBe(false)
    expect(schema.safeParse('ab\udfff').success).toBe(false)
    expect(schema.safeParse('\udfffab').success).toBe(false)
    expect(schema.safeParse('\udbff\udbff').success).toBe(false)
    expect(schema.safeParse('\ud800\ud800').success).toBe(false)
  })

  test('caps the raw input before it trims, and says so in its JSON schema', () => {
    expect(schema.safeParse(`${' '.repeat(400)}Acme${' '.repeat(400)}`).success).toBe(true)
    expect(schema.safeParse(`${' '.repeat(1000)}Acme`).success).toBe(false)
    const json = z.toJSONSchema(schema, { io: 'input' })
    expect(json.maxLength).toBe(1000)
  })

  test('leaves zero-width and direction-override characters alone', () => {
    expect(schema.safeParse('Ac\u200bme').success).toBe(true)
    expect(schema.safeParse('\u202eAcme').success).toBe(true)
  })

  test.each([
    ['empty', ''],
    ['only spaces', '   '],
    ['a newline inside', 'Acme\nSales'],
    ['a tab inside', 'Acme\tSales'],
    ['a NUL', 'Acme\u0000'],
    ['a C1 control', 'Acme\u0085Sales'],
    ['a number', 7],
    ['null', null],
  ])('rejects %s', (_name, input) => {
    expect(schema.safeParse(input).success).toBe(false)
  })
})

describe('personNameSchema', () => {
  test('fits the longest name auth can compose: 100 + a space + 100 characters', () => {
    expect(MAX_PERSON_NAME_LENGTH).toBe(201)
    const longest = `${'a'.repeat(100)} ${'b'.repeat(100)}`
    expect(personNameSchema.parse(longest)).toBe(longest)
    expect(personNameSchema.safeParse('a'.repeat(202)).success).toBe(false)
  })

  test('trims, and judges length after the trim', () => {
    expect(personNameSchema.parse('  Ada Lovelace  ')).toBe('Ada Lovelace')
    expect(personNameSchema.parse(` ${'a'.repeat(201)} `)).toBe('a'.repeat(201))
  })

  test.each([
    ['empty', ''],
    ['only spaces', '   '],
    ['a newline inside', 'Ada\nLovelace'],
    ['a NUL', 'Ada\u0000'],
    ['a lone surrogate', 'Ada\ud800'],
    ['null', null],
    ['a number', 7],
  ])('rejects %s', (_name, input) => {
    expect(personNameSchema.safeParse(input).success).toBe(false)
  })
})

describe('storedNameSchema', () => {
  test('accepts a name the database allows: 200 characters with surrounding spaces', () => {
    const stored = `  ${'a'.repeat(200)}  `
    expect(storedNameSchema.parse(stored)).toBe(stored)
    expect(storedNameSchema.safeParse('a'.repeat(1000)).success).toBe(true)
  })

  test('accepts any stored name, as it was stored', () => {
    expect(storedNameSchema.parse('Acme\tSales')).toBe('Acme\tSales')
    expect(storedNameSchema.parse('ab\ud800')).toBe('ab\ud800')
    expect(storedNameSchema.parse(' padded ')).toBe(' padded ')
  })

  test.each(['', 'a'.repeat(1001), 7, null])('rejects %p', (value) => {
    expect(storedNameSchema.safeParse(value).success).toBe(false)
  })
})

describe('invitationStateSchema', () => {
  test('is the three states the database names', () => {
    expect(INVITATION_STATES).toEqual(['pending', 'accepted', 'revoked'])
    for (const state of INVITATION_STATES) {
      expect(invitationStateSchema.safeParse(state).success).toBe(true)
    }
  })

  test.each(['expired', 'Pending', ''])('rejects %p', (state) => {
    expect(invitationStateSchema.safeParse(state).success).toBe(false)
  })
})

describe('timestampSchema', () => {
  test.each(['2026-10-12T09:30:00Z', '2026-10-12T09:30:00.123+02:00'])('accepts %s', (value) => {
    expect(timestampSchema.safeParse(value).success).toBe(true)
  })

  test.each(['2026-10-12', 'yesterday', '', 12])('rejects %p', (value) => {
    expect(timestampSchema.safeParse(value).success).toBe(false)
  })

  test('rejects an over-long timestamp', () => {
    const long = `2026-10-12T09:30:00.${'0'.repeat(50)}Z`
    expect(long.length).toBeGreaterThan(64)
    expect(timestampSchema.safeParse(long).success).toBe(false)
    const ok = `2026-10-12T09:30:00.${'0'.repeat(30)}Z`
    expect(ok.length).toBeLessThanOrEqual(64)
    expect(timestampSchema.safeParse(ok).success).toBe(true)
  })
})

describe('invitationTokenSchema', () => {
  test('accepts 128 bits of base64url and hex', () => {
    expect(invitationTokenSchema.safeParse('A'.repeat(22)).success).toBe(true)
    expect(invitationTokenSchema.safeParse('0190a5e0b3c17d2a8f4e5b6c7d8e9f01').success).toBe(true)
    expect(invitationTokenSchema.safeParse('a-b_'.repeat(64)).success).toBe(true)
  })

  test.each([
    ['too short', 'A'.repeat(21)],
    ['too long', 'A'.repeat(257)],
    ['a space', `${'A'.repeat(22)} `],
    ['a slash', `${'A'.repeat(22)}/`],
    ['empty', ''],
  ])('rejects %s', (_name, token) => {
    expect(invitationTokenSchema.safeParse(token).success).toBe(false)
  })
})

describe('idempotencyKeySchema', () => {
  test('names its header and accepts a UUID', () => {
    expect(IDEMPOTENCY_KEY_HEADER).toBe('Idempotency-Key')
    expect(idempotencyKeySchema.safeParse(crypto.randomUUID()).success).toBe(true)
  })

  test.each([
    ['too short', 'abc'],
    ['too long', 'a'.repeat(129)],
    ['a space', `${'a'.repeat(15)} `],
    ['a newline', `${'a'.repeat(16)}\n`],
    ['a comma', `${'a'.repeat(16)},b`],
  ])('rejects %s', (_name, key) => {
    expect(idempotencyKeySchema.safeParse(key).success).toBe(false)
  })

  test('accepts 128 characters', () => {
    expect(idempotencyKeySchema.safeParse('a'.repeat(128)).success).toBe(true)
  })
})
