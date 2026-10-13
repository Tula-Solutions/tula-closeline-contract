import { describe, expect, test } from 'bun:test'
import { ERRORS, errorCodeSchema } from '../errors'
import { CORE_ERRORS, SIGNUP_ERRORS } from './errors'

describe('CORE_ERRORS', () => {
  test.each([
    ['organization.not_found', 404],
    ['organization.suspended', 403],
    ['organization.deleted', 410],
    ['member.not_found', 404],
    ['member.last_owner', 409],
    ['membership.already_member', 409],
    ['invitation.invalid', 422],
    ['invitation.not_found', 404],
    ['invitation.already_pending', 409],
    ['team.not_found', 404],
    ['team.name_taken', 409],
    ['role.not_permitted', 403],
  ] as const)('%s maps to status %d', (code, status) => {
    const entry = CORE_ERRORS[code]
    expect(entry.code).toBe(code)
    expect(entry.status).toBe(status)
    expect(entry.message.length).toBeGreaterThan(0)
    expect(errorCodeSchema.safeParse(code).success).toBe(true)
  })

  test('lists exactly the codes under test', () => {
    expect(Object.keys(CORE_ERRORS)).toHaveLength(12)
  })

  test('one code covers an unknown, used, revoked and expired token', () => {
    const codes = Object.keys(CORE_ERRORS).filter((code) => code.startsWith('invitation.'))
    expect(codes).not.toContain('invitation.expired')
    expect(codes).not.toContain('invitation.used')
    expect(codes).not.toContain('invitation.revoked')
  })

  test('no code or message says whether an email or user exists elsewhere', () => {
    for (const entry of Object.values({ ...CORE_ERRORS, ...SIGNUP_ERRORS })) {
      expect(entry.code).not.toMatch(/email_(taken|exists|registered)|user_(exists|taken)/)
      expect(entry.message).not.toMatch(/another organization|email.*(exists|registered)/i)
    }
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
    expect(Object.keys(SIGNUP_ERRORS)).toHaveLength(4)
  })
})

test('no core or sign-up code collides with a common one or with each other', () => {
  const all = [...Object.keys(CORE_ERRORS), ...Object.keys(SIGNUP_ERRORS), ...Object.keys(ERRORS)]
  expect(new Set(all).size).toBe(all.length)
})
