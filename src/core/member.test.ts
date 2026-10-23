import { describe, expect, test } from 'bun:test'
import { MAX_PAGE_SIZE } from '../pagination'
import { roleAtLeast } from '../tenancy'
import { id, NOW } from './fixtures'
import {
  changeMemberRoleRequestSchema,
  LIST_MEMBERS_MIN_ROLE,
  listMembersQuerySchema,
  listMembersResponseSchema,
  MAX_MEMBER_IDS,
  MAX_MEMBER_QUERY_LENGTH,
  memberParamsSchema,
  memberSchema,
} from './member'

const member = {
  id: id('mem'),
  userId: id('usr'),
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  role: 'rep',
  createdAt: NOW,
  updatedAt: NOW,
}

describe('memberSchema', () => {
  test('accepts a member', () => {
    expect(memberSchema.parse(member)).toEqual(member as never)
  })

  test('carries a null name for a member whose person gave none at sign-up', () => {
    expect(memberSchema.parse({ ...member, name: null })).toEqual({
      ...member,
      name: null,
    } as never)
  })

  test('strips a field a newer version adds', () => {
    expect(memberSchema.parse({ ...member, phone: '+1' })).toEqual(member as never)
  })

  test.each([
    ['no email', { ...member, email: undefined }],
    ['a null email', { ...member, email: null }],
    ['a malformed email', { ...member, email: 'not-an-email' }],
    ['no name key', { ...member, name: undefined }],
    ['an empty name', { ...member, name: '' }],
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

  test('rejects a filter it does not have, rather than ignoring it', () => {
    expect(listMembersQuerySchema.safeParse({ role: 'x' }).success).toBe(false)
    expect(listMembersQuerySchema.safeParse({ email: 'ada@example.com' }).success).toBe(false)
    expect(listMembersQuerySchema.safeParse({ name: 'Ada' }).success).toBe(false)
    expect(listMembersQuerySchema.safeParse({ surprise: '1' }).success).toBe(false)
  })

  test('takes an optional role filter of an existing role', () => {
    expect(listMembersQuerySchema.parse({}).role).toBeUndefined()
    expect(listMembersQuerySchema.parse({ role: 'rep' }).role).toBe('rep')
    expect(listMembersQuerySchema.safeParse({ role: 'boss' }).success).toBe(false)
  })

  test('takes a comma-separated list of member ids, at most the maximum', () => {
    const a = id('mem')
    const b = id('mem')
    expect(listMembersQuerySchema.parse({}).ids).toBeUndefined()
    expect<unknown>(listMembersQuerySchema.parse({ ids: a }).ids).toEqual([a])
    expect<unknown>(listMembersQuerySchema.parse({ ids: `${a},${b}` }).ids).toEqual([a, b])
    const many = Array.from({ length: MAX_MEMBER_IDS }, () => id('mem'))
    expect(listMembersQuerySchema.safeParse({ ids: many.join(',') }).success).toBe(true)
    expect(listMembersQuerySchema.safeParse({ ids: [...many, id('mem')].join(',') }).success).toBe(
      false
    )
  })

  test('refuses an empty, malformed or wrong-kind id in the list', () => {
    const a = id('mem')
    expect(listMembersQuerySchema.safeParse({ ids: '' }).success).toBe(false)
    expect(listMembersQuerySchema.safeParse({ ids: `${a},` }).success).toBe(false)
    expect(listMembersQuerySchema.safeParse({ ids: `${a},nope` }).success).toBe(false)
    expect(listMembersQuerySchema.safeParse({ ids: id('usr') }).success).toBe(false)
  })

  test('takes a trimmed name filter of 1 to the maximum length', () => {
    expect(listMembersQuerySchema.parse({ q: '  ada  ' }).q).toBe('ada')
    expect(listMembersQuerySchema.parse({}).q).toBeUndefined()
    expect(listMembersQuerySchema.safeParse({ q: '' }).success).toBe(false)
    expect(listMembersQuerySchema.safeParse({ q: '   ' }).success).toBe(false)
    expect(
      listMembersQuerySchema.safeParse({ q: 'a'.repeat(MAX_MEMBER_QUERY_LENGTH) }).success
    ).toBe(true)
    expect(
      listMembersQuerySchema.safeParse({ q: 'a'.repeat(MAX_MEMBER_QUERY_LENGTH + 1) }).success
    ).toBe(false)
    expect(MAX_MEMBER_QUERY_LENGTH).toBe(100)
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

  test('rejects a missing membership id', () => {
    expect(memberParamsSchema.safeParse({}).success).toBe(false)
  })
})

describe('LIST_MEMBERS_MIN_ROLE', () => {
  test('Owner, Admin and Manager may list members; a Rep may not', () => {
    expect(
      (['owner', 'admin', 'manager', 'rep'] as const).filter((role) =>
        roleAtLeast(role, LIST_MEMBERS_MIN_ROLE)
      )
    ).toEqual(['owner', 'admin', 'manager'])
  })
})
