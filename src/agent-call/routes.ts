import type { AgentErrorCode } from '../agent/errors'
import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute } from '../inbound-route'
import type { ProspectErrorCode } from '../prospect/errors'
import type { Role } from '../tenancy'
import type { VoiceErrorCode } from '../voice/errors'
import type { AgentCallErrorCode } from './errors'

/** The roles that ask the Agent to call a Prospect now and read the Agent Calls of their view. */
export const AGENT_CALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The `agent_call` routes, by name. */
export type AgentCallRouteName =
  | 'requestAgentCall'
  | 'requestRepAgentCall'
  | 'listAgentCalls'
  | 'getAgentCall'

/** One `agent_call` route. */
export type AgentCallRoute = InboundRoute<
  | AgentCallErrorCode
  | Extract<AgentErrorCode, 'agent.paused'>
  | Extract<VoiceErrorCode, 'line.not_found'>
  | Extract<ProspectErrorCode, 'prospect.not_found'>
>

const VISIBILITY =
  'Visibility follows the Prospect: a Rep sees the Agent Calls of Prospects they own, a Manager those of Prospects owned by Reps on their Team, Owner and Admin all; anything else is agent_call.not_found (404), as is one of another Organization.'

const GATE =
  "The request runs the fixed gate, which fails closed: Agents not paused, the Contact Check for the phone channel with purpose agent_initiated (consent.missing, consent.withdrawn, consent.suppressed, consent.unavailable), the calling window in the Prospect's time zone (agent.timezone_unknown, agent.outside_hours), the attempt limits (agent_call.attempts_exhausted) and the Line caps (agent_call.line_cap_reached, a deferral that does not use an attempt). A refusal is a recorded Agent Call: the answer is 201 with result blocked (or state queued and a retryAt for a deferral) and the code in gateCode, never a skipped request. Nothing here turns the gate, the Disclosure or the calling window off (ADR 0003)."

/**
 * The `agent_call` routes (spec M17). A Call is placed by `voice` for `outbound`, or for a Rep.
 * Every list is cursor-paginated with at most 100 items per page. A record of another Organization
 * is always not found.
 */
export const AGENT_CALL_ROUTES: Readonly<Record<AgentCallRouteName, AgentCallRoute>> =
  Object.freeze({
    requestAgentCall: inboundRoute({
      method: 'POST',
      path: '/internal/v1/agent-calls',
      roles: [],
      internal: true,
      serviceToken: { audiences: ['outbound'] },
      success: [201, 200],
      idempotent: true,
      errors: ['agent_call.duplicate', 'line.not_found', 'prospect.not_found'],
      commonErrors: [
        'request.invalid',
        'auth.unauthenticated',
        'auth.forbidden',
        'server.unavailable',
      ],
      description: `Internal: outbound asks voice to place the Call of a call Step. The idempotencyKey in the body is required (<enrollment id>:<step key>:<attempt>): a request without it is request.invalid, and a known key answers 200 with the existing Agent Call and dials once, even after a restart. The Organization is the service token's subject, never a field; only a token whose audience is outbound may call it, any other caller, a user token included, is auth.forbidden (403). ${GATE} An Agent Call to a Prospect already queued, dialing or live is agent_call.duplicate (409) with details.agentCallId. Answers 201 for a new Agent Call. The goal is data for the Agent, never an instruction that overrides the rules.`,
    }),
    requestRepAgentCall: inboundRoute({
      method: 'POST',
      path: '/v1/agent-calls',
      roles: AGENT_CALL_ROLES,
      success: [201, 200],
      idempotent: true,
      keyRequired: true,
      errors: ['agent_call.duplicate', 'line.not_found', 'prospect.not_found'],
      commonErrors: [...IDEMPOTENT_ERRORS],
      description: `A Rep, Manager, Admin or Owner asks the Agent to call one Prospect now, with a goal and no Enrollment, for a Prospect the caller can see (anything else is prospect.not_found, 404). The Idempotency-Key header is required (a request without it is request.invalid): a retry of the same key answers the original Agent Call and dials once; the same key with another body is request.idempotency_key_reused. The Rep's request does not waive the gate: the Agent places the Call, so the Agent rule applies. ${GATE} The request is recorded with source rep_request and counts toward the same limits; the portal shows a refusal to the Rep in words. An Agent Call to a Prospect already queued, dialing or live is agent_call.duplicate (409). Answers 201, or 200 for a replay.`,
    }),
    listAgentCalls: inboundRoute({
      method: 'GET',
      path: '/v1/agent-calls',
      roles: AGENT_CALL_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.invalid'],
      description: `Lists Agent Calls, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100). Filters: state, result, source, prospectId and enrollmentId. ${VISIBILITY} A filter can narrow what the caller sees, never widen it.`,
    }),
    getAgentCall: inboundRoute({
      method: 'GET',
      path: '/v1/agent-calls/{agentCallId}',
      roles: AGENT_CALL_ROLES,
      success: [200],
      idempotent: false,
      errors: ['agent_call.not_found'],
      commonErrors: ['request.invalid'],
      description: `Reads one Agent Call with its state, result, end reason or gate code and the Call id that links its Transcript and Recording. ${VISIBILITY}`,
    }),
  })
