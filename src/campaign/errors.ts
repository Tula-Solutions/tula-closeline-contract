import { defineErrors } from '../errors'

/**
 * The errors the campaign routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`. A Campaign, Enrollment or Play outside the caller's view (a Rep's
 * view of another Rep's Campaign, or another Organization's) is its `*.not_found` (404, never
 * 403), so existence is not revealed.
 *
 * - `campaign.not_found` (404): unknown or not the caller's to see.
 * - `campaign.invalid_state` (409): the action does not fit the Campaign's state (launching an
 *   archived one, editing a running Sequence, pausing a draft).
 * - `campaign.invalid_sequence` (422): the Sequence has a cycle without a wait, an unreachable
 *   Step, an unknown target, a duplicate key or a Step that cannot reach an end; `details` lists
 *   the problems as closed codes (`SEQUENCE_PROBLEMS`). A branch without a default or a wrong
 *   Variant count is `request.invalid` at the edge.
 * - `campaign.sequence_version_conflict` (409): the Sequence was saved since the caller read it.
 * - `campaign.not_previewed` (409): launch needs the current Sequence version previewed.
 * - `campaign.no_healthy_mailbox` (409): no healthy connected Mailbox can send for the Campaign.
 * - `campaign.audience_empty` (409): nobody in the audience is eligible.
 * - `campaign.audience_check_pending` (409): the audience check has not finished for the current
 *   audience; start or wait for one.
 * - `enrollment.not_found` (404): unknown or not the caller's to see.
 * - `enrollment.suppressed` (409): the Prospect's address is suppressed; it is not enrolled.
 * - `enrollment.no_consent` (409): the Prospect has no Contact Consent for email.
 * - `enrollment.already_active` (409): the Prospect is already in an active Campaign.
 * - `variant.not_found` (404): the Step has no such Variant, or the Step has no test.
 * - `variant.invalid_weights` (422): Variants are not two to four with weights adding up to 100;
 *   `details` carries the weights' total.
 * - `variant.already_promoted` (409): a winner was already promoted for the Step.
 * - `play.not_found` (404): unknown or not in the Organization.
 * - `play.no_evidence` (409): accepting a Play that cites no evidence needs the acknowledgement.
 * - `play.read_only` (409): a built-in Play cannot be changed.
 * - `play.invalid_state` (409): the Play's status does not allow it (accepting a discarded one).
 */
export const CAMPAIGN_ERRORS = {
  ...defineErrors('campaign', {
    not_found: { status: 404, message: 'The Campaign was not found.' },
    invalid_state: { status: 409, message: 'The Campaign is not in a state that allows this.' },
    invalid_sequence: { status: 422, message: 'The Sequence is not valid.' },
    sequence_version_conflict: {
      status: 409,
      message: 'The Sequence changed since it was read. Reload it and try again.',
    },
    not_previewed: { status: 409, message: 'Preview the current Sequence before launching.' },
    no_healthy_mailbox: { status: 409, message: 'No healthy Mailbox is available to send from.' },
    audience_empty: { status: 409, message: 'Nobody in the audience can be contacted.' },
    audience_check_pending: {
      status: 409,
      message: 'The audience check has not finished for the current audience.',
    },
  }),
  ...defineErrors('enrollment', {
    not_found: { status: 404, message: 'The Enrollment was not found.' },
    suppressed: { status: 409, message: 'This address must not be contacted.' },
    no_consent: { status: 409, message: 'There is no consent to contact this Prospect by email.' },
    already_active: { status: 409, message: 'The Prospect is already in an active Campaign.' },
  }),
  ...defineErrors('variant', {
    not_found: { status: 404, message: 'The Variant was not found.' },
    invalid_weights: {
      status: 422,
      message: 'A test needs two to four Variants whose weights add up to 100.',
    },
    already_promoted: { status: 409, message: 'A winner was already promoted for this Step.' },
  }),
  ...defineErrors('play', {
    not_found: { status: 404, message: 'The Play was not found.' },
    no_evidence: {
      status: 409,
      message: 'This Play cites no evidence. Confirm that you want to accept it anyway.',
    },
    read_only: { status: 409, message: 'A built-in Play cannot be changed.' },
    invalid_state: { status: 409, message: 'The Play is not in a state that allows this.' },
  }),
} as const

/** An error code the campaign routes return. */
export type CampaignErrorCode = keyof typeof CAMPAIGN_ERRORS
