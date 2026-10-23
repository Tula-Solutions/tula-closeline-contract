import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute } from '../inbound-route'
import type { Role } from '../tenancy'
import type { AgentErrorCode } from './errors'

/** The roles that read the Inbound Agent settings, questions and turns of their view. */
export const AGENT_READ_ROLES = ['owner', 'admin', 'manager'] as const satisfies readonly Role[]

/** The roles that change the Inbound Agent settings and Qualification questions, and try it out. */
export const AGENT_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** Every role: each answers the Handoffs offered to them and reads the Calls they may see. */
export const AGENT_ALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The Inbound Agent routes, by name. */
export type AgentRouteName =
  | 'getAgentSettings'
  | 'setAgentSettings'
  | 'listQualificationQuestions'
  | 'createQualificationQuestion'
  | 'getQualificationQuestion'
  | 'updateQualificationQuestion'
  | 'deleteQualificationQuestion'
  | 'reorderQualificationQuestions'
  | 'suggestQualificationQuestions'
  | 'startTrySession'
  | 'sendTryMessage'
  | 'listAgentTurns'
  | 'listHandoffs'
  | 'getHandoff'
  | 'acceptHandoff'
  | 'declineHandoff'

/** One Inbound Agent route. */
export type AgentRoute = InboundRoute<AgentErrorCode | 'call.not_found'>

const HANDOFF_VISIBILITY =
  "A Rep sees and answers only the Handoffs offered to them; a Manager sees those offered to Reps of their Team; an Owner or Admin sees all. A Handoff outside the caller's view is handoff.not_found (404), never 403."

/**
 * The Inbound Agent routes (spec M14). All need a token. No route or body can switch off the
 * Disclosure or waive Contact Consent: neither has a setting (ADR 0003).
 */
export const AGENT_ROUTES: Readonly<Record<AgentRouteName, AgentRoute>> = Object.freeze({
  getAgentSettings: inboundRoute({
    method: 'GET',
    path: '/v1/agent/settings',
    roles: AGENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description:
      'Reads the Inbound Agent settings: paused, greeting, voice style, hours, the fixed language list and the caps on Call length, cost and concurrency. Owner, Admin and Manager; a Rep gets auth.forbidden.',
  }),
  setAgentSettings: inboundRoute({
    method: 'PUT',
    path: '/v1/agent/settings',
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ['agent.settings_invalid'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      "Replaces the Inbound Agent settings, so a repeat changes nothing. Pausing stops callbacks and answers at once. Hours must not be empty and are checked in the Organization's zone (timeZone) against the fixed calling window; the service applies the Prospect-local window separately, so a call is placed only inside both. The body has no field for the Disclosure, the Recording or Contact Consent: they are not settings and an unknown field is request.invalid (ADR 0003). A greeting is spoken after the Disclosure, never in place of it. Owner and Admin only.",
  }),
  listQualificationQuestions: inboundRoute({
    method: 'GET',
    path: '/v1/agent/questions',
    roles: AGENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      'Lists the Qualification questions in the order the Inbound Agent asks them, one cursor-paginated page at a time (at most 100). Owner, Admin and Manager.',
  }),
  createQualificationQuestion: inboundRoute({
    method: 'POST',
    path: '/v1/agent/questions',
    roles: AGENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ['agent.question_invalid'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Adds a Qualification question (at most 50), last unless a position is given. Skip logic may only look at earlier questions; a reference to an unknown question or a loop is agent.question_invalid (422). An Idempotency-Key header is accepted: a replay answers 200 with the original question. Owner and Admin only.',
  }),
  getQualificationQuestion: inboundRoute({
    method: 'GET',
    path: '/v1/agent/questions/{questionId}',
    roles: AGENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ['agent.question_not_found'],
    commonErrors: [],
    description: 'Reads one Qualification question. Owner, Admin and Manager.',
  }),
  updateQualificationQuestion: inboundRoute({
    method: 'PATCH',
    path: '/v1/agent/questions/{questionId}',
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['agent.question_not_found', 'agent.question_invalid'],
    commonErrors: ['request.invalid'],
    description:
      "Changes a Qualification question's prompt, kind, choices, required flag or skip logic; the same body again changes nothing. Past answers keep the wording they were given under. Owner and Admin only.",
  }),
  deleteQualificationQuestion: inboundRoute({
    method: 'DELETE',
    path: '/v1/agent/questions/{questionId}',
    roles: AGENT_ADMIN_ROLES,
    success: [204],
    idempotent: false,
    errors: ['agent.question_not_found', 'agent.question_invalid'],
    commonErrors: [],
    description:
      'Removes a Qualification question. Skip logic in a later question that looks at it is agent.question_invalid (422) until that logic is changed. Answers already given are kept on their Inquiries. Owner and Admin only.',
  }),
  reorderQualificationQuestions: inboundRoute({
    method: 'PUT',
    path: '/v1/agent/question-order',
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ['agent.question_invalid', 'agent.question_not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Sets the order of all Qualification questions by listing every id once, so a repeat changes nothing. A question whose skip logic would then look at a later one is agent.question_invalid (422). Owner and Admin only.',
  }),
  suggestQualificationQuestions: inboundRoute({
    method: 'POST',
    path: '/v1/agent/questions/suggestions',
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['agent.not_enough_deals'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      "Suggests up to 10 Qualification questions from what the Organization's won Deals have in common. It changes nothing: an Admin adds the ones they want. Needs enough won Deals, else agent.not_enough_deals (409). Requires an Idempotency-Key header: a replay answers the same suggestions without calling the model again. Owner and Admin only.",
  }),
  startTrySession: inboundRoute({
    method: 'POST',
    path: '/v1/agent/try-sessions',
    roles: AGENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Starts a text rehearsal of the Inbound Agent on the live settings and Playbook. No call is placed, no Prospect is created and nothing is sent. The first turn states that it is an AI. Requires an Idempotency-Key header: a replay answers the same session. Owner and Admin only.',
  }),
  sendTryMessage: inboundRoute({
    method: 'POST',
    path: '/v1/agent/try-sessions/{sessionId}/messages',
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ['agent.session_not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Says something to the Inbound Agent in a try-it session and answers its reply turn with the Playbook passages it used. Requires an Idempotency-Key header: a replay answers the original reply and does not ask the model again. An unknown or expired session is agent.session_not_found (404). Owner and Admin only.',
  }),
  listAgentTurns: inboundRoute({
    method: 'GET',
    path: '/v1/calls/{callId}/agent-turns',
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['call.not_found'],
    commonErrors: ['request.invalid'],
    description:
      "Lists the turns of an Inbound Agent Call, oldest first, one cursor-paginated page at a time (at most 100), with the Playbook passages each answer used. A Rep sees only Calls handed to them; a Manager those of their Team; an Owner or Admin all. A Call outside the caller's view, or one the Agent did not take, is call.not_found (404).",
  }),
  listHandoffs: inboundRoute({
    method: 'GET',
    path: '/v1/handoffs',
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists Handoffs, latest first, one cursor-paginated page at a time (at most 100), optionally by state. ${HANDOFF_VISIBILITY}`,
  }),
  getHandoff: inboundRoute({
    method: 'GET',
    path: '/v1/handoffs/{handoffId}',
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['handoff.not_found'],
    commonErrors: [],
    description: `Reads one Handoff with the context the Rep needs before answering: the Prospect, the Qualification so far and the last 20 turns, without the Prospect's email or number. ${HANDOFF_VISIBILITY}`,
  }),
  acceptHandoff: inboundRoute({
    method: 'POST',
    path: '/v1/handoffs/{handoffId}/accept',
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['handoff.not_found', 'handoff.not_pending'],
    commonErrors: [],
    description:
      "The Rep the Handoff is offered to takes it and the Prospect is bridged. Repeating it as the same Rep after it was accepted answers 200 with the same Handoff; if another Rep took it, it timed out or it was declined, it is handoff.not_pending (409). When no Rep takes a Handoff, handoff.no_rep_available is what the Agent reports to the Prospect and a Booking is offered. The Rep is the token's: the body names no one.",
  }),
  declineHandoff: inboundRoute({
    method: 'POST',
    path: '/v1/handoffs/{handoffId}/decline',
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['handoff.not_found', 'handoff.not_pending'],
    commonErrors: [],
    description:
      "The Rep the Handoff is offered to declines it and it passes to the next Rep. Repeating it as the same Rep after it was declined answers 200 with the same Handoff; if it is no longer pending for any other reason it is handoff.not_pending (409). The Rep is the token's: the body names no one.",
  }),
})
