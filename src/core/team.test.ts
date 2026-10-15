import { describe, expect, test } from 'bun:test'
import { MAX_PAGE_SIZE } from '../pagination'
import { id, NOW } from './fixtures'
import { LIST_MEMBERS_MIN_ROLE } from './member'
import {
  addTeamMemberRequestSchema,
  createTeamRequestSchema,
  LIST_TEAM_MEMBERS_ERROR_CODES,
  LIST_TEAM_MEMBERS_MIN_ROLE,
  listTeamMembersQuerySchema,
  listTeamMembersResponseSchema,
  listTeamsQuerySchema,
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

  test.each([['an over-long name', { ...team, name: 'a'.repeat(1001) }]])(
    'rejects %s',
    (_name, body) => {
      expect(teamSchema.safeParse(body).success).toBe(false)
    }
  )
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

describe('listTeamsQuerySchema', () => {
  test('defaults the limit and rejects a filter it does not have', () => {
    expect(listTeamsQuerySchema.parse({}).limit).toBe(25)
    expect(listTeamsQuerySchema.safeParse({ role: 'x' }).success).toBe(false)
  })
})

describe('listTeamsResponseSchema page size', () => {
  test('accepts 100 Teams and rejects 101', () => {
    const page = (count: number) => ({
      items: Array.from({ length: count }, () => team),
      nextCursor: null,
    })
    expect(listTeamsResponseSchema.safeParse(page(100)).success).toBe(true)
    expect(listTeamsResponseSchema.safeParse(page(101)).success).toBe(false)
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
    expect(teamMemberSchema.safeParse({ ...added, createdAt: 'x' }).success).toBe(false)
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
    expect(teamMemberParamsSchema.safeParse({ teamId: id('team') }).success).toBe(false)
  })
})

describe('a stored name never fails a response parse', () => {
  test('a Team named with a tab still parses', () => {
    expect(teamSchema.parse({ ...team, name: 'West\tCoast' }).name).toBe('West\tCoast')
  })
})

describe('GET /v1/teams/{teamId}/members', () => {
  const member = {
    id: id('mem'),
    userId: id('usr'),
    email: 'ada@example.com',
    name: 'Ada Lovelace',
    role: 'rep',
    createdAt: NOW,
    updatedAt: NOW,
  }

  test('the query is a cursor and a limit, and nothing else', () => {
    expect(listTeamMembersQuerySchema.parse({ cursor: 'abc', limit: '10' }).limit).toBe(10)
    expect(listTeamMembersQuerySchema.safeParse({ limit: MAX_PAGE_SIZE + 1 }).success).toBe(false)
    expect(listTeamMembersQuerySchema.safeParse({ role: 'rep' }).success).toBe(false)
  })

  test('a page carries the same member fields as the Members list', () => {
    expect(listTeamMembersResponseSchema.parse({ items: [member], nextCursor: null })).toEqual({
      items: [member],
      nextCursor: null,
    } as never)
    expect(
      listTeamMembersResponseSchema.safeParse({
        items: [{ ...member, role: 'x' }],
        nextCursor: null,
      }).success
    ).toBe(false)
  })

  test('a page holds at most the maximum page size', () => {
    const page = (count: number) => ({
      items: Array.from({ length: count }, () => member),
      nextCursor: null,
    })
    expect(listTeamMembersResponseSchema.safeParse(page(MAX_PAGE_SIZE)).success).toBe(true)
    expect(listTeamMembersResponseSchema.safeParse(page(MAX_PAGE_SIZE + 1)).success).toBe(false)
  })

  test('the route lists the Team not-found code and the auth codes', () => {
    expect(LIST_TEAM_MEMBERS_ERROR_CODES).toEqual([
      'team.not_found',
      'request.invalid',
      'auth.unauthenticated',
      'auth.token_expired',
      'auth.token_invalid',
      'auth.forbidden',
      'auth.unavailable',
      'organization.suspended',
      'organization.deleted',
      'rate.limited',
    ])
  })
})

test("listing a Team's members needs exactly the role that lists the Organization's members", () => {
  expect(LIST_TEAM_MEMBERS_MIN_ROLE).toBe(LIST_MEMBERS_MIN_ROLE)
})
