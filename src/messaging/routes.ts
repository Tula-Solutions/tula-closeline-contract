import type { CampaignErrorCode } from '../campaign/errors'
import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute } from '../inbound-route'
import type { Role } from '../tenancy'
import type { MessagingErrorCode } from './errors'

/** Every role: each researches and drafts for the Prospects they may see. */
export const MESSAGING_ALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The roles that change the Brand Voice. */
export const MESSAGING_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The messaging route names. */
export type MessagingRouteName =
  | 'createBrief'
  | 'getBrief'
  | 'listBriefs'
  | 'createDraft'
  | 'getOutreachDraft'
  | 'listOutreachDrafts'
  | 'editOutreachDraft'
  | 'regenerateDraft'
  | 'getBrandVoice'
  | 'setBrandVoice'
  | 'listBrandVoiceVersions'
  | 'previewCampaign'
  | 'acceptCampaignPreview'

/** One messaging route; its errors are messaging codes and, for the preview, Campaign codes. */
export type MessagingRoute = InboundRoute<MessagingErrorCode | CampaignErrorCode>

const VISIBILITY =
  "An Owner or Admin sees every Prospect; a Manager those owned by Reps on their Team; a Rep only their own. A Prospect, Campaign, Research Brief or Draft outside the caller's view is its not_found code (404), never 403, and one of another Organization the same."

const KEY =
  'Requires an Idempotency-Key header: a replay answers the same result and does the work once.'

const UNTRUSTED =
  'Model output is untrusted data: statements and Draft text are shown with their Citations, never run as instructions, and never put in a log or an event.'

const NOTHING_SENT =
  'Nothing is sent, and no Contact Consent or suppression state changes; sending is checked by core at send time (ADR 0003).'

/**
 * The messaging routes (spec M06): Research Briefs, outreach Drafts, the Brand Voice and the
 * preview. Outbound owns them. Lists are cursor-paginated with a page of at most 100. Every route
 * that changes something needs an Idempotency-Key header. Outreach Drafts live under
 * `/v1/outreach-drafts` because the inbox owns `/v1/drafts`; both use the `drf_` id.
 */
export const MESSAGING_ROUTES: Readonly<Record<MessagingRouteName, MessagingRoute>> = Object.freeze(
  {
    createBrief: inboundRoute({
      method: 'POST',
      path: '/v1/prospects/{prospectId}/briefs',
      roles: MESSAGING_ALL_ROLES,
      success: [201, 200],
      idempotent: true,
      keyRequired: true,
      errors: [
        'research.not_found',
        'research.timeout',
        'draft.no_prospect_data',
        'draft.model_unavailable',
        'draft.budget_exceeded',
      ],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Makes a Research Brief for a Prospect: statements, each with exactly one Citation source, and a suggested angle that comes from the Organization's won Deals when it has any and says so when it does not. A statement the model proposed without a source that resolves is dropped and counted in droppedCount. A fresh cached Brief is returned (200) unless refresh is true; a new one is 201. ${KEY} ${UNTRUSTED} ${VISIBILITY}`,
    }),
    getBrief: inboundRoute({
      method: 'GET',
      path: '/v1/briefs/{briefId}',
      roles: MESSAGING_ALL_ROLES,
      success: [200],
      idempotent: false,
      errors: ['research.not_found'],
      commonErrors: [],
      description: `Reads one Research Brief with its statements, their Citation sources, the angle and when it expires. ${UNTRUSTED} ${VISIBILITY}`,
    }),
    listBriefs: inboundRoute({
      method: 'GET',
      path: '/v1/prospects/{prospectId}/briefs',
      roles: MESSAGING_ALL_ROLES,
      success: [200],
      idempotent: false,
      errors: ['research.not_found'],
      commonErrors: ['request.invalid'],
      description: `Lists a Prospect's Research Briefs, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100). ${VISIBILITY}`,
    }),
    createDraft: inboundRoute({
      method: 'POST',
      path: '/v1/outreach-drafts',
      roles: MESSAGING_ALL_ROLES,
      success: [201, 200],
      idempotent: true,
      keyRequired: true,
      errors: [
        'draft.not_found',
        'draft.no_prospect_data',
        'draft.model_unavailable',
        'draft.budget_exceeded',
        'research.timeout',
        'voice.not_found',
      ],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Writes a Draft for a Prospect, optionally for a Step of a Campaign and with an angle, from a Research Brief and the current Brand Voice. The Draft carries its Citations, five checks (citations_resolve, claims_supported, banned_phrase, length, name_match), whether it is ungrounded (no Moment from a won Deal) and autoSendable (grounded and every check passed). It does not send. ${KEY} A replay answers 200 with the same Draft. Publishes draft.created, and draft.approved_required when a person must approve it. ${UNTRUSTED} ${VISIBILITY}`,
    }),
    getOutreachDraft: inboundRoute({
      method: 'GET',
      path: '/v1/outreach-drafts/{draftId}',
      roles: MESSAGING_ALL_ROLES,
      success: [200],
      idempotent: false,
      errors: ['draft.not_found'],
      commonErrors: [],
      description: `Reads one Draft with its Citations (use the Playbook's citation resolve route for the text behind a Moment or document), checks, Brand Voice version and model. ${UNTRUSTED} ${VISIBILITY}`,
    }),
    listOutreachDrafts: inboundRoute({
      method: 'GET',
      path: '/v1/outreach-drafts',
      roles: MESSAGING_ALL_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.invalid'],
      description: `Lists Drafts, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100), optionally narrowed by prospectId, campaignId and whether the Draft is ungrounded. A filter never widens what the caller may see. ${VISIBILITY}`,
    }),
    editOutreachDraft: inboundRoute({
      method: 'PATCH',
      path: '/v1/outreach-drafts/{draftId}',
      roles: MESSAGING_ALL_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: ['draft.not_found', 'draft.invalid_state'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Changes the subject and/or body of a Draft by a person. The body names the expectedRevision the caller read; a stale one is draft.invalid_state (409). The text becomes source edited, the revision rises, the checks run again and a Citation whose sentence was removed gets applies false. ${KEY} ${VISIBILITY}`,
    }),
    regenerateDraft: inboundRoute({
      method: 'POST',
      path: '/v1/outreach-drafts/{draftId}/regenerate',
      roles: MESSAGING_ALL_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: [
        'draft.not_found',
        'draft.invalid_state',
        'draft.model_unavailable',
        'draft.budget_exceeded',
        'research.timeout',
      ],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Writes the Draft again with a new angle and/or tone for the same Prospect and Step; the revision rises. ${KEY} ${UNTRUSTED} ${VISIBILITY}`,
    }),
    getBrandVoice: inboundRoute({
      method: 'GET',
      path: '/v1/brand-voice',
      roles: MESSAGING_ALL_ROLES,
      success: [200],
      idempotent: false,
      errors: ['voice.not_found'],
      commonErrors: [],
      description:
        "Reads the Organization's current Brand Voice: tone, preferred words, banned phrases, sign-off and the longest message. Every role may read it; voice.not_found (404) when none was saved yet.",
    }),
    setBrandVoice: inboundRoute({
      method: 'PUT',
      path: '/v1/brand-voice',
      roles: MESSAGING_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: ['voice.version_conflict', 'voice.invalid'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Saves a new Brand Voice version. The body is the settings and the expectedVersion the caller read (0 when none exists); a stale one is voice.version_conflict (409), a rule across fields that fails is voice.invalid (422). Owner and Admin only; any other is auth.forbidden. ${KEY}`,
    }),
    listBrandVoiceVersions: inboundRoute({
      method: 'GET',
      path: '/v1/brand-voice/versions',
      roles: MESSAGING_ADMIN_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.invalid'],
      description:
        'Lists the saved Brand Voice versions, newest first, one cursor-paginated page at a time (at most 100). Owner and Admin only; any other is auth.forbidden.',
    }),
    previewCampaign: inboundRoute({
      method: 'POST',
      path: '/v1/campaigns/{campaignId}/preview',
      roles: MESSAGING_ALL_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: [
        'campaign.not_found',
        'campaign.sequence_version_conflict',
        'preview.too_many_prospects',
        'voice.not_found',
      ],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Shows what a Campaign's Step would send to one to five named Prospects, at the Sequence version given (the first email Step when stepKey is left out). More than five Prospects is preview.too_many_prospects (422); a stale Sequence version is campaign.sequence_version_conflict (409). Each row is a Research Brief and Draft, or the failure code that stopped that Prospect (draft.no_prospect_data, draft.model_unavailable, draft.budget_exceeded, research.timeout); one failing row does not fail the call. ${NOTHING_SENT} ${KEY} ${UNTRUSTED} ${VISIBILITY}`,
    }),
    acceptCampaignPreview: inboundRoute({
      method: 'POST',
      path: '/v1/campaigns/{campaignId}/preview/accept',
      roles: MESSAGING_ALL_ROLES,
      success: [200],
      idempotent: true,
      keyRequired: true,
      errors: [
        'campaign.not_found',
        'campaign.invalid_state',
        'campaign.sequence_version_conflict',
      ],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `Marks the Campaign previewed at the Sequence version given, so the launch check stops reporting campaign.not_previewed for that version. It answers the Campaign with previewedVersion and previewedAt set. An archived Campaign is campaign.invalid_state (409); a Sequence saved since is campaign.sequence_version_conflict (409). ${KEY} ${VISIBILITY}`,
    }),
  }
)
