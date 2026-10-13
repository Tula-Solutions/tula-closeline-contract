import { describe, expect, test } from 'bun:test'
import { defineErrors, ERRORS, errorBodySchema, errorCodeSchema } from './errors'

describe('errorCodeSchema', () => {
  test.each(['request.invalid', 'auth.token_expired', 'a.b', 'x1.y_2'])('accepts %s', (code) => {
    expect(errorCodeSchema.safeParse(code).success).toBe(true)
  })

  test.each([
    '',
    'invalid',
    'Request.invalid',
    'request.Invalid',
    'request.',
    '.invalid',
    '1request.invalid',
    'request.1invalid',
    'request.in-valid',
    'a.b.c',
    'request.invalid\n',
    'request invalid',
  ])('rejects %p', (code) => {
    expect(errorCodeSchema.safeParse(code).success).toBe(false)
  })

  test('rejects a code longer than 100 characters', () => {
    expect(errorCodeSchema.safeParse(`a.${'b'.repeat(99)}`).success).toBe(false)
    expect(errorCodeSchema.safeParse(`a.${'b'.repeat(98)}`).success).toBe(true)
  })

  test('rejects a non-string', () => {
    expect(errorCodeSchema.safeParse(42).success).toBe(false)
  })
})

describe('errorBodySchema', () => {
  test('accepts a body without details', () => {
    const parsed = errorBodySchema.parse({ error: { code: 'request.invalid', message: 'Bad' } })
    expect(parsed.error.details).toBeUndefined()
  })

  test('accepts a body with details', () => {
    const body = { error: { code: 'request.invalid', message: 'Bad', details: { field: 'x' } } }
    expect(errorBodySchema.parse(body)).toEqual(body)
  })

  test('rejects a malformed code', () => {
    expect(errorBodySchema.safeParse({ error: { code: 'Bad Code', message: 'm' } }).success).toBe(
      false
    )
  })

  test('rejects a missing or empty message', () => {
    expect(errorBodySchema.safeParse({ error: { code: 'a.b' } }).success).toBe(false)
    expect(errorBodySchema.safeParse({ error: { code: 'a.b', message: '' } }).success).toBe(false)
  })

  test('rejects details that are not a record', () => {
    expect(
      errorBodySchema.safeParse({ error: { code: 'a.b', message: 'm', details: [1] } }).success
    ).toBe(false)
    expect(
      errorBodySchema.safeParse({ error: { code: 'a.b', message: 'm', details: 'x' } }).success
    ).toBe(false)
  })

  test('rejects a body without the error wrapper', () => {
    expect(errorBodySchema.safeParse({ code: 'a.b', message: 'm' }).success).toBe(false)
  })
})

describe('ERRORS', () => {
  test.each([
    ['request.invalid', 400],
    ['request.not_found', 404],
    ['request.conflict', 409],
    ['request.idempotency_key_reused', 422],
    ['request.idempotency_in_progress', 409],
    ['request.too_large', 413],
    ['request.method_not_allowed', 405],
    ['request.unsupported_media_type', 415],
    ['request.unprocessable', 422],
    ['auth.unauthenticated', 401],
    ['auth.forbidden', 403],
    ['auth.token_expired', 401],
    ['auth.token_invalid', 401],
    ['auth.unavailable', 503],
    ['rate.limited', 429],
    ['server.internal', 500],
    ['server.unavailable', 503],
    ['server.timeout', 504],
  ] as const)('%s maps to status %d', (code, status) => {
    const entry = Object.values(ERRORS).find((e) => e.code === code)
    expect(entry?.status).toBe(status)
    expect(errorCodeSchema.safeParse(code).success).toBe(true)
    expect(entry?.message.length).toBeGreaterThan(0)
  })

  test('lists exactly the codes under test, each keyed by itself', () => {
    expect(Object.keys(ERRORS)).toHaveLength(18)
    for (const code of [
      'auth.token_expired',
      'auth.token_invalid',
      'auth.unavailable',
      'request.idempotency_in_progress',
      'request.method_not_allowed',
      'request.unsupported_media_type',
      'request.unprocessable',
    ] as const) {
      expect(ERRORS[code].code).toBe(code)
    }
  })

  test('is frozen, and so is each entry', () => {
    expect(Object.isFrozen(ERRORS)).toBe(true)
    for (const entry of Object.values(ERRORS)) {
      expect(Object.isFrozen(entry)).toBe(true)
    }
  })

  test('every key equals its code', () => {
    for (const [key, entry] of Object.entries(ERRORS)) {
      expect(key).toBe(entry.code)
    }
  })
})

describe('defineErrors', () => {
  test('prefixes each reason with the area', () => {
    const errors = defineErrors('team', {
      not_found: { status: 404, message: 'Team not found' },
      name_taken: { status: 409, message: 'Team name is taken' },
    })
    expect(errors['team.not_found']).toEqual({
      code: 'team.not_found',
      status: 404,
      message: 'Team not found',
    })
    expect(errors['team.name_taken'].code).toBe('team.name_taken')
  })

  test('returns a frozen registry', () => {
    const errors = defineErrors('team', { a: { status: 400, message: 'm' } })
    expect(Object.isFrozen(errors)).toBe(true)
    expect(Object.isFrozen(errors['team.a'])).toBe(true)
  })

  test('rejects a malformed reason', () => {
    expect(() => defineErrors('team', { 'Not Found': { status: 404, message: 'm' } })).toThrow()
    expect(() => defineErrors('team', { 'a.b': { status: 404, message: 'm' } })).toThrow()
  })

  test('rejects a malformed area', () => {
    expect(() => defineErrors('Team', { a: { status: 404, message: 'm' } })).toThrow()
  })

  test('rejects a code that is already common to every service', () => {
    expect(() => defineErrors('request', { invalid: { status: 400, message: 'm' } })).toThrow(
      /duplicate/i
    )
  })

  test('rejects a status that is not an HTTP error status', () => {
    expect(() => defineErrors('team', { a: { status: 200, message: 'm' } })).toThrow()
    expect(() => defineErrors('team', { a: { status: 600, message: 'm' } })).toThrow()
  })
})
