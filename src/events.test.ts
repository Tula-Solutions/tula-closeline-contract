import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { defineEvent, eventEnvelopeSchema, eventTypeSchema } from './events'

const HEX = '0190a5e0b3c17d2a8f4e5b6c7d8e9f01'
const valid = {
  id: `evt_${HEX}`,
  type: 'team.created',
  version: 1,
  occurredAt: '2026-10-12T10:00:00.000Z',
  organizationId: `org_${HEX}`,
  region: 'us',
  data: { teamId: `team_${HEX}`, name: 'East' },
}

const teamCreated = defineEvent(
  'team.created',
  1,
  z.object({ teamId: z.string(), name: z.string() })
)

describe('eventTypeSchema', () => {
  test.each(['team.created', 'a.b', 'voice.call.started'])('accepts %s', (v) => {
    expect(eventTypeSchema.safeParse(v).success).toBe(true)
  })
  test.each(['team', 'Team.created', 'team.Created', 'team.created.x.y', 'voice..started', ''])(
    'rejects %p',
    (v) => {
      expect(eventTypeSchema.safeParse(v).success).toBe(false)
    }
  )
})

describe('eventEnvelopeSchema', () => {
  const schema = eventEnvelopeSchema(z.object({ name: z.string() }))

  test('accepts a well-formed envelope', () => {
    expect(schema.safeParse({ ...valid, data: { name: 'x' } }).success).toBe(true)
  })

  test('rejects a data payload failing its schema', () => {
    expect(schema.safeParse({ ...valid, data: {} }).success).toBe(false)
  })

  test.each([0, -1, 1.5, '1'])('rejects version %p', (version) => {
    expect(schema.safeParse({ ...valid, data: { name: 'x' }, version }).success).toBe(false)
  })

  test('rejects an unknown region', () => {
    expect(schema.safeParse({ ...valid, data: { name: 'x' }, region: 'ap' }).success).toBe(false)
  })
})

describe('defineEvent', () => {
  test('exposes type and version', () => {
    expect(teamCreated.type).toBe('team.created')
    expect(teamCreated.version).toBe(1)
  })

  test('parse accepts a matching envelope', () => {
    expect(teamCreated.parse(valid) as unknown).toEqual(valid)
  })

  test('schema.safeParse reports failure without throwing', () => {
    expect(teamCreated.schema.safeParse({ ...valid, type: 'team.deleted' }).success).toBe(false)
  })

  test.each([
    ['a wrong type', { type: 'team.deleted' }],
    ['a wrong version', { version: 2 }],
    ['a date without an offset', { occurredAt: '2026-10-12T10:00:00' }],
    ['a date only', { occurredAt: '2026-10-12' }],
    ['a non-date string', { occurredAt: 'yesterday' }],
    ['a wrong organization prefix', { organizationId: `usr_${HEX}` }],
    ['a wrong event id prefix', { id: `org_${HEX}` }],
    ['a bad data payload', { data: { teamId: 1 } }],
  ])('parse rejects %s', (_name, patch) => {
    expect(() => teamCreated.parse({ ...valid, ...patch })).toThrow()
  })

  test('parse accepts an offset timestamp', () => {
    const parsed = teamCreated.parse({ ...valid, occurredAt: '2026-10-12T10:00:00+05:30' })
    expect(parsed.occurredAt).toBe('2026-10-12T10:00:00+05:30')
  })

  test('parse rejects a non-object', () => {
    expect(() => teamCreated.parse(null)).toThrow()
  })

  test('rejects a malformed type at definition time', () => {
    expect(() => defineEvent('Bad', 1, z.object({}))).toThrow()
  })

  test('rejects a non-positive version at definition time', () => {
    expect(() => defineEvent('a.b', 0, z.object({}))).toThrow()
  })
})
