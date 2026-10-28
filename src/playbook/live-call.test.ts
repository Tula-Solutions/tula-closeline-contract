import { describe, expect, test } from 'bun:test'
import { ALL_PLAYBOOK_ROUTES, LIVE_CALL_ROUTES, listAwaitingDealCallsResponseSchema } from '.'

const callId = `call_${'a'.repeat(32)}`

describe('live-Call routes', () => {
  test('the awaiting-Deal list is Owner and Admin only and merged into the Playbook table', () => {
    const r = LIVE_CALL_ROUTES.listAwaitingDealCalls
    expect(ALL_PLAYBOOK_ROUTES.listAwaitingDealCalls).toBe(r)
    expect(r.roles).toEqual(['owner', 'admin'])
    expect(r.internal).toBe(false)
  })

  test('a page rejects an unknown field and a bad Call id', () => {
    const item = {
      callId,
      direction: 'outbound',
      endedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:01.000Z',
    }
    const ok = listAwaitingDealCallsResponseSchema.safeParse({ items: [item], nextCursor: null })
    expect(ok.success).toBe(true)
    for (const bad of [
      { ...item, extra: 1 },
      { ...item, callId: 'x' },
    ]) {
      expect(
        listAwaitingDealCallsResponseSchema.safeParse({ items: [bad], nextCursor: null }).success
      ).toBe(false)
    }
  })
})
