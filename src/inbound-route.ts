import type { CommonErrorCode } from './errors'
import type { Role } from './tenancy'

/** The shared shape of an inbound route (Inquiry, Agent and Chat): who may call it, what it answers. */
export type InboundRoute<Code extends string> = {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly path: string
  /** The roles allowed. Empty for a public route. Any other role is the common `auth.forbidden`. */
  readonly roles: readonly Role[]
  /** True: the route takes no token and no Organization; the publishable key or session token stands in. */
  readonly public?: true
  /** The success statuses, the first being the usual one. */
  readonly success: readonly number[]
  /** True when a retry of the route is safe by the `Idempotency-Key` header. */
  readonly idempotent: boolean
  /** True when the `Idempotency-Key` header is required, not just accepted. */
  readonly keyRequired?: true
  /** The domain codes the route may return, beyond the common ones. */
  readonly errors: readonly Code[]
  /** The common codes the route may return, beyond those every route may. */
  readonly commonErrors: readonly CommonErrorCode[]
  /** The description for the OpenAPI document, role rules included. */
  readonly description: string
}

/** Freezes a route definition so a consumer cannot change the registry. */
export const inboundRoute = <Code extends string>(
  definition: InboundRoute<Code>
): InboundRoute<Code> => Object.freeze(definition)

/** The common errors of a retried route: a bad body, a reused key, a key still in progress. */
export const IDEMPOTENT_ERRORS = [
  'request.invalid',
  'request.idempotency_key_reused',
  'request.idempotency_in_progress',
] as const satisfies readonly CommonErrorCode[]

/** The common errors of a public route: no token, so no `auth.*`, but limits and server faults. */
export const PUBLIC_ERRORS = [
  'request.too_large',
  'request.unsupported_media_type',
  'request.invalid',
  'rate.limited',
  'server.internal',
  'server.unavailable',
  'server.timeout',
] as const satisfies readonly CommonErrorCode[]
