import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { documentIdSchema, organizationIdSchema, userIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  documentFailureReasonSchema,
  documentFileNameSchema,
  documentMediaTypeSchema,
  documentSizeCheckSchema,
  documentStateSchema,
  documentTypeCheckSchema,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_PAGES,
} from './values'

/**
 * A Playbook document as the service returns it. It names the file but never carries its content,
 * and no text taken from it. The extension of `fileName` and `mediaType` are not checked against each other: that agreement is
 * the service's job, as only it knows the declared and the detected type, and the contract does
 * not enforce it. `failureReason` is set exactly when `state` is `failed`. `purgeAt` is
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
 * What the service reads off the file part of an upload before it stores anything: the
 * `fileName` of the part, the media type the client declared (`declaredMediaType`, advisory only;
 * the service inspects the content too, because an upload is untrusted data) and the `sizeBytes`
 * counted while reading. The file itself is a multipart part, not a JSON field, and appears in no
 * schema. The request has no other part; it carries an `Idempotency-Key` header.
 *
 * This schema checks only shape (a well-formed name, a non-empty file) and a failure is
 * `request.invalid` (400). A service calls {@link checkUploadFile}, which runs it after the size
 * and type checks so each gets its own code.
 */
export const uploadDocumentFileSchema = z.strictObject({
  fileName: documentFileNameSchema,
  declaredMediaType: z.string().max(255).nullable(),
  sizeBytes: z.number().int().min(1),
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

const UPLOAD_FILE_KEYS: readonly string[] = ['fileName', 'declaredMediaType', 'sizeBytes']

/** The answer of {@link checkUploadFile}: the parsed file, or the one error code to return. */
export type CheckUploadFileResult =
  | { readonly ok: true; readonly file: UploadDocumentFile }
  | {
      readonly ok: false
      readonly code: 'document.too_large' | 'document.unsupported_type' | 'request.invalid'
    }

/**
 * The one call that checks the file part of an upload, so a service cannot skip a step. It runs
 * the size check first (`document.too_large`, 413, so an over-size `.exe` is only too large), then
 * the type check on the stored form of the name (`document.unsupported_type`, 415: the extension
 * is judged after control and bidirectional characters are stripped and the name is trimmed, so
 * `report.pdf ` is accepted and stored as `report.pdf`), then the shape
 * ({@link uploadDocumentFileSchema}, `request.invalid`, 400). Input that is not an object with a
 * string name and a finite numeric size (so `NaN` and the infinities too), or that has an own key
 * other than the three, is `request.invalid`. Each field is read once, as an own property, into a
 * copy that all three checks use, so a changing getter or an inherited property cannot pass a check
 * the parsed value would fail. On success `file` is the parsed form, with
 * the stored name. The result carries no name or content, so it is safe to log and to return.
 */
export function checkUploadFile(input: unknown): CheckUploadFileResult {
  const invalid = { ok: false, code: 'request.invalid' } as const
  if (typeof input !== 'object' || input === null) {
    return invalid
  }
  // Read each field once, own properties only, so a getter that changes between reads or an
  // inherited (polluted) property cannot make the checked value differ from the parsed one.
  const keys = Object.keys(input)
  if (keys.some((key) => !UPLOAD_FILE_KEYS.includes(key))) {
    return invalid
  }
  const copy: Record<string, unknown> = Object.create(null)
  for (const key of UPLOAD_FILE_KEYS) {
    if (Object.hasOwn(input, key)) {
      copy[key] = (input as Record<string, unknown>)[key]
    }
  }
  const { fileName, sizeBytes } = copy
  if (
    typeof fileName !== 'string' ||
    typeof sizeBytes !== 'number' ||
    !Number.isFinite(sizeBytes)
  ) {
    return invalid
  }
  if (!documentSizeCheckSchema.safeParse(sizeBytes).success) {
    return { ok: false, code: 'document.too_large' }
  }
  if (!documentTypeCheckSchema.safeParse(fileName).success) {
    return { ok: false, code: 'document.unsupported_type' }
  }
  const parsed = uploadDocumentFileSchema.safeParse(copy)
  return parsed.success ? { ok: true, file: parsed.data } : invalid
}
