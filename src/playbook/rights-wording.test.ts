import { describe, expect, test } from 'bun:test'
import { id, NOW } from '../core/fixtures'
import {
  CURRENT_RIGHTS_WORDING_VERSION,
  confirmRightsRequestSchema,
  MAX_RIGHTS_HEADING_LENGTH,
  MAX_RIGHTS_PARAGRAPHS,
  MAX_RIGHTS_TEXT_LENGTH,
  MAX_RIGHTS_WORDING_VERSION,
  RIGHTS_WORDINGS,
  rightsConfirmationSchema,
  rightsStatusSchema,
  rightsWordingFor,
  rightsWordingSchema,
  SALES_HISTORY_ROUTES,
} from './index'

const versions = Object.keys(RIGHTS_WORDINGS).map(Number)

describe('RIGHTS_WORDINGS', () => {
  test('versions are consecutive from 1', () => {
    expect([...versions].sort((a, b) => a - b)).toEqual(versions.map((_, index) => index + 1))
    expect(versions.every((version) => version <= MAX_RIGHTS_WORDING_VERSION)).toBe(true)
  })

  test('every version has non-empty, bounded, well-formed text', () => {
    for (const wording of Object.values(RIGHTS_WORDINGS)) {
      expect(rightsWordingSchema.safeParse(wording).success).toBe(true)
      expect(wording.heading.length).toBeLessThanOrEqual(MAX_RIGHTS_HEADING_LENGTH)
      expect(wording.paragraphs.length).toBeLessThanOrEqual(MAX_RIGHTS_PARAGRAPHS)
      for (const text of [...wording.paragraphs, wording.checkbox]) {
        expect(text.length).toBeGreaterThan(0)
        expect(text.length).toBeLessThanOrEqual(MAX_RIGHTS_TEXT_LENGTH)
      }
    }
  })

  test('the text is plain and never interpolated', () => {
    for (const wording of Object.values(RIGHTS_WORDINGS)) {
      for (const text of [wording.heading, ...wording.paragraphs, wording.checkbox]) {
        expect(text).not.toMatch(/\$\{|\{\{|\{[a-zA-Z_]+\}|%s|%d|<[a-z/]|\[[^\]]*\]\(/)
      }
    }
  })

  test('is frozen, deeply', () => {
    expect(Object.isFrozen(RIGHTS_WORDINGS)).toBe(true)
    for (const wording of Object.values(RIGHTS_WORDINGS)) {
      expect(Object.isFrozen(wording)).toBe(true)
      expect(Object.isFrozen(wording.paragraphs)).toBe(true)
    }
    expect(() => {
      ;(RIGHTS_WORDINGS as Record<number, unknown>)[99] = {}
    }).toThrow()
  })

  test('the current version is the highest key, and has text', () => {
    expect(CURRENT_RIGHTS_WORDING_VERSION).toBe(Math.max(...versions))
    expect(CURRENT_RIGHTS_WORDING_VERSION).toBe(1)
    expect(rightsWordingFor(CURRENT_RIGHTS_WORDING_VERSION)).toBe(
      RIGHTS_WORDINGS[CURRENT_RIGHTS_WORDING_VERSION]
    )
  })

  test('a version without text has none (and inherited keys are not versions)', () => {
    for (const version of [0, 2, -1, 1.5, Number.NaN, MAX_RIGHTS_WORDING_VERSION + 1]) {
      expect(rightsWordingFor(version)).toBeUndefined()
    }
    expect(rightsWordingFor('toString' as unknown as number)).toBeUndefined()
  })

  test('version 1 is the portal draft, verbatim, and marked as a draft', () => {
    const one = RIGHTS_WORDINGS[1]
    expect(one?.draft).toBe(true)
    expect(one?.heading).toBe('Confirm your right to share Calls')
    expect(one?.paragraphs).toEqual([
      'Before you upload Transcripts or Recordings of past Calls, Closeline records that your Organization has the right to share them.',
      'The Calls you upload hold the words, and in a Recording the voices, of your Reps and of your Prospects. Closeline stores them for your Organization and uses them to find similar Moments from won Deals. It does not share them with other Organizations.',
    ])
    expect(one?.checkbox).toBe(
      'I confirm that I am authorised to act for my Organization, that my Organization has the right to share the Transcripts and Recordings it uploads to Closeline, and that any notice to the people on those Calls and any consent the law requires have been given or obtained. I understand that this confirmation is recorded with my name and the time.'
    )
  })

  test('uses the glossary words, not the avoided ones', () => {
    for (const wording of Object.values(RIGHTS_WORDINGS)) {
      const all = [wording.heading, ...wording.paragraphs, wording.checkbox].join(' ')
      expect(all).not.toMatch(
        /\b(meeting|session|opportunity|snippet|segment|voice file|audio clip)\b/i
      )
    }
  })
})

describe('rightsWordingSchema', () => {
  const ok = { heading: 'H', paragraphs: ['P'], checkbox: 'C' }

  test('accepts a wording and a draft marker', () => {
    expect(rightsWordingSchema.safeParse(ok).success).toBe(true)
    expect(rightsWordingSchema.safeParse({ ...ok, draft: true }).success).toBe(true)
    expect(
      rightsWordingSchema.safeParse({ ...ok, heading: 'h'.repeat(MAX_RIGHTS_HEADING_LENGTH) })
        .success
    ).toBe(true)
  })

  test.each([
    ['an empty heading', { heading: '' }],
    ['a heading over the bound', { heading: 'h'.repeat(MAX_RIGHTS_HEADING_LENGTH + 1) }],
    ['no paragraphs', { paragraphs: [] }],
    [
      'too many paragraphs',
      { paragraphs: Array.from({ length: MAX_RIGHTS_PARAGRAPHS + 1 }, () => 'p') },
    ],
    ['an over-long paragraph', { paragraphs: ['p'.repeat(MAX_RIGHTS_TEXT_LENGTH + 1)] }],
    ['an empty checkbox', { checkbox: '' }],
    ['surrounding spaces', { checkbox: ' C ' }],
    ['a control character', { checkbox: 'a\nb' }],
    ['draft false', { draft: false }],
    ['an unknown key', { html: '<b>x</b>' }],
  ])('rejects %s', (_name, change) => {
    expect(rightsWordingSchema.safeParse({ ...ok, ...change }).success).toBe(false)
  })
})

describe('the rights schemas still accept what they accepted', () => {
  const confirmation = { wordingVersion: 1, confirmedByUserId: id('usr'), confirmedAt: NOW }

  test('the status without the text, as 0.8.0 services send it', () => {
    expect(
      rightsStatusSchema.safeParse({ currentWordingVersion: 1, confirmation, confirmed: true })
        .success
    ).toBe(true)
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
    expect(rightsConfirmationSchema.safeParse(confirmation).success).toBe(true)
    expect(confirmRightsRequestSchema.safeParse({ wordingVersion: 3 }).success).toBe(true)
  })

  test('the status with the text of the current version', () => {
    const withText = {
      currentWordingVersion: 1,
      confirmation: null,
      confirmed: false,
      currentWording: RIGHTS_WORDINGS[1],
    }
    expect(rightsStatusSchema.parse(withText).currentWording).toEqual(RIGHTS_WORDINGS[1])
    expect(
      rightsStatusSchema.safeParse({ ...withText, currentWording: { heading: 'x' } }).success
    ).toBe(false)
  })

  test('the refinement on confirmed still holds', () => {
    expect(
      rightsStatusSchema.safeParse({ currentWordingVersion: 2, confirmation, confirmed: true })
        .success
    ).toBe(false)
  })

  test('the read route says it may carry the text', () => {
    expect(SALES_HISTORY_ROUTES.getRightsConfirmation.description).toContain('RIGHTS_WORDINGS')
  })
})
