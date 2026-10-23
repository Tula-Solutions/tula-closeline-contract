import type { AgentErrorCode } from '../agent/errors'
import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute, PUBLIC_ERRORS } from '../inbound-route'
import type { Role } from '../tenancy'
import type { InquiryErrorCode } from './errors'

/** Every role: each reads the Inquiries they may see. */
export const INQUIRY_ALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The roles that set up the embed and its key. */
export const INQUIRY_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The roles that retry a callback. */
export const INQUIRY_MANAGER_ROLES = [
  'owner',
  'admin',
  'manager',
] as const satisfies readonly Role[]

/** The Inquiry routes, by name. */
export type InquiryRouteName =
  | 'publicGetInquiryForm'
  | 'publicSubmitInquiry'
  | 'getInquiryEmbed'
  | 'setInquiryEmbed'
  | 'rotateInquiryEmbedKey'
  | 'listInquiries'
  | 'getInquiry'
  | 'retryInquiryCallback'

/** One Inquiry route. */
export type InquiryRoute = InboundRoute<InquiryErrorCode | AgentErrorCode>

const VISIBILITY =
  "An Owner or Admin sees every Inquiry; a Manager sees those assigned to Reps of their Team; a Rep sees only those assigned to them. An Inquiry outside the caller's view is inquiry.not_found (404), never 403."

/**
 * The Inquiry routes (spec M14). The public routes take the Organization\'s publishable key in the
 * path and the browser\'s `Origin` header, and reveal no Rep or internal id. No route or body can
 * place a callback without a Contact Consent for the phone channel (ADR 0003).
 */
export const INQUIRY_ROUTES: Readonly<Record<InquiryRouteName, InquiryRoute>> = Object.freeze({
  publicGetInquiryForm: inboundRoute({
    method: 'GET',
    path: '/v1/public/inquiry/{key}/form',
    roles: [],
    public: true,
    success: [200],
    idempotent: false,
    errors: ['inquiry.origin_not_allowed', 'inquiry.key_invalid'],
    commonErrors: [...PUBLIC_ERRORS],
    description:
      "Public: no token, no Organization; the Organization's publishable key in the path stands in for both. Returns what the embedded Inquiry form displays: the Organization's name, the exact Consent Wording to show beside the callback box with its id and version (the form sends them back), and the notice that an AI will make the call. Nothing about any Prospect, Rep or internal id. The Origin header must be one of the Organization's allowed origins (inquiry.origin_not_allowed, 403); an unknown, rotated or not-yet-live key is inquiry.key_invalid (404). Rate-limited by client address and by key (rate.limited, 429, with a Retry-After header). The key is a secret-like identifier: services redact it from logs, traces and error reports.",
  }),
  publicSubmitInquiry: inboundRoute({
    method: 'POST',
    path: '/v1/public/inquiry/{key}/inquiries',
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'inquiry.origin_not_allowed',
      'inquiry.key_invalid',
      'inquiry.consent_wording_missing',
    ],
    commonErrors: [
      ...PUBLIC_ERRORS,
      'request.idempotency_key_reused',
      'request.idempotency_in_progress',
    ],
    description:
      "Public: no token, no Organization; the Organization's publishable key in the path stands in for both. A Prospect sends an Inquiry from the embedded form with their name, phone number, optional work email and message, the Consent Wording id and version the form displayed, whether they agreed to the callback, and the page address the form was on. The wording version and the page address are required: without them the body is request.invalid, and a version that is not the one the form displays is inquiry.consent_wording_missing (422), with nothing stored. The Origin header must be an allowed origin (inquiry.origin_not_allowed, 403). Requires an Idempotency-Key header (16 to 128 characters; the client generates one per submission): a replay answers the original receipt with 200 and stores one Inquiry and places one callback, the same key with another body is request.idempotency_key_reused, and the same key while the first request runs is request.idempotency_in_progress. Answers 201 with a receipt that says only that it arrived and whether a call is coming: no Inquiry, Prospect or Rep id. Core upserts the Prospect and records the Contact Consent for the phone channel from the wording version, the page address and the time; with the box unticked the Inquiry is stored and no call is placed. A filled honeypot (website) is answered exactly as a real request and stores nothing. Rate-limited by client address and by key (rate.limited, 429, with a Retry-After header). Publishes voice.inquiry.received. The key in the path is a secret-like identifier: services redact it from logs, traces and error reports.",
  }),
  getInquiryEmbed: inboundRoute({
    method: 'GET',
    path: '/v1/inquiry-embed',
    roles: INQUIRY_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description:
      "Reads the Organization's Inquiry form and Chat settings: the publishable key, the allowed origins and the Consent Wording the form displays. Owner and Admin only; any other role is auth.forbidden. The key is not a credential for anything but these public routes, and services redact it from logs.",
  }),
  setInquiryEmbed: inboundRoute({
    method: 'PUT',
    path: '/v1/inquiry-embed',
    roles: INQUIRY_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ['inquiry.embed_invalid'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Replaces the allowed origins (at most 20 exact web origins: https, or http on localhost; no path and no wildcard) and the Consent Wording the form displays; a repeat with the same body changes nothing, so a retry is safe. A wording that does not exist or does not cover the phone channel is inquiry.embed_invalid (422). Owner and Admin only.',
  }),
  rotateInquiryEmbedKey: inboundRoute({
    method: 'POST',
    path: '/v1/inquiry-embed/rotate-key',
    roles: INQUIRY_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Issues a new publishable key; the old one stops working at once (inquiry.key_invalid on the public routes), so every embed must be updated. Requires an Idempotency-Key header: a replay answers the same new key and rotates once. Owner and Admin only.',
  }),
  listInquiries: inboundRoute({
    method: 'GET',
    path: '/v1/inquiries',
    roles: INQUIRY_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists Inquiries, latest first, one cursor-paginated page at a time (at most 100), optionally narrowed by source (form, chat or call), callback state, Prospect and a time range. A filter never widens what the caller may see. Each Inquiry shows its callback state and, when no callback happened, the reason. ${VISIBILITY}`,
  }),
  getInquiry: inboundRoute({
    method: 'GET',
    path: '/v1/inquiries/{inquiryId}',
    roles: INQUIRY_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['inquiry.not_found'],
    commonErrors: [],
    description: `Reads one Inquiry with its Qualification answers, callback state, and the Contact Consent evidence it was based on. ${VISIBILITY}`,
  }),
  retryInquiryCallback: inboundRoute({
    method: 'POST',
    path: '/v1/inquiries/{inquiryId}/callback',
    roles: INQUIRY_MANAGER_ROLES,
    success: [202],
    idempotent: true,
    keyRequired: true,
    errors: [
      'inquiry.not_found',
      'inquiry.retries_exhausted',
      'agent.paused',
      'agent.consent_required',
      'agent.outside_hours',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Asks the Inbound Agent to place a callback again for an Inquiry whose callback was skipped or did not connect. It is queued, not dialled in the request, and every gate is checked again at dial time: a paused Agent is agent.paused (409), no Contact Consent for the phone channel (or one revoked) is agent.consent_required (409), and a time outside the calling hours is agent.outside_hours (409). Nothing can override those checks (ADR 0003). A callback that already has the maximum number of attempts (including after retries_exhausted) is inquiry.retries_exhausted (409) and nothing is queued, so a retry never pushes attempts past the maximum. Requires an Idempotency-Key header: a replay answers 202 without queueing a second callback. Owner, Admin, and a Manager for Inquiries assigned to Reps of their Team.',
  }),
})
