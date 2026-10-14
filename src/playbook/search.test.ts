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
  PLAYBOOK_READ_ROLES,
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
    const other = { ...item, dealRecordId: id('deal') }
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

  test('is a read-only POST for every role that reads the Playbook, in the merged map', () => {
    expect(route.method).toBe('POST')
    expect(route.path).toBe('/playbook/search/moments')
    expect(route.internal).toBe(false)
    expect(route.roles).toEqual([...PLAYBOOK_READ_ROLES])
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
    ]) {
      expect(route.description.toLowerCase()).toContain(phrase.toLowerCase())
    }
  })
})

describe('momentQueryText', () => {
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
