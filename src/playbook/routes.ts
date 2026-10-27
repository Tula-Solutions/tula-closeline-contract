import type { InboundRoute } from '../inbound-route'
import type { Role } from '../tenancy'
import type { PlaybookErrorCode } from './errors'

/** The roles that may change the Playbook (ADR 0016, choice 4). */
export const PLAYBOOK_WRITE_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The roles that may list and read documents: every role (ADR 0016, choice 4). */
export const PLAYBOOK_READ_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The playbook routes, by name. */
export type PlaybookRouteName =
  | 'uploadDocument'
  | 'listDocuments'
  | 'getDocument'
  | 'deleteDocument'
  | 'restoreDocument'
  | 'removeOrganizationDocuments'

/** What the service needs to describe one route: its method, path, who may call it, what it answers. */
export type PlaybookRoute = Omit<
  InboundRoute<PlaybookErrorCode>,
  | 'public'
  | 'serviceToken'
  | 'etag'
  | 'publicApi'
  | 'keyRequired'
  | 'idempotent'
  | 'method'
  | 'internal'
> & {
  readonly method: 'GET' | 'POST' | 'DELETE'
  /** True for a route on the internal network only; it takes no role and names the Organization in the path. */
  readonly internal: boolean
}

const route = (definition: PlaybookRoute): PlaybookRoute => Object.freeze(definition)

/**
 * The playbook routes: the description a service puts in its OpenAPI document, the roles, the
 * success statuses and every error code each route may answer with. Every route may also return
 * the common `auth.*`, `rate.limited` and `server.*` codes. A route on another Organization's
 * document answers `document.not_found`.
 */
export const PLAYBOOK_ROUTES: Readonly<Record<PlaybookRouteName, PlaybookRoute>> = Object.freeze({
  uploadDocument: route({
    method: 'POST',
    path: '/playbook/documents',
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [201, 200],
    errors: ['document.unsupported_type', 'document.too_large', 'document.quota_exceeded'],
    commonErrors: [
      'request.invalid',
      'request.too_large',
      'request.unsupported_media_type',
      'request.idempotency_key_reused',
      'request.idempotency_in_progress',
    ],
    description:
      'Uploads one file (multipart/form-data, one part named "file") to the Organization\'s Playbook. Owner and Admin only; Managers and Reps get auth.forbidden. The type and size of the file part are checked before anything is stored: document.unsupported_type (415) and document.too_large (413); a malformed name or an empty file is request.invalid. The common request.too_large and request.unsupported_media_type apply to the whole request instead: a body over the envelope limit, or a body that is not multipart. Answers 201 with the new document in state "uploaded". If the content matches a document the Organization already has, answers 200 with that stored document, with its stored fileName (not the new upload\'s name), so a duplicate is an answer, not an error: a match on a "deleted" document restores it (state "processing"), and a match on a "failed" document re-queues it for processing and answers with state "uploaded". The page limit is not checked here: a document over it ends in state "failed" with failureReason "too_many_pages". Accepts an Idempotency-Key header.',
  }),
  listDocuments: route({
    method: 'GET',
    path: '/playbook/documents',
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      "Lists the Organization's documents, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner, Admin, Manager and Rep may read. Soft-deleted documents are left out unless state=deleted is asked for.",
  }),
  getDocument: route({
    method: 'GET',
    path: '/playbook/documents/{documentId}',
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: ['document.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Reads one document and its state, with the failure reason when it failed and the purge time when it was deleted. Owner, Admin, Manager and Rep may read.',
  }),
  deleteDocument: route({
    method: 'DELETE',
    path: '/playbook/documents/{documentId}',
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ['document.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Soft-deletes a document: it is hidden at once and purged after the retention period, and can be restored until then. Owner and Admin only. Idempotent by end state: answers 200 with the document in state "deleted" and its purge time, and deleting an already deleted document answers the same. Takes no body.',
  }),
  restoreDocument: route({
    method: 'POST',
    path: '/playbook/documents/{documentId}/restore',
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ['document.not_found', 'document.not_restorable'],
    commonErrors: ['request.invalid'],
    description:
      'Restores a soft-deleted document within the retention period; it is re-ingested from the kept file and shows as "processing". Owner and Admin only. Idempotent by end state: a document that is no longer deleted (restored by an earlier call, or never deleted) answers 200 with the document as it is. A deleted document whose purge time has passed but which the purge has not yet removed is document.not_restorable (410); once purged the record is gone and the answer is document.not_found (404). Takes no body.',
  }),
  removeOrganizationDocuments: route({
    method: 'POST',
    path: '/internal/playbook/organizations/{organizationId}/remove-all',
    internal: true,
    roles: [],
    success: [200],
    errors: [],
    commonErrors: [
      'request.invalid',
      'request.idempotency_key_reused',
      'request.idempotency_in_progress',
      'server.unavailable',
    ],
    description:
      'Internal, for offboarding and erasure; no caller yet. Removes every document, file, chunk and vector an Organization has, and, since ADR 0018, its Calls, Recordings, Transcripts, Moments, Deals and Deal imports (and the copy the transcription vendor holds of a Recording), soft-deleted ones included, without waiting for retention. Idempotent by end state: it answers 200 whenever nothing remains, and never answers 200 while data remains. A transient failure (the store, the vector index or the vendor is briefly unreachable) answers 503 server.unavailable with a Retry-After header, and a repeat with the same Idempotency-Key or without reaches 200 once the removal finishes; a failure that will not go away stays an error. Served on the internal network only; takes the Organization from the path.',
  }),
})
