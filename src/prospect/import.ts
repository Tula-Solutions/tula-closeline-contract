import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { prospectIdSchema, prospectImportIdSchema, userIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'

/** The largest import file, in bytes (10 MB). */
export const MAX_PROSPECT_IMPORT_BYTES = 10 * 1024 * 1024

/** The most data rows an import may hold. */
export const MAX_PROSPECT_IMPORT_ROWS = 50_000

/** The name of the one file part of the multipart upload; the request carries an `Idempotency-Key` header. */
export const PROSPECT_IMPORT_FILE_FIELD = 'file'

/**
 * The columns of the CSV template, in order. A row needs an email, a phone or a LinkedIn address.
 * `owner_email` names a member (Rep or Manager) of the Organization; `tags` is separated by `;`.
 * Values are written with the Source `import` and never replace a manual value (ADR 0020).
 */
export const PROSPECT_IMPORT_COLUMNS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'linkedin_url',
  'job_title',
  'company_name',
  'company_domain',
  'owner_email',
  'tags',
] as const

/** The states of an import; `completed` and `failed` are final. */
export const PROSPECT_IMPORT_STATES = ['uploaded', 'processing', 'completed', 'failed'] as const

/** The state of an import. */
export const prospectImportStateSchema = z.enum(PROSPECT_IMPORT_STATES)

/** The state of an import. */
export type ProspectImportState = z.infer<typeof prospectImportStateSchema>

/** Why a whole import failed after it was accepted. */
export const PROSPECT_IMPORT_FAILURE_REASONS = ['too_many_rows', 'unreadable'] as const

/** Why a whole import failed. */
export const prospectImportFailureReasonSchema = z.enum(PROSPECT_IMPORT_FAILURE_REASONS)

/** Why a whole import failed. */
export type ProspectImportFailureReason = z.infer<typeof prospectImportFailureReasonSchema>

/** What happened to one row. */
export const PROSPECT_IMPORT_ROW_RESULTS = ['created', 'updated', 'skipped', 'rejected'] as const

/** What happened to one row. */
export const prospectImportRowResultSchema = z.enum(PROSPECT_IMPORT_ROW_RESULTS)

/** What happened to one row. */
export type ProspectImportRowResult = z.infer<typeof prospectImportRowResultSchema>

/** Why a row was skipped: the file changes nothing for it. */
export const PROSPECT_IMPORT_SKIP_REASONS = ['no_change', 'manual_values_kept'] as const

/** Why a row was rejected: the row is not applied and the file needs fixing. */
export const PROSPECT_IMPORT_REJECT_REASONS = [
  'wrong_column_count',
  'blank_row',
  'missing_identity',
  'invalid_email',
  'invalid_phone',
  'invalid_linkedin_url',
  'invalid_name',
  'invalid_job_title',
  'invalid_company',
  'invalid_tags',
  'owner_not_found',
  'owner_not_allowed',
  'duplicate_in_file',
  'identity_conflict',
] as const

/** Why a row was skipped or rejected. */
export const prospectImportRowReasonSchema = z.enum([
  ...PROSPECT_IMPORT_SKIP_REASONS,
  ...PROSPECT_IMPORT_REJECT_REASONS,
])

/** Why a row was skipped or rejected. */
export type ProspectImportRowReason = z.infer<typeof prospectImportRowReasonSchema>

const countSchema = z.number().int().min(0).max(MAX_PROSPECT_IMPORT_ROWS)

/**
 * A Prospect import as core returns it. It carries no file name and no cell. The counts are
 * `null` until `completed`, then `rowCount` is the sum of the other four; `failureReason` is set
 * exactly when `state` is `failed`. The report is the paginated rows. An import is a queued,
 * idempotent and resumable job, so the page can be closed and the import read again by id.
 */
export const prospectImportSchema = z
  .object({
    id: prospectImportIdSchema,
    state: prospectImportStateSchema,
    failureReason: prospectImportFailureReasonSchema.nullable(),
    rowCount: countSchema.nullable(),
    createdCount: countSchema.nullable(),
    updatedCount: countSchema.nullable(),
    skippedCount: countSchema.nullable(),
    rejectedCount: countSchema.nullable(),
    uploadedByUserId: userIdSchema,
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
  })
  .superRefine((item, context) => {
    if ((item.state === 'failed') !== (item.failureReason !== null)) {
      context.addIssue({
        code: 'custom',
        path: ['failureReason'],
        message: 'A failure reason is set exactly when the state is failed',
      })
    }
    const counts = [
      item.rowCount,
      item.createdCount,
      item.updatedCount,
      item.skippedCount,
      item.rejectedCount,
    ]
    const allSet = counts.every((count) => count !== null)
    const noneSet = counts.every((count) => count === null)
    if (item.state === 'completed' ? !allSet : !noneSet) {
      context.addIssue({
        code: 'custom',
        path: ['rowCount'],
        message: 'The counts are set exactly when the import is completed',
      })
    }
    if (
      allSet &&
      item.rowCount !==
        (item.createdCount ?? 0) +
          (item.updatedCount ?? 0) +
          (item.skippedCount ?? 0) +
          (item.rejectedCount ?? 0)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['rowCount'],
        message: 'The row count is the four result counts together',
      })
    }
  })

/** A Prospect import as core returns it. */
export type ProspectImport = z.infer<typeof prospectImportSchema>

/** The path parameters of a request about one import. */
export const prospectImportParamsSchema = z.strictObject({ importId: prospectImportIdSchema })

/** The path parameters of a request about one import. */
export type ProspectImportParams = z.infer<typeof prospectImportParamsSchema>

/** The query parameters of a request to list imports: a page. */
export const listProspectImportsQuerySchema = pageQuerySchema.strict()

/** The query parameters of a request to list imports. */
export type ListProspectImportsQuery = z.infer<typeof listProspectImportsQuerySchema>

/** One page of imports, newest first (by `createdAt`, then id, both descending). */
export const listProspectImportsResponseSchema = pageSchema(prospectImportSchema)

/** One page of imports. */
export type ListProspectImportsResponse = z.infer<typeof listProspectImportsResponseSchema>

/** The position in an import list. */
export const prospectImportCursorSchema = z.strictObject({
  createdAt: timestampSchema,
  id: prospectImportIdSchema,
})

/** The position in an import list. */
export type ProspectImportCursor = z.infer<typeof prospectImportCursorSchema>

/**
 * One row of the report: the record number (the header is record 1, so the first data row is 2),
 * the `result` and, for a skipped or rejected row, the `reason`. `prospectId` is the Prospect the
 * row created or updated (or matched, when skipped) and is `null` for a rejected row. No cell of
 * the file is echoed, so a report carries no personal data.
 */
export const prospectImportRowSchema = z
  .object({
    rowNumber: z
      .number()
      .int()
      .min(2)
      .max(MAX_PROSPECT_IMPORT_ROWS + 1),
    result: prospectImportRowResultSchema,
    reason: prospectImportRowReasonSchema.nullable(),
    prospectId: prospectIdSchema.nullable(),
  })
  .superRefine((row, context) => {
    const wantsReason = row.result === 'skipped' || row.result === 'rejected'
    if (wantsReason !== (row.reason !== null)) {
      context.addIssue({
        code: 'custom',
        path: ['reason'],
        message: 'A reason is set exactly when the row is skipped or rejected',
      })
    }
    const isSkipReason = (PROSPECT_IMPORT_SKIP_REASONS as readonly string[]).includes(
      row.reason ?? ''
    )
    if (row.reason !== null && (row.result === 'skipped') !== isSkipReason) {
      context.addIssue({
        code: 'custom',
        path: ['reason'],
        message: 'A skip reason belongs to a skipped row and a reject reason to a rejected row',
      })
    }
    if (row.result === 'rejected' && row.prospectId !== null) {
      context.addIssue({
        code: 'custom',
        path: ['prospectId'],
        message: 'A rejected row has no Prospect',
      })
    }
    if ((row.result === 'created' || row.result === 'updated') && row.prospectId === null) {
      context.addIssue({
        code: 'custom',
        path: ['prospectId'],
        message: 'A created or updated row names its Prospect',
      })
    }
  })

/** One row of an import report. */
export type ProspectImportRow = z.infer<typeof prospectImportRowSchema>

/** The query parameters of a request to read an import's rows: a page and optionally one `result`. Rows are in CSV order. An unknown parameter is refused. */
export const listProspectImportRowsQuerySchema = pageQuerySchema
  .extend({ result: prospectImportRowResultSchema.optional() })
  .strict()

/** The query parameters of a request to read an import's rows. */
export type ListProspectImportRowsQuery = z.infer<typeof listProspectImportRowsQuerySchema>

/** One page of an import report. */
export const listProspectImportRowsResponseSchema = pageSchema(prospectImportRowSchema)

/** One page of an import report. */
export type ListProspectImportRowsResponse = z.infer<typeof listProspectImportRowsResponseSchema>

/** The position in an import report: the record number of the last row of the page. */
export const prospectImportRowCursorSchema = z.strictObject({
  rowNumber: z.number().int().min(2),
})

/** The position in an import report. */
export type ProspectImportRowCursor = z.infer<typeof prospectImportRowCursorSchema>

/** The columns of the downloadable report CSV, in order. */
export const PROSPECT_IMPORT_REPORT_COLUMNS = [
  'row_number',
  'result',
  'reason',
  'prospect_id',
] as const

/** Why an upload is refused with `prospect.import_invalid`, carried in `details.reason`. */
export const PROSPECT_IMPORT_INVALID_REASONS = [
  'unsupported_type',
  'too_large',
  'header_invalid',
  'too_many_rows',
] as const

/** The `details` of `prospect.import_invalid`: which check the upload failed. */
export const prospectImportInvalidDetailsSchema = z.strictObject({
  reason: z.enum(PROSPECT_IMPORT_INVALID_REASONS),
})

/** The `details` of `prospect.import_invalid`. */
export type ProspectImportInvalidDetails = z.infer<typeof prospectImportInvalidDetailsSchema>
