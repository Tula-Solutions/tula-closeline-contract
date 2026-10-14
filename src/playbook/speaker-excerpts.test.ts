import { describe, expect, test } from 'bun:test'
import { id, NOW } from '../core/fixtures'
import {
  callSchema,
  MAX_CALL_SPEAKERS,
  MAX_SPEAKER_EXCERPT_LENGTH,
  SALES_HISTORY_ROUTES,
  speakerExcerpt,
} from './index'

const codePoints = (text: string) => Array.from(text).length

const awaiting = {
  id: id('call'),
  dealId: 'D-100',
  dealRecordId: id('deal'),
  dealOutcome: 'won',
  inSearch: false,
  kind: 'recording',
  fileName: 'a.mp3',
  mediaType: 'audio/mpeg',
  sizeBytes: 1000,
  durationSeconds: 60,
  state: 'awaiting_rep',
  failureReason: null,
  rep: null,
  speakerLabels: ['A', 'B'],
  deletedAt: null,
  purgeAt: null,
  uploadedByUserId: id('usr'),
  createdAt: NOW,
  updatedAt: NOW,
}

describe('speakerExcerpt', () => {
  test('the cap is 240 characters', () => {
    expect(MAX_SPEAKER_EXCERPT_LENGTH).toBe(240)
  })

  test('joins the turns with a space and collapses whitespace', () => {
    expect(speakerExcerpt(['Hello,  this is\nAlice.', ' How can I help? '])).toBe(
      'Hello, this is Alice. How can I help?'
    )
  })

  test('a short text is returned whole, without an ellipsis', () => {
    expect(speakerExcerpt(['Hi'])).toBe('Hi')
    expect(speakerExcerpt([])).toBe('')
  })

  test('a long text is cut at a word boundary with an ellipsis, within the cap', () => {
    const words = Array.from({ length: 100 }, (_, index) => `word${index}`)
    const out = speakerExcerpt([words.join(' ')])
    expect(codePoints(out)).toBeLessThanOrEqual(MAX_SPEAKER_EXCERPT_LENGTH)
    expect(out.endsWith(String.fromCharCode(0x2026))).toBe(true)
    const kept = out.slice(0, -1)
    expect(words.join(' ').startsWith(kept)).toBe(true)
    expect(words).toContain(kept.split(' ').at(-1) as string)
    expect(kept.endsWith(' ')).toBe(false)
  })

  test('text of exactly the cap is not cut', () => {
    const text = 'a'.repeat(MAX_SPEAKER_EXCERPT_LENGTH)
    expect(speakerExcerpt([text])).toBe(text)
  })

  test('one word longer than the cap is cut hard, and never inside a code point', () => {
    const out = speakerExcerpt([String.fromCodePoint(0x1f600).repeat(300)])
    expect(codePoints(out)).toBe(MAX_SPEAKER_EXCERPT_LENGTH)
    expect(out.endsWith(String.fromCharCode(0x2026))).toBe(true)
    expect(out.slice(0, -1)).toBe(
      String.fromCodePoint(0x1f600).repeat(MAX_SPEAKER_EXCERPT_LENGTH - 1)
    )
  })

  test('control characters are removed', () => {
    expect(speakerExcerpt([`a${String.fromCharCode(0)}b${String.fromCharCode(0x202e)}c`])).toBe(
      'abc'
    )
  })
})

describe('speakerExcerpt edge cases', () => {
  test('a C1 line break separates words, like other whitespace', () => {
    expect(speakerExcerpt([`a${String.fromCharCode(0x85)}b`])).toBe('a b')
  })

  test('a lone surrogate is dropped', () => {
    expect(speakerExcerpt([`a${String.fromCharCode(0xd800)}b`])).toBe('ab')
  })

  test('a space exactly at the cut gives a clean word boundary', () => {
    const text = `${'a'.repeat(MAX_SPEAKER_EXCERPT_LENGTH - 1)} bbb`
    expect(speakerExcerpt([text])).toBe(
      `${'a'.repeat(MAX_SPEAKER_EXCERPT_LENGTH - 1)}${String.fromCharCode(0x2026)}`
    )
  })
})

describe('Call speakers', () => {
  test('an empty excerpt is refused: a speaker with no text is left out', () => {
    expect(
      callSchema.safeParse({ ...awaiting, speakers: [{ label: 'A', excerpt: '' }] }).success
    ).toBe(false)
  })

  test('the route text names the caps and who may read the excerpts', () => {
    const text = SALES_HISTORY_ROUTES.getCall.description
    expect(text).toContain(String(MAX_SPEAKER_EXCERPT_LENGTH))
    expect(text).toContain(String(MAX_CALL_SPEAKERS))
    expect(text).toContain('Owner and Admin only')
    expect(text).toContain('never logged')
  })

  const speakers = [
    { label: 'A', excerpt: 'Hello, this is Alice.' },
    { label: 'B', excerpt: 'Hi Alice.' },
  ]

  test('is optional: absent stays absent', () => {
    const parsed = callSchema.parse(awaiting)
    expect('speakers' in parsed).toBe(false)
  })

  test('is returned on an awaiting_rep Recording', () => {
    expect(callSchema.parse({ ...awaiting, speakers }).speakers).toEqual(speakers)
  })

  test('is allowed on any Recording with labels, such as a ready one', () => {
    const ready = { ...awaiting, state: 'ready', rep: { by: 'speaker', label: 'A' }, speakers }
    expect(callSchema.safeParse(ready).success).toBe(true)
  })

  test('is refused on a Transcript, and when empty', () => {
    const transcript = {
      ...awaiting,
      kind: 'transcript',
      fileName: 'a.vtt',
      mediaType: 'text/vtt',
      durationSeconds: null,
      state: 'ready',
      rep: { by: 'speaker', label: 'A' },
      speakers,
    }
    expect(callSchema.safeParse(transcript).success).toBe(false)
    expect(callSchema.safeParse({ ...awaiting, speakers: [] }).success).toBe(false)
  })

  test('refuses an excerpt over the cap, a label not among the speakers, a repeated label and extra keys', () => {
    const bad = (value: unknown) => callSchema.safeParse({ ...awaiting, speakers: value }).success
    expect(bad([{ label: 'A', excerpt: 'x'.repeat(MAX_SPEAKER_EXCERPT_LENGTH + 1) }])).toBe(false)
    expect(bad([{ label: 'Z', excerpt: 'x' }])).toBe(false)
    expect(bad([speakers[0], speakers[0]])).toBe(false)
    expect(bad([{ ...speakers[0], turns: [] }])).toBe(false)
    expect(bad(speakers)).toBe(true)
  })

  test('has at most MAX_CALL_SPEAKERS entries', () => {
    const labels = Array.from({ length: MAX_CALL_SPEAKERS + 1 }, (_, index) => `S${index}`)
    const many = labels.map((label) => ({ label, excerpt: 'x' }))
    expect(
      callSchema.safeParse({ ...awaiting, speakerLabels: labels, speakers: many }).success
    ).toBe(false)
    expect(
      callSchema.safeParse({
        ...awaiting,
        speakerLabels: labels.slice(0, MAX_CALL_SPEAKERS),
        speakers: many.slice(0, MAX_CALL_SPEAKERS),
      }).success
    ).toBe(true)
  })
})
