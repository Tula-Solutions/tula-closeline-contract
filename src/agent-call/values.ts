import { z } from 'zod'
import { CONTACT_DENIAL_CODES } from '../consent/contact-check'

/** The most attempts a call Step makes, a hard ceiling `voice` enforces whatever `outbound` asks. */
export const MAX_CALL_ATTEMPTS = 3

/** The fewest hours between two attempts of a call Step. */
export const MIN_CALL_RETRY_HOURS = 4

/** What became of one placed Call: a closed set the Sequence branches on. `blocked` is a refusal by the gate; the Call was never dialed. */
export const CALL_RESULTS = [
  'answered',
  'voicemail',
  'no_answer',
  'busy',
  'failed',
  'blocked',
] as const

/** What became of one placed Call. */
export const callResultSchema = z.enum(CALL_RESULTS)

/** What became of one placed Call. */
export type CallResult = z.infer<typeof callResultSchema>

/** The results that are tried again, within the attempt limits. `answered` and `blocked` are not. */
export const RETRYABLE_CALL_RESULTS = [
  'no_answer',
  'busy',
  'voicemail',
  'failed',
] as const satisfies readonly CallResult[]

/** Why an answered Call ended. `opted_out` suppresses the Prospect on the phone channel; `not_interested` does not. */
export const CALL_END_REASONS = [
  'booked',
  'handed_off',
  'not_interested',
  'not_now',
  'opted_out',
  'prospect_hung_up',
  'cap_reached',
  'agent_ended',
] as const

/** Why an answered Call ended. */
export const callEndReasonSchema = z.enum(CALL_END_REASONS)

/** Why an answered Call ended. */
export type CallEndReason = z.infer<typeof callEndReasonSchema>

/**
 * Why the gate refused a Call, an `area.reason` code: the Agent is paused, a Contact Check denial,
 * the Prospect's time zone is unknown or it is outside the calling window, the attempts are used up,
 * or the Line is at its cap (a deferral that does not use an attempt).
 */
export const CALL_GATE_CODES = [
  'agent.paused',
  ...CONTACT_DENIAL_CODES,
  'agent.timezone_unknown',
  'agent.outside_hours',
  'agent_call.attempts_exhausted',
  'agent_call.line_cap_reached',
] as const

/** Why the gate refused a Call. */
export const callGateCodeSchema = z.enum(CALL_GATE_CODES)

/** Why the gate refused a Call. */
export type CallGateCode = z.infer<typeof callGateCodeSchema>

/** Who asked for the Call: a call Step of a Campaign, or a Rep ("call now"). */
export const AGENT_CALL_SOURCES = ['campaign_step', 'rep_request'] as const

/** Who asked for the Call. */
export const agentCallSourceSchema = z.enum(AGENT_CALL_SOURCES)

/** Who asked for the Call. */
export type AgentCallSource = z.infer<typeof agentCallSourceSchema>

/** The states of an Agent Call: `queued` (accepted, waiting for a window or a Line), `dialing`, `live` (the Disclosure has played) and `ended` (with a result). */
export const AGENT_CALL_STATES = ['queued', 'dialing', 'live', 'ended'] as const

/** The state of an Agent Call. */
export const agentCallStateSchema = z.enum(AGENT_CALL_STATES)

/** The state of an Agent Call. */
export type AgentCallState = z.infer<typeof agentCallStateSchema>
