import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { dealImportIdSchema, dealRecordIdSchema, userIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  calendarDateSchema,
  dealAmountSchema,
  dealCurrencySchema,
  dealIdSchema,
  dealImportFailureReasonSchema,
  dealImportRowReasonSchema,
  dealImportRowResultSchema,
  dealImportStateSchema,
  dealNameSchema,
  MAX_DEAL_IMPORT_ROWS,
  outcomeSchema,
} from './deal-values'

/**
 * A Deal as the service returns it. A Deal is named by the Organization's own `dealId` (customer
 * text, never logged, never in a URL path) and addressed by its opaque `id` (`deal_…`). It is never
 * deleted on its own in phase 1. `closedAt` is a calendar date `YYYY-MM-DD`
 * (no time, no time zone; a timestamp until 0.11.0). An `open` Deal may carry a `closedAt`, an expected close date from
 * a CRM; an `amount` always comes with a `currency`. `closedAt`, `amount`, `currency` and `name` are `null`
 * until given. `callCount` counts Calls that are not deleted. `appearedInImport` is false for a
 * Deal created by a Call upload that no CSV has named, so the portal can list likely typos. The
 * Outcome sequence the re-tag job uses is not here. The service must send the output of
 * `dealSchema.parse(row)`.
 */
export const dealSchema = z
  .object({
    id: dealRecordIdSchema,
    dealId: dealIdSchema,
    name: dealNameSchema.nullable(),
    outcome: outcomeSchema,
    closedAt: calendarDateSchema.nullable(),
    amount: dealAmountSchema.nullable(),
    currency: dealCurrencySchema.nullable(),
    callCount: z.number().int().min(0),
    appearedInImport: z.boolean(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
  })
  .refine((deal) => deal.amount === null || deal.currency !== null, {
    message: 'An amount comes with a currency',
    path: ['currency'],
  })

/** A Deal as the service returns it. */
export type Deal = z.infer<typeof dealSchema>

/** The path parameters of a request about one Deal: its opaque id, never the customer's deal id. */
export const dealParamsSchema = z.strictObject({ dealRecordId: dealRecordIdSchema })

/** The path parameters of a request about one Deal. */
export type DealParams = z.infer<typeof dealParamsSchema>

/**
 * The query parameters of a request to list Deals: a page, and optionally one `outcome` and
 * `appearedInImport` (`true` or `false`). `appearedInImport=false` lists the Deals that have Calls
 * but never appeared in a CSV. An unknown parameter is rejected.
 */
export const listDealsQuerySchema = pageQuerySchema
  .extend({
    outcome: outcomeSchema.optional(),
    appearedInImport: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
  })
  .strict()

/** The query parameters of a request to list Deals. */
export type ListDealsQuery = z.infer<typeof listDealsQuerySchema>

/** One page of Deals. */
export const listDealsResponseSchema = pageSchema(dealSchema)

/** One page of Deals. */
export type ListDealsResponse = z.infer<typeof listDealsResponseSchema>

/**
 * The body of the request that sets or corrects a Deal's Outcome (Owner and Admin, any Deal, even
 * a decided one): the `outcome` and an optional `closedAt`, which an `open` Deal may carry too (an
 * expected close date), as in the CSV. It is idempotent by end state, and a change queues the
 * re-tag of the Deal's Moments.
 */
export const setDealOutcomeRequestSchema = z.strictObject({
  outcome: outcomeSchema,
  closedAt: calendarDateSchema.nullable().optional(),
})

/** The body of the request that sets or corrects a Deal's Outcome. */
export type SetDealOutcomeRequest = z.infer<typeof setDealOutcomeRequestSchema>

/**
 * The body of the request that finds a Deal by the customer's deal id, so the id goes in a POST
 * body and never in a URL. The answer is the Deal, or `deal.not_found`. Matching is exact after the
 * trim.
 */
export const lookupDealRequestSchema = z.strictObject({ dealId: dealIdSchema })

/** The body of the request that finds a Deal by the customer's deal id. */
export type LookupDealRequest = z.infer<typeof lookupDealRequestSchema>

/** The position a Deal list continues from: `createdAt`, then the Deal's opaque `id`, never the customer's deal id. */
export const dealCursorSchema = z.strictObject({
  createdAt: timestampSchema,
  id: dealRecordIdSchema,
})

/** The position a Deal list continues from. */
export type DealCursor = z.infer<typeof dealCursorSchema>

/** The position a Deal import list continues from: `createdAt`, then the import's `id`. */
export const dealImportCursorSchema = z.strictObject({
  createdAt: timestampSchema,
  id: dealImportIdSchema,
})

/** The position a Deal import list continues from. */
export type DealImportCursor = z.infer<typeof dealImportCursorSchema>

/** The position an import report continues from: the `rowNumber` of the last row returned. */
export const dealImportRowCursorSchema = z.strictObject({ rowNumber: z.number().int().min(2) })

/** The position an import report continues from. */
export type DealImportRowCursor = z.infer<typeof dealImportRowCursorSchema>

/** The fields of the multipart upload of a Deal import: the CSV is the one file part (`file`), with no other part. The request carries an `Idempotency-Key` header. */
export const DEAL_IMPORT_FILE_FIELD = 'file'

/**
 * A Deal import as the service returns it. It carries no file name and no cell. The counts are
 * `null` until `completed`; `failureReason` is set exactly when `state` is `failed`. The report is
 * the paginated rows ({@link listDealImportRowsResponseSchema}).
 */
export const dealImportSchema = z
  .object({
    id: dealImportIdSchema,
    state: dealImportStateSchema,
    failureReason: dealImportFailureReasonSchema.nullable(),
    rowCount: z.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
    appliedCount: z.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
    rejectedCount: z.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
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
    const counted =
      item.rowCount !== null && item.appliedCount !== null && item.rejectedCount !== null
    const none = item.rowCount === null && item.appliedCount === null && item.rejectedCount === null
    if (item.state === 'completed' ? !counted : !none) {
      context.addIssue({
        code: 'custom',
        path: ['rowCount'],
        message: 'The counts are set exactly when the import is completed',
      })
    }
    if (
      counted &&
      item.appliedCount !== null &&
      item.rejectedCount !== null &&
      item.rowCount !== item.appliedCount + item.rejectedCount
    ) {
      context.addIssue({
        code: 'custom',
        path: ['rowCount'],
        message: 'The row count is the applied and rejected rows together',
      })
    }
  })

/** A Deal import as the service returns it. */
export type DealImport = z.infer<typeof dealImportSchema>

/** The path parameters of a request about one Deal import. */
export const dealImportParamsSchema = z.strictObject({ importId: dealImportIdSchema })

/** The path parameters of a request about one Deal import. */
export type DealImportParams = z.infer<typeof dealImportParamsSchema>

/** The query parameters of a request to list Deal imports: a page. An unknown parameter is rejected. */
export const listDealImportsQuerySchema = pageQuerySchema.strict()

/** The query parameters of a request to list Deal imports. */
export type ListDealImportsQuery = z.infer<typeof listDealImportsQuerySchema>

/** One page of Deal imports. */
export const listDealImportsResponseSchema = pageSchema(dealImportSchema)

/** One page of Deal imports. */
export type ListDealImportsResponse = z.infer<typeof listDealImportsResponseSchema>

/**
 * One row of an import report: the CSV `rowNumber`, the record number with the header as record 1
 * (so the first data row is 2). A quoted cell that spans lines is one record, so `rowNumber` can
 * differ from the physical line (see `parseCsv`),
 * the `dealId` (the one free-text cell echoed; `null` when the cell was missing or not a valid deal
 * id, so a bad cell is never echoed), the `result` and, for a rejected row, the `reason`. `reason`
 * is `null` exactly when the result is `applied`. No other cell is ever part of a report.
 */
export const dealImportRowSchema = z
  .object({
    rowNumber: z
      .number()
      .int()
      .min(2)
      .max(MAX_DEAL_IMPORT_ROWS + 1),
    dealId: dealIdSchema.nullable(),
    result: dealImportRowResultSchema,
    reason: dealImportRowReasonSchema.nullable(),
  })
  .superRefine((row, context) => {
    if (row.reason === 'blank_row' && row.dealId !== null) {
      context.addIssue({
        code: 'custom',
        path: ['dealId'],
        message: 'A blank row has no deal id',
      })
    }
    if ((row.result === 'rejected') !== (row.reason !== null)) {
      context.addIssue({
        code: 'custom',
        path: ['reason'],
        message: 'A reason is set exactly when the row is rejected',
      })
    }
    if (
      row.dealId === null &&
      row.reason !== 'invalid_deal_id' &&
      row.reason !== 'wrong_column_count' &&
      row.reason !== 'blank_row'
    ) {
      context.addIssue({
        code: 'custom',
        path: ['dealId'],
        message: 'Only a row with no usable deal id has none',
      })
    }
  })

/** One row of an import report. */
export type DealImportRow = z.infer<typeof dealImportRowSchema>

/** The query parameters of a request to read an import's rows: a page, and optionally only the `rejected` or only the `applied` rows. Rows are in CSV order. An unknown parameter is rejected. */
export const listDealImportRowsQuerySchema = pageQuerySchema
  .extend({ result: dealImportRowResultSchema.optional() })
  .strict()

/** The query parameters of a request to read an import's rows. */
export type ListDealImportRowsQuery = z.infer<typeof listDealImportRowsQuerySchema>

/** One page of an import report. */
export const listDealImportRowsResponseSchema = pageSchema(dealImportRowSchema)

/** One page of an import report. */
export type ListDealImportRowsResponse = z.infer<typeof listDealImportRowsResponseSchema>
