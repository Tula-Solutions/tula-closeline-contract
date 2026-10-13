import { describe, expect, test } from 'bun:test'
import { MAX_PAGE_SIZE } from '../pagination'
import { id, NOW } from './fixtures'
import {
  createInvitationRequestSchema,
  invitationParamsSchema,
  invitationSchema,
  listInvitationsQuerySchema,
  listInvitationsResponseSchema,
} from './invitation'

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

describe('createInvitationRequestSchema', () => {
  test('accepts an address and an invitable role, and folds the address', () => {
    expect(
      createInvitationRequestSchema.parse({ email: 'Ada@Example.com', role: 'admin' })
    ).toEqual({
      email: 'ada@example.com',
      role: 'admin',
    })
  })

  test('accepts a Team', () => {
    const body = { email: 'ada@example.com', role: 'rep', teamId: id('team') }
    expect(createInvitationRequestSchema.parse(body)).toEqual(body as never)
  })

  test.each([
    ['owner as the role', { email: 'ada@example.com', role: 'owner' }],
    ['an email with two @', { email: 'a@b@example.com', role: 'rep' }],
    ['an email with a space', { email: 'a da@example.com', role: 'rep' }],
    ['an over-long email', { email: `${'a'.repeat(320)}@b.co`, role: 'rep' }],
    ['no role', { email: 'ada@example.com' }],
    ['an unknown key', { email: 'ada@example.com', role: 'rep', token: 'x' }],
    ['a Team id of the wrong kind', { email: 'ada@example.com', role: 'rep', teamId: id('org') }],
  ])('rejects %s', (_name, body) => {
    expect(createInvitationRequestSchema.safeParse(body).success).toBe(false)
  })
})

describe('invitationSchema', () => {
  test('accepts an Invitation', () => {
    expect(invitationSchema.parse(invitation)).toEqual(invitation as never)
  })

  test.each(['token', 'rawToken', 'tokenHash', 'invitationToken'])(
    'never carries a %s field out',
    (field) => {
      const parsed = invitationSchema.parse({ ...invitation, [field]: 'A'.repeat(32) })
      expect(field in parsed).toBe(false)
    }
  )

  test.each([
    ['owner as the role', { ...invitation, role: 'owner' }],
    ['an unknown state', { ...invitation, state: 'expired' }],
  ])('rejects %s', (_name, body) => {
    expect(invitationSchema.safeParse(body).success).toBe(false)
  })
})

describe('listInvitationsResponseSchema', () => {
  test('accepts a page and strips a token from an item', () => {
    expect(
      listInvitationsResponseSchema.safeParse({ items: [invitation], nextCursor: null }).success
    ).toBe(true)
    const items = [{ ...invitation, token: 'A'.repeat(32) }]
    const parsed = listInvitationsResponseSchema.parse({ items, nextCursor: null })
    expect(parsed.items[0] && 'token' in parsed.items[0]).toBe(false)
  })

  test('bounds the page size', () => {
    const items = Array.from({ length: MAX_PAGE_SIZE + 1 }, () => invitation)
    expect(listInvitationsResponseSchema.safeParse({ items, nextCursor: null }).success).toBe(false)
  })
})

describe('listInvitationsQuerySchema', () => {
  test('lists pending Invitations unless asked for another state', () => {
    expect(listInvitationsQuerySchema.parse({}).state).toBe('pending')
    expect(listInvitationsQuerySchema.parse({ state: 'revoked' }).state).toBe('revoked')
    expect(listInvitationsQuerySchema.parse({ state: 'accepted', limit: '50' })).toEqual({
      state: 'accepted',
      limit: 50,
    })
  })

  test.each([
    ['expired, which is read from expiresAt', { state: 'expired' }],
    ['a state in the wrong case', { state: 'Pending' }],
    ['an empty state', { state: '' }],
    ['an unknown filter', { role: 'rep' }],
    ['a limit above the maximum', { limit: MAX_PAGE_SIZE + 1 }],
  ])('rejects %s', (_name, query) => {
    expect(listInvitationsQuerySchema.safeParse(query).success).toBe(false)
  })
})

describe('invitationParamsSchema', () => {
  test('wants an Invitation id', () => {
    expect(invitationParamsSchema.safeParse({ invitationId: id('inv') }).success).toBe(true)
    expect(invitationParamsSchema.safeParse({ invitationId: id('mem') }).success).toBe(false)
  })
})
