import { z } from 'zod'

const CODE_PATTERN = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/
const AREA_PATTERN = /^[a-z][a-z0-9_]*$/

/** An error code in `area.reason` form, such as `request.invalid`. */
export const errorCodeSchema = z.string().max(100).regex(CODE_PATTERN)

/** The one body every service returns for a failure. */
export const errorBodySchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string().min(1).max(2000),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
})

/** The body of a failure response, as returned by every service. */
export type ErrorBody = z.infer<typeof errorBodySchema>

/** What a registry knows about one error: its code, HTTP status and default message. */
export type ErrorDefinition<Code extends string = string> = {
  readonly code: Code
  readonly status: number
  readonly message: string
}

const freezeEntry = <const Code extends string>(
  code: Code,
  status: number,
  message: string
): ErrorDefinition<Code> => Object.freeze({ code, status, message })

const common = [
  freezeEntry('request.invalid', 400, 'The request is not valid.'),
  freezeEntry('request.not_found', 404, 'The resource was not found.'),
  freezeEntry('request.conflict', 409, 'The request conflicts with the current state.'),
  freezeEntry(
    'request.idempotency_key_reused',
    422,
    'The idempotency key was already used with a different request.'
  ),
  freezeEntry(
    'request.idempotency_in_progress',
    409,
    'A request with this idempotency key is still in progress. Try again shortly.'
  ),
  freezeEntry('request.too_large', 413, 'The request body is too large.'),
  freezeEntry('request.method_not_allowed', 405, 'This method is not allowed for this route.'),
  freezeEntry('request.unsupported_media_type', 415, 'The request content type is not supported.'),
  freezeEntry('request.unprocessable', 422, 'The request cannot be processed.'),
  freezeEntry('auth.unauthenticated', 401, 'Authentication is required.'),
  freezeEntry('auth.forbidden', 403, 'You are not allowed to do this.'),
  freezeEntry('auth.token_expired', 401, 'The access token has expired. Refresh it and try again.'),
  freezeEntry('auth.token_invalid', 401, 'The access token is not valid.'),
  freezeEntry('auth.unavailable', 503, 'Tokens cannot be verified right now. Try again later.'),
  freezeEntry('rate.limited', 429, 'Too many requests. Try again later.'),
  freezeEntry('server.internal', 500, 'Something went wrong on our side.'),
  freezeEntry('server.unavailable', 503, 'The service is temporarily unavailable.'),
  freezeEntry('server.timeout', 504, 'The request took too long to complete.'),
] as const

type CommonEntry = (typeof common)[number]

/** The errors common to every service, keyed by code. */
export const ERRORS: Readonly<{ [E in CommonEntry as E['code']]: E }> = Object.freeze(
  Object.fromEntries(common.map((entry) => [entry.code, entry]))
) as Readonly<{ [E in CommonEntry as E['code']]: E }>

/** A code from the {@link ERRORS} registry. */
export type CommonErrorCode = keyof typeof ERRORS

/** What a service supplies for one of its own errors; the code comes from the area and key. */
export type ErrorInput = { readonly status: number; readonly message: string }

const statusSchema = z.number().int().min(400).max(599)
const messageSchema = z.string().min(1).max(2000)

/** Declares a service's own errors: prefixes each reason with the area and returns a frozen registry. */
export function defineErrors<const Area extends string, const Reason extends string>(
  area: Area,
  entries: Readonly<Record<Reason, ErrorInput>>
): Readonly<{ [R in Reason as `${Area}.${R}`]: ErrorDefinition<`${Area}.${R}`> }> {
  if (!AREA_PATTERN.test(area)) {
    throw new Error(`Invalid error area: ${area}`)
  }
  const registry: Record<string, ErrorDefinition> = {}
  for (const [reason, input] of Object.entries<ErrorInput>(entries)) {
    const code = errorCodeSchema.parse(`${area}.${reason}`)
    if (code in ERRORS || code in registry) {
      throw new Error(`Duplicate error code: ${code}`)
    }
    registry[code] = Object.freeze({
      code,
      status: statusSchema.parse(input.status),
      message: messageSchema.parse(input.message),
    })
  }
  return Object.freeze(registry) as Readonly<{
    [R in Reason as `${Area}.${R}`]: ErrorDefinition<`${Area}.${R}`>
  }>
}
