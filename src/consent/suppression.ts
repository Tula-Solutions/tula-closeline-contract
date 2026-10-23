import { z } from 'zod'
import { timestampSchema } from '../core/values'
import {
  organizationIdSchema,
  prospectIdSchema,
  suppressionEntryIdSchema,
  suppressionImportIdSchema,
  userIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { boundedTextSchema, MAX_SOURCE_REF_LENGTH } from '../prospect/values'
import {
  addressFieldsShape,
  consentChannelSchema,
  hasExactlyOneAddress,
  maskedAddressSchema,
  ONE_ADDRESS_MESSAGE,
  SUPPRESSION_REMOVABLE_REASONS,
  suppressionAddressKindSchema,
  suppressionReasonSchema,
} from './values'

/** The longest reason or note on a Suppression change, in characters. */
export const MAX_SUPPRESSION_NOTE_LENGTH = 500

const isRemovableReason = (reason: string) =>
  (SUPPRESSION_REMOVABLE_REASONS as readonly string[]).includes(reason)

/**
 * A Suppression entry as core returns it (ADR 0021): an Organization's record that an address
 * must not be contacted on any channel. The address itself and its salted hash are never
 * returned: `maskedAddress` is for display and is `null` for an `erased` entry, which keeps no
 * data about the person. `removable` is true exactly for a `manual` entry; the others are lifted
 * only by a new granted consent with new evidence. `channel` is where the request arrived (a STOP
 * on SMS), `sourceRef` the message, bounce or sync it came from. A removed entry says when, by
 * whom and why.
 */
export const suppressionEntrySchema = z
  .object({
    id: suppressionEntryIdSchema,
    addressKind: suppressionAddressKindSchema,
    maskedAddress: maskedAddressSchema.nullable(),
    reason: suppressionReasonSchema,
    channel: consentChannelSchema.nullable(),
    sourceRef: z.string().min(1).max(MAX_SOURCE_REF_LENGTH).nullable(),
    addedByUserId: userIdSchema.nullable(),
    removable: z.boolean(),
    createdAt: timestampSchema,
    removedAt: timestampSchema.nullable(),
    removedByUserId: userIdSchema.nullable(),
    removalReason: boundedTextSchema(MAX_SUPPRESSION_NOTE_LENGTH).nullable(),
  })
  .refine((e) => e.removable === isRemovableReason(e.reason), 'Only a manual entry is removable')
  .refine(
    (e) => (e.reason === 'erased') === (e.maskedAddress === null),
    'An erased entry keeps no address'
  )
  .refine(
    (e) =>
      (e.removedAt === null) === (e.removedByUserId === null) &&
      (e.removedAt === null) === (e.removalReason === null),
    'A removed entry says when, by whom and why'
  )

/** A Suppression entry. */
export type SuppressionEntry = z.infer<typeof suppressionEntrySchema>

/** The path parameters of a request about one Suppression entry. */
export const suppressionEntryParamsSchema = z.strictObject({ entryId: suppressionEntryIdSchema })

/**
 * The body of a request to add an address by hand: exactly one of `email`, `phone` or
 * `linkedinUrl`, normalised by core (ADR 0011). The reason is `manual` and the actor the caller,
 * both set by core. Adding an address already suppressed answers 200 with the existing entry.
 */
export const addSuppressionRequestSchema = z
  .strictObject({
    ...addressFieldsShape,
    note: boundedTextSchema(MAX_SUPPRESSION_NOTE_LENGTH).optional(),
  })
  .refine(hasExactlyOneAddress, ONE_ADDRESS_MESSAGE)

/** The body of a request to add an address to the Suppression list. */
export type AddSuppressionRequest = z.infer<typeof addSuppressionRequestSchema>

/** The body of a request to remove a manual entry: the reason is recorded. */
export const removeSuppressionRequestSchema = z.strictObject({
  reason: boundedTextSchema(MAX_SUPPRESSION_NOTE_LENGTH),
})

/** The body of a request to remove a manual entry. */
export type RemoveSuppressionRequest = z.infer<typeof removeSuppressionRequestSchema>

/** Whether a list shows live entries or removed ones. */
export const suppressionListStateSchema = z.enum(['active', 'removed'])

/**
 * The query parameters of a request to list the Suppression list, newest first: filters by
 * reason, address kind and state (default `active`). An address is never a query parameter (query strings reach access logs): look one up with
 * {@link lookupSuppressionRequestSchema}.
 */
export const listSuppressionEntriesQuerySchema = pageQuerySchema
  .extend({
    reason: suppressionReasonSchema.optional(),
    addressKind: suppressionAddressKindSchema.optional(),
    state: suppressionListStateSchema.optional(),
  })
  .strict()

/** The body of a lookup of one address on the Suppression list: exactly one address, normalised and hashed by core; there is no substring search. */
export const lookupSuppressionRequestSchema = z
  .strictObject(addressFieldsShape)
  .refine(hasExactlyOneAddress, ONE_ADDRESS_MESSAGE)

/** The query parameters of a request to list Suppression entries. */
export type ListSuppressionEntriesQuery = z.infer<typeof listSuppressionEntriesQuerySchema>

/** One page of Suppression entries. */
export const suppressionEntryPageSchema = pageSchema(suppressionEntrySchema)

/**
 * Internal: the body of a STOP the channel adapter received. The Organization comes from the
 * adapter's own record of the message (an internal call has no token), the address from the
 * message sender. Core appends a `stop_reply` withdrawal on `channel` (or on every channel when
 * `stopAll`), adds a `stop` Suppression entry and publishes the events. Idempotent on `sourceRef`.
 */
export const recordWithdrawalRequestSchema = z
  .strictObject({
    organizationId: organizationIdSchema,
    channel: consentChannelSchema,
    ...addressFieldsShape,
    stopAll: z.boolean().default(false),
    sourceRef: z.string().min(1).max(MAX_SOURCE_REF_LENGTH),
  })
  .refine(hasExactlyOneAddress, ONE_ADDRESS_MESSAGE)

/** Internal: the body of a STOP. */
export type RecordWithdrawalRequest = z.infer<typeof recordWithdrawalRequestSchema>

/** Why an email address was suppressed by delivery: it bounced or the recipient complained. */
export const DELIVERY_FAILURE_REASONS = ['bounce', 'complaint'] as const

/** Internal: the body of a bounce or complaint the email channel received; core adds the Suppression entry. Idempotent on `sourceRef`. */
export const recordDeliveryFailureRequestSchema = z.strictObject({
  organizationId: organizationIdSchema,
  email: addressFieldsShape.email.unwrap(),
  reason: z.enum(DELIVERY_FAILURE_REASONS),
  sourceRef: z.string().min(1).max(MAX_SOURCE_REF_LENGTH),
})

/** Internal: the body of a bounce or complaint. */
export type RecordDeliveryFailureRequest = z.infer<typeof recordDeliveryFailureRequestSchema>

/** Internal: what recording a STOP or a delivery failure answers: the entry (an existing one on a replay) and the Prospect if one is known. */
export const recordedSuppressionSchema = z.object({
  entryId: suppressionEntryIdSchema,
  prospectId: prospectIdSchema.nullable(),
})

/** The largest Suppression import file, in bytes (10 MB). */
export const MAX_SUPPRESSION_IMPORT_BYTES = 10 * 1024 * 1024

/** The most data rows a Suppression import may hold. */
export const MAX_SUPPRESSION_IMPORT_ROWS = 50_000

/** The name of the one file part of the multipart upload; the request carries an `Idempotency-Key` header. */
export const SUPPRESSION_IMPORT_FILE_FIELD = 'file'

/** The one column of the CSV: an email, a phone number or a LinkedIn address per row. */
export const SUPPRESSION_IMPORT_COLUMNS = ['address'] as const

/** The states of a Suppression import; `completed` and `failed` are final. */
export const SUPPRESSION_IMPORT_STATES = ['uploaded', 'processing', 'completed', 'failed'] as const

/** The state of a Suppression import. */
export const suppressionImportStateSchema = z.enum(SUPPRESSION_IMPORT_STATES)

/** Why a whole Suppression import failed after it was accepted. */
export const SUPPRESSION_IMPORT_FAILURE_REASONS = ['too_many_rows', 'unreadable'] as const

/**
 * A Suppression import: a queued job that adds every address of an uploaded CSV with the reason
 * `manual`. The counts are set exactly when `completed` and add up to `totalRows`; a failed import
 * carries `failureReason`. A bad row is reported, never dropped.
 */
export const suppressionImportSchema = z
  .object({
    id: suppressionImportIdSchema,
    state: suppressionImportStateSchema,
    failureReason: z.enum(SUPPRESSION_IMPORT_FAILURE_REASONS).nullable(),
    totalRows: z.number().int().min(0).max(MAX_SUPPRESSION_IMPORT_ROWS).nullable(),
    addedRows: z.number().int().min(0).nullable(),
    alreadySuppressedRows: z.number().int().min(0).nullable(),
    invalidRows: z.number().int().min(0).nullable(),
    createdAt: timestampSchema,
    completedAt: timestampSchema.nullable(),
    createdByUserId: userIdSchema,
  })
  .refine(
    (i) => (i.failureReason !== null) === (i.state === 'failed'),
    'A failed import has a reason'
  )
  .refine(
    (i) => (i.completedAt !== null) === (i.state === 'completed' || i.state === 'failed'),
    'A final import has a completion time'
  )
  .refine((i) => {
    if (i.state !== 'completed') {
      return (
        i.totalRows === null &&
        i.addedRows === null &&
        i.alreadySuppressedRows === null &&
        i.invalidRows === null
      )
    }
    return (
      i.totalRows !== null &&
      i.addedRows !== null &&
      i.alreadySuppressedRows !== null &&
      i.invalidRows !== null &&
      i.addedRows + i.alreadySuppressedRows + i.invalidRows === i.totalRows
    )
  }, 'The counts are set exactly when completed and add up')

/** A Suppression import. */
export type SuppressionImport = z.infer<typeof suppressionImportSchema>

/** The path parameters of a request about one Suppression import. */
export const suppressionImportParamsSchema = z.strictObject({ importId: suppressionImportIdSchema })

/** The query parameters of a request to list Suppression imports, newest first. */
export const listSuppressionImportsQuerySchema = pageQuerySchema.strict()

/** One page of Suppression imports. */
export const suppressionImportPageSchema = pageSchema(suppressionImportSchema)

/** The result of one row of a Suppression import. */
export const SUPPRESSION_IMPORT_ROW_RESULTS = ['added', 'already_suppressed', 'invalid'] as const

/** One row of the import report: its number and result; no cell of the file is returned. */
export const suppressionImportRowSchema = z.object({
  rowNumber: z
    .number()
    .int()
    .min(1)
    .max(MAX_SUPPRESSION_IMPORT_ROWS + 1),
  result: z.enum(SUPPRESSION_IMPORT_ROW_RESULTS),
  reason: z.enum(['unreadable_address', 'unsupported_address']).nullable(),
})

/** One row of the import report. */
export type SuppressionImportRow = z.infer<typeof suppressionImportRowSchema>

/** The query parameters of a request to read the import report in CSV order, optionally only one result. */
export const listSuppressionImportRowsQuerySchema = pageQuerySchema
  .extend({ result: z.enum(SUPPRESSION_IMPORT_ROW_RESULTS).optional() })
  .strict()

/** One page of import report rows. */
export const suppressionImportRowPageSchema = pageSchema(suppressionImportRowSchema)
