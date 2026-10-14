import { z } from 'zod'
import { timestampSchema } from '../core/values'
import type { CommonErrorCode } from '../errors'
import { roleSchema } from '../tenancy'
import type { AuthErrorCode } from './errors'

/** The longest `returnTo` path, in UTF-16 code units. */
export const MAX_RETURN_TO_LENGTH = 512

/** The longest authorization URL the start route answers with. */
export const MAX_AUTHORIZATION_URL_LENGTH = 2048

function hasUnsafeCharacter(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)
    if (
      code <= 0x1f ||
      (code >= 0x7f && code <= 0x9f) ||
      code === 0x61c ||
      code === 0x200e ||
      code === 0x200f ||
      (code >= 0x202a && code <= 0x202e) ||
      (code >= 0x2066 && code <= 0x2069)
    ) {
      return true
    }
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        return true
      }
      index += 1
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return true
    }
  }
  return false
}

const DOT_SEGMENTS = new Set(['.', '..'])

/** Whether `path` is a path on this site. `raw` is true for the text as sent, which also refuses whitespace and invisible format characters; a decoded form may hold a space. */
function isLocalPath(path: string, raw: boolean): boolean {
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.startsWith('/\\') ||
    path.includes('\\') ||
    hasUnsafeCharacter(path)
  ) {
    return false
  }
  if (raw && /[\s\p{Cf}]/u.test(path)) {
    return false
  }
  // A dot segment can collapse a path to `//host` when it is resolved.
  return !path
    .split(/[?#]/)[0]
    ?.split('/')
    .some((segment) => DOT_SEGMENTS.has(segment))
}

/**
 * Where to send the person after Google sign-in: a path on the same origin. It starts with `/` but
 * never `//` or `/\`, has no backslash, no scheme, no control or bidirectional character and no
 * lone surrogate, no whitespace or invisible format character, no `.` or `..` segment (which could
 * collapse to `//host` when resolved), and is at most `MAX_RETURN_TO_LENGTH` long. A
 * percent-encoded form is checked after decoding once too, so a consumer must decode exactly once; so `/%2F/evil` and `/%5Cevil` are refused, and so is a malformed escape. The
 * service also checks it against the portal's route allow-list and keeps it in the attempt; it is
 * never read from the callback.
 */
export const returnToSchema = z
  .string()
  .max(MAX_RETURN_TO_LENGTH)
  .refine((path) => isLocalPath(path, true), 'A path on this site')
  .refine((path) => {
    try {
      return isLocalPath(decodeURIComponent(path), false)
    } catch {
      return false
    }
  }, 'A path on this site')

/** Why the person is using Google: to `sign_in` to an account or to `sign_up` for one. */
export const googleIntentSchema = z.enum(['sign_in', 'sign_up'])

/** Why the person is using Google. */
export type GoogleIntent = z.infer<typeof googleIntentSchema>

/** The body that starts a Sign in with Google: the intent and an optional same-origin `returnTo`. Unknown keys are rejected. */
export const googleStartRequestSchema = z.strictObject({
  intent: googleIntentSchema,
  returnTo: returnToSchema.optional(),
})

/** The body that starts a Sign in with Google. */
export type GoogleStartRequest = z.infer<typeof googleStartRequestSchema>

function isLoopbackHost(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '[::1]') {
    return true
  }
  const octets = /^127\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname)
  return octets !== null && octets.slice(1).every((octet) => Number(octet) <= 255)
}

function isAuthorizationUrl(text: string): boolean {
  if (hasUnsafeCharacter(text)) {
    return false
  }
  let url: URL
  try {
    url = new URL(text)
  } catch {
    return false
  }
  if (url.username !== '' || url.password !== '') {
    return false
  }
  return url.protocol === 'https:' || (url.protocol === 'http:' && isLoopbackHost(url.hostname))
}

/** The URL the browser is sent to: `https`, or `http` only to a loopback host (for local development), with no credentials. */
export const authorizationUrlSchema = z
  .string()
  .max(MAX_AUTHORIZATION_URL_LENGTH)
  .refine(isAuthorizationUrl, 'An https URL, or http to a loopback host')

/** The answer to a start: where to send the browser. It carries nothing else; the attempt secret is in a cookie. */
export const googleStartResponseSchema = z.strictObject({
  authorizationUrl: authorizationUrlSchema,
})

/** The answer to a start. */
export type GoogleStartResponse = z.infer<typeof googleStartResponseSchema>

const storable = (text: string): boolean =>
  !text.includes(String.fromCharCode(0)) && !hasUnsafeCharacter(text)

/**
 * The body that finishes a Sign in with Google for a new user: the `attemptId` from the redirect
 * (the secret is in the cookie) and exactly one way to get an Organization, an `organizationName`
 * or an `invitationToken`. Unknown keys are rejected. The email is never sent: it is the one Google
 * verified.
 */
export const googleCompleteRequestSchema = z
  .strictObject({
    attemptId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/),
    organizationName: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .refine(storable, 'Storable text')
      .optional(),
    invitationToken: z.string().min(1).max(512).refine(storable, 'Storable text').optional(),
  })
  .refine(
    (body) => (body.organizationName === undefined) !== (body.invitationToken === undefined),
    {
      message: 'Send exactly one of organizationName and invitationToken.',
      path: ['organizationName'],
    }
  )

/** The body that finishes a Sign in with Google. */
export type GoogleCompleteRequest = z.infer<typeof googleCompleteRequestSchema>

/** The tokens of a signed-in session for the `browser` client: the refresh token is in the `Set-Cookie` header, never in the body. A secret: never log it. */
export const browserSessionTokensSchema = z.strictObject({
  sessionId: z.string().min(1).max(128),
  accessToken: z.string().min(1).max(4096),
  accessTokenExpiresAt: timestampSchema,
  organization: z.strictObject({ id: z.string().min(1).max(128), role: roleSchema }),
})

/** The tokens of a signed-in session for the `browser` client. */
export type BrowserSessionTokens = z.infer<typeof browserSessionTokensSchema>

/** The answer to a complete: the new session, for the `browser` client. */
export const googleCompleteResponseSchema = z.strictObject({
  session: browserSessionTokensSchema,
})

/** The answer to a complete. */
export type GoogleCompleteResponse = z.infer<typeof googleCompleteResponseSchema>

/** Which sign-in providers are on, so the portal hides a button that would only fail. */
export const authProvidersSchema = z.object({ google: z.boolean().default(false) })

/** Which sign-in providers are on. */
export type AuthProviders = z.infer<typeof authProvidersSchema>

/** The path of the auth options route. */
export const AUTH_OPTIONS_PATH = '/v1/client/auth-options'

/**
 * The answer to the auth options route, as far as the providers go. `providers` is additive: an
 * older payload without it still parses, with every provider off, and fields this schema does not
 * know are dropped.
 */
export const authOptionsResponseSchema = z.object({
  providers: authProvidersSchema.default({ google: false }),
})

/** The answer to the auth options route. */
export type AuthOptionsResponse = z.infer<typeof authOptionsResponseSchema>

/** What a service needs to describe one auth route for its OpenAPI document. */
export type AuthRoute = {
  readonly method: 'GET' | 'POST'
  readonly path: string
  /** The success statuses, the first being the usual one. */
  readonly success: readonly number[]
  /** The domain codes the route may return, beyond the common ones. */
  readonly errors: readonly AuthErrorCode[]
  /** The common codes the route may return, beyond those every route may. */
  readonly commonErrors: readonly CommonErrorCode[]
  /** The description for the OpenAPI document. */
  readonly description: string
}

const route = (definition: AuthRoute): AuthRoute => Object.freeze(definition)

/**
 * The Sign in with Google routes, by name: the description a service puts in its OpenAPI document,
 * the success statuses and every error code each route may answer with. None needs a session.
 */
export const GOOGLE_ROUTES: Readonly<Record<'start' | 'callback' | 'complete', AuthRoute>> =
  Object.freeze({
    start: route({
      method: 'POST',
      path: '/v1/client/google/start',
      success: [200],
      errors: ['oidc.disabled', 'oidc.provider_unavailable'],
      commonErrors: ['request.invalid', 'rate.limited', 'server.unavailable'],
      description:
        'Starts a Sign in with Google with an intent (sign_in or sign_up) and an optional same-origin returnTo path. It runs the OpenID Connect authorization-code flow with PKCE (S256), a state and a nonce, keeps them in an attempt that lives 10 minutes, sets a short-lived __Secure-tula_oidc cookie that holds the attempt secret, and answers the authorizationUrl to send the browser to (https, or http to a loopback host in local development). It asks for openid, email and profile only, with no offline access. The returnTo is checked against the portal route allow-list and kept in the attempt; it is never read from the callback. oidc.disabled (404) when Google is not set up; oidc.provider_unavailable (503) with a Retry-After header when Google cannot be reached.',
    }),
    callback: route({
      method: 'GET',
      path: '/v1/client/google/callback',
      success: [302],
      errors: [
        'oidc.disabled',
        'oidc.state_invalid',
        'oidc.email_unverified',
        'oidc.provider_unavailable',
        'auth.user_banned',
        'auth.no_organization',
        'organization.deleted',
        'membership.unavailable',
      ],
      commonErrors: ['request.invalid', 'rate.limited', 'server.unavailable'],
      description:
        'Where Google sends the browser back, with a code and a state. The state must match the attempt cookie and the attempt is single-use; a replayed, expired or mismatched state is oidc.state_invalid (400). The code is exchanged once, with the PKCE verifier, and the ID token is verified (RS256 only, issuer, audience, expiry, nonce, a present sub and email, and a verified email). A Google account that is already known, by its sub and never by its email, is signed in with the same checks as a password sign-in, and the answer is a 302 to the portal with the refresh cookie on it. No token appears in a URL. A new Google user is created by nothing here: the 302 goes to the sign-up step with the attempt id, and the person finishes with complete. An existing password account with the same email is linked only when Google verified the email, else oidc.email_unverified (403). It answers every outcome with a 302: an error redirects the browser to the portal error screen with its code, and the status in parentheses above is the catalogue status of that code, shown on the screen, not the HTTP status of this response. Codes, tokens and Authorization headers are never logged. oidc.provider_unavailable (503) with a Retry-After header when Google cannot be reached.',
    }),
    complete: route({
      method: 'POST',
      path: '/v1/client/google/complete',
      success: [200],
      errors: [
        'oidc.disabled',
        'oidc.state_invalid',
        'oidc.invitation_mismatch',
        'oidc.provider_unavailable',
        'signup.invitation_invalid',
        'signup.organization_name_invalid',
        'auth.no_organization',
        'organization.deleted',
        'membership.unavailable',
      ],
      commonErrors: ['request.invalid', 'rate.limited', 'server.unavailable'],
      description:
        'Finishes the sign-up of a new Google user: it takes the attempt id (the secret is in the cookie) and exactly one of an organizationName or an invitationToken. It creates the Organization or joins the invited one through the same sign-up path as an email sign-up, with no emailed code because Google verified the email, and stores the user and a google identity with no password. For an invitation the Google email must equal the invited address, else oidc.invitation_mismatch (403). An attempt that is missing, used or expired is oidc.state_invalid (400). An attempt is single-use. A repeat is refused with oidc.state_invalid (400) and nothing is created twice. Answers the browser session; the refresh token is in the cookie, never in the body. The attempt secret, tokens and the email are never logged.',
    }),
  })
