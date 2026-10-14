import { describe, expect, test } from 'bun:test'
import { id } from '../core/fixtures'
import {
  ALL_PLAYBOOK_ROUTES,
  DEFAULT_SEARCH_LIMIT,
  MAX_MOMENT_SNIPPET_CHARACTERS,
  MAX_SEARCH_CANDIDATES,
  MAX_SEARCH_LIMIT,
  MAX_SEARCH_TEXT_CHARACTERS,
  MAX_SEARCH_TURNS,
  momentQueryText,
  momentSnippet,
  momentSnippetSchema,
  SALES_HISTORY_READ_ROLES,
  SEARCH_ROUTES,
  searchMomentsRequestSchema,
  searchMomentsResponseSchema,
} from './index'

const turn = (role: 'rep' | 'prospect', text: string) => ({ role, text })
const turns = (count: number) =>
  Array.from({ length: count }, (_, at) => turn(at % 2 === 0 ? 'rep' : 'prospect', `t${at}`))

describe('the constants', () => {
  test('are the approved bounds', () => {
    expect(MAX_SEARCH_LIMIT).toBe(20)
    expect(DEFAULT_SEARCH_LIMIT).toBe(5)
    expect(MAX_SEARCH_TURNS).toBe(6)
    expect(MAX_SEARCH_TEXT_CHARACTERS).toBe(2000)
    expect(MAX_MOMENT_SNIPPET_CHARACTERS).toBe(512)
    expect(MAX_SEARCH_CANDIDATES).toBe(100)
  })
})

describe('searchMomentsRequestSchema', () => {
  const parse = (value: unknown) => searchMomentsRequestSchema.safeParse(value)

  test('the limit defaults to 5', () => {
    const parsed = searchMomentsRequestSchema.parse({ turns: turns(1) })
    expect(parsed.limit).toBe(5)
  })

  test('accepts 1 to 6 turns and refuses none or 7', () => {
    expect(parse({ turns: turns(1) }).success).toBe(true)
    expect(parse({ turns: turns(6) }).success).toBe(true)
    expect(parse({ turns: [] }).success).toBe(false)
    expect(parse({ turns: turns(7) }).success).toBe(false)
    expect(parse({}).success).toBe(false)
  })

  test('refuses more than 2000 characters in all, counted in code points', () => {
    const half = 'a'.repeat(1000)
    expect(parse({ turns: [turn('prospect', half), turn('rep', half)] }).success).toBe(true)
    expect(parse({ turns: [turn('prospect', half), turn('rep', `${half}a`)] }).success).toBe(false)
    const emoji = String.fromCodePoint(0x1f600)
    expect(parse({ turns: [turn('prospect', emoji.repeat(2000))] }).success).toBe(true)
    expect(parse({ turns: [turn('prospect', emoji.repeat(2001))] }).success).toBe(false)
  })

  test('refuses an empty turn, a role that is not rep or prospect, and a lone surrogate', () => {
    expect(parse({ turns: [turn('prospect', '')] }).success).toBe(false)
    expect(parse({ turns: [{ role: 'agent', text: 'x' }] }).success).toBe(false)
    expect(parse({ turns: [turn('prospect', `a${String.fromCharCode(0xd800)}`)] }).success).toBe(
      false
    )
  })

  test('the limit is 1 to 20', () => {
    expect(parse({ turns: turns(1), limit: 1 }).success).toBe(true)
    expect(parse({ turns: turns(1), limit: 20 }).success).toBe(true)
    expect(parse({ turns: turns(1), limit: 0 }).success).toBe(false)
    expect(parse({ turns: turns(1), limit: 21 }).success).toBe(false)
    expect(parse({ turns: turns(1), limit: 2.5 }).success).toBe(false)
  })

  test('unknown keys are rejected, on the request and on a turn', () => {
    expect(parse({ turns: turns(1), organizationId: 'org_x' }).success).toBe(false)
    expect(parse({ turns: [{ role: 'rep', text: 'x', speaker: 'Alice' }] }).success).toBe(false)
  })
})

describe('searchMomentsResponseSchema', () => {
  const item = {
    callId: id('call'),
    dealRecordId: id('deal'),
    score: 0.83,
    prospect: 'We are worried about price.',
    repNext: 'Many of our customers felt the same.',
  }
  const evidence = { moments: 12, deals: 4 }
  const parse = (value: unknown) => searchMomentsResponseSchema.safeParse(value)

  test('accepts items with evidence, and none', () => {
    expect(parse({ items: [item], evidence }).success).toBe(true)
    expect(parse({ items: [], evidence: { moments: 0, deals: 0 } }).success).toBe(true)
  })

  test('has at most 20 items', () => {
    const many = (count: number) => Array.from({ length: count }, () => item)
    const big = { moments: 100, deals: 50 }
    expect(parse({ items: many(20), evidence: big }).success).toBe(true)
    expect(parse({ items: many(21), evidence: big }).success).toBe(false)
  })

  test('snippets are at most 512 characters', () => {
    const at = (text: string) => parse({ items: [{ ...item, prospect: text }], evidence }).success
    expect(at('a'.repeat(512))).toBe(true)
    expect(at('a'.repeat(513))).toBe(false)
    expect(parse({ items: [{ ...item, repNext: 'a'.repeat(513) }], evidence }).success).toBe(false)
  })

  test('the evidence is consistent: deals and items never exceed the moments, at most 100', () => {
    expect(parse({ items: [item], evidence: { moments: 3, deals: 4 } }).success).toBe(false)
    expect(parse({ items: [item, item], evidence: { moments: 1, deals: 1 } }).success).toBe(false)
    expect(parse({ items: [], evidence: { moments: 101, deals: 1 } }).success).toBe(false)
    expect(parse({ items: [], evidence: { moments: -1, deals: 0 } }).success).toBe(false)
  })

  test('the Deals counted cover the Deals of the items', () => {
    expect(parse({ items: [item], evidence: { moments: 3, deals: 0 } }).success).toBe(false)
    const other = { ...item, dealRecordId: id('deal', 2) }
    expect(parse({ items: [item, other], evidence: { moments: 3, deals: 1 } }).success).toBe(false)
    expect(parse({ items: [item, other], evidence: { moments: 3, deals: 2 } }).success).toBe(true)
    expect(parse({ items: [item, item], evidence: { moments: 3, deals: 1 } }).success).toBe(true)
  })

  test('never carries the customer deal id, name or amount: unknown fields are stripped', () => {
    const parsed = searchMomentsResponseSchema.parse({
      items: [{ ...item, dealId: 'D-100', name: 'Acme', amount: '10.00' }],
      evidence,
    })
    expect(Object.keys(parsed.items[0] ?? {}).sort()).toEqual(
      ['callId', 'dealRecordId', 'prospect', 'repNext', 'score'].sort()
    )
  })

  test('refuses a score that is not a finite number', () => {
    expect(parse({ items: [{ ...item, score: Number.NaN }], evidence }).success).toBe(false)
    expect(parse({ items: [{ ...item, score: 'high' }], evidence }).success).toBe(false)
  })
})

describe('the searchMoments route', () => {
  const route = SEARCH_ROUTES.searchMoments

  test('is a read-only POST for Owner and Admin only, in the merged map', () => {
    expect(route.method).toBe('POST')
    expect(route.path).toBe('/playbook/search/moments')
    expect(route.internal).toBe(false)
    expect(route.roles).toEqual([...SALES_HISTORY_READ_ROLES])
    expect(route.roles).toEqual(['owner', 'admin'])
    expect(route.roles).not.toContain('manager')
    expect(route.roles).not.toContain('rep')
    expect(route.success).toEqual([200])
    expect(ALL_PLAYBOOK_ROUTES.searchMoments).toBe(route)
  })

  test('uses existing codes only: no domain code, and 400, timeout and unavailable', () => {
    expect(route.errors).toEqual([])
    expect(route.commonErrors).toEqual(['request.invalid', 'server.timeout', 'server.unavailable'])
  })

  test('the description says what it must', () => {
    for (const phrase of [
      'Retry-After',
      'no Idempotency-Key',
      'never logged',
      'won',
      'at most 20',
      'no cursor',
      'service-to-service',
      'Owner and Admin only',
      'over-fetched candidate window',
      'min(100, limit x 5)',
      'not every won Deal',
    ]) {
      expect(route.description.toLowerCase()).toContain(phrase.toLowerCase())
    }
  })
})

describe('snippets', () => {
  const bad = (code: number) => `a${String.fromCharCode(code)}b`
  const classes: [string, string][] = [
    ['NUL', bad(0)],
    ['a C0 control', bad(0x07)],
    ['a newline', bad(0x0a)],
    ['a tab', bad(0x09)],
    ['DEL', bad(0x7f)],
    ['a C1 control', bad(0x85)],
    ['a bidi override', bad(0x202e)],
    ['a bidi isolate', bad(0x2066)],
    ['a bidi mark', bad(0x200f)],
    ['a lone surrogate', bad(0xd800)],
  ]

  test.each(classes)('the schema refuses %s, as speakerExcerpt does', (_name, text) => {
    expect(momentSnippetSchema.safeParse(text).success).toBe(false)
  })

  test('the schema accepts clean text, the empty text and 512 code points, not 513', () => {
    expect(momentSnippetSchema.safeParse('Price is a worry.').success).toBe(true)
    expect(momentSnippetSchema.safeParse('').success).toBe(true)
    expect(momentSnippetSchema.safeParse('a'.repeat(512)).success).toBe(true)
    expect(momentSnippetSchema.safeParse('a'.repeat(513)).success).toBe(false)
  })

  test('momentSnippet output always parses: cleaned, collapsed and cut to 512 code points', () => {
    const emoji = String.fromCodePoint(0x1f600)
    const inputs = [
      ...classes.map(([, text]) => text),
      'line one\nline two\t\ttabbed',
      'word '.repeat(300),
      emoji.repeat(700),
      'x'.repeat(5000),
      '',
      '   ',
    ]
    for (const input of inputs) {
      const out = momentSnippet(input)
      expect(momentSnippetSchema.safeParse(out).success).toBe(true)
      expect(Array.from(out).length).toBeLessThanOrEqual(MAX_MOMENT_SNIPPET_CHARACTERS)
    }
    expect(momentSnippet('line one\nline two')).toBe('line one line two')
    expect(momentSnippet(`a${String.fromCharCode(0)}b`)).toBe('ab')
  })

  test('a long snippet is cut at a word boundary with an ellipsis', () => {
    const out = momentSnippet('word '.repeat(300))
    expect(out.endsWith(String.fromCodePoint(0x2026))).toBe(true)
    expect(Array.from(out).length).toBeLessThanOrEqual(MAX_MOMENT_SNIPPET_CHARACTERS)
    expect(out.slice(0, -1).endsWith('word')).toBe(true)
  })
})

describe('whitespace in turns', () => {
  const parse = (value: unknown) => searchMomentsRequestSchema.safeParse(value)

  test('a turn of whitespace only is refused', () => {
    expect(parse({ turns: [turn('prospect', '   \n\t ')] }).success).toBe(false)
    expect(parse({ turns: [turn('prospect', 'ok'), turn('rep', '  ')] }).success).toBe(false)
    expect(parse({ turns: [turn('prospect', ' ok ')] }).success).toBe(true)
  })
})

describe('momentQueryText', () => {
  test('trims each turn, so indexing and querying embed the same text', () => {
    expect(momentQueryText([turn('rep', '  Hello \n'), turn('prospect', '\tHi there  ')])).toBe(
      'Rep: Hello\nProspect: Hi there'
    )
  })

  test('pins the playbook format: one "Rep: " or "Prospect: " line per turn, joined by a newline', () => {
    // Copied from the playbook's moments.test.ts (the Moment `text`).
    expect(momentQueryText([turn('rep', 'Hello'), turn('prospect', 'Hi, I have a question')])).toBe(
      'Rep: Hello\nProspect: Hi, I have a question'
    )
  })

  test('has no trailing newline, keeps inner newlines and an empty list is empty', () => {
    expect(momentQueryText([turn('prospect', 'a\nb')])).toBe('Prospect: a\nb')
    expect(momentQueryText([])).toBe('')
  })

  test('adds nothing but the role label: no speaker name and no reply', () => {
    expect(momentQueryText(turns(3))).toBe('Rep: t0\nProspect: t1\nRep: t2')
  })
})
