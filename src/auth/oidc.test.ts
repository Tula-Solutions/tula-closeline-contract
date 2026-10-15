import { describe, expect, test } from 'bun:test'
import { CORE_ERRORS } from '../core/errors'
import { id } from '../core/fixtures'
import { errorCodeSchema } from '../errors'
import { AUTH_ERRORS } from './errors'
import {
  AUTH_OPTIONS_PATH,
  AUTH_OPTIONS_ROUTE,
  authOptionsResponseSchema,
  GOOGLE_ERROR_PARAM,
  GOOGLE_ERROR_PATH,
  GOOGLE_ROUTES,
  GOOGLE_SIGN_UP_ATTEMPT_PARAM,
  GOOGLE_SIGN_UP_PATH,
  googleCompleteRequestSchema,
  googleCompleteResponseSchema,
  googleErrorQuerySchema,
  googleIntentSchema,
  googleSignUpQuerySchema,
  googleStartRequestSchema,
  googleStartResponseSchema,
  MAX_RETURN_TO_LENGTH,
  OIDC_COOKIE_BASE_NAME,
  OIDC_COOKIE_SECURE_PREFIX,
  returnToSchema,
} from './index'

const ch = (code: number) => String.fromCharCode(code)

describe('returnToSchema', () => {
  const ok = (value: string) => returnToSchema.safeParse(value).success

  test('accepts a same-origin path, with a query and a fragment', () => {
    for (const value of [
      '/',
      '/dashboard',
      '/playbook/documents?state=ready',
      '/a#b',
      '/a%20b',
      '/settings/team',
      '/files/v1.2',
      '/search?q=..',
    ]) {
      expect(ok(value)).toBe(true)
    }
  })

  test.each([
    ['a protocol-relative URL', '//evil.example'],
    ['a slash then a backslash', '/\\evil.example'],
    ['a backslash inside', '/a\\b'],
    ['a scheme', 'https://evil.example'],
    ['a bare scheme', 'https:'],
    ['a javascript URL', 'javascript:alert(1)'],
    ['a relative path', 'dashboard'],
    ['an empty string', ''],
    ['a leading space', ' /a'],
    ['a percent-encoded double slash', '/%2F/evil.example'],
    ['a lower-case percent-encoded double slash', '/%2f/evil.example'],
    ['a percent-encoded backslash', '/%5Cevil.example'],
    ['a malformed percent sequence', '/%E0%A4%A'],
    ['a newline', '/a\nSet-Cookie: x=1'],
    ['a carriage return', '/a\rb'],
    ['a tab', '/a\tb'],
    ['a NUL', `/a${ch(0)}b`],
    ['a percent-encoded newline', '/a%0Ab'],
    ['a lone surrogate', `/a${ch(0xd800)}`],
    ['a dot segment that collapses to //', '/.//evil.example'],
    ['dot-dot segments that collapse to //', '/a/../..//evil.example'],
    ['an encoded dot-dot that collapses to //', '/%2e%2e//evil.example'],
    ['an upper-case encoded dot', '/%2E/x'],
    ['a dot-dot segment', '/a/..'],
    ['a zero-width space', `/${ch(0x200b)}/x`],
    ['a no-break space', `/${ch(0xa0)}x`],
    ['a line separator', `/a${ch(0x2028)}`],
    ['a space', '/ x'],
    ['a byte order mark', `/${ch(0xfeff)}x`],
    ['a bidi override', `/a${ch(0x202e)}b`],
  ])('refuses %s', (_name, value) => {
    expect(ok(value)).toBe(false)
  })

  test('is bounded in UTF-16 code units: an emoji counts as two', () => {
    const emoji = String.fromCodePoint(0x1f600)
    expect(ok(`/${emoji.repeat(255)}`)).toBe(true)
    expect(ok(`/${emoji.repeat(256)}`)).toBe(false)
  })

  test('is bounded in length', () => {
    expect(MAX_RETURN_TO_LENGTH).toBe(512)
    expect(ok(`/${'a'.repeat(MAX_RETURN_TO_LENGTH - 1)}`)).toBe(true)
    expect(ok(`/${'a'.repeat(MAX_RETURN_TO_LENGTH)}`)).toBe(false)
  })
})

describe('googleIntentSchema', () => {
  test('is sign_in or sign_up', () => {
    expect(googleIntentSchema.options).toEqual(['sign_in', 'sign_up'])
    expect(googleIntentSchema.safeParse('sign_in').success).toBe(true)
    expect(googleIntentSchema.safeParse('sign_up').success).toBe(true)
    expect(googleIntentSchema.safeParse('link').success).toBe(false)
    expect(googleIntentSchema.safeParse('SIGN_IN').success).toBe(false)
  })
})

describe('googleStartRequestSchema', () => {
  const parse = (value: unknown) => googleStartRequestSchema.safeParse(value)

  test('needs an intent; returnTo is optional and checked', () => {
    expect(parse({ intent: 'sign_in' }).success).toBe(true)
    expect(parse({ intent: 'sign_up', returnTo: '/dashboard' }).success).toBe(true)
    expect(parse({}).success).toBe(false)
    expect(parse({ intent: 'sign_in', returnTo: '//evil' }).success).toBe(false)
  })

  test('rejects unknown keys', () => {
    expect(parse({ intent: 'sign_in', redirectUri: 'https://evil.example' }).success).toBe(false)
  })
})

describe('googleStartResponseSchema', () => {
  const parse = (url: string) => googleStartResponseSchema.safeParse({ authorizationUrl: url })

  test('accepts an https URL', () => {
    expect(parse('https://accounts.google.com/o/oauth2/v2/auth?client_id=x&state=y').success).toBe(
      true
    )
  })

  test('accepts http only to a loopback host', () => {
    for (const url of [
      'http://localhost:3010/authorize?x=1',
      'http://127.0.0.1:3010/authorize',
      'http://127.1.2.3/authorize',
      'http://[::1]:3010/authorize',
    ]) {
      expect(parse(url).success).toBe(true)
    }
  })

  test.each([
    ['http to a public host', 'http://accounts.google.com/o/oauth2/v2/auth'],
    ['http to a look-alike of localhost', 'http://localhost.evil.example/a'],
    ['http to a look-alike of a loopback address', 'http://127.0.0.1.evil.example/a'],
    ['a javascript URL', 'javascript:alert(1)'],
    ['a data URL', 'data:text/html,x'],
    ['a relative URL', '/o/oauth2/v2/auth'],
    ['a URL with credentials', 'https://user:pass@accounts.google.com/a'],
    ['an ftp URL', 'ftp://accounts.google.com/a'],
    ['an empty string', ''],
    ['leading whitespace', ' https://accounts.google.com/a'],
    ['trailing whitespace', 'https://accounts.google.com/a '],
    ['a leading no-break space', `${ch(0xa0)}https://accounts.google.com/a`],
    ['not a URL', 'not a url'],
    ['a URL with a newline', 'https://accounts.google.com/a\nb'],
  ])('refuses %s', (_name, url) => {
    expect(parse(url).success).toBe(false)
  })

  test('is bounded and strict', () => {
    expect(parse(`https://accounts.google.com/a?${'x'.repeat(2100)}`).success).toBe(false)
    expect(
      googleStartResponseSchema.safeParse({
        authorizationUrl: 'https://accounts.google.com/a',
        state: 'secret',
      }).success
    ).toBe(false)
  })
})

describe('googleCompleteRequestSchema', () => {
  const parse = (value: unknown) => googleCompleteRequestSchema.safeParse(value)

  test('names the attempt and exactly one of organizationName and invitationToken', () => {
    expect(parse({ attemptId: 'att_123', organizationName: 'Northline' }).success).toBe(true)
    expect(parse({ attemptId: 'att_123', invitationToken: 'tok' }).success).toBe(true)
    expect(parse({ attemptId: 'att_123' }).success).toBe(false)
    expect(
      parse({ attemptId: 'att_123', organizationName: 'N', invitationToken: 'tok' }).success
    ).toBe(false)
    expect(parse({ organizationName: 'Northline' }).success).toBe(false)
  })

  test('bounds the fields and rejects unknown keys', () => {
    expect(parse({ attemptId: '', organizationName: 'N' }).success).toBe(false)
    expect(parse({ attemptId: 'a b', organizationName: 'N' }).success).toBe(false)
    expect(parse({ attemptId: 'att_1', organizationName: '   ' }).success).toBe(false)
    expect(parse({ attemptId: 'att_1', organizationName: 'x'.repeat(121) }).success).toBe(false)
    expect(parse({ attemptId: 'att_1', invitationToken: 'x'.repeat(513) }).success).toBe(false)
    expect(parse({ attemptId: 'att_1', organizationName: `a${ch(0)}b` }).success).toBe(false)
    expect(parse({ attemptId: 'att_1', organizationName: 'N', email: 'a@b.c' }).success).toBe(false)
  })

  test('trims the Organization name', () => {
    const parsed = googleCompleteRequestSchema.parse({
      attemptId: 'att_1',
      organizationName: '  Northline  ',
    })
    expect(parsed.organizationName).toBe('Northline')
  })
})

describe('googleCompleteResponseSchema', () => {
  const session = {
    sessionId: 'ses_1',
    accessToken: 'tok',
    accessTokenExpiresAt: '2026-10-12T09:30:00.000Z',
    organization: { id: 'org_1', role: 'owner' },
  }
  const flow = {
    id: 'att_1',
    kind: 'sign_up',
    expiresAt: '2026-10-12T09:40:00.000Z',
    step: { status: 'complete' },
    session,
  }
  const parse = (value: unknown) => googleCompleteResponseSchema.safeParse(value)

  test('is the browser flow response: id, kind, expiresAt, a complete step and the session', () => {
    expect(parse(flow).success).toBe(true)
    expect(parse({ ...flow, kind: 'sign_in' }).success).toBe(true)
  })

  test('the session may name the signed-in user, and still parses without it', () => {
    const userId = id('usr')
    expect(parse({ ...flow, session: { ...session, userId } }).success).toBe(true)
    expect(
      googleCompleteResponseSchema.parse({ ...flow, session: { ...session, userId } }).session
    ).toHaveProperty('userId', userId)
    expect(parse(flow).success).toBe(true)
    expect(parse({ ...flow, session: { ...session, userId: 'org_1' } }).success).toBe(false)
  })

  test('the step must be complete and the session is required', () => {
    expect(parse({ ...flow, step: { status: 'needs_password' } }).success).toBe(false)
    expect(parse({ ...flow, session: undefined }).success).toBe(false)
    expect(parse({ ...flow, id: undefined }).success).toBe(false)
  })

  test('never carries a refresh token, and drops fields it does not know', () => {
    expect(parse({ ...flow, session: { ...session, refreshToken: 'r' } }).success).toBe(false)
    const parsed = googleCompleteResponseSchema.parse({ ...flow, attemptSecret: 'tula_at_x' })
    expect('attemptSecret' in parsed).toBe(false)
  })
})

describe('AUTH_OPTIONS_ROUTE', () => {
  test('is a new route that the auth service owns', () => {
    expect(AUTH_OPTIONS_ROUTE.method).toBe('GET')
    expect(AUTH_OPTIONS_ROUTE.path).toBe(AUTH_OPTIONS_PATH)
    expect(AUTH_OPTIONS_ROUTE.description).toContain('The auth service owns this route')
    expect(AUTH_OPTIONS_ROUTE.description).toContain('new route')
    expect(AUTH_OPTIONS_ROUTE.description.toLowerCase()).not.toContain('backward')
  })
})

describe('authOptionsResponseSchema', () => {
  test('a payload without providers parses, with Google off', () => {
    expect(authOptionsResponseSchema.parse({})).toEqual({ providers: { google: false } })
    expect(authOptionsResponseSchema.parse({ passwordPolicy: { minLength: 12 } })).toEqual({
      providers: { google: false },
    })
  })

  test('carries the Google flag, which must be a boolean', () => {
    expect(authOptionsResponseSchema.parse({ providers: { google: true } }).providers.google).toBe(
      true
    )
    expect(authOptionsResponseSchema.safeParse({ providers: { google: 'yes' } }).success).toBe(
      false
    )
  })
})

describe('GOOGLE_ROUTES', () => {
  test('the callback text says every outcome is a 302, and complete says what a repeat does', () => {
    expect(GOOGLE_ROUTES.callback.description).toContain('answers every outcome with a 302')
    expect(GOOGLE_ROUTES.callback.description).toContain('catalogue status')
    expect(GOOGLE_ROUTES.complete.description).toContain(
      'A repeat is refused with oidc.state_invalid'
    )
    expect(GOOGLE_ROUTES.complete.description).not.toContain('safe to repeat')
  })

  test('describes start, callback and complete, with the codes they may return', () => {
    expect(Object.keys(GOOGLE_ROUTES).sort()).toEqual(['callback', 'complete', 'start'])
    expect(GOOGLE_ROUTES.start.method).toBe('POST')
    expect(GOOGLE_ROUTES.start.path).toBe('/v1/client/google/start')
    expect(GOOGLE_ROUTES.callback.method).toBe('GET')
    expect(GOOGLE_ROUTES.callback.path).toBe('/v1/client/google/callback')
    expect(GOOGLE_ROUTES.callback.success).toEqual([302])
    expect(GOOGLE_ROUTES.complete.method).toBe('POST')
    expect(GOOGLE_ROUTES.complete.path).toBe('/v1/client/google/complete')
    expect(AUTH_OPTIONS_PATH).toBe('/v1/client/auth-options')
    for (const route of Object.values(GOOGLE_ROUTES)) {
      expect(route.errors).toContain('oidc.disabled')
      for (const code of [...route.errors, ...route.redirectErrors]) {
        expect(code in AUTH_ERRORS || code in CORE_ERRORS).toBe(true)
      }
    }
    expect(GOOGLE_ROUTES.start.errors).toContain('oidc.provider_unavailable')
    expect(GOOGLE_ROUTES.complete.errors).toContain('oidc.provider_unavailable')
    expect(GOOGLE_ROUTES.complete.errors).toContain('oidc.invitation_mismatch')
    expect(GOOGLE_ROUTES.complete.errors).toContain('membership.already_member')
  })

  test('the callback answers 302 for everything but oidc.disabled; its other codes ride in the redirect', () => {
    expect(GOOGLE_ROUTES.callback.errors).toEqual(['oidc.disabled'])
    expect(GOOGLE_ROUTES.callback.redirectErrors).toEqual(
      expect.arrayContaining([
        'oidc.state_invalid',
        'oidc.email_unverified',
        'oidc.access_denied',
        'oidc.provider_unavailable',
        'auth.user_banned',
        'auth.no_organization',
        'organization.deleted',
        'membership.unavailable',
      ])
    )
    expect(GOOGLE_ROUTES.start.redirectErrors).toEqual([])
    expect(GOOGLE_ROUTES.complete.redirectErrors).toEqual([])
    expect(GOOGLE_ROUTES.callback.description).toContain('error parameter')
    expect(GOOGLE_ROUTES.callback.description).toContain('access_denied')
    expect(GOOGLE_ROUTES.callback.description).toContain('any other error from Google')
  })

  test('the redirect constants', () => {
    expect(GOOGLE_SIGN_UP_PATH).toBe('/sign-up/google')
    expect(GOOGLE_SIGN_UP_ATTEMPT_PARAM).toBe('attempt')
    expect(GOOGLE_ERROR_PATH).toBe('/sign-in')
    expect(GOOGLE_ERROR_PARAM).toBe('error')
    expect(OIDC_COOKIE_BASE_NAME).toBe('tula_oidc')
    expect(OIDC_COOKIE_SECURE_PREFIX).toBe('__Secure-')
  })

  test('the error query holds a code that parses with errorCodeSchema, and nothing else', () => {
    for (const code of GOOGLE_ROUTES.callback.redirectErrors) {
      expect(errorCodeSchema.safeParse(code).success).toBe(true)
      expect(googleErrorQuerySchema.safeParse({ [GOOGLE_ERROR_PARAM]: code }).success).toBe(true)
    }
    expect(googleErrorQuerySchema.safeParse({ error: 'Not A Code' }).success).toBe(false)
    expect(googleErrorQuerySchema.safeParse({}).success).toBe(false)
    expect(googleErrorQuerySchema.safeParse({ error: 'oidc.disabled', x: '1' }).success).toBe(false)
    expect(googleSignUpQuerySchema.safeParse({ attempt: 'att_123' }).success).toBe(true)
    expect(googleSignUpQuerySchema.safeParse({ attempt: 'a b' }).success).toBe(false)
  })

  test('the descriptions say how the cookie is named and who owns auth-options', () => {
    const all = Object.values(GOOGLE_ROUTES)
      .map((route) => route.description)
      .join(' ')
    expect(all).toContain('tula_oidc')
    expect(all).toContain('__Secure-')
    expect(all).toContain('outside local')
  })

  test('the descriptions state the security rules', () => {
    const all = Object.values(GOOGLE_ROUTES)
      .map((route) => route.description)
      .join(' ')
    for (const phrase of [
      'Retry-After',
      'PKCE',
      'single-use',
      'never read from the callback',
      'No token appears in a URL',
      'never logged',
      'sub',
    ]) {
      expect(all.toLowerCase()).toContain(phrase.toLowerCase())
    }
  })
})
