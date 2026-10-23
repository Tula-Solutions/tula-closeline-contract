import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { ERRORS } from '../errors'
import { callIdSchema, formatId } from '../ids'
import { MAX_PAGE_SIZE } from '../pagination'
import { SALES_HISTORY_ERRORS } from '../playbook'
import { PROSPECT_ERRORS } from '../prospect'
import {
  addLineRequestSchema,
  assignLineRequestSchema,
  getTranscriptQuerySchema,
  lineSchema,
  listLinesQuerySchema,
  listVoiceCallsQuerySchema,
  placeCallHeadersSchema,
  placeCallRequestSchema,
  placedCallSchema,
  recordingPlaybackSchema,
  softphoneTokenSchema,
  transcriptPageSchema,
  VOICE_ERRORS,
  VOICE_EVENTS,
  VOICE_ROUTES,
  voiceCallEndedEvent,
  voiceCallSchema,
  voiceCallStartedEvent,
  wrapUpRequestSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const org = formatId('org', hex(1))
const call = formatId('call', hex(2))
const line = formatId('line', hex(3))
const mem = formatId('mem', hex(4))
const prs = formatId('prs', hex(5))
const team = formatId('team', hex(6))
const NOW = '2026-01-01T00:00:00Z'
const LATER = '2026-01-01T00:05:00Z'
const HASH = 'a'.repeat(64)

const endedCall = {
  id: call,
  direction: 'outbound',
  state: 'ended',
  lineId: line,
  repMembershipId: mem,
  prospectId: prs,
  prospectNumber: '+14155550123',
  disclosure: { wordingVersion: 1, playedAt: NOW, aiAssisted: false },
  createdAt: NOW,
  answeredAt: NOW,
  endedAt: LATER,
  durationSeconds: 300,
  endedBy: 'rep',
  failureReason: null,
  dealId: null,
  note: null,
  recordingState: 'stored',
  transcriptState: 'ready',
}

describe('place a Call', () => {
  const valid = { to: '(415) 555-0123' }
  const key = 'place-call-0000001'
  test('requires the Idempotency-Key header', () => {
    expect(placeCallHeadersSchema.safeParse({ 'idempotency-key': key }).success).toBe(true)
    expect(placeCallHeadersSchema.safeParse({}).success).toBe(false)
    expect(placeCallHeadersSchema.safeParse({ 'idempotency-key': 'short' }).success).toBe(false)
    expect(
      placeCallHeadersSchema.safeParse({ 'idempotency-key': 'bad key!!!!!!!!!!!' }).success
    ).toBe(false)
  })
  test('the key is not in the body', () => {
    expect(placeCallRequestSchema.safeParse(valid).success).toBe(true)
    expect(placeCallRequestSchema.safeParse({ ...valid, idempotencyKey: key }).success).toBe(false)
  })
  test('refuses unknown fields such as a switch for the Disclosure or consent', () => {
    for (const extra of ['skipDisclosure', 'consent', 'record', 'force']) {
      expect(placeCallRequestSchema.safeParse({ ...valid, [extra]: true }).success).toBe(false)
    }
  })
  test('the answer carries the Call and at most four warnings', () => {
    const warning = { code: 'consent.missing', suppressionReason: null }
    expect(placedCallSchema.shape.warnings.safeParse([warning, warning]).success).toBe(true)
    expect(placedCallSchema.shape.warnings.safeParse(Array(5).fill(warning)).success).toBe(false)
  })
})

describe('Call state machine', () => {
  test('an ended Call is valid', () => {
    expect(voiceCallSchema.safeParse(endedCall).success).toBe(true)
  })
  test('uses the existing call id', () => {
    expect(callIdSchema.safeParse(call).success).toBe(true)
  })
  const cases: [string, Record<string, unknown>][] = [
    [
      'live without a played Disclosure',
      {
        state: 'live',
        disclosure: { wordingVersion: null, playedAt: null, aiAssisted: false },
        recordingState: 'none',
        transcriptState: 'pending',
        endedAt: null,
        durationSeconds: null,
        endedBy: null,
      },
    ],
    [
      'a Recording before the Disclosure',
      {
        state: 'connecting',
        disclosure: { wordingVersion: null, playedAt: null, aiAssisted: false },
        answeredAt: null,
        endedAt: null,
        durationSeconds: null,
        endedBy: null,
        transcriptState: 'pending',
        recordingState: 'storing',
      },
    ],
    ['a failure reason on an ended Call', { failureReason: 'timeout' }],
    ['a ready Transcript without a stored Recording', { recordingState: 'storing' }],
    ['a wrap-up on a Call that has not ended', { state: 'live', note: 'x' }],
    ['a duration on a failed Call', { state: 'failed', failureReason: 'busy' }],
    [
      'a half-set Disclosure',
      { disclosure: { wordingVersion: 1, playedAt: null, aiAssisted: false } },
    ],
  ]
  for (const [name, patch] of cases) {
    test(`rejects ${name}`, () => {
      expect(voiceCallSchema.safeParse({ ...endedCall, ...patch }).success).toBe(false)
    })
  }
  test('a failed Call needs a reason and an end time', () => {
    const failed = {
      ...endedCall,
      state: 'failed',
      failureReason: 'disclosure_failed',
      disclosure: { wordingVersion: null, playedAt: null, aiAssisted: false },
      answeredAt: null,
      durationSeconds: null,
      recordingState: 'none',
      transcriptState: 'pending',
    }
    expect(voiceCallSchema.safeParse(failed).success).toBe(true)
    expect(voiceCallSchema.safeParse({ ...failed, failureReason: null }).success).toBe(false)
    expect(voiceCallSchema.safeParse({ ...failed, endedAt: null }).success).toBe(false)
  })
})

describe('Lines', () => {
  const lineRecord = {
    id: line,
    number: '+14155550123',
    country: 'US',
    label: null,
    state: 'active',
    assignment: { kind: 'team', teamId: team },
    createdAt: NOW,
    releasedAt: null,
  }
  test('a released Line is unassigned and has a release time', () => {
    expect(lineSchema.safeParse(lineRecord).success).toBe(true)
    expect(lineSchema.safeParse({ ...lineRecord, releasedAt: NOW }).success).toBe(false)
    expect(
      lineSchema.safeParse({ ...lineRecord, state: 'released', releasedAt: NOW }).success
    ).toBe(false)
    expect(
      lineSchema.safeParse({
        ...lineRecord,
        state: 'released',
        releasedAt: NOW,
        assignment: { kind: 'unassigned' },
      }).success
    ).toBe(true)
  })
  test('add by buying or porting', () => {
    expect(
      addLineRequestSchema.safeParse({ method: 'buy', country: 'US', areaCode: '415' }).success
    ).toBe(true)
    expect(addLineRequestSchema.safeParse({ method: 'port', number: '+14155550123' }).success).toBe(
      true
    )
    expect(addLineRequestSchema.safeParse({ method: 'buy', country: 'usa' }).success).toBe(false)
    expect(addLineRequestSchema.safeParse({ method: 'steal' }).success).toBe(false)
  })
  test('assign to a Team, a Rep or nobody', () => {
    expect(assignLineRequestSchema.safeParse({ kind: 'rep', membershipId: mem }).success).toBe(true)
    expect(assignLineRequestSchema.safeParse({ kind: 'unassigned' }).success).toBe(true)
    expect(assignLineRequestSchema.safeParse({ kind: 'rep', teamId: team }).success).toBe(false)
  })
})

describe('lists cap at 100', () => {
  test('every list query', () => {
    for (const schema of [
      listLinesQuerySchema,
      listVoiceCallsQuerySchema,
      getTranscriptQuerySchema,
    ]) {
      expect(schema.safeParse({ limit: MAX_PAGE_SIZE }).success).toBe(true)
      expect(schema.safeParse({ limit: MAX_PAGE_SIZE + 1 }).success).toBe(false)
    }
  })
  test('the Call list needs from before to', () => {
    expect(listVoiceCallsQuerySchema.safeParse({ from: NOW, to: LATER }).success).toBe(true)
    expect(listVoiceCallsQuerySchema.safeParse({ from: LATER, to: NOW }).success).toBe(false)
  })
})

describe('Transcript, Recording, wrap-up and token', () => {
  test('a Transcript page carries turns, state and the call id', () => {
    const page = {
      callId: call,
      state: 'ready',
      items: [{ speaker: 'rep', startMs: 0, endMs: 1000, text: 'Hello' }],
      nextCursor: null,
    }
    expect(transcriptPageSchema.safeParse(page).success).toBe(true)
    const bad = { ...page, items: [{ speaker: 'rep', startMs: 2000, endMs: 1000, text: 'Hello' }] }
    expect(transcriptPageSchema.safeParse(bad).success).toBe(false)
  })
  test('playback is an https URL with an expiry', () => {
    const playback = {
      callId: call,
      url: 'https://example.com/r?sig=abc',
      expiresAt: LATER,
      mediaType: 'audio/mpeg',
      channels: 2,
      durationSeconds: 300,
    }
    expect(recordingPlaybackSchema.safeParse(playback).success).toBe(true)
    expect(
      recordingPlaybackSchema.safeParse({ ...playback, url: 'http://example.com/r' }).success
    ).toBe(false)
  })
  test('wrap-up needs a field', () => {
    expect(wrapUpRequestSchema.safeParse({}).success).toBe(false)
    expect(wrapUpRequestSchema.safeParse({ note: 'Good call' }).success).toBe(true)
    expect(wrapUpRequestSchema.safeParse({ note: null }).success).toBe(true)
  })
  test('the Softphone token lives at most an hour', () => {
    const token = { token: 't', identity: mem, ttlSeconds: 3600, expiresAt: LATER }
    expect(softphoneTokenSchema.safeParse(token).success).toBe(true)
    expect(softphoneTokenSchema.safeParse({ ...token, ttlSeconds: 3601 }).success).toBe(false)
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
  const started = {
    callId: call,
    direction: 'outbound',
    lineId: line,
    repMembershipId: mem,
    prospectId: prs,
    prospectPhoneHash: HASH,
    startedAt: NOW,
  }
  const ended = {
    callId: call,
    direction: 'outbound',
    lineId: line,
    repMembershipId: mem,
    prospectId: prs,
    prospectPhoneHash: HASH,
    outcome: 'completed',
    failureReason: null,
    startedAt: NOW,
    answeredAt: NOW,
    endedAt: LATER,
    durationSeconds: 300,
    disclosureWordingVersion: 1,
    recordingKey: 'rec/abc',
    dealId: null,
  }
  test('both carry the envelope', () => {
    expect(voiceCallStartedEvent.safeParse(envelope('voice.call.started', started)).success).toBe(
      true
    )
    expect(voiceCallEndedEvent.safeParse(envelope('voice.call.ended', ended)).success).toBe(true)
    expect(Object.keys(VOICE_EVENTS)).toEqual([
      'voice.call.started',
      'voice.call.ended',
      'call.turn_completed',
    ])
    const { organizationId: _o, ...noOrg } = envelope('voice.call.started', started)
    expect(voiceCallStartedEvent.safeParse(noOrg).success).toBe(false)
  })
  test('no number or Transcript text in clear', () => {
    for (const extra of [
      { to: '+14155550123' },
      { prospectNumber: '+14155550123' },
      { text: 'hi' },
      { transcript: 'hi' },
    ]) {
      expect(
        voiceCallStartedEvent.safeParse(envelope('voice.call.started', { ...started, ...extra }))
          .success
      ).toBe(false)
      expect(
        voiceCallEndedEvent.safeParse(envelope('voice.call.ended', { ...ended, ...extra })).success
      ).toBe(false)
    }
    expect(
      voiceCallStartedEvent.safeParse(
        envelope('voice.call.started', { ...started, prospectPhoneHash: '+14155550123' })
      ).success
    ).toBe(false)
  })
  test('the ended event keeps the outcome consistent', () => {
    const bad = (patch: Record<string, unknown>) =>
      voiceCallEndedEvent.safeParse(envelope('voice.call.ended', { ...ended, ...patch })).success
    expect(bad({ failureReason: 'busy' })).toBe(false)
    expect(bad({ outcome: 'failed', failureReason: null, durationSeconds: null })).toBe(false)
    expect(bad({ disclosureWordingVersion: null })).toBe(false)
    expect(
      bad({ outcome: 'failed', failureReason: 'disclosure_failed', durationSeconds: null })
    ).toBe(false)
    expect(bad({ outcome: 'missed', durationSeconds: null, dealId: 'DEAL-1' })).toBe(false)
  })
})

describe('errors', () => {
  test('the required codes exist and all are area.reason', () => {
    expect('call.number_invalid' in VOICE_ERRORS).toBe(true)
    expect('call.disclosure_failed' in VOICE_ERRORS).toBe(true)
    expect('line.not_found' in VOICE_ERRORS).toBe(true)
    expect('call.not_found' in SALES_HISTORY_ERRORS).toBe(true)
    expect('call.provider_call_not_found' in VOICE_ERRORS).toBe(true)
    for (const code of Object.keys(VOICE_ERRORS)) {
      expect(code).toMatch(/^[a-z]+\.[a-z_]+$/)
    }
  })
  test('call.provider_call_not_found is a 404 with its own message', () => {
    expect(VOICE_ERRORS['call.provider_call_not_found']).toEqual({
      code: 'call.provider_call_not_found',
      status: 404,
      message: 'The telephony provider call is not known.',
    })
  })
  test('no code collides with another registry', () => {
    for (const code of Object.keys(VOICE_ERRORS)) {
      expect(code in SALES_HISTORY_ERRORS).toBe(false)
      expect(code in PROSPECT_ERRORS).toBe(false)
      expect(code in ERRORS).toBe(false)
    }
  })
})

describe('routes', () => {
  const routes = Object.entries(VOICE_ROUTES)
  test('every code a route lists exists', () => {
    const known = new Set([
      ...Object.keys(VOICE_ERRORS),
      ...Object.keys(SALES_HISTORY_ERRORS),
      ...Object.keys(PROSPECT_ERRORS),
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
  test('lists say cursor and 100', () => {
    for (const name of ['listLines', 'listCalls', 'getCallTranscript'] as const) {
      expect(VOICE_ROUTES[name].description).toContain('cursor')
      expect(VOICE_ROUTES[name].description).toContain('100')
    }
  })
  test('idempotent routes take the Idempotency-Key header and place-a-Call requires it', () => {
    expect(VOICE_ROUTES.placeCall.idempotent).toBe(true)
    expect(VOICE_ROUTES.addLine.idempotent).toBe(true)
    for (const [, r] of routes) {
      if (r.idempotent) {
        expect(r.commonErrors).toContain('request.idempotency_key_reused')
      }
    }
    expect(VOICE_ROUTES.placeCall.keyRequired).toBe(true)
    expect(VOICE_ROUTES.addLine.keyRequired).toBeUndefined()
    expect(VOICE_ROUTES.placeCall.description).toContain('Idempotency-Key header is required')
  })
  test('adding a Line lists only Line codes', () => {
    expect(VOICE_ROUTES.addLine.errors).toEqual(['line.number_unavailable'])
  })
  test('roles', () => {
    for (const name of ['addLine', 'assignLine', 'releaseLine', 'deleteCallRecording'] as const) {
      expect(VOICE_ROUTES[name].roles).toEqual(['owner', 'admin'])
    }
    expect(VOICE_ROUTES.mintSoftphoneToken.roles).toEqual(['owner', 'admin', 'manager', 'rep'])
    expect(VOICE_ROUTES.placeCall.roles).toContain('rep')
  })
})

describe('no switch for the rules (ADR 0003)', () => {
  const FORBIDDEN = /disable|bypass|skip|override|ignore|waive|force|exempt/i
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
  test('no voice schema has a field, flag or value that disables the Disclosure or the check', () => {
    const schemas: Record<string, z.ZodType> = {
      lineSchema,
      addLineRequestSchema,
      assignLineRequestSchema,
      voiceCallSchema,
      placeCallRequestSchema,
      placedCallSchema,
      listVoiceCallsQuerySchema,
      transcriptPageSchema,
      recordingPlaybackSchema,
      wrapUpRequestSchema,
      softphoneTokenSchema,
      startedEvent: voiceCallStartedEvent.schema,
      endedEvent: voiceCallEndedEvent.schema,
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
  test('the route names and the error codes carry none either', () => {
    for (const name of Object.keys(VOICE_ROUTES)) {
      expect(name).not.toMatch(FORBIDDEN)
    }
    for (const code of Object.keys(VOICE_ERRORS)) {
      expect(code).not.toMatch(FORBIDDEN)
    }
  })
})
