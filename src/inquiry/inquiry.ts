import { z } from 'zod'
import { idempotencyKeySchema, personNameSchema, timestampSchema } from '../core/values'
import { emailSchema } from '../email'
import {
  callIdSchema,
  chatIdSchema,
  consentWordingIdSchema,
  inquiryIdSchema,
  membershipIdSchema,
  prospectIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { boundedTextSchema, rawPhoneSchema } from '../prospect/values'
import { qualificationSchema } from './qualification'
import {
  allowedOriginSchema,
  INQUIRY_CALLBACK_STATES,
  inquiryCallbackStateSchema,
  inquiryKeySchema,
  inquiryMessageSchema,
  inquirySkipReasonSchema,
  inquirySourceSchema,
  MAX_ALLOWED_ORIGINS,
  MAX_CALLBACK_ATTEMPTS,
  MAX_HONEYPOT_LENGTH,
  sourceUrlSchema,
} from './values'

/**
 * The callback of a form Inquiry. `skipReason` is set exactly when the state is `skipped`, so a
 * callback that did not happen always says why. `attempts` counts dials (at most three) and
 * `nextAttemptAt` is set while a retry waits (`no_answer`). Each attempt re-checks the Contact
 * Consent for the phone channel at dial time; no field here can waive that check (ADR 0003).
 */
export const inquiryCallbackSchema = z
  .strictObject({
    state: inquiryCallbackStateSchema,
    skipReason: inquirySkipReasonSchema.nullable(),
    attempts: z.number().int().min(0).max(MAX_CALLBACK_ATTEMPTS),
    nextAttemptAt: timestampSchema.nullable(),
    lastAttemptAt: timestampSchema.nullable(),
  })
  .superRefine((cb, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    if ((cb.state === 'skipped') !== (cb.skipReason !== null)) {
      issue('skipReason', 'Only a skipped callback has a reason')
    }
    if (cb.state !== 'no_answer' && cb.nextAttemptAt !== null) {
      issue('nextAttemptAt', 'Only a callback waiting for a retry has a next attempt')
    }
    if (cb.state === 'not_applicable' && cb.attempts !== 0) {
      issue('attempts', 'A callback that does not apply was never dialled')
    }
  })

/** The callback of a form Inquiry. */
export type InquiryCallback = z.infer<typeof inquiryCallbackSchema>

/**
 * The Contact Consent evidence an Inquiry carries: the channel, the exact wording version shown
 * and the page it was shown on. The wording text itself is in core's ledger. `phoneGranted` is
 * whether the Prospect ticked the callback box.
 */
export const inquiryConsentSchema = z.strictObject({
  wordingId: consentWordingIdSchema,
  wordingVersion: z.number().int().min(1),
  sourceUrl: sourceUrlSchema,
  phoneGranted: z.boolean(),
})

/**
 * An Inquiry: a request from a Prospect through a form, a Chat or a Call to talk to the
 * Organization. `consent` is set for a form (and a Chat that captured a callback consent) and null
 * for a Call. The Prospect's name, email and number are on the Prospect, not here. `chatId` is set
 * exactly for a Chat Inquiry and `callId` for a Call Inquiry or once a callback connected.
 */
export const inquirySchema = z
  .strictObject({
    id: inquiryIdSchema,
    source: inquirySourceSchema,
    prospectId: prospectIdSchema,
    assignedToMembershipId: membershipIdSchema.nullable(),
    chatId: chatIdSchema.nullable(),
    callId: callIdSchema.nullable(),
    consent: inquiryConsentSchema.nullable(),
    callback: inquiryCallbackSchema,
    qualification: qualificationSchema,
    receivedAt: timestampSchema,
  })
  .superRefine((inq, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    if (inq.source === 'form' && inq.consent === null) {
      issue('consent', 'A form Inquiry carries its consent evidence')
    }
    if (inq.source === 'chat' && inq.chatId === null) {
      issue('chatId', 'A Chat Inquiry names its Chat')
    }
    if (inq.source !== 'chat' && inq.chatId !== null) {
      issue('chatId', 'Only a Chat Inquiry names a Chat')
    }
    if (inq.source === 'call' && inq.callId === null) {
      issue('callId', 'A Call Inquiry names its Call')
    }
    if (inq.source !== 'form' && inq.callback.state !== 'not_applicable' && inq.consent === null) {
      issue('callback', 'A callback needs the consent evidence it was based on')
    }
    const dialled = !['not_applicable', 'skipped'].includes(inq.callback.state)
    if (dialled && inq.consent?.phoneGranted !== true) {
      issue('callback', 'A callback is placed only with phone consent (ADR 0003)')
    }
    if (inq.source === 'call' && inq.callback.state !== 'not_applicable') {
      issue('callback', 'A Call Inquiry is not called back')
    }
  })

/** An Inquiry. */
export type Inquiry = z.infer<typeof inquirySchema>

/** The path parameters of a request about one Inquiry. */
export const inquiryParamsSchema = z.strictObject({ inquiryId: inquiryIdSchema })

/** The cursor position an Inquiry list resumes from: latest first, then id. */
export const inquiryCursorSchema = z.strictObject({
  receivedAt: timestampSchema,
  id: inquiryIdSchema,
})

/**
 * The query parameters of a request to list Inquiries: latest first, one cursor-paginated page at
 * a time, optionally narrowed by source, callback state, Prospect and a time range. What the
 * caller sees is decided from the token and a filter never widens it.
 */
export const listInquiriesQuerySchema = pageQuerySchema
  .extend({
    source: inquirySourceSchema.optional(),
    callbackState: z.enum(INQUIRY_CALLBACK_STATES).optional(),
    prospectId: prospectIdSchema.optional(),
    from: timestampSchema.optional(),
    to: timestampSchema.optional(),
  })
  .strict()
  .refine(
    (q) => q.from === undefined || q.to === undefined || Date.parse(q.to) > Date.parse(q.from),
    { message: 'The range ends after it starts', path: ['to'] }
  )

/** The query parameters of a request to list Inquiries. */
export type ListInquiriesQuery = z.infer<typeof listInquiriesQuerySchema>

/** One page of Inquiries. */
export const inquiryPageSchema = pageSchema(inquirySchema)

/** The headers of a request that requires an `Idempotency-Key` (header names arrive lower-cased). */
export const inquiryKeyedHeadersSchema = z.object({ 'idempotency-key': idempotencyKeySchema })

/**
 * The embed settings of an Organization's Inquiry form and Chat: the publishable key, the origins
 * allowed to submit and the Consent Wording the form displays (null until chosen; an embed with no
 * wording is not live). Only Owner and Admin read them.
 */
export const inquiryEmbedSchema = z.strictObject({
  publishableKey: inquiryKeySchema,
  allowedOrigins: z.array(allowedOriginSchema).max(MAX_ALLOWED_ORIGINS),
  consentWordingId: consentWordingIdSchema.nullable(),
  updatedAt: timestampSchema.nullable(),
})

/** The embed settings. */
export type InquiryEmbed = z.infer<typeof inquiryEmbedSchema>

/** The body of a request to set the allowed origins and the displayed wording; it replaces them, so a repeat changes nothing. */
export const setInquiryEmbedRequestSchema = z.strictObject({
  allowedOrigins: z
    .array(allowedOriginSchema)
    .max(MAX_ALLOWED_ORIGINS)
    .refine((o) => new Set(o).size === o.length, 'No repeats'),
  consentWordingId: consentWordingIdSchema,
})

/** The body of a request to set the embed settings. */
export type SetInquiryEmbedRequest = z.infer<typeof setInquiryEmbedRequestSchema>

/** The path parameters of every public Inquiry route: the publishable key. */
export const publicInquiryParamsSchema = z.strictObject({ key: inquiryKeySchema })

/**
 * The headers of a public request that does not change anything: the `Origin` the browser sends,
 * which must be one of the Organization's allowed origins (`inquiry.origin_not_allowed`).
 */
export const publicOriginHeadersSchema = z.object({ origin: allowedOriginSchema })

/**
 * The headers of a public submission: the `Origin` and a required `Idempotency-Key` (16 to 128
 * characters; the client generates one per submission), so a double click records one Inquiry and
 * causes one callback.
 */
export const publicInquiryHeadersSchema = z.object({
  origin: allowedOriginSchema,
  'idempotency-key': idempotencyKeySchema,
})

/** The name an Organization shows on its form, shortened for a public page. */
const publicNameSchema = boundedTextSchema(200)

/**
 * What the embedded form displays: the Organization's name, the exact Consent Wording to show next
 * to the callback box (and its id and version, to send back) and that an AI will make the call. It
 * has nothing about any Prospect, Rep or internal id beyond the wording.
 */
export const publicInquiryFormViewSchema = z.strictObject({
  organizationName: publicNameSchema,
  wordingId: consentWordingIdSchema,
  wordingVersion: z.number().int().min(1),
  wordingText: boundedTextSchema(5000),
  aiNotice: boundedTextSchema(500),
})

/** What the embedded form displays. */
export type PublicInquiryFormView = z.infer<typeof publicInquiryFormViewSchema>

/**
 * The body of a public Inquiry from the embedded form. The wording id and version are the ones
 * the form displayed and `sourceUrl` is the page it was on: all three are required, so an embed
 * that omits the wording is refused here, and the service refuses a version that is not the one it
 * served as `inquiry.consent_wording_missing`. `callbackConsent` has no default (the box is
 * unticked); when false the Inquiry is stored and no callback is placed. The honeypot, `website`,
 * is a field the form hides from people: a non-empty value marks a bot and still parses, so the
 * service answers as for a real request and stores nothing. The idempotency key is the
 * `Idempotency-Key` header (`publicInquiryHeadersSchema`).
 */
export const publicInquiryRequestSchema = z.strictObject({
  name: personNameSchema,
  phone: rawPhoneSchema,
  email: emailSchema.optional(),
  message: inquiryMessageSchema.optional(),
  consentWordingId: consentWordingIdSchema,
  consentWordingVersion: z.number().int().min(1),
  callbackConsent: z.boolean(),
  sourceUrl: sourceUrlSchema,
  website: z.string().max(MAX_HONEYPOT_LENGTH).default(''),
})

/** The body of a public Inquiry. */
export type PublicInquiryRequest = z.infer<typeof publicInquiryRequestSchema>

/**
 * The receipt a Prospect gets: that it arrived, and when. It says nothing about whether a call is
 * coming, so a public caller cannot learn whether a number is suppressed, revoked or blocked by a
 * paused Agent or the hours. No Inquiry, Prospect, Rep or Organization id, and no echo of the
 * address or number.
 */
export const publicInquiryReceiptSchema = z.strictObject({
  received: z.literal(true),
  receivedAt: timestampSchema,
})

/** The receipt a Prospect gets. */
export type PublicInquiryReceipt = z.infer<typeof publicInquiryReceiptSchema>
