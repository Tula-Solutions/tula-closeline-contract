import { describe, expect, test } from 'bun:test'
import { formatId } from '../ids'
import {
  ALL_PLAYBOOK_ROUTES,
  CITATION_ROUTES,
  MAX_CITATION_REFS,
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
