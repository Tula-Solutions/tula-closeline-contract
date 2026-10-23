import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { ERRORS } from '../errors'
import { callIdSchema, copilotCardIdSchema, formatId } from '../ids'
import { MAX_PAGE_SIZE } from '../pagination'
import { SALES_HISTORY_ERRORS } from '../playbook'
import { PROSPECT_ERRORS } from '../prospect'
import { VOICE_ERRORS } from '../voice'
import {
  COPILOT_ERRORS,
  COPILOT_EVENTS,
  COPILOT_ROUTES,
  copilotCardPageSchema,
  copilotCardSchema,
  copilotEvidenceSchema,
  copilotSettingsSchema,
  copilotStreamHeadersSchema,
  copilotStreamMessageSchema,
  formatCopilotStreamFrame,
  listCopilotCardsQuerySchema,
  MAX_COPILOT_CARD_TEXT_LENGTH,
  MAX_COPILOT_QUOTE_LENGTH,
  markCopilotCardRequestSchema,
  setCopilotSettingsRequestSchema,
  voiceCopilotCardRatedEvent,
  voiceCopilotCardShownEvent,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const org = formatId('org', hex(1))
const call = formatId('call', hex(2))
const mem = formatId('mem', hex(4))
const cardId = formatId('ccard', hex(7))
const doc = formatId('doc', hex(8))
const deal = (n: number) => formatId('deal', hex(100 + n))
const callOf = (n: number) => formatId('call', hex(200 + n))
const NOW = '2026-01-01T00:00:00Z'

const ref = (n: number, d = n) => ({ callId: callOf(n), dealRecordId: deal(d) })
const quote = (n: number, d = n) => ({
  ...ref(n, d),
  prospect: 'It is more than we planned to spend.',
  repNext: 'Let us look at what the first quarter saves you.',
})

const base = {
  id: cardId,
  callId: call,
  sequence: 1,
  evidence: { moments: 11, deals: 5 },
  citedMoments: [ref(1), ref(2)],
  quotes: [quote(1)],
  shownAt: NOW,
  rating: null,
  dismissed: false,
  pinned: false,
}
const similar = { ...base, kind: 'similar_moment' }
const objection = {
  ...base,
  kind: 'objection',
  objectionType: 'price',
  response: 'Show what the first quarter saves.',
}
const nextStep = { ...base, kind: 'next_step', nextStep: 'Book a call with the buyer.' }
const documentCard = {
  ...base,
  kind: 'document',
  source: { documentId: doc, page: 2, passage: 'Pricing starts at the Team plan.' },
}

const ok = (input: unknown) => copilotCardSchema.safeParse(input).success

describe('Copilot Card', () => {
  test.each([
    ['similar_moment', similar],
    ['objection', objection],
    ['next_step', nextStep],
    ['document', documentCard],
  ])('a %s card is valid', (_kind, card) => {
    expect(ok(card)).toBe(true)
  })

  test('uses the existing Call and Deal record ids and a card id of its own', () => {
    expect(copilotCardIdSchema.safeParse(cardId).success).toBe(true)
    expect(callIdSchema.safeParse(base.callId).success).toBe(true)
    expect(ok({ ...similar, citedMoments: [{ callId: call, dealRecordId: 'deal_x' }] })).toBe(false)
  })

  test('is invalid without a cited Moment', () => {
    expect(ok({ ...similar, citedMoments: [] })).toBe(false)
    const { citedMoments: _c, ...none } = similar
    expect(ok(none)).toBe(false)
    for (const card of [objection, nextStep, documentCard]) {
      expect(ok({ ...card, citedMoments: [], quotes: [] })).toBe(false)
    }
  })

  test('is invalid when the Evidence has more Deals than Moments', () => {
    expect(ok({ ...similar, evidence: { moments: 3, deals: 4 } })).toBe(false)
    expect(ok({ ...similar, evidence: { moments: 3, deals: 3 } })).toBe(true)
    expect(copilotEvidenceSchema.safeParse({ moments: 2, deals: 3 }).success).toBe(false)
  })

  test('is invalid without Evidence of one Moment and one Deal, or beyond the search window', () => {
    expect(ok({ ...similar, evidence: { moments: 0, deals: 0 } })).toBe(false)
    expect(ok({ ...similar, evidence: { moments: 3, deals: 0 } })).toBe(false)
    expect(ok({ ...similar, evidence: { moments: 101, deals: 5 } })).toBe(false)
  })

  test('the Evidence covers what the card cites', () => {
    expect(ok({ ...similar, evidence: { moments: 1, deals: 1 } })).toBe(false)
    expect(ok({ ...similar, evidence: { moments: 2, deals: 1 } })).toBe(false)
    expect(ok({ ...similar, evidence: { moments: 2, deals: 2 } })).toBe(true)
    expect(
      ok({ ...similar, citedMoments: [ref(1, 1), ref(2, 1)], evidence: { moments: 2, deals: 1 } })
    ).toBe(true)
  })

  test('cites a Moment once and at most five', () => {
    expect(ok({ ...similar, citedMoments: [ref(1), ref(1)] })).toBe(false)
    const six = [1, 2, 3, 4, 5, 6].map((n) => ref(n))
    expect(ok({ ...similar, citedMoments: six, evidence: { moments: 10, deals: 6 } })).toBe(false)
  })

  test('every quote is of a cited Moment, and a similar-Moment card has one', () => {
    expect(ok({ ...similar, quotes: [quote(9)] })).toBe(false)
    expect(ok({ ...similar, quotes: [] })).toBe(false)
    expect(ok({ ...objection, quotes: [] })).toBe(true)
  })

  test('a card is dismissed or pinned, not both', () => {
    expect(ok({ ...similar, dismissed: true })).toBe(true)
    expect(ok({ ...similar, pinned: true })).toBe(true)
    expect(ok({ ...similar, dismissed: true, pinned: true })).toBe(false)
  })

  test('refuses unknown fields and a kind with another kind’s field', () => {
    expect(ok({ ...similar, extra: 1 })).toBe(false)
    expect(ok({ ...similar, response: 'x' })).toBe(false)
    expect(ok({ ...objection, objectionType: 'weather' })).toBe(false)
    expect(ok({ ...objection, nextStep: 'x' })).toBe(false)
    expect(ok({ ...similar, kind: 'tip' })).toBe(false)
  })

  test('the rating is useful, not useful or none', () => {
    expect(ok({ ...similar, rating: 'useful' })).toBe(true)
    expect(ok({ ...similar, rating: 'not_useful' })).toBe(true)
    expect(ok({ ...similar, rating: 'great' })).toBe(false)
  })
})

describe('card text is untrusted data and bounded', () => {
  const longText = (n: number) => 'a'.repeat(n)
  test('composed text is capped', () => {
    expect(ok({ ...objection, response: longText(MAX_COPILOT_CARD_TEXT_LENGTH) })).toBe(true)
    expect(ok({ ...objection, response: longText(MAX_COPILOT_CARD_TEXT_LENGTH + 1) })).toBe(false)
    expect(ok({ ...nextStep, nextStep: longText(MAX_COPILOT_CARD_TEXT_LENGTH + 1) })).toBe(false)
    expect(ok({ ...objection, response: '' })).toBe(false)
    expect(ok({ ...objection, response: '   ' })).toBe(false)
  })
  test('counts characters, not UTF-16 units', () => {
    expect(ok({ ...objection, response: '😀'.repeat(MAX_COPILOT_CARD_TEXT_LENGTH) })).toBe(true)
    expect(ok({ ...objection, response: '😀'.repeat(MAX_COPILOT_CARD_TEXT_LENGTH + 1) })).toBe(
      false
    )
  })
  test('quotes and passages are capped', () => {
    const q = (text: string) => ({ ...quote(1), prospect: text })
    expect(ok({ ...similar, quotes: [q(longText(MAX_COPILOT_QUOTE_LENGTH))] })).toBe(true)
    expect(ok({ ...similar, quotes: [q(longText(MAX_COPILOT_QUOTE_LENGTH + 1))] })).toBe(false)
    expect(
      ok({
        ...documentCard,
        source: { ...documentCard.source, passage: longText(MAX_COPILOT_QUOTE_LENGTH + 1) },
      })
    ).toBe(false)
  })
  test.each([
    ['a line break', 'line one\nline two'],
    ['a carriage return', 'a\rb'],
    ['a NUL', 'a\u0000b'],
    ['a bidirectional override', 'abc‮def'],
    ['a lone surrogate', 'a\uD800b'],
  ])('refuses %s in any text', (_name, text) => {
    expect(ok({ ...objection, response: text })).toBe(false)
    expect(ok({ ...nextStep, nextStep: text })).toBe(false)
    expect(ok({ ...similar, quotes: [{ ...quote(1), repNext: text }] })).toBe(false)
  })
  test('a page holds at most 100 cards', () => {
    const page = (n: number) =>
      copilotCardPageSchema.safeParse({
        items: Array.from({ length: n }, () => similar),
        nextCursor: null,
      }).success
    expect(MAX_PAGE_SIZE).toBe(100)
    expect(page(60)).toBe(true)
    expect(page(101)).toBe(false)
  })
  test('the documented text is said to be untrusted', () => {
    expect(COPILOT_ROUTES.streamCopilot.description).toContain('untrusted data')
    expect(COPILOT_ROUTES.listCopilotCards.description).toContain('untrusted data')
  })
})

describe('list and mark', () => {
  test('the list query is capped at 100 and takes a cursor and a kind', () => {
    expect(listCopilotCardsQuerySchema.safeParse({ limit: 100, kind: 'objection' }).success).toBe(
      true
    )
    expect(listCopilotCardsQuerySchema.safeParse({ limit: 101 }).success).toBe(false)
    expect(listCopilotCardsQuerySchema.safeParse({ kind: 'tip' }).success).toBe(false)
    expect(listCopilotCardsQuerySchema.safeParse({ other: 1 }).success).toBe(false)
  })
  test('a mark names an end state', () => {
    const mark = (body: unknown) => markCopilotCardRequestSchema.safeParse(body).success
    expect(mark({ rating: 'useful' })).toBe(true)
    expect(mark({ rating: null })).toBe(true)
    expect(mark({ dismissed: true })).toBe(true)
    expect(mark({ pinned: false })).toBe(true)
    expect(mark({ rating: 'not_useful', pinned: true })).toBe(true)
    expect(mark({})).toBe(false)
    expect(mark({ dismissed: true, pinned: true })).toBe(false)
    expect(mark({ rating: 'meh' })).toBe(false)
    expect(mark({ rating: 'useful', idempotencyKey: 'x'.repeat(20) })).toBe(false)
  })
  test('the mark route is idempotent by end state, in words, and takes no key', () => {
    const route = COPILOT_ROUTES.markCopilotCard
    expect(route.description).toContain('idempotent by end state')
    expect(route.description).toContain('Takes no Idempotency-Key header')
    expect(route.idempotent).toBe(false)
    expect(route.roles).toEqual(['owner', 'admin', 'manager', 'rep'])
  })
  test('the settings route is idempotent by end state, in words', () => {
    expect(COPILOT_ROUTES.setCopilotSettings.description).toContain('idempotent by end state')
  })
})

describe('settings', () => {
  const body = { enabled: true, minMoments: 3, minDeals: 2 }
  const set = (input: unknown) => setCopilotSettingsRequestSchema.safeParse(input).success
  test('a valid body', () => {
    expect(set(body)).toBe(true)
    expect(set({ enabled: false, minMoments: 1, minDeals: 1 })).toBe(true)
    expect(set({ enabled: true, minMoments: 20, minDeals: 20 })).toBe(true)
  })
  test('the minimum is 1 to 20 and Deals do not exceed Moments', () => {
    expect(set({ ...body, minMoments: 0 })).toBe(false)
    expect(set({ ...body, minDeals: 0 })).toBe(false)
    expect(set({ ...body, minMoments: 21 })).toBe(false)
    expect(set({ ...body, minMoments: 2.5 })).toBe(false)
    expect(set({ ...body, minMoments: 2, minDeals: 3 })).toBe(false)
  })
  test('refuses unknown fields such as a switch for the announcement', () => {
    for (const extra of ['announce', 'disclosure', 'recorded', 'aiAssisted', 'skipDisclosure']) {
      expect(set({ ...body, [extra]: true })).toBe(false)
    }
  })
  test('the stored settings carry who and when, null before the first save', () => {
    const stored = { ...body, updatedAt: null, updatedBy: null }
    expect(copilotSettingsSchema.safeParse(stored).success).toBe(true)
    expect(
      copilotSettingsSchema.safeParse({ ...stored, updatedAt: NOW, updatedBy: mem }).success
    ).toBe(true)
    expect(copilotSettingsSchema.safeParse({ ...stored, minDeals: 5 }).success).toBe(false)
  })
})

describe('stream', () => {
  const messages = [
    {
      id: 'e1',
      event: 'copilot.status',
      data: { callId: call, state: 'waiting_for_disclosure', quietReason: null },
    },
    {
      id: 'e2',
      event: 'transcript.turn',
      data: {
        callId: call,
        sequence: 1,
        turn: { speaker: 'prospect', startMs: 0, endMs: 900, text: 'We have no budget.' },
      },
    },
    {
      id: 'e3',
      event: 'transcript.unavailable',
      data: { callId: call, reason: 'speech_to_text_failed' },
    },
    { id: 'e4', event: 'copilot.card', data: { card: similar } },
    { id: 'e5', event: 'copilot.card_updated', data: { card: objection } },
  ]
  test.each(messages.map((m) => [m.event, m] as const))('%s is a valid message', (_e, message) => {
    expect(copilotStreamMessageSchema.safeParse(message).success).toBe(true)
  })
  test('a message with an invalid card is refused', () => {
    expect(
      copilotStreamMessageSchema.safeParse({
        id: 'e4',
        event: 'copilot.card',
        data: { card: { ...similar, citedMoments: [] } },
      }).success
    ).toBe(false)
  })
  test('refuses an unknown event, extra fields and an unsafe id', () => {
    const [status] = messages
    expect(
      copilotStreamMessageSchema.safeParse({ ...status, event: 'copilot.whisper' }).success
    ).toBe(false)
    expect(copilotStreamMessageSchema.safeParse({ ...status, extra: 1 }).success).toBe(false)
    for (const id of ['', 'a\nevent: x', 'a b', 'x'.repeat(65)]) {
      expect(copilotStreamMessageSchema.safeParse({ ...status, id }).success).toBe(false)
    }
  })
  test('a turn over the Transcript limit is refused', () => {
    const turn = messages[1]
    expect(
      copilotStreamMessageSchema.safeParse({
        ...turn,
        data: {
          ...turn?.data,
          turn: { speaker: 'rep', startMs: 0, endMs: 1, text: 'a'.repeat(4001) },
        },
      }).success
    ).toBe(false)
  })
  test('Last-Event-ID resumes and must be a safe id', () => {
    expect(copilotStreamHeadersSchema.safeParse({}).success).toBe(true)
    expect(copilotStreamHeadersSchema.safeParse({ 'last-event-id': 'e4' }).success).toBe(true)
    expect(copilotStreamHeadersSchema.safeParse({ 'last-event-id': 'e4\r\nx' }).success).toBe(false)
  })
  test('a frame is id, event and one line of data, and text cannot end it', () => {
    const turn = {
      id: 'e9',
      event: 'transcript.turn',
      data: {
        callId: call,
        sequence: 2,
        turn: { speaker: 'prospect', startMs: 0, endMs: 1, text: 'a b "quoted"' },
      },
    } as const
    const frame = formatCopilotStreamFrame(turn)
    expect(frame.startsWith('id: e9\nevent: transcript.turn\ndata: {')).toBe(true)
    expect(frame.endsWith('}\n\n')).toBe(true)
    expect(frame.split('\n').length).toBe(5)
    expect(JSON.parse(frame.split('\n')[2]?.slice('data: '.length) ?? '')).toEqual(turn.data)
  })
  test('a frame is never written for an invalid message', () => {
    expect(() =>
      formatCopilotStreamFrame({
        id: 'e1',
        event: 'copilot.card',
        data: { card: { ...similar, citedMoments: [] } },
      } as never)
    ).toThrow()
  })
})

describe('events', () => {
  const envelope = (type: string, data: unknown) => ({
    id: formatId('evt', hex(50)),
    type,
    version: 1,
    occurredAt: NOW,
    organizationId: org,
    region: 'us',
    data,
  })
  const shown = {
    callId: call,
    cardId,
    repMembershipId: mem,
    kind: 'similar_moment',
    objectionType: null,
    evidence: { moments: 11, deals: 5 },
    citedMoments: [ref(1)],
    shownAt: NOW,
  }
  const rated = {
    callId: call,
    cardId,
    repMembershipId: mem,
    kind: 'objection',
    rating: 'useful',
    dismissed: false,
    pinned: true,
    ratedAt: NOW,
  }
  test('both carry the envelope and are registered', () => {
    expect(
      voiceCopilotCardShownEvent.safeParse(envelope('voice.copilot.card_shown', shown)).success
    ).toBe(true)
    expect(
      voiceCopilotCardRatedEvent.safeParse(envelope('voice.copilot.card_rated', rated)).success
    ).toBe(true)
    expect(Object.keys(COPILOT_EVENTS)).toEqual([
      'voice.copilot.card_shown',
      'voice.copilot.card_rated',
    ])
    const { organizationId: _o, ...noOrg } = envelope('voice.copilot.card_shown', shown)
    expect(voiceCopilotCardShownEvent.safeParse(noOrg).success).toBe(false)
  })
  test('the shown event needs a citation, valid Evidence and a matching objection type', () => {
    const bad = (patch: Record<string, unknown>) =>
      voiceCopilotCardShownEvent.safeParse(
        envelope('voice.copilot.card_shown', { ...shown, ...patch })
      ).success
    expect(bad({ citedMoments: [] })).toBe(false)
    expect(bad({ evidence: { moments: 1, deals: 2 } })).toBe(false)
    expect(bad({ objectionType: 'price' })).toBe(false)
    expect(bad({ kind: 'objection', objectionType: null })).toBe(false)
    expect(bad({ kind: 'objection', objectionType: 'price' })).toBe(true)
  })
  test('no card text, quote or Transcript in either event', () => {
    for (const extra of [
      { text: 'hi' },
      { response: 'hi' },
      { quotes: [] },
      { transcript: 'hi' },
    ]) {
      expect(
        voiceCopilotCardShownEvent.safeParse(
          envelope('voice.copilot.card_shown', { ...shown, ...extra })
        ).success
      ).toBe(false)
      expect(
        voiceCopilotCardRatedEvent.safeParse(
          envelope('voice.copilot.card_rated', { ...rated, ...extra })
        ).success
      ).toBe(false)
    }
  })
  test('the rated event carries the end state and not both dismissed and pinned', () => {
    const bad = (patch: Record<string, unknown>) =>
      voiceCopilotCardRatedEvent.safeParse(
        envelope('voice.copilot.card_rated', { ...rated, ...patch })
      ).success
    expect(bad({ rating: null })).toBe(true)
    expect(bad({ dismissed: true })).toBe(false)
    expect(bad({ rating: 'great' })).toBe(false)
  })
})

describe('errors', () => {
  test('the required codes exist with their statuses and are area.reason', () => {
    expect(COPILOT_ERRORS['copilot.disabled'].status).toBe(409)
    expect(COPILOT_ERRORS['copilot.not_started'].status).toBe(409)
    expect(COPILOT_ERRORS['copilot.min_evidence_invalid'].status).toBe(422)
    expect(COPILOT_ERRORS['card.not_found'].status).toBe(404)
    expect(Object.keys(COPILOT_ERRORS)).toHaveLength(4)
    for (const code of Object.keys(COPILOT_ERRORS)) {
      expect(code).toMatch(/^[a-z]+\.[a-z_]+$/)
    }
  })
  test('no code collides with another registry', () => {
    for (const code of Object.keys(COPILOT_ERRORS)) {
      expect(code in VOICE_ERRORS).toBe(false)
      expect(code in SALES_HISTORY_ERRORS).toBe(false)
      expect(code in PROSPECT_ERRORS).toBe(false)
      expect(code in ERRORS).toBe(false)
    }
  })
})

describe('routes', () => {
  const routes = Object.entries(COPILOT_ROUTES)
  test('every code a route lists exists', () => {
    const known = new Set([
      ...Object.keys(COPILOT_ERRORS),
      ...Object.keys(SALES_HISTORY_ERRORS),
      ...Object.keys(ERRORS),
    ])
    for (const [, r] of routes) {
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
  })
  test('method and path are unique, versioned and described', () => {
    const seen = new Set<string>()
    for (const [, r] of routes) {
      const key = `${r.method} ${r.path}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      expect(r.path.startsWith('/v1/')).toBe(true)
      expect(r.description.length).toBeGreaterThan(20)
    }
  })
  test('no route takes an Idempotency-Key and none lists its codes', () => {
    for (const [, r] of routes) {
      expect(r.idempotent).toBe(false)
      expect(r.commonErrors).not.toContain('request.idempotency_key_reused')
    }
  })
  test('the list says cursor and 100, and the stream is the only SSE route', () => {
    expect(COPILOT_ROUTES.listCopilotCards.description).toContain('cursor')
    expect(COPILOT_ROUTES.listCopilotCards.description).toContain('100')
    expect(routes.filter(([, r]) => r.stream).map(([name]) => name)).toEqual(['streamCopilot'])
    expect(COPILOT_ROUTES.streamCopilot.description).toContain('Last-Event-ID')
  })
  test('roles', () => {
    expect(COPILOT_ROUTES.setCopilotSettings.roles).toEqual(['owner', 'admin'])
    expect(COPILOT_ROUTES.getCopilotSettings.roles).toEqual(['owner', 'admin', 'manager', 'rep'])
    expect(COPILOT_ROUTES.streamCopilot.roles).toContain('rep')
  })
  test('Call-scoped routes say visibility follows the role rules', () => {
    for (const name of ['streamCopilot', 'listCopilotCards'] as const) {
      expect(COPILOT_ROUTES[name].description).toContain(
        'a Manager those of the Reps on their Team'
      )
      expect(COPILOT_ROUTES[name].errors).toContain('call.not_found')
    }
  })
})

describe('no switch for the rules (ADR 0003)', () => {
  const FORBIDDEN = /disable|bypass|skip|override|ignore|waive|force|exempt|announce|silent|mute/i
  function collectNames(node: unknown, names: Set<string>): void {
    if (Array.isArray(node)) {
      for (const item of node) {
        collectNames(item, names)
      }
      return
    }
    if (node !== null && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if (key === 'properties' && value !== null && typeof value === 'object') {
          for (const property of Object.keys(value)) {
            names.add(property)
          }
        }
        if (key === 'enum' && Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === 'string') {
              names.add(item)
            }
          }
        }
        if (key === 'const' && typeof value === 'string') {
          names.add(value)
        }
        collectNames(value, names)
      }
    }
  }
  test('no Copilot schema has a field, flag or value that turns off the announcement or its order', () => {
    const schemas: Record<string, z.ZodType> = {
      copilotCardSchema,
      copilotCardPageSchema,
      listCopilotCardsQuerySchema,
      markCopilotCardRequestSchema,
      copilotSettingsSchema,
      setCopilotSettingsRequestSchema,
      copilotStreamMessageSchema,
      shownEvent: voiceCopilotCardShownEvent.schema,
      ratedEvent: voiceCopilotCardRatedEvent.schema,
    }
    for (const [name, schema] of Object.entries(schemas)) {
      const names = new Set<string>()
      collectNames(z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }), names)
      expect(names.size).toBeGreaterThan(0)
      for (const item of names) {
        expect(`${name}.${item}`).not.toMatch(FORBIDDEN)
      }
    }
  })
  test('the settings have exactly the fields they document', () => {
    const json = z.toJSONSchema(setCopilotSettingsRequestSchema, {
      io: 'input',
      unrepresentable: 'any',
    }) as { properties: Record<string, unknown> }
    expect(Object.keys(json.properties).sort()).toEqual(['enabled', 'minDeals', 'minMoments'])
  })
  test('the route names and the error codes carry none either', () => {
    for (const name of Object.keys(COPILOT_ROUTES)) {
      expect(name).not.toMatch(FORBIDDEN)
    }
    // copilot.disabled is the spec's code for a Copilot that is off; it names no switch.
    for (const code of Object.keys(COPILOT_ERRORS).filter((c) => c !== 'copilot.disabled')) {
      expect(code).not.toMatch(FORBIDDEN)
    }
  })
})
