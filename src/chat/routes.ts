import type { AgentErrorCode } from '../agent/errors'
import { type InboundRoute, inboundRoute, PUBLIC_ERRORS } from '../inbound-route'
import type { Role } from '../tenancy'
import type { ChatErrorCode } from './errors'

/** Every role: each reads the Chats they may see. */
export const CHAT_ALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The Chat routes, by name. */
export type ChatRouteName =
  | 'publicStartChat'
  | 'publicSendChatMessage'
  | 'publicListChatMessages'
  | 'publicChatConsent'
  | 'publicRequestChatHandoff'
  | 'listChats'
  | 'getChat'
  | 'listChatMessages'

/** One Chat route. */
export type ChatRoute = InboundRoute<
  ChatErrorCode | Extract<AgentErrorCode, 'handoff.no_rep_available'>
>

const VISIBILITY =
  "An Owner or Admin sees every Chat; a Manager sees those handed to Reps of their Team; a Rep sees only those handed to them. A Chat outside the caller's view is chat.not_found (404), never 403."

const PUBLIC_SECRET =
  'The key or token in the path is a secret: services redact it from logs, traces and error reports. A 429 (rate.limited) carries a Retry-After header.'

const PUBLIC_REPLAY = ['request.idempotency_key_reused', 'request.idempotency_in_progress'] as const

/**
 * The Chat routes (spec M14). The public routes take no token: the publishable key starts a Chat
 * and the session token it returns carries it on, each with the browser's `Origin`. They reveal no
 * Rep or internal id and never a Playbook source.
 */
export const CHAT_ROUTES: Readonly<Record<ChatRouteName, ChatRoute>> = Object.freeze({
  publicStartChat: inboundRoute({
    method: 'POST',
    path: '/v1/public/chat/{key}/sessions',
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ['chat.origin_not_allowed', 'chat.key_invalid'],
    commonErrors: [...PUBLIC_ERRORS, ...PUBLIC_REPLAY],
    description: `Public: no token, no Organization; the Organization's publishable key in the path stands in for both. Starts a Chat from the website widget with the page address. The Origin header must be an allowed origin (chat.origin_not_allowed, 403). Requires an Idempotency-Key header (16 to 128 characters; the client generates one per Chat): a replay answers the original session with 200 and starts one Chat. Answers 201 with a secret session token, its expiry and the opening message, which says the visitor is talking to an AI. No Chat, Prospect or Rep id. A visitor-started Chat needs no Contact Consent; only a callback does. A filled honeypot (website) is answered like an accepted start but stores nothing: the session token it returns is an unusable session token, and any later call with it is chat.session_not_found. Rate-limited by client address and by key. ${PUBLIC_SECRET}`,
  }),
  publicSendChatMessage: inboundRoute({
    method: 'POST',
    path: '/v1/public/chat/sessions/{sessionToken}/messages',
    roles: [],
    public: true,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['chat.origin_not_allowed', 'chat.session_not_found', 'chat.session_closed'],
    commonErrors: [...PUBLIC_ERRORS, ...PUBLIC_REPLAY],
    description: `Public: no token, no Organization; the session token in the path stands in for both. The visitor says something and gets the Inbound Agent's reply: its text, whether it deferred to a follow-up and whether it offered a Rep. Never a Playbook source, a tool call, or a Rep or internal id. Requires an Idempotency-Key header: a replay answers the original reply and does not ask the model again; the same key with another body is request.idempotency_key_reused. An unknown or expired token is chat.session_not_found (404) and an ended Chat is chat.session_closed (409). The Origin header must match an allowed origin. Rate-limited by client address and by session. ${PUBLIC_SECRET}`,
  }),
  publicListChatMessages: inboundRoute({
    method: 'GET',
    path: '/v1/public/chat/sessions/{sessionToken}/messages',
    roles: [],
    public: true,
    success: [200],
    idempotent: false,
    errors: ['chat.origin_not_allowed', 'chat.session_not_found'],
    commonErrors: [...PUBLIC_ERRORS],
    description: `Public: no token, no Organization; the session token in the path stands in for both. Lists the messages of the visitor's own Chat, oldest first, one cursor-paginated page at a time (at most 100), so a reloaded page can show them again. Each is a role, text and time only. The Origin header must match an allowed origin. Rate-limited by client address and by session. ${PUBLIC_SECRET}`,
  }),
  publicChatConsent: inboundRoute({
    method: 'POST',
    path: '/v1/public/chat/sessions/{sessionToken}/callback-consent',
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'chat.origin_not_allowed',
      'chat.session_not_found',
      'chat.session_closed',
      'chat.consent_wording_missing',
    ],
    commonErrors: [...PUBLIC_ERRORS, ...PUBLIC_REPLAY],
    description: `Public: no token, no Organization; the session token in the path stands in for both. The visitor asks for a callback from inside the Chat with their name, phone number, the Consent Wording id and version shown, whether they agreed, and the page address. The wording version and page address are required; a version that is not the one shown is chat.consent_wording_missing (422) and nothing is recorded. Core upserts the Prospect, records the Contact Consent for the phone channel from the wording version, the page address and the time, and the Chat becomes an Inquiry; with the box unticked the details are kept and no call is placed. Requires an Idempotency-Key header: a replay answers the original receipt. Answers a receipt with no Inquiry, Prospect or Rep id. Publishes voice.inquiry.received. ${PUBLIC_SECRET}`,
  }),
  publicRequestChatHandoff: inboundRoute({
    method: 'POST',
    path: '/v1/public/chat/sessions/{sessionToken}/handoff',
    roles: [],
    public: true,
    success: [202, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'chat.origin_not_allowed',
      'chat.session_not_found',
      'chat.session_closed',
      'handoff.no_rep_available',
    ],
    commonErrors: [...PUBLIC_ERRORS, ...PUBLIC_REPLAY],
    description: `Public: no token, no Organization; the session token in the path stands in for both. The visitor asks to talk to a Rep. The Handoff is routed by the Organization's rules and answers 202 that a Rep was asked to join, with no Rep id or name. If no Rep is available it is handoff.no_rep_available (409) and the Inbound Agent offers a Booking in the Chat. Requires an Idempotency-Key header: a replay answers the original result and does not ask a second Rep. ${PUBLIC_SECRET}`,
  }),
  listChats: inboundRoute({
    method: 'GET',
    path: '/v1/chats',
    roles: CHAT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists Chats, latest first, one cursor-paginated page at a time (at most 100), optionally by state (open, handed_off or closed). ${VISIBILITY}`,
  }),
  getChat: inboundRoute({
    method: 'GET',
    path: '/v1/chats/{chatId}',
    roles: CHAT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['chat.not_found'],
    commonErrors: [],
    description: `Reads one Chat: its state, the page it began on and the Prospect and Inquiry it led to, if any. ${VISIBILITY}`,
  }),
  listChatMessages: inboundRoute({
    method: 'GET',
    path: '/v1/chats/{chatId}/messages',
    roles: CHAT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['chat.not_found'],
    commonErrors: ['request.invalid'],
    description: `Lists the messages of a Chat, oldest first, one cursor-paginated page at a time (at most 100), with the Playbook passages each Agent answer used. Message text is the visitor's own words and untrusted. ${VISIBILITY}`,
  }),
})
