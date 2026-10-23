import { describe, expect, test } from 'bun:test'
import * as api from '../index'
import { API_KEY_SCOPES } from './values'

type Marked = {
  method: string
  path: string
  roles: readonly string[]
  public?: boolean
  internal?: boolean
  access?: string
  publicApi?: { scope: string }
}

const entries: { key: string; route: Marked }[] = []
for (const [name, value] of Object.entries(api)) {
  if (!name.endsWith('_ROUTES') || name.startsWith('ALL_') || typeof value !== 'object') {
    continue
  }
  for (const [routeName, route] of Object.entries(value as Record<string, Marked>)) {
    entries.push({ key: `${name}.${routeName}`, route })
  }
}
const marked = entries.filter((e) => e.route.publicApi)

/** Route groups an API key never reaches: administration, settings, billing, auth. */
const UNMARKED_GROUPS = [
  'APIKEY_ROUTES',
  'AUDIT_ROUTES',
  'EXPORT_ROUTES',
  'AGENT_CONTROL_ROUTES',
  'AGENT_ROUTES',
  'AGENT_RUNTIME_ROUTES',
  'AUTH_ROUTES',
  'CORE_ROUTES',
  'ANALYTICS_ROUTES',
  'PLAYBOOK_ROUTES',
]

describe('the routes an API key may call', () => {
  test('some routes are marked, in every customer-facing area', () => {
    const areas = new Set(marked.map((e) => e.route.publicApi?.scope.split(':')[0]))
    for (const area of [
      'prospects',
      'consent',
      'enrichment',
      'campaigns',
      'messaging',
      'bookings',
      'calls',
    ]) {
      expect(areas.has(area)).toBe(true)
    }
  })

  test('every marked scope exists in the scope model', () => {
    for (const { key, route } of marked) {
      expect(`${key} ${API_KEY_SCOPES.includes(route.publicApi?.scope as never)}`).toBe(
        `${key} true`
      )
    }
  })

  test('a read route carries a read scope and a write route a write scope', () => {
    for (const { key, route } of marked) {
      const kind = route.publicApi?.scope.split(':')[1]
      expect(`${key} ${kind}`).toBe(`${key} ${route.method === 'GET' ? 'read' : 'write'}`)
    }
  })

  test('every marked route is a /v1 route that takes a token and lists roles', () => {
    for (const { key, route } of marked) {
      expect(`${key} ${route.path.startsWith('/v1/')}`).toBe(`${key} true`)
      expect(route.public).toBeFalsy()
      expect(route.internal).toBeFalsy()
      expect(route.access ?? 'user').toBe('user')
      expect(route.path).not.toContain('/public/')
      // An API key acts as a role (its ceiling), so a marked route needs a role to be checked against.
      expect(`${key} ${route.roles.length > 0}`).toBe(`${key} true`)
    }
  })

  test('no administration, settings, billing, member, auth or webhook route is marked', () => {
    for (const group of UNMARKED_GROUPS) {
      const routes = (api as Record<string, unknown>)[group]
      if (routes === undefined) {
        continue
      }
      for (const [name, route] of Object.entries(routes as Record<string, Marked>)) {
        expect(`${group}.${name} ${route.publicApi === undefined}`).toBe(`${group}.${name} true`)
      }
    }
    const sensitive =
      /settings|billing|members?|teams?|roles?|api-keys|webhook|wording|form|suppression|import|recording|softphone/i
    for (const { key, route } of marked) {
      expect(`${key} ${sensitive.test(route.path)}`).toBe(`${key} false`)
    }
  })

  test('an Owner and Admin only route is not marked', () => {
    for (const { key, route } of marked) {
      const everyoneBelowAdmin = route.roles.some((r) => r === 'rep' || r === 'manager')
      expect(`${key} ${everyoneBelowAdmin}`).toBe(`${key} true`)
    }
  })
})
