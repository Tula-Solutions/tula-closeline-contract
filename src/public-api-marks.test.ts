import { describe, expect, test } from 'bun:test'
import * as api from './index'
import { PROSPECT_ROUTES } from './prospect'
import { PUBLIC_MARK, publicApiExtensions, SCOPES_MARK } from './public-api-marks'

describe('publicApiExtensions', () => {
  test('a route with publicApi yields both extensions', () => {
    expect(publicApiExtensions(PROSPECT_ROUTES.listProspects)).toEqual({
      'x-closeline-public': true,
      'x-closeline-scopes': ['prospects:read'],
    })
    expect(publicApiExtensions(PROSPECT_ROUTES.createProspect)).toEqual({
      'x-closeline-public': true,
      'x-closeline-scopes': ['prospects:write'],
    })
  })

  test('a route without publicApi yields neither', () => {
    const out = publicApiExtensions(PROSPECT_ROUTES.setProspectOwner)
    expect(out).toEqual({})
    expect(PUBLIC_MARK in out).toBe(false)
    expect(SCOPES_MARK in out).toBe(false)
  })

  test('the extension names are the ones ADR 0023 defines', () => {
    expect(PUBLIC_MARK).toBe('x-closeline-public')
    expect(SCOPES_MARK).toBe('x-closeline-scopes')
  })

  test('a read scope on a write method fails', () => {
    expect(() =>
      publicApiExtensions({ method: 'POST', path: '/v1/x', publicApi: { scope: 'prospects:read' } })
    ).toThrow(/POST \/v1\/x/)
  })

  test('a write scope on GET fails', () => {
    expect(() =>
      publicApiExtensions({ method: 'GET', path: '/v1/x', publicApi: { scope: 'prospects:write' } })
    ).toThrow(/GET/)
  })

  test('a scope outside the closed list fails', () => {
    expect(() =>
      publicApiExtensions({
        method: 'GET',
        path: '/v1/x',
        publicApi: { scope: 'admin:read' as never },
      })
    ).toThrow(/admin:read/)
  })

  test('a public route outside /v1 fails', () => {
    expect(() =>
      publicApiExtensions({
        method: 'GET',
        path: '/internal/x',
        publicApi: { scope: 'prospects:read' },
      })
    ).toThrow(/\/v1/)
  })

  test('accepts a lowercase method as an OpenAPI route config has', () => {
    expect(
      publicApiExtensions({ method: 'get', path: '/v1/x', publicApi: { scope: 'prospects:read' } })
    ).toEqual({ 'x-closeline-public': true, 'x-closeline-scopes': ['prospects:read'] })
  })

  test('every marked route in the contract produces a valid mark', () => {
    let count = 0
    for (const [name, value] of Object.entries(api)) {
      if (!name.endsWith('_ROUTES') || typeof value !== 'object' || value === null) {
        continue
      }
      for (const route of Object.values(value)) {
        if (typeof route === 'object' && route !== null && 'publicApi' in route) {
          const out = publicApiExtensions(route as Parameters<typeof publicApiExtensions>[0])
          expect(out[PUBLIC_MARK]).toBe(true)
          count++
        }
      }
    }
    expect(count).toBeGreaterThan(0)
  })
})
