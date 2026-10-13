import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { documentIdSchema, organizationIdSchema, userIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  documentFailureReasonSchema,
  documentFileNameSchema,
  documentMediaTypeSchema,
  documentStateSchema,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_PAGES,
} from './values'

/**
 * A Playbook document as the service returns it. It names the file but never carries its content,
 * and no text taken from it. `failureReason` is set exactly when `state` is `failed`. `purgeAt` is
 * set exactly when `state` is `deleted`: the time the file and record will be purged
 * (`DOCUMENT_RETENTION_DAYS` after `deletedAt`); a restore is refused after it. `pageCount` is
 * `null` until ingestion has counted the pages. The service must send the output of
 * `documentSchema.parse(row)`, never the row.
 */
export const documentSchema = z
  .object({
    id: documentIdSchema,
    fileName: documentFileNameSchema,
    mediaType: documentMediaTypeSchema,
    sizeBytes: z.number().int().min(1).max(MAX_DOCUMENT_BYTES),
    pageCount: z.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
    state: documentStateSchema,
    failureReason: documentFailureReasonSchema.nullable(),
    deletedAt: timestampSchema.nullable(),
    purgeAt: timestampSchema.nullable(),
    uploadedByUserId: userIdSchema,
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
  })
  .superRefine((document, context) => {
    if ((document.state === 'failed') !== (document.failureReason !== null)) {
      context.addIssue({
        code: 'custom',
        path: ['failureReason'],
        message: 'A failure reason is set exactly when the state is failed',
      })
    }
    const deleted = document.state === 'deleted'
    if (deleted !== (document.deletedAt !== null) || deleted !== (document.purgeAt !== null)) {
      context.addIssue({
        code: 'custom',
        path: ['purgeAt'],
        message: 'A deletion time and a purge time are set exactly when the state is deleted',
      })
    }
  })

/** A Playbook document as the service returns it. */
export type PlaybookDocument = z.infer<typeof documentSchema>

/** The name of the multipart form field that carries the file. */
export const UPLOAD_FILE_FIELD = 'file'

/** The content type of an upload request: `multipart/form-data` with one file part named {@link UPLOAD_FILE_FIELD}. */
export const UPLOAD_CONTENT_TYPE = 'multipart/form-data'

/**
 * What the service reads off the file part of an upload before it stores anything, validated here
 * so the checks are the same everywhere: the `fileName` of the part, the media type the client
 * declared (`declaredMediaType`) (advisory only; the service inspects the content too, because an upload is
 * untrusted data) and the `sizeBytes` counted while reading. The file itself is a multipart part,
 * not a JSON field, and appears in no schema. The request has no other part; it carries an
 * `Idempotency-Key` header (`idempotencyKeySchema`).
 */
export const uploadDocumentFileSchema = z.strictObject({
  fileName: documentFileNameSchema,
  declaredMediaType: z.string().max(255).nullable(),
  sizeBytes: z.number().int().min(1).max(MAX_DOCUMENT_BYTES),
})

/** What the service reads off the file part of an upload. */
export type UploadDocumentFile = z.infer<typeof uploadDocumentFileSchema>

/** The path parameters of a request about one document. */
export const documentParamsSchema = z.strictObject({
  documentId: documentIdSchema,
})

/** The path parameters of a request about one document. */
export type DocumentParams = z.infer<typeof documentParamsSchema>

/**
 * The query parameters of a request to list documents: a page, and optionally one `state`. With
 * no `state`, every document that is not `deleted` is listed; `state=deleted` lists the documents
 * that can still be restored. An unknown parameter is rejected.
 */
export const listDocumentsQuerySchema = pageQuerySchema
  .extend({ state: documentStateSchema.optional() })
  .strict()

/** The query parameters of a request to list documents. */
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>

/** One page of documents. */
export const listDocumentsResponseSchema = pageSchema(documentSchema)

/** One page of documents. */
export type ListDocumentsResponse = z.infer<typeof listDocumentsResponseSchema>

/**
 * Internal: the path parameters of the call that removes everything an Organization has in the
 * Playbook. The Organization is named in the path, never taken from the caller's token.
 */
export const internalRemoveOrganizationDocumentsParamsSchema = z.strictObject({
  organizationId: organizationIdSchema,
})

/** Internal: the path parameters of the remove-everything call. */
export type InternalRemoveOrganizationDocumentsParams = z.infer<
  typeof internalRemoveOrganizationDocumentsParamsSchema
>

/**
 * Internal: `POST /internal/playbook/organizations/{organizationId}/remove-all`, for offboarding
 * and erasure; no caller yet. The body is empty. It cancels ingestion in flight and removes every
 * file, chunk, vector and record the Organization has, soft-deleted documents included, without
 * waiting for retention. It carries an `Idempotency-Key` header and is defined by its end state:
 * it answers success whenever nothing remains when it returns, whether this call, an earlier one
 * or nobody ever stored anything, so a repeat under any key answers the same and success does not
 * mean this call removed anything. It returns no domain error code.
 */
export const internalRemoveOrganizationDocumentsRequestSchema = z.strictObject({})

/** Internal: the body of the remove-everything call. */
export type InternalRemoveOrganizationDocumentsRequest = z.infer<
  typeof internalRemoveOrganizationDocumentsRequestSchema
>

/** Internal: the answer to the remove-everything call: always `removed`. */
export const internalRemoveOrganizationDocumentsResponseSchema = z.object({
  organizationId: organizationIdSchema,
  status: z.literal('removed'),
})

/** Internal: the answer to the remove-everything call. */
export type InternalRemoveOrganizationDocumentsResponse = z.infer<
  typeof internalRemoveOrganizationDocumentsResponseSchema
>
