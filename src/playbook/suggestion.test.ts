import { describe, expect, test } from 'bun:test'
import { id, NOW } from '../core/fixtures'
import { ERRORS } from '../errors'
import { voiceCallEndedEvent } from '../voice'
import { callTurnCompletedEvent, VOICE_EVENTS } from '../voice/events'
import {
  ALL_PLAYBOOK_ERRORS,
  ALL_PLAYBOOK_ROUTES,
  acceptSuggestionRequestSchema,
  dealOutcomeChangedEvent,
  listSuggestionsQuerySchema,
  MOMENT_ORIGINS,
  PLAYBOOK_EVENTS,
  rejectSuggestionRequestSchema,
  SUGGESTION_ERRORS,
  SUGGESTION_ROUTES,
  suggestionSchema,
} from './index'

const moment = { kind: 'moment', callId: id('call'), dealRecordId: id('deal') }
const pending = {
  id: id('sgs'),
  kind: 'objection_answer',
  status: 'pending',
  text: 'When price comes up, offer the annual plan.',
  provenance: { dealRecordId: id('deal'), moments: [moment] },
  createdAt: NOW,
  decidedAt: null,
  decidedByMembershipId: null,
}

describe('Moment origin', () => {
  test('is a closed list', () => {
    expect([...MOMENT_ORIGINS]).toEqual(['imported', 'rep', 'agent'])
  })
})

describe('Suggestion', () => {
  test('a pending Suggestion has no decision', () => {
    expect(suggestionSchema.safeParse(pending).success).toBe(true)
    expect(suggestionSchema.safeParse({ ...pending, decidedAt: NOW }).success).toBe(false)
    expect(
      suggestionSchema.safeParse({ ...pending, decidedByMembershipId: id('mem') }).success
    ).toBe(false)
  })

  test('a decided Suggestion has a time and a decider', () => {
    const accepted = {
      ...pending,
      status: 'accepted',
      decidedAt: NOW,
      decidedByMembershipId: id('mem'),
    }
    expect(suggestionSchema.safeParse(accepted).success).toBe(true)
    expect(suggestionSchema.safeParse({ ...accepted, decidedAt: null }).success).toBe(false)
    expect(suggestionSchema.safeParse({ ...accepted, status: 'rejected' }).success).toBe(true)
  })

  test('kind and status are closed; text and Moments are bounded', () => {
    expect(suggestionSchema.safeParse({ ...pending, kind: 'tip' }).success).toBe(false)
    expect(suggestionSchema.safeParse({ ...pending, status: 'done' }).success).toBe(false)
    expect(suggestionSchema.safeParse({ ...pending, text: 'x'.repeat(1001) }).success).toBe(false)
    const many = { dealRecordId: id('deal'), moments: Array(11).fill(moment) }
    expect(suggestionSchema.safeParse({ ...pending, provenance: many }).success).toBe(false)
    const document = { kind: 'document', documentId: id('doc'), page: 1 }
    const mixed = { dealRecordId: id('deal'), moments: [document] }
    expect(suggestionSchema.safeParse({ ...pending, provenance: mixed }).success).toBe(false)
  })
})

describe('requests', () => {
  test('accept takes optional text; reject takes nothing', () => {
    expect(acceptSuggestionRequestSchema.safeParse({}).success).toBe(true)
    expect(acceptSuggestionRequestSchema.safeParse({ text: 'Edited.' }).success).toBe(true)
    expect(acceptSuggestionRequestSchema.safeParse({ text: '' }).success).toBe(false)
    expect(acceptSuggestionRequestSchema.safeParse({ text: 'a', kind: 'x' }).success).toBe(false)
    expect(rejectSuggestionRequestSchema.safeParse({}).success).toBe(true)
    expect(rejectSuggestionRequestSchema.safeParse({ reason: 'no' }).success).toBe(false)
  })

  test('the list is paged and filters by status', () => {
    expect(listSuggestionsQuerySchema.safeParse({ status: 'pending', limit: '100' }).success).toBe(
      true
    )
    expect(listSuggestionsQuerySchema.safeParse({ status: 'open' }).success).toBe(false)
    expect(listSuggestionsQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
  })
})

describe('errors and routes', () => {
  test('not found is 404 and not pending is 409', () => {
    expect(SUGGESTION_ERRORS['suggestion.not_found'].status).toBe(404)
    expect(SUGGESTION_ERRORS['suggestion.not_pending'].status).toBe(409)
    expect(ALL_PLAYBOOK_ERRORS['suggestion.not_pending'].code).toBe('suggestion.not_pending')
  })

  test('are merged into the Playbook tables, Owner and Admin only, decisions are POSTs', () => {
    const known = new Set<string>([
      ...Object.values(SUGGESTION_ERRORS).map((e) => e.code),
      ...Object.values(ERRORS).map((e) => e.code),
    ])
    for (const [name, r] of Object.entries(SUGGESTION_ROUTES)) {
      expect(ALL_PLAYBOOK_ROUTES[name as keyof typeof SUGGESTION_ROUTES]).toBe(r)
      expect(r.roles).toEqual(['owner', 'admin'])
      expect(r.internal).toBe(false)
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
    expect(SUGGESTION_ROUTES.acceptSuggestion.method).toBe('POST')
    expect(SUGGESTION_ROUTES.rejectSuggestion.method).toBe('POST')
    expect(SUGGESTION_ROUTES.acceptSuggestion.errors).toContain('suggestion.not_pending')
    expect(SUGGESTION_ROUTES.getSuggestion.description).toContain('never 403')
  })
})

const envelope = (type: string, data: unknown) => ({
  id: id('evt', 50),
  type,
  version: 1,
  occurredAt: NOW,
  organizationId: id('org'),
  region: 'us',
  data,
})

describe('deal.outcome_changed event', () => {
  const data = {
    dealRecordId: id('deal'),
    prospectId: null,
    previousOutcome: 'open',
    outcome: 'won',
    changedAt: NOW,
  }

  test('carries ids and labels, and the Outcome must change', () => {
    expect(dealOutcomeChangedEvent.safeParse(envelope('deal.outcome_changed', data)).success).toBe(
      true
    )
    expect(PLAYBOOK_EVENTS['deal.outcome_changed']).toBe(dealOutcomeChangedEvent)
    const bad = (extra: object) =>
      dealOutcomeChangedEvent.safeParse(envelope('deal.outcome_changed', { ...data, ...extra }))
    expect(bad({ outcome: 'open' }).success).toBe(false)
    expect(bad({ dealId: 'crm-123' }).success).toBe(false)
    expect(bad({ outcome: 'sold' }).success).toBe(false)
  })
})

describe('call.turn_completed event', () => {
  const data = {
    callId: id('call'),
    turnIndex: 3,
    agentKind: 'inbound',
    instructionVersion: null,
    prospectId: id('prs'),
    citedSources: [moment, { kind: 'document', documentId: id('doc'), page: null }],
    completedAt: NOW,
  }

  test('carries ids and cited sources, no text', () => {
    expect(callTurnCompletedEvent.safeParse(envelope('call.turn_completed', data)).success).toBe(
      true
    )
    expect(VOICE_EVENTS['call.turn_completed']).toBe(callTurnCompletedEvent)
    expect(voiceCallEndedEvent.type).toBe('voice.call.ended')
    const bad = (extra: object) =>
      callTurnCompletedEvent.safeParse(envelope('call.turn_completed', { ...data, ...extra }))
    expect(bad({ transcript: 'hello' }).success).toBe(false)
    expect(bad({ citedSources: Array(21).fill(moment) }).success).toBe(false)
    expect(bad({ turnIndex: -1 }).success).toBe(false)
    expect(bad({ instructionVersion: 0 }).success).toBe(false)
  })
})
