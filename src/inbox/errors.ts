import { defineErrors } from '../errors'

/**
 * The errors the inbox routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`. A Conversation of another Organization, or one the caller may not see
 * (a Rep's view of another Rep's Conversation), is `inbox.conversation_not_found` (404, never
 * 403), and the same holds for its Messages and Drafts, so existence is not revealed.
 *
 * - `inbox.conversation_not_found` (404): unknown, or not the caller's to see.
 * - `inbox.message_not_found` (404): the Message is unknown or not the caller's to see.
 * - `inbox.draft_not_found` (404): the Draft is unknown or not the caller's to see.
 * - `inbox.draft_not_pending` (409): the Draft was already decided, sent, superseded or voided.
 * - `inbox.not_conversation_owner` (403): the caller can see the Conversation but is not the Rep
 *   who controls it (or, to approve, the Rep who owns it or a role above).
 * - `inbox.draft_ungrounded` (422): the Draft cites no Source and the approval did not
 *   acknowledge it.
 * - `inbox.already_controlled` (409): another Rep already took the Conversation over.
 * - `inbox.takeover_required` (409): a Rep replies only in a Conversation they took over.
 * - `inbox.not_taken_over` (409): the Conversation is not under a Rep's control.
 * - `inbox.conversation_closed` (409): the Conversation is closed.
 * - `inbox.message_not_inbound` (409): only an inbound Message has a label.
 * - `inbox.prospect_suppressed` (409): the Prospect asked to stop on this channel, so nothing is
 *   sent.
 */
export const INBOX_ERRORS = {
  ...defineErrors('inbox', {
    conversation_not_found: { status: 404, message: 'The Conversation was not found.' },
    message_not_found: { status: 404, message: 'The Message was not found.' },
    draft_not_found: { status: 404, message: 'The Draft was not found.' },
    draft_not_pending: { status: 409, message: 'The Draft is no longer waiting for a decision.' },
    not_conversation_owner: {
      status: 403,
      message: 'This Conversation is not yours to act on.',
    },
    draft_ungrounded: {
      status: 422,
      message: 'The Draft cites no Playbook source. Confirm it before it is approved.',
    },
    already_controlled: {
      status: 409,
      message: 'Another Rep has already taken over this Conversation.',
    },
    takeover_required: { status: 409, message: 'Take over the Conversation before replying.' },
    not_taken_over: { status: 409, message: 'The Conversation is not taken over.' },
    conversation_closed: { status: 409, message: 'The Conversation is closed.' },
    message_not_inbound: { status: 409, message: 'Only a reply from a Prospect has a label.' },
    prospect_suppressed: {
      status: 409,
      message: 'The Prospect asked not to be contacted on this channel.',
    },
  }),
} as const

/** An inbox error code. */
export type InboxErrorCode = keyof typeof INBOX_ERRORS
