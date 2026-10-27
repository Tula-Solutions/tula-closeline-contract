import { IDEMPOTENT_ERRORS, type InboundRoute } from '../inbound-route'
import type { SalesHistoryErrorCode } from '../playbook/sales-history-errors'
import type { ProspectErrorCode } from '../prospect/errors'
import type { Role } from '../tenancy'
import type { VoiceErrorCode } from './errors'

/** The roles that may use the Softphone and read the Lines and Calls they can see. */
export const VOICE_ALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The roles that manage Lines and delete Recordings. */
export const VOICE_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The voice routes, by name. */
export type VoiceRouteName =
  | 'listLines'
  | 'addLine'
  | 'getLine'
  | 'assignLine'
  | 'releaseLine'
  | 'placeCall'
  | 'listCalls'
  | 'getCall'
  | 'getCallTranscript'
  | 'getCallRecording'
  | 'deleteCallRecording'
  | 'wrapUpCall'
  | 'mintSoftphoneToken'

/** What the service needs to describe one route: method, path, who may call it, what it answers. */
export type VoiceRoute = Omit<
  InboundRoute<
    VoiceErrorCode | Extract<SalesHistoryErrorCode, 'call.not_found'> | ProspectErrorCode
  >,
  'public' | 'internal' | 'serviceToken' | 'etag'
>

const route = (definition: VoiceRoute): VoiceRoute => Object.freeze(definition)

const CALL_VISIBILITY =
  'Visibility is decided from the token: a Rep sees the Calls they took, a Manager those of the Reps on their Team, Owner and Admin every Call; anything else is call.not_found (404), as is a Call of another Organization.'

/**
 * The voice routes (spec M12). Every route may also return the common `auth.*`, `rate.limited`
 * and `server.*` codes. Every list is cursor-paginated with at most 100 items per page. A record of
 * another Organization is always not found. The Provider's webhooks are internal routes of the
 * voice service and are not part of this contract. No route or body can switch off the Disclosure
 * or the Recording, and none checks Contact Consent for a Rep: a Rep may call any Prospect, with a
 * warning from the Contact Check (ADR 0003).
 */
export const VOICE_ROUTES: Readonly<Record<VoiceRouteName, VoiceRoute>> = Object.freeze({
  listLines: route({
    method: 'GET',
    path: '/v1/lines',
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      "Lists the Organization's Lines, newest first, one cursor-paginated page at a time (at most 100); optionally one state. Every role may read them, to choose a caller identity.",
  }),
  addLine: route({
    method: 'POST',
    path: '/v1/lines',
    roles: VOICE_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ['line.number_unavailable'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Adds a Line by buying a new number (country, optional area code) or porting one the Organization owns (the Line is porting until the carrier completes). A number that cannot be had is line.number_unavailable (409). The Idempotency-Key header is required (a request without it is request.invalid), so a retry after a timeout never buys a second number; the same key with another body is request.idempotency_key_reused. Owner and Admin only. Answers 201, or 200 with the original Line for a replay of the same Idempotency-Key.',
  }),
  getLine: route({
    method: 'GET',
    path: '/v1/lines/{lineId}',
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['line.not_found'],
    commonErrors: ['request.invalid'],
    description: 'Reads one Line. A Line of another Organization is line.not_found (404).',
  }),
  assignLine: route({
    method: 'PUT',
    path: '/v1/lines/{lineId}/assignment',
    roles: VOICE_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['line.not_found', 'line.released', 'line.assignment_invalid'],
    commonErrors: ['request.invalid'],
    description:
      'Sets who inbound Calls on a Line ring: a Team, one Rep, or nobody. Setting the assignment it already has answers 200 with the Line unchanged. A released Line is line.released (409); a Team or Rep that is not in the Organization, or is not a Rep, is line.assignment_invalid (422). Owner and Admin only.',
  }),
  releaseLine: route({
    method: 'POST',
    path: '/v1/lines/{lineId}/release',
    roles: VOICE_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['line.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Gives a Line up: its number goes back to the carrier and its assignment is cleared. Calls already made on it stay. Idempotent by end state: releasing a released Line answers 200 with it. Takes no body. Owner and Admin only.',
  }),
  placeCall: route({
    method: 'POST',
    path: '/v1/calls',
    roles: VOICE_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'call.number_invalid',
      'call.line_unavailable',
      'call.limit_reached',
      'call.disclosure_failed',
      'line.not_found',
      'prospect.not_found',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      "Places a Call from the caller's browser to a number. The Idempotency-Key header is required (a request without it is request.invalid): a retry of the same key answers the original Call and dials once; the same key with another body is request.idempotency_key_reused. The number is normalised to E.164 (call.number_invalid, 422, when it cannot be). The Call is recorded and a Disclosure plays before the two sides are bridged; a Call whose Disclosure fails ends failed and never goes live (call.disclosure_failed, 502, with the Call id in details). A Rep may call any Prospect (ADR 0003): the Contact Check on the number is a warning in the answer, never a refusal. A Line the caller may not use is line.not_found; a prospectId the caller may not see is prospect.not_found. At the Organization's cap of concurrent Calls it is call.limit_reached (429). Answers 201, or 200 for a replay.",
  }),
  listCalls: route({
    method: 'GET',
    path: '/v1/calls',
    roles: VOICE_ALL_ROLES,
    publicApi: { scope: 'calls:read' },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists Calls, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100). Filters: direction, state, repMembershipId, lineId, prospectId, and from and to on createdAt. ${CALL_VISIBILITY} A filter can narrow what the caller sees, never widen it.`,
  }),
  getCall: route({
    method: 'GET',
    path: '/v1/calls/{callId}',
    roles: VOICE_ALL_ROLES,
    publicApi: { scope: 'calls:read' },
    success: [200],
    idempotent: false,
    errors: ['call.not_found'],
    commonErrors: ['request.invalid'],
    description: `Reads one Call with its state, times, the wording version and time of its Disclosure, and the state of its Recording and Transcript. ${CALL_VISIBILITY}`,
  }),
  getCallTranscript: route({
    method: 'GET',
    path: '/v1/calls/{callId}/transcript',
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['call.not_found'],
    commonErrors: ['request.invalid'],
    description: `Reads the Transcript of a Call in time order, one cursor-paginated page of turns at a time (at most 100), each attributed to the Rep or the Prospect. The state says whether it is pending, ready or deleted; turns exist only when ready. The text is never logged. ${CALL_VISIBILITY}`,
  }),
  getCallRecording: route({
    method: 'GET',
    path: '/v1/calls/{callId}/recording',
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['call.not_found', 'recording.not_found', 'recording.not_ready'],
    commonErrors: ['request.invalid'],
    description: `Answers a short-lived signed URL to play the two-channel Recording of a Call. A Call with no Recording, or whose Recording was deleted, is recording.not_found (404); one still being stored is recording.not_ready (409). The URL is a credential and is never logged. ${CALL_VISIBILITY}`,
  }),
  deleteCallRecording: route({
    method: 'DELETE',
    path: '/v1/calls/{callId}/recording',
    roles: VOICE_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['call.not_found', 'call.not_ended'],
    commonErrors: ['request.invalid'],
    description:
      'Deletes the Recording of a Call and its Transcript, to honour a deletion request; the Call record stays with both states deleted. Idempotent by end state: a Call whose Recording is already deleted, or never existed, answers 200 with the Call. A Call that has not ended is call.not_ended (409). Owner and Admin only.',
  }),
  wrapUpCall: route({
    method: 'PUT',
    path: '/v1/calls/{callId}/wrap-up',
    roles: VOICE_ALL_ROLES,
    publicApi: { scope: 'calls:write' },
    success: [200],
    idempotent: false,
    errors: ['call.not_found', 'call.not_ended'],
    commonErrors: ['request.invalid'],
    description:
      'Sets the wrap-up of an ended Call: the Deal identifier that joins it to a Deal in the Playbook, and a note. A field left out is left alone and null clears it. A Call that has not ended is call.not_ended (409). Only the Rep who took the Call, Owner and Admin may wrap it up; for any other caller the Call is call.not_found (404), a Manager of that Rep included.',
  }),
  mintSoftphoneToken: route({
    method: 'POST',
    path: '/v1/softphone/token',
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description:
      "Mints a short-lived token (at most an hour) for the caller's browser to register the Softphone with the telephony provider. Each call mints a new one. The token is a credential for the caller alone and is never logged. If the provider cannot be reached it is server.unavailable. Takes no body.",
  }),
})
