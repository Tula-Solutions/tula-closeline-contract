import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { consentFormIdSchema, consentWordingIdSchema, userIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { boundedTextSchema, hasControlCharacter } from '../prospect/values'
import { CONSENT_CHANNELS, consentChannelSchema, consentTokenSchema } from './values'

/** The longest Consent Wording, in characters. */
export const MAX_CONSENT_WORDING_LENGTH = 5000

/** The longest name of a hosted consent form, in characters. */
export const MAX_CONSENT_FORM_NAME_LENGTH = 100

/** Consent Wording text: trimmed, 1 to 5,000 characters; line breaks and tabs are allowed, other control characters are not. */
export const consentWordingTextSchema = z
  .string()
  .max(MAX_CONSENT_WORDING_LENGTH * 2)
  .trim()
  .pipe(
    z
      .string()
      .min(1)
      .max(MAX_CONSENT_WORDING_LENGTH)
      .refine((text) => !hasControlCharacter(text, true), 'No control characters')
  )

const channelsSchema = z
  .array(consentChannelSchema)
  .min(1)
  .max(CONSENT_CHANNELS.length)
  .refine((channels) => new Set(channels).size === channels.length, 'No repeats')

/**
 * A Consent Wording: the exact text a Prospect is shown when agreeing, for the `channels` it
 * covers. It is immutable once any consent event or published form references it (`locked`); a
 * change is a new version, which names the one it replaces as `supersedesId`. `version` starts at
 * 1 and grows by one per version of the same lineage.
 */
export const consentWordingSchema = z
  .object({
    id: consentWordingIdSchema,
    version: z.number().int().min(1),
    text: consentWordingTextSchema,
    channels: channelsSchema,
    locked: z.boolean(),
    supersedesId: consentWordingIdSchema.nullable(),
    createdAt: timestampSchema,
    createdByUserId: userIdSchema,
  })
  .refine(
    (w) => (w.version === 1) === (w.supersedesId === null),
    'Only version 1 supersedes nothing'
  )

/** A Consent Wording. */
export type ConsentWording = z.infer<typeof consentWordingSchema>

/** The path parameters of a request about one wording. */
export const consentWordingParamsSchema = z.strictObject({ wordingId: consentWordingIdSchema })

/** The body of a request to write a Consent Wording (version 1) or the next version of one. Lawyer-reviewed text is the Organization's to supply. */
export const createConsentWordingRequestSchema = z.strictObject({
  text: consentWordingTextSchema,
  channels: channelsSchema,
})

/** The body of a request to write a Consent Wording. */
export type CreateConsentWordingRequest = z.infer<typeof createConsentWordingRequestSchema>

/** The body of a request to edit a wording that is not yet locked; a locked one is `consent.wording_locked`. At least one field. */
export const updateConsentWordingRequestSchema = z
  .strictObject({ text: consentWordingTextSchema.optional(), channels: channelsSchema.optional() })
  .refine((body) => body.text !== undefined || body.channels !== undefined, 'Change something')

/** The body of a request to edit a wording. */
export type UpdateConsentWordingRequest = z.infer<typeof updateConsentWordingRequestSchema>

/** The query parameters of a request to list wordings, newest first. */
export const listConsentWordingsQuerySchema = pageQuerySchema.strict()

/** One page of wordings. */
export const consentWordingPageSchema = pageSchema(consentWordingSchema)

/** The states of a hosted consent form; publishing locks its wording and closing stops submissions. */
export const CONSENT_FORM_STATES = ['draft', 'published', 'closed'] as const

/** The state of a hosted consent form. */
export const consentFormStateSchema = z.enum(CONSENT_FORM_STATES)

/** The state of a hosted consent form. */
export type ConsentFormState = z.infer<typeof consentFormStateSchema>

/**
 * A hosted consent form: a wording and the `channels` it offers, each with its own unticked
 * choice. `token` and `publishedAt` are set exactly once published (a closed form keeps them);
 * the token goes in the hosted page's URL and is shown to the Organization's Owner and Admin only.
 */
export const consentFormSchema = z
  .object({
    id: consentFormIdSchema,
    wordingId: consentWordingIdSchema,
    name: boundedTextSchema(MAX_CONSENT_FORM_NAME_LENGTH),
    channels: channelsSchema,
    state: consentFormStateSchema,
    token: consentTokenSchema.nullable(),
    createdAt: timestampSchema,
    createdByUserId: userIdSchema,
    publishedAt: timestampSchema.nullable(),
    closedAt: timestampSchema.nullable(),
  })
  .refine(
    (f) =>
      (f.state === 'draft') === (f.token === null) &&
      (f.state === 'draft') === (f.publishedAt === null),
    'A form has a token and a publish time exactly once published'
  )
  .refine(
    (f) => (f.state === 'closed') === (f.closedAt !== null),
    'A form has a close time exactly when closed'
  )

/** A hosted consent form. */
export type ConsentForm = z.infer<typeof consentFormSchema>

/** The path parameters of a request about one form. */
export const consentFormParamsSchema = z.strictObject({ formId: consentFormIdSchema })

/** The body of a request to create a form (a draft) from a wording; the channels must be among the wording's. */
export const createConsentFormRequestSchema = z.strictObject({
  wordingId: consentWordingIdSchema,
  name: boundedTextSchema(MAX_CONSENT_FORM_NAME_LENGTH),
  channels: channelsSchema,
})

/** The body of a request to create a form. */
export type CreateConsentFormRequest = z.infer<typeof createConsentFormRequestSchema>

/** The query parameters of a request to list forms, newest first, optionally one state. */
export const listConsentFormsQuerySchema = pageQuerySchema
  .extend({ state: consentFormStateSchema.optional() })
  .strict()

/** One page of forms. */
export const consentFormPageSchema = pageSchema(consentFormSchema)
