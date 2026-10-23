import { defineErrors } from '../errors'

/**
 * The errors the enrichment, signal and fit routes return, as `area.reason` codes. A role that is
 * not allowed is the common `auth.forbidden`. A Prospect, run, run set, signal or criterion outside
 * the caller's view is its `*_not_found` (404, never 403), so existence is not revealed; one of
 * another Organization the same.
 *
 * - `enrichment.budget_exceeded` (429): the Organization's monthly enrichment budget is spent, so
 *   no run was made. A run that reaches the budget while running ends `stopped` with its reason
 *   instead, and the call that would pass it is not made.
 * - `enrichment.provider_unavailable` (503): no provider is enabled with a key for a group asked
 *   for, so nothing was queued.
 * - `enrichment.prospect_not_found` (404): unknown Prospect, or not the caller's to see.
 * - `enrichment.verification_failed` (422): email verification was asked for and the Prospect has
 *   no address the verifier can check.
 * - `enrichment.run_not_found` (404): unknown run, or not the caller's to see.
 * - `enrichment.run_set_not_found` (404): unknown run set, or not the caller's to see.
 * - `enrichment.provider_unknown` (404): the provider key names no provider this deployment has.
 * - `enrichment.invalid_waterfall` (422): the provider order lists a provider unknown to the
 *   deployment or one that cannot serve that group.
 * - `enrichment.version_conflict` (409): the provider order or budget was saved since the caller
 *   read it.
 * - `signal.invalid` (422): the signal fails a rule across fields (a time in the future, for one).
 * - `signal.not_found` (404): unknown signal, or not the caller's to see.
 * - `signal.webhook_unauthorized` (401): the webhook signature, timestamp or Organization did not
 *   check out; nothing was read or recorded and nothing says which.
 * - `fit.invalid_criteria` (422): the criteria fail a rule (a duplicate name, an operator that
 *   does not suit the attribute, more than 50 criteria).
 * - `fit.criterion_not_found` (404): unknown criterion.
 */
export const ENRICHMENT_ERRORS = {
  ...defineErrors('enrichment', {
    budget_exceeded: { status: 429, message: 'The enrichment budget for this month is spent.' },
    provider_unavailable: {
      status: 503,
      message: 'No enrichment provider is available for this request.',
    },
    prospect_not_found: { status: 404, message: 'The Prospect was not found.' },
    verification_failed: {
      status: 422,
      message: 'There is no email address on this Prospect that can be verified.',
    },
    run_not_found: { status: 404, message: 'The enrichment run was not found.' },
    run_set_not_found: { status: 404, message: 'The enrichment request was not found.' },
    provider_unknown: { status: 404, message: 'There is no such provider.' },
    invalid_waterfall: { status: 422, message: 'The provider order is not valid.' },
    version_conflict: {
      status: 409,
      message: 'This changed since it was read. Reload it and try again.',
    },
  }),
  ...defineErrors('signal', {
    invalid: { status: 422, message: 'The signal is not valid.' },
    not_found: { status: 404, message: 'The signal was not found.' },
    webhook_unauthorized: { status: 401, message: 'The webhook request is not authorised.' },
  }),
  ...defineErrors('fit', {
    invalid_criteria: { status: 422, message: 'The fit criteria are not valid.' },
    criterion_not_found: { status: 404, message: 'The fit criterion was not found.' },
  }),
} as const

/** An error code the enrichment, signal and fit routes return. */
export type EnrichmentErrorCode = keyof typeof ENRICHMENT_ERRORS
