import { CORE_ERRORS, SIGNUP_ERRORS } from '../core/errors'
import { defineErrors } from '../errors'

/**
 * Every `area.reason` code the auth service answers with, beyond the common ones in `ERRORS`:
 * sign-in, sign-up verification, passwords and sessions. The sign-up codes and core's
 * `organization.deleted` (returned by sign-in and refresh when the user's Organization was deleted)
 * are the same entries as in `SIGNUP_ERRORS` and `CORE_ERRORS`, not copies. A session or access
 * token that is not valid is the common `auth.token_*`; a refresh token that is not valid is
 * `session.invalid_token`.
 */
export const AUTH_ERRORS = {
  ...defineErrors('auth', {
    invalid_credentials: { status: 401, message: 'The email address or password is not right.' },
    user_banned: { status: 403, message: 'This account cannot sign in.' },
  }),
  ...defineErrors('email', {
    invalid: { status: 422, message: 'Enter a valid email address.' },
  }),
  ...defineErrors('password', {
    too_short: { status: 422, message: 'The password is too short.' },
    too_long: { status: 422, message: 'The password is too long.' },
    contains_user_info: { status: 422, message: 'The password contains your name or email.' },
    common: { status: 422, message: 'The password is too common.' },
    breached: {
      status: 422,
      message: 'The password appeared in a data breach. Choose a different one.',
    },
  }),
  ...defineErrors('verification', {
    invalid_code: { status: 422, message: 'The code is not right.' },
    expired: { status: 422, message: 'The code has expired. Ask for a new one.' },
    too_many_attempts: { status: 429, message: 'Too many wrong codes. Ask for a new one.' },
  }),
  ...defineErrors('flow', {
    not_found: { status: 404, message: 'This sign-in or sign-up was not found or has ended.' },
    invalid_step: { status: 409, message: 'This step is not available now. Start again.' },
  }),
  ...SIGNUP_ERRORS,
  'organization.deleted': CORE_ERRORS['organization.deleted'],
  ...defineErrors('mail', {
    unavailable: { status: 503, message: 'The email could not be sent right now. Try again.' },
  }),
  ...defineErrors('session', {
    invalid_token: { status: 401, message: 'The refresh token is not valid.' },
    revoked: { status: 401, message: 'This session has ended.' },
    expired: { status: 401, message: 'This session has expired. Sign in again.' },
    reuse_detected: {
      status: 401,
      message: 'A refresh token was used twice, so the session was ended. Sign in again.',
    },
  }),
} as const

/** A code from the {@link AUTH_ERRORS} registry. */
export type AuthErrorCode = keyof typeof AUTH_ERRORS
