import { describe, expect, test } from 'bun:test'
import { emailSchema, foldAscii, MAX_EMAIL_LENGTH } from './email'

describe('foldAscii', () => {
  test('folds A to Z only', () => {
    expect(foldAscii('Ada.Lovelace@Example.COM')).toBe('ada.lovelace@example.com')
    expect(foldAscii('ÉCOLE')).toBe('École')
  })
})

describe('emailSchema', () => {
  test.each([
    ['ada@example.com', 'ada@example.com'],
    ['Ada@Example.COM', 'ada@example.com'],
    ['a@b', 'a@b'],
    ['ada+tag@example.com', 'ada+tag@example.com'],
    ['ada@xn--bcher-kva.example', 'ada@xn--bcher-kva.example'],
    ["!#$%&'*+/=?^_`{|}~-@example.com", "!#$%&'*+/=?^_`{|}~-@example.com"],
  ])('accepts %p as %p', (input, expected) => {
    expect(emailSchema.parse(input)).toBe(expected)
  })

  test.each([
    ['two @', 'a@b@example.com'],
    ['no @', 'ada.example.com'],
    ['@ first', '@example.com'],
    ['@ last', 'ada@'],
    ['only @', '@'],
    ['too short', 'a@'],
    ['empty', ''],
    ['a space', 'ada @example.com'],
    ['a trailing space', 'ada@example.com '],
    ['a tab', 'ada\t@example.com'],
    ['a newline', 'ada@example.com\n'],
    ['a NUL', 'ada\u0000@example.com'],
    ['a DEL', 'ada\u007f@example.com'],
    ['a zero-width space', 'ada\u200b@example.com'],
    ['a no-break space', 'ada\u00a0@example.com'],
    ['a right-to-left override', 'ada\u202e@example.com'],
    ['a fullwidth @', 'ada\uff20example.com'],
    ['a non-ASCII letter', 'é@example.com'],
    ['an unconverted internationalised domain', 'ada@bücher.example'],
    ['a number', 42],
    ['null', null],
  ])('rejects %s', (_name, input) => {
    expect(emailSchema.safeParse(input).success).toBe(false)
  })

  test('accepts 320 characters and rejects 321', () => {
    const at320 = `${'a'.repeat(MAX_EMAIL_LENGTH - 2)}@b`
    expect(at320).toHaveLength(MAX_EMAIL_LENGTH)
    expect(emailSchema.safeParse(at320).success).toBe(true)
    expect(emailSchema.safeParse(`a${at320}`).success).toBe(false)
  })

  test('does not fold non-ASCII letters; it refuses them', () => {
    expect(emailSchema.safeParse('É@Example.com').success).toBe(false)
  })
})
