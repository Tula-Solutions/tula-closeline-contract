import { describe, expect, test } from 'bun:test'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import { inboundRoute } from '../inbound-route'
import {
  API_KEY_SCOPES,
  APIKEY_ERRORS,
  APIKEY_ROUTES,
  apiKeySchema,
  apiKeyScopeSchema,
  createApiKeyRequestSchema,
  createApiKeyResponseSchema,
  listApiKeysQuerySchema,
  listApiKeysResponseSchema,
  verifyApiKeyRequestSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const id = (prefix: string, n: number) => formatId(prefix as never, hex(n))
const NOW = '2026-10-22T10:00:00.000Z'
const SECRET = `clk_${'a'.repeat(43)}`

const key = {
  id: id('akey', 1),
  name: 'CRM sync',
  prefix: 'clk_aaaaaaaa',
  scopes: ['prospects:read', 'prospects:write'],
  roleCeiling: 'rep',
  expiresAt: null,
  lastUsedAt: null,
  revokedAt: null,
  createdAt: NOW,
  createdByMembershipId: id('mem', 1),
}

describe('scopes', () => {
  test('are a closed list of area:read and area:write', () => {
    expect(API_KEY_SCOPES.length).toBe(16)
    for (const scope of API_KEY_SCOPES) {
      expect(scope).toMatch(/^[a-z]+:(read|write)$/)
    }
    expect(apiKeyScopeSchema.safeParse('admin:write').success).toBe(false)
    expect(apiKeyScopeSchema.safeParse('apikeys:write').success).toBe(false)
    expect(apiKeyScopeSchema.safeParse('*').success).toBe(false)
  })
})

describe('create request', () => {
  test('defaults the role ceiling to rep and the expiry to none', () => {
    const parsed = createApiKeyRequestSchema.parse({ name: 'x', scopes: ['calls:read'] })
    expect(parsed.roleCeiling).toBe('rep')
    expect(parsed.expiresAt).toBeNull()
  })
  test('refuses unknown fields, empty or repeated scopes and a bad role', () => {
    const base = { name: 'x', scopes: ['calls:read'] }
    expect(createApiKeyRequestSchema.safeParse({ ...base, secret: SECRET }).success).toBe(false)
    expect(createApiKeyRequestSchema.safeParse({ ...base, scopes: [] }).success).toBe(false)
    expect(
      createApiKeyRequestSchema.safeParse({ ...base, scopes: ['calls:read', 'calls:read'] }).success
    ).toBe(false)
    expect(createApiKeyRequestSchema.safeParse({ ...base, roleCeiling: 'root' }).success).toBe(
      false
    )
  })
})

describe('the secret', () => {
  test('is absent from reads: the key schema drops it and lists never carry it', () => {
    const parsed = apiKeySchema.parse({ ...key, secret: SECRET, hash: 'x' })
    expect('secret' in parsed).toBe(false)
    expect('hash' in parsed).toBe(false)
    const page = listApiKeysResponseSchema.parse({
      items: [{ ...key, secret: SECRET }],
      nextCursor: null,
    })
    expect('secret' in (page.items[0] ?? {})).toBe(false)
  })
  test('is returned by create, and is null on a replay', () => {
    expect(createApiKeyResponseSchema.parse({ ...key, secret: SECRET }).secret).toBe(SECRET)
    expect(createApiKeyResponseSchema.parse({ ...key, secret: null }).secret).toBeNull()
    expect(createApiKeyResponseSchema.safeParse({ ...key, secret: 'short' }).success).toBe(false)
  })
  test('only a short display prefix is held', () => {
    expect(apiKeySchema.safeParse({ ...key, prefix: SECRET }).success).toBe(false)
  })
  test('verify refuses a malformed secret and extra fields', () => {
    expect(verifyApiKeyRequestSchema.safeParse({ secret: SECRET }).success).toBe(true)
    expect(verifyApiKeyRequestSchema.safeParse({ secret: 'nope' }).success).toBe(false)
    expect(verifyApiKeyRequestSchema.safeParse({ secret: SECRET, extra: 1 }).success).toBe(false)
  })
})

describe('list query', () => {
  test('is cursor paginated with at most 100 per page and takes includeRevoked', () => {
    expect(listApiKeysQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
    expect(listApiKeysQuerySchema.parse({ includeRevoked: 'true' }).includeRevoked).toBe(true)
  })
})

describe('errors and routes', () => {
  const routes = Object.entries(APIKEY_ROUTES)
  test('codes are area.reason and distinct from common codes', () => {
    const common = new Set<string>(Object.values(ERRORS).map((e) => e.code))
    for (const entry of Object.values(APIKEY_ERRORS)) {
      expect(entry.code).toMatch(/^apikey\.[a-z_]+$/)
      expect(common.has(entry.code)).toBe(false)
    }
    expect(APIKEY_ERRORS['apikey.scope_not_allowed'].code).toBe('apikey.scope_not_allowed')
    expect(APIKEY_ERRORS['apikey.revoked'].code).toBe('apikey.revoked')
  })
  test('4 routes, known codes, every area code used, mutations keyed', () => {
    expect(routes.length).toBe(4)
    const known = new Set<string>(
      [...Object.values(APIKEY_ERRORS), ...Object.values(ERRORS)].map((e) => e.code)
    )
    for (const [, r] of routes) {
      expect(r.description.length).toBeGreaterThan(40)
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
      if (r.internal) {
        expect(r.path.startsWith('/internal/')).toBe(true)
        continue
      }
      expect(r.path.startsWith('/v1/')).toBe(true)
      if (r.method !== 'GET') {
        expect(r.keyRequired).toBe(true)
        expect(r.commonErrors).toContain('request.idempotency_key_reused')
        expect(r.description).toContain('Idempotency-Key')
      }
    }
    const used = new Set(routes.flatMap(([, r]) => r.errors as string[]))
    for (const entry of Object.values(APIKEY_ERRORS)) {
      expect(used.has(entry.code)).toBe(true)
    }
    expect(APIKEY_ROUTES.listApiKeys.description).toContain('cursor')
    expect(APIKEY_ROUTES.listApiKeys.description).toContain('100')
  })
  test('key management routes are never reachable with an API key', () => {
    for (const [, r] of routes) {
      expect(r.publicApi).toBeUndefined()
    }
  })
})

describe('the publicApi marker', () => {
  test('a route can carry a scope and keeps it', () => {
    const route = inboundRoute({
      method: 'GET',
      path: '/v1/example',
      roles: ['owner'],
      publicApi: { scope: 'prospects:read' },
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: [],
      description: 'An example route that an API key with the prospects:read scope may call.',
    })
    expect(route.publicApi).toEqual({ scope: 'prospects:read' })
  })
})

describe('the public API marker and the package index', () => {
  test('every publicApi marker names a valid scope on a /v1 route that takes a token', async () => {
    const api = (await import('../index')) as Record<string, unknown>
    const seen = new Map<string, string>()
    for (const [name, value] of Object.entries(api)) {
      if (
        !name.endsWith('_ROUTES') ||
        name.startsWith('ALL_') ||
        typeof value !== 'object' ||
        value === null
      ) {
        continue
      }
      type R = {
        method: string
        path: string
        public?: boolean
        internal?: boolean
        publicApi?: { scope: string }
      }
      for (const r of Object.values(value as Record<string, R>)) {
        const k = `${r.method} ${r.path.replace(/\{[^}]+\}/g, '{}')}`
        expect(seen.has(k) ? `${k} in ${seen.get(k)} and ${name}` : null).toBeNull()
        seen.set(k, name)
        if (r.publicApi) {
          expect(apiKeyScopeSchema.safeParse(r.publicApi.scope).success).toBe(true)
          expect(r.path.startsWith('/v1/')).toBe(true)
          expect(r.public).toBeFalsy()
          expect(r.internal).toBeFalsy()
        }
      }
    }
    expect(api.APIKEY_ROUTES).toBe(APIKEY_ROUTES)
    expect(api.APIKEY_ERRORS).toBe(APIKEY_ERRORS)
    expect(api.AUDIT_ROUTES).toBeDefined()
    expect(api.AUDIT_EVENTS).toBeDefined()
    expect(api.EXPORT_ROUTES).toBeDefined()
    expect(api.EXPORT_EVENTS).toBeDefined()
    expect(api.AGENT_CONTROL_ROUTES).toBeDefined()
  })
})
