import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { defineEvent } from './events'
import { formatId } from './ids'
import { decodeCursor, encodeCursor, MAX_CURSOR_LENGTH, pageSchema } from './pagination'

const position = z.object({ k: z.string() })

describe('cursors', () => {
  test('encodeCursor refuses a value whose cursor the library would itself reject', () => {
    expect(() => encodeCursor({ k: 'x'.repeat(600) })).toThrow(/cursor/i)
  })

  test('every cursor encodeCursor returns is accepted by pageSchema and decodeCursor', () => {
    // 370 bytes of JSON is the largest position that still fits in 512 base64url characters.
    for (const size of [0, 1, 100, 370]) {
      const value = { k: 'x'.repeat(size) }
      const cursor = encodeCursor(value)

      expect(cursor.length).toBeLessThanOrEqual(MAX_CURSOR_LENGTH)
      expect(pageSchema(z.unknown()).safeParse({ items: [], nextCursor: cursor }).success).toBe(
        true
      )
      expect(decodeCursor(cursor, position)).toEqual(value)
    }
  })

  // Each case is a one-element tuple: test.each spreads an array row into arguments, so a bare
  // `[]` row would call the test with none and bun would treat `input` as a done callback.
  const notCursors: [string, unknown][] = [
    ['undefined', undefined],
    ['null', null],
    ['a number', 1],
    ['an object', {}],
    ['an array', []],
  ]
  test.each(notCursors)('decodeCursor returns undefined for %s', (_name, input) => {
    expect(decodeCursor(input as never, position)).toBeUndefined()
  })
})

describe('events', () => {
  const event = defineEvent('playbook.document_indexed', 1, z.object({ pages: z.number() }))

  test.each([
    ['a non-object', 'nope'],
    ['a wrong type', { type: 'playbook.other', version: 1 }],
    ['a wrong version', { type: 'playbook.document_indexed', version: 2 }],
    ['nothing', undefined],
  ])('safeParse reports failure for %s without throwing', (_name, input) => {
    expect(event.safeParse(input).success).toBe(false)
  })
})

describe('formatId', () => {
  test.each([
    '550e8400e29b41d4a716446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    '550E8400-E29B-41D4-A716-446655440000',
  ])('accepts %s', (uuid) => {
    expect<string>(formatId('org', uuid)).toBe('org_550e8400e29b41d4a716446655440000')
  })

  test.each([
    '5-5-0-e8400e29b41d4a716446655440000',
    '550e8400e29b-41d4-a716-446655440000',
    '-550e8400e29b41d4a716446655440000',
  ])('rejects misplaced dashes in %s', (uuid) => {
    expect(() => formatId('org', uuid)).toThrow()
  })
})
