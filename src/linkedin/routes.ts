import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute } from '../inbound-route'
import type { Role } from '../tenancy'
import type { LinkedinErrorCode } from './errors'

/** The role that connects a LinkedIn account: a Rep, for their own. An Admin cannot connect for a Rep. */
export const LINKEDIN_CONNECT_ROLES = ['rep'] as const satisfies readonly Role[]

/** The roles that read accounts, the risk statement and usage, each within their view. */
export const LINKEDIN_READ_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The roles that manage the channel: accept or revoke the risk, flip the switch, lower limits, remove a leaver's account. */
export const LINKEDIN_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The LinkedIn route names. */
export type LinkedinRouteName =
  | 'startConnection'
  | 'listAccounts'
  | 'getAccount'
  | 'disconnectAccount'
  | 'updateAccountLimits'
  | 'getRiskStatement'
  | 'acceptRisk'
  | 'revokeRiskAcceptance'
  | 'listRiskAcceptances'
  | 'getSettings'
  | 'updateSettings'
  | 'listUsage'

/** One LinkedIn route. */
export type LinkedinRoute = InboundRoute<LinkedinErrorCode>

const SCOPE =
  "Rows are scoped by role: a Rep sees only their own account, a Manager the accounts of Reps on their own Team, an Admin and an Owner all of the Organization's. A second Organization sees nothing of the first. A row outside the caller's view is request.not_found (404), never 403."

const LIMITS =
  'Limits are whole numbers from 0 up to the system ceilings (20 connection requests and 40 messages a day, 80 connection requests a week); a limit above its ceiling is linkedin.limit_above_ceiling (422). An Organization can only lower them.'

/**
 * The LinkedIn routes (spec M11, ADR 0004). The outbound service owns them. The provider webhook
 * is not here: outbound owns it. No response carries the provider's account reference, a
 * credential, Message text or profile data.
 */
export const LINKEDIN_ROUTES: Readonly<Record<LinkedinRouteName, LinkedinRoute>> = Object.freeze({
  startConnection: inboundRoute({
    method: 'POST',
    path: '/v1/linkedin/accounts/connection',
    roles: LINKEDIN_CONNECT_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['linkedin.channel_disabled', 'linkedin.risk_not_accepted'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      "Starts connecting the calling Rep's own LinkedIn account and returns the provider's hosted login URL and when it expires; the Rep signs in there and Closeline never sees the password. Rep only: an Owner, Admin or Manager is auth.forbidden, because every account belongs to its person. One account per Rep; a retry with the same Idempotency-Key returns the same login. Needs the channel switched on (linkedin.channel_disabled, 409) and a risk acceptance of the current wording (linkedin.risk_not_accepted, 409).",
  }),
  listAccounts: inboundRoute({
    method: 'GET',
    path: '/v1/linkedin/accounts',
    roles: LINKEDIN_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists LinkedIn accounts with their status, pause reason and limits, one cursor-paginated page at a time (limit, cursor; at most 100). The provider's account reference is never returned. ${SCOPE}`,
  }),
  getAccount: inboundRoute({
    method: 'GET',
    path: '/v1/linkedin/accounts/{accountId}',
    roles: LINKEDIN_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid', 'request.not_found'],
    description: `Reads one LinkedIn account with its status, pause reason and limits. ${SCOPE}`,
  }),
  disconnectAccount: inboundRoute({
    method: 'DELETE',
    path: '/v1/linkedin/accounts/{accountId}',
    roles: LINKEDIN_READ_ROLES,
    success: [204],
    idempotent: true,
    errors: ['linkedin.not_account_owner'],
    commonErrors: ['request.invalid', 'request.not_found'],
    description:
      "Disconnects a LinkedIn account so nothing sends in its name. The owning Rep may disconnect their own at any time; an Owner or Admin may remove a leaver's account. Any other Rep is linkedin.not_account_owner (403) for an account they can see; a Manager may not disconnect. An account of another Organization is request.not_found (404), never 403. Disconnecting a disconnected account is a no-op.",
  }),
  updateAccountLimits: inboundRoute({
    method: 'PATCH',
    path: '/v1/linkedin/accounts/{accountId}/limits',
    roles: LINKEDIN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ['linkedin.limit_above_ceiling'],
    commonErrors: [...IDEMPOTENT_ERRORS, 'request.not_found'],
    description: `Lowers the limits of one account. Owner and Admin only. ${LIMITS} An account of another Organization is request.not_found (404), never 403.`,
  }),
  getRiskStatement: inboundRoute({
    method: 'GET',
    path: '/v1/linkedin/risk-statement',
    roles: LINKEDIN_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description:
      'Reads the current LinkedIn risk statement and its wording version. Every role reads it, so a Rep sees the risk before connecting and an Admin before accepting. The text is the same for every Organization.',
  }),
  acceptRisk: inboundRoute({
    method: 'POST',
    path: '/v1/linkedin/risk-acceptance',
    roles: LINKEDIN_ADMIN_ROLES,
    success: [201],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      "Records the Organization's written acceptance of the LinkedIn risk: the wording version (it must be the current one, else request.invalid) and the Admin's typed full name. Owner and Admin only. The acceptance is tied to that version; a changed wording needs a new one. Accepting again while an acceptance of the current version is active returns it unchanged.",
  }),
  revokeRiskAcceptance: inboundRoute({
    method: 'DELETE',
    path: '/v1/linkedin/risk-acceptance',
    roles: LINKEDIN_ADMIN_ROLES,
    success: [204],
    idempotent: true,
    errors: [],
    commonErrors: [],
    description:
      'Revokes the active risk acceptance. Every LinkedIn send stops at once, with linkedin.risk_not_accepted for anything still queued; email and other channels keep running. Owner and Admin only. Revoking with no active acceptance is a no-op.',
  }),
  listRiskAcceptances: inboundRoute({
    method: 'GET',
    path: '/v1/linkedin/risk-acceptances',
    roles: LINKEDIN_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      "Lists the Organization's risk acceptances, newest first, with who accepted, the typed name, the wording version and any revocation. One cursor-paginated page at a time (limit, cursor; at most 100). Owner and Admin only; a second Organization sees nothing of the first.",
  }),
  getSettings: inboundRoute({
    method: 'GET',
    path: '/v1/linkedin/settings',
    roles: LINKEDIN_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description:
      'Reads the channel settings: the Admin switch, the current wording version, the active risk acceptance and effectivelyEnabled, which is true only with the switch on and a non-revoked acceptance of the current wording. Every role reads it, so the sequence builder shows LinkedIn steps only while the channel is enabled. Scoped to the Organization in the token.',
  }),
  updateSettings: inboundRoute({
    method: 'PATCH',
    path: '/v1/linkedin/settings',
    roles: LINKEDIN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ['linkedin.risk_not_accepted'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Turns the LinkedIn channel on or off with the one Admin switch (enabled). Owner and Admin only. Switching off stops all LinkedIn sends and leaves other channels running. Switching on without an active risk acceptance of the current wording is linkedin.risk_not_accepted (409). There is no setting for consent, suppression or the limit guards.',
  }),
  listUsage: inboundRoute({
    method: 'GET',
    path: '/v1/linkedin/usage',
    roles: LINKEDIN_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists each account's use on one day (default today) against its limits: connection requests and messages sent and the week's connection requests. One cursor-paginated page at a time (limit, cursor; at most 100). ${SCOPE}`,
  }),
})
