import { z } from 'zod'
import { defineErrors } from '../errors'
import { MAX_RIGHTS_WORDING_VERSION } from './rights'

/**
 * The errors the sales-history routes return, as `area.reason` codes. No body carries a file name,
 * a deal id, a speaker label or text from a Call: every message is fixed. A role that is not
 * allowed is the common `auth.forbidden`.
 *
 * - A second upload of the same Call under the same Deal is an answer (200, the stored Call), as
 *   for a document in ADR 0016, so it has no code; the same content under another Deal id is
 *   `call.content_in_other_deal`, and the answer does not say which Deal.
 * - A recording longer than `MAX_RECORDING_SECONDS` and a page-less Transcript with no turns are
 *   found by the job, so they are failure reasons on the Call, not codes.
 * - A CSV row that fails (including an Outcome already decided) is a row result in the import
 *   report, never an HTTP error.
 * - `call.quota_exceeded` covers the number of Calls, the Recording bytes and the number of Deals,
 *   and says deleted Calls count until purged.
 * - `call.not_restorable` (410) is for a deleted Call past its purge time that the purge has not
 *   yet removed; once purged the answer is `call.not_found` (404).
 * - `rights.confirmation_required` (403) carries `details` of {@link rightsRequiredDetailsSchema},
 *   so the portal knows which version of the wording to show.
 */
export const SALES_HISTORY_ERRORS = {
  ...defineErrors('call', {
    not_found: { status: 404, message: 'The Call was not found.' },
    unsupported_type: { status: 415, message: 'This file type is not supported.' },
    too_large: { status: 413, message: 'The file is larger than the upload limit.' },
    quota_exceeded: {
      status: 409,
      message:
        'The Organization has reached its limit on Calls, Recordings or Deals. Deleted Calls count until they are purged.',
    },
    content_in_other_deal: {
      status: 409,
      message: 'This Call was already uploaded for a different Deal.',
    },
    rep_invalid: { status: 422, message: 'The Rep choice is not valid for this Call.' },
    rep_not_changeable: {
      status: 409,
      message: 'The Rep of this Call cannot be changed in its current state.',
    },
    not_restorable: {
      status: 410,
      message: 'The Call was purged after its retention period and cannot be restored.',
    },
  }),
  ...defineErrors('deal', {
    not_found: { status: 404, message: 'The Deal was not found.' },
  }),
  ...defineErrors('deal_import', {
    not_found: { status: 404, message: 'The import was not found.' },
    unsupported_type: { status: 415, message: 'This file type is not supported.' },
    too_large: { status: 413, message: 'The file is larger than the upload limit.' },
    header_invalid: {
      status: 422,
      message: 'The first row does not match the template.',
    },
    busy: {
      status: 429,
      message: 'Too many imports are waiting. Try again when some have finished.',
    },
  }),
  ...defineErrors('rights', {
    confirmation_required: {
      status: 403,
      message: 'Confirm that your Organization may share these Calls before uploading them.',
    },
    version_outdated: {
      status: 409,
      message: 'The confirmation wording has changed. Reload and confirm the current version.',
    },
  }),
} as const

/** A code from the {@link SALES_HISTORY_ERRORS} registry. */
export type SalesHistoryErrorCode = keyof typeof SALES_HISTORY_ERRORS

/** The `details` of a `rights.confirmation_required` body: the version of the wording the portal must show. */
export const rightsRequiredDetailsSchema = z.strictObject({
  wordingVersion: z.number().int().min(1).max(MAX_RIGHTS_WORDING_VERSION),
})

/** The `details` of a `rights.confirmation_required` body. */
export type RightsRequiredDetails = z.infer<typeof rightsRequiredDetailsSchema>
