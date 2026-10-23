import { describe, expect, test } from 'bun:test'
import { retryAfterDetailsSchema } from '../core/values'
import { ERRORS } from '../errors'
import { demoRequestIdSchema } from '../ids'
import {
  CREATE_DEMO_REQUEST_ERROR_CODES,
  createDemoRequestRequestSchema,
  createDemoRequestResponseSchema,
  MARKETING_ERRORS,
  MARKETING_ROUTES,
  MAX_DEMO_REQUEST_MESSAGE_LENGTH,
} from './index'

const valid = {
  name: 'Ada Lovelace',
  workEmail: 'Ada@Example.com',
  companyName: 'Analytical Engines Ltd',
  message: 'We would like to see the Copilot.',
  sourcePage: '/pricing',
}

describe('createDemoRequestRequestSchema', () => {
  test('accepts a valid request and folds the email', () => {
    const parsed = createDemoRequestRequestSchema.parse(valid)
    expect(parsed.workEmail).toBe('ada@example.com')
    expect(parsed.website).toBe('')
  })

  test('the message is optional', () => {
    const { message: _message, ...withoutMessage } = valid
    expect(createDemoRequestRequestSchema.safeParse(withoutMessage).success).toBe(true)
  })

  test.each([
    ['an empty name', { ...valid, name: '' }],
    ['a blank name', { ...valid, name: '   ' }],
    ['a name with a control character', { ...valid, name: 'Ada\u0000' }],
    ['a name over 1,000 characters', { ...valid, name: 'a'.repeat(1001) }],
    ['an empty company name', { ...valid, companyName: ' ' }],
    ['a malformed email', { ...valid, workEmail: 'not-an-email' }],
    ['an email with two @', { ...valid, workEmail: 'a@b@example.com' }],
    ['an email over 320 characters', { ...valid, workEmail: `${'a'.repeat(320)}@example.com` }],
    ['a message over 2,000 characters', { ...valid, message: 'a'.repeat(2001) }],
    ['an empty source page', { ...valid, sourcePage: '' }],
    ['a source page that is not a path', { ...valid, sourcePage: 'https://evil.example' }],
    ['a source page over 200 characters', { ...valid, sourcePage: `/${'a'.repeat(200)}` }],
    ['a honeypot over 200 characters', { ...valid, website: 'a'.repeat(201) }],
    ['an unknown key', { ...valid, organizationId: 'org_0190a5e0b3c17d2a8f4e5b6c7d8e9f01' }],
    ['the idempotency key in the body', { ...valid, idempotencyKey: 'k'.repeat(20) }],
  ])('rejects %s', (_label, body) => {
    expect(createDemoRequestRequestSchema.safeParse(body).success).toBe(false)
  })

  test('accepts a message of exactly the limit', () => {
    const message = 'a'.repeat(MAX_DEMO_REQUEST_MESSAGE_LENGTH)
    expect(MAX_DEMO_REQUEST_MESSAGE_LENGTH).toBe(2000)
    expect(createDemoRequestRequestSchema.safeParse({ ...valid, message }).success).toBe(true)
  })

  test('a message keeps its line breaks but refuses other control characters', () => {
    expect(createDemoRequestRequestSchema.parse({ ...valid, message: 'a\nb' }).message).toBe('a\nb')
    expect(createDemoRequestRequestSchema.safeParse({ ...valid, message: 'a\u0007' }).success).toBe(
      false
    )
  })

  test('a filled honeypot still parses, so the service can answer success and store nothing', () => {
    const parsed = createDemoRequestRequestSchema.parse({
      ...valid,
      website: 'http://spam.example',
    })
    expect(parsed.website).toBe('http://spam.example')
  })
})

describe('createDemoRequestResponseSchema', () => {
  test('is an acknowledgement with an id and nothing else', () => {
    const id = demoRequestIdSchema.parse('dreq_0190a5e0b3c17d2a8f4e5b6c7d8e9f01')
    expect(createDemoRequestResponseSchema.parse({ id, name: 'leak' })).toEqual({ id })
    expect(createDemoRequestResponseSchema.safeParse({}).success).toBe(false)
  })
})

describe('MARKETING_ERRORS', () => {
  test('marketing.invalid_request is 400 and marketing.rate_limited is 429', () => {
    expect(MARKETING_ERRORS['marketing.invalid_request'].status).toBe(400)
    expect(MARKETING_ERRORS['marketing.rate_limited'].status).toBe(429)
    expect(Object.keys(MARKETING_ERRORS).sort()).toEqual([
      'marketing.invalid_request',
      'marketing.rate_limited',
    ])
  })

  test('the codes are not common codes', () => {
    for (const code of Object.keys(MARKETING_ERRORS)) {
      expect(code in ERRORS).toBe(false)
    }
  })

  test('a rate-limited answer carries retryAfter seconds', () => {
    expect(retryAfterDetailsSchema.safeParse({ retryAfter: 60 }).success).toBe(true)
  })
})

describe('MARKETING_ROUTES', () => {
  const route = MARKETING_ROUTES.createDemoRequest

  test('is one public POST that takes no token', () => {
    expect(Object.keys(MARKETING_ROUTES)).toEqual(['createDemoRequest'])
    expect(route.method).toBe('POST')
    expect(route.path).toBe('/v1/marketing/demo-requests')
    expect(route.public).toBe(true)
    expect(route.success).toEqual([201, 200])
  })

  test('lists both marketing codes, and every listed code exists', () => {
    expect(route.errors).toEqual(['marketing.invalid_request', 'marketing.rate_limited'])
    for (const code of route.errors) {
      expect(MARKETING_ERRORS[code].status).toBeGreaterThanOrEqual(400)
    }
    for (const code of route.commonErrors) {
      expect(ERRORS[code].status).toBeGreaterThanOrEqual(400)
    }
    expect<readonly string[]>(CREATE_DEMO_REQUEST_ERROR_CODES).toEqual([
      ...route.errors,
      ...route.commonErrors,
    ])
    expect(route.commonErrors).not.toContain('auth.unauthenticated')
  })

  test('the OpenAPI description says public, header key, honeypot and the codes', () => {
    expect(route.description).toContain('Public')
    expect(route.description).toContain('Idempotency-Key header')
    expect(route.description).toContain('honeypot')
    expect(route.description).toContain('marketing.invalid_request')
    expect(route.description).toContain('marketing.rate_limited')
    expect(route.description).toContain('Retry-After')
  })

  test('the idempotency key is required and travels in the header', () => {
    expect(route.idempotencyKey).toBe('required')
  })
})
