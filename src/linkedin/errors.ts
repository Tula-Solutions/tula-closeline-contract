import { defineErrors } from '../errors'

/**
 * The errors the LinkedIn routes and send guard return, as `area.reason` codes (ADR 0004, spec
 * M11). A role that is not allowed is the common `auth.forbidden`. An account outside the caller's
 * view, or of another Organization, is the common `request.not_found` (404), never 403.
 *
 * - `linkedin.channel_disabled` (409): the Admin switch is off, so no LinkedIn send or connect runs.
 * - `linkedin.risk_not_accepted` (409): there is no non-revoked risk acceptance for the current
 *   wording version, so the channel cannot be used.
 * - `linkedin.account_not_connected` (409): the account is not `connected` (it needs a login, is
 *   paused, restricted or disconnected).
 * - `linkedin.limit_reached` (429): the account's daily or weekly quota is spent; the send is
 *   deferred to the next window, never dropped silently.
 * - `linkedin.not_account_owner` (403): a Rep tried to disconnect an account that is not theirs.
 * - `linkedin.limit_above_ceiling` (422): a limit is above the system ceiling. The limits schema
 *   flags the same fault with the issue message `linkedin.limit_above_ceiling` on the field, so a
 *   router maps that issue to this code.
 */
export const LINKEDIN_ERRORS = defineErrors('linkedin', {
  channel_disabled: {
    status: 409,
    message: 'The LinkedIn channel is switched off for this Organization.',
  },
  risk_not_accepted: {
    status: 409,
    message: 'An Admin has not accepted the current LinkedIn risk statement.',
  },
  account_not_connected: {
    status: 409,
    message: 'The LinkedIn account is not connected.',
  },
  limit_reached: {
    status: 429,
    message: 'The LinkedIn account has reached its limit for now.',
  },
  not_account_owner: {
    status: 403,
    message: 'Only the Rep who owns this LinkedIn account can do that.',
  },
  limit_above_ceiling: {
    status: 422,
    message: 'A LinkedIn limit is above the maximum Closeline allows.',
  },
})

/** A LinkedIn error code. */
export type LinkedinErrorCode = keyof typeof LINKEDIN_ERRORS
