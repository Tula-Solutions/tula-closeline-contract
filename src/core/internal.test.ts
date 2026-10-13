import { describe, expect, test } from 'bun:test'
import { CORE_ERRORS } from './errors'
import { id } from './fixtures'
import {
  INTERNAL_CALL_ERRORS,
  internalAcceptInvitationRequestSchema,
  internalAcceptInvitationResponseSchema,
  internalCreateOrganizationRequestSchema,
  internalCreateOrganizationResponseSchema,
  internalMembershipRequestSchema,
  internalMembershipResponseSchema,
} from './internal'

const TOKEN = 'dGhpcyBpcyBhIHRva2Vu0123456789abcdef'

describe('INTERNAL_CALL_ERRORS', () => {
  test('names the domain codes each internal call may return, and no others', () => {
    expect(INTERNAL_CALL_ERRORS).toEqual({
      createOrganization: ['membership.already_member'],
      acceptInvitation: ['invitation.invalid', 'membership.already_member'],
      membership: [],
    })
  })

  test('is frozen, at every level', () => {
    expect(Object.isFrozen(INTERNAL_CALL_ERRORS)).toBe(true)
    for (const codes of Object.values(INTERNAL_CALL_ERRORS)) {
      expect(Object.isFrozen(codes)).toBe(true)
    }
  })

  test('lists only codes core defines, and never an Organization status', () => {
    for (const codes of Object.values(INTERNAL_CALL_ERRORS)) {
      for (const code of codes) {
        expect(code in CORE_ERRORS).toBe(true)
        expect(code.startsWith('organization.')).toBe(false)
      }
    }
  })
})

describe('internalCreateOrganizationRequestSchema', () => {
  const body = { userId: id('usr'), organizationName: ' Acme ' }

  test('accepts a sign-up and trims the name', () => {
    expect(internalCreateOrganizationRequestSchema.parse(body)).toEqual({
      userId: body.userId,
      organizationName: 'Acme',
    } as never)
  })

  test.each([
    ['a Region', { ...body, region: 'eu' }],
    ['an Organization id', { ...body, organizationId: id('org') }],
    ['an email, which core does not use', { ...body, email: 'ada@example.com' }],
    ['an over-long name', { ...body, organizationName: 'a'.repeat(201) }],
    ['an empty name', { ...body, organizationName: '' }],
    ['no user', { organizationName: 'x' }],
  ])('rejects %s', (_name, input) => {
    expect(internalCreateOrganizationRequestSchema.safeParse(input).success).toBe(false)
  })
})

describe('internalCreateOrganizationResponseSchema', () => {
  test('is the Organization id and the role owner', () => {
    expect(
      internalCreateOrganizationResponseSchema.safeParse({
        organizationId: id('org'),
        role: 'owner',
      }).success
    ).toBe(true)
  })

  test('rejects any other role', () => {
    expect(
      internalCreateOrganizationResponseSchema.safeParse({
        organizationId: id('org'),
        role: 'admin',
      }).success
    ).toBe(false)
  })
})

describe('internalAcceptInvitationRequestSchema', () => {
  const body = { userId: id('usr'), email: 'ada@example.com', invitationToken: TOKEN }

  test('accepts a sign-up with the raw token', () => {
    expect(internalAcceptInvitationRequestSchema.safeParse(body).success).toBe(true)
  })

  test.each([
    ['a short token', { ...body, invitationToken: 'abc' }],
    ['a token with a space', { ...body, invitationToken: `${TOKEN} x` }],
    ['no token', { userId: body.userId, email: body.email }],
    ['an unknown key', { ...body, role: 'owner' }],
    ['an unverified blank email', { ...body, email: '' }],
  ])('rejects %s', (_name, input) => {
    expect(internalAcceptInvitationRequestSchema.safeParse(input).success).toBe(false)
  })
})

describe('internalAcceptInvitationResponseSchema', () => {
  test('carries an invitable role', () => {
    expect(
      internalAcceptInvitationResponseSchema.safeParse({ organizationId: id('org'), role: 'rep' })
        .success
    ).toBe(true)
  })

  test('never carries owner, and strips the token', () => {
    expect(
      internalAcceptInvitationResponseSchema.safeParse({ organizationId: id('org'), role: 'owner' })
        .success
    ).toBe(false)
    expect(
      internalAcceptInvitationResponseSchema.parse({
        organizationId: id('org'),
        role: 'rep',
        invitationToken: TOKEN,
      })
    ).toEqual({ organizationId: id('org'), role: 'rep' } as never)
  })
})

describe('internal membership lookup', () => {
  test('asks for one user', () => {
    expect(internalMembershipRequestSchema.safeParse({ userId: id('usr') }).success).toBe(true)
    expect(internalMembershipRequestSchema.safeParse({ userId: id('org') }).success).toBe(false)
    expect(
      internalMembershipRequestSchema.safeParse({ userId: id('usr'), email: 'a@b.co' }).success
    ).toBe(false)
  })

  test('answers with a membership, including a suspended Organization', () => {
    for (const organizationStatus of ['active', 'suspended', 'deleted']) {
      expect(
        internalMembershipResponseSchema.safeParse({
          found: true,
          organizationId: id('org'),
          role: 'manager',
          organizationStatus,
        }).success
      ).toBe(true)
    }
  })

  test('answers with a defined none, without any Organization a newer version names', () => {
    expect(internalMembershipResponseSchema.parse({ found: false })).toEqual({ found: false })
    expect(
      internalMembershipResponseSchema.parse({ found: false, organizationId: id('org') })
    ).toEqual({ found: false })
  })

  test.each([
    ['a membership without a status', { found: true, organizationId: id('org'), role: 'rep' }],
    ['null', null],
    [
      'an unknown status',
      { found: true, organizationId: id('org'), role: 'rep', organizationStatus: 'x' },
    ],
  ])('rejects %s', (_name, body) => {
    expect(internalMembershipResponseSchema.safeParse(body).success).toBe(false)
  })
})
