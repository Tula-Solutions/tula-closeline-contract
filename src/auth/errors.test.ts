import { describe, expect, test } from 'bun:test'
import { CORE_ERRORS, SIGNUP_ERRORS } from '../core/errors'
import { ERRORS, errorCodeSchema } from '../errors'
import { AUTH_ERRORS } from './errors'

/** Every message, exactly: a changed word is a review decision, not an accident. */
const AUTH_MESSAGES = {
  'auth.invalid_credentials': 'The email address or password is not right.',
  'auth.user_banned': 'This account cannot sign in.',
  'email.invalid': 'Enter a valid email address.',
  'password.too_short': 'The password is too short.',
  'password.too_long': 'The password is too long.',
  'password.contains_user_info': 'The password contains your name or email.',
  'password.common': 'The password is too common.',
  'password.breached': 'The password appeared in a data breach. Choose a different one.',
  'verification.invalid_code': 'The code is not right.',
  'verification.expired': 'The code has expired. Ask for a new one.',
  'verification.too_many_attempts': 'Too many wrong codes. Ask for a new one.',
  'flow.not_found': 'This sign-in or sign-up was not found or has ended.',
  'flow.invalid_step': 'This step is not available now. Start again.',
  'auth.no_organization': 'You do not belong to an Organization, so you cannot sign in.',
  'signup.invitation_invalid': 'The invitation is not valid.',
  'signup.organization_name_invalid': 'Enter a valid Organization name.',
  'membership.unavailable': 'Organization membership is unavailable right now. Try again shortly.',
  'organization.deleted': 'This Organization has been deleted.',
  'mail.unavailable': 'The email could not be sent right now. Try again.',
  'oidc.disabled': 'Sign in with Google is not available.',
  'oidc.state_invalid': 'This sign-in has expired or is not valid. Start again.',
  'oidc.email_unverified': 'Google has not verified this email address.',
  'oidc.provider_unavailable': 'Google is not available right now. Try again later.',
  'oidc.invitation_mismatch': 'Use the Google account that matches the invited email address.',
  'session.invalid_token': 'The refresh token is not valid.',
  'session.revoked': 'This session has ended.',
  'session.expired': 'This session has expired. Sign in again.',
  'session.reuse_detected':
    'A refresh token was used twice, so the session was ended. Sign in again.',
} as const

describe('AUTH_ERRORS', () => {
  test.each([
    ['auth.invalid_credentials', 401],
    ['auth.user_banned', 403],
    ['email.invalid', 422],
    ['password.too_short', 422],
    ['password.too_long', 422],
    ['password.contains_user_info', 422],
    ['password.common', 422],
    ['password.breached', 422],
    ['verification.invalid_code', 422],
    ['verification.expired', 422],
    ['verification.too_many_attempts', 429],
    ['flow.not_found', 404],
    ['flow.invalid_step', 409],
    ['auth.no_organization', 403],
    ['signup.invitation_invalid', 422],
    ['signup.organization_name_invalid', 422],
    ['membership.unavailable', 503],
    ['organization.deleted', 410],
    ['mail.unavailable', 503],
    ['oidc.disabled', 404],
    ['oidc.state_invalid', 400],
    ['oidc.email_unverified', 403],
    ['oidc.provider_unavailable', 503],
    ['oidc.invitation_mismatch', 403],
    ['session.invalid_token', 401],
    ['session.revoked', 401],
    ['session.expired', 401],
    ['session.reuse_detected', 401],
  ] as const)('%s maps to status %d', (code, status) => {
    const entry = AUTH_ERRORS[code]
    expect(entry.code).toBe(code)
    expect(entry.status).toBe(status)
    expect(errorCodeSchema.safeParse(code).success).toBe(true)
  })

  test('lists exactly the codes under test', () => {
    expect(Object.keys(AUTH_ERRORS).sort()).toEqual(Object.keys(AUTH_MESSAGES).sort())
    expect(Object.keys(AUTH_ERRORS)).toHaveLength(28)
  })

  test('every message is exactly the one on the allow-list', () => {
    for (const [code, message] of Object.entries(AUTH_MESSAGES)) {
      expect(AUTH_ERRORS[code as keyof typeof AUTH_MESSAGES].message).toBe(message)
    }
  })

  test('every key equals its code, and each entry is frozen', () => {
    for (const [key, entry] of Object.entries(AUTH_ERRORS)) {
      expect(key).toBe(entry.code)
      expect(Object.isFrozen(entry)).toBe(true)
    }
  })

  test('reuses the sign-up and core entries by reference', () => {
    for (const code of Object.keys(SIGNUP_ERRORS) as (keyof typeof SIGNUP_ERRORS)[]) {
      expect(AUTH_ERRORS[code]).toBe(SIGNUP_ERRORS[code])
    }
    expect(AUTH_ERRORS['organization.deleted']).toBe(CORE_ERRORS['organization.deleted'])
  })

  test('has no code the common registry already owns', () => {
    for (const code of Object.keys(AUTH_ERRORS)) {
      expect(code in ERRORS).toBe(false)
    }
  })

  test('a code that is in more than one map is the same entry in each', () => {
    const maps = [ERRORS, CORE_ERRORS, SIGNUP_ERRORS, AUTH_ERRORS] as Record<
      string,
      { code: string; status: number; message: string }
    >[]
    const seen = new Map<string, { status: number; message: string }>()
    for (const map of maps) {
      for (const [code, entry] of Object.entries(map)) {
        const earlier = seen.get(code)
        if (earlier) {
          expect(entry).toEqual({ code, ...earlier })
        }
        seen.set(code, { status: entry.status, message: entry.message })
      }
    }
  })
})
