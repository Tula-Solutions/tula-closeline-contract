import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import {
  conversationIdSchema,
  draftIdSchema,
  membershipIdSchema,
  messageIdSchema,
  prospectIdSchema,
} from '../ids'
import {
  confidenceSchema,
  inboxChannelSchema,
  messageFailureReasonSchema,
  replyLabelSchema,
} from './values'

/**
 * `message.approved` (version 1): a Draft was approved, by a person or released by the policy
 * (`approvedByMembershipId` null). The Draft id is the idempotency key for the send: the channel
 * service reads the text from core with it. Ids only: no body, no edit, no note.
 */
export const messageApprovedEvent = defineEvent(
  'message.approved',
  1,
  z.strictObject({
    draftId: draftIdSchema,
    conversationId: conversationIdSchema,
    prospectId: prospectIdSchema,
    channel: inboxChannelSchema,
    approvedByMembershipId: membershipIdSchema.nullable(),
    edited: z.boolean(),
    approvedAt: timestampSchema,
  })
)

/** `message.sent` (version 1): the channel service sent the approved Draft; `messageId` is the stored outbound Message. Ids only. */
export const messageSentEvent = defineEvent(
  'message.sent',
  1,
  z.strictObject({
    draftId: draftIdSchema,
    conversationId: conversationIdSchema,
    messageId: messageIdSchema,
    prospectId: prospectIdSchema,
    channel: inboxChannelSchema,
    sentAt: timestampSchema,
  })
)

/** `message.failed` (version 1): the channel service could not send the approved Draft. A closed reason, never the provider's text. Ids only. */
export const messageFailedEvent = defineEvent(
  'message.failed',
  1,
  z.strictObject({
    draftId: draftIdSchema,
    conversationId: conversationIdSchema,
    prospectId: prospectIdSchema,
    channel: inboxChannelSchema,
    reason: messageFailureReasonSchema,
    retryable: z.boolean(),
    failedAt: timestampSchema,
  })
)

/**
 * `reply.classified` (version 1): an inbound Message got its label. The suppression and sequence
 * services act on `unsubscribe`, `bounce` and `wrong_person`. Ids, the label and the confidence:
 * no text of the reply.
 */
export const replyClassifiedEvent = defineEvent(
  'reply.classified',
  1,
  z.strictObject({
    conversationId: conversationIdSchema,
    messageId: messageIdSchema,
    prospectId: prospectIdSchema,
    channel: inboxChannelSchema,
    label: replyLabelSchema,
    confidence: confidenceSchema,
    classifiedAt: timestampSchema,
  })
)

/** `conversation.taken_over` (version 1): a Rep took a Conversation over; the sequence pauses and `voidedDraftCount` pending Drafts were voided. Ids only. */
export const conversationTakenOverEvent = defineEvent(
  'conversation.taken_over',
  1,
  z.strictObject({
    conversationId: conversationIdSchema,
    prospectId: prospectIdSchema,
    channel: inboxChannelSchema,
    takenOverByMembershipId: membershipIdSchema,
    voidedDraftCount: z.number().int().min(0).max(1000),
    takenOverAt: timestampSchema,
  })
)

/** `conversation.handed_back` (version 1): a Rep handed a Conversation back to the Agent. Ids only. */
export const conversationHandedBackEvent = defineEvent(
  'conversation.handed_back',
  1,
  z.strictObject({
    conversationId: conversationIdSchema,
    prospectId: prospectIdSchema,
    channel: inboxChannelSchema,
    handedBackByMembershipId: membershipIdSchema,
    handedBackAt: timestampSchema,
  })
)

/** Every inbox event, by type. */
export const INBOX_EVENTS = {
  'message.approved': messageApprovedEvent,
  'message.sent': messageSentEvent,
  'message.failed': messageFailedEvent,
  'reply.classified': replyClassifiedEvent,
  'conversation.taken_over': conversationTakenOverEvent,
  'conversation.handed_back': conversationHandedBackEvent,
} as const

/** The type of an inbox event. */
export type InboxEventType = keyof typeof INBOX_EVENTS
