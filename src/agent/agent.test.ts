import { describe, expect, test } from 'bun:test'
import { CHAT_ERRORS } from '../chat'
import { CORE_ERRORS } from '../core'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import { INQUIRY_ERRORS } from '../inquiry'
import { PROSPECT_ERRORS } from '../prospect'
import {
  AGENT_ERRORS,
  AGENT_EVENTS,
  AGENT_ROUTES,
  agentSettingsSchema,
  agentTurnSchema,
  handoffContextSchema,
  handoffSchema,
  listAgentTurnsQuerySchema,
  listHandoffsQuerySchema,
  sendTryMessageRequestSchema,
  setAgentSettingsRequestSchema,
  voiceAgentCallEndedEvent,
  voiceConsentRevokedEvent,
  voiceHandoffCompletedEvent,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const org = formatId('org', hex(1))
const call = formatId('call', hex(2))
const prs = formatId('prs', hex(3))
const mem = formatId('mem', hex(4))
const inq = formatId('inq', hex(5))
const hof = formatId('hof', hex(6))
const cht = formatId('cht', hex(7))
const NOW = '2026-01-01T00:00:00Z'
const LATER = '2026-01-01T00:05:00Z'
const KEY = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'

const settings = {
  paused: false,
  greeting: 'Thanks for your interest in Acme.',
  voiceStyle: 'warm',
  timeZone: 'Europe/Dublin',
  hours: [{ day: 'mon', windows: [{ start: '09:00', end: '17:00' }] }],
  languages: ['en'],
  maxCallSeconds: 600,
  maxCostUsdCents: 500,
  concurrencyCap: 5,
  updatedAt: NOW,
  updatedByMembershipId: mem,
}

describe('Agent settings and ADR 0003', () => {
  const { languages: _l, updatedAt: _u, updatedByMembershipId: _m, ...set } = settings
  test('read and set shapes parse', () => {
    expect(agentSettingsSchema.safeParse(settings).success).toBe(true)
    expect(setAgentSettingsRequestSchema.safeParse(set).success).toBe(true)
  })
  test('no field can turn off the Disclosure or waive Contact Consent', () => {
    for (const schema of [agentSettingsSchema, setAgentSettingsRequestSchema]) {
      for (const key of Object.keys(schema.shape)) {
        expect(key).not.toMatch(/disclos|consent|record|gate|bypass|override/i)
      }
    }
  })
  test('such fields are refused when sent', () => {
    for (const extra of [
      { disclosure: false },
      { skipDisclosure: true },
      { requireConsent: false },
      { consentRequired: false },
      { recording: false },
    ]) {
      expect(setAgentSettingsRequestSchema.safeParse({ ...set, ...extra }).success).toBe(false)
    }
  })
  test('hours can only narrow the fixed calling window', () => {
    const day = (start: string, end: string) => [{ day: 'mon', windows: [{ start, end }] }]
    expect(
      setAgentSettingsRequestSchema.safeParse({ ...set, hours: day('00:00', '23:59') }).success
    ).toBe(false)
    expect(
      setAgentSettingsRequestSchema.safeParse({ ...set, hours: day('07:00', '12:00') }).success
    ).toBe(false)
    expect(
      setAgentSettingsRequestSchema.safeParse({ ...set, hours: day('08:00', '21:00') }).success
    ).toBe(true)
    expect(
      setAgentSettingsRequestSchema.safeParse({ ...set, hours: day('09:00', '17:00') }).success
    ).toBe(true)
  })
  test('hours are not empty and the route says where they are checked', () => {
    expect(setAgentSettingsRequestSchema.safeParse({ ...set, hours: [] }).success).toBe(false)
    expect(AGENT_ROUTES.setAgentSettings.description).toContain("Organization's zone")
  })
  test('the caps are bounded', () => {
    expect(setAgentSettingsRequestSchema.safeParse({ ...set, maxCallSeconds: 0 }).success).toBe(
      false
    )
    expect(
      setAgentSettingsRequestSchema.safeParse({ ...set, maxCallSeconds: 100000 }).success
    ).toBe(false)
    expect(setAgentSettingsRequestSchema.safeParse({ ...set, concurrencyCap: 0 }).success).toBe(
      false
    )
  })
  test('the voice style is a closed list', () => {
    expect(
      setAgentSettingsRequestSchema.safeParse({ ...set, voiceStyle: 'cloned:abc' }).success
    ).toBe(false)
  })
})

describe('turns', () => {
  const turn = {
    index: 0,
    role: 'agent',
    text: 'Hello, this is an AI assistant calling for Acme.',
    sources: [],
    deferred: false,
    toolCall: null,
    at: NOW,
  }
  test('parses; a tool call is from the closed set', () => {
    expect(agentTurnSchema.safeParse(turn).success).toBe(true)
    expect(
      agentTurnSchema.safeParse({ ...turn, toolCall: { name: 'record_answer' } }).success
    ).toBe(true)
    expect(agentTurnSchema.safeParse({ ...turn, toolCall: { name: 'run_shell' } }).success).toBe(
      false
    )
    expect(
      agentTurnSchema.safeParse({ ...turn, toolCall: { name: 'disable_disclosure' } }).success
    ).toBe(false)
  })
  test('lists are cursor-paginated and bounded', () => {
    expect(listAgentTurnsQuerySchema.safeParse({ limit: 100 }).success).toBe(true)
    expect(listAgentTurnsQuerySchema.safeParse({ limit: 101 }).success).toBe(false)
    expect(listHandoffsQuerySchema.safeParse({ limit: 101 }).success).toBe(false)
  })
  test('the try-it message is bounded text', () => {
    expect(sendTryMessageRequestSchema.safeParse({ text: 'What does it cost?' }).success).toBe(true)
    expect(sendTryMessageRequestSchema.safeParse({ text: '' }).success).toBe(false)
    expect(sendTryMessageRequestSchema.safeParse({ text: 'x'.repeat(5000) }).success).toBe(false)
  })
})

describe('Handoff', () => {
  const handoff = {
    id: hof,
    state: 'pending',
    channel: 'call',
    callId: call,
    chatId: null,
    repMembershipId: mem,
    attempt: 1,
    reason: 'asked_for_rep',
    requestedAt: NOW,
    answeredAt: null,
    completedAt: null,
  }
  test('parses', () => {
    expect(handoffSchema.safeParse(handoff).success).toBe(true)
  })
  test('a call Handoff names the Call, a chat Handoff names the Chat', () => {
    expect(handoffSchema.safeParse({ ...handoff, callId: null }).success).toBe(false)
    expect(handoffSchema.safeParse({ ...handoff, channel: 'chat', callId: null }).success).toBe(
      false
    )
    expect(
      handoffSchema.safeParse({ ...handoff, channel: 'chat', callId: null, chatId: cht }).success
    ).toBe(true)
  })
  test('the context for the Rep is bounded and has no raw contact details', () => {
    const ctx = {
      handoffId: hof,
      prospectId: prs,
      qualification: { answers: [], summary: null },
      recentTurns: [],
    }
    expect(handoffContextSchema.safeParse(ctx).success).toBe(true)
    expect(handoffContextSchema.safeParse({ ...ctx, email: 'a@b.co' }).success).toBe(false)
    expect(
      handoffContextSchema.safeParse({
        ...ctx,
        recentTurns: Array.from({ length: 21 }, (_, i) => ({
          index: i,
          role: 'prospect',
          text: 'hi',
          sources: [],
          deferred: false,
          toolCall: null,
          at: NOW,
        })),
      }).success
    ).toBe(false)
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
  const ended = {
    callId: call,
    inquiryId: inq,
    prospectId: prs,
    outcome: 'completed',
    failureReason: null,
    startedAt: NOW,
    endedAt: LATER,
    durationSeconds: 300,
    disclosureWordingVersion: 2,
  }
  const completed = {
    handoffId: hof,
    channel: 'call',
    callId: call,
    chatId: null,
    inquiryId: inq,
    prospectId: prs,
    repMembershipId: mem,
    result: 'bridged',
    attempts: 1,
    requestedAt: NOW,
    answeredAt: NOW,
    completedAt: LATER,
  }
  const revoked = {
    prospectId: prs,
    channel: 'phone',
    trigger: 'agent_call',
    callId: call,
    chatId: null,
    revokedAt: NOW,
  }
  test('voice.agent_call.ended parses and carries ids and times only', () => {
    expect(
      voiceAgentCallEndedEvent.safeParse(envelope('voice.agent_call.ended', ended)).success
    ).toBe(true)
    for (const extra of [{ transcript: 'hi' }, { phone: '+1415' }, { email: 'a@b.co' }]) {
      expect(
        voiceAgentCallEndedEvent.safeParse(
          envelope('voice.agent_call.ended', { ...ended, ...extra })
        ).success
      ).toBe(false)
    }
  })
  test('a call that connected records the Disclosure version that was played', () => {
    expect(
      voiceAgentCallEndedEvent.safeParse(
        envelope('voice.agent_call.ended', { ...ended, disclosureWordingVersion: null })
      ).success
    ).toBe(false)
    expect(
      voiceAgentCallEndedEvent.safeParse(
        envelope('voice.agent_call.ended', {
          ...ended,
          outcome: 'failed',
          failureReason: 'disclosure_failed',
          disclosureWordingVersion: null,
        })
      ).success
    ).toBe(true)
  })
  test('voice.handoff.completed parses', () => {
    expect(
      voiceHandoffCompletedEvent.safeParse(envelope('voice.handoff.completed', completed)).success
    ).toBe(true)
    expect(
      voiceHandoffCompletedEvent.safeParse(
        envelope('voice.handoff.completed', { ...completed, summary: 'text' })
      ).success
    ).toBe(false)
  })
  test('voice.consent.revoked parses and has no free text', () => {
    expect(
      voiceConsentRevokedEvent.safeParse(envelope('voice.consent.revoked', revoked)).success
    ).toBe(true)
    expect(
      voiceConsentRevokedEvent.safeParse(
        envelope('voice.consent.revoked', { ...revoked, quote: 'stop' })
      ).success
    ).toBe(false)
  })
  test('the registry lists the three', () => {
    expect(Object.keys(AGENT_EVENTS)).toEqual([
      'voice.agent_call.ended',
      'voice.handoff.completed',
      'voice.consent.revoked',
    ])
  })
})

describe('errors', () => {
  test('the spec codes exist and none collides', () => {
    for (const code of [
      'agent.paused',
      'agent.consent_required',
      'agent.outside_hours',
      'handoff.no_rep_available',
    ]) {
      expect(code in AGENT_ERRORS).toBe(true)
    }
    for (const code of Object.keys(AGENT_ERRORS)) {
      for (const other of [ERRORS, CORE_ERRORS, PROSPECT_ERRORS, INQUIRY_ERRORS, CHAT_ERRORS]) {
        expect(code in other).toBe(false)
      }
    }
  })
})

describe('routes', () => {
  const routes = Object.entries(AGENT_ROUTES)
  test('every code a route lists exists', () => {
    const known = new Set([...Object.keys(AGENT_ERRORS), ...Object.keys(ERRORS), 'call.not_found'])
    for (const [, r] of routes) {
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
  })
  test('method and path are unique, versioned, described; roles are listed; none is public', () => {
    const seen = new Set<string>()
    for (const [, r] of routes) {
      const key = `${r.method} ${r.path}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      expect(r.path.startsWith('/v1/')).toBe(true)
      expect(r.description.length).toBeGreaterThan(40)
      expect(r.roles.length).toBeGreaterThan(0)
      expect(r.public).toBeUndefined()
    }
  })
  test('list routes describe the cursor and the maximum page size', () => {
    for (const name of ['listQualificationQuestions', 'listAgentTurns', 'listHandoffs'] as const) {
      expect(AGENT_ROUTES[name].description).toContain('cursor')
      expect(AGENT_ROUTES[name].description).toContain('100')
    }
  })
  test('routes that need a key say so; idempotent routes list the replay errors', () => {
    for (const [, r] of routes) {
      if (r.keyRequired) {
        expect(r.description).toContain('Idempotency-Key')
      }
      if (r.idempotent) {
        expect(r.commonErrors).toContain('request.idempotency_key_reused')
      }
    }
  })
  test('settings are for Owner and Admin to write; the Handoff is answered by Reps', () => {
    expect(AGENT_ROUTES.setAgentSettings.roles).toEqual(['owner', 'admin'])
    expect(AGENT_ROUTES.acceptHandoff.roles).toContain('rep')
    expect(AGENT_ROUTES.acceptHandoff.errors).toContain('handoff.not_pending')
    expect(AGENT_ROUTES.acceptHandoff.description).toContain('Rep')
  })
  test('the settings description states the Disclosure and consent have no setting', () => {
    expect(AGENT_ROUTES.setAgentSettings.description).toContain('Disclosure')
    expect(AGENT_ROUTES.setAgentSettings.description).toContain('ADR 0003')
  })
  test('the try-it routes are admin only and key-protected', () => {
    expect(AGENT_ROUTES.startTrySession.roles).toEqual(['owner', 'admin'])
    expect(AGENT_ROUTES.sendTryMessage.keyRequired).toBe(true)
  })
})

test('the area is exported from the entry point', async () => {
  const api = await import('../index')
  expect(api.AGENT_ROUTES).toBe(AGENT_ROUTES)
  expect(api.voiceHandoffCompletedEvent).toBe(voiceHandoffCompletedEvent)
  expect(KEY.length).toBeGreaterThan(15)
})
