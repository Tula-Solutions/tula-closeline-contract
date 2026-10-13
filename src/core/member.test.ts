import { describe, expect, test } from 'bun:test'
import { MAX_PAGE_SIZE } from '../pagination'
import { id, NOW } from './fixtures'
import {
  changeMemberRoleRequestSchema,
  listMembersQuerySchema,
  listMembersResponseSchema,
  memberParamsSchema,
  memberSchema,
} from './member'

const member = { id: id('mem'), userId: id('usr'), role: 'rep', createdAt: NOW, updatedAt: NOW }

describe('memberSchema', () => {
  test('accepts a member', () => {
    expect(memberSchema.parse(member)).toEqual(member as never)
  })

  test.each([
    ['an unknown key', { ...member, email: 'a@b.co' }],
    ['an unknown role', { ...member, role: 'superuser' }],
    ['a user id as the membership id', { ...member, id: id('usr') }],
  ])('rejects %s', (_name, body) => {
    expect(memberSchema.safeParse(body).success).toBe(false)
  })
})

describe('listMembersQuerySchema', () => {
  test('defaults the limit and caps it', () => {
    expect(listMembersQuerySchema.parse({}).limit).toBe(25)
    expect(listMembersQuerySchema.safeParse({ limit: MAX_PAGE_SIZE }).success).toBe(true)
    expect(listMembersQuerySchema.safeParse({ limit: MAX_PAGE_SIZE + 1 }).success).toBe(false)
  })
})

describe('listMembersResponseSchema', () => {
  test('accepts a page and bounds its size', () => {
    expect(listMembersResponseSchema.safeParse({ items: [member], nextCursor: null }).success).toBe(
      true
    )
    const tooMany = Array.from({ length: MAX_PAGE_SIZE + 1 }, () => member)
    expect(listMembersResponseSchema.safeParse({ items: tooMany, nextCursor: null }).success).toBe(
      false
    )
  })

  test('rejects an item with an unknown key', () => {
    const items = [{ ...member, token: 'x' }]
    expect(listMembersResponseSchema.safeParse({ items, nextCursor: null }).success).toBe(false)
  })
})

describe('changeMemberRoleRequestSchema', () => {
  test.each(['owner', 'admin', 'manager', 'rep'])('accepts %s', (role) => {
    expect(changeMemberRoleRequestSchema.safeParse({ role }).success).toBe(true)
  })

  test.each([
    ['an unknown role', { role: 'root' }],
    ['no role', {}],
    ['an unknown key', { role: 'rep', userId: id('usr') }],
  ])('rejects %s', (_name, body) => {
    expect(changeMemberRoleRequestSchema.safeParse(body).success).toBe(false)
  })
})

describe('memberParamsSchema', () => {
  test('wants a membership id', () => {
    expect(memberParamsSchema.safeParse({ membershipId: id('mem') }).success).toBe(true)
    expect(memberParamsSchema.safeParse({ membershipId: id('usr') }).success).toBe(false)
  })
})
