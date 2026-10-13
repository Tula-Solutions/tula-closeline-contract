import { z } from 'zod'
import { hasStrippableCharacter, isWellFormedText, MAX_UTF8_BYTES_PER_CODE_POINT } from './values'

/** The Outcome of a Deal: `won`, `lost` or still `open` (glossary). */
export const OUTCOMES = ['won', 'lost', 'open'] as const

/** The Outcome of a Deal. */
export const outcomeSchema = z.enum(OUTCOMES)

/** The Outcome of a Deal. */
export type Outcome = z.infer<typeof outcomeSchema>

/** The ticket's choice (ADR 0018 leaves it open): the longest deal id, in Unicode code points, after trimming. */
export const MAX_DEAL_ID_LENGTH = 128

/** The most raw Unicode code points a deal id may carry before trimming. */
const MAX_RAW_DEAL_ID_LENGTH = 1000

/** The most UTF-8 bytes a stored deal id can take: 128 code points at 4 bytes each. A column must allow this many bytes. */
export const MAX_DEAL_ID_BYTES = MAX_DEAL_ID_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT

/** Whether a code point is one of the Hangul filler characters, which render as nothing but are letters, not format controls. */
function isHangulFiller(codePoint: number): boolean {
  return (
    codePoint === 0x115f || codePoint === 0x1160 || codePoint === 0x3164 || codePoint === 0xffa0
  )
}

/**
 * Whether text holds a character that is invisible or reshapes what is shown, so two identifiers
 * could look equal: a Unicode format character (category Cf, which includes the soft hyphen, the
 * zero-width and joiner characters, the word joiner, invisible operators and the tag characters),
 * a line or paragraph separator, or a Hangul filler. Homoglyphs (a Cyrillic "a" for a Latin one)
 * are not caught: they are visible, distinct ids and stay accepted.
 */
function hasInvisibleCharacter(text: string): boolean {
  if (/\p{Cf}/u.test(text)) {
    return true
  }
  for (const character of text) {
    const codePoint = character.codePointAt(0) ?? 0
    if (codePoint === 0x2028 || codePoint === 0x2029 || isHangulFiller(codePoint)) {
      return true
    }
  }
  return false
}

/**
 * Normalises a deal id: trims surrounding whitespace and changes nothing else. The comparison is
 * exact and case-sensitive (`A-1` and `a-1` are two Deals) with no Unicode normalisation, as ADR
 * 0018 says, so two ids are the same only if they are the same code points after the trim.
 */
export function normaliseDealId(dealId: string): string {
  return dealId.trim()
}

/**
 * A deal id (the Organization's own identifier for a Deal), in a body, a CSV cell, the upload field,
 * a list filter and a response, never in a URL path (a Deal's path id is the opaque `deal_…` id): at
 * most 1000 raw Unicode code points, trimmed, then 1 to 128 Unicode code points (at most
 * `MAX_DEAL_ID_BYTES` bytes in UTF-8), well-formed, with no control character, bidirectional
 * character, Unicode format character (category Cf, so no soft hyphen, zero-width, word joiner or
 * tag character), line or paragraph separator or Hangul filler; homoglyphs are accepted and stay
 * distinct ids. It is customer-chosen text that may hold a person's or a company's name, so it is
 * never logged. Unlike a file name it is rejected, not stripped, because stripping could make two
 * ids equal. It is compared exactly and case-sensitively after the trim ({@link normaliseDealId}).
 * It is the only free-text cell an import report may echo, and untrusted text for display.
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

/** The longest Deal name, in Unicode code points, once trimmed. */
export const MAX_DEAL_NAME_LENGTH = 200

/** The most UTF-8 bytes a stored Deal name can take: 200 code points at 4 bytes each. A column must allow this many bytes. */
export const MAX_DEAL_NAME_BYTES = MAX_DEAL_NAME_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT

/** A Deal's optional name: trimmed, 1 to 200 well-formed Unicode code points (at most `MAX_DEAL_NAME_BYTES` bytes), no control character. Untrusted text for display, never logged. */
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

/** A money amount as a decimal string, never a float: not negative, at most 15 integer digits (the maximum is 999999999999999.99) and 2 fraction digits, no leading zero beyond a single `0`. */
export const dealAmountSchema = z.string().regex(/^(0|[1-9]\d{0,14})(\.\d{1,2})?$/)

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

/** The answer of a CSV cell parser: the parsed value, or not valid. */
export type CellResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false }

const INVALID_CELL = { ok: false } as const

/** Reads the `outcome` cell: `won`, `lost` or `open`, compared case-insensitively after trimming. A blank cell is not valid: the column is required. */
export function parseOutcomeCell(cell: string): CellResult<Outcome> {
  const result = outcomeSchema.safeParse(cell.trim().toLowerCase())
  return result.success ? { ok: true, value: result.data } : INVALID_CELL
}

/**
 * Reads the `closed_at` cell. Blank is none (`null`); `won` and `lost` do not require it, and an
 * `open` Deal may carry an expected close date. Otherwise it is a calendar date `YYYY-MM-DD`, read
 * as that day at 00:00 UTC, or an ISO 8601 timestamp with an offset (`Z` or `+02:00`). The value is
 * always the UTC ISO timestamp with milliseconds.
 */
export function parseClosedAtCell(cell: string): CellResult<string | null> {
  const text = cell.trim()
  if (text === '') {
    return { ok: true, value: null }
  }
  const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (date) {
    const [year, month, day] = [Number(date[1]), Number(date[2]), Number(date[3])]
    const parsed = new Date(Date.UTC(year, month - 1, day))
    const real =
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    return real ? { ok: true, value: `${text}T00:00:00.000Z` } : INVALID_CELL
  }
  if (!z.iso.datetime({ offset: true }).max(64).safeParse(text).success) {
    return INVALID_CELL
  }
  const time = new Date(text)
  return Number.isNaN(time.getTime()) ? INVALID_CELL : { ok: true, value: time.toISOString() }
}

/** Reads the `amount` cell: blank is none; otherwise a non-negative decimal as {@link dealAmountSchema} describes (at most 999999999999999.99). */
export function parseAmountCell(cell: string): CellResult<string | null> {
  const text = cell.trim()
  if (text === '') {
    return { ok: true, value: null }
  }
  return dealAmountSchema.safeParse(text).success ? { ok: true, value: text } : INVALID_CELL
}

/** Reads the `currency` cell: blank is none; otherwise three letters, folded to upper case. A currency is required when an amount is present, which {@link checkDealImportRow} checks. */
export function parseCurrencyCell(cell: string): CellResult<string | null> {
  const text = cell.trim()
  if (text === '') {
    return { ok: true, value: null }
  }
  const result = dealCurrencySchema.safeParse(text.toUpperCase())
  return result.success && /^[A-Za-z]{3}$/.test(text)
    ? { ok: true, value: result.data }
    : INVALID_CELL
}

/** One CSV data row once its cells are read. */
export type ParsedDealImportRow = {
  readonly dealId: string
  readonly outcome: Outcome
  readonly closedAt: string | null
  readonly amount: string | null
  readonly currency: string | null
  readonly name: string | null
}

/** The answer of {@link checkDealImportRow}: the parsed row, or the one reason code of the report. */
export type CheckDealImportRowResult =
  | { readonly ok: true; readonly row: ParsedDealImportRow }
  | { readonly ok: false; readonly reason: DealImportRowReason }

/**
 * Reads one CSV record's cells (already split, so a quoted cell with a comma or a line break is one
 * cell; see {@link parseCsv}) against the template, so the portal and the service agree. Every cell
 * is trimmed; blank optional cells are none. Cell count must be 5, or 6 when the header has `name`
 * (`wrong_column_count`). The problems are reported in column order and only the first is returned:
 * `invalid_deal_id`, `invalid_outcome`, `invalid_closed_at`, `invalid_amount`, `invalid_currency`
 * (including an amount with no currency) and `invalid_name`. Whether the Deal is already decided,
 * repeated in the file or over the quota is the service's, as those need its data.
 */
export function checkDealImportRow(
  cells: readonly string[],
  hasName: boolean
): CheckDealImportRowResult {
  const reject = (reason: DealImportRowReason) => ({ ok: false, reason }) as const
  if (cells.length !== DEAL_IMPORT_REQUIRED_COLUMNS.length + (hasName ? 1 : 0)) {
    return reject('wrong_column_count')
  }
  const [dealCell = '', outcomeCell = '', closedCell = '', amountCell = '', currencyCell = ''] =
    cells
  const dealId = dealIdSchema.safeParse(dealCell)
  if (!dealId.success) {
    return reject('invalid_deal_id')
  }
  const outcome = parseOutcomeCell(outcomeCell)
  if (!outcome.ok) {
    return reject('invalid_outcome')
  }
  const closedAt = parseClosedAtCell(closedCell)
  if (!closedAt.ok) {
    return reject('invalid_closed_at')
  }
  const amount = parseAmountCell(amountCell)
  if (!amount.ok) {
    return reject('invalid_amount')
  }
  const currency = parseCurrencyCell(currencyCell)
  if (!currency.ok || (amount.value !== null && currency.value === null)) {
    return reject('invalid_currency')
  }
  let name: string | null = null
  const nameCell = (cells[DEAL_IMPORT_REQUIRED_COLUMNS.length] ?? '').trim()
  if (hasName && nameCell !== '') {
    const parsed = dealNameSchema.safeParse(nameCell)
    if (!parsed.success) {
      return reject('invalid_name')
    }
    name = parsed.data
  }
  return {
    ok: true,
    row: {
      dealId: dealId.data,
      outcome: outcome.value,
      closedAt: closedAt.value,
      amount: amount.value,
      currency: currency.value,
      name,
    },
  }
}

/**
 * Splits CSV text into records of cells (RFC 4180): cells may be double-quoted, `""` is a quote
 * inside one, and a quoted cell may hold commas and line breaks; a line break is `\n`, `\r\n` or
 * `\r`, a leading byte order mark is dropped, and one final line break does not add a record. It
 * returns `undefined` for an unterminated quote. The first record is the header, so **record
 * number** is the index plus one, with the header as record 1: a report's `rowNumber` is a record
 * number, and a quoted cell spanning lines is one record, so it can differ from the physical line.
 * A blank line is a record of one empty cell. It needs the whole text; a service that streams the
 * file may split records itself and must number them the same way.
 */
export function parseCsv(text: string): string[][] | undefined {
  const source = text.startsWith('\ufeff') ? text.slice(1) : text
  const records: string[][] = []
  let record: string[] = []
  let cell = ''
  let quoted = false
  let touched = false
  for (let index = 0; index < source.length; index += 1) {
    const char = source.charAt(index)
    if (quoted) {
      if (char === '"') {
        if (source.charAt(index + 1) === '"') {
          cell += '"'
          index += 1
        } else {
          quoted = false
        }
      } else {
        cell += char
      }
      continue
    }
    if (char === '"' && cell === '') {
      quoted = true
      touched = true
    } else if (char === ',') {
      record.push(cell)
      cell = ''
      touched = true
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source.charAt(index + 1) === '\n') {
        index += 1
      }
      record.push(cell)
      records.push(record)
      record = []
      cell = ''
      touched = false
    } else {
      cell += char
      touched = true
    }
  }
  if (quoted) {
    return undefined
  }
  if (touched || cell !== '') {
    record.push(cell)
    records.push(record)
  }
  return records
}
