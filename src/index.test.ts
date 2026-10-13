import { expect, test } from 'bun:test'
import { PACKAGE } from './index'

test('the library reports its own package name', () => {
  expect(PACKAGE).toBe('tula-closeline-contract')
})

test('the entry point exports the auth, core and common error maps', async () => {
  const api = await import('./index')
  expect(api.AUTH_ERRORS['session.reuse_detected'].status).toBe(401)
  expect(api.CORE_ERRORS['team.not_found'].status).toBe(404)
  expect(api.ERRORS['request.idempotency_in_progress'].status).toBe(409)
})

test('the entry point exports the member profile and its internal profile change', async () => {
  const api = await import('./index')
  expect(api.personNameSchema.parse(' Ada ')).toBe('Ada')
  expect(api.MAX_PERSON_NAME_LENGTH).toBe(201)
  expect(api.INTERNAL_CALL_ERRORS.updateMemberProfile).toEqual(['member.not_found'])
  expect(typeof api.internalUpdateMemberProfileRequestSchema.safeParse).toBe('function')
  expect(typeof api.internalUpdateMemberProfileParamsSchema.safeParse).toBe('function')
  expect(typeof api.internalUpdateMemberProfileResponseSchema.safeParse).toBe('function')
})

test('the entry point exports the internal abandon call and its code', async () => {
  const api = await import('./index')
  expect(api.ABANDON_MAX_AGE_HOURS).toBe(24)
  expect(api.CORE_ERRORS['organization.not_abandonable'].status).toBe(409)
  expect(api.INTERNAL_CALL_ERRORS.abandonOrganization).toEqual([
    'organization.not_found',
    'organization.not_abandonable',
  ])
  expect(typeof api.internalAbandonOrganizationRequestSchema.safeParse).toBe('function')
})
