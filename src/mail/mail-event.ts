import { z } from 'zod'
import { timestampSchema } from '../core/values'
import {
  enrollmentIdSchema,
  mailboxIdSchema,
  mailEventIdSchema,
  prospectIdSchema,
  sendIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'

/**
 * What a Mailbox can see happen to a message: a `hard_bounce` (the address is dead; suppresses it
 * and stops the Sequence), a `soft_bounce` (retried within bounds), a `complaint` (pauses the
 * Mailbox and suppresses the address), a `reply` (stops the Enrollment and goes to the inbox), an
 * `out_of_office` (no stop; the Sequence waits) and an `unsubscribe`.
 */
export const MAIL_EVENT_KINDS = [
  'hard_bounce',
  'soft_bounce',
  'complaint',
  'reply',
  'out_of_office',
  'unsubscribe',
] as const

/** What a Mailbox can see happen to a message. */
export const mailEventKindSchema = z.enum(MAIL_EVENT_KINDS)

/** What a Mailbox can see happen to a message. */
export type MailEventKind = z.infer<typeof mailEventKindSchema>

/** The id the provider gave a message (an email Message-ID or a Graph id): printable ASCII with no space, 1 to 255 characters. */
export const mailProviderMessageIdSchema = z.string().regex(/^[\x21-\x7e]{1,255}$/)

/**
 * One mail event, as the Admin audits it. `sendId` is the send it concerns (null for an event on a
 * message the Organization did not send through Closeline, such as an unsolicited reply),
 * `enrollmentId` the Enrollment it stopped or paused. `returnDate` is the date an out-of-office
 * gave, only on that kind. It holds no body, no subject and no address: replies are fetched only
 * to be handed to the inbox and are never stored or logged here.
 */
export const mailEventSchema = z
  .object({
    id: mailEventIdSchema,
    mailboxId: mailboxIdSchema,
    kind: mailEventKindSchema,
    sendId: sendIdSchema.nullable(),
    prospectId: prospectIdSchema.nullable(),
    enrollmentId: enrollmentIdSchema.nullable(),
    providerMessageId: mailProviderMessageIdSchema,
    returnDate: z.iso.date().nullable(),
    occurredAt: timestampSchema,
    recordedAt: timestampSchema,
  })
  .superRefine((e, ctx) => {
    if (e.kind !== 'out_of_office' && e.returnDate !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['returnDate'],
        message: 'Only an out-of-office has a return date',
      })
    }
  })

/** One mail event. */
export type MailEvent = z.infer<typeof mailEventSchema>

/** The cursor position a mail event list resumes from: newest first, then id. */
export const mailEventCursorSchema = z.strictObject({
  occurredAt: timestampSchema,
  id: mailEventIdSchema,
})

/** The query of a request to list mail events, newest first, narrowed by Mailbox, kind, Prospect and time. */
export const listMailEventsQuerySchema = pageQuerySchema
  .extend({
    mailboxId: mailboxIdSchema.optional(),
    kind: mailEventKindSchema.optional(),
    prospectId: prospectIdSchema.optional(),
    from: timestampSchema.optional(),
    to: timestampSchema.optional(),
  })
  .strict()

/** The query of a request to list mail events. */
export type ListMailEventsQuery = z.infer<typeof listMailEventsQuerySchema>

/** One page of mail events. */
export const mailEventPageSchema = pageSchema(mailEventSchema)
