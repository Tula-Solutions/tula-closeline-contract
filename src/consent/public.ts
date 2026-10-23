import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { consentWordingIdSchema } from '../ids'
import { boundedTextSchema } from '../prospect/values'
import {
  addressFieldsShape,
  CONSENT_CHANNELS,
  consentChannelSchema,
  consentTokenSchema,
} from './values'
import { consentWordingTextSchema } from './wording'

/** The path parameters of every public route: the signed token from the link. */
export const consentTokenParamsSchema = z.strictObject({ token: consentTokenSchema })

/** The longest first or last name a person types into the hosted form. */
const MAX_NAME_LENGTH = 100

const PHONE_CHANNELS: readonly string[] = ['phone', 'sms', 'whatsapp']

const choiceSchema = z.strictObject({
  channel: consentChannelSchema,
  agreed: z.boolean(),
})

/**
 * The body of a hosted consent form submission. Each channel the form offers is an explicit,
 * unticked-by-default choice (`agreed` has no default), at least one must be agreed, and the
 * address a channel needs is required: a phone for phone, sms and whatsapp, an email for email.
 * The wording is the one the page showed. The IP address and user agent are read from the request
 * by core as evidence, and the Prospect is found or made by core: neither is in the body. Accepts
 * an `Idempotency-Key`, so a double click records once.
 */
export const hostedConsentSubmissionSchema = z
  .strictObject({
    wordingId: consentWordingIdSchema,
    firstName: boundedTextSchema(MAX_NAME_LENGTH).optional(),
    lastName: boundedTextSchema(MAX_NAME_LENGTH).optional(),
    email: addressFieldsShape.email,
    phone: addressFieldsShape.phone,
    choices: z
      .array(choiceSchema)
      .min(1)
      .max(CONSENT_CHANNELS.length)
      .refine(
        (choices) => new Set(choices.map((c) => c.channel)).size === choices.length,
        'No repeats'
      ),
  })
  .superRefine((body, ctx) => {
    const agreed = body.choices.filter((choice) => choice.agreed)
    if (agreed.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['choices'], message: 'Agree to at least one channel' })
    }
    for (const choice of agreed) {
      if (PHONE_CHANNELS.includes(choice.channel) && body.phone === undefined) {
        ctx.addIssue({ code: 'custom', path: ['phone'], message: 'A phone number is needed' })
      }
      if (choice.channel === 'email' && body.email === undefined) {
        ctx.addIssue({ code: 'custom', path: ['email'], message: 'An email address is needed' })
      }
      if (choice.channel === 'linkedin') {
        ctx.addIssue({
          code: 'custom',
          path: ['choices'],
          message: 'LinkedIn is not offered on a hosted form',
        })
      }
    }
  })

/** The body of a hosted consent form submission. */
export type HostedConsentSubmission = z.infer<typeof hostedConsentSubmissionSchema>

/** What the hosted form page shows: the Organization's name, the exact wording and the channels offered. Nothing about any Prospect. */
export const hostedConsentFormViewSchema = z.object({
  organizationName: boundedTextSchema(200),
  wordingId: consentWordingIdSchema,
  wordingVersion: z.number().int().min(1),
  wordingText: consentWordingTextSchema,
  channels: z.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length),
})

/** What the hosted form page shows. */
export type HostedConsentFormView = z.infer<typeof hostedConsentFormViewSchema>

/** The receipt of a hosted submission: the channels recorded and when. It never repeats the address. */
export const hostedConsentReceiptSchema = z.object({
  channels: z.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length),
  recordedAt: timestampSchema,
})

/** The receipt of a hosted submission. */
export type HostedConsentReceipt = z.infer<typeof hostedConsentReceiptSchema>

/** What the unsubscribe page shows for a link: the Organization's name and the channel, never the address. */
export const unsubscribePreviewSchema = z.object({
  organizationName: boundedTextSchema(200),
  channel: z.literal('email'),
})

/** What the unsubscribe page shows. */
export type UnsubscribePreview = z.infer<typeof unsubscribePreviewSchema>

/** The one-click unsubscribe body of RFC 8058 (`List-Unsubscribe-Post`): exactly this pair. */
export const oneClickUnsubscribeRequestSchema = z.strictObject({
  'List-Unsubscribe': z.literal('One-Click'),
})

/** The one-click unsubscribe body. */
export type OneClickUnsubscribeRequest = z.infer<typeof oneClickUnsubscribeRequestSchema>

/** The receipt of an unsubscribe: it happened and when. A replayed link answers the same. It never repeats the address. */
export const unsubscribeReceiptSchema = z.object({
  unsubscribed: z.literal(true),
  recordedAt: timestampSchema,
})

/** The receipt of an unsubscribe. */
export type UnsubscribeReceipt = z.infer<typeof unsubscribeReceiptSchema>
