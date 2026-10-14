import { describe, expect, test } from 'bun:test'
import { id } from '../core/fixtures'
import {
  ALL_PLAYBOOK_ROUTES,
  MAX_DOCUMENT_PAGES,
  PLAYBOOK_READ_ROLES,
  SEARCH_ROUTES,
  searchDocumentsRequestSchema,
  searchDocumentsResponseSchema,
  searchMomentsRequestSchema,
} from './index'

const item = {
  documentId: id('doc'),
  name: 'Pricing guide.pdf',
  page: 3,
  score: 0.8,
  snippet: 'Our standard discount is ten percent.',
}
const evidence = { chunks: 12, documents: 4 }
const parse = (value: unknown) => searchDocumentsResponseSchema.safeParse(value)

describe('searchDocumentsRequestSchema', () => {
  test('is the Moments request: the same turns, limit, default and strictness', () => {
    expect(searchDocumentsRequestSchema).toBe(searchMomentsRequestSchema)
    const turns = [{ role: 'prospect', text: 'What is the discount?' }]
    expect(searchDocumentsRequestSchema.parse({ turns }).limit).toBe(5)
    expect(searchDocumentsRequestSchema.safeParse({ turns: [] }).success).toBe(false)
    expect(searchDocumentsRequestSchema.safeParse({ turns, limit: 21 }).success).toBe(false)
    expect(searchDocumentsRequestSchema.safeParse({ turns, extra: 1 }).success).toBe(false)
  })
})

describe('searchDocumentsResponseSchema', () => {
  test('accepts items with evidence, and none', () => {
    expect(parse({ items: [item], evidence }).success).toBe(true)
    expect(parse({ items: [], evidence: { chunks: 0, documents: 0 } }).success).toBe(true)
  })

  test('a document id is a doc_ id, a name is a file name, a page is 1 to the page cap or null', () => {
    const at = (patch: object) => parse({ items: [{ ...item, ...patch }], evidence }).success
    expect(at({ documentId: id('call') })).toBe(false)
    expect(at({ documentId: 'doc_1' })).toBe(false)
    expect(at({ name: '' })).toBe(false)
    expect(at({ page: null })).toBe(true)
    expect(at({ page: 1 })).toBe(true)
    expect(at({ page: MAX_DOCUMENT_PAGES })).toBe(true)
    expect(at({ page: 0 })).toBe(false)
    expect(at({ page: MAX_DOCUMENT_PAGES + 1 })).toBe(false)
    expect(at({ page: 1.5 })).toBe(false)
  })

  test('a name has no control characters after cleaning, like every file name', () => {
    const bad = parse({
      items: [{ ...item, name: `a${String.fromCharCode(0x202e)}b.pdf` }],
      evidence,
    })
    expect(bad.success).toBe(true)
    expect(bad.success && bad.data.items[0]?.name).toBe('ab.pdf')
  })

  test('has at most 20 items', () => {
    const many = (count: number) => Array.from({ length: count }, () => item)
    const big = { chunks: 100, documents: 50 }
    expect(parse({ items: many(20), evidence: big }).success).toBe(true)
    expect(parse({ items: many(21), evidence: big }).success).toBe(false)
  })

  test('snippets are at most 512 code points, and clean', () => {
    const at = (text: string) => parse({ items: [{ ...item, snippet: text }], evidence }).success
    expect(at('a'.repeat(512))).toBe(true)
    expect(at('a'.repeat(513))).toBe(false)
    expect(at(`a${String.fromCharCode(0)}b`)).toBe(false)
    expect(at('line\nbreak')).toBe(false)
    expect(at('')).toBe(true)
  })

  test('the evidence is consistent with the items, as for Moments', () => {
    expect(parse({ items: [item], evidence: { chunks: 3, documents: 4 } }).success).toBe(false)
    expect(parse({ items: [item, item], evidence: { chunks: 1, documents: 1 } }).success).toBe(
      false
    )
    expect(parse({ items: [item], evidence: { chunks: 3, documents: 0 } }).success).toBe(false)
    const other = { ...item, documentId: id('doc', 2) }
    expect(parse({ items: [item, other], evidence: { chunks: 3, documents: 1 } }).success).toBe(
      false
    )
    expect(parse({ items: [item, other], evidence: { chunks: 3, documents: 2 } }).success).toBe(
      true
    )
    expect(parse({ items: [item, item], evidence: { chunks: 3, documents: 1 } }).success).toBe(true)
    expect(parse({ items: [], evidence: { chunks: 101, documents: 1 } }).success).toBe(false)
    expect(parse({ items: [], evidence: { chunks: -1, documents: 0 } }).success).toBe(false)
  })

  test('strips unknown fields and refuses a bad score', () => {
    const parsed = searchDocumentsResponseSchema.parse({
      items: [{ ...item, organizationId: 'org_x', text: 'whole chunk' }],
      evidence,
    })
    expect(Object.keys(parsed.items[0] ?? {}).sort()).toEqual(
      ['documentId', 'name', 'page', 'score', 'snippet'].sort()
    )
    expect(parse({ items: [{ ...item, score: Number.NaN }], evidence }).success).toBe(false)
  })
})

describe('the searchDocuments route', () => {
  const route = SEARCH_ROUTES.searchDocuments

  test('is a read-only POST for every role that reads the Playbook, in the merged map', () => {
    expect(route.method).toBe('POST')
    expect(route.path).toBe('/playbook/search/documents')
    expect(route.internal).toBe(false)
    expect(route.roles).toEqual([...PLAYBOOK_READ_ROLES])
    expect(route.roles).toContain('rep')
    expect(route.success).toEqual([200])
    expect(ALL_PLAYBOOK_ROUTES.searchDocuments).toBe(route)
  })

  test('uses the same codes as searchMoments', () => {
    expect(route.errors).toEqual([])
    expect(route.commonErrors).toEqual(SEARCH_ROUTES.searchMoments.commonErrors)
  })

  test('the description says what it must', () => {
    for (const phrase of [
      'Retry-After',
      'no Idempotency-Key',
      'never logged',
      'at most 20',
      'no cursor',
      'Owner, Admin, Manager and Rep',
      'candidate window',
      'not every document',
      'own file name',
    ]) {
      expect(route.description.toLowerCase()).toContain(phrase.toLowerCase())
    }
  })

  test('the two search routes have distinct paths', () => {
    expect(route.path).not.toBe(SEARCH_ROUTES.searchMoments.path)
  })
})
