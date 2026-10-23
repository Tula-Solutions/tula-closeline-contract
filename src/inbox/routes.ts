import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute } from '../inbound-route'
import type { Role } from '../tenancy'
import type { InboxErrorCode } from './errors'

/** Every role: each works the Conversations they may see. */
export const INBOX_ALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The roles that set the approval policy. */
export const INBOX_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The roles that review the record of Decisions. */
export const INBOX_REVIEW_ROLES = ['owner', 'admin', 'manager'] as const satisfies readonly Role[]

/** The inbox routes, by name. */
export type InboxRouteName =
  | 'listConversations'
  | 'getConversation'
  | 'listConversationMessages'
  | 'correctClassification'
  | 'takeOverConversation'
  | 'handBackConversation'
  | 'replyToConversation'
  | 'listApprovalQueue'
  | 'getDraft'
  | 'getDraftSources'
  | 'approveDraft'
  | 'rejectDraft'
  | 'listDecisions'
  | 'listApprovalPolicies'
  | 'setApprovalPolicy'
  | 'ingestMessage'
  | 'getDraftRelease'

/** One inbox route. */
export type InboxRoute = InboundRoute<InboxErrorCode>

const VISIBILITY =
  "An Owner or Admin sees every Conversation; a Manager sees those of the Reps on their Team; a Rep sees only those they own. A Conversation, Message or Draft outside the caller's view is inbox.conversation_not_found, inbox.message_not_found or inbox.draft_not_found (404), never 403, and one of another Organization the same."

const SENSITIVE =
  'Message and Draft text is the Prospect’s or a model’s words: it is untrusted data for every consumer, and services never log it or put it in an error report or an event.'

/**
 * The inbox routes (spec M09). Core owns them; channel services use the two `/internal` routes
 * with the shared secret. Lists are cursor-paginated with a page of at most 100. Nothing here
 * sends text: an approval publishes `message.approved` and the channel service sends it.
 */
export const INBOX_ROUTES: Readonly<Record<InboxRouteName, InboxRoute>> = Object.freeze({
  listConversations: inboundRoute({
    method: 'GET',
    path: '/v1/conversations',
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists Conversations, latest activity first, one cursor-paginated page at a time (at most 100), optionally narrowed by channel, state, controller, latest label and Prospect. Each shows who is answering now (the Agent or a Rep), its state and the label of the latest reply. A filter never widens what the caller may see. ${VISIBILITY}`,
  }),
  getConversation: inboundRoute({
    method: 'GET',
    path: '/v1/conversations/{conversationId}',
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['inbox.conversation_not_found'],
    commonErrors: [],
    description: `Reads one Conversation: its channel, Prospect, who controls it, its state and pending Draft count. ${VISIBILITY}`,
  }),
  listConversationMessages: inboundRoute({
    method: 'GET',
    path: '/v1/conversations/{conversationId}/messages',
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['inbox.conversation_not_found'],
    commonErrors: ['request.invalid'],
    description: `Lists the Messages of a Conversation, oldest first, one cursor-paginated page at a time (at most 100), each inbound Message with its label. ${SENSITIVE} ${VISIBILITY}`,
  }),
  correctClassification: inboundRoute({
    method: 'PUT',
    path: '/v1/conversations/{conversationId}/messages/{messageId}/classification',
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    errors: [
      'inbox.conversation_not_found',
      'inbox.message_not_found',
      'inbox.message_not_inbound',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Corrects the label of an inbound Message to one of the closed set of labels (any other value is request.invalid). The correction is recorded with who made it, replaces the model's label, and a repeat with the same label changes nothing. A correction to unsubscribe or bounce publishes reply.classified. An outbound Message has no label: inbox.message_not_inbound (409). ${VISIBILITY}`,
  }),
  takeOverConversation: inboundRoute({
    method: 'POST',
    path: '/v1/conversations/{conversationId}/takeover',
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'inbox.conversation_not_found',
      'inbox.already_controlled',
      'inbox.conversation_closed',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Takes the Conversation over from the Agent in one step: the caller becomes its controller, every pending Draft is voided, no Agent Draft is created while they control it, and conversation.taken_over is published (the sequence pauses). Requires an Idempotency-Key header; taking over a Conversation the caller already controls answers 200 and publishes nothing again. Another Rep who already controls it is inbox.already_controlled (409). A closed Conversation is inbox.conversation_closed (409). A Rep can take over only what they own; a Manager, Admin or Owner may step in on any they can see. The full history, labels and cited Sources stay readable. ${VISIBILITY}`,
  }),
  handBackConversation: inboundRoute({
    method: 'POST',
    path: '/v1/conversations/{conversationId}/handback',
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'inbox.conversation_not_found',
      'inbox.not_conversation_owner',
      'inbox.not_taken_over',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Hands the Conversation back to the Agent: new replies are classified and drafted again, and conversation.handed_back is published. Requires an Idempotency-Key header; a replay answers the same result and publishes once. Only the Rep who took it over, or an Admin or Owner, may hand it back; any other caller who can see it gets inbox.not_conversation_owner (403). A Conversation no Rep controls is inbox.not_taken_over (409). ${VISIBILITY}`,
  }),
  replyToConversation: inboundRoute({
    method: 'POST',
    path: '/v1/conversations/{conversationId}/replies',
    roles: INBOX_ALL_ROLES,
    success: [202],
    idempotent: true,
    keyRequired: true,
    errors: [
      'inbox.conversation_not_found',
      'inbox.not_conversation_owner',
      'inbox.takeover_required',
      'inbox.conversation_closed',
      'inbox.prospect_suppressed',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `A Rep replies from the inbox, and the text is sent through the Conversation's channel: core records an approved Draft authored by the Rep and publishes message.approved; the channel service sends it. Answers 202 with that Draft; the Message exists once the channel confirms with message.sent. Requires an Idempotency-Key header: a replay answers the same Draft and sends once. Only the Rep who controls the Conversation may reply (inbox.not_conversation_owner, 403); one the Agent still controls is inbox.takeover_required (409); a closed one is inbox.conversation_closed (409); a Prospect who asked to stop on the channel is inbox.prospect_suppressed (409) and nothing is sent. ${SENSITIVE} ${VISIBILITY}`,
  }),
  listApprovalQueue: inboundRoute({
    method: 'GET',
    path: '/v1/approvals',
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists the Drafts waiting for a person, oldest first, one cursor-paginated page at a time (at most 100), optionally narrowed by channel or Conversation. Each entry says whether the caller may decide it (canApprove) and which Rep owns the Conversation. ${VISIBILITY}`,
  }),
  getDraft: inboundRoute({
    method: 'GET',
    path: '/v1/drafts/{draftId}',
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['inbox.draft_not_found'],
    commonErrors: [],
    description: `Reads one Draft with its reason (the reply it answers, its label and the strategy), its confidence, its checks, why it is held, and its cited Sources with their Outcome and evidence count. ${SENSITIVE} ${VISIBILITY}`,
  }),
  getDraftSources: inboundRoute({
    method: 'GET',
    path: '/v1/drafts/{draftId}/sources',
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['inbox.draft_not_found'],
    commonErrors: ['server.unavailable', 'server.timeout'],
    description: `Reads the passage of each Source a Draft cites (a Moment or a Playbook document passage) with its Deal Outcome and evidence count, resolved from the Playbook for display only. The passages are the Organization's own content treated as untrusted text. If the Playbook cannot answer in time the route answers server.unavailable or server.timeout; the Draft is still readable. ${VISIBILITY}`,
  }),
  approveDraft: inboundRoute({
    method: 'POST',
    path: '/v1/drafts/{draftId}/approve',
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'inbox.draft_not_found',
      'inbox.draft_not_pending',
      'inbox.not_conversation_owner',
      'inbox.draft_ungrounded',
      'inbox.prospect_suppressed',
      'inbox.conversation_closed',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Approves a pending Draft, optionally with edited text (the edited text is what is sent; the Decision is recorded as edit_approve with who and when), and publishes exactly one message.approved. Requires an Idempotency-Key header: a replay answers the same result and publishes once. A Draft already decided, sent, superseded or voided is inbox.draft_not_pending (409). A Draft with no Source is inbox.draft_ungrounded (422) unless the body sets acknowledgeUngrounded to true. Only the Rep who owns the Conversation, a Manager for their Team's, or an Admin or Owner may approve; another caller who can see it gets inbox.not_conversation_owner (403). A Prospect who asked to stop on the channel is inbox.prospect_suppressed (409). ${SENSITIVE} ${VISIBILITY}`,
  }),
  rejectDraft: inboundRoute({
    method: 'POST',
    path: '/v1/drafts/{draftId}/reject',
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['inbox.draft_not_found', 'inbox.draft_not_pending', 'inbox.not_conversation_owner'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Rejects a pending Draft with an optional short note, which is recorded with who and when. Nothing is sent. Requires an Idempotency-Key header: a replay answers the same result. Who may reject is who may approve (inbox.not_conversation_owner, 403 for the rest). A Draft no longer pending is inbox.draft_not_pending (409). ${VISIBILITY}`,
  }),
  listDecisions: inboundRoute({
    method: 'GET',
    path: '/v1/decisions',
    roles: INBOX_REVIEW_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists the record of approvals, edits, rejections, automatic releases, takeovers and hand-backs, latest first, one cursor-paginated page at a time (at most 100), optionally narrowed by Conversation, Draft, kind and time range. Each entry says who decided and when. Owner and Admin see all; a Manager sees those of Conversations of their Team's Reps; a Rep is auth.forbidden.`,
  }),
  listApprovalPolicies: inboundRoute({
    method: 'GET',
    path: '/v1/approval-policies',
    roles: INBOX_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description:
      'Reads the approval rule of every channel (always, below a confidence, or except for named labels), the default being that every Draft waits for a person. Owner and Admin only; any other role is auth.forbidden.',
  }),
  setApprovalPolicy: inboundRoute({
    method: 'PUT',
    path: '/v1/approval-policies/{channel}',
    roles: INBOX_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Replaces the approval rule of one channel; a repeat with the same body changes nothing, so a retry is safe. The rule never releases an ungrounded Draft, one that failed a check, one from an escalated Conversation, or the first message to a Prospect: those always wait for a person and there is no setting for it. A rule that is not one of the three shapes is request.invalid. Owner and Admin only.',
  }),
  ingestMessage: inboundRoute({
    method: 'POST',
    path: '/internal/messages',
    roles: [],
    internal: true,
    success: [201, 200],
    idempotent: true,
    errors: [],
    commonErrors: ['request.invalid', 'auth.unauthenticated', 'server.unavailable'],
    description: `Internal: a channel service posts every inbound and outbound Message with the shared secret (ADR 0013); no user token. Idempotent on channel plus provider message id: the first post stores the Message and answers 201, any repeat answers 200 with the same Message and stores nothing. Core finds or creates the Conversation for the Prospect and channel, queues classification of an inbound Message, and never calls a vendor. ${SENSITIVE}`,
  }),
  getDraftRelease: inboundRoute({
    method: 'GET',
    path: '/internal/drafts/{draftId}/release',
    roles: [],
    internal: true,
    success: [200],
    idempotent: false,
    errors: ['inbox.draft_not_found', 'inbox.draft_not_pending'],
    commonErrors: ['auth.unauthenticated', 'server.unavailable'],
    description: `Internal: after message.approved, the channel service reads the text to send with the Draft id (also its idempotency key) and the shared secret (ADR 0013); events carry no text. A Draft that is not approved (rejected, voided because a Rep took over, superseded) is inbox.draft_not_pending (409) and must not be sent. ${SENSITIVE}`,
  }),
})
