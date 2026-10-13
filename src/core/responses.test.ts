import { describe, expect, test } from 'bun:test'
import { id, NOW } from './fixtures'
import {
  internalAcceptInvitationResponseSchema,
  internalCreateOrganizationResponseSchema,
  internalMembershipResponseSchema,
  internalUpdateMemberProfileResponseSchema,
} from './internal'
import { invitationSchema, listInvitationsResponseSchema } from './invitation'
import { listMembersResponseSchema, memberSchema } from './member'
import { organizationSchema } from './organization'
import { listTeamsResponseSchema, teamMemberSchema, teamSchema } from './team'

const invitation = {
  id: id('inv'),
  email: 'ada@example.com',
  role: 'rep',
  teamId: null,
  state: 'pending',
  invitedByUserId: id('usr'),
  expiresAt: NOW,
  createdAt: NOW,
}
const member = {
  id: id('mem'),
  userId: id('usr'),
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  role: 'rep',
  createdAt: NOW,
  updatedAt: NOW,
}
const team = { id: id('team'), name: 'Enterprise', createdAt: NOW, updatedAt: NOW }

const RESPONSES = [
  [
    'organizationSchema',
    organizationSchema,
    { id: id('org'), name: 'Acme', region: 'eu', status: 'active', createdAt: NOW, updatedAt: NOW },
  ],
  ['memberSchema', memberSchema, member],
  ['listMembersResponseSchema', listMembersResponseSchema, { items: [member], nextCursor: null }],
  ['invitationSchema', invitationSchema, invitation],
  [
    'listInvitationsResponseSchema',
    listInvitationsResponseSchema,
    { items: [invitation], nextCursor: null },
  ],
  ['teamSchema', teamSchema, team],
  ['listTeamsResponseSchema', listTeamsResponseSchema, { items: [team], nextCursor: null }],
  [
    'teamMemberSchema',
    teamMemberSchema,
    { teamId: id('team'), membershipId: id('mem'), createdAt: NOW },
  ],
  [
    'internalCreateOrganizationResponseSchema',
    internalCreateOrganizationResponseSchema,
    { organizationId: id('org'), role: 'owner' },
  ],
  [
    'internalAcceptInvitationResponseSchema',
    internalAcceptInvitationResponseSchema,
    { organizationId: id('org'), role: 'rep' },
  ],
  [
    'internalMembershipResponseSchema (found)',
    internalMembershipResponseSchema,
    { found: true, organizationId: id('org'), role: 'rep', organizationStatus: 'active' },
  ],
  ['internalMembershipResponseSchema (none)', internalMembershipResponseSchema, { found: false }],
  [
    'internalUpdateMemberProfileResponseSchema',
    internalUpdateMemberProfileResponseSchema,
    { userId: id('usr'), email: 'ada@example.com', name: 'Ada Lovelace' },
  ],
  [
    'internalUpdateMemberProfileResponseSchema (no name)',
    internalUpdateMemberProfileResponseSchema,
    { userId: id('usr'), email: 'ada@example.com', name: null },
  ],
] as const

const EXTRAS = { token: 'A'.repeat(32), tokenHash: 'f'.repeat(64), futureField: 1 }

function withExtras(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(withExtras)
  }
  if (value !== null && typeof value === 'object') {
    const copy: Record<string, unknown> = {}
    for (const [key, inner] of Object.entries(value)) {
      copy[key] = withExtras(inner)
    }
    return { ...copy, ...EXTRAS }
  }
  return value
}

describe.each(RESPONSES)('response schema %s', (_label, schema, valid) => {
  test('parses a valid value unchanged', () => {
    expect(schema.parse(valid)).toEqual(valid as never)
  })

  test('strips a token, a token hash and a field a newer version adds, at every depth', () => {
    const parsed = schema.safeParse(withExtras(valid))
    expect(parsed.success).toBe(true)
    expect(JSON.stringify(parsed.data)).not.toMatch(/token|futureField/)
    expect(parsed.data).toEqual(valid as never)
  })
})
