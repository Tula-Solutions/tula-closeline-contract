import { defineErrors } from '../errors'

/**
 * The errors the audit routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`.
 *
 * - `audit.range_too_large` (422): the time range of a filtered read or CSV spans more than 366
 *   days, or `from` is after `to`.
 * - `audit.event_not_found` (404): unknown event, or not in the caller's view (a Manager sees only
 *   events about Prospects of their Team); one of another Organization the same, never 403.
 */
export const AUDIT_ERRORS = defineErrors('audit', {
  range_too_large: {
    status: 422,
    message: 'The time range is too large. Ask for 366 days or fewer.',
  },
  event_not_found: { status: 404, message: 'The audit event was not found.' },
})

/** An audit error code. */
export type AuditErrorCode = keyof typeof AUDIT_ERRORS
