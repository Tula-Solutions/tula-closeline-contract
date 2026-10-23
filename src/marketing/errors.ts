import { defineErrors } from '../errors'

/**
 * The errors the marketing routes return, as `area.reason` codes. They are the only domain
 * errors of the public Demo Request route. `marketing.invalid_request` (400) is a body that fails
 * `createDemoRequestRequestSchema`, or a missing or malformed `Idempotency-Key` header; it
 * replaces the common `request.invalid` on this route so a Visitor-facing form branches on one
 * area. `marketing.rate_limited` (429) is the per-client-address limit, answered with `details`
 * of `retryAfterDetailsSchema` (`retryAfter` in seconds) and a `Retry-After` header. Neither
 * message says why a request was refused beyond that, and a filled honeypot is not an error.
 */
export const MARKETING_ERRORS = {
  ...defineErrors('marketing', {
    invalid_request: { status: 400, message: 'The request is not valid.' },
    rate_limited: {
      status: 429,
      message: 'Too many requests from this address. Try again later.',
    },
  }),
} as const

/** A code from the {@link MARKETING_ERRORS} registry. */
export type MarketingErrorCode = keyof typeof MARKETING_ERRORS
