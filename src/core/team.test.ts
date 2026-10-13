import { describe, expect, test } from 'bun:test'
import { id, NOW } from './fixtures'
import {
  addTeamMemberRequestSchema,
  createTeamRequestSchema,
  listTeamsResponseSchema,
  renameTeamRequestSchema,
  teamMemberParamsSchema,
  teamMemberSchema,
  teamParamsSchema,
  teamSchema,
} from './team'

const team = { id: id('team'), name: 'Enterprise', createdAt: NOW, updatedAt: NOW }

describe('teamSchema', () => {
  test('accepts a Team', () => {
    expect(teamSchema.parse(team)).toEqual(team as never)
  })

  test.each([
    ['an unknown key', { ...team, organizationId: id('org') }],
    ['an over-long name', { ...team, name: 'a'.repeat(201) }],
  ])('rejects %s', (_name, body) => {
    expect(teamSchema.safeParse(body).success).toBe(false)
  })
})

describe.each([
  ['createTeamRequestSchema', createTeamRequestSchema],
  ['renameTeamRequestSchema', renameTeamRequestSchema],
])('%s', (_label, schema) => {
  test('accepts a name', () => {
    expect(schema.parse({ name: ' West ' })).toEqual({ name: 'West' })
  })

  test.each([
    ['an empty name', { name: ' ' }],
    ['an over-long name', { name: 'a'.repeat(201) }],
    ['an unknown key', { name: 'West', organizationId: id('org') }],
  ])('rejects %s', (_name, body) => {
    expect(schema.safeParse(body).success).toBe(false)
  })
})

describe('listTeamsResponseSchema', () => {
  test('accepts a page', () => {
    expect(listTeamsResponseSchema.safeParse({ items: [team], nextCursor: 'abc' }).success).toBe(
      true
    )
  })
})

describe('Team membership', () => {
  test('add takes a membership id and nothing else', () => {
    expect(addTeamMemberRequestSchema.safeParse({ membershipId: id('mem') }).success).toBe(true)
    expect(addTeamMemberRequestSchema.safeParse({ membershipId: id('usr') }).success).toBe(false)
    expect(
      addTeamMemberRequestSchema.safeParse({ membershipId: id('mem'), role: 'rep' }).success
    ).toBe(false)
  })

  test('the added member names its Team and membership', () => {
    const added = { teamId: id('team'), membershipId: id('mem'), createdAt: NOW }
    expect(teamMemberSchema.parse(added)).toEqual(added as never)
    expect(teamMemberSchema.safeParse({ ...added, extra: 1 }).success).toBe(false)
  })

  test('path parameters want the right kinds of id', () => {
    expect(teamParamsSchema.safeParse({ teamId: id('team') }).success).toBe(true)
    expect(teamParamsSchema.safeParse({ teamId: id('mem') }).success).toBe(false)
    expect(
      teamMemberParamsSchema.safeParse({ teamId: id('team'), membershipId: id('mem') }).success
    ).toBe(true)
    expect(
      teamMemberParamsSchema.safeParse({ teamId: id('mem'), membershipId: id('team') }).success
    ).toBe(false)
  })
})
