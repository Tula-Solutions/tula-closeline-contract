import { describe, expect, test } from 'bun:test'
import { AGENT_ERRORS } from '../agent'
import {
  branchConditionSchema,
  callStepSchema,
  ENROLLMENT_STOP_REASONS,
  enrollmentStopReasonSchema,
  sequenceStepsSchema,
  stepSchema,
} from '../campaign'
import { CONSENT_ERRORS } from '../consent'
import { formatId } from '../ids'
import {
  AGENT_CALL_ERRORS,
  AGENT_CALL_EVENTS,
  AGENT_CALL_ROUTES,
  agentCallSchema,
  CALL_GATE_CODES,
  listAgentCallsQuerySchema,
  repAgentCallHeadersSchema,
  repAgentCallRequestSchema,
  requestAgentCallRequestSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const org = formatId('org', hex(1))
const prs = formatId('prs', hex(2))
const lin = formatId('line', hex(3))
const enr = formatId('enr', hex(4))
const mem = formatId('mem', hex(5))
const acl = formatId('acl', hex(6))
const call = formatId('call', hex(7))
const NOW = '2026-01-01T00:00:00Z'
const KEY = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'

const callStep = { kind: 'call', key: 'ring', goal: 'Book a demo', lineId: null, next: 'done' }

describe('the call Step', () => {
  test('defaults to three attempts four hours apart', () => {
    const step = callStepSchema.parse(callStep)
    expect(step.maxAttempts).toBe(3)
    expect(step.retryAfterHours).toBe(4)
  })
  test.each([
    ['four attempts', { maxAttempts: 4 }],
    ['no attempts', { maxAttempts: 0 }],
    ['a retry after 3 hours', { retryAfterHours: 3 }],
    ['an extra field', { waiveConsent: true }],
  ])('rejects %s', (_, change) => {
    expect(callStepSchema.safeParse({ ...callStep, ...change }).success).toBe(false)
  })
  test('accepts the limits themselves', () => {
    expect(
      callStepSchema.safeParse({ ...callStep, maxAttempts: 1, retryAfterHours: 2160 }).success
    ).toBe(true)
    expect(
      callStepSchema.safeParse({ ...callStep, maxAttempts: 3, retryAfterHours: 4 }).success
    ).toBe(true)
  })
  test('is a Step of a valid Sequence with a branch on the result', () => {
    const steps = [
      callStep,
      {
        kind: 'branch',
        key: 'after',
        arms: [
          { condition: { kind: 'call_result', result: 'voicemail' }, next: 'done' },
          { condition: { kind: 'call_end_reason', endReason: 'opted_out' }, next: 'done' },
        ],
        default: 'done',
      },
      { kind: 'end', key: 'done' },
    ]
    expect(stepSchema.safeParse(steps[0]).success).toBe(true)
    // `call` goes to `done`, so `after` is unreachable: the graph rules apply to a call Step too.
    expect(sequenceStepsSchema.safeParse(steps).success).toBe(false)
    steps[0] = { ...callStep, next: 'after' }
    expect(sequenceStepsSchema.safeParse(steps).success).toBe(true)
  })
  test('an existing Sequence of the old kinds still parses', () => {
    const steps = [
      { kind: 'email', key: 'a', goal: 'Intro', variants: null, next: 'b' },
      { kind: 'wait', key: 'b', waitHours: 48, next: 'c' },
      {
        kind: 'rep_task',
        key: 'c',
        task: 'call',
        instruction: 'Phone them',
        dueInHours: 24,
        next: 'd',
      },
      { kind: 'end', key: 'd' },
    ]
    expect(sequenceStepsSchema.safeParse(steps).success).toBe(true)
    expect(branchConditionSchema.safeParse({ kind: 'task_completed' }).success).toBe(true)
  })
  test('a branch on a result or reason not in the enum is rejected', () => {
    expect(
      branchConditionSchema.safeParse({ kind: 'call_result', result: 'ringing' }).success
    ).toBe(false)
    expect(branchConditionSchema.safeParse({ kind: 'call_result', result: 'booked' }).success).toBe(
      false
    )
    expect(
      branchConditionSchema.safeParse({ kind: 'call_end_reason', endReason: 'voicemail' }).success
    ).toBe(false)
    expect(branchConditionSchema.safeParse({ kind: 'call_result' }).success).toBe(false)
  })
  test('call.opted_out is an Enrollment stop reason', () => {
    expect(ENROLLMENT_STOP_REASONS).toContain('call.opted_out')
    expect(enrollmentStopReasonSchema.safeParse('call.opted_out').success).toBe(true)
  })
})

describe('requests', () => {
  const internal = {
    idempotencyKey: `${enr}:ring:1`,
    prospectId: prs,
    lineId: null,
    enrollmentId: enr,
    stepKey: 'ring',
    attempt: 1,
    goal: 'Book a demo',
  }
  test('the internal request is invalid without an idempotency key', () => {
    expect(requestAgentCallRequestSchema.safeParse(internal).success).toBe(true)
    const { idempotencyKey: _, ...without } = internal
    expect(requestAgentCallRequestSchema.safeParse(without).success).toBe(false)
    expect(
      requestAgentCallRequestSchema.safeParse({ ...internal, idempotencyKey: 'short' }).success
    ).toBe(false)
  })
  test('the internal request takes no Organization and no waiver, and at most three attempts', () => {
    expect(
      requestAgentCallRequestSchema.safeParse({ ...internal, organizationId: org }).success
    ).toBe(false)
    expect(
      requestAgentCallRequestSchema.safeParse({ ...internal, skipConsent: true }).success
    ).toBe(false)
    expect(requestAgentCallRequestSchema.safeParse({ ...internal, attempt: 4 }).success).toBe(false)
  })
  test('the Rep request has a goal and needs the Idempotency-Key header', () => {
    expect(
      repAgentCallRequestSchema.safeParse({ prospectId: prs, lineId: null, goal: 'Follow up' })
        .success
    ).toBe(true)
    expect(repAgentCallRequestSchema.safeParse({ prospectId: prs, lineId: null }).success).toBe(
      false
    )
    expect(
      repAgentCallRequestSchema.safeParse({
        prospectId: prs,
        lineId: null,
        goal: 'x',
        enrollmentId: enr,
      }).success
    ).toBe(false)
    expect(repAgentCallHeadersSchema.safeParse({}).success).toBe(false)
    expect(repAgentCallHeadersSchema.safeParse({ 'idempotency-key': KEY }).success).toBe(true)
  })
  test('lists use a cursor and at most 100 items a page', () => {
    expect(listAgentCallsQuerySchema.safeParse({ limit: 100, result: 'blocked' }).success).toBe(
      true
    )
    expect(listAgentCallsQuerySchema.safeParse({ limit: 101 }).success).toBe(false)
    expect(listAgentCallsQuerySchema.safeParse({ result: 'ringing' }).success).toBe(false)
  })
})

describe('the Agent Call record', () => {
  const base = {
    id: acl,
    source: 'campaign_step',
    prospectId: prs,
    lineId: lin,
    enrollmentId: enr,
    stepKey: 'ring',
    requestedByMembershipId: null,
    attempt: 1,
    state: 'ended',
    result: 'answered',
    endReason: 'booked',
    gateCode: null,
    retryAt: null,
    callId: call,
    durationSeconds: 120,
    createdAt: NOW,
    endedAt: NOW,
  }
  const ok = (change: object) => agentCallSchema.safeParse({ ...base, ...change }).success
  test('an answered Call with an end reason is valid', () => {
    expect(ok({})).toBe(true)
  })
  test.each([
    ['answered without an end reason', { endReason: null }],
    ['a voicemail with an end reason', { result: 'voicemail' }],
    ['an ended Call without a result', { result: null, endReason: null }],
    ['a result before the end', { state: 'dialing', endedAt: null }],
    ['a Step request without its Enrollment', { enrollmentId: null }],
    ['a Step request made by a Rep', { requestedByMembershipId: mem }],
    [
      'a live Call without its Call',
      {
        state: 'live',
        result: null,
        endReason: null,
        endedAt: null,
        callId: null,
        durationSeconds: null,
      },
    ],
    ['an unknown gate code', { gateCode: 'consent.maybe' }],
  ])('rejects %s', (_, change) => {
    expect(ok(change)).toBe(false)
  })
  test('a blocked request carries its code and was never dialed', () => {
    const blocked = {
      result: 'blocked',
      endReason: null,
      gateCode: 'consent.missing',
      callId: null,
      durationSeconds: null,
    }
    expect(ok(blocked)).toBe(true)
    expect(ok({ ...blocked, gateCode: null })).toBe(false)
    expect(ok({ ...blocked, callId: call })).toBe(false)
  })
  test('a deferral is queued with a retry time and uses no Call', () => {
    const deferred = {
      state: 'queued',
      result: null,
      endReason: null,
      endedAt: null,
      callId: null,
      durationSeconds: null,
      gateCode: 'agent_call.line_cap_reached',
      retryAt: NOW,
    }
    expect(ok(deferred)).toBe(true)
    expect(ok({ ...deferred, retryAt: null })).toBe(false)
  })
  test('a Rep request names the Rep and no Enrollment', () => {
    const rep = {
      source: 'rep_request',
      enrollmentId: null,
      stepKey: null,
      requestedByMembershipId: mem,
    }
    expect(ok(rep)).toBe(true)
    expect(ok({ ...rep, requestedByMembershipId: null })).toBe(false)
  })
})

describe('the ended event', () => {
  const data = {
    agentCallId: acl,
    callId: call,
    source: 'campaign_step',
    enrollmentId: enr,
    stepKey: 'ring',
    prospectId: prs,
    attempt: 1,
    result: 'answered',
    endReason: 'opted_out',
    gateCode: null,
    durationSeconds: 30,
    disclosureWordingVersion: 2,
    endedAt: NOW,
  }
  const envelope = (d: object) => ({
    id: formatId('evt', hex(9)),
    type: 'voice.agent_call.ended',
    version: 2,
    occurredAt: NOW,
    organizationId: org,
    region: 'us',
    data: d,
  })
  const ok = (change: object) =>
    AGENT_CALL_EVENTS['voice.agent_call.ended'].safeParse(envelope({ ...data, ...change })).success
  test('carries the result and the end reason', () => {
    expect(ok({})).toBe(true)
    expect(ok({ endReason: null })).toBe(false)
    expect(ok({ disclosureWordingVersion: null })).toBe(false)
  })
  test('a voicemail leaves no end reason; a blocked one carries the gate code and no Call', () => {
    expect(ok({ result: 'voicemail', endReason: null, disclosureWordingVersion: null })).toBe(true)
    const blocked = {
      result: 'blocked',
      endReason: null,
      gateCode: 'agent.outside_hours',
      callId: null,
      durationSeconds: null,
      disclosureWordingVersion: null,
    }
    expect(ok(blocked)).toBe(true)
    expect(ok({ ...blocked, gateCode: null })).toBe(false)
    expect(ok({ ...blocked, callId: call })).toBe(false)
  })
  test('version 1, the Inbound Agent event, is not this one', () => {
    expect(
      AGENT_CALL_EVENTS['voice.agent_call.ended'].schema.safeParse({
        ...envelope(data),
        version: 1,
      }).success
    ).toBe(false)
  })
})

describe('errors and routes', () => {
  test('every gate code is a registered error code', () => {
    const known = new Set<string>([
      ...Object.keys(AGENT_ERRORS),
      ...Object.keys(AGENT_CALL_ERRORS),
      ...Object.keys(CONSENT_ERRORS),
    ])
    for (const code of CALL_GATE_CODES) {
      expect(known.has(code)).toBe(true)
    }
    expect(AGENT_ERRORS['agent.timezone_unknown'].status).toBe(409)
  })
  test('every route lists its roles or its service audience, and says so in its description', () => {
    for (const r of Object.values(AGENT_CALL_ROUTES)) {
      expect(r.description.length).toBeGreaterThan(40)
      expect(r.roles.length > 0 || r.serviceToken !== undefined).toBe(true)
    }
    expect(AGENT_CALL_ROUTES.requestAgentCall.internal).toBe(true)
    expect(AGENT_CALL_ROUTES.requestAgentCall.serviceToken).toEqual({ audiences: ['outbound'] })
    expect(AGENT_CALL_ROUTES.requestAgentCall.description).toContain('idempotencyKey')
    expect(AGENT_CALL_ROUTES.requestRepAgentCall.keyRequired).toBe(true)
    expect(AGENT_CALL_ROUTES.requestRepAgentCall.description).toContain('Idempotency-Key')
    expect(AGENT_CALL_ROUTES.requestRepAgentCall.roles).toContain('rep')
  })
  test('lists describe the cursor and the maximum page size; reads are role scoped', () => {
    expect(AGENT_CALL_ROUTES.listAgentCalls.description).toContain('cursor')
    expect(AGENT_CALL_ROUTES.listAgentCalls.description).toContain('100')
    expect(AGENT_CALL_ROUTES.getAgentCall.errors).toContain('agent_call.not_found')
  })
})

test('the area is exported from the entry point', async () => {
  const api = await import('../index')
  expect(api.AGENT_CALL_ROUTES).toBe(AGENT_CALL_ROUTES)
  expect(api.callStepSchema).toBe(callStepSchema)
})
