import { describe, expect, test } from 'bun:test'
import { id, NOW } from '../core/fixtures'
import { ERRORS } from '../errors'
import { dealRecordIdSchema } from '../ids'
import { MAX_PAGE_SIZE } from '../pagination'
import {
  ACCEPTED_RECORDING_EXTENSIONS,
  ACCEPTED_TRANSCRIPT_EXTENSIONS,
  CALL_DELETED_MESSAGE,
  CALL_FAILURE_REASONS,
  CALL_MEDIA_TYPES,
  CALL_REP_CHANGED_MESSAGE,
  CALL_STATES,
  CALL_TRANSCRIBED_MESSAGE,
  CALL_UPLOADED_MESSAGE,
  callDeletedPayloadSchema,
  callParamsSchema,
  callRepChangedPayloadSchema,
  callSchema,
  callUploadedPayloadSchema,
  checkCallFile,
  checkDealImportHeaderText,
  checkDealImportRow,
  confirmRightsRequestSchema,
  DEAL_IMPORT_ROW_REASONS,
  DEAL_IMPORT_STATES,
  DEAL_IMPORT_UPLOADED_MESSAGE,
  DEAL_OUTCOME_CHANGED_MESSAGE,
  dealIdSchema,
  dealImportRowSchema,
  dealImportSchema,
  dealNameSchema,
  dealOutcomeChangedPayloadSchema,
  dealParamsSchema,
  dealSchema,
  hasStrippableCharacter,
  INCOMPLETE_UPLOAD_PARTS_TTL_HOURS,
  listCallsQuerySchema,
  listCallsResponseSchema,
  listDealImportRowsQuerySchema,
  listDealImportRowsResponseSchema,
  listDealsQuerySchema,
  MAX_CALL_SPEAKERS,
  MAX_DEAL_ID_BYTES,
  MAX_DEAL_ID_LENGTH,
  MAX_DEAL_IMPORT_BYTES,
  MAX_DEAL_IMPORT_ROWS,
  MAX_DEAL_NAME_BYTES,
  MAX_DEAL_NAME_LENGTH,
  MAX_DOCUMENT_FILE_NAME_BYTES,
  MAX_RECORDING_BYTES,
  MAX_RECORDING_SECONDS,
  MAX_REP_FOLLOWING_CHARACTERS,
  MAX_REP_FOLLOWING_TURNS,
  MAX_RIGHTS_WORDING_VERSION,
  MAX_SEQ,
  MAX_SPEAKER_LABEL_BYTES,
  MAX_SPEAKER_LABEL_LENGTH,
  MAX_TRANSCRIPT_BYTES,
  MAX_UTF8_BYTES_PER_CODE_POINT,
  MEDIA_TYPE_BY_CALL_EXTENSION,
  normaliseDealId,
  normaliseSpeakerLabel,
  PLAYBOOK_ERRORS,
  parseAmountCell,
  parseClosedAtCell,
  parseCsv,
  parseCurrencyCell,
  parseOutcomeCell,
  parseRepField,
  repChangeAllowed,
  repChoiceSchema,
  repChoiceSuits,
  rightsConfirmationSchema,
  rightsRequiredDetailsSchema,
  rightsStatusSchema,
  SALES_HISTORY_ERRORS,
  SALES_HISTORY_READ_ROLES,
  SALES_HISTORY_ROUTES,
  setCallRepRequestSchema,
  setDealOutcomeRequestSchema,
  speakerLabelSchema,
  uploadCallFieldsSchema,
} from './index'

const ch = (code: number) => String.fromCharCode(code)
const RLO = ch(0x202e)
const ZWSP = ch(0x200b)

const call = {
  id: id('call'),
  dealId: 'D-100',
  dealRecordId: id('deal'),
  dealOutcome: 'won',
  inSearch: true,
  kind: 'transcript',
  fileName: 'call.vtt',
  mediaType: 'text/vtt',
  sizeBytes: 1000,
  durationSeconds: null,
  state: 'ready',
  failureReason: null,
  rep: { by: 'speaker', label: 'Alice' },
  speakerLabels: ['Alice', 'Bob'],
  deletedAt: null,
  purgeAt: null,
  uploadedByUserId: id('usr'),
  createdAt: NOW,
  updatedAt: NOW,
}

describe('Call states, reasons and limits', () => {
  test('the states are the seven of the whole life', () => {
    expect([...CALL_STATES]).toEqual([
      'uploaded',
      'transcribing',
      'awaiting_rep',
      'processing',
      'ready',
      'failed',
      'deleted',
    ])
  })

  test('the failure reasons are a closed list', () => {
    expect([...CALL_FAILURE_REASONS]).toEqual([
      'no_turns',
      'too_few_speakers',
      'too_many_speakers',
      'rep_label_not_found',
      'not_per_side',
      'too_long',
      'transcription_failed',
      'transcription_timed_out',
      'unreadable',
      'processing_failed',
    ])
  })

  test('the limits and chosen constants', () => {
    expect(MAX_TRANSCRIPT_BYTES).toBe(5_242_880)
    expect(MAX_RECORDING_BYTES).toBe(524_288_000)
    expect(MAX_RECORDING_SECONDS).toBe(10_800)
    expect(MAX_DEAL_IMPORT_BYTES).toBe(10_485_760)
    expect(MAX_DEAL_IMPORT_ROWS).toBe(50_000)
    expect(MAX_DEAL_ID_LENGTH).toBe(128)
    expect(MAX_REP_FOLLOWING_TURNS).toBe(5)
    expect(MAX_REP_FOLLOWING_CHARACTERS).toBe(4000)
    expect(INCOMPLETE_UPLOAD_PARTS_TTL_HOURS).toBe(24)
    expect(MAX_SEQ).toBe(2_147_483_647)
  })

  test('every accepted extension has one media type, and the media types are the listed ones', () => {
    const extensions = [...ACCEPTED_TRANSCRIPT_EXTENSIONS, ...ACCEPTED_RECORDING_EXTENSIONS]
    expect(Object.keys(MEDIA_TYPE_BY_CALL_EXTENSION).sort()).toEqual([...extensions].sort())
    expect(Object.values(MEDIA_TYPE_BY_CALL_EXTENSION).sort()).toEqual([...CALL_MEDIA_TYPES].sort())
  })
})

describe('Rep choice', () => {
  test('is a speaker label or a channel', () => {
    expect(repChoiceSchema.parse({ by: 'speaker', label: ' Alice ' })).toEqual({
      by: 'speaker',
      label: 'Alice',
    })
    expect(repChoiceSchema.parse({ by: 'channel', channel: 'left' })).toEqual({
      by: 'channel',
      channel: 'left',
    })
  })

  test.each([
    ['an unknown discriminator', { by: 'guess' }],
    ['a channel that is not left or right', { by: 'channel', channel: 'centre' }],
    ['a channel number', { by: 'channel', channel: 1 }],
    ['a speaker with no label', { by: 'speaker' }],
    ['an empty label', { by: 'speaker', label: '  ' }],
    ['a label of only direction characters', { by: 'speaker', label: RLO }],
    ['a label over 64', { by: 'speaker', label: 'a'.repeat(65) }],
    ['a label with a lone surrogate', { by: 'speaker', label: `a${ch(0xd800)}` }],
    ['both fields', { by: 'speaker', label: 'a', channel: 'left' }],
    ['null', null],
  ])('rejects %s', (_name, value) => {
    expect(repChoiceSchema.safeParse(value).success).toBe(false)
  })

  test('a label has control and direction characters stripped, like a file name', () => {
    expect(speakerLabelSchema.parse(`Al${RLO}ice\n`)).toBe('Alice')
    expect(normaliseSpeakerLabel(` ${RLO}A `)).toBe('A')
  })

  test('which choice suits which kind at upload and on change', () => {
    const label = { by: 'speaker', label: 'A' } as const
    const channel = { by: 'channel', channel: 'left' } as const
    expect(repChoiceSuits('transcript', label, 'upload')).toBe(true)
    expect(repChoiceSuits('transcript', channel, 'upload')).toBe(false)
    expect(repChoiceSuits('transcript', undefined, 'upload')).toBe(false)
    expect(repChoiceSuits('recording', channel, 'upload')).toBe(true)
    expect(repChoiceSuits('recording', undefined, 'upload')).toBe(true)
    expect(repChoiceSuits('recording', null, 'upload')).toBe(true)
    expect(repChoiceSuits('recording', label, 'upload')).toBe(false)
    expect(repChoiceSuits('recording', label, 'change')).toBe(true)
    expect(repChoiceSuits('recording', channel, 'change')).toBe(true)
    expect(repChoiceSuits('recording', null, 'change')).toBe(false)
    expect(repChoiceSuits('transcript', channel, 'change')).toBe(false)
  })

  test('the set-Rep body needs a choice and nothing else', () => {
    expect(
      setCallRepRequestSchema.safeParse({ rep: { by: 'channel', channel: 'right' } }).success
    ).toBe(true)
    expect(setCallRepRequestSchema.safeParse({ rep: null }).success).toBe(false)
    expect(setCallRepRequestSchema.safeParse({}).success).toBe(false)
    expect(
      setCallRepRequestSchema.safeParse({ rep: { by: 'channel', channel: 'right' }, x: 1 }).success
    ).toBe(false)
  })

  test('parseRepField tells absent, valid and invalid apart', () => {
    expect(parseRepField(undefined)).toEqual({ ok: true, rep: null })
    expect(parseRepField('{"by":"channel","channel":"left"}')).toEqual({
      ok: true,
      rep: { by: 'channel', channel: 'left' },
    })
    const invalid = { ok: false, code: 'call.rep_invalid' }
    for (const bad of [
      '',
      ' ',
      'nope',
      '{"by":"x"}',
      '[]',
      'null',
      `{"by":"speaker","label":"${'a'.repeat(600)}"}`,
    ]) {
      expect(parseRepField(bad)).toEqual(invalid as never)
    }
  })
})

describe('callSchema', () => {
  test('accepts a ready Transcript and strips unknown keys (no text)', () => {
    expect(callSchema.parse({ ...call, text: 'secret' })).toEqual(call as never)
  })

  test('accepts the shape of each state', () => {
    const recording = {
      ...call,
      kind: 'recording',
      fileName: 'a.mp3',
      mediaType: 'audio/mpeg',
      durationSeconds: 60,
    }
    expect(
      callSchema.safeParse({ ...recording, state: 'transcribing', rep: null, inSearch: false })
        .success
    ).toBe(true)
    expect(
      callSchema.safeParse({
        ...recording,
        state: 'awaiting_rep',
        rep: null,
        inSearch: false,
        speakerLabels: ['A', 'B'],
      }).success
    ).toBe(true)
    expect(callSchema.safeParse({ ...call, state: 'processing', inSearch: false }).success).toBe(
      true
    )
    expect(
      callSchema.safeParse({ ...call, state: 'failed', failureReason: 'no_turns', inSearch: false })
        .success
    ).toBe(true)
    expect(
      callSchema.safeParse({
        ...call,
        state: 'deleted',
        deletedAt: NOW,
        purgeAt: NOW,
        inSearch: false,
      }).success
    ).toBe(true)
  })

  test.each([
    ['failed without a reason', { state: 'failed' }],
    ['a reason on a ready Call', { failureReason: 'no_turns' }],
    ['free text as a reason', { state: 'failed', failureReason: 'the call said x' }],
    ['deleted without a purge time', { state: 'deleted', deletedAt: NOW }],
    ['a purge time on a ready Call', { purgeAt: NOW }],
    ['awaiting_rep with a Rep', { kind: 'recording', state: 'awaiting_rep' }],
    ['ready with no Rep', { rep: null }],
    ['a transcribing Transcript', { state: 'transcribing' }],
    ['an unknown state', { state: 'purged' }],
    ['a media type that is not accepted', { mediaType: 'text/html' }],
    ['a duration over 3 hours', { durationSeconds: MAX_RECORDING_SECONDS + 1 }],
    ['an id of the wrong kind', { id: id('doc') }],
    [
      'one more speaker label than the cap',
      { speakerLabels: Array.from({ length: 21 }, (_, i) => `S${i}`) },
    ],
    ['a repeated speaker label', { speakerLabels: ['Alice', 'Alice'] }],
    [
      'a kind that disagrees with the media type (audio for a Transcript)',
      { mediaType: 'audio/mpeg' },
    ],
    [
      'a kind that disagrees with the media type (text for a Recording)',
      { kind: 'recording', state: 'processing', mediaType: 'text/vtt', durationSeconds: 5 },
    ],
    ['a Transcript with a duration', { durationSeconds: 60 }],
    ['a Transcript over the Transcript size limit', { sizeBytes: MAX_TRANSCRIPT_BYTES + 1 }],
    [
      'a ready Call whose Rep label is not among its speakers',
      { rep: { by: 'speaker', label: 'Carol' } },
    ],
    ['a bad deal id', { dealId: '' }],
  ])('rejects %s', (_name, change) => {
    expect(callSchema.safeParse({ ...call, ...change }).success).toBe(false)
  })

  test('sanitises a stored name on the way out', () => {
    expect(callSchema.parse({ ...call, fileName: `a${RLO}b.vtt` }).fileName).toBe('ab.vtt')
  })
})

describe('speaker cap', () => {
  test('is 20: exactly the cap parses, one over is refused and never reaches a response', () => {
    expect(MAX_CALL_SPEAKERS).toBe(20)
    const labels = (n: number) => Array.from({ length: n }, (_, i) => `S${i}`)
    expect(
      callSchema.safeParse({
        ...call,
        rep: null,
        state: 'processing',
        inSearch: false,
        speakerLabels: labels(20),
      }).success
    ).toBe(true)
    expect(
      callSchema.safeParse({
        ...call,
        rep: null,
        state: 'processing',
        inSearch: false,
        speakerLabels: labels(21),
      }).success
    ).toBe(false)
  })

  test('a ready Recording with a channel Rep needs no label match', () => {
    expect(
      callSchema.safeParse({
        ...call,
        kind: 'recording',
        fileName: 'a.mp3',
        mediaType: 'audio/mpeg',
        durationSeconds: 5,
        rep: { by: 'channel', channel: 'left' },
      }).success
    ).toBe(true)
  })
})

describe('repChangeAllowed', () => {
  test('is true for ready, awaiting_rep and failed with a Rep-related reason', () => {
    expect(repChangeAllowed('ready', null)).toBe(true)
    expect(repChangeAllowed('awaiting_rep', null)).toBe(true)
    expect(repChangeAllowed('failed', 'rep_label_not_found')).toBe(true)
    expect(repChangeAllowed('failed', 'not_per_side')).toBe(true)
  })

  test('is false for every other state and failure reason', () => {
    for (const state of ['uploaded', 'transcribing', 'processing', 'deleted'] as const) {
      expect(repChangeAllowed(state, null)).toBe(false)
    }
    for (const reason of CALL_FAILURE_REASONS) {
      expect(repChangeAllowed('failed', reason)).toBe(
        reason === 'rep_label_not_found' || reason === 'not_per_side'
      )
    }
    expect(repChangeAllowed('failed', null)).toBe(false)
  })
})

describe('direct helpers', () => {
  test('SALES_HISTORY_READ_ROLES is Owner and Admin, the owner decision of 2026-10-13', () => {
    expect([...SALES_HISTORY_READ_ROLES]).toEqual(['owner', 'admin'])
  })

  test('hasStrippableCharacter finds control and direction characters only', () => {
    expect(hasStrippableCharacter('plain text é 日本')).toBe(false)
    expect(hasStrippableCharacter(`a${ch(0)}`)).toBe(true)
    expect(hasStrippableCharacter(`a${ch(0x7f)}`)).toBe(true)
    expect(hasStrippableCharacter(`a${ch(0x85)}`)).toBe(true)
    expect(hasStrippableCharacter(`a${RLO}`)).toBe(true)
    expect(hasStrippableCharacter(`a${ch(0x2066)}`)).toBe(true)
    expect(hasStrippableCharacter(`a${ZWSP}`)).toBe(false)
    expect(hasStrippableCharacter('')).toBe(false)
  })

  test('dealNameSchema trims, bounds and refuses control characters', () => {
    expect(dealNameSchema.parse('  Acme renewal  ')).toBe('Acme renewal')
    expect(dealNameSchema.safeParse('n'.repeat(200)).success).toBe(true)
    for (const bad of ['', '   ', 'n'.repeat(201), `a${RLO}`, 'a\nb', `a${ch(0xd800)}`, 5]) {
      expect(dealNameSchema.safeParse(bad).success).toBe(false)
    }
  })
})

describe('Call upload', () => {
  test('the text fields need a deal id and take an optional Rep text', () => {
    expect(uploadCallFieldsSchema.parse({ dealId: ' D-1 ' })).toEqual({ dealId: 'D-1' })
    expect(uploadCallFieldsSchema.safeParse({ dealId: 'D-1', rep: '{}' }).success).toBe(true)
    expect(uploadCallFieldsSchema.safeParse({}).success).toBe(false)
    expect(uploadCallFieldsSchema.safeParse({ dealId: 'D-1', rep: 'x'.repeat(513) }).success).toBe(
      false
    )
    expect(uploadCallFieldsSchema.safeParse({ dealId: 'D-1', file: 'x' }).success).toBe(false)
  })

  describe('checkCallFile', () => {
    const file = { fileName: 'call.mp3', declaredMediaType: 'audio/mpeg', sizeBytes: 10 }

    test('returns the kind and the parsed file', () => {
      expect(checkCallFile(file)).toEqual({ ok: true, kind: 'recording', file })
      expect(checkCallFile({ ...file, fileName: 'call.SRT ' })).toEqual({
        ok: true,
        kind: 'transcript',
        file: { ...file, fileName: 'call.SRT' },
      })
    })

    test('accepts every listed extension', () => {
      for (const extension of [
        ...ACCEPTED_TRANSCRIPT_EXTENSIONS,
        ...ACCEPTED_RECORDING_EXTENSIONS,
      ]) {
        expect(checkCallFile({ ...file, fileName: `a${extension}` }).ok).toBe(true)
      }
    })

    test('an over-size .exe yields only call.too_large', () => {
      expect(
        checkCallFile({ ...file, fileName: 'a.exe', sizeBytes: MAX_RECORDING_BYTES + 1 })
      ).toEqual({
        ok: false,
        code: 'call.too_large',
      })
    })

    test('limits differ by kind: a Recording up to 500 MB, a Transcript up to 5 MB', () => {
      expect(checkCallFile({ ...file, sizeBytes: MAX_RECORDING_BYTES }).ok).toBe(true)
      expect(checkCallFile({ ...file, sizeBytes: MAX_RECORDING_BYTES + 1 })).toEqual({
        ok: false,
        code: 'call.too_large',
      })
      expect(
        checkCallFile({ ...file, fileName: 'a.txt', sizeBytes: MAX_TRANSCRIPT_BYTES }).ok
      ).toBe(true)
      expect(
        checkCallFile({ ...file, fileName: 'a.txt', sizeBytes: MAX_TRANSCRIPT_BYTES + 1 })
      ).toEqual({
        ok: false,
        code: 'call.too_large',
      })
    })

    test('a wrong type yields call.unsupported_type, judged on the stripped name', () => {
      for (const fileName of ['a.exe', 'a', 'a.pdf', `a.mp3${RLO}.exe`.replace('.mp3', '')]) {
        expect(checkCallFile({ ...file, fileName })).toEqual({
          ok: false,
          code: 'call.unsupported_type',
        })
      }
      expect(checkCallFile({ ...file, fileName: `a.m${RLO}p3` }).ok).toBe(true)
    })

    test.each([
      ['a negative size', { sizeBytes: -1 }],
      ['a fractional size', { sizeBytes: 1.5 }],
      ['an empty file', { sizeBytes: 0 }],
      ['NaN', { sizeBytes: Number.NaN }],
      ['Infinity', { sizeBytes: Number.POSITIVE_INFINITY }],
      ['a name with no stem', { fileName: '.mp3' }],
      ['a path separator', { fileName: 'a/b.mp3' }],
      ['an unknown key', { rep: 'x' }],
    ])('%s yields request.invalid', (_name, change) => {
      expect(checkCallFile({ ...file, ...change })).toEqual({ ok: false, code: 'request.invalid' })
    })

    test('input that is not an object yields request.invalid', () => {
      for (const input of [null, undefined, 'x', 3, {}, { fileName: 3, sizeBytes: 'big' }]) {
        expect(checkCallFile(input)).toEqual({ ok: false, code: 'request.invalid' })
      }
    })

    test('a flipping getter is read once, and a polluted prototype is ignored', () => {
      let reads = 0
      const flipping = { ...file }
      Object.defineProperty(flipping, 'fileName', {
        enumerable: true,
        get: () => (reads++ === 0 ? 'a.mp3' : 'a.exe'),
      })
      const result = checkCallFile(flipping)
      expect(reads).toBe(1)
      expect(result.ok && result.file.fileName).toBe('a.mp3')

      Object.defineProperty(Object.prototype, 'sizeBytes', {
        value: 10,
        configurable: true,
        enumerable: false,
        writable: true,
      })
      try {
        expect(checkCallFile({ fileName: 'a.mp3', declaredMediaType: null })).toEqual({
          ok: false,
          code: 'request.invalid',
        })
      } finally {
        Reflect.deleteProperty(Object.prototype, 'sizeBytes')
      }
    })
  })
})

describe('Call list and params', () => {
  test('the query defaults to 25 and takes a state and a deal id', () => {
    expect(listCallsQuerySchema.parse({})).toEqual({ limit: 25 })
    expect(
      listCallsQuerySchema.parse({ state: 'awaiting_rep', dealRecordId: id('deal'), limit: '5' })
    ).toEqual({
      state: 'awaiting_rep',
      dealRecordId: id('deal'),
      limit: 5,
    } as never)
  })

  test.each([
    ['a page over the maximum', { limit: MAX_PAGE_SIZE + 1 }],
    ['an unknown state', { state: 'purged' }],
    ['an unknown key', { q: 'x' }],
    ['a bad deal id', { dealId: '' }],
  ])('the query rejects %s', (_name, query) => {
    expect(listCallsQuerySchema.safeParse(query).success).toBe(false)
  })

  test('a response page is bounded', () => {
    expect(listCallsResponseSchema.safeParse({ items: [call], nextCursor: null }).success).toBe(
      true
    )
    const many = Array.from({ length: MAX_PAGE_SIZE + 1 }, () => call)
    expect(listCallsResponseSchema.safeParse({ items: many, nextCursor: null }).success).toBe(false)
  })

  test('params need a Call id', () => {
    expect(callParamsSchema.safeParse({ callId: id('call') }).success).toBe(true)
    expect(callParamsSchema.safeParse({ callId: id('doc') }).success).toBe(false)
    expect(callParamsSchema.safeParse({ callId: id('call'), x: 1 }).success).toBe(false)
  })
})

describe('deal ids', () => {
  test('are trimmed and otherwise exact and case-sensitive', () => {
    expect(normaliseDealId('  A-1\t')).toBe('A-1')
    expect(normaliseDealId('a-1')).not.toBe(normaliseDealId('A-1'))
    expect(dealIdSchema.parse(' A-1 ')).toBe('A-1')
    expect(dealIdSchema.parse('Deal with spaces / and slash')).toBe('Deal with spaces / and slash')
    expect(dealIdSchema.parse('A-1')).not.toBe(dealIdSchema.parse('a-1'))
  })

  test('accept exactly the maximum length', () => {
    expect(dealIdSchema.safeParse('a'.repeat(MAX_DEAL_ID_LENGTH)).success).toBe(true)
    expect(dealIdSchema.safeParse('a'.repeat(MAX_DEAL_ID_LENGTH + 1)).success).toBe(false)
  })

  test.each([
    ['empty', ''],
    ['only spaces', '   '],
    ['a control character', 'a\u0000b'],
    ['a newline', 'a\nb'],
    ['a direction override', `a${RLO}b`],
    ['a zero-width space', `a${ZWSP}b`],
    ['a line separator', `a${ch(0x2028)}b`],
    ['a byte order mark', `a${ch(0xfeff)}b`],
    ['a lone surrogate', `a${ch(0xd800)}`],
    ['over 1000 raw characters', `${' '.repeat(1000)}a`],
    ['a number', 5],
  ])('reject %s (rejected, not stripped)', (_name, value) => {
    expect(dealIdSchema.safeParse(value).success).toBe(false)
  })

  test('the path params use the same rule', () => {
    expect(dealParamsSchema.safeParse({ dealRecordId: id('deal') }).success).toBe(true)
    expect(dealParamsSchema.safeParse({ dealId: 'X' }).success).toBe(false)
    expect(dealParamsSchema.safeParse({ dealRecordId: id('call') }).success).toBe(false)
    expect(dealParamsSchema.safeParse({ dealRecordId: id('deal'), y: 1 }).success).toBe(false)
  })
})

describe('Deals', () => {
  const deal = {
    id: id('deal'),
    dealId: 'D-100',
    name: null,
    outcome: 'won',
    closedAt: NOW,
    amount: '1250.50',
    currency: 'EUR',
    callCount: 2,
    appearedInImport: true,
    createdAt: NOW,
    updatedAt: NOW,
  }

  test('accepts a Deal and strips unknown keys (such as the Outcome sequence)', () => {
    expect(dealSchema.parse({ ...deal, outcomeSeq: 4 })).toEqual(deal as never)
  })

  test.each([
    ['an unknown Outcome', { outcome: 'pending' }],
    ['a float amount', { amount: 12.5 }],
    ['a negative amount', { amount: '-1' }],
    ['three decimals', { amount: '1.234' }],
    ['a lower-case currency', { currency: 'eur' }],
    ['a negative call count', { callCount: -1 }],
    ['a name over 200', { name: 'n'.repeat(201) }],
  ])('rejects %s', (_name, change) => {
    expect(dealSchema.safeParse({ ...deal, ...change }).success).toBe(false)
  })

  test('the list query takes an Outcome and the appearedInImport text, and is bounded', () => {
    expect(listDealsQuerySchema.parse({ outcome: 'open', appearedInImport: 'false' })).toEqual({
      outcome: 'open',
      appearedInImport: false,
      limit: 25,
    })
    expect(listDealsQuerySchema.safeParse({ appearedInImport: 'maybe' }).success).toBe(false)
    expect(listDealsQuerySchema.safeParse({ limit: MAX_PAGE_SIZE + 1 }).success).toBe(false)
    expect(listDealsQuerySchema.safeParse({ x: 1 }).success).toBe(false)
  })

  test('setting an Outcome', () => {
    expect(setDealOutcomeRequestSchema.safeParse({ outcome: 'won' }).success).toBe(true)
    expect(setDealOutcomeRequestSchema.safeParse({ outcome: 'lost', closedAt: NOW }).success).toBe(
      true
    )
    expect(setDealOutcomeRequestSchema.safeParse({ outcome: 'open', closedAt: null }).success).toBe(
      true
    )
    expect(setDealOutcomeRequestSchema.safeParse({ outcome: 'open', closedAt: NOW }).success).toBe(
      true
    )
    expect(setDealOutcomeRequestSchema.safeParse({ outcome: 'maybe' }).success).toBe(false)
    expect(setDealOutcomeRequestSchema.safeParse({}).success).toBe(false)
    expect(setDealOutcomeRequestSchema.safeParse({ outcome: 'won', amount: '1' }).success).toBe(
      false
    )
  })
})

describe('checkDealImportHeader', () => {
  const required = 'deal_id,outcome,closed_at,amount,currency'

  test('accepts the template with and without name', () => {
    expect(checkDealImportHeaderText(required)).toEqual({ ok: true, hasName: false })
    expect(checkDealImportHeaderText(`${required},name`)).toEqual({ ok: true, hasName: true })
  })

  test('ignores a byte order mark, a trailing carriage return, spaces and quotes', () => {
    expect(checkDealImportHeaderText(`${ch(0xfeff)}${required}\r`)).toEqual({
      ok: true,
      hasName: false,
    })
    expect(checkDealImportHeaderText('"deal_id", outcome ,closed_at,amount,"currency"').ok).toBe(
      true
    )
  })

  test.each([
    ['', 'empty'],
    ['   ', 'empty'],
    ['x'.repeat(1025), 'too_long'],
    ['deal_id,outcome,closed_at,amount', 'missing_column'],
    ['deal_id,outcome,closed_at,amount,currency,notes', 'unexpected_column'],
    ['Deal_ID,outcome,closed_at,amount,currency', 'unexpected_column'],
    ['deal_id,outcome,closed_at,amount,currency,name,name', 'unexpected_column'],
    ['outcome,deal_id,closed_at,amount,currency', 'wrong_order'],
    ['deal_id,outcome,closed_at,amount,currency,\nname', 'unexpected_column'],
    ['name,deal_id,outcome,closed_at,amount,currency', 'wrong_order'],
  ])('refuses %j as %s, with the one code and no cell', (line, problem) => {
    const result = checkDealImportHeaderText(line)
    expect(result).toEqual({ ok: false, code: 'deal_import.header_invalid', problem } as never)
  })
})

describe('Deal imports', () => {
  const item = {
    id: id('dimp'),
    state: 'completed',
    failureReason: null,
    rowCount: 3,
    appliedCount: 2,
    rejectedCount: 1,
    uploadedByUserId: id('usr'),
    createdAt: NOW,
    updatedAt: NOW,
  }

  test('the states', () => {
    expect([...DEAL_IMPORT_STATES]).toEqual(['uploaded', 'processing', 'completed', 'failed'])
  })

  test('accepts the shape of each state', () => {
    expect(dealImportSchema.safeParse(item).success).toBe(true)
    const none = { rowCount: null, appliedCount: null, rejectedCount: null }
    expect(dealImportSchema.safeParse({ ...item, ...none, state: 'processing' }).success).toBe(true)
    expect(
      dealImportSchema.safeParse({
        ...item,
        ...none,
        state: 'failed',
        failureReason: 'too_many_rows',
      }).success
    ).toBe(true)
  })

  test.each([
    [
      'failed with no reason',
      { state: 'failed', rowCount: null, appliedCount: null, rejectedCount: null },
    ],
    ['a reason when completed', { failureReason: 'unreadable' }],
    ['counts that do not add up', { rowCount: 4 }],
    ['counts while processing', { state: 'processing' }],
    ['no counts when completed', { rowCount: null, appliedCount: null, rejectedCount: null }],
    ['more rows than the limit', { rowCount: 50_001, appliedCount: 50_001 }],
  ])('rejects %s', (_name, change) => {
    expect(dealImportSchema.safeParse({ ...item, ...change }).success).toBe(false)
  })

  test('carries no file name', () => {
    expect('fileName' in dealImportSchema.parse({ ...item, fileName: 'deals.csv' })).toBe(false)
  })

  test('row reasons are a closed list', () => {
    expect([...DEAL_IMPORT_ROW_REASONS]).toEqual([
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
    ])
  })

  test('report rows echo only the deal id', () => {
    const applied = { rowNumber: 2, dealId: 'D-1', result: 'applied', reason: null }
    expect(dealImportRowSchema.parse({ ...applied, name: 'Acme', amount: '5' })).toEqual(
      applied as never
    )
    expect(
      dealImportRowSchema.safeParse({
        rowNumber: 3,
        dealId: 'D-1',
        result: 'rejected',
        reason: 'outcome_already_decided',
      }).success
    ).toBe(true)
    expect(
      dealImportRowSchema.safeParse({
        rowNumber: 4,
        dealId: null,
        result: 'rejected',
        reason: 'invalid_deal_id',
      }).success
    ).toBe(true)
  })

  test.each([
    ['rejected with no reason', { result: 'rejected' }],
    ['applied with a reason', { reason: 'invalid_name' }],
    ['a free-text reason', { result: 'rejected', reason: 'cell was Acme' }],
    ['row 1 (the header)', { rowNumber: 1 }],
    ['a row past the limit', { rowNumber: 50_002 }],
    ['no deal id on an applied row', { dealId: null }],
    ['an invalid deal id echoed', { dealId: `a${RLO}` }],
  ])('a report row rejects %s', (_name, change) => {
    expect(
      dealImportRowSchema.safeParse({
        rowNumber: 2,
        dealId: 'D-1',
        result: 'applied',
        reason: null,
        ...change,
      }).success
    ).toBe(false)
  })

  test('the rows query and page are bounded', () => {
    expect(listDealImportRowsQuerySchema.parse({ result: 'rejected' })).toEqual({
      result: 'rejected',
      limit: 25,
    })
    expect(listDealImportRowsQuerySchema.safeParse({ result: 'x' }).success).toBe(false)
    expect(listDealImportRowsQuerySchema.safeParse({ limit: MAX_PAGE_SIZE + 1 }).success).toBe(
      false
    )
    const rows = Array.from({ length: MAX_PAGE_SIZE + 1 }, () => ({
      rowNumber: 2,
      dealId: 'D',
      result: 'applied',
      reason: null,
    }))
    expect(
      listDealImportRowsResponseSchema.safeParse({ items: rows, nextCursor: null }).success
    ).toBe(false)
  })
})

describe('rights confirmation', () => {
  const confirmation = { wordingVersion: 1, confirmedByUserId: id('usr'), confirmedAt: NOW }

  test('the record holds the version, who and when', () => {
    expect(rightsConfirmationSchema.parse({ ...confirmation, ip: '1.2.3.4' })).toEqual(
      confirmation as never
    )
    expect(
      rightsConfirmationSchema.safeParse({ ...confirmation, confirmedByUserId: id('org') }).success
    ).toBe(false)
    expect(rightsConfirmationSchema.safeParse({ ...confirmation, wordingVersion: 0 }).success).toBe(
      false
    )
    expect(rightsConfirmationSchema.safeParse({ ...confirmation, confirmedAt: 'x' }).success).toBe(
      false
    )
  })

  test('confirmed is true only when the stored version equals the current one', () => {
    const status = (
      currentWordingVersion: number,
      stored: typeof confirmation | null,
      confirmed: boolean
    ) =>
      rightsStatusSchema.safeParse({ currentWordingVersion, confirmation: stored, confirmed })
        .success
    expect(status(1, confirmation, true)).toBe(true)
    expect(status(2, confirmation, true)).toBe(false)
    expect(status(2, confirmation, false)).toBe(true)
    expect(status(1, null, true)).toBe(false)
    expect(status(1, null, false)).toBe(true)
    expect(
      rightsRequiredDetailsSchema.safeParse({ wordingVersion: MAX_RIGHTS_WORDING_VERSION }).success
    ).toBe(true)
    expect(
      rightsRequiredDetailsSchema.safeParse({ wordingVersion: MAX_RIGHTS_WORDING_VERSION + 1 })
        .success
    ).toBe(false)
  })

  test('the status says which version is current and whether the stored one is', () => {
    expect(
      rightsStatusSchema.safeParse({ currentWordingVersion: 2, confirmation, confirmed: false })
        .success
    ).toBe(true)
    expect(
      rightsStatusSchema.safeParse({
        currentWordingVersion: 1,
        confirmation: null,
        confirmed: false,
      }).success
    ).toBe(true)
    expect(
      rightsStatusSchema.safeParse({ currentWordingVersion: 1, confirmation: null }).success
    ).toBe(false)
  })

  test('the request carries only the version shown', () => {
    expect(confirmRightsRequestSchema.safeParse({ wordingVersion: 3 }).success).toBe(true)
    expect(confirmRightsRequestSchema.safeParse({ wordingVersion: 1.5 }).success).toBe(false)
    expect(
      confirmRightsRequestSchema.safeParse({ wordingVersion: 1, confirmedByUserId: id('usr') })
        .success
    ).toBe(false)
  })

  test('the required code carries the version in its details', () => {
    expect(rightsRequiredDetailsSchema.parse({ wordingVersion: 2 })).toEqual({ wordingVersion: 2 })
    expect(rightsRequiredDetailsSchema.safeParse({ wordingVersion: 0 }).success).toBe(false)
    expect(rightsRequiredDetailsSchema.safeParse({}).success).toBe(false)
    expect(SALES_HISTORY_ERRORS['rights.confirmation_required'].status).toBe(403)
  })
})

const SALES_MESSAGES = {
  'call.not_found': 'The Call was not found.',
  'call.unsupported_type': 'This file type is not supported.',
  'call.too_large': 'The file is larger than the upload limit.',
  'call.quota_exceeded':
    'The Organization has reached its limit on Calls, Recordings or Deals. Deleted Calls count until they are purged.',
  'call.content_in_other_deal': 'This Call was already uploaded for a different Deal.',
  'call.rep_invalid': 'The Rep choice is not valid for this Call.',
  'call.rep_not_changeable': 'The Rep of this Call cannot be changed in its current state.',
  'call.not_restorable': 'The Call was purged after its retention period and cannot be restored.',
  'deal.not_found': 'The Deal was not found.',
  'deal_import.not_found': 'The import was not found.',
  'deal_import.unsupported_type': 'This file type is not supported.',
  'deal_import.too_large': 'The file is larger than the upload limit.',
  'deal_import.header_invalid': 'The first row does not match the template.',
  'rights.confirmation_required':
    'Confirm that your Organization may share these Calls before uploading them.',
  'rights.version_outdated':
    'The confirmation wording has changed. Reload and confirm the current version.',
} as const

describe('SALES_HISTORY_ERRORS', () => {
  test.each([
    ['call.not_found', 404],
    ['call.unsupported_type', 415],
    ['call.too_large', 413],
    ['call.quota_exceeded', 409],
    ['call.content_in_other_deal', 409],
    ['call.rep_invalid', 422],
    ['call.rep_not_changeable', 409],
    ['call.not_restorable', 410],
    ['deal.not_found', 404],
    ['deal_import.not_found', 404],
    ['deal_import.unsupported_type', 415],
    ['deal_import.too_large', 413],
    ['deal_import.header_invalid', 422],
    ['rights.confirmation_required', 403],
    ['rights.version_outdated', 409],
  ] as const)('%s maps to status %d', (code, status) => {
    expect(SALES_HISTORY_ERRORS[code].code).toBe(code)
    expect(SALES_HISTORY_ERRORS[code].status).toBe(status)
  })

  test('lists exactly the codes and fixed messages under test', () => {
    expect(Object.keys(SALES_HISTORY_ERRORS).sort()).toEqual(Object.keys(SALES_MESSAGES).sort())
    for (const [code, message] of Object.entries(SALES_MESSAGES)) {
      expect(SALES_HISTORY_ERRORS[code as keyof typeof SALES_MESSAGES].message).toBe(message)
    }
  })

  test('has no code for a duplicate under the same Deal, a long Recording or a decided row', () => {
    const codes = Object.keys(SALES_HISTORY_ERRORS)
    expect(codes).not.toContain('call.duplicate')
    expect(codes).not.toContain('call.too_long')
    expect(codes.some((code) => code.includes('decided'))).toBe(false)
  })

  test('no code collides with a common or a document one, and no message holds a placeholder', () => {
    for (const code of Object.keys(SALES_HISTORY_ERRORS)) {
      expect(code in ERRORS).toBe(false)
      expect(code in PLAYBOOK_ERRORS).toBe(false)
    }
    for (const entry of Object.values(SALES_HISTORY_ERRORS)) {
      expect(entry.message).not.toMatch(/[{}$%<>]/)
    }
  })

  test('messages use the glossary words, not the avoided ones', () => {
    for (const entry of Object.values(SALES_HISTORY_ERRORS)) {
      expect(entry.message).not.toMatch(
        /\b(meeting|session|opportunity|lead|disposition|snippet|segment)\b/i
      )
    }
  })
})

describe('messages', () => {
  test('every message has the pieces defineMessage takes, an area.event type and organization scope', () => {
    for (const message of [
      CALL_UPLOADED_MESSAGE,
      CALL_TRANSCRIBED_MESSAGE,
      CALL_REP_CHANGED_MESSAGE,
      CALL_DELETED_MESSAGE,
      DEAL_OUTCOME_CHANGED_MESSAGE,
      DEAL_IMPORT_UPLOADED_MESSAGE,
    ]) {
      expect(Object.keys(message).sort()).toEqual(['payload', 'scope', 'type', 'version'])
      expect(message.type).toMatch(/^playbook\.[a-z_]+$/)
      expect(message.version).toBe(1)
      expect(message.scope).toBe('organization')
    }
  })

  test('payloads hold ids and sequences only', () => {
    expect(callUploadedPayloadSchema.safeParse({ callId: id('call') }).success).toBe(true)
    expect(
      callUploadedPayloadSchema.safeParse({ callId: id('call'), fileName: 'a.mp3' }).success
    ).toBe(false)
    expect(callUploadedPayloadSchema.safeParse({ callId: id('doc') }).success).toBe(false)
    expect(
      dealOutcomeChangedPayloadSchema.safeParse({ dealRecordId: id('deal'), outcomeSeq: 1 }).success
    ).toBe(true)
    expect(
      dealOutcomeChangedPayloadSchema.safeParse({
        dealRecordId: id('deal'),
        outcomeSeq: 1,
        outcome: 'won',
      }).success
    ).toBe(false)
  })

  test.each([
    ['repSeq', callRepChangedPayloadSchema, { callId: id('call') }],
    ['deletionSeq', callDeletedPayloadSchema, { callId: id('call') }],
    ['outcomeSeq', dealOutcomeChangedPayloadSchema, { dealRecordId: id('deal') }],
  ] as const)('%s is a positive integer up to the Postgres integer', (key, schema, base) => {
    const ok = { ...base, [key]: 1 }
    expect(schema.safeParse(ok).success).toBe(true)
    expect(schema.safeParse({ ...base, [key]: MAX_SEQ }).success).toBe(true)
    for (const bad of [MAX_SEQ + 1, 0, -1, 1.5, '1', NOW, undefined]) {
      expect(schema.safeParse({ ...base, [key]: bad }).success).toBe(false)
    }
  })
})

describe('SALES_HISTORY_ROUTES', () => {
  const routes = Object.entries(SALES_HISTORY_ROUTES)

  test('describes the sixteen routes with unique method and path', () => {
    expect(routes).toHaveLength(16)
    const keys = routes.map(([, route]) => `${route.method} ${route.path}`)
    expect(new Set(keys).size).toBe(keys.length)
    for (const [, route] of routes) {
      expect(route.path.startsWith('/playbook/')).toBe(true)
      expect(route.internal).toBe(false)
    }
  })

  test('Owner and Admin write; reads are Owner and Admin only', () => {
    for (const [, route] of routes) {
      expect([...route.roles]).toEqual(['owner', 'admin'])
      expect(route.description).toContain('Owner and Admin')
      expect(route.description.length).toBeGreaterThan(60)
    }
  })

  test('every listed code exists and every sales code is returned by some route', () => {
    const used = new Set<string>()
    for (const [, route] of routes) {
      for (const code of route.errors) {
        expect(
          SALES_HISTORY_ERRORS[code as keyof typeof SALES_HISTORY_ERRORS].status
        ).toBeGreaterThanOrEqual(400)
        used.add(code)
      }
      for (const code of route.commonErrors) {
        expect(ERRORS[code].status).toBeGreaterThanOrEqual(400)
      }
    }
    expect([...used].sort()).toEqual(Object.keys(SALES_HISTORY_ERRORS).sort())
  })

  test('upload states the rules the service must follow', () => {
    const upload = SALES_HISTORY_ROUTES.uploadCall
    expect([...upload.success]).toEqual([201, 200])
    expect(upload.description).toContain('multipart/form-data')
    expect(upload.description).toContain('awaiting_rep')
    expect(upload.description).toContain('rights.confirmation_required')
    expect(upload.description).toContain('call.content_in_other_deal')
    expect(upload.description).toContain('Idempotency-Key')
    expect(upload.description).toContain('request.too_large')
    expect(upload.commonErrors).toContain('request.idempotency_key_reused')
  })

  test('restore and delete are idempotent by end state and restore splits 410 from 404', () => {
    expect(SALES_HISTORY_ROUTES.deleteCall.description).toContain('Idempotent by end state')
    expect(SALES_HISTORY_ROUTES.restoreCall.description).toContain('call.not_restorable (410)')
    expect(SALES_HISTORY_ROUTES.restoreCall.description).toContain('call.not_found (404)')
  })

  test('lists name their sort key and page size', () => {
    for (const name of [
      'listCalls',
      'listDeals',
      'listDealImports',
      'listDealImportRows',
    ] as const) {
      expect(SALES_HISTORY_ROUTES[name].description).toContain('cursor-paginated')
      expect(SALES_HISTORY_ROUTES[name].description).toContain('at most 100')
    }
    expect(SALES_HISTORY_ROUTES.listCalls.description).toContain('createdAt, then id')
  })

  test('a repeat upload matching a failed Call re-queues it', () => {
    const text = SALES_HISTORY_ROUTES.uploadCall.description
    expect(text).toContain('a match on a "failed" Call under the same Deal whose failureReason is')
  })

  test('the Rep change allows ready, awaiting_rep and two failure reasons, and a repeat changes nothing', () => {
    const text = SALES_HISTORY_ROUTES.setCallRep.description
    expect(text).toContain('rep_label_not_found')
    expect(text).toContain('not_per_side')
    expect(text).toContain('changes nothing and answers 200 with the Call as it is')
    expect(text).not.toContain('Answers 200 with the Call in state "processing"')
  })

  test('imports are not deduplicated by content: only the idempotency key makes a retry safe', () => {
    const upload = SALES_HISTORY_ROUTES.uploadDealImport
    expect([...upload.success]).toEqual([202])
    expect(upload.description).toContain('each upload is a new import')
    expect(upload.description).not.toContain('A repeat of the same content')
  })

  test('the import upload answers 202 and says a decided Deal is a row, not an HTTP error', () => {
    const upload = SALES_HISTORY_ROUTES.uploadDealImport
    expect(upload.success[0]).toBe(202)
    expect(upload.description).toContain('rejected row in the report, not an HTTP error')
  })

  test('the rights routes say who and when come from the token', () => {
    expect(SALES_HISTORY_ROUTES.confirmRights.description).toContain('token and the clock')
    expect(SALES_HISTORY_ROUTES.confirmRights.errors).toEqual(['rights.version_outdated'])
  })

  test('no description uses a word the glossary avoids', () => {
    for (const [, route] of routes) {
      expect(route.description).not.toMatch(
        /\b(meeting|session|opportunity|disposition|snippet|segment|call notes|voice file|audio clip)\b/i
      )
    }
  })
})

const astral = String.fromCodePoint(0x1f600)

describe('lengths count Unicode code points, and the byte bound is four per code point', () => {
  test('the byte bounds the db must allow', () => {
    expect(MAX_UTF8_BYTES_PER_CODE_POINT).toBe(4)
    expect(MAX_DEAL_ID_BYTES).toBe(MAX_DEAL_ID_LENGTH * 4)
    expect(MAX_SPEAKER_LABEL_BYTES).toBe(MAX_SPEAKER_LABEL_LENGTH * 4)
    expect(MAX_DEAL_NAME_BYTES).toBe(MAX_DEAL_NAME_LENGTH * 4)
    expect(MAX_DOCUMENT_FILE_NAME_BYTES).toBe(255 * 4)
    expect(new TextEncoder().encode(astral).length).toBe(MAX_UTF8_BYTES_PER_CODE_POINT)
  })

  test('a deal id of 128 astral characters is accepted, 129 is not', () => {
    expect(dealIdSchema.safeParse(astral.repeat(128)).success).toBe(true)
    expect(dealIdSchema.safeParse(astral.repeat(129)).success).toBe(false)
    expect(dealIdSchema.safeParse(`${astral.repeat(127)}a`).success).toBe(true)
    expect(dealIdSchema.safeParse(`${astral.repeat(128)}a`).success).toBe(false)
  })

  test('a speaker label of 64 astral characters is accepted, 65 is not', () => {
    expect(speakerLabelSchema.safeParse(astral.repeat(64)).success).toBe(true)
    expect(speakerLabelSchema.safeParse(astral.repeat(65)).success).toBe(false)
  })

  test('a Deal name of 200 astral characters is accepted, 201 is not', () => {
    expect(dealNameSchema.safeParse(astral.repeat(200)).success).toBe(true)
    expect(dealNameSchema.safeParse(astral.repeat(201)).success).toBe(false)
  })

  test('a call file name of 251 astral characters plus .mp3 (255 code points) passes; 252 does not', () => {
    const file = (name: string) => ({ fileName: name, declaredMediaType: null, sizeBytes: 1 })
    expect(checkCallFile(file(`${astral.repeat(251)}.mp3`)).ok).toBe(true)
    expect(checkCallFile(file(`${astral.repeat(252)}.mp3`)).ok).toBe(false)
  })

  test('a worst-case deal id is at most the byte bound in UTF-8', () => {
    const worst = dealIdSchema.parse(astral.repeat(128))
    expect(new TextEncoder().encode(worst).length).toBeLessThanOrEqual(MAX_DEAL_ID_BYTES)
  })
})

describe('deal ids: format-control characters and Hangul fillers', () => {
  test.each([
    ['a soft hyphen', 0x00ad],
    ['a word joiner', 0x2060],
    ['an invisible separator', 0x2063],
    ['a Hangul choseong filler', 0x115f],
    ['a Hangul jungseong filler', 0x1160],
    ['a Hangul filler', 0x3164],
    ['a halfwidth Hangul filler', 0xffa0],
    ['a tag character', 0xe0041],
    ['a language tag', 0xe0001],
  ])('rejects %s', (_name, code) => {
    expect(dealIdSchema.safeParse(`D${String.fromCodePoint(code)}1`).success).toBe(false)
  })

  test('accepts homoglyphs, which stay distinct ids', () => {
    const cyrillicA = String.fromCodePoint(0x0430)
    expect(dealIdSchema.parse(`${cyrillicA}-1`)).toBe(`${cyrillicA}-1`)
    expect(dealIdSchema.parse(`${cyrillicA}-1`)).not.toBe(dealIdSchema.parse('a-1'))
  })
})

describe('opaque Deal id', () => {
  test('is deal_ plus 32 hex digits and the Deal and Call carry it', () => {
    expect(dealRecordIdSchema.safeParse(id('deal')).success).toBe(true)
    expect(dealRecordIdSchema.safeParse(id('call')).success).toBe(false)
    expect(dealSchema.safeParse({ ...dealFixture, id: 'D-100' }).success).toBe(false)
    expect(callSchema.safeParse({ ...call, dealRecordId: 'D-100' }).success).toBe(false)
  })

  test('no route path carries a customer deal id', () => {
    for (const [, route] of Object.entries(SALES_HISTORY_ROUTES)) {
      expect(route.path).not.toContain('{dealId}')
    }
    expect(SALES_HISTORY_ROUTES.getDeal.path).toBe('/playbook/deals/{dealRecordId}')
    expect(SALES_HISTORY_ROUTES.setDealOutcome.path).toBe('/playbook/deals/{dealRecordId}/outcome')
  })

  test('the Deal list has no deal id filter: a Deal is found by a POST body lookup', () => {
    expect(listDealsQuerySchema.safeParse({ dealId: 'D-1' }).success).toBe(false)
  })

  test('the queue message names the opaque Deal id, never the customer text', () => {
    expect(
      dealOutcomeChangedPayloadSchema.safeParse({ dealId: 'D-1', outcomeSeq: 1 }).success
    ).toBe(false)
  })
})

const dealFixture = {
  id: id('deal'),
  dealId: 'D-100',
  name: null,
  outcome: 'open',
  closedAt: null,
  amount: null,
  currency: null,
  callCount: 0,
  appearedInImport: false,
  createdAt: NOW,
  updatedAt: NOW,
}

describe('dealSchema amount and currency', () => {
  test('an amount needs a currency, and nothing else is refined', () => {
    expect(dealSchema.safeParse({ ...dealFixture, amount: '10', currency: null }).success).toBe(
      false
    )
    expect(dealSchema.safeParse({ ...dealFixture, amount: '10', currency: 'EUR' }).success).toBe(
      true
    )
    expect(dealSchema.safeParse({ ...dealFixture, amount: null, currency: 'EUR' }).success).toBe(
      true
    )
    // an open Deal may carry an expected close date from the CRM
    expect(dealSchema.safeParse({ ...dealFixture, outcome: 'open', closedAt: NOW }).success).toBe(
      true
    )
    expect(dealSchema.safeParse({ ...dealFixture, outcome: 'won', closedAt: null }).success).toBe(
      true
    )
  })
})

describe('Call search flags', () => {
  test('inSearch is true only for a ready Call of a won Deal', () => {
    expect(callSchema.safeParse(call).success).toBe(true)
    expect(callSchema.safeParse({ ...call, dealOutcome: 'open' }).success).toBe(false)
    expect(callSchema.safeParse({ ...call, dealOutcome: 'lost' }).success).toBe(false)
    expect(callSchema.safeParse({ ...call, state: 'processing' }).success).toBe(false)
    expect(
      callSchema.safeParse({ ...call, state: 'failed', failureReason: 'no_turns' }).success
    ).toBe(false)
  })

  test('inSearch may be false for a ready Call of a won Deal (the re-tag may lag)', () => {
    expect(callSchema.safeParse({ ...call, inSearch: false }).success).toBe(true)
    expect(callSchema.safeParse({ ...call, inSearch: false, dealOutcome: 'open' }).success).toBe(
      true
    )
  })

  test('the Call carries the Deal outcome and both flags', () => {
    expect(callSchema.safeParse({ ...call, dealOutcome: undefined }).success).toBe(false)
    expect(callSchema.safeParse({ ...call, inSearch: undefined }).success).toBe(false)
    expect(callSchema.safeParse({ ...call, dealRecordId: undefined }).success).toBe(false)
  })
})

describe('CSV cells', () => {
  const ok = <T>(value: T) => ({ ok: true, value })
  const bad = { ok: false }

  test('outcome is won, lost or open, case-insensitively after trimming; blank is invalid', () => {
    expect(parseOutcomeCell(' WON ')).toEqual(ok('won'))
    expect(parseOutcomeCell('Lost')).toEqual(ok('lost'))
    expect(parseOutcomeCell('open')).toEqual(ok('open'))
    for (const cell of ['', '  ', 'closed', 'wonn', 'won lost']) {
      expect(parseOutcomeCell(cell)).toEqual(bad as never)
    }
  })

  test('closed_at is YYYY-MM-DD at 00:00 UTC, or an ISO timestamp with offset; blank is none', () => {
    expect(parseClosedAtCell('')).toEqual(ok(null))
    expect(parseClosedAtCell('  ')).toEqual(ok(null))
    expect(parseClosedAtCell('2026-10-12')).toEqual(ok('2026-10-12T00:00:00.000Z'))
    expect(parseClosedAtCell(' 2026-02-28 ')).toEqual(ok('2026-02-28T00:00:00.000Z'))
    expect(parseClosedAtCell('2026-10-12T09:30:00Z')).toEqual(ok('2026-10-12T09:30:00.000Z'))
    expect(parseClosedAtCell('2026-10-12T11:30:00+02:00')).toEqual(ok('2026-10-12T09:30:00.000Z'))
    for (const cell of [
      '2026-02-30',
      '2026-13-01',
      '12/10/2026',
      '2026-10-12T09:30:00',
      '2026-10-12 09:30',
      'soon',
      '2026-1-2',
    ]) {
      expect(parseClosedAtCell(cell)).toEqual(bad as never)
    }
  })

  test('amount is a non-negative decimal, at most 15 integer digits and 2 fraction digits, no leading zeros', () => {
    for (const cell of ['0', '0.5', '10', '1250.50', '999999999999999.99', '7.1']) {
      expect(parseAmountCell(cell)).toEqual(ok(cell))
    }
    expect(parseAmountCell('')).toEqual(ok(null))
    expect(parseAmountCell(' 12.30 ')).toEqual(ok('12.30'))
    for (const cell of [
      '-1',
      '01',
      '00',
      '1.234',
      '1.',
      '.5',
      '1,000',
      '1e3',
      '$5',
      '1000000000000000',
      'NaN',
      '+5',
    ]) {
      expect(parseAmountCell(cell)).toEqual(bad as never)
    }
  })

  test('currency is three letters folded to upper case; blank is none', () => {
    expect(parseCurrencyCell('eur')).toEqual(ok('EUR'))
    expect(parseCurrencyCell(' Usd ')).toEqual(ok('USD'))
    expect(parseCurrencyCell('')).toEqual(ok(null))
    for (const cell of ['EU', 'EURO', '€€€', 'E1R', 'EU R']) {
      expect(parseCurrencyCell(cell)).toEqual(bad as never)
    }
  })

  describe('checkDealImportRow', () => {
    const row = ['D-1', 'won', '2026-10-12', '100.00', 'eur']

    test('reads a row of five or six cells', () => {
      expect(checkDealImportRow(row, false)).toEqual({
        ok: true,
        row: {
          dealId: 'D-1',
          outcome: 'won',
          closedAt: '2026-10-12T00:00:00.000Z',
          amount: '100.00',
          currency: 'EUR',
          name: null,
        },
      })
      expect(checkDealImportRow([...row, ' Acme '], true)).toMatchObject({
        ok: true,
        row: { name: 'Acme' },
      })
      expect(checkDealImportRow([...row, '  '], true)).toMatchObject({
        ok: true,
        row: { name: null },
      })
    })

    test('a won or lost Deal does not need a closing date, and optional cells may be blank', () => {
      expect(checkDealImportRow(['D-1', 'won', '', '', ''], false)).toEqual({
        ok: true,
        row: {
          dealId: 'D-1',
          outcome: 'won',
          closedAt: null,
          amount: null,
          currency: null,
          name: null,
        },
      })
      expect(checkDealImportRow(['D-1', 'open', '', '', 'usd'], false)).toMatchObject({
        ok: true,
        row: { currency: 'USD', amount: null },
      })
    })

    test.each([
      ['too few cells', ['D-1', 'won'], false, 'wrong_column_count'],
      ['a sixth cell without a name column', [...row, 'x'], false, 'wrong_column_count'],
      ['five cells with a name column', row, true, 'wrong_column_count'],
      ['a blank deal id', ['  ', 'won', '', '', ''], false, 'invalid_deal_id'],
      [
        'a deal id with a control character',
        [`D${String.fromCharCode(0)}`, 'won', '', '', ''],
        false,
        'invalid_deal_id',
      ],
      ['a bad outcome', ['D-1', 'maybe', '', '', ''], false, 'invalid_outcome'],
      ['a bad date', ['D-1', 'won', '2026-02-30', '', ''], false, 'invalid_closed_at'],
      ['a bad amount', ['D-1', 'won', '', '1.234', 'EUR'], false, 'invalid_amount'],
      ['an amount without a currency', ['D-1', 'won', '', '5', ''], false, 'invalid_currency'],
      ['a bad currency', ['D-1', 'won', '', '', 'EURO'], false, 'invalid_currency'],
      [
        'a name with a control character',
        [...row, `a${String.fromCharCode(0)}b`],
        true,
        'invalid_name',
      ],
      ['a name over 200 units', [...row, 'n'.repeat(201)], true, 'invalid_name'],
    ])('rejects %s as %s', (_name, cells, hasName, reason) => {
      expect(checkDealImportRow(cells, hasName)).toEqual({ ok: false, reason } as never)
    })

    test('reports the first problem in column order', () => {
      expect(checkDealImportRow(['', 'maybe', 'x', 'x', 'x'], false)).toEqual({
        ok: false,
        reason: 'invalid_deal_id',
      })
    })
  })

  describe('parseCsv and record numbers', () => {
    test('a quoted cell spanning lines is one record, so rowNumber counts records, header first', () => {
      const text = [
        'deal_id,outcome,closed_at,amount,currency,name',
        'D-1,won,2026-10-12,10,EUR,"Acme',
        'renewal"',
        'D-2,lost,,,,',
      ].join('\n')
      const parsed = parseCsv(text)
      const records = parsed.ok ? parsed.records : undefined
      expect(records).toHaveLength(4 - 1)
      expect(records?.[1]?.[5]).toBe('Acme\nrenewal')
      // header is record 1, so D-1 is rowNumber 2 and D-2 is rowNumber 3 (physical line 4)
      const rowNumberOf = (index: number) => index + 1
      expect(records?.[1]?.[0]).toBe('D-1')
      expect(rowNumberOf(1)).toBe(2)
      expect(records?.[2]?.[0]).toBe('D-2')
      expect(rowNumberOf(2)).toBe(3)
      expect(
        dealImportRowSchema.safeParse({
          rowNumber: 3,
          dealId: 'D-2',
          result: 'applied',
          reason: null,
        }).success
      ).toBe(true)
    })
  })
})
