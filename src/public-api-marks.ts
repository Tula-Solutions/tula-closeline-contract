import { API_KEY_SCOPES, type ApiKeyScope } from './apikey/values'

/** The OpenAPI operation extension that marks a route as part of the public API (ADR 0023). */
export const PUBLIC_MARK = 'x-closeline-public'

/** The OpenAPI operation extension that names the one API key scope a public route needs. */
export const SCOPES_MARK = 'x-closeline-scopes'

/** The part of a route definition the marks are made from: any contract route table entry fits. */
export type PublicApiRoute = {
  readonly method: string
  readonly path: string
  readonly publicApi?: { readonly scope: ApiKeyScope }
}

/** The extensions an operation carries when its route is public: both, or none. */
export type PublicApiExtensions = {
  readonly [PUBLIC_MARK]?: true
  readonly [SCOPES_MARK]?: readonly [ApiKeyScope]
}

/**
 * Builds the `x-closeline-public` and `x-closeline-scopes` extensions for a route's OpenAPI
 * operation, to be spread into its route config; a route without `publicApi` gets `{}`. Throws
 * when the scope is not in the closed list, is a read on a non-GET method or a write on GET, or
 * the route is not under `/v1`, so a wrong mark fails the service's build or boot.
 */
export function publicApiExtensions(route: PublicApiRoute): PublicApiExtensions {
  if (route.publicApi === undefined) {
    return {}
  }
  const { scope } = route.publicApi
  const label = `${route.method.toUpperCase()} ${route.path}`
  if (!API_KEY_SCOPES.includes(scope)) {
    throw new Error(`${label}: ${scope} is not an API key scope`)
  }
  if (!route.path.startsWith('/v1/') || route.path.split('/').includes('..')) {
    throw new Error(`${label}: a public route must be a /v1 path`)
  }
  const expected = route.method.toUpperCase() === 'GET' ? 'read' : 'write'
  if (scope.split(':')[1] !== expected) {
    throw new Error(`${label}: needs a ${expected} scope, not ${scope}`)
  }
  return { [PUBLIC_MARK]: true, [SCOPES_MARK]: [scope] }
}
