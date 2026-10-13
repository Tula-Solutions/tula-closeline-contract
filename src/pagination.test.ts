import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import {
  DEFAULT_PAGE_SIZE,
  decodeCursor,
  encodeCursor,
  MAX_PAGE_SIZE,
  pageQuerySchema,
  pageSchema,
} from './pagination'

describe('constants', () => {
  test('the page size bounds are 25 and 100', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(25)
    expect(MAX_PAGE_SIZE).toBe(100)
  })
})

describe('pageQuerySchema', () => {
  test('defaults the limit and leaves the cursor out', () => {
    expect(pageQuerySchema.parse({})).toEqual({ limit: 25 })
  })

  test.each([
    ['1', 1],
    ['50', 50],
    ['100', 100],
    [7, 7],
  ])('coerces limit %p to %d', (input, expected) => {
    expect(pageQuerySchema.parse({ limit: input }).limit).toBe(expected)
  })

  test.each(['0', '101', '1.5', 'abc', '-1', 0, 101, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects limit %p',
    (limit) => {
      expect(pageQuerySchema.safeParse({ limit }).success).toBe(false)
    }
  )

  test('accepts a cursor of 1 to 512 characters', () => {
    expect(pageQuerySchema.parse({ cursor: 'a' }).cursor).toBe('a')
    expect(pageQuerySchema.safeParse({ cursor: 'a'.repeat(512) }).success).toBe(true)
  })

  test('rejects an empty or oversized cursor', () => {
    expect(pageQuerySchema.safeParse({ cursor: '' }).success).toBe(false)
    expect(pageQuerySchema.safeParse({ cursor: 'a'.repeat(513) }).success).toBe(false)
  })
})

describe('pageSchema', () => {
  const schema = pageSchema(z.object({ n: z.number() }))

  test('accepts items with a next cursor or null', () => {
    expect(schema.parse({ items: [{ n: 1 }], nextCursor: 'abc' }).nextCursor).toBe('abc')
    expect(schema.parse({ items: [], nextCursor: null }).items).toEqual([])
  })

  test('rejects an item that fails the item schema', () => {
    expect(schema.safeParse({ items: [{ n: 'x' }], nextCursor: null }).success).toBe(false)
  })

  test('rejects a missing nextCursor and an oversized one', () => {
    expect(schema.safeParse({ items: [] }).success).toBe(false)
    expect(schema.safeParse({ items: [], nextCursor: 'a'.repeat(513) }).success).toBe(false)
  })

  test('rejects more items than the maximum page size', () => {
    const items = Array.from({ length: MAX_PAGE_SIZE + 1 }, () => ({ n: 1 }))
    expect(schema.safeParse({ items, nextCursor: null }).success).toBe(false)
    expect(schema.safeParse({ items: items.slice(1), nextCursor: null }).success).toBe(true)
  })
})

describe('cursor', () => {
  const schema = z.object({ at: z.string(), id: z.string() })
  /** Encodes raw text the way a cursor is encoded, so a test can forge a well-formed cursor. */
  const forge = (bytes: number[]): string =>
    btoa(String.fromCharCode(...bytes))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '')
  const forgeText = (text: string): string => forge([...new TextEncoder().encode(text)])

  test('round-trips an object with non-ASCII text', () => {
    const value = { at: '2026-01-01T00:00:00Z', id: 'Zoë 東京 🚀 ñ' }
    const text = encodeCursor(value)
    expect(text).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeCursor(text, schema)).toEqual(value)
  })

  test('encodes a value that needs base64 padding and the url-safe alphabet', () => {
    for (const id of ['a', 'ab', 'abc', '???>>>', 'ÿÿÿ']) {
      const text = encodeCursor({ at: 'x', id })
      expect(text).not.toMatch(/[+/=]/)
      expect(decodeCursor(text, schema)).toEqual({ at: 'x', id })
    }
  })

  test.each([
    ['garbage', '!!!not base64!!!'],
    ['padded base64', `${forgeText('{"at":"x","id":"y"}')}=`],
    ['standard base64 alphabet', 'ab+/'],
    ['empty', ''],
    ['valid base64 that is not JSON', forgeText('not json at all')],
    ['invalid utf-8', forge([0xff, 0xfe, 0xfd])],
    ['JSON failing the schema', forgeText(JSON.stringify({ at: 1 }))],
    ['a 10,000 character input', 'A'.repeat(10_000)],
  ])('decodeCursor returns undefined for %s', (_name, text) => {
    expect(decodeCursor(text, schema)).toBeUndefined()
  })

  test('decodeCursor never throws on a lone padding or odd-length input', () => {
    for (const text of ['=', 'A', 'AAAAA', '====', 'a=b']) {
      expect(() => decodeCursor(text, schema)).not.toThrow()
    }
  })

  test('decodeCursor rejects an oversized but otherwise valid cursor', () => {
    // encodeCursor refuses to make one this long, so build it by hand: valid base64url of valid JSON.
    const big = btoa(JSON.stringify({ at: 'x', id: 'y'.repeat(600) }))
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll('=', '')
    expect(big.length).toBeGreaterThan(512)
    expect(decodeCursor(big, schema)).toBeUndefined()
  })

  test('decodeCursor rejects a schema that throws', () => {
    const throwing = z.string().transform(() => {
      throw new Error('boom')
    })
    expect(decodeCursor(encodeCursor('x'), throwing)).toBeUndefined()
  })
})
