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
