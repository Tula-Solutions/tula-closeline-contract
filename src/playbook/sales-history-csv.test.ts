import { describe, expect, test } from 'bun:test'
import { id, NOW } from '../core/fixtures'
import { decodeCursor, encodeCursor } from '../pagination'
import {
  CALL_FAILURE_FIXES,
  CALL_FAILURE_REASONS,
  callCursorSchema,
  callReuploadRequeues,
  callSchema,
  checkDealImportHeader,
  checkDealImportHeaderText,
  dealCursorSchema,
  dealImportCursorSchema,
  dealImportRowCursorSchema,
  firstCsvRecord,
  isBlankCsvRecord,
  listCallsQuerySchema,
  listDealsQuerySchema,
  lookupDealRequestSchema,
  MAX_DEAL_IMPORT_CELL_LENGTH,
  MAX_DEAL_IMPORT_ROWS,
  parseClosedAtCell,
  parseCsv,
  repChangeAllowed,
  SALES_HISTORY_ERRORS,
  SALES_HISTORY_ROUTES,
  setDealOutcomeRequestSchema,
} from './index'

const TEN_MB = 10 * 1024 * 1024
const HEADER = 'deal_id,outcome,closed_at,amount,currency'

const call = {
  id: id('call'),
  dealId: 'D-100',
  dealRecordId: id('deal'),
  dealOutcome: 'won',
  inSearch: false,
  kind: 'transcript',
  fileName: 'call.vtt',
  mediaType: 'text/vtt',
  sizeBytes: 1000,
  durationSeconds: null,
  state: 'failed',
  failureReason: 'too_many_speakers',
  rep: null,
  speakerLabels: [],
  deletedAt: null,
  purgeAt: null,
  uploadedByUserId: id('usr'),
  createdAt: NOW,
  updatedAt: NOW,
}

describe('parseCsv limits (F12)', () => {
  test('the cell limit is the longest column limit', () => {
    expect(MAX_DEAL_IMPORT_CELL_LENGTH).toBe(200)
  })

  test('10 MB of bare line breaks stops at the record limit having read at most that many', () => {
    const started = performance.now()
    const result = parseCsv('\n'.repeat(TEN_MB), { maxRecords: MAX_DEAL_IMPORT_ROWS + 1 })
    expect(performance.now() - started).toBeLessThan(2000)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.failure).toBe('too_many_records')
      expect(result.recordsRead).toBe(MAX_DEAL_IMPORT_ROWS + 1)
    }
  })

  test('10 MB of CR-only line breaks stop the same way', () => {
    const result = parseCsv('\r'.repeat(TEN_MB))
    expect(result).toEqual({
      ok: false,
      failure: 'too_many_records',
      recordsRead: MAX_DEAL_IMPORT_ROWS + 1,
    })
  })

  test('a 10 MB unterminated quote stops at the cell limit, not at the end of the text', () => {
    const started = performance.now()
    const result = parseCsv(`"${'a'.repeat(TEN_MB)}`)
    expect(performance.now() - started).toBeLessThan(2000)
    expect(result).toEqual({ ok: false, failure: 'cell_too_long', recordsRead: 0 })
  })

  test('a 10 MB single cell stops at the cell limit', () => {
    const started = performance.now()
    const result = parseCsv('a'.repeat(TEN_MB))
    expect(performance.now() - started).toBeLessThan(2000)
    expect(result).toEqual({ ok: false, failure: 'cell_too_long', recordsRead: 0 })
  })

  test('the limits are exact: the maximum passes and one over fails', () => {
    expect(parseCsv('a'.repeat(200)).ok).toBe(true)
    expect(parseCsv('a'.repeat(201)).ok).toBe(false)
    expect(parseCsv('x\n'.repeat(5), { maxRecords: 5 }).ok).toBe(true)
    expect(parseCsv('x\n'.repeat(6), { maxRecords: 5 })).toEqual({
      ok: false,
      failure: 'too_many_records',
      recordsRead: 5,
    })
    expect(parseCsv('a,b', { maxCellLength: 1 }).ok).toBe(true)
    expect(parseCsv('a,bb', { maxCellLength: 1 }).ok).toBe(false)
  })

  test('a cell length counts code points', () => {
    const astral = String.fromCodePoint(0x1f600)
    expect(parseCsv(astral.repeat(200)).ok).toBe(true)
    expect(parseCsv(astral.repeat(201)).ok).toBe(false)
  })

  test('an unterminated quote that stays within the limit is reported at the end', () => {
    expect(parseCsv('a,"b')).toEqual({ ok: false, failure: 'unterminated_quote', recordsRead: 0 })
  })

  test('a valid file returns its records', () => {
    expect(parseCsv('a,b\r\n"x,y","he said ""hi"""\n')).toEqual({
      ok: true,
      records: [
        ['a', 'b'],
        ['x,y', 'he said "hi"'],
      ],
    })
    expect(parseCsv('')).toEqual({ ok: true, records: [] })
  })
})

describe('strict quoting (F15)', () => {
  test.each([
    ['text after a closing quote', '"ab"c,d'],
    ['a quote inside an unquoted cell', 'ab"c,d'],
    ['a quote after a space-led cell', 'a, "b"'],
  ])('%s is bad_quote', (_name, text) => {
    expect(parseCsv(text)).toEqual({ ok: false, failure: 'bad_quote', recordsRead: 0 })
  })

  test('a quoted cell ends only at a comma or a line break', () => {
    expect(parseCsv('"a",b\n"c"')).toEqual({ ok: true, records: [['a', 'b'], ['c']] })
    expect(parseCsv('"a""b"')).toEqual({ ok: true, records: [['a"b']] })
    expect(parseCsv('""')).toEqual({ ok: true, records: [['']] })
  })

  test('blank records are kept so row numbers match a spreadsheet, and are recognised', () => {
    const result = parseCsv(`${HEADER}\n\nD-1,won,,,\n`)
    expect(result.ok && result.records.length).toBe(3)
    expect(result.ok && isBlankCsvRecord(result.records[1] ?? [])).toBe(true)
    expect(result.ok && isBlankCsvRecord(result.records[2] ?? [])).toBe(false)
    expect(isBlankCsvRecord([''])).toBe(true)
    expect(isBlankCsvRecord(['', ''])).toBe(false)
    expect(isBlankCsvRecord([])).toBe(false)
  })
})

describe('one reader for the header (F14)', () => {
  const files = [
    HEADER,
    `${HEADER},name`,
    `${HEADER}\rD-1,won,,,`,
    `${HEADER}\r\nD-1,won,,,`,
    `﻿${HEADER}\n`,
    '"deal_id",outcome,closed_at,amount,"currency"\n',
    'deal_id,outcome,closed_at,amount\nD-1',
    `deal_id,"out\ncome",closed_at,amount,currency\n`,
    'deal_id,"out\rcome",closed_at,amount,currency\r',
    'deal_id,outcome,closed_at,amount,currency,notes',
    'outcome,deal_id,closed_at,amount,currency',
    '',
    '   \n',
    'a"b,c',
    '"unterminated',
    'x'.repeat(5000),
  ]

  test.each(files.map((text) => [JSON.stringify(text).slice(0, 50), text]))(
    'the text path and the record path agree on %s',
    (_name, text) => {
      const parsed = parseCsv(text)
      const fromParse = parsed.ok ? checkDealImportHeader(parsed.records[0] ?? []) : undefined
      const fromText = checkDealImportHeaderText(text)
      if (fromParse !== undefined) {
        expect(fromText).toEqual(fromParse)
      } else {
        expect(fromText.ok).toBe(false)
      }
    }
  )

  test('a CR-only file reads its header', () => {
    expect(checkDealImportHeaderText(`${HEADER}\rD-1,won,,,\r`)).toEqual({
      ok: true,
      hasName: false,
    })
  })

  test('a header cell with a quoted line break is refused by both paths', () => {
    const text = 'deal_id,"out\ncome",closed_at,amount,currency'
    const both = { ok: false, code: 'deal_import.header_invalid', problem: 'unexpected_column' }
    expect(checkDealImportHeaderText(text)).toEqual(both as never)
    const parsed = parseCsv(text)
    expect(parsed.ok && checkDealImportHeader(parsed.records[0] ?? [])).toEqual(both as never)
  })

  test('firstCsvRecord reads only the first record, with the same limits', () => {
    expect(firstCsvRecord(`a,b\nc,d\n`)).toEqual({ ok: true, record: ['a', 'b'] })
    expect(firstCsvRecord('')).toEqual({ ok: true, record: undefined })
    expect(firstCsvRecord('"a\nb",c\nd')).toEqual({ ok: true, record: ['a\nb', 'c'] })
    expect(firstCsvRecord('a"b')).toEqual({ ok: false, failure: 'bad_quote', recordsRead: 0 })
    expect(firstCsvRecord('x'.repeat(5000))).toEqual({
      ok: false,
      failure: 'cell_too_long',
      recordsRead: 0,
    })
    // a bad later record does not change the verdict of the header
    expect(firstCsvRecord('a,b\n"unterminated')).toEqual({ ok: true, record: ['a', 'b'] })
  })

  test('the import route says which reader the upload uses and that the job re-checks', () => {
    const text = SALES_HISTORY_ROUTES.uploadDealImport.description
    expect(text).toContain('checkDealImportHeaderText')
    expect(text).toContain('the job re-checks')
  })

  test('header problems include a malformed file', () => {
    expect(checkDealImportHeaderText('a"b')).toMatchObject({ ok: false, problem: 'malformed_csv' })
    expect(checkDealImportHeaderText('x'.repeat(5000))).toMatchObject({
      ok: false,
      problem: 'too_long',
    })
  })
})

describe('closed_at years (F15)', () => {
  test.each([
    ['1970-01-01', true],
    ['2100-12-31', true],
    ['1969-12-31', false],
    ['2101-01-01', false],
    ['0001-01-01', false],
    ['9999-12-31', false],
    ['1970-01-01T00:00:00Z', true],
    ['2100-12-31T23:59:59Z', true],
    ['1969-12-31T23:59:59Z', false],
    ['2101-01-01T00:00:00Z', false],
    ['1970-01-01T00:30:00+01:00', false],
  ])('%s is valid: %s', (cell, valid) => {
    expect(parseClosedAtCell(cell).ok).toBe(valid)
  })

  test('the Outcome request accepts a closing time for an open Deal, like the CSV', () => {
    expect(setDealOutcomeRequestSchema.safeParse({ outcome: 'open', closedAt: NOW }).success).toBe(
      true
    )
    expect(setDealOutcomeRequestSchema.safeParse({ outcome: 'open', closedAt: null }).success).toBe(
      true
    )
    expect(setDealOutcomeRequestSchema.safeParse({ outcome: 'open' }).success).toBe(true)
  })
})

describe('customer deal ids stay out of URLs (F13)', () => {
  test('cursors hold a position on the opaque id and never a deal id', () => {
    for (const [schema, prefix] of [
      [callCursorSchema, 'call'],
      [dealCursorSchema, 'deal'],
      [dealImportCursorSchema, 'dimp'],
    ] as const) {
      const position = { createdAt: NOW, id: id(prefix) }
      const cursor = encodeCursor(position)
      const decoded = decodeCursor(cursor, schema)
      expect(Object.keys(decoded ?? {}).sort()).toEqual(['createdAt', 'id'])
      expect(JSON.stringify(decoded)).not.toContain('dealId')
      expect(schema.safeParse({ ...position, dealId: 'D-1' } as never).success).toBe(false)
    }
    expect(dealImportRowCursorSchema.safeParse({ rowNumber: 5 }).success).toBe(true)
    expect(dealImportRowCursorSchema.safeParse({ rowNumber: 5, dealId: 'D-1' }).success).toBe(false)
    expect(dealCursorSchema.safeParse({ createdAt: NOW, id: 'D-100' }).success).toBe(false)
  })

  test('the list queries have no dealId filter', () => {
    expect(listDealsQuerySchema.safeParse({ dealId: 'D-1' }).success).toBe(false)
    expect(listCallsQuerySchema.safeParse({ dealId: 'D-1' }).success).toBe(false)
    expect(listCallsQuerySchema.parse({ dealRecordId: id('deal') })).toEqual({
      dealRecordId: id('deal'),
      limit: 25,
    } as never)
    expect(listCallsQuerySchema.safeParse({ dealRecordId: 'D-1' }).success).toBe(false)
  })

  test('a lookup route takes the deal id in a POST body', () => {
    expect(lookupDealRequestSchema.parse({ dealId: ' D-1 ' })).toEqual({ dealId: 'D-1' })
    expect(lookupDealRequestSchema.safeParse({}).success).toBe(false)
    expect(lookupDealRequestSchema.safeParse({ dealId: '' }).success).toBe(false)
    expect(lookupDealRequestSchema.safeParse({ dealId: 'D', x: 1 }).success).toBe(false)
    const route = SALES_HISTORY_ROUTES.lookupDeal
    expect(route.method).toBe('POST')
    expect(route.path).toBe('/playbook/deals/lookup')
    expect([...route.roles]).toEqual(['owner', 'admin'])
    expect(route.errors).toEqual(['deal.not_found'])
    expect(SALES_HISTORY_ERRORS['deal.not_found'].status).toBe(404)
  })

  test('no route path or description puts a customer deal id in a query string', () => {
    for (const [, route] of Object.entries(SALES_HISTORY_ROUTES)) {
      expect(route.path).not.toMatch(/\{dealId\}/)
      expect(route.description).not.toMatch(/dealId=|dealId filter|filter by dealId/)
    }
    expect(SALES_HISTORY_ROUTES.listDeals.description).toContain('createdAt, then id')
    expect(SALES_HISTORY_ROUTES.listCalls.description).toContain('dealRecordId')
  })
})

describe('failure reasons and what fixes them (F16)', () => {
  test('every reason is in the table, and the table agrees with repChangeAllowed', () => {
    expect(Object.keys(CALL_FAILURE_FIXES).sort()).toEqual([...CALL_FAILURE_REASONS].sort())
    for (const reason of CALL_FAILURE_REASONS) {
      expect(repChangeAllowed('failed', reason)).toBe(CALL_FAILURE_FIXES[reason] === 'change_rep')
    }
  })

  test('the table', () => {
    expect(CALL_FAILURE_FIXES).toEqual({
      rep_label_not_found: 'change_rep',
      not_per_side: 'change_rep',
      transcription_failed: 'reupload',
      transcription_timed_out: 'reupload',
      processing_failed: 'reupload',
      too_many_speakers: 'delete_and_upload',
      no_turns: 'delete_and_upload',
      too_few_speakers: 'delete_and_upload',
      too_long: 'delete_and_upload',
      unreadable: 'delete_and_upload',
    })
  })

  test('a same-Deal re-upload re-queues only a reason that can be transient', () => {
    for (const reason of CALL_FAILURE_REASONS) {
      expect(callReuploadRequeues(reason)).toBe(CALL_FAILURE_FIXES[reason] === 'reupload')
    }
    expect(callReuploadRequeues(null)).toBe(false)
  })

  test('the upload description and the Rep description say so', () => {
    const upload = SALES_HISTORY_ROUTES.uploadCall.description
    expect(upload).toContain('transcription_failed, transcription_timed_out or processing_failed')
    expect(upload).toContain('answers 200 with the failed Call unchanged')
    expect(upload).toContain('delete the Call and upload a corrected file')
  })

  test('a failed Call with too_many_speakers has no speaker labels', () => {
    expect(callSchema.safeParse(call).success).toBe(true)
    expect(callSchema.safeParse({ ...call, speakerLabels: ['A'] }).success).toBe(false)
    expect(
      callSchema.safeParse({ ...call, failureReason: 'no_turns', speakerLabels: ['A'] }).success
    ).toBe(true)
  })
})
