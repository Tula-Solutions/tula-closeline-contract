import { defineErrors } from '../errors'

/**
 * The errors the CRM routes return, as `area.reason` codes (ADR 0022). A role that is not allowed
 * is the common `auth.forbidden`. An unknown sync run, or one of another Organization, is the
 * common `request.not_found` (404, never 403). No message ever names another Organization.
 *
 * - `crm.not_connected` (404): the Organization has no CRM connection for this provider, so there is
 *   nothing to read, change, sync or disconnect. Reading the status is not an error: it answers
 *   `not_connected` as a state.
 * - `crm.authorisation_failed` (400): the sign-in with the CRM did not complete: the `state` was
 *   tampered with, expired, already used or belongs to another Organization, the Admin denied
 *   consent, or the CRM account is already held by another Organization. One generic message; it
 *   never says which of these it was.
 * - `crm.needs_reconnect` (409): the CRM revoked or expired the grant, so runs are stopped until an
 *   Owner or Admin connects again.
 * - `crm.rate_limited` (429): the CRM's own rate limit was hit. A sync run backs off and resumes
 *   without losing its place, so this is shown, never fatal; a direct call carries `Retry-After`.
 * - `crm.mapping_incomplete` (409): no Admin-confirmed Stage mapping, or it leaves a stage of the
 *   CRM unmapped, so no Deal is imported.
 * - `crm.rights_not_confirmed` (409): the Organization has not confirmed it may share Recordings and
 *   Transcripts (ADR 0018, choice 12), so Calls are not pulled.
 */
export const CRM_ERRORS = defineErrors('crm', {
  not_connected: { status: 404, message: 'The CRM is not connected.' },
  authorisation_failed: { status: 400, message: 'The CRM could not be connected.' },
  needs_reconnect: { status: 409, message: 'The CRM connection needs to be reconnected.' },
  rate_limited: { status: 429, message: 'The CRM is limiting requests. Try again later.' },
  mapping_incomplete: {
    status: 409,
    message: 'Confirm the Stage mapping for every deal stage before Deals are imported.',
  },
  rights_not_confirmed: {
    status: 409,
    message: 'Confirm the right to share Recordings and Transcripts before Calls are imported.',
  },
})

/** A CRM error code. */
export type CrmErrorCode = keyof typeof CRM_ERRORS
