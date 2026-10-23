import { defineErrors } from '../errors'

/**
 * The errors the Copilot routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`. A Call the caller may not see, or of another Organization, is the
 * existing `call.not_found` (404, never 403). A card of such a Call is `card.not_found` as well.
 *
 * - `copilot.disabled` (409): the Copilot is off for this Call, because the Organization has it
 *   off or the Rep dialed without it; there is nothing to stream.
 * - `copilot.not_started` (409): the Call has not yet reached its Disclosure (it is still
 *   ringing or connecting), so there is no Copilot to stream from; try again shortly. Once the
 *   Disclosure is playing, the stream opens and says it is waiting. The Copilot never runs before
 *   the Disclosure has played, and no code or setting changes that (ADR 0003).
 * - `copilot.min_evidence_invalid` (422): the minimum Evidence asked for is outside 1 to 20, or
 *   asks for more distinct Deals than Moments.
 * - `card.not_found` (404): no such card on that Call, or one the caller may not see.
 */
export const COPILOT_ERRORS = {
  ...defineErrors('copilot', {
    disabled: { status: 409, message: 'The Copilot is off for this Call.' },
    not_started: { status: 409, message: 'The Copilot has not started on this Call yet.' },
    min_evidence_invalid: {
      status: 422,
      message: 'The minimum evidence is not valid.',
    },
  }),
  ...defineErrors('card', {
    not_found: { status: 404, message: 'The card was not found.' },
  }),
} as const

/** A Copilot error code. */
export type CopilotErrorCode = keyof typeof COPILOT_ERRORS
