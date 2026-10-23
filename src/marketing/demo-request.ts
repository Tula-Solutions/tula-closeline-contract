import { z } from 'zod'
import { organizationNameSchema, personNameSchema } from '../core/values'
import { emailSchema } from '../email'
import type { CommonErrorCode } from '../errors'
import { demoRequestIdSchema } from '../ids'
import type { MarketingErrorCode } from './errors'

/** The most characters a Demo Request message may carry. */
export const MAX_DEMO_REQUEST_MESSAGE_LENGTH = 2000

/** The most characters of the source page path and of the honeypot field. */
export const MAX_DEMO_REQUEST_FIELD_LENGTH = 200

function hasForbiddenControlCharacter(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)
    const allowedWhitespace = code === 0x0a || code === 0x0d || code === 0x09
    if ((code < 0x20 && !allowedWhitespace) || (code >= 0x7f && code <= 0x9f)) {
      return true
    }
  }
  return false
}

/**
 * The free-text message of a Demo Request: at most 2,000 characters, trimmed, with line breaks
 * and tabs allowed and every other control character refused. It is untrusted text: the team
 * email and any display must escape it and never treat it as instructions.
 */
export const demoRequestMessageSchema = z
  .string()
  .max(MAX_DEMO_REQUEST_MESSAGE_LENGTH)
  .refine((text) => !hasForbiddenControlCharacter(text), 'No control characters')
  .transform((text) => text.trim())

/**
 * The site page a Visitor submitted from: an absolute path such as `/pricing`, at most 200
 * characters of printable ASCII with no whitespace, so a full URL or a script cannot be put in it.
 */
export const demoRequestSourcePageSchema = z
  .string()
  .max(MAX_DEMO_REQUEST_FIELD_LENGTH)
  .regex(/^\/[\x21-\x7e]*$/, 'An absolute path')

/**
 * The body of `POST /v1/marketing/demo-requests`, sent by a Visitor (nobody signed in): name, work
 * email (folded to lower case), company name, an optional message, the page it came from and a
 * honeypot. The honeypot, `website`, is a field the form hides from people: a Visitor leaves it
 * empty (and may omit it), so a non-empty value marks a bot. It still parses, so the service can
 * answer exactly as it does for a real request and store nothing. The idempotency key is not in
 * the body; it is the `Idempotency-Key` header (`idempotencyKeySchema`). The schema is strict:
 * an unknown key is `marketing.invalid_request`.
 */
export const createDemoRequestRequestSchema = z.strictObject({
  name: personNameSchema,
  workEmail: emailSchema,
  companyName: organizationNameSchema,
  message: demoRequestMessageSchema.optional(),
  sourcePage: demoRequestSourcePageSchema,
  website: z.string().max(MAX_DEMO_REQUEST_FIELD_LENGTH).default(''),
})

/** The body of a request to submit a Demo Request. */
export type CreateDemoRequestRequest = z.infer<typeof createDemoRequestRequestSchema>

/**
 * The acknowledgement of a Demo Request: its id and nothing else, so no submitted field comes
 * back. A replay under the same `Idempotency-Key` returns the same id.
 */
export const createDemoRequestResponseSchema = z.object({
  id: demoRequestIdSchema,
})

/** The acknowledgement of a Demo Request. */
export type CreateDemoRequestResponse = z.infer<typeof createDemoRequestResponseSchema>

/** What the service needs to describe a marketing route for its OpenAPI document. */
export type MarketingRoute = {
  readonly method: 'POST'
  readonly path: string
  /** True: the route takes no token and no Organization; anyone may call it. */
  readonly public: true
  /** Whether the `Idempotency-Key` header is `required` for this route. */
  readonly idempotencyKey: 'required'
  /** The success statuses, the first being the usual one. */
  readonly success: readonly number[]
  /** The domain codes the route may return. */
  readonly errors: readonly MarketingErrorCode[]
  /** The common codes the route may return, beyond those every route may. */
  readonly commonErrors: readonly CommonErrorCode[]
  /** The description for the OpenAPI document. */
  readonly description: string
}

/** The marketing routes, by name. */
export type MarketingRouteName = 'createDemoRequest'

const createDemoRequest = Object.freeze({
  method: 'POST',
  path: '/v1/marketing/demo-requests',
  public: true,
  idempotencyKey: 'required',
  success: [201, 200],
  errors: ['marketing.invalid_request', 'marketing.rate_limited'],
  commonErrors: [
    'request.too_large',
    'request.unsupported_media_type',
    'request.idempotency_key_reused',
    'request.idempotency_in_progress',
    'server.internal',
    'server.unavailable',
    'server.timeout',
  ],
  description:
    'Public: no token, no Organization. A Visitor submits a Demo Request: name, work email, company name, an optional message of at most 2,000 characters, the page it came from and a hidden honeypot field. Requires an Idempotency-Key header (16 to 128 characters; the client generates one per form submission): a replay returns the original acknowledgement with 200 instead of storing a second Demo Request, the same key with a different body is request.idempotency_key_reused, and the same key while the first request is running is request.idempotency_in_progress. Answers 201 with only the id of the new Demo Request. A filled honeypot is answered exactly as a real request (201 with an id) and stores nothing. A body that fails validation, has an unknown key, or a missing or malformed Idempotency-Key header is marketing.invalid_request (400). The limit per client address is marketing.rate_limited (429) with details.retryAfter in seconds and a Retry-After header. A body over the size limit is request.too_large.',
} as const satisfies MarketingRoute)

/**
 * The marketing routes: the description a service puts in its OpenAPI document, the success
 * statuses and every error code each route may answer with. No marketing route answers
 * `auth.*`: it is public.
 */
export const MARKETING_ROUTES: Readonly<Record<MarketingRouteName, MarketingRoute>> = Object.freeze(
  { createDemoRequest }
)

/**
 * Every error code `POST /v1/marketing/demo-requests` may answer with: the two `marketing.*`
 * codes first, then the common ones. It never answers `auth.*`, `request.invalid` or
 * `rate.limited`: `marketing.invalid_request` and `marketing.rate_limited` stand in for them.
 */
export const CREATE_DEMO_REQUEST_ERROR_CODES = [
  ...createDemoRequest.errors,
  ...createDemoRequest.commonErrors,
] as const satisfies readonly (MarketingErrorCode | CommonErrorCode)[]
