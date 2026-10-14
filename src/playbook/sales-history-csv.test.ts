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
  checkDealImportRow,
  DEAL_IMPORT_HEADER_PREFIX_CHARS,
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
    expect(MAX_DEAL_IMPORT_CELL_LENGTH).toBe(1000)
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
    expect(parseCsv('a'.repeat(1000)).ok).toBe(true)
    expect(parseCsv('a'.repeat(1001)).ok).toBe(false)
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
    expect(parseCsv(astral.repeat(1000)).ok).toBe(true)
    expect(parseCsv(astral.repeat(1001)).ok).toBe(false)
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
    expect(firstCsvRecord(`a,b\nc,d\n`)).toEqual({ ok: true, record: ['a', 'b'], complete: true })
    expect(firstCsvRecord('')).toEqual({ ok: true, record: undefined, complete: false })
    expect(firstCsvRecord('"a\nb",c\nd')).toEqual({
      ok: true,
      record: ['a\nb', 'c'],
      complete: true,
    })
    expect(firstCsvRecord('a"b')).toEqual({ ok: false, failure: 'bad_quote', recordsRead: 0 })
    expect(firstCsvRecord('x'.repeat(5000))).toEqual({
      ok: false,
      failure: 'cell_too_long',
      recordsRead: 0,
    })
    // a bad later record does not change the verdict of the header
    expect(firstCsvRecord('a,b\n"unterminated')).toEqual({
      ok: true,
      record: ['a', 'b'],
      complete: true,
    })
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
    ['1970-01-01T00:00:00Z', false],
    ['2100-12-31T23:59:59Z', false],
  ])('%s is valid: %s', (cell, valid) => {
    expect(parseClosedAtCell(cell).ok).toBe(valid)
  })

  test('the Outcome request accepts a closing date for an open Deal, like the CSV', () => {
    expect(
      setDealOutcomeRequestSchema.safeParse({ outcome: 'open', closedAt: '2026-10-12' }).success
    ).toBe(true)
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

describe('a bad cell is a bad row, not a bad file (F17)', () => {
  const nameRow = (name: string) => `${HEADER},name
D-1,won,,,,${name}
`
  const rowOf = (text: string) => {
    const parsed = parseCsv(text)
    expect(parsed.ok).toBe(true)
    return parsed.ok ? (parsed.records[1] ?? []) : []
  }

  test('a 200-character name followed by padding imports', () => {
    const cells = rowOf(nameRow(`${'n'.repeat(200)}${' '.repeat(300)}`))
    expect(checkDealImportRow(cells, true)).toMatchObject({
      ok: true,
      row: { name: 'n'.repeat(200) },
    })
  })

  test('a 201-character name is a rejected row with invalid_name', () => {
    const cells = rowOf(nameRow('n'.repeat(201)))
    expect(checkDealImportRow(cells, true)).toEqual({ ok: false, reason: 'invalid_name' })
  })

  test('a cell over 1000 characters fails the whole file, like a quoting error', () => {
    expect(parseCsv(nameRow('n'.repeat(1001)))).toMatchObject({
      ok: false,
      failure: 'cell_too_long',
    })
    expect(parseCsv(nameRow('n'.repeat(1000))).ok).toBe(true)
  })

  test('the docs say a cell over the limit fails the whole file', () => {
    expect(SALES_HISTORY_ROUTES.uploadDealImport.description).toContain(
      'a cell over 1000 characters fails the whole file'
    )
  })
})

describe('the header prefix the upload route reads (F18)', () => {
  const pad = (text: string, width: number) => text + ' '.repeat(width - text.length)
  const cells = ['deal_id', 'outcome', 'closed_at', 'amount', 'currency', 'name']

  test('is large enough for a maximal header under the cell limit', () => {
    const maximal = `${cells.map((cell) => pad(cell, MAX_DEAL_IMPORT_CELL_LENGTH)).join(',')}\r\n`
    expect(maximal.length).toBeLessThan(DEAL_IMPORT_HEADER_PREFIX_CHARS)
    const quoted = `\ufeff${cells.map((cell) => `"${pad(cell, MAX_DEAL_IMPORT_CELL_LENGTH)}"`).join(',')}\r\n`
    expect(quoted.length).toBeLessThan(DEAL_IMPORT_HEADER_PREFIX_CHARS)
  })

  test('a header cut at the prefix gives the same verdict as the full file', () => {
    for (const header of [
      cells.map((cell) => pad(cell, MAX_DEAL_IMPORT_CELL_LENGTH)).join(','),
      `\ufeff${cells.map((cell) => `"${pad(cell, MAX_DEAL_IMPORT_CELL_LENGTH)}"`).join(',')}`,
    ]) {
      const full = `${header}\r\n${'D-1,won,,,,x\n'.repeat(5000)}`
      const cut = full.slice(0, DEAL_IMPORT_HEADER_PREFIX_CHARS)
      expect(checkDealImportHeaderText(cut)).toEqual({ ok: true, hasName: true })
      expect(checkDealImportHeaderText(full)).toEqual({ ok: true, hasName: true })
    }
  })

  test('a header longer than the prefix defers to the job instead of refusing', () => {
    const wide = Array.from({ length: 10 }, (_, index) =>
      pad(`c${index}`, MAX_DEAL_IMPORT_CELL_LENGTH)
    )
    const full = `${wide.join(',')}\n${'x\n'.repeat(100)}`
    expect(full.length).toBeGreaterThan(DEAL_IMPORT_HEADER_PREFIX_CHARS)
    expect(checkDealImportHeaderText(full.slice(0, DEAL_IMPORT_HEADER_PREFIX_CHARS))).toEqual({
      ok: true,
      deferred: true,
    })
    // cut inside a quoted cell: unterminated within the prefix, still not a refusal
    const quoted = `${Array.from({ length: 10 }, (_, index) => `"${pad(`q${index}`, 900)}"`).join(',')}\n`
    expect(checkDealImportHeaderText(quoted.slice(0, DEAL_IMPORT_HEADER_PREFIX_CHARS))).toEqual({
      ok: true,
      deferred: true,
    })
    // the job reaches its own verdict on the whole file
    const parsed = parseCsv(full)
    expect(parsed.ok && checkDealImportHeader(parsed.records[0] ?? [])).toMatchObject({
      ok: false,
      problem: 'unexpected_column',
    })
  })

  test('a short text with no line break is a whole file and is judged, not deferred', () => {
    expect(checkDealImportHeaderText('deal_id,outcome')).toMatchObject({
      ok: false,
      problem: 'missing_column',
    })
    expect(checkDealImportHeaderText(`${HEADER}`)).toEqual({ ok: true, hasName: false })
  })

  test('a real quoting error inside the prefix is still refused', () => {
    expect(
      checkDealImportHeaderText(`a"b,c\n${'x'.repeat(DEAL_IMPORT_HEADER_PREFIX_CHARS)}`)
    ).toMatchObject({
      ok: false,
      problem: 'malformed_csv',
    })
  })

  test('the import route description names the prefix', () => {
    expect(SALES_HISTORY_ROUTES.uploadDealImport.description).toContain('the first 8192 characters')
    expect(DEAL_IMPORT_HEADER_PREFIX_CHARS).toBe(8192)
  })
})

describe('slicing cells keeps the escaped-quote path correct (F18b)', () => {
  test('escaped quotes at the start, middle and end of a cell', () => {
    expect(parseCsv('"""a","b""c","d"""\n"x""""y"')).toEqual({
      ok: true,
      records: [['"a', 'b"c', 'd"'], ['x""y']],
    })
    expect(parseCsv('"a,""b""\nc",d')).toEqual({ ok: true, records: [['a,"b"\nc', 'd']] })
  })

  test('empty cells, trailing separators and a lone final cell', () => {
    expect(parseCsv('a,,b,\n,\n')).toEqual({
      ok: true,
      records: [
        ['a', '', 'b', ''],
        ['', ''],
      ],
    })
    expect(parseCsv(',')).toEqual({ ok: true, records: [['', '']] })
    expect(parseCsv('\n')).toEqual({ ok: true, records: [['']] })
  })

  test('a maximal valid file parses with modest memory', () => {
    const header = 'deal_id,outcome,closed_at,amount,currency,name\n'
    const row = (index: number) => `D-${index},won,2026-10-12,10.50,EUR,${'n'.repeat(120)}\n`
    const text = header + Array.from({ length: 50_000 }, (_, index) => row(index)).join('')
    expect(text.length).toBeGreaterThan(7_000_000)
    Bun.gc(true)
    const before = process.memoryUsage().heapUsed
    const started = performance.now()
    const parsed = parseCsv(text)
    const elapsed = performance.now() - started
    const grown = process.memoryUsage().heapUsed - before
    expect(parsed.ok && parsed.records.length).toBe(50_001)
    expect(elapsed).toBeLessThan(3000)
    expect(grown).toBeLessThan(120 * 1024 * 1024)
  })
})

describe('trailing blank records (hub #72)', () => {
  const blankIndexes = (text: string) => {
    const result = parseCsv(text)
    if (!result.ok) {
      throw new Error('unreadable')
    }
    return result.records.flatMap((record, index) => (isBlankCsvRecord(record) ? [index + 1] : []))
  }

  test('a run of blank lines at the end of the file is not a record', () => {
    for (const eol of ['\n', '\r\n']) {
      const text = `${HEADER}${eol}D-1,won,,,${eol}${eol}${eol}`
      const result = parseCsv(text)
      expect(result.ok && result.records.length).toBe(2)
      expect(blankIndexes(text)).toEqual([])
    }
  })

  test('an interior blank line is still a record, with its record number', () => {
    for (const eol of ['\n', '\r\n']) {
      const text = `${HEADER}${eol}${eol}D-1,won,,,${eol}${eol}D-2,won,,,${eol}${eol}`
      const result = parseCsv(text)
      expect(result.ok && result.records.length).toBe(5)
      expect(blankIndexes(text)).toEqual([2, 4])
    }
  })
})
