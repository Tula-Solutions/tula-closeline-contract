import { z } from 'zod'
import { hasStrippableCharacter, isWellFormedText } from './values'

/** The Outcome of a Deal: `won`, `lost` or still `open` (glossary). */
export const OUTCOMES = ['won', 'lost', 'open'] as const

/** The Outcome of a Deal. */
export const outcomeSchema = z.enum(OUTCOMES)

/** The Outcome of a Deal. */
export type Outcome = z.infer<typeof outcomeSchema>

/** The ticket's choice (ADR 0018 leaves it open): the longest deal id, in UTF-16 code units, after trimming. */
export const MAX_DEAL_ID_LENGTH = 128

/** The most raw characters a deal id may carry before trimming. */
const MAX_RAW_DEAL_ID_LENGTH = 1000

/** Whether a code unit is a line or paragraph separator or a zero-width character: invisible, and able to make two identifiers look equal. */
function isInvisibleIdentifierCharacter(code: number): boolean {
  return (
    code === 0x2028 ||
    code === 0x2029 ||
    (code >= 0x200b && code <= 0x200d) ||
    code === 0x2060 ||
    code === 0xfeff
  )
}

function hasInvisibleCharacter(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    if (isInvisibleIdentifierCharacter(text.charCodeAt(index))) {
      return true
    }
  }
  return false
}

/**
 * Normalises a deal id: trims surrounding whitespace and changes nothing else. The comparison is
 * exact and case-sensitive (`A-1` and `a-1` are two Deals) with no Unicode normalisation, as ADR
 * 0018 says, so two ids are the same only if they are the same code units after the trim.
 */
export function normaliseDealId(dealId: string): string {
  return dealId.trim()
}

/**
 * A deal id (the Organization's own identifier for a Deal), in a request, a path, a CSV cell and a
 * response: at most 1000 raw characters, trimmed, then 1 to 128 UTF-16 code units, well-formed,
 * with no control character, bidirectional character, line or paragraph separator or zero-width
 * character. Unlike a file name it is rejected, not stripped, because stripping could make two
 * ids equal. It is compared exactly and case-sensitively after the trim ({@link normaliseDealId}).
 * It is the only free-text cell an import report may echo. It is untrusted text for display.
 */
export const dealIdSchema = z
  .string()
  .max(MAX_RAW_DEAL_ID_LENGTH)
  .transform(normaliseDealId)
  .pipe(
    z
      .string()
      .min(1)
      .max(MAX_DEAL_ID_LENGTH)
      .refine(isWellFormedText, 'Well-formed text only')
      .refine((id) => !hasStrippableCharacter(id), 'No control or direction characters')
      .refine((id) => !hasInvisibleCharacter(id), 'No invisible characters')
  )

/** A deal id. */
export type DealId = z.infer<typeof dealIdSchema>

/** The longest Deal name, in UTF-16 code units, once trimmed. */
export const MAX_DEAL_NAME_LENGTH = 200

/** A Deal's optional name: trimmed, 1 to 200 well-formed UTF-16 code units, no control character. Untrusted text for display. */
export const dealNameSchema = z
  .string()
  .max(1000)
  .trim()
  .pipe(
    z
      .string()
      .min(1)
      .max(MAX_DEAL_NAME_LENGTH)
      .refine(isWellFormedText, 'Well-formed text only')
      .refine((name) => !hasStrippableCharacter(name), 'No control or direction characters')
  )

/** A money amount as a decimal string, never a float: up to 15 digits and at most 2 decimals, not negative. */
export const dealAmountSchema = z.string().regex(/^\d{1,15}(\.\d{1,2})?$/)

/** A currency as an upper-case ISO 4217 code of three letters. */
export const dealCurrencySchema = z.string().regex(/^[A-Z]{3}$/)

/** The lead's default (ADR 0018, refinements; not the owner's): the largest CSV accepted, 10 MB counted as 10 * 1024 * 1024 bytes. */
export const MAX_DEAL_IMPORT_BYTES = 10 * 1024 * 1024

/** The lead's default (ADR 0018, refinements; not the owner's): the most data rows in one CSV. */
export const MAX_DEAL_IMPORT_ROWS = 50_000

/** The required columns of the CSV template, in order. */
export const DEAL_IMPORT_REQUIRED_COLUMNS = [
  'deal_id',
  'outcome',
  'closed_at',
  'amount',
  'currency',
] as const

/** The optional column of the CSV template, which may follow the required ones. */
export const DEAL_IMPORT_OPTIONAL_COLUMN = 'name'

/** The longest first row the header check reads, in characters; a longer one is refused. */
export const MAX_DEAL_IMPORT_HEADER_LENGTH = 1024

/** Why a CSV header was refused: a closed list, so the answer never echoes a cell. */
export const DEAL_IMPORT_HEADER_PROBLEMS = [
  'empty',
  'too_long',
  'missing_column',
  'unexpected_column',
  'wrong_order',
] as const

/** Why a CSV header was refused. */
export type DealImportHeaderProblem = (typeof DEAL_IMPORT_HEADER_PROBLEMS)[number]

/** The answer of {@link checkDealImportHeader}. */
export type CheckDealImportHeaderResult =
  | { readonly ok: true; readonly hasName: boolean }
  | {
      readonly ok: false
      readonly code: 'deal_import.header_invalid'
      readonly problem: DealImportHeaderProblem
    }

/**
 * Checks the first row of a CSV against the fixed template: `deal_id,outcome,closed_at,amount,
 * currency` in that order, optionally followed by `name`. Column names are lower case and exact;
 * a leading byte order mark, surrounding spaces and surrounding double quotes on a cell are
 * ignored. The caller passes the text up to the first line break; one trailing carriage return is
 * dropped, and any other line break inside is an `unexpected_column`. A refusal is `deal_import.header_invalid` (422) and names a closed `problem`, never a cell.
 */
export function checkDealImportHeader(line: string): CheckDealImportHeaderResult {
  const refuse = (problem: DealImportHeaderProblem) =>
    ({ ok: false, code: 'deal_import.header_invalid', problem }) as const
  if (line.length > MAX_DEAL_IMPORT_HEADER_LENGTH) {
    return refuse('too_long')
  }
  const unbommed = line.startsWith('\ufeff') ? line.slice(1) : line
  const text = unbommed.endsWith('\r') ? unbommed.slice(0, -1) : unbommed
  if (text.trim() === '') {
    return refuse('empty')
  }
  if (/[\r\n]/.test(text)) {
    return refuse('unexpected_column')
  }
  const cells = text.split(',').map((cell) =>
    cell
      .trim()
      .replace(/^"(.*)"$/, '$1')
      .trim()
  )
  const known: readonly string[] = [...DEAL_IMPORT_REQUIRED_COLUMNS, DEAL_IMPORT_OPTIONAL_COLUMN]
  if (cells.some((cell) => !known.includes(cell))) {
    return refuse('unexpected_column')
  }
  if (new Set(cells).size !== cells.length) {
    return refuse('unexpected_column')
  }
  if (DEAL_IMPORT_REQUIRED_COLUMNS.some((column) => !cells.includes(column))) {
    return refuse('missing_column')
  }
  const expected = [...DEAL_IMPORT_REQUIRED_COLUMNS, DEAL_IMPORT_OPTIONAL_COLUMN].slice(
    0,
    cells.length
  )
  if (cells.some((cell, index) => cell !== expected[index])) {
    return refuse('wrong_order')
  }
  return { ok: true, hasName: cells.length === DEAL_IMPORT_REQUIRED_COLUMNS.length + 1 }
}

/** The states a Deal import is in: `uploaded`, then `processing`, then `completed` or `failed`. */
export const DEAL_IMPORT_STATES = ['uploaded', 'processing', 'completed', 'failed'] as const

/** The state of a Deal import. */
export const dealImportStateSchema = z.enum(DEAL_IMPORT_STATES)

/** The state of a Deal import. */
export type DealImportState = z.infer<typeof dealImportStateSchema>

/** Why a whole import ended `failed`: a closed list. A bad row is not a failure of the import. */
export const DEAL_IMPORT_FAILURE_REASONS = [
  'too_many_rows',
  'unreadable',
  'processing_failed',
] as const

/** Why a whole import ended `failed`. */
export const dealImportFailureReasonSchema = z.enum(DEAL_IMPORT_FAILURE_REASONS)

/** Why a whole import ended `failed`. */
export type DealImportFailureReason = z.infer<typeof dealImportFailureReasonSchema>

/** The result of one CSV row: `applied`, or `rejected` with a reason. */
export const DEAL_IMPORT_ROW_RESULTS = ['applied', 'rejected'] as const

/** The result of one CSV row. */
export const dealImportRowResultSchema = z.enum(DEAL_IMPORT_ROW_RESULTS)

/** The result of one CSV row. */
export type DealImportRowResult = z.infer<typeof dealImportRowResultSchema>

/**
 * Why a row was rejected: a closed list, never a cell. A row is rejected, not silently dropped,
 * and never an HTTP error. `outcome_already_decided` is a row for a Deal already `won` or `lost`
 * (ADR 0018, choice 5); `duplicate_in_file` is a deal id repeated after its first row.
 */
export const DEAL_IMPORT_ROW_REASONS = [
  'wrong_column_count',
  'invalid_deal_id',
  'duplicate_in_file',
  'invalid_outcome',
  'invalid_closed_at',
  'invalid_amount',
  'invalid_currency',
  'invalid_name',
  'outcome_already_decided',
  'deal_limit_reached',
] as const

/** Why a row was rejected. */
export const dealImportRowReasonSchema = z.enum(DEAL_IMPORT_ROW_REASONS)

/** Why a row was rejected. */
export type DealImportRowReason = z.infer<typeof dealImportRowReasonSchema>
