import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { documentIdSchema } from '../ids'

/*
 * Queue messages of the playbook service. Each is exported as the pieces the kit's
 * `defineMessage` takes, `{ type, version, scope, payload }`, so the service registers it with
 * `defineMessage(DOCUMENT_UPLOADED_MESSAGE)` and this library does not depend on kit. The
 * Organization id is in the envelope (`scope: 'organization'`), never in a payload. A payload
 * names a document by id only: no file name, content or text.
 */

/** The payload of {@link DOCUMENT_UPLOADED_MESSAGE}: the document to ingest. */
export const documentUploadedPayloadSchema = z.strictObject({
  documentId: documentIdSchema,
})

/** The payload of {@link DOCUMENT_UPLOADED_MESSAGE}. */
export type DocumentUploadedPayload = z.infer<typeof documentUploadedPayloadSchema>

/**
 * The message that starts ingestion of a document: published after an upload is stored, and again
 * when a soft-deleted document is restored (it is re-ingested from the kept file). The job is
 * idempotent and resumable, keyed on the document.
 */
export const DOCUMENT_UPLOADED_MESSAGE = {
  type: 'playbook.document_uploaded',
  version: 1,
  scope: 'organization',
  payload: documentUploadedPayloadSchema,
} as const

/**
 * The payload of {@link DOCUMENT_DELETED_MESSAGE}: the document and the time of the deletion this
 * cleanup was queued for, so the job does nothing if the document was restored (or deleted again
 * later) since.
 */
export const documentDeletedPayloadSchema = z.strictObject({
  documentId: documentIdSchema,
  deletedAt: timestampSchema,
})

/** The payload of {@link DOCUMENT_DELETED_MESSAGE}. */
export type DocumentDeletedPayload = z.infer<typeof documentDeletedPayloadSchema>

/**
 * The message that queues the removal of a deleted document's vectors, published by the delete
 * request. It is cleanup only: search hides a deleted document by its state, never by this job.
 */
export const DOCUMENT_DELETED_MESSAGE = {
  type: 'playbook.document_deleted',
  version: 1,
  scope: 'organization',
  payload: documentDeletedPayloadSchema,
} as const
