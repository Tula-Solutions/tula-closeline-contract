import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { contactCheckIdSchema, organizationIdSchema, prospectIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  addressFieldsShape,
  consentChannelSchema,
  contactPurposeSchema,
  suppressionReasonSchema,
} from './values'

/**
 * The denial codes of a Contact Check (ADR 0003, ADR 0021). A denial is a typed result of a
 * successful call, never an HTTP error: the caller branches on `code`. `consent.unavailable` is
 * not answered by core: the kit's client synthesises it when core times out or answers 5xx, so a
 * failed check is a denial and never an allowance.
 */
export const CONTACT_DENIAL_CODES = [
  'consent.missing',
  'consent.withdrawn',
  'consent.suppressed',
  'consent.unavailable',
] as const

/** A code that denies a contact. */
export const contactDenialCodeSchema = z.enum(CONTACT_DENIAL_CODES)

/** A code that denies a contact. */
export type ContactDenialCode = z.infer<typeof contactDenialCodeSchema>

/** Why a contact was allowed: a granted consent, a Rep acting on a Prospect, an answer to the Prospect's own message, or an email to an address that is not suppressed. The basis is informative and the denial rules do not depend on it; a LinkedIn contact is allowed on `rep_initiated` or `reply`. */
export const CONTACT_ALLOW_BASES = [
  'consent_granted',
  'rep_initiated',
  'reply',
  'email_no_suppression',
] as const

/** The longest name of a calling service. */
const MAX_CALLER_LENGTH = 32

/** The address field a channel is reached on. */
const ADDRESS_FIELD_OF_CHANNEL = {
  phone: 'phone',
  sms: 'phone',
  whatsapp: 'phone',
  email: 'email',
  linkedin: 'linkedinUrl',
} as const

/**
 * Internal: the body of a Contact Check. The calling service has no user token, so it names the
 * Organization (ADR 0013) and itself as `caller`; the purpose is set by that service from what it
 * is about to do, and there is no field that waives the check. The target is either exactly one
 * address (an email, a phone or a LinkedIn address, which core normalises) with no `prospectId`,
 * or a `prospectId` with at most one address. With both, the address must be of the channel's kind
 * (`phone` for phone, sms and whatsapp, `email` for email, `linkedinUrl` for linkedin) and core
 * then requires it to belong to that Prospect's stored identities, checks Suppression on that
 * address, and reads consent from the Prospect's ledger.
 */
export const contactCheckRequestSchema = z
  .strictObject({
    organizationId: organizationIdSchema,
    prospectId: prospectIdSchema.optional(),
    ...addressFieldsShape,
    channel: consentChannelSchema,
    purpose: contactPurposeSchema,
    caller: z
      .string()
      .min(1)
      .max(MAX_CALLER_LENGTH)
      .regex(/^[a-z][a-z0-9_-]*$/),
  })
  .superRefine((body, ctx) => {
    const given = (['email', 'phone', 'linkedinUrl'] as const).filter(
      (field) => body[field] !== undefined
    )
    if (given.length > 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'Give at most one of email, phone or linkedinUrl',
      })
      return
    }
    if (body.prospectId === undefined && given.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Give a prospectId or exactly one of email, phone or linkedinUrl',
      })
      return
    }
    const field = given[0]
    if (body.prospectId !== undefined && field !== undefined) {
      const expected = ADDRESS_FIELD_OF_CHANNEL[body.channel]
      if (field !== expected) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: `With a prospectId, a ${body.channel} check takes ${expected}, not ${field}`,
        })
      }
    }
  })

/** The body of a Contact Check. */
export type ContactCheckRequest = z.infer<typeof contactCheckRequestSchema>

const allowedSchema = z.strictObject({
  allowed: z.literal(true),
  checkId: contactCheckIdSchema,
  basis: z.enum(CONTACT_ALLOW_BASES),
})

const deniedSchema = z
  .strictObject({
    allowed: z.literal(false),
    checkId: contactCheckIdSchema.nullable(),
    code: contactDenialCodeSchema,
    suppressionReason: suppressionReasonSchema.nullable(),
  })
  .refine(
    (r) => (r.code === 'consent.suppressed') === (r.suppressionReason !== null),
    'Only a suppressed denial carries a Suppression reason'
  )
  .refine(
    (r) => (r.code === 'consent.unavailable') === (r.checkId === null),
    'Only an unavailable denial has no logged check'
  )

/**
 * The answer to a Contact Check: an allowance with its `basis`, or a denial with a `consent.*`
 * `code`. Every answered check is logged under `checkId`; a denial for a Prospect that does not
 * exist is `consent.missing`, so the answer never reveals whether a record exists.
 */
export const contactCheckResultSchema = z.union([allowedSchema, deniedSchema])

/** The answer to a Contact Check. */
export type ContactCheckResult = z.infer<typeof contactCheckResultSchema>

/** One logged Contact Check, for the Organization's audit. The address is never stored with it. */
export const contactCheckLogEntrySchema = z.object({
  id: contactCheckIdSchema,
  prospectId: prospectIdSchema.nullable(),
  channel: consentChannelSchema,
  purpose: contactPurposeSchema,
  caller: z.string().min(1).max(MAX_CALLER_LENGTH),
  allowed: z.boolean(),
  code: contactDenialCodeSchema.nullable(),
  basis: z.enum(CONTACT_ALLOW_BASES).nullable(),
  checkedAt: timestampSchema,
})

/** One logged Contact Check. */
export type ContactCheckLogEntry = z.infer<typeof contactCheckLogEntrySchema>

/** The query parameters of a request to list logged Contact Checks, newest first, with optional filters. */
export const listContactChecksQuerySchema = pageQuerySchema
  .extend({
    channel: consentChannelSchema.optional(),
    purpose: contactPurposeSchema.optional(),
    allowed: z.enum(['true', 'false']).optional(),
    prospectId: prospectIdSchema.optional(),
    code: contactDenialCodeSchema.optional(),
  })
  .strict()

/** The query parameters of a request to list logged Contact Checks. */
export type ListContactChecksQuery = z.infer<typeof listContactChecksQuerySchema>

/** One page of logged Contact Checks. */
export const contactCheckLogPageSchema = pageSchema(contactCheckLogEntrySchema)
