import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute } from '../inbound-route'
import type { Role } from '../tenancy'
import type { ApikeyErrorCode } from './errors'

/** The roles that list, create and revoke API keys. */
export const APIKEY_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The API key route names. */
export type ApikeyRouteName = 'createApiKey' | 'listApiKeys' | 'revokeApiKey' | 'verifyApiKey'

/** One API key route. */
export type ApikeyRoute = InboundRoute<ApikeyErrorCode>

const KEY =
  'Requires an Idempotency-Key header: a replay answers the same result and does the work once.'

const ORG_ONLY =
  "Keys belong to the caller's Organization alone: a key of another Organization is apikey.not_found (404), never 403."

/**
 * The API key routes (spec M16). Core owns them. The secret is returned once, by the creating call,
 * and never by a read; only a display prefix and a SHA-256 hash are stored. The verify route is
 * internal: auth calls it to exchange a key for a short-lived token. An API key can never create,
 * list or revoke keys, so none of these routes has a public API scope.
 */
export const APIKEY_ROUTES: Readonly<Record<ApikeyRouteName, ApikeyRoute>> = Object.freeze({
  createApiKey: inboundRoute({
    method: 'POST',
    path: '/v1/api-keys',
    roles: APIKEY_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ['apikey.scope_not_allowed'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Creates an API key with a name, one or more scopes (<area>:read or <area>:write, from a closed list), the highest role it may act as (default rep, never above the creator's own) and an optional expiry. The answer carries the secret, returned this once: it is never returned by any read, never logged and never put in an audit event, and only a SHA-256 hash and a display prefix are stored. A scope or role ceiling above what the creator may give is apikey.scope_not_allowed (403). ${KEY} A replay with the same key answers 200 with the same key and secret null: the secret is not kept to be replayed, so a caller that lost the response revokes the key and makes another. Owner and Admin only. The creation is audited. ${ORG_ONLY}`,
  }),
  listApiKeys: inboundRoute({
    method: 'GET',
    path: '/v1/api-keys',
    roles: APIKEY_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists the Organization's API keys, newest first, one cursor-paginated page at a time (at most 100), revoked keys only when asked for. Each key shows its name, display prefix, scopes, role ceiling, expiry, last use and whether it is revoked; never the secret or its hash. Owner and Admin only. ${ORG_ONLY}`,
  }),
  revokeApiKey: inboundRoute({
    method: 'POST',
    path: '/v1/api-keys/{apiKeyId}/revoke',
    roles: APIKEY_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['apikey.not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Revokes an API key at once; a repeat on a revoked key answers 200 with the same key and keeps the first revocation time. A token already minted from the key keeps working until it expires, at most 10 minutes; no new token can be minted. ${KEY} Owner and Admin only. The revocation is audited. ${ORG_ONLY}`,
  }),
  verifyApiKey: inboundRoute({
    method: 'POST',
    path: '/internal/api-keys/verify',
    roles: [],
    internal: true,
    success: [200],
    idempotent: false,
    errors: ['apikey.invalid', 'apikey.revoked', 'apikey.rate_limited'],
    commonErrors: ['request.invalid'],
    description:
      'Internal, auth to core with the shared secret (ADR 0013): checks a presented key secret in constant time against the stored hash and answers the key id, Organization, scopes, role ceiling and expiry that auth puts in a short-lived token. A secret that matches no key is apikey.invalid (401); a revoked or expired key is apikey.revoked (401). The use is counted against the key; a key over its limit is apikey.rate_limited (429). The secret is never logged. It never takes an Organization from the caller.',
  }),
})
