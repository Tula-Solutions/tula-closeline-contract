import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute, PUBLIC_ERRORS } from '../inbound-route'
import type { Role } from '../tenancy'
import type { MailErrorCode } from './errors'

/** Every role: each works the Mailboxes they may see. */
export const MAIL_ALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The roles that manage the Organization's mail setup. */
export const MAIL_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The roles that review sends, events and capacity. */
export const MAIL_REVIEW_ROLES = ['owner', 'admin', 'manager'] as const satisfies readonly Role[]

/** The mail routes, by name. */
export type MailRouteName =
  | 'listMailboxes'
  | 'getMailbox'
  | 'startMailboxConnect'
  | 'completeMailboxConnect'
  | 'disconnectMailbox'
  | 'setMailboxLimits'
  | 'pauseMailbox'
  | 'testSendMailbox'
  | 'resumeMailbox'
  | 'getMailboxHealth'
  | 'listMailboxHealthHistory'
  | 'getMailboxDomainCheck'
  | 'checkMailboxDomain'
  | 'getOrganizationMailLimits'
  | 'setOrganizationMailLimits'
  | 'getMailCapacity'
  | 'listSends'
  | 'getSend'
  | 'listMailEvents'
  | 'submitSend'
  | 'receiveGmailNotification'
  | 'receiveGraphNotification'
  | 'getUnsubscribePage'
  | 'confirmUnsubscribe'

/** One mail route. */
export type MailRoute = InboundRoute<MailErrorCode>

const VISIBILITY =
  "An Owner or Admin sees every Mailbox; a Manager sees those of the Reps on their Team and the shared ones opened to it; a Rep sees only their own and the shared ones opened to their Team. A Mailbox or send record outside the caller's view is mailbox.not_found or send.not_found (404), never 403, and one of another Organization the same."

const SECRETS =
  'No response, event, log line or error report carries a token, refresh token, authorization code, client secret or key of a Mailbox, and no message body or subject.'

const NO_TRACKING =
  'Closeline puts no open or click tracking in any message; nothing here reports opens or clicks.'

/**
 * The mail routes (spec M08). Outbound owns them. The `/internal` route uses the shared secret;
 * the webhooks and the unsubscribe routes are public and carry no user token. Lists are
 * cursor-paginated with a page of at most 100. A route that sends or changes a Mailbox needs an
 * Idempotency-Key header.
 */
export const MAIL_ROUTES: Readonly<Record<MailRouteName, MailRoute>> = Object.freeze({
  listMailboxes: inboundRoute({
    method: 'GET',
    path: '/v1/mailboxes',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists Mailboxes, oldest connection first, one cursor-paginated page at a time (at most 100), optionally narrowed by state, provider, kind and owner. Each shows its owner, state and reason, the limits set, the limits that apply now after the ramp and its health, the ramp, and a health summary. A filter never widens what the caller may see. ${SECRETS} ${VISIBILITY}`,
  }),
  getMailbox: inboundRoute({
    method: 'GET',
    path: '/v1/mailboxes/{mailboxId}',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['mailbox.not_found'],
    commonErrors: [],
    description: `Reads one Mailbox with its owner, state, limits, ramp and health summary. ${SECRETS} ${VISIBILITY}`,
  }),
  startMailboxConnect: inboundRoute({
    method: 'POST',
    path: '/v1/mailboxes/connect',
    roles: MAIL_ALL_ROLES,
    success: [201],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS, 'server.unavailable'],
    description: `Starts connecting a Mailbox through Gmail or Outlook: answers the provider's consent URL and when the attempt expires. Requires an Idempotency-Key header: a replay answers the same URL. Any role may connect a personal Mailbox; a shared one (with the Teams that may use it) is Owner and Admin only, and any other role is auth.forbidden. Scopes are the least needed to send and read replies. ${SECRETS}`,
  }),
  completeMailboxConnect: inboundRoute({
    method: 'POST',
    path: '/v1/mailboxes/connect/complete',
    roles: MAIL_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ['mailbox.oauth_state_invalid', 'mailbox.already_connected'],
    commonErrors: [...IDEMPOTENT_ERRORS, 'server.unavailable', 'server.timeout'],
    description: `Completes a connection after the provider sent the person back, with the state of the attempt and the authorization code. The code is exchanged for tokens, which are encrypted at rest and never returned; the Mailbox starts in the warming state on the published ramp with default limits at or below the Organization's ceiling. Requires an Idempotency-Key header: a replay answers the same Mailbox with 200. An unknown, expired, used or foreign attempt is mailbox.oauth_state_invalid (400); an address already connected is mailbox.already_connected (409). A provider that does not answer in time is server.unavailable or server.timeout and nothing is stored. ${SECRETS}`,
  }),
  disconnectMailbox: inboundRoute({
    method: 'DELETE',
    path: '/v1/mailboxes/{mailboxId}',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['mailbox.not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Disconnects a Mailbox: its tokens are deleted at once, the grant is revoked where the provider allows, the state becomes disconnected and mailbox.state_changed is published. History (sends, events, health) stays. Requires an Idempotency-Key header; disconnecting one already disconnected answers 200 and publishes nothing again. The owner may disconnect their own; an Admin or Owner any. A Manager or another Rep who can see it but does not own it is auth.forbidden. ${SECRETS} ${VISIBILITY}`,
  }),
  setMailboxLimits: inboundRoute({
    method: 'PUT',
    path: '/v1/mailboxes/{mailboxId}/limits',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: true,
    errors: ['mailbox.not_found', 'mailbox.limit_above_ceiling', 'mailbox.not_connected'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Replaces the limits of a Mailbox: sends per day and per hour, the least gap between sends and the send window. A repeat with the same body changes nothing, so a retry is safe. A value above the Organization's ceiling, or a gap below its floor, is mailbox.limit_above_ceiling (422); a disconnected Mailbox is mailbox.not_connected (409). The ramp and the health score can only lower what applies, never raise it. The owner may set their own (within the ceiling, which they cannot change); an Admin or Owner any. ${VISIBILITY}`,
  }),
  pauseMailbox: inboundRoute({
    method: 'POST',
    path: '/v1/mailboxes/{mailboxId}/pause',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['mailbox.not_found', 'mailbox.not_connected'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Pauses a Mailbox: nothing more is sent from it and mailbox.state_changed is published with the reason owner_paused or admin_paused. Requires an Idempotency-Key header; pausing one already paused answers 200 and publishes nothing again. A disconnected Mailbox is mailbox.not_connected (409). The owner or an Admin or Owner may pause it. ${VISIBILITY}`,
  }),
  resumeMailbox: inboundRoute({
    method: 'POST',
    path: '/v1/mailboxes/{mailboxId}/resume',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['mailbox.not_found', 'mailbox.not_connected', 'mailbox.auth_revoked'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Resumes a paused Mailbox into the state its health allows (limited if its score is under the warning level), and publishes mailbox.state_changed. Requires an Idempotency-Key header. A Mailbox paused automatically for a complaint spike or a provider suspension may be resumed only by an Admin or Owner; the owner may resume one they paused. A disconnected Mailbox is mailbox.not_connected (409) and one whose grant was revoked is mailbox.auth_revoked (409): reconnect it instead. ${VISIBILITY}`,
  }),
  testSendMailbox: inboundRoute({
    method: 'POST',
    path: '/v1/mailboxes/{mailboxId}/test-send',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'mailbox.not_found',
      'mailbox.not_connected',
      'mailbox.paused',
      'mailbox.auth_revoked',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS, 'server.unavailable', 'server.timeout'],
    description: `Sends one fixed test message through a Mailbox to the address given, to prove the connection works. The text is fixed by the service: the body takes only the recipient and an optional short subject, so the route cannot send chosen content. It is not a Campaign send: no Prospect, Enrollment or send record is made, and it counts toward no limit. Requires an Idempotency-Key header: a replay answers the same result and sends nothing again. A disconnected Mailbox is mailbox.not_connected (409), a paused one mailbox.paused (409) and one whose grant was revoked mailbox.auth_revoked (409). A provider that does not answer in time is server.unavailable or server.timeout. The answer is the provider's message id and the time sent, never the text. The owner may test their own Mailbox; an Admin or Owner any. ${SECRETS} ${VISIBILITY}`,
  }),
  getMailboxHealth: inboundRoute({
    method: 'GET',
    path: '/v1/mailboxes/{mailboxId}/health',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['mailbox.not_found'],
    commonErrors: [],
    description: `Reads a Mailbox's health: a 0 to 100 score over the last 14 days with every component (hard bounce rate, complaint rate, soft bounce and error rate, reply rate, provider warnings), its measured value, its weight and its warning and critical thresholds, and what the score does now (nothing, the daily limit halved, or paused). Below the minimum sample the status is not_enough_data and the score null, never a number. ${NO_TRACKING} ${VISIBILITY}`,
  }),
  listMailboxHealthHistory: inboundRoute({
    method: 'GET',
    path: '/v1/mailboxes/{mailboxId}/health/history',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['mailbox.not_found'],
    commonErrors: ['request.invalid'],
    description: `Lists the stored daily health of a Mailbox, newest day first, one cursor-paginated page at a time (at most 100), each day with its score, counts and components, open for the Admin to audit. ${VISIBILITY}`,
  }),
  getMailboxDomainCheck: inboundRoute({
    method: 'GET',
    path: '/v1/mailboxes/{mailboxId}/domain-check',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['mailbox.not_found'],
    commonErrors: [],
    description: `Reads the latest check of the domain a Mailbox sends from: SPF, DKIM and DMARC, each with its status (pass, weak, fail, missing or unknown) and a plain explanation of what to fix. Before the first check the results are empty and checkedAt null. ${VISIBILITY}`,
  }),
  checkMailboxDomain: inboundRoute({
    method: 'POST',
    path: '/v1/mailboxes/{mailboxId}/domain-check',
    roles: MAIL_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['mailbox.not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS, 'rate.limited', 'server.unavailable', 'server.timeout'],
    description: `Checks the Mailbox's domain now through DNS and stores the result. Requires an Idempotency-Key header: a replay answers the same result without new lookups. Rate limited (rate.limited, 429, with a Retry-After header). A resolver that does not answer in time marks the record unknown, it does not fail the route. Owner and Admin only. ${VISIBILITY}`,
  }),
  getOrganizationMailLimits: inboundRoute({
    method: 'GET',
    path: '/v1/mail/limits',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description:
      "Reads the Organization's mail limits: the per-day and per-hour ceiling no Mailbox may be set above, the floor of the gap between sends, and the daily cap across every Mailbox of the Organization.",
  }),
  setOrganizationMailLimits: inboundRoute({
    method: 'PUT',
    path: '/v1/mail/limits',
    roles: MAIL_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      "Replaces the Organization's mail limits; a repeat with the same body changes nothing. Lowering a ceiling lowers the effective limit of any Mailbox above it at once, and the set limits stay as they were. Owner and Admin only.",
  }),
  getMailCapacity: inboundRoute({
    method: 'GET',
    path: '/v1/mail/capacity',
    roles: MAIL_REVIEW_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Reads what can still be sent for a launch check, one cursor-paginated page of Mailboxes at a time (at most 100), with the Organization's remaining daily cap on every page: for each Mailbox the caller may see, whether it is usable and what remains today and this hour after the ramp and its health, and what remains of the Organization's daily cap. Owner and Admin see every Mailbox, a Manager those of their Team's Reps; a Rep is auth.forbidden. ${VISIBILITY}`,
  }),
  listSends: inboundRoute({
    method: 'GET',
    path: '/v1/mail/sends',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists send records, newest first, one cursor-paginated page at a time (at most 100), optionally narrowed by Campaign, Prospect, Mailbox, state, reason and time range. Each says what each check decided and the reason a send was refused or deferred, so "why was this not sent" has an answer. A record holds no message body, subject or address. ${VISIBILITY}`,
  }),
  getSend: inboundRoute({
    method: 'GET',
    path: '/v1/mail/sends/{sendId}',
    roles: MAIL_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['send.not_found'],
    commonErrors: [],
    description: `Reads one send record: the Step and Enrollment, the Mailbox chosen, the result of every check in order, the state and the reason for a refusal or deferral. ${VISIBILITY}`,
  }),
  listMailEvents: inboundRoute({
    method: 'GET',
    path: '/v1/mail/events',
    roles: MAIL_REVIEW_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists mail events (hard and soft bounces, complaints, replies, out-of-office notices, unsubscribes), newest first, one cursor-paginated page at a time (at most 100), optionally narrowed by Mailbox, kind, Prospect and time range. An event holds no body, subject or address. Owner and Admin see all; a Manager sees those of Mailboxes of their Team's Reps; a Rep is auth.forbidden. ${NO_TRACKING}`,
  }),
  submitSend: inboundRoute({
    method: 'POST',
    path: '/internal/mail/sends',
    roles: [],
    internal: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'send.suppressed',
      'send.no_consent',
      'send.unverified_address',
      'send.outside_window',
      'send.duplicate',
      'send.campaign_not_running',
      'send.organization_cap_reached',
      'mailbox.not_connected',
      'mailbox.paused',
      'mailbox.limit_reached',
      'mailbox.auth_revoked',
    ],
    commonErrors: [
      'request.invalid',
      'request.idempotency_key_reused',
      'request.idempotency_in_progress',
      'auth.unauthenticated',
      'server.unavailable',
      'server.timeout',
    ],
    description: `Internal: the sequence engine asks for one Step to be sent, with the shared secret (ADR 0013); no user token. The Organization is derived from the Enrollment, never taken from the body. The Idempotency-Key header is required and is the send key (Enrollment, Step and attempt epoch, as enr_…:step:epoch); a replay answers 200 with the same record and sends nothing again. Before the transport is called the checks run in this order: the Campaign is running, the send window, the address is verified (or the body accepts an unverified one), core's decision on suppression and consent, the Mailbox is usable, its limits (day, hour, gap), the Organization's daily cap and the key. Every refusal is recorded with its reason and answers its error: send.campaign_not_running, send.outside_window (deferred), send.unverified_address, send.suppressed, send.no_consent, mailbox.not_connected, mailbox.paused, mailbox.auth_revoked, mailbox.limit_reached (deferred, with retryAfter in details), send.organization_cap_reached (deferred) or send.duplicate; the transport saw no call. No setting turns the suppression or consent check off. An Enrollment keeps the Mailbox of its thread; a new one is chosen fairly among the permitted Mailboxes within their limits. Each message carries a one-click unsubscribe header and a visible link. ${NO_TRACKING} ${SECRETS}`,
  }),
  receiveGmailNotification: inboundRoute({
    method: 'POST',
    path: '/v1/public/mail/webhooks/gmail',
    roles: [],
    public: true,
    success: [204],
    idempotent: true,
    errors: [],
    commonErrors: [...PUBLIC_ERRORS, 'auth.unauthenticated'],
    description:
      "Public: Gmail's push notification, with no user token. The request is authenticated by the provider's signed token, which is verified and replay-limited; anything else is auth.unauthenticated (401) and nothing is read. A notification says only that a Mailbox changed: outbound then reads the changes by history cursor, and processing is idempotent on the provider message id, so a replayed notification changes nothing. A missed notification is covered by polling. Message bodies are fetched only for replies and never logged.",
  }),
  receiveGraphNotification: inboundRoute({
    method: 'POST',
    path: '/v1/public/mail/webhooks/graph',
    roles: [],
    public: true,
    success: [202, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...PUBLIC_ERRORS, 'auth.unauthenticated'],
    description:
      "Public: Microsoft Graph's change notification, with no user token. A subscription validation (the validationToken query parameter) is answered 200 with that token as plain text; a notification is verified against the subscription's client state, replay-limited and answered 202, and anything else is auth.unauthenticated (401). Processing is idempotent on the provider message id, so a replayed notification changes nothing, and polling covers a missed one. Message bodies are fetched only for replies and never logged.",
  }),
  getUnsubscribePage: inboundRoute({
    method: 'GET',
    path: '/v1/public/mail/unsubscribe/{token}',
    roles: [],
    public: true,
    success: [200],
    idempotent: false,
    errors: ['unsubscribe.invalid_token'],
    commonErrors: [...PUBLIC_ERRORS],
    description:
      'Public: no session, no token header; the signed, expiring token in the path is the only credential. Returns what the unsubscribe page shows: the name of the Organization that sent the message and nothing else. It never shows an address, and it is the same for an address already suppressed. A tampered, expired or unknown token is unsubscribe.invalid_token (400), without saying which. Rate-limited by client address (rate.limited, 429, with a Retry-After header). The token is a credential: services redact it from logs, traces and error reports.',
  }),
  confirmUnsubscribe: inboundRoute({
    method: 'POST',
    path: '/v1/public/mail/unsubscribe/{token}',
    roles: [],
    public: true,
    success: [200],
    idempotent: true,
    errors: ['unsubscribe.invalid_token'],
    commonErrors: [...PUBLIC_ERRORS],
    description:
      "Public: unsubscribes the address behind the token, both for the page's button and for the one-click POST a mail client sends from the List-Unsubscribe header (RFC 8058, the form field List-Unsubscribe=One-Click); a mail client sends no Idempotency-Key, so a replay is safe by design and answers the same result. It works without a session: the Organization is resolved from the token. The address is suppressed Organization-wide at once, core is told to suppress it and withdraw email consent, the Sequence stops, and mail.unsubscribed is published. The answer is the same for an address already suppressed and for one that is unknown, so nothing about whether an address exists is revealed. A tampered, expired or unknown token is unsubscribe.invalid_token (400), without saying which. Rate-limited by client address (rate.limited, 429, with a Retry-After header). The token is a credential: services redact it from logs, traces and error reports.",
  }),
})
