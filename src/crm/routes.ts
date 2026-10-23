import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute, PUBLIC_ERRORS } from '../inbound-route'
import type { Role } from '../tenancy'
import type { CrmErrorCode } from './errors'
import {
  CRM_WEBHOOK_WINDOW_SECONDS,
  MAX_CRM_PREVIEW_COUNT,
  MAX_CRM_WEBHOOK_BODY_BYTES,
  MAX_CRM_WEBHOOK_NOTICES,
} from './values'

/** The roles that connect, disconnect, map stages, set field directions and run a sync. */
export const CRM_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The roles that read the connection status, stages and run history. A Rep has no CRM screen. */
export const CRM_READ_ROLES = ['owner', 'admin', 'manager'] as const satisfies readonly Role[]

/** The CRM route names. */
export type CrmRouteName =
  | 'listCrmConnections'
  | 'getCrmConnection'
  | 'startCrmAuthorisation'
  | 'crmOAuthCallback'
  | 'disconnectCrm'
  | 'getCrmFieldDirections'
  | 'setCrmFieldDirections'
  | 'getCrmStageMapping'
  | 'setCrmStageMapping'
  | 'listCrmStages'
  | 'previewCrmSync'
  | 'startCrmSync'
  | 'listCrmSyncRuns'
  | 'getCrmSyncRun'
  | 'retryCrmSyncRun'
  | 'crmWebhook'

/** One CRM route. */
export type CrmRoute = InboundRoute<CrmErrorCode>

const KEY =
  'Requires an Idempotency-Key header: a replay answers the same result and does the work once.'

const NO_TOKEN =
  'No token, client secret or authorisation state is ever returned, logged or sent to the error tracker.'

const PAGE = 'one cursor-paginated page at a time (at most 100)'

const ORG_ONLY =
  "A connection belongs to the caller's Organization alone; another Organization's data is never read, and an unknown id is request.not_found (404), never 403."

/**
 * The CRM routes (spec M4, ADR 0022). Core owns the connection; the provider is a path parameter
 * from the closed list in `CRM_PROVIDERS`. Owner and Admin change things; a Manager may read; a Rep
 * has no access. Sync work always runs on a queue, never on a request.
 */
export const CRM_ROUTES: Readonly<Record<CrmRouteName, CrmRoute>> = Object.freeze({
  listCrmConnections: inboundRoute({
    method: 'GET',
    path: '/v1/crm/connections',
    roles: CRM_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists the Organization's CRM connections (at most one per provider), ${PAGE}, by cursor and limit. ${NO_TOKEN} Owner, Admin and Manager. ${ORG_ONLY}`,
  }),
  getCrmConnection: inboundRoute({
    method: 'GET',
    path: '/v1/crm/connections/{provider}',
    roles: CRM_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Reads the status of one provider for the Organization: not_connected (the default, answered as a state, not an error), connected, or needs_reconnect when the CRM revoked or expired the grant (shown, never silent). It carries the account label, the scope level, when it last synced and, when it needs reconnecting, since when. No token is returned. ${NO_TOKEN} Owner, Admin and Manager. ${ORG_ONLY}`,
  }),
  startCrmAuthorisation: inboundRoute({
    method: 'POST',
    path: '/v1/crm/connections/{provider}/authorisations',
    roles: CRM_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ['crm.authorisation_failed'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Starts the authorisation-code flow and answers the CRM's sign-in address with a signed, expiring, single-use state bound to the calling Admin and Organization. Only the minimum read scopes are asked for; write scopes are asked for only when the body sets writeBack. The redirect address is core's own and is never taken from the request. A provider that is not configured is crm.authorisation_failed. ${KEY} The same key answers the same address. Connecting again while connected, or after needs_reconnect, replaces the grant. Owner and Admin only.`,
  }),
  crmOAuthCallback: inboundRoute({
    method: 'GET',
    path: '/v1/public/crm/{provider}/callback',
    roles: [],
    public: true,
    success: [302],
    idempotent: false,
    errors: ['crm.authorisation_failed'],
    commonErrors: [...PUBLIC_ERRORS],
    description:
      "Public: the browser returns here from the CRM's sign-in; the signed state stands in for a token. Core checks the state in constant time (signature, expiry, single use, the Organization and Admin it was made for), exchanges the code, stores the tokens encrypted and answers 302 to the portal's Integrations screen. When the Admin denied consent, the redirect carries the closed word crm.authorisation_failed. A state that is tampered with, expired, reused or made for another Organization is crm.authorisation_failed (400) with one generic message that names no Organization; so is a CRM account another Organization already holds. Unknown query parameters are ignored. No token or code is logged.",
  }),
  disconnectCrm: inboundRoute({
    method: 'DELETE',
    path: '/v1/crm/connections/{provider}',
    roles: CRM_ADMIN_ROLES,
    success: [204],
    idempotent: true,
    keyRequired: true,
    errors: ['crm.not_connected'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Disconnects the CRM: the stored tokens are deleted at once and the grant is revoked at the CRM where it can be, queued runs stop and crm.disconnected is published. Deals, Calls, Prospects and values already imported stay. A provider with no connection is crm.not_connected (404). ${KEY} Owner and Admin only. ${ORG_ONLY}`,
  }),
  getCrmFieldDirections: inboundRoute({
    method: 'GET',
    path: '/v1/crm/connections/{provider}/field-directions',
    roles: CRM_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ['crm.not_connected'],
    commonErrors: ['request.invalid'],
    description: `Reads the direction of every field that can sync: read_only (CRM to Closeline, the default), write_only or both. Every field in CRM_FIELD_KEYS appears once. Owner, Admin and Manager. ${ORG_ONLY}`,
  }),
  setCrmFieldDirections: inboundRoute({
    method: 'PUT',
    path: '/v1/crm/connections/{provider}/field-directions',
    roles: CRM_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['crm.not_connected', 'crm.needs_reconnect'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Changes the direction of the fields named; the others stay. Each field once. Switching on any write direction asks the CRM for write scopes, and while the grant lacks them a field cannot be write_only or both: the Admin reconnects with writeBack first (crm.needs_reconnect, 409). A write-back changes a CRM field only when the field's current value is a Closeline value; consent evidence, Suppression, Recordings, Transcripts and message bodies are never written to a CRM whatever the setting. ${KEY} Owner and Admin only. ${ORG_ONLY}`,
  }),
  getCrmStageMapping: inboundRoute({
    method: 'GET',
    path: '/v1/crm/connections/{provider}/stage-mapping',
    roles: CRM_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ['crm.not_connected'],
    commonErrors: ['request.invalid'],
    description: `Reads the Stage mapping: which CRM deal stages mean won, lost or open, and whether an Owner or Admin confirmed it, by whom and when. Until it is confirmed no Deal is imported (crm.mapping_incomplete). Owner, Admin and Manager. ${ORG_ONLY}`,
  }),
  setCrmStageMapping: inboundRoute({
    method: 'PUT',
    path: '/v1/crm/connections/{provider}/stage-mapping',
    roles: CRM_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['crm.not_connected', 'crm.needs_reconnect'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Replaces the Stage mapping with the list sent (1 to 500 stages, each once); saving it is the Admin's confirmation, recorded with who and when. A stage the CRM later adds is unmapped until the Admin maps it. ${KEY} Owner and Admin only. ${ORG_ONLY}`,
  }),
  listCrmStages: inboundRoute({
    method: 'GET',
    path: '/v1/crm/connections/{provider}/stages',
    roles: CRM_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['crm.not_connected', 'crm.needs_reconnect', 'crm.rate_limited'],
    commonErrors: ['request.invalid'],
    description: `Lists the CRM's deal stages for the Admin to map, ${PAGE}, by cursor and limit, read live from the CRM with a timeout. Labels come from the CRM and are untrusted text. When the CRM limits requests the answer is crm.rate_limited (429) with Retry-After. Owner and Admin only. ${ORG_ONLY}`,
  }),
  previewCrmSync: inboundRoute({
    method: 'POST',
    path: '/v1/crm/connections/{provider}/sync-previews',
    roles: CRM_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [
      'crm.not_connected',
      'crm.needs_reconnect',
      'crm.rate_limited',
      'crm.mapping_incomplete',
      'crm.rights_not_confirmed',
    ],
    commonErrors: ['request.invalid'],
    description: `Counts what a first load of one kind of object would do, with nothing written and no run recorded: the total and the records that would be skipped, by reason. Deals need a confirmed Stage mapping (crm.mapping_incomplete) and Calls need the rights confirmation (crm.rights_not_confirmed) before the CRM is asked. The count stops at ${MAX_CRM_PREVIEW_COUNT} and truncated says so; the CRM call has a timeout. It has no effect, so it takes no Idempotency-Key. Owner and Admin only. ${ORG_ONLY}`,
  }),
  startCrmSync: inboundRoute({
    method: 'POST',
    path: '/v1/crm/connections/{provider}/sync-runs',
    roles: CRM_ADMIN_ROLES,
    success: [202, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'crm.not_connected',
      'crm.needs_reconnect',
      'crm.mapping_incomplete',
      'crm.rights_not_confirmed',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Queues a run for one kind of object and answers 202 with the run in state queued; no CRM page is pulled on the request. The first run is a first load, later ones pull what changed after the stored cursor, which advances only after a page is committed. Deals need a confirmed Stage mapping (crm.mapping_incomplete) and Calls need the rights confirmation (crm.rights_not_confirmed), checked before anything is queued. A connection that needs reconnecting is crm.needs_reconnect. A run that hits the CRM's rate limit backs off and resumes, so crm.rate_limited is shown on the run, not returned here. ${KEY} The same key answers 200 with the same run. Owner and Admin only. ${ORG_ONLY}`,
  }),
  listCrmSyncRuns: inboundRoute({
    method: 'GET',
    path: '/v1/crm/connections/{provider}/sync-runs',
    roles: CRM_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ['crm.not_connected'],
    commonErrors: ['request.invalid'],
    description: `Lists the run history, newest first, ${PAGE}, by cursor and limit, optionally narrowed by state or object kind. Each run shows counts, the skipped reasons and fields, up to 50 failed records and its end code; never the CRM cursor or any CRM payload. Owner, Admin and Manager. ${ORG_ONLY}`,
  }),
  getCrmSyncRun: inboundRoute({
    method: 'GET',
    path: '/v1/crm/connections/{provider}/sync-runs/{runId}',
    roles: CRM_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ['crm.not_connected'],
    commonErrors: ['request.invalid', 'request.not_found'],
    description: `Reads one run and its report. Poll it, or wait for crm.run_completed. A run of another Organization, or of another provider, is request.not_found (404). Owner, Admin and Manager. ${ORG_ONLY}`,
  }),
  retryCrmSyncRun: inboundRoute({
    method: 'POST',
    path: '/v1/crm/connections/{provider}/sync-runs/{runId}/retries',
    roles: CRM_ADMIN_ROLES,
    success: [202, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'crm.not_connected',
      'crm.needs_reconnect',
      'crm.mapping_incomplete',
      'crm.rights_not_confirmed',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS, 'request.not_found', 'request.conflict'],
    description: `Queues a new run of the same object kind for a failed run, linked to it (retryOfRunId), and answers 202. A run that did not fail is request.conflict (409). The same checks as startCrmSync apply. ${KEY} The same key answers 200 with the same run. Owner and Admin only. ${ORG_ONLY}`,
  }),
  crmWebhook: inboundRoute({
    method: 'POST',
    path: '/v1/public/crm/{provider}/webhooks',
    roles: [],
    public: true,
    success: [202],
    idempotent: true,
    errors: [],
    commonErrors: ['auth.unauthenticated', ...PUBLIC_ERRORS],
    description: `Public: the CRM calls it; the provider's signature stands in for a token. Core verifies the signature over the raw body in constant time, refuses a delivery whose timestamp is more than ${CRM_WEBHOOK_WINDOW_SECONDS} seconds from now, and refuses a replay (recorded as a receipt, kept for the window plus a margin); each of those is auth.unauthenticated (401) with no detail. The body is limited to ${MAX_CRM_WEBHOOK_BODY_BYTES} bytes (request.too_large) and at most ${MAX_CRM_WEBHOOK_NOTICES} notices. It only enqueues a targeted pull for the object each notice names and answers 202 at once with how many notices it received (the same whether or not an account matched); it never trusts the payload as data and does no sync work. A notice for an account that no connection holds is dropped and still answers 202, so the route reveals nothing about which accounts are connected. The periodic sweep covers a lost delivery. Redelivery is harmless.`,
  }),
})
