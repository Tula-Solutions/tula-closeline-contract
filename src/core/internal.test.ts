import { describe, expect, test } from 'bun:test'
import { CORE_ERRORS } from './errors'
import { id } from './fixtures'
import {
  ABANDON_MAX_AGE_HOURS,
  INTERNAL_CALL_ERRORS,
  internalAbandonOrganizationParamsSchema,
  internalAbandonOrganizationRequestSchema,
  internalAbandonOrganizationResponseSchema,
  internalAcceptInvitationRequestSchema,
  internalAcceptInvitationResponseSchema,
  internalCreateOrganizationRequestSchema,
  internalCreateOrganizationResponseSchema,
  internalDirectoryMembershipRequestSchema,
  internalDirectoryMembershipResponseSchema,
  internalDirectoryRepCheckRequestSchema,
  internalDirectoryRepCheckResponseSchema,
  internalDirectoryTeamCheckRequestSchema,
  internalDirectoryTeamCheckResponseSchema,
  internalMembershipRequestSchema,
  internalMembershipResponseSchema,
  internalUpdateMemberProfileParamsSchema,
  internalUpdateMemberProfileRequestSchema,
  internalUpdateMemberProfileResponseSchema,
} from './internal'

const TOKEN = 'dGhpcyBpcyBhIHRva2Vu0123456789abcdef'

describe('INTERNAL_CALL_ERRORS', () => {
  test('names the domain codes each internal call may return, and no others', () => {
    expect(INTERNAL_CALL_ERRORS).toEqual({
      createOrganization: ['membership.already_member'],
      acceptInvitation: ['invitation.invalid', 'membership.already_member'],
      membership: [],
      updateMemberProfile: ['member.not_found'],
      abandonOrganization: ['organization.not_abandonable'],
    })
  })

  test('is frozen, at every level', () => {
    expect(Object.isFrozen(INTERNAL_CALL_ERRORS)).toBe(true)
    for (const codes of Object.values(INTERNAL_CALL_ERRORS)) {
      expect(Object.isFrozen(codes)).toBe(true)
    }
  })

  test('lists only codes core defines, and never a suspended or deleted Organization', () => {
    for (const codes of Object.values(INTERNAL_CALL_ERRORS)) {
      for (const code of codes) {
        expect(code in CORE_ERRORS).toBe(true)
        expect(code).not.toBe('organization.suspended')
        expect(code).not.toBe('organization.deleted')
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
    ['a malformed email', { ...body, email: 'not-an-email' }],
    ['an over-long name', { ...body, name: 'a'.repeat(202) }],
    ['an empty name', { ...body, name: '' }],
    ['a first and last name instead of one name', { ...body, firstName: 'Ada', lastName: 'L' }],
    ['an over-long name', { ...body, organizationName: 'a'.repeat(201) }],
    ['an empty name', { ...body, organizationName: '' }],
    ['no user', { organizationName: 'x' }],
  ])('rejects %s', (_name, input) => {
    expect(internalCreateOrganizationRequestSchema.safeParse(input).success).toBe(false)
  })
})

describe('internalCreateOrganizationRequestSchema, the person', () => {
  const body = { userId: id('usr'), organizationName: 'Acme' }

  test('accepts the address and the name auth composes, trimmed and folded', () => {
    expect(
      internalCreateOrganizationRequestSchema.parse({
        ...body,
        email: 'Ada@Example.com',
        name: ' Ada Lovelace ',
      })
    ).toEqual({ ...body, email: 'ada@example.com', name: 'Ada Lovelace' } as never)
  })

  test('accepts a null name, for a person who gave none', () => {
    expect(
      internalCreateOrganizationRequestSchema.parse({
        ...body,
        email: 'ada@example.com',
        name: null,
      })
    ).toEqual({ ...body, email: 'ada@example.com', name: null } as never)
  })

  test('still parses a 0.5.0 request, which has neither an email nor a name', () => {
    expect(internalCreateOrganizationRequestSchema.parse(body)).toEqual(body as never)
    expect('email' in internalCreateOrganizationRequestSchema.parse(body)).toBe(false)
    expect('name' in internalCreateOrganizationRequestSchema.parse(body)).toBe(false)
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

describe('internalAcceptInvitationRequestSchema, the name', () => {
  const body = { userId: id('usr'), email: 'ada@example.com', invitationToken: TOKEN }

  test('accepts the name auth composes, and a null one', () => {
    expect(
      internalAcceptInvitationRequestSchema.parse({ ...body, name: ' Ada Lovelace ' })
    ).toEqual({ ...body, name: 'Ada Lovelace' } as never)
    expect(internalAcceptInvitationRequestSchema.parse({ ...body, name: null })).toEqual({
      ...body,
      name: null,
    } as never)
  })

  test('still parses a 0.5.0 request, which has no name', () => {
    const parsed = internalAcceptInvitationRequestSchema.parse(body)
    expect(parsed).toEqual(body as never)
    expect('name' in parsed).toBe(false)
  })

  test.each([
    ['an empty name', { ...body, name: '' }],
    ['a name with a control character', { ...body, name: 'Ada\u0000' }],
    ['an over-long name', { ...body, name: 'a'.repeat(202) }],
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

describe('internal profile change', () => {
  const userId = id('usr')

  test('names the person in the path', () => {
    expect(internalUpdateMemberProfileParamsSchema.safeParse({ userId }).success).toBe(true)
    expect(internalUpdateMemberProfileParamsSchema.safeParse({ userId: id('mem') }).success).toBe(
      false
    )
    expect(internalUpdateMemberProfileParamsSchema.safeParse({}).success).toBe(false)
    expect(
      internalUpdateMemberProfileParamsSchema.safeParse({ userId, organizationId: id('org') })
        .success
    ).toBe(false)
  })

  test.each([
    ['a new address', { email: 'Ada@Example.com' }, { email: 'ada@example.com' }],
    ['a new name', { name: ' Ada King ' }, { name: 'Ada King' }],
    ['a cleared name', { name: null }, { name: null }],
    [
      'both',
      { email: 'ada@example.com', name: 'Ada King' },
      { email: 'ada@example.com', name: 'Ada King' },
    ],
  ])('accepts %s', (_label, input, parsed) => {
    expect(internalUpdateMemberProfileRequestSchema.parse(input)).toEqual(parsed as never)
  })

  test.each([
    ['nothing to change', {}],
    ['a null email, which cannot be cleared', { email: null }],
    ['a malformed email', { email: 'nope' }],
    ['an empty name', { name: '' }],
    ['a user id in the body, which is in the path', { userId, name: 'Ada' }],
    ['an Organization', { name: 'Ada', organizationId: id('org') }],
    ['a role', { name: 'Ada', role: 'owner' }],
  ])('rejects %s', (_label, input) => {
    expect(internalUpdateMemberProfileRequestSchema.safeParse(input).success).toBe(false)
  })

  test('answers with the profile core now holds', () => {
    expect(
      internalUpdateMemberProfileResponseSchema.parse({
        userId,
        email: 'ada@example.com',
        name: null,
        role: 'owner',
      })
    ).toEqual({ userId, email: 'ada@example.com', name: null } as never)
  })
})

describe('internal abandon', () => {
  const organizationId = id('org')
  const userId = id('usr')

  test('the age limit is a named constant in hours', () => {
    expect(ABANDON_MAX_AGE_HOURS).toBe(24)
  })

  test('names the Organization in the path and the user in the body', () => {
    expect(internalAbandonOrganizationParamsSchema.safeParse({ organizationId }).success).toBe(true)
    expect(internalAbandonOrganizationRequestSchema.parse({ userId })).toEqual({ userId } as never)
  })

  test.each([
    [
      'a user id as the Organization id',
      internalAbandonOrganizationParamsSchema,
      { organizationId: userId },
    ],
    ['no Organization id', internalAbandonOrganizationParamsSchema, {}],
    ['an unknown path key', internalAbandonOrganizationParamsSchema, { organizationId, userId }],
    ['no user', internalAbandonOrganizationRequestSchema, {}],
    [
      'an Organization id as the user',
      internalAbandonOrganizationRequestSchema,
      { userId: organizationId },
    ],
    [
      'the Organization in the body',
      internalAbandonOrganizationRequestSchema,
      { userId, organizationId },
    ],
    [
      'a way to skip the age guard',
      internalAbandonOrganizationRequestSchema,
      { userId, force: true },
    ],
  ])('rejects %s', (_label, schema, input) => {
    expect(schema.safeParse(input).success).toBe(false)
  })

  test('answers the same on a repeat as on the first success, and strips the rest', () => {
    const first = internalAbandonOrganizationResponseSchema.parse({
      organizationId,
      status: 'deleted',
      removedMembers: 1,
    })
    expect(first).toEqual({ organizationId, status: 'deleted' } as never)
    expect(internalAbandonOrganizationResponseSchema.parse(first)).toEqual(first)
  })

  test('has one refusal, 409 not_abandonable, and no not-found code', () => {
    expect(INTERNAL_CALL_ERRORS.abandonOrganization).toEqual(['organization.not_abandonable'])
    expect(CORE_ERRORS['organization.not_abandonable'].status).toBe(409)
    expect(INTERNAL_CALL_ERRORS.abandonOrganization).not.toContain('organization.not_found')
  })

  test('only ever says deleted', () => {
    expect(
      internalAbandonOrganizationResponseSchema.safeParse({ organizationId, status: 'active' })
        .success
    ).toBe(false)
  })
})

describe('directory calls', () => {
  const organizationId = id('org')
  const userId = id('usr')
  const membershipId = id('mem')
  const teamId = id('team')

  test('membership request takes an Organization and a user, strictly', () => {
    expect(
      internalDirectoryMembershipRequestSchema.safeParse({ organizationId, userId }).success
    ).toBe(true)
    expect(internalDirectoryMembershipRequestSchema.safeParse({ userId }).success).toBe(false)
    expect(
      internalDirectoryMembershipRequestSchema.safeParse({ organizationId, userId, extra: 1 })
        .success
    ).toBe(false)
    expect(
      internalDirectoryMembershipRequestSchema.safeParse({ organizationId, userId: teamId }).success
    ).toBe(false)
  })

  test('membership response is found with a role and status, or not found', () => {
    const found = { found: true, membershipId, role: 'rep', organizationStatus: 'active' }
    expect(internalDirectoryMembershipResponseSchema.parse(found)).toEqual(found as never)
    expect(internalDirectoryMembershipResponseSchema.parse({ found: false })).toEqual({
      found: false,
    })
    expect(
      internalDirectoryMembershipResponseSchema.safeParse({ found: true, membershipId }).success
    ).toBe(false)
    expect(
      internalDirectoryMembershipResponseSchema.safeParse({ ...found, role: 'root' }).success
    ).toBe(false)
  })

  test('rep check request and response', () => {
    expect(
      internalDirectoryRepCheckRequestSchema.safeParse({ organizationId, membershipId }).success
    ).toBe(true)
    expect(
      internalDirectoryRepCheckRequestSchema.safeParse({ organizationId, userId }).success
    ).toBe(false)
    expect(internalDirectoryRepCheckResponseSchema.parse({ isRep: false })).toEqual({
      isRep: false,
    })
    expect(internalDirectoryRepCheckResponseSchema.safeParse({ isRep: 'yes' }).success).toBe(false)
  })

  test('team check request and response', () => {
    expect(
      internalDirectoryTeamCheckRequestSchema.safeParse({ organizationId, teamId }).success
    ).toBe(true)
    expect(
      internalDirectoryTeamCheckRequestSchema.safeParse({ organizationId, teamId: membershipId })
        .success
    ).toBe(false)
    expect(internalDirectoryTeamCheckResponseSchema.parse({ exists: true })).toEqual({
      exists: true,
    })
    expect(internalDirectoryTeamCheckResponseSchema.safeParse({}).success).toBe(false)
  })
})
