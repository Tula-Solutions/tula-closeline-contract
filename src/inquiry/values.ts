import { z } from 'zod'
import { boundedTextSchema } from '../prospect/values'

/** Where an Inquiry came from: a form embedded on the Organization's site, a Chat, or a Call to a Line. */
export const INQUIRY_SOURCES = ['form', 'chat', 'call'] as const

/** Where an Inquiry came from. */
export const inquirySourceSchema = z.enum(INQUIRY_SOURCES)

/** Where an Inquiry came from. */
export type InquirySource = z.infer<typeof inquirySourceSchema>

/**
 * The states of the Agent's callback for a form Inquiry. `not_applicable` is a Chat or a Call
 * Inquiry (the Prospect initiated it live); `pending` waits to be dialled; `dialling` and
 * `connected` follow the attempt; `no_answer` waits for a retry (at most two); `skipped` did not
 * happen and `skipReason` says why; `failed` ended in an error.
 */
export const INQUIRY_CALLBACK_STATES = [
  'not_applicable',
  'pending',
  'dialling',
  'connected',
  'no_answer',
  'skipped',
  'failed',
] as const

/** The state of the callback for an Inquiry. */
export const inquiryCallbackStateSchema = z.enum(INQUIRY_CALLBACK_STATES)

/** The state of the callback for an Inquiry. */
export type InquiryCallbackState = z.infer<typeof inquiryCallbackStateSchema>

/**
 * Why a callback did not happen: a closed list the portal maps to its own wording (user story 27).
 * Each one is a refusal of the gate, never a setting. `no_consent` includes a Prospect who did not
 * tick the callback box; `consent_check_unavailable` is core unreachable, which counts as "no".
 */
export const INQUIRY_SKIP_REASONS = [
  'agent_paused',
  'no_consent',
  'consent_revoked',
  'suppressed',
  'outside_hours',
  'consent_check_unavailable',
  'no_phone_number',
  'concurrency_cap',
  'retries_exhausted',
] as const

/** Why a callback did not happen. */
export const inquirySkipReasonSchema = z.enum(INQUIRY_SKIP_REASONS)

/** Why a callback did not happen. */
export type InquirySkipReason = z.infer<typeof inquirySkipReasonSchema>

/** The most callback attempts for one Inquiry: the first and at most two retries. */
export const MAX_CALLBACK_ATTEMPTS = 3

/** The most origins an Organization may allow to submit its Inquiry form or Chat. */
export const MAX_ALLOWED_ORIGINS = 20

/**
 * A web origin: scheme, host and optional port, with no path, query or wildcard. `https` only,
 * except `http://localhost` and `http://127.0.0.1` for development. It is what a browser sends in
 * the `Origin` header.
 */
export const allowedOriginSchema = z
  .string()
  .max(255)
  .regex(
    /^(https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*(:[0-9]{1,5})?|http:\/\/(localhost|127\.0\.0\.1)(:[0-9]{1,5})?)$/
  )

/** A web origin. */
export type AllowedOrigin = z.infer<typeof allowedOriginSchema>

/**
 * The publishable key of an Organization's Inquiry form and Chat: 32 to 64 URL-safe characters. It
 * is shown in the Organization's web pages, so it is not a secret in itself; what it opens is
 * limited to the allowed origins, and it can be rotated. Services still redact it from logs.
 */
export const inquiryKeySchema = z.string().regex(/^[A-Za-z0-9_-]{32,64}$/)

/** The longest URL of the page a form or Chat was used on, in characters. */
export const MAX_SOURCE_URL_LENGTH = 2048

/** The address of the page a Prospect submitted the form on, or opened the Chat on: an `http(s)` URL with no whitespace. Evidence for the Contact Consent. */
export const sourceUrlSchema = z
  .string()
  .max(MAX_SOURCE_URL_LENGTH)
  .regex(/^https?:\/\/[^\s]+$/)

/** The longest message a Prospect may leave with a form Inquiry, in characters. */
export const MAX_INQUIRY_MESSAGE_LENGTH = 2000

/** The message a Prospect leaves with a form Inquiry: bounded text with no control character, untrusted. */
export const inquiryMessageSchema = boundedTextSchema(MAX_INQUIRY_MESSAGE_LENGTH)

/** The longest honeypot value a public form may send. */
export const MAX_HONEYPOT_LENGTH = 200
