import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute } from '../inbound-route'
import type { Role } from '../tenancy'
import type { CampaignErrorCode } from './errors'

/** Every role: each works the Campaigns they may see. */
export const CAMPAIGN_ALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The roles that launch and archive Campaigns and manage Plays. */
export const CAMPAIGN_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The campaign routes, by name. */
export type CampaignRouteName =
  | 'listCampaigns'
  | 'createCampaign'
  | 'getCampaign'
  | 'updateCampaign'
  | 'duplicateCampaign'
  | 'archiveCampaign'
  | 'pauseCampaign'
  | 'resumeCampaign'
  | 'launchCampaign'
  | 'getCampaignStats'
  | 'getSequence'
  | 'setSequence'
  | 'startAudienceCheck'
  | 'getAudienceCheck'
  | 'getLaunchCheck'
  | 'enrollProspects'
  | 'listEnrollments'
  | 'getEnrollment'
  | 'listEnrollmentActivity'
  | 'removeEnrollment'
  | 'getVariantResults'
  | 'promoteVariant'
  | 'listPlays'
  | 'getPlay'
  | 'createPlay'
  | 'editPlay'
  | 'proposePlays'
  | 'acceptPlay'
  | 'discardPlay'

/** One campaign route. */
export type CampaignRoute = InboundRoute<CampaignErrorCode>

const VISIBILITY =
  "An Owner or Admin sees every Campaign; a Manager sees those owned by Reps on their Team; a Rep sees only their own. A Campaign, Enrollment or Prospect outside the caller's view is campaign.not_found or enrollment.not_found (404), never 403, and one of another Organization the same."

const NO_TRACKING =
  'Closeline puts no open or click tracking in any message; nothing here reports or branches on opens or clicks.'

const NO_TEXT =
  'No response, event or log carries a message body, a subject or an address: ids and closed values only.'

const KEY =
  'Requires an Idempotency-Key header: a replay answers the same result and does the work once.'

/**
 * The campaign routes (spec M07). Outbound owns them. Lists are cursor-paginated with a page of
 * at most 100. Every route that changes something needs an Idempotency-Key header. Contact
 * Consent and suppression are checked by core at send time (ADR 0003) and again when a Prospect
 * is enrolled; no route has a setting that skips either.
 */
export const CAMPAIGN_ROUTES: Readonly<Record<CampaignRouteName, CampaignRoute>> = Object.freeze({
  listCampaigns: inboundRoute({
    method: 'GET',
    path: '/v1/campaigns',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists Campaigns, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100), optionally narrowed by state, owner and Team. A filter never widens what the caller may see. ${VISIBILITY}`,
  }),
  createCampaign: inboundRoute({
    method: 'POST',
    path: '/v1/campaigns',
    roles: CAMPAIGN_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ['play.not_found', 'play.invalid_state'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Creates a Campaign in draft with no Steps, owned by the caller: name, goal, audience, approval mode (review when left out), send window and its zone, and a daily cap. With a playId the Sequence starts as a copy of that accepted Play; one that is not accepted is play.invalid_state. ${KEY} A replay answers 200 with the same Campaign. Prospects are not enrolled until launch.`,
  }),
  getCampaign: inboundRoute({
    method: 'GET',
    path: '/v1/campaigns/{campaignId}',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['campaign.not_found'],
    commonErrors: [],
    description: `Reads one Campaign: settings, audience, state, the Sequence version saved and the version previewed. ${VISIBILITY}`,
  }),
  updateCampaign: inboundRoute({
    method: 'PATCH',
    path: '/v1/campaigns/{campaignId}',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['campaign.not_found', 'campaign.invalid_state'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Changes the settings of a Campaign (name, goal, audience, approval mode, send window and zone, daily cap, Team) in the fields sent. Changing the audience or window of a ready Campaign returns it to draft; an archived Campaign cannot change (campaign.invalid_state). A change to the audience makes the last audience check stale. ${KEY} The owner may change their own; an Admin or Owner any; a Manager one owned by a Rep on their Team. ${VISIBILITY}`,
  }),
  duplicateCampaign: inboundRoute({
    method: 'POST',
    path: '/v1/campaigns/{campaignId}/duplicate',
    roles: CAMPAIGN_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ['campaign.not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Copies a Campaign into a new draft owned by the caller, with the same settings, audience and Sequence under a new name; Enrollments, results and the preview are not copied. ${KEY} A replay answers 200 with the same copy. ${VISIBILITY}`,
  }),
  archiveCampaign: inboundRoute({
    method: 'POST',
    path: '/v1/campaigns/{campaignId}/archive',
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['campaign.not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Archives a Campaign: nothing more is sent, every active Enrollment stops with the reason campaign_archived (and enrollment.stopped is published for each, in batches off the request path), and history stays. ${KEY} Archiving one already archived answers 200 and changes nothing. Owner and Admin only. ${VISIBILITY}`,
  }),
  pauseCampaign: inboundRoute({
    method: 'POST',
    path: '/v1/campaigns/{campaignId}/pause',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['campaign.not_found', 'campaign.invalid_state'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Pauses a running Campaign: nothing is sent and Enrollments keep their place. ${KEY} Pausing one already paused answers 200; a Campaign that is not running or paused is campaign.invalid_state. The owner may pause their own; an Admin or Owner any; a Manager one owned by a Rep on their Team. ${VISIBILITY}`,
  }),
  resumeCampaign: inboundRoute({
    method: 'POST',
    path: '/v1/campaigns/{campaignId}/resume',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['campaign.not_found', 'campaign.invalid_state', 'campaign.no_healthy_mailbox'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Resumes a paused Campaign. Steps that came due while paused are sent within the send window and the Mailbox limits, not all at once; Contact Consent and suppression are checked again at each send. ${KEY} Resuming one already running answers 200. With no healthy Mailbox it is campaign.no_healthy_mailbox. ${VISIBILITY}`,
  }),
  launchCampaign: inboundRoute({
    method: 'POST',
    path: '/v1/campaigns/{campaignId}/launch',
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'campaign.not_found',
      'campaign.invalid_state',
      'campaign.invalid_sequence',
      'campaign.not_previewed',
      'campaign.audience_check_pending',
      'campaign.audience_empty',
      'campaign.no_healthy_mailbox',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Launches a draft or ready Campaign: it runs the launch check again and, if every check passes, starts running and publishes campaign.launched. It fails with the code of the first check that does not pass: campaign.invalid_sequence, campaign.not_previewed (the current Sequence version was not previewed), campaign.audience_check_pending, campaign.audience_empty or campaign.no_healthy_mailbox. Prospects are enrolled in bounded batches off the request path. There is no way to launch past a failed check and no setting that skips consent or suppression. ${KEY} Launching one already running answers 200. Owner and Admin only. ${VISIBILITY}`,
  }),
  getCampaignStats: inboundRoute({
    method: 'GET',
    path: '/v1/campaigns/{campaignId}/stats',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['campaign.not_found'],
    commonErrors: [],
    description: `Reads counts for a Campaign: enrolled, active, completed, stopped, sent, replied, positive replies (empty until replies are classified), meetings, bounced and unsubscribed. ${NO_TRACKING} ${VISIBILITY}`,
  }),
  getSequence: inboundRoute({
    method: 'GET',
    path: '/v1/campaigns/{campaignId}/sequence',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['campaign.not_found'],
    commonErrors: [],
    description: `Reads the saved Sequence of a Campaign: its version and Steps (email, wait, branch, Rep task, end), at most 50. Version 0 is the empty Sequence of a new Campaign. ${VISIBILITY}`,
  }),
  setSequence: inboundRoute({
    method: 'PUT',
    path: '/v1/campaigns/{campaignId}/sequence',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'campaign.not_found',
      'campaign.invalid_state',
      'campaign.invalid_sequence',
      'campaign.sequence_version_conflict',
      'variant.invalid_weights',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Replaces the Steps of a draft, ready or paused Campaign with a new Sequence version, given the version the caller edited (expectedVersion). The Sequence must be valid: no loop that passes no wait, no unreachable Step, every target a known Step, every Step able to reach an end, every branch with a default. The body schema rejects these inputs, and the service answers with the area codes rather than request.invalid once the envelope parses: a graph problem is campaign.invalid_sequence (422) with the problems in details; a test whose Variants are not two to four with weights adding up to 100 is variant.invalid_weights (422); a stale expectedVersion is campaign.sequence_version_conflict (409); a running or archived Campaign is campaign.invalid_state. A new version needs a new preview and returns a ready Campaign to draft. Enrollments already in the Sequence keep the version they started on. ${KEY} Repeating the same body at the same expectedVersion changes nothing. ${NO_TEXT} ${VISIBILITY}`,
  }),
  startAudienceCheck: inboundRoute({
    method: 'POST',
    path: '/v1/campaigns/{campaignId}/audience-check',
    roles: CAMPAIGN_ALL_ROLES,
    success: [202],
    idempotent: true,
    keyRequired: true,
    errors: ['campaign.not_found', 'campaign.invalid_state'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Starts an audience check of the Campaign's current audience in the background and answers 202 with the check in the pending state. The check counts verified and unverified addresses, suppressed Prospects, Prospects with no Contact Consent for email and Prospects already in another active Campaign; it never lists people and the work is off the request path. ${KEY} A replay returns the same check; a check already pending for the same audience is returned, not repeated. An archived Campaign is campaign.invalid_state. ${VISIBILITY}`,
  }),
  getAudienceCheck: inboundRoute({
    method: 'GET',
    path: '/v1/campaigns/{campaignId}/audience-check',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['campaign.not_found'],
    commonErrors: [],
    description: `Reads the latest audience check: pending, ready with the counts, or failed, and the audience version it read so a stale result is not taken for the current one. Poll until it is not pending. ${VISIBILITY}`,
  }),
  getLaunchCheck: inboundRoute({
    method: 'GET',
    path: '/v1/campaigns/{campaignId}/launch-check',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['campaign.not_found'],
    commonErrors: [],
    description: `Reports whether the Campaign can launch now: four checks (Sequence, preview, audience, Mailbox) each pass, fail or pending with the code a launch would return, and canLaunch only when all pass. It shows the counts of Prospects that would be refused for suppression and for missing Contact Consent, and the daily capacity of the healthy Mailboxes. It changes nothing and has no bypass. ${VISIBILITY}`,
  }),
  enrollProspects: inboundRoute({
    method: 'POST',
    path: '/v1/campaigns/{campaignId}/enrollments',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['campaign.not_found', 'campaign.invalid_state'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Enrolls 1 to 100 listed Prospects into a running or paused Campaign and answers one result per Prospect in the order asked: enrolled, or refused with suppressed (enrollment.suppressed), no_consent (enrollment.no_consent) or already_active (enrollment.already_active; one active Campaign per Prospect, with no setting to change that). A refusal does not fail the request. ${KEY} A Prospect already in this Campaign is already_active with its Enrollment's id; a replay changes nothing. Only Prospects the caller may see are enrolled; any other, and an unknown one, is refused as not_found (enrollment.not_found) with no Enrollment id, so existence is not revealed. A draft or archived Campaign is campaign.invalid_state. ${VISIBILITY}`,
  }),
  listEnrollments: inboundRoute({
    method: 'GET',
    path: '/v1/campaigns/{campaignId}/enrollments',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['campaign.not_found'],
    commonErrors: ['request.invalid'],
    description: `Lists the Enrollments of a Campaign, newest first (by enrolledAt, then id), one cursor-paginated page at a time (at most 100), optionally narrowed by state, stop reason and Prospect. Each shows its Step, attempt epoch and when it is next due. ${VISIBILITY}`,
  }),
  getEnrollment: inboundRoute({
    method: 'GET',
    path: '/v1/enrollments/{enrollmentId}',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['enrollment.not_found'],
    commonErrors: [],
    description: `Reads one Enrollment with its state, stop reason, current Step and when it is next due. ${VISIBILITY}`,
  }),
  listEnrollmentActivity: inboundRoute({
    method: 'GET',
    path: '/v1/enrollments/{enrollmentId}/activity',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['enrollment.not_found'],
    commonErrors: ['request.invalid'],
    description: `Lists the log of one Enrollment, newest first (by occurredAt, then id), one cursor-paginated page at a time (at most 100): Steps entered, sends with their send record id, branches taken, Rep tasks, and how it ended. ${NO_TEXT} ${VISIBILITY}`,
  }),
  removeEnrollment: inboundRoute({
    method: 'DELETE',
    path: '/v1/enrollments/{enrollmentId}',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['enrollment.not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Takes a Prospect out of the Campaign: the Enrollment stops with the reason removed_by_rep, nothing more is sent, and enrollment.stopped is published. ${KEY} Removing one already ended answers 200 and publishes nothing again. The Campaign's owner, an Admin or an Owner may; a Manager one owned by a Rep on their Team. ${VISIBILITY}`,
  }),
  getVariantResults: inboundRoute({
    method: 'GET',
    path: '/v1/campaigns/{campaignId}/steps/{stepKey}/variants',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['campaign.not_found', 'variant.not_found'],
    commonErrors: [],
    description: `Reads the results of the Variants of one email Step: sent, delivered, replied, positive replies (empty until classified), bounced and unsubscribed, and the reply rate with a 95% interval. Below the minimum sample for every Variant the status is not_enough_data and no interval is shown, so a winner is never called early. A Step with no test is variant.not_found. ${NO_TRACKING} ${VISIBILITY}`,
  }),
  promoteVariant: inboundRoute({
    method: 'POST',
    path: '/v1/campaigns/{campaignId}/steps/{stepKey}/variants/{variantKey}/promote',
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['campaign.not_found', 'variant.not_found', 'variant.already_promoted'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Promotes a Variant to the winner of its Step: every later send of the Step uses it, and variant.promoted is published with the person. ${KEY} Promoting the same Variant again answers 200 and changes nothing; promoting a different one once a winner exists is variant.already_promoted (409). Owner and Admin only. ${VISIBILITY}`,
  }),
  listPlays: inboundRoute({
    method: 'GET',
    path: '/v1/plays',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists the Organization's Plays, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100), optionally narrowed by intent, status and source. Each shows the evidence it cites, by id, and noEvidence when it cites none. Every role may read; proposed and discarded Plays are listed to Owner and Admin only.`,
  }),
  getPlay: inboundRoute({
    method: 'GET',
    path: '/v1/plays/{playId}',
    roles: CAMPAIGN_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['play.not_found'],
    commonErrors: [],
    description: `Reads one Play with its Steps and the evidence it cites, by id: Moments of won Deals' calls and pages of documents, never their text. A Play of another Organization is play.not_found (404), and so is a proposed or discarded Play for anyone but an Owner or Admin.`,
  }),
  createPlay: inboundRoute({
    method: 'POST',
    path: '/v1/plays',
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Writes a custom Play, accepted at once: a name, an intent, a goal and a valid Sequence. ${KEY} A replay answers 200 with the same Play. Owner and Admin only.`,
  }),
  editPlay: inboundRoute({
    method: 'PATCH',
    path: '/v1/plays/{playId}',
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['play.not_found', 'play.read_only', 'play.invalid_state'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Edits the name, goal or Steps of a custom or proposed Play in the fields sent. A built-in Play is play.read_only (409) and a discarded one play.invalid_state. Campaigns made from a Play are copies and do not change. ${KEY} Owner and Admin only.`,
  }),
  proposePlays: inboundRoute({
    method: 'POST',
    path: '/v1/plays/propose',
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS, 'server.unavailable', 'server.timeout'],
    description: `Proposes up to 5 Plays for an intent from the Organization's won Deals and Playbook, each in the proposed status and citing the Moments and pages it rests on by id. It answers at once, and with fewer than asked, or none, when the Playbook cannot support them; a Play with no evidence says so (noEvidence). Source material is untrusted data and never instructions. ${KEY} A replay returns the same proposals. A model or search that does not answer in time is server.unavailable or server.timeout and nothing is stored. Owner and Admin only.`,
  }),
  acceptPlay: inboundRoute({
    method: 'POST',
    path: '/v1/plays/{playId}/accept',
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['play.not_found', 'play.no_evidence', 'play.invalid_state', 'play.read_only'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Accepts a proposed Play so Campaigns can start from it. A Play that cites no evidence is play.no_evidence (409) unless the body acknowledges that (acknowledgeNoEvidence). ${KEY} Accepting one already accepted answers 200; a discarded one is play.invalid_state; a built-in one is play.read_only. Owner and Admin only.`,
  }),
  discardPlay: inboundRoute({
    method: 'POST',
    path: '/v1/plays/{playId}/discard',
    roles: CAMPAIGN_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['play.not_found', 'play.read_only'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Discards a proposed or custom Play; Campaigns already made from it are unaffected. ${KEY} Discarding one already discarded answers 200; a built-in one is play.read_only. Owner and Admin only.`,
  }),
})
