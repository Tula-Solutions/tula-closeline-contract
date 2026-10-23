import { defineErrors } from '../errors'

/**
 * The errors the API key routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`. A key of another Organization is `apikey.not_found` (404, never 403).
 *
 * - `apikey.not_found` (404): unknown key, or not the caller's Organization's.
 * - `apikey.scope_not_allowed` (403): the key asks for a scope, or a role ceiling, above what the
 *   creating Admin holds, or a scope no key may have.
 * - `apikey.revoked` (401): the key was revoked or has expired. Returned by the internal
 *   verification, so the exchange for a token is refused.
 * - `apikey.invalid` (401): the presented secret matches no key.
 * - `apikey.rate_limited` (429): the key made too many calls in the window.
 */
export const APIKEY_ERRORS = defineErrors('apikey', {
  not_found: { status: 404, message: 'The API key was not found.' },
  scope_not_allowed: {
    status: 403,
    message: 'You cannot give an API key that scope or role.',
  },
  revoked: { status: 401, message: 'The API key was revoked or has expired.' },
  invalid: { status: 401, message: 'The API key is not valid.' },
  rate_limited: { status: 429, message: 'This API key made too many requests. Try again later.' },
})

/** An API key error code. */
export type ApikeyErrorCode = keyof typeof APIKEY_ERRORS
