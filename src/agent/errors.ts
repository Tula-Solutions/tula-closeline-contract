import { defineErrors } from '../errors'

/**
 * The errors the Inbound Agent routes return, as `area.reason` codes. A role that is not allowed is
 * the common `auth.forbidden`. A Handoff, question or try-it session of another Organization, or one
 * the caller may not see, is the `*.not_found` code (404, never 403). `call.not_found` is the
 * existing code from the Playbook registry and is not registered again here.
 *
 * - `agent.paused` (409): the Inbound Agent is paused, so no callback is placed and no Call is
 *   answered by it. Returned by an action that would have made it act.
 * - `agent.consent_required` (409): there is no Contact Consent for the channel, or it was revoked.
 *   The Agent never acts without one, and there is no setting that changes that (ADR 0003).
 * - `agent.outside_hours` (409): now is outside the hours the Agent may call, in the Prospect's time.
 * - `agent.question_invalid` (422): a Qualification question refers to an unknown question or its
 *   skip logic loops.
 * - `agent.question_not_found` (404): the Qualification question is unknown.
 * - `agent.settings_invalid` (422): the hours, caps or greeting are not usable.
 * - `agent.not_enough_deals` (409): too few won Deals to suggest Qualification questions from.
 * - `agent.session_not_found` (404): the try-it session is unknown, expired or not the caller's.
 * - `handoff.no_rep_available` (409): no Rep could take the Handoff. The Agent then offers a
 *   Booking instead.
 * - `handoff.not_found` (404): the Handoff is unknown or not the caller's.
 * - `handoff.not_pending` (409): the Handoff is no longer waiting for an answer (taken by another
 *   Rep, declined, timed out or finished).
 */
export const AGENT_ERRORS = {
  ...defineErrors('agent', {
    paused: { status: 409, message: 'The Inbound Agent is paused.' },
    consent_required: {
      status: 409,
      message: 'There is no Contact Consent for this channel, so the Inbound Agent will not act.',
    },
    outside_hours: {
      status: 409,
      message: 'It is outside the hours the Inbound Agent may call.',
    },
    question_invalid: { status: 422, message: 'The Qualification question is not valid.' },
    question_not_found: { status: 404, message: 'The Qualification question was not found.' },
    settings_invalid: { status: 422, message: 'The Inbound Agent settings are not valid.' },
    not_enough_deals: {
      status: 409,
      message: 'There are not enough won Deals to suggest Qualification questions.',
    },
    session_not_found: { status: 404, message: 'The try-it session was not found.' },
  }),
  ...defineErrors('handoff', {
    no_rep_available: { status: 409, message: 'No Rep is available to take the Handoff.' },
    not_found: { status: 404, message: 'The Handoff was not found.' },
    not_pending: { status: 409, message: 'The Handoff is no longer waiting for an answer.' },
  }),
} as const

/** An Inbound Agent error code. */
export type AgentErrorCode = keyof typeof AGENT_ERRORS
