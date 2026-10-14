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

/** The most Deal imports one Organization may have not yet finished (state `uploaded` or `processing`); a further upload is refused with `deal_import.busy` (429). */
export const MAX_QUEUED_DEAL_IMPORTS = 5

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

/** The longest header, its trimmed cells joined by commas, in characters; a longer one is refused. A valid header is under 50, so this only bounds padding-free garbage. It is about the trimmed content, not how much of the file is read: that is {@link DEAL_IMPORT_HEADER_PREFIX_CHARS}. */
export const MAX_DEAL_IMPORT_HEADER_LENGTH = 1024

/**
 * How much of the start of the file the upload route passes to {@link checkDealImportHeaderText}:
 * 8192 characters, more than the largest header that is valid under the cell limit (six cells of
 * 1000 characters, each also quoted, plus separators, a byte order mark and a line break, about
 * 6020). A header record that is still not finished at the end of a full prefix cannot be judged, so
 * the early check answers `{ ok: true, deferred: true }` (no refusal) and leaves the verdict to the
 * job; it never refuses a header it has only seen part of.
 */
export const DEAL_IMPORT_HEADER_PREFIX_CHARS = 8192

/** Why a CSV header was refused: a closed list, so the answer never echoes a cell. */
export const DEAL_IMPORT_HEADER_PROBLEMS = [
  'empty',
  'too_long',
  'missing_column',
  'unexpected_column',
  'wrong_order',
  'malformed_csv',
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
 * Checks the first record of a CSV against the fixed template: `deal_id,outcome,closed_at,amount,
 * currency` in that order, optionally followed by `name`. Column names are lower case and exact;
 * each cell is trimmed. It takes the record as {@link parseCsv} or {@link firstCsvRecord} produced
 * it, so quoting, a byte order mark and every line ending are already handled and both readers give
 * one verdict. A refusal is `deal_import.header_invalid` (422) and names a closed `problem`, never a
 * cell. The upload route calls {@link checkDealImportHeaderText} on the start of the file; the job
 * re-checks the first record of its full parse with this.
 */
export function checkDealImportHeader(record: readonly string[]): CheckDealImportHeaderResult {
  const refuse = (problem: DealImportHeaderProblem) =>
    ({ ok: false, code: 'deal_import.header_invalid', problem }) as const
  const cells = record.map((cell) => cell.trim())
  if (cells.length === 0 || (cells.length === 1 && cells[0] === '')) {
    return refuse('empty')
  }
  if (cells.join(',').length > MAX_DEAL_IMPORT_HEADER_LENGTH) {
    return refuse('too_long')
  }
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

/** The answer of {@link checkDealImportHeaderText}: the verdict, or `{ ok: true, deferred: true }` when the prefix ended before the header did and the job must decide. */
export type CheckDealImportHeaderTextResult =
  | CheckDealImportHeaderResult
  | { readonly ok: true; readonly deferred: true }

/**
 * The early header check of the upload route: reads the first record of the start of the file with
 * {@link firstCsvRecord} (the same rules and limits as the full parse) and checks it with
 * {@link checkDealImportHeader}. The caller passes the first `DEAL_IMPORT_HEADER_PREFIX_CHARS`
 * characters of the file (or all of it if shorter). If that is a full prefix and the header record is
 * still unfinished, the answer is `{ ok: true, deferred: true }`, not a refusal. A cell over the limit is
 * `too_long` and a quoting error is `malformed_csv`, and the verdict equals the one the job reaches
 * from the whole file.
 */
export function checkDealImportHeaderText(text: string): CheckDealImportHeaderTextResult {
  const cut = text.length >= DEAL_IMPORT_HEADER_PREFIX_CHARS
  const first = firstCsvRecord(text)
  if (!first.ok) {
    if (cut && first.failure === 'unterminated_quote') {
      return { ok: true, deferred: true }
    }
    return {
      ok: false,
      code: 'deal_import.header_invalid',
      problem: first.failure === 'cell_too_long' ? 'too_long' : 'malformed_csv',
    }
  }
  if (cut && !first.complete) {
    return { ok: true, deferred: true }
  }
  return checkDealImportHeader(first.record ?? [])
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
 * (ADR 0018, choice 5); `duplicate_in_file` is a deal id repeated after its first row; `blank_row`
 * is an interior blank line, reported so the report has no gap in its row numbers.
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
  'blank_row',
] as const

/** Why a row was rejected. */
export const dealImportRowReasonSchema = z.enum(DEAL_IMPORT_ROW_REASONS)

/** Why a row was rejected. */
export type DealImportRowReason = z.infer<typeof dealImportRowReasonSchema>

/** The answer of a CSV cell parser: the parsed value, or not valid. */
export type CellResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false }

const INVALID_CELL = { ok: false } as const

/** The earliest year a `closed_at` may have (inclusive), so a typo such as year 0001 or 9999 is caught. */
export const DEAL_CLOSED_AT_MIN_YEAR = 1970

/** The latest year a `closed_at` may have (inclusive). */
export const DEAL_CLOSED_AT_MAX_YEAR = 2100

/** Reads the `outcome` cell: `won`, `lost` or `open`, compared case-insensitively after trimming. A blank cell is not valid: the column is required. */
export function parseOutcomeCell(cell: string): CellResult<Outcome> {
  const result = outcomeSchema.safeParse(cell.trim().toLowerCase())
  return result.success ? { ok: true, value: result.data } : INVALID_CELL
}

/**
 * Reads the `closed_at` cell. Blank is none (`null`); `won` and `lost` do not require it, and an
 * `open` Deal may carry an expected close date. Otherwise it is a calendar date `YYYY-MM-DD`, read
 * as that day at 00:00 UTC, or an ISO 8601 timestamp with an offset (`Z` or `+02:00`). The value is
 * always the UTC ISO timestamp with milliseconds. The year, in UTC, must be from
 * `DEAL_CLOSED_AT_MIN_YEAR` (1970) to `DEAL_CLOSED_AT_MAX_YEAR` (2100) inclusive, else it is not valid.
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
    return real && year >= DEAL_CLOSED_AT_MIN_YEAR && year <= DEAL_CLOSED_AT_MAX_YEAR
      ? { ok: true, value: `${text}T00:00:00.000Z` }
      : INVALID_CELL
  }
  if (!z.iso.datetime({ offset: true }).max(64).safeParse(text).success) {
    return INVALID_CELL
  }
  const time = new Date(text)
  const year = time.getUTCFullYear()
  return Number.isNaN(time.getTime()) ||
    year < DEAL_CLOSED_AT_MIN_YEAR ||
    year > DEAL_CLOSED_AT_MAX_YEAR
    ? INVALID_CELL
    : { ok: true, value: time.toISOString() }
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
 * The longest cell {@link parseCsv} reads, in Unicode code points: 1000, the raw bound the deal id
 * and Deal name schemas allow before they trim. It only bounds memory; the row checks do the
 * reporting, so a name of 201 characters is a rejected row (`invalid_name`) and a valid name padded
 * with spaces still imports. A cell over 1000 characters, like a quoting error, fails the whole file.
 */
export const MAX_DEAL_IMPORT_CELL_LENGTH = 1000

/** Why a CSV could not be read: more records than allowed, a cell over the length limit, a quote that never closes, or a quote where RFC 4180 does not allow one. */
export const CSV_FAILURES = [
  'too_many_records',
  'cell_too_long',
  'unterminated_quote',
  'bad_quote',
] as const

/** Why a CSV could not be read. */
export type CsvFailure = (typeof CSV_FAILURES)[number]

/** The limits of a CSV read. */
export type CsvOptions = {
  /** The most records to read, header and blank records included; default `MAX_DEAL_IMPORT_ROWS + 1`. */
  readonly maxRecords?: number
  /** The longest cell, in Unicode code points; default `MAX_DEAL_IMPORT_CELL_LENGTH`. */
  readonly maxCellLength?: number
}

/** The answer of {@link parseCsv}: the records, or the failure and how many records were read before it. */
export type CsvResult =
  | { readonly ok: true; readonly records: string[][] }
  | { readonly ok: false; readonly failure: CsvFailure; readonly recordsRead: number }

/** The answer of {@link firstCsvRecord}: the first record (`undefined` for empty text) and whether a line break ended it, or the failure. */
export type FirstCsvRecordResult =
  | { readonly ok: true; readonly record: string[] | undefined; readonly complete: boolean }
  | { readonly ok: false; readonly failure: CsvFailure; readonly recordsRead: number }

const NEWLINE = 10
const RETURN = 13
const COMMA = 44
const QUOTE = 34

function readCsv(
  text: string,
  options: CsvOptions | undefined,
  firstOnly: boolean
): CsvResult & { complete?: boolean } {
  const maxRecords = options?.maxRecords ?? MAX_DEAL_IMPORT_ROWS + 1
  const maxCell = options?.maxCellLength ?? MAX_DEAL_IMPORT_CELL_LENGTH
  const length = text.length
  const records: string[][] = []
  let index = text.charCodeAt(0) === 0xfeff ? 1 : 0
  const fail = (failure: CsvFailure) =>
    ({ ok: false, failure, recordsRead: records.length }) as const
  while (index < length) {
    if (records.length >= maxRecords) {
      return fail('too_many_records')
    }
    const record: string[] = []
    let ended = false
    while (!ended) {
      let cell: string
      let count = 0
      if (text.charCodeAt(index) === QUOTE) {
        // A quoted cell: slice between quotes, and join pieces only where `""` escapes a quote.
        index += 1
        let segment = index
        let joined = ''
        for (;;) {
          if (index >= length) {
            return fail('unterminated_quote')
          }
          const code = text.charCodeAt(index)
          if (code === QUOTE) {
            if (text.charCodeAt(index + 1) === QUOTE) {
              joined += text.slice(segment, index + 1)
              count += 1
              index += 2
              segment = index
              if (count > maxCell) {
                return fail('cell_too_long')
              }
              continue
            }
            cell = joined === '' ? text.slice(segment, index) : joined + text.slice(segment, index)
            index += 1
            break
          }
          if (code < 0xdc00 || code > 0xdfff) {
            count += 1
            if (count > maxCell) {
              return fail('cell_too_long')
            }
          }
          index += 1
        }
        const next = text.charCodeAt(index)
        if (index < length && next !== COMMA && next !== NEWLINE && next !== RETURN) {
          return fail('bad_quote')
        }
      } else {
        const start = index
        while (index < length) {
          const code = text.charCodeAt(index)
          if (code === COMMA || code === NEWLINE || code === RETURN) {
            break
          }
          if (code === QUOTE) {
            return fail('bad_quote')
          }
          if (code < 0xdc00 || code > 0xdfff) {
            count += 1
            if (count > maxCell) {
              return fail('cell_too_long')
            }
          }
          index += 1
        }
        cell = text.slice(start, index)
      }
      record.push(cell)
      const code = index < length ? text.charCodeAt(index) : -1
      if (code === COMMA) {
        index += 1
        continue
      }
      ended = true
      if (code === RETURN && text.charCodeAt(index + 1) === NEWLINE) {
        index += 2
      } else if (code !== -1) {
        index += 1
      }
      records.push(record)
      if (firstOnly) {
        return { ok: true, records, complete: code !== -1 }
      }
    }
  }
  return { ok: true, records, complete: false }
}

/**
 * Splits CSV text into records of cells under strict RFC 4180: a cell may be double-quoted, `""` is
 * a quote inside one, and a quoted cell may hold commas and line breaks; a line break is `\n`, `\r\n`
 * or `\r`, a leading byte order mark is dropped, and one final line break does not add a record. A
 * quote inside an unquoted cell, or any text between a closing quote and the next comma or line
 * break, fails the whole file as `bad_quote`, and a quote that never closes is `unterminated_quote`;
 * there is no leniency.
 *
 * It stops as soon as a limit is passed, having built at most that much: more than
 * `options.maxRecords` records is `too_many_records` and a cell longer than `options.maxCellLength`
 * code points is `cell_too_long`, each with `recordsRead`. The caller passes
 * `maxRecords: MAX_DEAL_IMPORT_ROWS + 1` (the default): the header is record 1, and blank records
 * count toward the limit because they cost memory. It needs the whole text in memory (up to
 * `MAX_DEAL_IMPORT_BYTES`), so it belongs in a background job, never on a request path; the upload
 * route reads only the header, with {@link checkDealImportHeaderText}.
 *
 * The first record is the header, so the **record number** is the index plus one, with the header
 * as record 1: a report's `rowNumber` is a record number, and a quoted cell spanning lines is one
 * record, so it can differ from the physical line. A blank line is a record of one empty cell
 * ({@link isBlankCsvRecord}); a run of them at the end of the file is dropped, and an interior one is kept, so numbers match what a spreadsheet shows, and the caller
 * reports it as a rejected `blank_row` row.
 */
export function parseCsv(text: string, options?: CsvOptions): CsvResult {
  const result = readCsv(text, options, false)
  if (!result.ok) {
    return result
  }
  const records = result.records
  // A run of blank lines at the end of the file (a file ending in several newlines) is not data:
  // only an interior blank line, followed by a later non-blank record, stays a record.
  let end = records.length
  while (end > 1 && isBlankCsvRecord(records[end - 1] ?? [])) {
    end--
  }
  return { ok: true, records: end === records.length ? records : records.slice(0, end) }
}

/**
 * Reads only the first record of CSV text with the same rules and limits as {@link parseCsv}, and
 * stops there: a later bad record does not change its answer. `record` is `undefined` for empty text, and `complete` is whether a line break ended it (false when the text ran out first).
 */
export function firstCsvRecord(text: string, options?: CsvOptions): FirstCsvRecordResult {
  const result = readCsv(text, options, true)
  return result.ok
    ? { ok: true, record: result.records[0], complete: result.complete === true }
    : { ok: false, failure: result.failure, recordsRead: result.recordsRead }
}

/** Whether a CSV record is a blank line: one empty cell. A caller reports an interior one as a rejected `blank_row` row; it counts in the record number. {@link parseCsv} already drops a trailing run. */
export function isBlankCsvRecord(record: readonly string[]): boolean {
  return record.length === 1 && record[0] === ''
}
