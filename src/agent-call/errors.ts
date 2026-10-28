import { defineErrors } from '../errors'

/**
 * The errors the `agent_call` routes return, as `area.reason` codes. A role that is not allowed is
 * the common `auth.forbidden`. An Agent Call of another Organization, or of a Prospect the caller
 * may not see, is `agent_call.not_found` (404, never 403). A gate refusal (`agent.paused`,
 * `consent.*`, `agent.timezone_unknown`, `agent.outside_hours` and the two below) is a recorded
 * result with that code in `gateCode`, not an HTTP error: the request answers the Agent Call.
 *
 * - `agent_call.not_found` (404): the Agent Call is unknown or not the caller's to see.
 * - `agent_call.attempts_exhausted` (409): the Prospect's number was dialed the most the platform
 *   allows (one a day in the Prospect's zone, three in seven days), or the Step used its attempts.
 * - `agent_call.line_cap_reached` (429): the Line is at its concurrent or daily cap. A deferral
 *   that does not use an attempt; `retryAt` says when to ask again.
 * - `agent_call.duplicate` (409): an Agent Call to this Prospect is already queued, dialing or
 *   live; `details.agentCallId` names it, so a caller reads the existing row instead of ringing twice.
 */
export const AGENT_CALL_ERRORS = {
  ...defineErrors('agent_call', {
    not_found: { status: 404, message: 'The Agent Call was not found.' },
    attempts_exhausted: {
      status: 409,
      message: 'This number has been called as often as the Agent may.',
    },
    line_cap_reached: {
      status: 429,
      message: 'The Line is at its limit of Agent Calls. It will be tried again later.',
    },
    duplicate: {
      status: 409,
      message: 'An Agent Call to this Prospect is already under way.',
    },
  }),
} as const

/** An `agent_call` error code. */
export type AgentCallErrorCode = keyof typeof AGENT_CALL_ERRORS
