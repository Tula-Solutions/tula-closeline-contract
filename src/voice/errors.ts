import { defineErrors } from '../errors'

/**
 * The errors the voice routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`. A Line or Call of another Organization, or a Call the caller may not
 * see (a Rep's view of another Rep's Call, a Manager's view of a Rep outside their Team), is
 * `line.not_found` or `call.not_found` (404, never 403), so existence is not revealed.
 * `call.not_found` is the code the Playbook already uses for an uploaded Call (`SALES_HISTORY_ERRORS`);
 * voice returns that same code and does not register a second copy.
 *
 * - `call.number_invalid` (422): the number to dial cannot be normalised to E.164, or is one a
 *   Call cannot be placed to. A Contact Check denial is never this error: for a Rep it is a warning
 *   on the placed Call (ADR 0003).
 * - `call.disclosure_failed` (502): the Disclosure could not be played, so the Call never went
 *   live; `details.callId` names the Call, which is `failed`. There is no code or setting that lets
 *   a Call go on without the Disclosure.
 * - `call.line_unavailable` (409): the Organization has no active Line the caller may place a Call
 *   from, or the Line named is released or porting.
 * - `call.limit_reached` (429): the Organization is at its cap of concurrent Calls.
 * - `call.not_ended` (409): the action (wrap-up) needs a Call that has ended.
 * - `line.number_unavailable` (409): the number asked for cannot be bought or ported.
 * - `line.released` (409): the Line is released and cannot be changed.
 * - `line.assignment_invalid` (422): the Team or Rep named for a Line is not in the Organization,
 *   or is not a Rep.
 * - `recording.not_found` (404): the Call has no Recording, or it was deleted.
 * - `recording.not_ready` (409): the Recording is still being stored; try again shortly.
 */
export const VOICE_ERRORS = {
  ...defineErrors('call', {
    number_invalid: { status: 422, message: 'The number is not valid for a Call.' },
    disclosure_failed: {
      status: 502,
      message: 'The Disclosure could not be played, so the Call did not connect.',
    },
    line_unavailable: {
      status: 409,
      message: 'There is no active Line to place this Call from.',
    },
    limit_reached: {
      status: 429,
      message: 'The Organization has reached its limit of concurrent Calls.',
    },
    not_ended: { status: 409, message: 'The Call has not ended yet.' },
  }),
  ...defineErrors('line', {
    not_found: { status: 404, message: 'The Line was not found.' },
    number_unavailable: { status: 409, message: 'This number is not available.' },
    released: { status: 409, message: 'The Line was released and cannot be changed.' },
    assignment_invalid: {
      status: 422,
      message: 'The Team or Rep named for this Line is not valid.',
    },
  }),
  ...defineErrors('recording', {
    not_found: { status: 404, message: 'The Call has no Recording.' },
    not_ready: { status: 409, message: 'The Recording is still being stored. Try again shortly.' },
  }),
} as const

/** A voice error code. */
export type VoiceErrorCode = keyof typeof VOICE_ERRORS
