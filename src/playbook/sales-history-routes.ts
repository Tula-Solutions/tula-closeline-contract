import type { CommonErrorCode } from '../errors'
import type { Role } from '../tenancy'
import { PLAYBOOK_WRITE_ROLES } from './routes'
import type { SalesHistoryErrorCode } from './sales-history-errors'

/** The roles that may read Calls, Deals, imports and the rights confirmation: Owner and Admin only, the owner's decision of 2026-10-13 (the writers are the same two roles). Managers and Reps get `auth.forbidden`. */
export const SALES_HISTORY_READ_ROLES = PLAYBOOK_WRITE_ROLES

/** The sales-history routes, by name. */
export type SalesHistoryRouteName =
  | 'uploadCall'
  | 'listCalls'
  | 'getCall'
  | 'deleteCall'
  | 'restoreCall'
  | 'setCallRep'
  | 'listDeals'
  | 'getDeal'
  | 'lookupDeal'
  | 'setDealOutcome'
  | 'uploadDealImport'
  | 'listDealImports'
  | 'getDealImport'
  | 'listDealImportRows'
  | 'getRightsConfirmation'
  | 'confirmRights'

/**
 * What the service needs to describe one sales-history route. It has the shape of `PlaybookRoute`
 * but its own method list (it adds `PUT`) and its own error codes, so the 0.7.0 `PlaybookRoute`
 * type is not widened. Use `ALL_PLAYBOOK_ROUTES` for both tables in one map.
 */
export type SalesHistoryRoute = {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  readonly path: string
  /** True for a route on the internal network only; none of these is. */
  readonly internal: boolean
  /** The roles allowed. Any other role is the common `auth.forbidden`. */
  readonly roles: readonly Role[]
  /** The success statuses, the first being the usual one. */
  readonly success: readonly number[]
  /** The domain codes the route may return, beyond the common ones. */
  readonly errors: readonly SalesHistoryErrorCode[]
  /** The common codes the route may return, beyond those every route may. */
  readonly commonErrors: readonly CommonErrorCode[]
  /** The description for the OpenAPI document, role rules included. */
  readonly description: string
}

const route = (definition: SalesHistoryRoute): SalesHistoryRoute => Object.freeze(definition)

const ENVELOPE_ERRORS = [
  'request.invalid',
  'request.too_large',
  'request.unsupported_media_type',
  'request.idempotency_key_reused',
  'request.idempotency_in_progress',
] as const

/**
 * The sales-history routes (ADR 0018), described as `PLAYBOOK_ROUTES` describes the document
 * routes: method, path, roles, success statuses, domain error codes and the OpenAPI description.
 * Every route may also return the common `auth.*`, `rate.limited` and `server.*` codes. A route on
 * another Organization's Call, Deal or import answers the not-found code. No response carries a
 * Transcript, audio or a turn. Reads are Owner and Admin only ({@link SALES_HISTORY_READ_ROLES}).
 */
export const SALES_HISTORY_ROUTES: Readonly<Record<SalesHistoryRouteName, SalesHistoryRoute>> =
  Object.freeze({
    uploadCall: route({
      method: 'POST',
      path: '/playbook/calls',
      internal: false,
      roles: PLAYBOOK_WRITE_ROLES,
      success: [201, 200],
      errors: [
        'rights.confirmation_required',
        'call.unsupported_type',
        'call.too_large',
        'call.quota_exceeded',
        'call.rep_invalid',
        'call.content_in_other_deal',
      ],
      commonErrors: [...ENVELOPE_ERRORS],
      description:
        'Uploads one Call as a Transcript (txt, vtt, srt or json, up to 5 MB) or a Recording (mp3, m4a, wav, ogg, webm or flac, up to 500 MB, streamed to storage and never held whole), as multipart/form-data with one file part named "file" and the text fields "dealId" and "rep". Owner and Admin only; Managers and Reps get auth.forbidden. A Transcript needs "rep", the JSON {"by":"speaker","label":...}; a per-side Recording takes {"by":"channel","channel":"left"|"right"}; a Recording with no "rep" waits in state "awaiting_rep" after transcription until an Owner or Admin picks one. A Deal that does not exist yet is created "open". Refused with rights.confirmation_required (403, its details name the wording version to show) until the Organization has a current rights confirmation. The type and size of the file part are checked before anything is stored: call.unsupported_type (415) and call.too_large (413); a malformed name, an empty file or a bad field is request.invalid, and a Rep choice that does not suit the kind is call.rep_invalid. The common request.too_large and request.unsupported_media_type apply to the whole request instead. Answers 201 with the new Call in state "uploaded". If the content matches a Call the Organization already has under the same Deal, answers 200 with that stored Call: a match on a "deleted" Call restores it (state "processing") and a match on a "failed" Call under the same Deal whose failureReason is transcription_failed, transcription_timed_out or processing_failed (reasons that can be transient) re-queues it for processing (state "uploaded"); a match on a failed Call with any other reason answers 200 with the failed Call unchanged, because the same file would fail the same way: rep_label_not_found and not_per_side are fixed by changing the Rep, and too_many_speakers, no_turns, too_few_speakers, too_long and unreadable by choosing to delete the Call and upload a corrected file; any other match returns the Call as it is. The same content under another deal id is call.content_in_other_deal. A recording over 3 hours, a Transcript with no turns or fewer than two speakers, or a Rep label not in the file is not checked here: the Call ends in state "failed" with a failureReason. Accepts an Idempotency-Key header.',
    }),
    listCalls: route({
      method: 'GET',
      path: '/playbook/calls',
      internal: false,
      roles: SALES_HISTORY_READ_ROLES,
      success: [200],
      errors: [],
      commonErrors: ['request.invalid'],
      description:
        "Lists the Organization's Calls, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only. Deleted Calls are left out unless state=deleted is asked for; state=awaiting_rep lists the Calls waiting for a Rep and dealRecordId (the opaque Deal id) limits the list to one Deal.",
    }),
    getCall: route({
      method: 'GET',
      path: '/playbook/calls/{callId}',
      internal: false,
      roles: SALES_HISTORY_READ_ROLES,
      success: [200],
      errors: ['call.not_found'],
      commonErrors: ['request.invalid'],
      description:
        'Reads one Call and its state, with the failure reason when it failed, the speaker labels to pick a Rep from and the purge time when it was deleted. For a Recording with speaker labels, above all one awaiting its Rep, it also returns speakers: a short excerpt per label (the first turns of the speaker, at most 240 characters, cut at a word boundary with an ellipsis; at most 20 speakers) so a person can tell who is the Rep. The excerpts are tenant Transcript text: returned only to the Owner and Admin of the owning Organization and never logged. No other Transcript text or audio is returned. Owner and Admin only.',
    }),
    deleteCall: route({
      method: 'DELETE',
      path: '/playbook/calls/{callId}',
      internal: false,
      roles: PLAYBOOK_WRITE_ROLES,
      success: [200],
      errors: ['call.not_found'],
      commonErrors: ['request.invalid'],
      description:
        'Soft-deletes a Call: it and its Moments are hidden from search at once and purged after 30 days, and it can be restored until then. Owner and Admin only. Idempotent by end state: answers 200 with the Call in state "deleted" and its purge time, and deleting an already deleted Call answers the same. Takes no body.',
    }),
    restoreCall: route({
      method: 'POST',
      path: '/playbook/calls/{callId}/restore',
      internal: false,
      roles: PLAYBOOK_WRITE_ROLES,
      success: [200],
      errors: ['call.not_found', 'call.not_restorable'],
      commonErrors: ['request.invalid'],
      description:
        'Restores a soft-deleted Call within the retention period; it is processed again from the kept Transcript (a Recording is never transcribed twice) and shows as "processing". Owner and Admin only. Idempotent by end state: a Call that is no longer deleted answers 200 with the Call as it is. A deleted Call whose purge time has passed but which the purge has not yet removed is call.not_restorable (410); once purged the record is gone and the answer is call.not_found (404). Takes no body.',
    }),
    setCallRep: route({
      method: 'PUT',
      path: '/playbook/calls/{callId}/rep',
      internal: false,
      roles: PLAYBOOK_WRITE_ROLES,
      success: [200],
      errors: ['call.not_found', 'call.rep_invalid', 'call.rep_not_changeable'],
      commonErrors: ['request.invalid'],
      description:
        'Picks the Rep of a Call waiting in "awaiting_rep", or changes the Rep of a "ready" Call or a "failed" Call whose failureReason is rep_label_not_found or not_per_side, with {"rep":{"by":"speaker","label":...}} or {"rep":{"by":"channel","channel":...}}. Owner and Admin only, and any of them may pick, not only the uploader. A choice that does not suit the Call, or a label that is not among its speakers, is call.rep_invalid; a Call in any other state or with any other failure reason is call.rep_not_changeable. A different Rep answers 200 with the Call in state "processing": its Moments are rebuilt by a queued job and the Call is out of search until it finishes. Idempotent by end state: choosing the Rep the Call already has changes nothing and answers 200 with the Call as it is.',
    }),
    listDeals: route({
      method: 'GET',
      path: '/playbook/deals',
      internal: false,
      roles: SALES_HISTORY_READ_ROLES,
      success: [200],
      errors: [],
      commonErrors: ['request.invalid'],
      description:
        "Lists the Organization's Deals, newest first (sorted by createdAt, then id, the opaque Deal id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only. outcome limits the list to one Outcome and appearedInImport=false lists the Deals that have Calls but never appeared in a CSV, so a mistyped deal id is visible.",
    }),
    getDeal: route({
      method: 'GET',
      path: '/playbook/deals/{dealRecordId}',
      internal: false,
      roles: SALES_HISTORY_READ_ROLES,
      success: [200],
      errors: ['deal.not_found'],
      commonErrors: ['request.invalid'],
      description:
        'Reads one Deal by its opaque id (the deal_ id from a list or a lookup, never the customer deal id, which is found with the lookup route). Owner and Admin only. A Deal cannot be deleted on its own.',
    }),
    lookupDeal: route({
      method: 'POST',
      path: '/playbook/deals/lookup',
      internal: false,
      roles: SALES_HISTORY_READ_ROLES,
      success: [200],
      errors: ['deal.not_found'],
      commonErrors: ['request.invalid'],
      description:
        'Finds a Deal by the customer deal id, sent in the JSON body {"dealId":...} so it never appears in a URL, a query string or a cursor (trimmed, otherwise exact and case-sensitive). Answers 200 with the Deal, whose opaque id is then used in every path, or deal.not_found. Owner and Admin only. It changes nothing.',
    }),
    setDealOutcome: route({
      method: 'PUT',
      path: '/playbook/deals/{dealRecordId}/outcome',
      internal: false,
      roles: PLAYBOOK_WRITE_ROLES,
      success: [200],
      errors: ['deal.not_found'],
      commonErrors: ['request.invalid'],
      description:
        "Sets or corrects a Deal's Outcome (won, lost or open), even a decided one. Owner and Admin only. Idempotent by end state. A change bumps the Deal's Outcome sequence and queues the re-tag of its Moments; search follows the database at once for a lost Deal and may lag for a Deal that has just become won.",
    }),
    uploadDealImport: route({
      method: 'POST',
      path: '/playbook/deal-imports',
      internal: false,
      roles: PLAYBOOK_WRITE_ROLES,
      success: [202],
      errors: [
        'deal_import.unsupported_type',
        'deal_import.too_large',
        'deal_import.header_invalid',
        'deal_import.busy',
      ],
      commonErrors: [...ENVELOPE_ERRORS],
      description:
        'Uploads the fixed CSV template (columns deal_id, outcome, closed_at, amount, currency and optionally name; closed_at is a plain YYYY-MM-DD date, kept as written, and a value with a time or an offset is a rejected row with the reason invalid_closed_at; up to 10 MB and 50,000 rows) as multipart/form-data with one file part named "file". Owner and Admin only. The type, size and first row are checked before anything is stored: deal_import.unsupported_type (415), deal_import.too_large (413) and deal_import.header_invalid (422). An Organization with MAX_QUEUED_DEAL_IMPORTS (5) imports not yet finished (state uploaded or processing) is refused with deal_import.busy (429) and nothing is stored; the count is checked before the file is stored, so a refused upload leaves no import. The header is read with checkDealImportHeaderText (the same reader and limits as parseCsv) on the first 8192 characters of the file (a header still unfinished there is deferred to the job, not refused), and the job re-checks the header of its full parse with the same verdict. The rest of the file is parsed in the background job, never on the request path, under strict RFC 4180 quoting: a stray quote fails the file, and a cell over 1000 characters fails the whole file too (a cell up to 1000 characters is checked row by row, and a bad one is a rejected row); blank lines at the end of the file are ignored, and an interior blank line is a rejected row with the reason blank_row, so the report has no gap, and it still counts in the row numbers, and rowNumber is the record number with the header as record 1. Answers 202 with the import in state "uploaded"; it is processed in the background. Imports are not deduplicated by content: each upload is a new import, and only the Idempotency-Key makes a retry of the same request answer with the stored import. Valid rows are applied and bad rows are reported, never dropped: a deal id already won or lost, or repeated within the file, is a rejected row in the report, not an HTTP error. A file with more rows than the limit, a cell over the length limit or a quoting error ends in state "failed" with failureReason "too_many_rows" or "unreadable". Accepts an Idempotency-Key header.',
    }),
    listDealImports: route({
      method: 'GET',
      path: '/playbook/deal-imports',
      internal: false,
      roles: SALES_HISTORY_READ_ROLES,
      success: [200],
      errors: [],
      commonErrors: ['request.invalid'],
      description:
        "Lists the Organization's Deal imports, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only.",
    }),
    getDealImport: route({
      method: 'GET',
      path: '/playbook/deal-imports/{importId}',
      internal: false,
      roles: SALES_HISTORY_READ_ROLES,
      success: [200],
      errors: ['deal_import.not_found'],
      commonErrors: ['request.invalid'],
      description:
        'Reads one import: its state, failure reason and the counts of rows, applied rows and rejected rows. Owner and Admin only.',
    }),
    listDealImportRows: route({
      method: 'GET',
      path: '/playbook/deal-imports/{importId}/rows',
      internal: false,
      roles: SALES_HISTORY_READ_ROLES,
      success: [200],
      errors: ['deal_import.not_found'],
      commonErrors: ['request.invalid'],
      description:
        'Reads the report of an import, in CSV order, one cursor-paginated page at a time (at most 100); result=rejected lists only the rows that need fixing. Each row has its row number (the header is row 1), the deal id when it was valid, the result and a reason code. No other cell is returned. Owner and Admin only.',
    }),
    getRightsConfirmation: route({
      method: 'GET',
      path: '/playbook/rights-confirmation',
      internal: false,
      roles: SALES_HISTORY_READ_ROLES,
      success: [200],
      errors: [],
      commonErrors: [],
      description:
        "Reads the Organization's recorded confirmation that it may share Recordings and Transcripts, with who confirmed and when, the version of the wording they saw, the current wording version, optionally the text of that version (also in RIGHTS_WORDINGS) and whether the stored one is current. Owner and Admin only. Without a current confirmation, uploads of Calls are refused; existing Calls are kept and stay searchable.",
    }),
    confirmRights: route({
      method: 'PUT',
      path: '/playbook/rights-confirmation',
      internal: false,
      roles: PLAYBOOK_WRITE_ROLES,
      success: [200],
      errors: ['rights.version_outdated'],
      commonErrors: ['request.invalid'],
      description:
        'Records the confirmation, with the wording version the member was shown, which must be the current one (else rights.version_outdated, 409). Owner and Admin only. Who confirmed and when come from the token and the clock, never from the body. Idempotent by end state: confirming the current version again changes nothing. A lawyer is to check the wording before real customers use it.',
    }),
  })
