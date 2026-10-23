import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute, PUBLIC_ERRORS } from '../inbound-route'
import type { Role } from '../tenancy'
import type { EnrichmentErrorCode } from './errors'

/** Every role: each enriches, reads signals and sees fit for the Prospects they may see. */
export const ENRICHMENT_ALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The roles that read spend and the provider setup. */
export const ENRICHMENT_READ_ROLES = [
  'owner',
  'admin',
  'manager',
] as const satisfies readonly Role[]

/** The roles that change providers, the budget, signal settings and fit criteria. */
export const ENRICHMENT_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The enrichment, signal and fit route names. */
export type EnrichmentRouteName =
  | 'createEnrichment'
  | 'getEnrichmentRunSet'
  | 'getEnrichmentRun'
  | 'listEnrichmentRuns'
  | 'getProspectEnrichment'
  | 'deleteProspectEnrichment'
  | 'listEnrichmentProviders'
  | 'setEnrichmentProvider'
  | 'getEnrichmentWaterfall'
  | 'setEnrichmentWaterfall'
  | 'getEnrichmentBudget'
  | 'setEnrichmentBudget'
  | 'listEnrichmentSpend'
  | 'recordSignalNote'
  | 'listProspectSignals'
  | 'getSignal'
  | 'getSignalSettings'
  | 'setSignalSettings'
  | 'rotateSignalWebhookSecret'
  | 'receiveSignalWebhook'
  | 'listFitCriteria'
  | 'createFitCriterion'
  | 'updateFitCriterion'
  | 'deleteFitCriterion'
  | 'getProspectFit'
  | 'listFitScores'

/** One enrichment, signal or fit route. */
export type EnrichmentRoute = InboundRoute<EnrichmentErrorCode>

const VISIBILITY =
  "An Owner or Admin sees every Prospect; a Manager those owned by Reps on their Team; a Rep only their own. A Prospect (enrichment.prospect_not_found) outside the caller's view is its not_found code (404), never 403, and one of another Organization the same."

const ORG_ONLY =
  "Everything here belongs to the caller's Organization alone: provider data bought by one Organization is never visible to another, and an id of another Organization is its not_found code (404), never 403."

const KEY =
  'Requires an Idempotency-Key header: a replay answers the same result and does the work once.'

const UNTRUSTED =
  'Provider, web and webhook text is untrusted data: validated, bounded, shown to people and never run as an instruction, and never put in a log or an event.'

const SECRETS =
  'A provider key is write-only: stored encrypted, never returned, logged or put in an error report.'

const PAGED = 'one cursor-paginated page at a time (at most 100)'

/**
 * The enrichment, signal and fit routes (spec M05): runs through the provider waterfall with
 * per-field provenance and cost, providers, order and budget, signals, and fit criteria and
 * scores. Outbound owns them. Lists are cursor-paginated with a page of at most 100. Every route
 * that changes something needs an Idempotency-Key header, except the public signed webhook, which
 * is made idempotent by its `eventId`.
 */
export const ENRICHMENT_ROUTES: Readonly<Record<EnrichmentRouteName, EnrichmentRoute>> =
  Object.freeze({
    createEnrichment: inboundRoute({
      method: 'POST',
      path: '/v1/enrichment-runs',
      roles: ENRICHMENT_ALL_ROLES,
      publicApi: { scope: 'enrichment:write' },
      success: [202, 200],
      idempotent: true,
      keyRequired: true,
      errors: [
        'enrichment.prospect_not_found',
        'enrichment.budget_exceeded',
        'enrichment.provider_unavailable',
        'enrichment.verification_failed',
      ],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Enriches one to 500 Prospects, optionally for some field groups only (person, company, email_verification). It makes a run set with one run per Prospect, queues the runs in bounded batches and answers 202 with the run set; nothing runs on the request. Each run walks the Organization's provider order per group, asks only for what is still missing, stops on the first result with enough confidence, and records every attempt with its provider, outcome and cost in micro-dollars. The monthly budget and the run ceiling are checked before each provider call, never after: a run that reaches either ends stopped with the reason. An Organization's own imported value is never overwritten; the provider's value is kept beside it as suggested. Written values reach the Prospect with the Source enrichment:<provider>. ${KEY} The key is the request id: the same key twice charges once and answers 200 with the same run set. A named Prospect outside the caller's view fails the whole call with enrichment.prospect_not_found (404). enrichment.budget_exceeded (429) when this month's budget is already spent; enrichment.provider_unavailable (503) when no provider is enabled with a key for a group asked for; enrichment.verification_failed (422) when email verification is asked for a Prospect with no address. Publishes enrichment.completed as each run ends. ${UNTRUSTED} ${VISIBILITY}`,
    }),
    getEnrichmentRunSet: inboundRoute({
      method: 'GET',
      path: '/v1/enrichment-run-sets/{runSetId}',
      roles: ENRICHMENT_ALL_ROLES,
      publicApi: { scope: 'enrichment:read' },
      success: [200],
      idempotent: false,
      errors: ['enrichment.run_set_not_found'],
      commonErrors: [],
      description: `Reads the progress of one bulk request: total runs, counts by status, the cost so far and whether every run has ended. A Rep sees a run set only if they made it; a Manager those made by their Team; an Owner or Admin all. ${ORG_ONLY}`,
    }),
    getEnrichmentRun: inboundRoute({
      method: 'GET',
      path: '/v1/enrichment-runs/{runId}',
      roles: ENRICHMENT_ALL_ROLES,
      publicApi: { scope: 'enrichment:read' },
      success: [200],
      idempotent: false,
      errors: ['enrichment.run_not_found'],
      commonErrors: [],
      description: `Reads one run: its status and stop reason, every attempt (provider, group, outcome, failure, cost), the fields it filled with provider, confidence, time, cost and whether each was written or only suggested, the email verification and the total cost against the ceiling. ${UNTRUSTED} ${VISIBILITY}`,
    }),
    listEnrichmentRuns: inboundRoute({
      method: 'GET',
      path: '/v1/enrichment-runs',
      roles: ENRICHMENT_ALL_ROLES,
      publicApi: { scope: 'enrichment:read' },
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.invalid'],
      description: `Lists runs, newest first (by createdAt, then id), ${PAGED}, optionally narrowed by prospectId, runSetId and status. A filter never widens what the caller may see. ${UNTRUSTED} ${VISIBILITY}`,
    }),
    getProspectEnrichment: inboundRoute({
      method: 'GET',
      path: '/v1/prospects/{prospectId}/enrichment',
      roles: ENRICHMENT_ALL_ROLES,
      publicApi: { scope: 'enrichment:read' },
      success: [200],
      idempotent: false,
      errors: ['enrichment.prospect_not_found'],
      commonErrors: [],
      description: `Reads what enrichment knows about one Prospect: each current field with its provider, confidence, time and cost, the latest email verification (valid, risky or invalid, with a reason), and the cost in total and by provider. A Prospect never enriched has empty lists. ${UNTRUSTED} ${VISIBILITY}`,
    }),
    deleteProspectEnrichment: inboundRoute({
      method: 'DELETE',
      path: '/v1/prospects/{prospectId}/enrichment',
      roles: ENRICHMENT_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: ['enrichment.prospect_not_found'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Erases everything outbound holds from enrichment for one Prospect: runs, attempts, field copies and verification. Spend totals stay, without any Prospect link. Owner and Admin only; any other is auth.forbidden. Erasing nothing answers 200. ${KEY} ${VISIBILITY}`,
    }),
    listEnrichmentProviders: inboundRoute({
      method: 'GET',
      path: '/v1/enrichment/providers',
      roles: ENRICHMENT_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.invalid'],
      description: `Lists the providers this deployment offers with whether each is switched on, whether the Organization stored a key (credentialSet) and the field groups it serves, by provider key, ${PAGED}. No key is ever returned. Owner, Admin and Manager; any other is auth.forbidden. ${SECRETS} ${ORG_ONLY}`,
    }),
    setEnrichmentProvider: inboundRoute({
      method: 'PUT',
      path: '/v1/enrichment/providers/{provider}',
      roles: ENRICHMENT_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: ['enrichment.provider_unknown'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Switches a provider on or off for the Organization and optionally stores its own key (apiKey), removes it (null) or keeps it (left out). The answer is the provider's settings, which hold no key. Owner and Admin only; any other is auth.forbidden. ${KEY} ${SECRETS} ${ORG_ONLY}`,
    }),
    getEnrichmentWaterfall: inboundRoute({
      method: 'GET',
      path: '/v1/enrichment/waterfall',
      roles: ENRICHMENT_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: [],
      description: `Reads the provider order per field group (person, company, email_verification) and its version; version 0 is the default order. Owner, Admin and Manager; any other is auth.forbidden. ${ORG_ONLY}`,
    }),
    setEnrichmentWaterfall: inboundRoute({
      method: 'PUT',
      path: '/v1/enrichment/waterfall',
      roles: ENRICHMENT_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: ['enrichment.version_conflict', 'enrichment.invalid_waterfall'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Saves the provider order per group. The body names the expectedVersion the caller read; a stale one is enrichment.version_conflict (409), a provider that does not exist or cannot serve that group is enrichment.invalid_waterfall (422). Owner and Admin only; any other is auth.forbidden. ${KEY} ${ORG_ONLY}`,
    }),
    getEnrichmentBudget: inboundRoute({
      method: 'GET',
      path: '/v1/enrichment/budget',
      roles: ENRICHMENT_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: [],
      description: `Reads this month's enrichment budget: the monthly limit, the run ceiling, what was spent and what is left in micro-dollars, and when the month resets (UTC). Owner, Admin and Manager; any other is auth.forbidden. ${ORG_ONLY}`,
    }),
    setEnrichmentBudget: inboundRoute({
      method: 'PUT',
      path: '/v1/enrichment/budget',
      roles: ENRICHMENT_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: ['enrichment.version_conflict'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Sets the monthly limit and the per-run ceiling (not above the limit), in micro-dollars. The body names the expectedVersion the caller read; a stale one is enrichment.version_conflict (409). Owner and Admin only; any other is auth.forbidden. ${KEY} ${ORG_ONLY}`,
    }),
    listEnrichmentSpend: inboundRoute({
      method: 'GET',
      path: '/v1/enrichment/spend',
      roles: ENRICHMENT_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.invalid'],
      description: `Lists spend by month and provider (cost in micro-dollars and calls), newest month first, ${PAGED}, optionally for one month. Owner, Admin and Manager; any other is auth.forbidden. ${ORG_ONLY}`,
    }),
    recordSignalNote: inboundRoute({
      method: 'POST',
      path: '/v1/prospects/{prospectId}/signals',
      roles: ENRICHMENT_ALL_ROLES,
      publicApi: { scope: 'enrichment:write' },
      success: [201, 200],
      idempotent: true,
      keyRequired: true,
      errors: ['enrichment.prospect_not_found', 'signal.invalid'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Records a note, a signal of kind note in the Rep's own words (such as "met at the conference"), on a Prospect, observed now unless observedAt says when (not in the future: signal.invalid, 422). Other kinds come from providers and the webhook, not from people. ${KEY} A replay answers 200 with the same signal. Publishes signal.recorded. ${UNTRUSTED} ${VISIBILITY}`,
    }),
    listProspectSignals: inboundRoute({
      method: 'GET',
      path: '/v1/prospects/{prospectId}/signals',
      roles: ENRICHMENT_ALL_ROLES,
      publicApi: { scope: 'enrichment:read' },
      success: [200],
      idempotent: false,
      errors: ['enrichment.prospect_not_found'],
      commonErrors: ['request.invalid'],
      description: `Lists a Prospect's signals as a timeline, newest first (by observedAt, then id), ${PAGED}, optionally only one kind or only fresh ones. Each carries when it expires and whether it is still fresh. ${UNTRUSTED} ${VISIBILITY}`,
    }),
    getSignal: inboundRoute({
      method: 'GET',
      path: '/v1/signals/{signalId}',
      roles: ENRICHMENT_ALL_ROLES,
      publicApi: { scope: 'enrichment:read' },
      success: [200],
      idempotent: false,
      errors: ['signal.not_found'],
      commonErrors: [],
      description: `Reads one signal, the target of a Citation of kind signal. A signal on a Prospect outside the caller's view is signal.not_found (404), never 403, and one of another Organization the same. ${UNTRUSTED}`,
    }),
    getSignalSettings: inboundRoute({
      method: 'GET',
      path: '/v1/signal-settings',
      roles: ENRICHMENT_ALL_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: [],
      description: `Reads which kinds of signal matter and how many days each stays fresh, and whether the webhook signing secret is set (never the secret). Every role may read it. ${ORG_ONLY}`,
    }),
    setSignalSettings: inboundRoute({
      method: 'PUT',
      path: '/v1/signal-settings',
      roles: ENRICHMENT_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: ['enrichment.version_conflict'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Saves, for every kind once, whether it matters and its freshness in days. The body names the expectedVersion the caller read; a stale one is enrichment.version_conflict (409). A stale signal is never used in a message. Owner and Admin only; any other is auth.forbidden. ${KEY} ${ORG_ONLY}`,
    }),
    rotateSignalWebhookSecret: inboundRoute({
      method: 'POST',
      path: '/v1/signal-webhook/rotate',
      roles: ENRICHMENT_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: [],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Makes a new signing secret for the Organization's signal webhook and answers it this once; the old one stops working at once. ${KEY} A replay within the idempotency window answers the same secret from a stored reply that is encrypted and discarded when the window ends. Owner and Admin only; any other is auth.forbidden. The secret is stored encrypted and is never returned again, logged or put in an error report.`,
    }),
    receiveSignalWebhook: inboundRoute({
      method: 'POST',
      path: '/v1/public/signals/webhook/{organizationId}',
      roles: [],
      public: true,
      success: [201, 200],
      idempotent: true,
      errors: ['signal.webhook_unauthorized', 'enrichment.prospect_not_found', 'signal.invalid'],
      commonErrors: [...PUBLIC_ERRORS],
      description: `Public: records one website visit from the Organization's own site, with no user token. The request carries x-closeline-timestamp and x-closeline-signature, the lower-case hex HMAC-SHA256 of "<timestamp>.<raw body>" with the Organization's signing secret, compared in constant time; a timestamp more than 300 seconds from the receiver's clock, a bad signature or an unknown Organization is signal.webhook_unauthorized (401) and nothing is read. The Prospect is named by id or email and must be the path Organization's own, else enrichment.prospect_not_found (404). The eventId makes a replay answer 200 with duplicate true and record nothing. Publishes signal.recorded. No Idempotency-Key header is needed. ${UNTRUSTED}`,
    }),
    listFitCriteria: inboundRoute({
      method: 'GET',
      path: '/v1/fit-criteria',
      roles: ENRICHMENT_ALL_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.invalid'],
      description: `Lists the Organization's fit criteria, oldest first (by createdAt, then id), ${PAGED}, with the version of the whole set. Every role may read them. ${ORG_ONLY}`,
    }),
    createFitCriterion: inboundRoute({
      method: 'POST',
      path: '/v1/fit-criteria',
      roles: ENRICHMENT_ADMIN_ROLES,
      success: [201, 200],
      idempotent: true,
      keyRequired: true,
      errors: ['fit.invalid_criteria'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Adds a named, weighted criterion on title, industry, employee count, region or technology. At most 50 per Organization with unique names; an operator that does not suit the attribute is fit.invalid_criteria (422). Prospects are scored again in the background and prospect.fit_changed is published for each score that changes. Owner and Admin only; any other is auth.forbidden. ${KEY} A replay answers 200 with the same criterion. ${ORG_ONLY}`,
    }),
    updateFitCriterion: inboundRoute({
      method: 'PATCH',
      path: '/v1/fit-criteria/{criterionId}',
      roles: ENRICHMENT_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: ['fit.criterion_not_found', 'fit.invalid_criteria'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Changes any part of a criterion. The result must be valid as a whole (fit.invalid_criteria, 422). Prospects are scored again in the background. Owner and Admin only; any other is auth.forbidden. ${KEY} ${ORG_ONLY}`,
    }),
    deleteFitCriterion: inboundRoute({
      method: 'DELETE',
      path: '/v1/fit-criteria/{criterionId}',
      roles: ENRICHMENT_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: ['fit.criterion_not_found'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Removes a criterion; Prospects are scored again in the background. Removing one already removed answers 200. Owner and Admin only; any other is auth.forbidden. ${KEY} ${ORG_ONLY}`,
    }),
    getProspectFit: inboundRoute({
      method: 'GET',
      path: '/v1/prospects/{prospectId}/fit',
      roles: ENRICHMENT_ALL_ROLES,
      publicApi: { scope: 'enrichment:read' },
      success: [200],
      idempotent: false,
      errors: ['enrichment.prospect_not_found'],
      commonErrors: [],
      description: `Reads a Prospect's fit score: the sum of the weights of the matched criteria out of the sum of all enabled ones, and every criterion with its result (matched, missed, or unknown when the Prospect has no value for it). ${VISIBILITY}`,
    }),
    listFitScores: inboundRoute({
      method: 'GET',
      path: '/v1/fit-scores',
      roles: ENRICHMENT_ALL_ROLES,
      publicApi: { scope: 'enrichment:read' },
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.invalid'],
      description: `Lists fit scores, highest first (by score, then Prospect id), ${PAGED}, optionally from a lowest score. Only Prospects the caller may see are listed; a filter never widens that. ${VISIBILITY}`,
    }),
  })
