import { describe, expect, test } from 'bun:test'
import { ERRORS, errorCodeSchema } from '../errors'
import { CORE_ERRORS, DAILY_LIMIT_DETAILS_SCHEMA, SIGNUP_ERRORS } from './errors'
import { retryAfterDetailsSchema } from './values'

/** Every message, exactly: a changed word is a review decision, not an accident. */
const CORE_MESSAGES = {
  'organization.not_found': 'The Organization was not found.',
  'organization.suspended': 'This Organization is suspended.',
  'organization.deleted': 'This Organization has been deleted.',
  'organization.not_abandonable': 'This Organization cannot be abandoned.',
  'member.not_found': 'The member was not found.',
  'member.last_owner':
    'The last Owner cannot be removed or demoted. Promote a different member to Owner first.',
  'membership.already_member': 'You already belong to an Organization.',
  'invitation.invalid': 'The invitation is not valid.',
  'invitation.not_found': 'The invitation was not found.',
  'invitation.already_pending':
    'A matching invitation is already pending. Revoke it to send a new one.',
  'invitation.already_member': 'The invitee is already a member of this Organization.',
  'invitation.pending_limit':
    'This Organization has too many pending invitations. Revoke some to send more.',
  'invitation.daily_limit':
    'This Organization has sent too many invitations today. Try again later.',
  'team.not_found': 'The Team was not found.',
  'team.name_taken': 'A Team with that name already exists.',
} as const

const SIGNUP_MESSAGES = {
  'auth.no_organization': 'You do not belong to an Organization, so you cannot sign in.',
  'signup.invitation_invalid': 'The invitation is not valid.',
  'signup.organization_name_invalid': 'Enter a valid Organization name.',
  'membership.unavailable': 'Organization membership is unavailable right now. Try again shortly.',
} as const

describe('CORE_ERRORS', () => {
  test.each([
    ['organization.not_found', 404],
    ['organization.suspended', 403],
    ['organization.deleted', 410],
    ['organization.not_abandonable', 409],
    ['member.not_found', 404],
    ['member.last_owner', 409],
    ['membership.already_member', 409],
    ['invitation.invalid', 422],
    ['invitation.not_found', 404],
    ['invitation.already_pending', 409],
    ['invitation.already_member', 409],
    ['invitation.pending_limit', 409],
    ['invitation.daily_limit', 429],
    ['team.not_found', 404],
    ['team.name_taken', 409],
  ] as const)('%s maps to status %d', (code, status) => {
    const entry = CORE_ERRORS[code]
    expect(entry.code).toBe(code)
    expect(entry.status).toBe(status)
    expect(errorCodeSchema.safeParse(code).success).toBe(true)
  })

  test('lists exactly the codes under test', () => {
    expect(Object.keys(CORE_ERRORS).sort()).toEqual(Object.keys(CORE_MESSAGES).sort())
  })

  test('the Organization-wide invite limits are distinct from the per-request rate.limited', () => {
    expect(CORE_ERRORS['invitation.pending_limit'].code).not.toBe(ERRORS['rate.limited'].code)
    expect(CORE_ERRORS['invitation.daily_limit'].code).not.toBe(ERRORS['rate.limited'].code)
  })

  test('has no role code: the common auth.forbidden covers a role that is not allowed', () => {
    expect('role.not_permitted' in CORE_ERRORS).toBe(false)
    expect(Object.keys(CORE_ERRORS).some((code) => code.startsWith('role.'))).toBe(false)
    expect(ERRORS['auth.forbidden'].status).toBe(403)
  })

  test('every message is exactly the one on the allow-list', () => {
    for (const [code, message] of Object.entries(CORE_MESSAGES)) {
      expect(CORE_ERRORS[code as keyof typeof CORE_MESSAGES].message).toBe(message)
    }
  })

  test('one code covers an unknown, used, revoked and expired token', () => {
    const codes = Object.keys(CORE_ERRORS).filter((code) => code.startsWith('invitation.'))
    expect(codes).not.toContain('invitation.expired')
    expect(codes).not.toContain('invitation.used')
    expect(codes).not.toContain('invitation.revoked')
  })
})

describe('SIGNUP_ERRORS', () => {
  test.each([
    ['auth.no_organization', 403],
    ['signup.invitation_invalid', 422],
    ['signup.organization_name_invalid', 422],
    ['membership.unavailable', 503],
  ] as const)('%s maps to status %d', (code, status) => {
    expect(SIGNUP_ERRORS[code].code).toBe(code)
    expect(SIGNUP_ERRORS[code].status).toBe(status)
  })

  test('lists exactly the codes under test', () => {
    expect(Object.keys(SIGNUP_ERRORS).sort()).toEqual(Object.keys(SIGNUP_MESSAGES).sort())
  })

  test('every message is exactly the one on the allow-list', () => {
    for (const [code, message] of Object.entries(SIGNUP_MESSAGES)) {
      expect(SIGNUP_ERRORS[code as keyof typeof SIGNUP_MESSAGES].message).toBe(message)
    }
  })
})

test('no message mentions another person, an email address or an account', () => {
  for (const entry of Object.values({ ...CORE_ERRORS, ...SIGNUP_ERRORS })) {
    expect(entry.message).not.toMatch(
      /e-?mail|address|account|another|someone|anyone|\bperson\b|\busers?\b/i
    )
  }
})

test('no core or sign-up code collides with a common one or with each other', () => {
  const all = [...Object.keys(CORE_ERRORS), ...Object.keys(SIGNUP_ERRORS), ...Object.keys(ERRORS)]
  expect(new Set(all).size).toBe(all.length)
})

test('invitation.daily_limit carries retryAfter details', () => {
  expect(DAILY_LIMIT_DETAILS_SCHEMA).toBe(retryAfterDetailsSchema)
})
