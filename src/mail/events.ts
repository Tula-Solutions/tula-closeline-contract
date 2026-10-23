import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import {
  campaignIdSchema,
  enrollmentIdSchema,
  mailboxIdSchema,
  membershipIdSchema,
  prospectIdSchema,
  sendIdSchema,
} from '../ids'
import { mailProviderMessageIdSchema } from './mail-event'
import { mailboxStateReasonSchema, mailboxStateSchema } from './values'

/**
 * `mailbox.state_changed` (version 1): a Mailbox moved between states, by a person or by the
 * service. `ownerMembershipId` is the person to tell (null for a shared Mailbox, whose Admins are
 * told). `reason` is a closed value; it is null when the new state is not `paused` or
 * `disconnected`. Ids and values only.
 */
export const mailboxStateChangedEvent = defineEvent(
  'mailbox.state_changed',
  1,
  z.strictObject({
    mailboxId: mailboxIdSchema,
    ownerMembershipId: membershipIdSchema.nullable(),
    from: mailboxStateSchema,
    to: mailboxStateSchema,
    reason: mailboxStateReasonSchema.nullable(),
    changedAt: timestampSchema,
  })
)

/** The part of a mail event every message event shares: where it was seen and which send and Enrollment it concerns. Ids only. */
const mailEventShape = {
  mailboxId: mailboxIdSchema,
  prospectId: prospectIdSchema,
  sendId: sendIdSchema.nullable(),
  campaignId: campaignIdSchema.nullable(),
  enrollmentId: enrollmentIdSchema.nullable(),
  providerMessageId: mailProviderMessageIdSchema,
}

/**
 * `mail.bounced` (version 1): a send bounced. A `hard` bounce suppresses the address and stops the
 * Enrollment; a `soft` one is retried within bounds. No address, no provider text.
 */
export const mailBouncedEvent = defineEvent(
  'mail.bounced',
  1,
  z.strictObject({
    ...mailEventShape,
    kind: z.enum(['hard', 'soft']),
    bouncedAt: timestampSchema,
  })
)

/** `mail.complained` (version 1): the provider reported a spam complaint; the Mailbox is paused and the address suppressed. Ids only. */
export const mailComplainedEvent = defineEvent(
  'mail.complained',
  1,
  z.strictObject({ ...mailEventShape, complainedAt: timestampSchema })
)

/**
 * `mail.replied` (version 1): a Prospect replied; the Enrollment stops and the inbox ingests the
 * Message. Ids only: no body, no subject (the inbox fetches the text through its own API).
 */
export const mailRepliedEvent = defineEvent(
  'mail.replied',
  1,
  z.strictObject({ ...mailEventShape, repliedAt: timestampSchema })
)

/** `mail.out_of_office` (version 1): an automatic reply said the Prospect is away; no stop, the Sequence waits until `returnDate` when it is known. Ids and a date. */
export const mailOutOfOfficeEvent = defineEvent(
  'mail.out_of_office',
  1,
  z.strictObject({
    ...mailEventShape,
    returnDate: z.iso.date().nullable(),
    receivedAt: timestampSchema,
  })
)

/**
 * `mail.unsubscribed` (version 1): a Prospect unsubscribed through the link or the one-click
 * header. Outbound has already told core to suppress the address; the Sequence stops. `source` is
 * `link` or `one_click`. Ids only.
 */
export const mailUnsubscribedEvent = defineEvent(
  'mail.unsubscribed',
  1,
  z.strictObject({
    prospectId: prospectIdSchema,
    mailboxId: mailboxIdSchema.nullable(),
    sendId: sendIdSchema.nullable(),
    enrollmentId: enrollmentIdSchema.nullable(),
    source: z.enum(['link', 'one_click']),
    unsubscribedAt: timestampSchema,
  })
)

/** Every mail event, by type. */
export const MAIL_EVENTS = {
  'mailbox.state_changed': mailboxStateChangedEvent,
  'mail.bounced': mailBouncedEvent,
  'mail.complained': mailComplainedEvent,
  'mail.replied': mailRepliedEvent,
  'mail.out_of_office': mailOutOfOfficeEvent,
  'mail.unsubscribed': mailUnsubscribedEvent,
} as const

/** The type of a mail event. */
export type MailEventType = keyof typeof MAIL_EVENTS
