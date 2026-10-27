import { describe, expect, test } from 'bun:test'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import {
  AGENT_CONTROL_ROUTES,
  AGENT_ERRORS,
  AGENT_KINDS,
  agentControlChannelParamSchema,
  agentControlSchema,
  agentKindSchema,
  CONTROL_LEVELS,
  controlLevelSchema,
  ESCALATION_TRIGGERS,
  escalationTriggerSchema,
  instructionDiffSchema,
  instructionVersionSchema,
  listAgentControlsQuerySchema,
  listInstructionVersionsQuerySchema,
  MAX_AGENT_INSTRUCTION_LENGTH,
  saveInstructionVersionRequestSchema,
  setAgentControlRequestSchema,
  setAgentsPausedRequestSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const id = (prefix: string, n: number) => formatId(prefix as never, hex(n))
const NOW = '2026-10-22T10:00:00.000Z'

describe('closed enums', () => {
  test('control levels and agent kinds', () => {
    expect([...CONTROL_LEVELS]).toEqual(['supervised', 'assisted', 'autonomous'])
    expect(controlLevelSchema.safeParse('yolo').success).toBe(false)
    expect([...AGENT_KINDS]).toEqual(['inbound', 'outbound'])
    expect(agentKindSchema.safeParse('copilot').success).toBe(false)
  })
  test('escalation triggers are closed', () => {
    expect(escalationTriggerSchema.safeParse('whenever_i_say').success).toBe(false)
    expect(ESCALATION_TRIGGERS.length).toBeGreaterThan(0)
  })
})

describe('instruction versions', () => {
  const version = {
    id: id('ains', 1),
    agentKind: 'inbound',
    number: 1,
    state: 'draft',
    authorMembershipId: id('mem', 1),
    createdAt: NOW,
    publishedAt: null,
    text: 'Be brief.',
  }
  test('the request is strict, trimmed-nonempty and bounded on the wire', () => {
    expect(saveInstructionVersionRequestSchema.safeParse({ text: 'Be brief.' }).success).toBe(true)
    expect(saveInstructionVersionRequestSchema.safeParse({ text: '' }).success).toBe(false)
    expect(
      saveInstructionVersionRequestSchema.safeParse({ text: 'x', state: 'published' }).success
    ).toBe(false)
    // The schema limit is the real cap: 20,000 passes, 20,001 is refused.
    expect(
      saveInstructionVersionRequestSchema.safeParse({
        text: 'x'.repeat(MAX_AGENT_INSTRUCTION_LENGTH),
      }).success
    ).toBe(true)
    expect(
      saveInstructionVersionRequestSchema.safeParse({
        text: 'x'.repeat(MAX_AGENT_INSTRUCTION_LENGTH + 1),
      }).success
    ).toBe(false)
    expect(saveInstructionVersionRequestSchema.safeParse({ text: 'a\u0000b' }).success).toBe(false)
  })
  test('a stored version holds at most 20,000 characters and drops unknown fields', () => {
    expect(instructionVersionSchema.safeParse(version).success).toBe(true)
    expect(
      instructionVersionSchema.safeParse({
        ...version,
        text: 'x'.repeat(MAX_AGENT_INSTRUCTION_LENGTH + 1),
      }).success
    ).toBe(false)
    expect('extra' in instructionVersionSchema.parse({ ...version, extra: 1 })).toBe(false)
  })
  test('lists are capped at 100', () => {
    expect(listInstructionVersionsQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
  })
  test('a diff has only same, added and removed lines', () => {
    const diff = { agentKind: 'inbound', from: 1, to: 2, lines: [{ kind: 'added', text: 'x' }] }
    expect(instructionDiffSchema.safeParse(diff).success).toBe(true)
    expect(
      instructionDiffSchema.safeParse({ ...diff, lines: [{ kind: 'moved', text: 'x' }] }).success
    ).toBe(false)
  })
})

describe('control settings', () => {
  const request = {
    level: 'assisted',
    sendWindow: {
      timeZone: 'America/New_York',
      days: [{ day: 'mon', windows: [{ start: '09:00', end: '17:00' }] }],
    },
    escalationRules: [{ trigger: 'pricing_question', action: 'hand_over' }],
  }
  test('a valid request parses', () => {
    expect(setAgentControlRequestSchema.safeParse(request).success).toBe(true)
  })
  test('refuses unknown fields at every depth', () => {
    expect(setAgentControlRequestSchema.safeParse({ ...request, extra: 1 }).success).toBe(false)
    expect(
      setAgentControlRequestSchema.safeParse({
        ...request,
        escalationRules: [{ trigger: 'complaint', action: 'hand_over', note: 'x' }],
      }).success
    ).toBe(false)
  })
  test('refuses a repeated trigger, a repeated day and an unknown level', () => {
    expect(
      setAgentControlRequestSchema.safeParse({
        ...request,
        escalationRules: [
          { trigger: 'complaint', action: 'hand_over' },
          { trigger: 'complaint', action: 'notify_manager' },
        ],
      }).success
    ).toBe(false)
    expect(
      setAgentControlRequestSchema.safeParse({
        ...request,
        sendWindow: {
          ...request.sendWindow,
          days: [...request.sendWindow.days, ...request.sendWindow.days],
        },
      }).success
    ).toBe(false)
    expect(setAgentControlRequestSchema.safeParse({ ...request, level: 'reckless' }).success).toBe(
      false
    )
  })
  test('refuses a window outside the calling window, in a request and as stored', () => {
    const early = {
      ...request.sendWindow,
      days: [{ day: 'mon', windows: [{ start: '06:00', end: '17:00' }] }],
    }
    expect(setAgentControlRequestSchema.safeParse({ ...request, sendWindow: early }).success).toBe(
      false
    )
    expect(
      agentControlSchema.safeParse({
        agentKind: 'inbound',
        channel: 'email',
        ...request,
        sendWindow: early,
        updatedAt: NOW,
        updatedByMembershipId: null,
      }).success
    ).toBe(false)
  })
  test('a stored control drops an unknown key inside sendWindow', () => {
    const parsed = agentControlSchema.parse({
      agentKind: 'inbound',
      channel: 'email',
      ...request,
      sendWindow: { ...request.sendWindow, note: 'x' },
      updatedAt: NOW,
      updatedByMembershipId: null,
    })
    expect('note' in parsed.sendWindow).toBe(false)
  })
  test('the response drops unknown nested fields', () => {
    const parsed = agentControlSchema.parse({
      agentKind: 'inbound',
      channel: 'email',
      ...request,
      updatedAt: NOW,
      updatedByMembershipId: null,
      escalationRules: [{ trigger: 'complaint', action: 'hand_over', note: 'x' }],
    })
    expect('note' in (parsed.escalationRules[0] ?? {})).toBe(false)
  })
  test('has no consent, disclosure, recording or suppression setting anywhere (ADR 0003)', () => {
    const forbidden = /consent|disclos|record|suppress/i
    const keys = (v: unknown): string[] =>
      v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => [k, ...keys(x)]) : []
    const shape = (schema: { shape: Record<string, unknown> }) => Object.keys(schema.shape)
    for (const k of [
      ...shape(setAgentControlRequestSchema),
      ...shape(agentControlSchema),
      ...shape(setAgentsPausedRequestSchema),
      ...keys(request),
    ]) {
      expect(forbidden.test(k)).toBe(false)
    }
    expect(
      setAgentControlRequestSchema.safeParse({ ...request, consentRequired: false }).success
    ).toBe(false)
    expect(setAgentControlRequestSchema.safeParse({ ...request, disclosure: false }).success).toBe(
      false
    )
  })
  test('pause is a strict boolean and the list is capped at 100', () => {
    expect(setAgentsPausedRequestSchema.safeParse({ paused: true }).success).toBe(true)
    expect(setAgentsPausedRequestSchema.safeParse({ paused: 'yes' }).success).toBe(false)
    expect(setAgentsPausedRequestSchema.safeParse({ paused: true, x: 1 }).success).toBe(false)
    expect(listAgentControlsQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
  })
})

describe('control channel path parameter', () => {
  test('accepts a channel or default and nothing else', () => {
    expect(agentControlChannelParamSchema.safeParse('default').success).toBe(true)
    expect(agentControlChannelParamSchema.safeParse('phone').success).toBe(true)
    expect(agentControlChannelParamSchema.safeParse('foo').success).toBe(false)
  })
})

describe('errors and routes', () => {
  const routes = Object.entries(AGENT_CONTROL_ROUTES)
  test('the new codes exist with their statuses', () => {
    expect(AGENT_ERRORS['agent.version_not_found'].status).toBe(404)
    expect(AGENT_ERRORS['agent.instruction_too_long'].status).toBe(422)
    expect(AGENT_ERRORS['agent.version_not_found'].code).toBe('agent.version_not_found')
    expect(AGENT_ERRORS['agent.instruction_too_long'].code).toBe('agent.instruction_too_long')
  })
  test('10 routes, known codes, unique paths, mutations keyed', () => {
    expect(routes.length).toBe(10)
    const known = new Set<string>(
      [...Object.values(AGENT_ERRORS), ...Object.values(ERRORS)].map((e) => e.code)
    )
    const seen = new Set<string>()
    for (const [, r] of routes) {
      const k = `${r.method} ${r.path}`
      expect(seen.has(k)).toBe(false)
      seen.add(k)
      expect(r.path.startsWith('/v1/')).toBe(true)
      expect(r.description.length).toBeGreaterThan(40)
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
      if (r.method !== 'GET') {
        expect(r.keyRequired).toBe(true)
        expect(r.idempotent).toBe(true)
        expect(r.commonErrors).toContain('request.idempotency_key_reused')
        expect(r.description).toContain('Idempotency-Key')
      }
    }
    const used = new Set(routes.flatMap(([, r]) => r.errors as string[]))
    expect(used.has('agent.version_not_found')).toBe(true)
    expect(used.has('agent.instruction_too_long')).toBe(true)
  })
  test('list routes say cursor and 100; instruction routes state the fixed rules', () => {
    for (const name of ['listInstructionVersions', 'listAgentControls'] as const) {
      expect(AGENT_CONTROL_ROUTES[name].description).toContain('cursor')
      expect(AGENT_CONTROL_ROUTES[name].description).toContain('100')
    }
    expect(AGENT_CONTROL_ROUTES.saveInstructionVersion.description).toContain('Contact Consent')
    expect(AGENT_CONTROL_ROUTES.setAgentControl.description).toContain('ADR 0003')
  })
})
