import { defineErrors } from '../errors'

/**
 * The errors the playbook service returns, as `area.reason` codes. No body carries a file name,
 * file content or text taken from a document: every message is fixed. A role that is not allowed
 * is the common `auth.forbidden`; a malformed multipart body is the common `request.invalid`.
 * `document.too_many_pages` is also a failure reason (`too_many_pages`): the page count is checked
 * in the ingestion job, so a client sees it as a failed document, not as an upload response; the
 * code exists for a service that checks earlier. `document.not_restorable` (410) is a document
 * whose retention ended and whose file is gone, and is never `document.not_found`.
 */
export const PLAYBOOK_ERRORS = {
  ...defineErrors('document', {
    not_found: { status: 404, message: 'The document was not found.' },
    unsupported_type: { status: 415, message: 'This file type is not supported.' },
    too_large: { status: 413, message: 'The file is larger than the upload limit.' },
    too_many_pages: { status: 422, message: 'The document has more pages than the limit.' },
    quota_exceeded: {
      status: 409,
      message: 'The Organization has reached its document limit.',
    },
    not_deleted: { status: 409, message: 'The document has not been deleted.' },
    not_restorable: {
      status: 410,
      message: 'The document was purged after its retention period and cannot be restored.',
    },
  }),
} as const

/** A code from the {@link PLAYBOOK_ERRORS} registry. */
export type PlaybookErrorCode = keyof typeof PLAYBOOK_ERRORS
