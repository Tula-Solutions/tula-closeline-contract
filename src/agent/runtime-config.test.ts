import { describe, expect, test } from 'bun:test'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import {
  AGENT_ERRORS,
  AGENT_RUNTIME_ROUTES,
  agentRuntimeConfigSchema,
  MAX_AGENT_INSTRUCTION_LENGTH,
  runtimeAgentKind,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const id = (prefix: string, n: number) => formatId(prefix as never, hex(n))

const control = {
  channel: null,
  level: 'supervised',
  sendWindow: { timeZone: 'Europe/London', days: [] },
  escalationRules: [{ trigger: 'complaint', action: 'hand_over' }],
}

const config = {
  agentKind: 'inbound',
  paused: false,
  instructionVersionId: id('ains', 1),
  instructions: 'Be brief.',
  controls: [control, { ...control, channel: 'phone', level: 'assisted' }],
}

describe('the runtime config body', () => {
  test('a full answer parses', () => {
    expect(agentRuntimeConfigSchema.safeParse(config).success).toBe(true)
  })
  test('the answer is strict at every level, so no stored field leaks', () => {
    expect(agentRuntimeConfigSchema.safeParse({ ...config, updatedAt: 'x' }).success).toBe(false)
    expect(
      agentRuntimeConfigSchema.safeParse({
        ...config,
        controls: [{ ...control, updatedByMembershipId: id('mem', 1) }],
      }).success
    ).toBe(false)
    expect(
      agentRuntimeConfigSchema.safeParse({
        ...config,
        controls: [
          { ...control, escalationRules: [{ trigger: 'complaint', action: 'hand_over', x: 1 }] },
        ],
      }).success
    ).toBe(false)
  })
  test('the version id is an instruction version id and the text is bounded and non-empty', () => {
    expect(
      agentRuntimeConfigSchema.safeParse({ ...config, instructionVersionId: id('mem', 1) }).success
    ).toBe(false)
    expect(agentRuntimeConfigSchema.safeParse({ ...config, instructions: '' }).success).toBe(false)
    expect(
      agentRuntimeConfigSchema.safeParse({
        ...config,
        instructions: 'x'.repeat(MAX_AGENT_INSTRUCTION_LENGTH),
      }).success
    ).toBe(true)
    expect(
      agentRuntimeConfigSchema.safeParse({
        ...config,
        instructions: 'x'.repeat(MAX_AGENT_INSTRUCTION_LENGTH + 1),
      }).success
    ).toBe(false)
  })
  test('controls are bounded and a channel appears once', () => {
    expect(
      agentRuntimeConfigSchema.safeParse({ ...config, controls: [control, control] }).success
    ).toBe(false)
    const channels = ['phone', 'sms', 'whatsapp', 'email', 'linkedin', 'phone']
    expect(
      agentRuntimeConfigSchema.safeParse({
        ...config,
        controls: [control, ...channels.map((channel) => ({ ...control, channel }))],
      }).success
    ).toBe(false)
  })
  test('no field can switch off consent, the disclosure or suppression', () => {
    const forbidden = /consent|disclos|record|suppress/i
    const keys = (v: unknown): string[] =>
      v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => [k, ...keys(x)]) : []
    for (const k of keys(agentRuntimeConfigSchema.safeParse(config).data)) {
      expect(forbidden.test(k)).toBe(false)
    }
  })
})

describe('the audience decides the Agent kind', () => {
  test('voice is the Inbound Agent and outbound the Outbound Agent', () => {
    expect(runtimeAgentKind('voice')).toBe('inbound')
    expect(runtimeAgentKind('outbound')).toBe('outbound')
  })
})

describe('the route', () => {
  const route = AGENT_RUNTIME_ROUTES.getAgentRuntimeConfig
  test('it is an internal GET with no path parameter, so the Organization is the token subject', () => {
    expect(route.method).toBe('GET')
    expect(route.path).toBe('/internal/v1/agent/runtime-config')
    expect(route.internal).toBe(true)
    expect(route.public).toBeUndefined()
    expect(route.publicApi).toBeUndefined()
    expect(route.path).not.toContain('{')
    expect(route.roles).toEqual([])
    expect(route.idempotent).toBe(false)
  })
  test('only service tokens with audience voice or outbound may call it', () => {
    expect(route.serviceToken).toEqual({ audiences: ['voice', 'outbound'] })
    expect(route.commonErrors).toContain('auth.unauthenticated')
    expect(route.commonErrors).toContain('auth.forbidden')
    expect(route.description).toContain('audience')
    expect(route.description).toContain('auth.forbidden')
  })
  test('it answers 200 or 304 and describes the ETag and If-None-Match', () => {
    expect(route.success).toEqual([200, 304])
    expect(route.etag).toBe(true)
    expect(route.description).toContain('ETag')
    expect(route.description).toContain('If-None-Match')
    expect(route.description).toContain('304')
  })
  test('a missing published version is agent.no_published_instructions (409), failing closed', () => {
    expect(route.errors).toEqual(['agent.no_published_instructions'])
    expect(AGENT_ERRORS['agent.no_published_instructions'].status).toBe(409)
    expect(AGENT_ERRORS['agent.no_published_instructions'].code).toBe(
      'agent.no_published_instructions'
    )
    expect(route.description).toContain('agent.no_published_instructions')
    expect(route.description).toContain('fail closed')
  })
  test('every code it lists exists', () => {
    const known = new Set<string>([...Object.keys(AGENT_ERRORS), ...Object.keys(ERRORS)])
    for (const code of [...route.errors, ...route.commonErrors]) {
      expect(known.has(code)).toBe(true)
    }
  })
  test('it states the fixed rules cannot be changed and is revalidated on every call', () => {
    expect(route.description).toContain('ADR 0003')
    expect(route.description).toContain('no-cache')
  })
  test('the area is exported from the entry point', async () => {
    const api = await import('../index')
    expect(api.AGENT_RUNTIME_ROUTES).toBe(AGENT_RUNTIME_ROUTES)
  })
})
