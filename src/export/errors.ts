import { defineErrors } from '../errors'

/**
 * The errors the export routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`. An export of another Organization is `export.not_found` (404, never 403).
 *
 * - `export.already_running` (409): a job is queued or running for the Organization.
 * - `export.daily_limit` (429): two exports were already requested in the last 24 hours.
 * - `export.not_found` (404): unknown export, or not the caller's Organization's.
 * - `export.not_ready` (409): the export has not finished or has failed, so there is nothing to download.
 * - `export.expired` (410): the files were removed after 24 hours; request a new export.
 */
export const EXPORT_ERRORS = defineErrors('export', {
  already_running: { status: 409, message: 'An export is already running.' },
  daily_limit: { status: 429, message: 'The daily limit of exports was reached. Try again later.' },
  not_found: { status: 404, message: 'The export was not found.' },
  not_ready: { status: 409, message: 'The export is not ready to download.' },
  expired: { status: 410, message: 'The export has expired. Request a new one.' },
})

/** An export error code. */
export type ExportErrorCode = keyof typeof EXPORT_ERRORS
