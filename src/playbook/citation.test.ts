import { describe, expect, test } from 'bun:test'
import { formatId } from '../ids'
import {
  ALL_PLAYBOOK_ROUTES,
  CITATION_ROUTES,
  MAX_CITATION_REFS,
  MAX_MOMENT_INDEX,
  resolveCitationsRequestSchema,
  resolveCitationsResponseSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const moment = {
  kind: 'moment' as const,
  callId: formatId('call', hex(1)),
  dealRecordId: formatId('deal', hex(2)),
}
const doc = { kind: 'document' as const, documentId: formatId('doc', hex(3)), page: null }

describe('citation resolve', () => {
  test('the request is one to 20 strict references', () => {
    expect(resolveCitationsRequestSchema.safeParse({ refs: [moment, doc] }).success).toBe(true)
    expect(resolveCitationsRequestSchema.safeParse({ refs: [] }).success).toBe(false)
    const many = Array.from({ length: MAX_CITATION_REFS + 1 }, () => moment)
    expect(resolveCitationsRequestSchema.safeParse({ refs: many }).success).toBe(false)
    expect(
      resolveCitationsRequestSchema.safeParse({ refs: [{ ...moment, dealId: 'D-1' }] }).success
    ).toBe(false)
  })
  test('an available moment carries snippets and never the customer deal id, name or amount', () => {
    const parsed = resolveCitationsResponseSchema.parse({
      items: [
        {
          state: 'available',
          ...moment,
          prospect: 'We need faster replies.',
          repNext: 'Here is how we do that.',
          dealId: 'D-9',
          customerName: 'Acme Corp',
          amount: 100,
        },
      ],
    })
    expect(Object.keys(parsed.items[0] ?? {}).sort()).toEqual([
      'callId',
      'dealRecordId',
      'kind',
      'prospect',
      'repNext',
      'state',
    ])
  })
  test('a removed item carries the ids and no text', () => {
    const parsed = resolveCitationsResponseSchema.parse({
      items: [
        { state: 'removed', ...moment, prospect: 'secret', repNext: 'secret', amount: 5 },
        { state: 'removed', ...doc, fileName: 'plan.pdf', snippet: 'secret' },
      ],
    })
    expect<unknown>(parsed.items).toEqual([
      { state: 'removed', ...moment },
      { state: 'removed', ...doc },
    ])
  })
  test('a document item names its file and page', () => {
    const item = { state: 'available', ...doc, page: 4, fileName: 'plan.pdf', snippet: 'Pricing.' }
    expect(resolveCitationsResponseSchema.safeParse({ items: [item] }).success).toBe(true)
    expect(
      resolveCitationsResponseSchema.safeParse({ items: [{ ...item, snippet: undefined }] }).success
    ).toBe(false)
  })
  test('the route reads only, takes no key and is in the combined map', () => {
    const route = CITATION_ROUTES.resolveCitations
    expect(route.path).toBe('/playbook/citations/resolve')
    expect(route.roles).toEqual(['owner', 'admin', 'manager', 'rep'])
    expect(route.description).toContain('takes no Idempotency-Key')
    expect(ALL_PLAYBOOK_ROUTES.resolveCitations).toBe(route)
  })
})

describe('momentIndex', () => {
  const parseRef = (ref: unknown) => resolveCitationsRequestSchema.safeParse({ refs: [ref] })
  test('a Moment ref is valid with and without the index', () => {
    expect(parseRef(moment).success).toBe(true)
    expect(parseRef({ ...moment, momentIndex: 0 }).success).toBe(true)
    expect(parseRef({ ...moment, momentIndex: MAX_MOMENT_INDEX }).success).toBe(true)
  })
  test('refuses a negative, fractional, over-max or non-number index', () => {
    for (const momentIndex of [-1, 1.5, MAX_MOMENT_INDEX + 1, '1', null, Number.NaN]) {
      expect(parseRef({ ...moment, momentIndex }).success).toBe(false)
    }
  })
  test('the ref is still strict and a document ref refuses the index', () => {
    expect(parseRef({ ...moment, momentIndex: 1, extra: 1 }).success).toBe(false)
    expect(parseRef({ ...doc, momentIndex: 1 }).success).toBe(false)
  })
  test('available and removed Moment items carry the index when present', () => {
    const parse = (item: unknown) => resolveCitationsResponseSchema.safeParse({ items: [item] })
    const available = { state: 'available', ...moment, prospect: 'a', repNext: 'b' }
    expect(parse(available).success).toBe(true)
    const withIndex = parse({ ...available, momentIndex: 3 })
    expect(withIndex.success && withIndex.data.items[0]).toMatchObject({ momentIndex: 3 })
    const removed = parse({ state: 'removed', ...moment, momentIndex: 2, prospect: 'x' })
    expect(removed.success && removed.data.items[0]).toEqual({
      state: 'removed',
      ...moment,
      momentIndex: 2,
    })
    expect(parse({ ...available, momentIndex: -1 }).success).toBe(false)
    expect(parse({ ...available, momentIndex: 0.5 }).success).toBe(false)
    expect(parse({ state: 'removed', ...moment, momentIndex: MAX_MOMENT_INDEX + 1 }).success).toBe(
      false
    )
  })
  test('route descriptions say what an absent index resolves to', () => {
    expect(CITATION_ROUTES.resolveCitations.description).toContain('lowest-numbered Moment')
    expect(CITATION_ROUTES.resolveCitations.description).toContain('no longer has it')
  })
})
