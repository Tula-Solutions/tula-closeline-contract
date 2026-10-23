import { z } from 'zod'
import { emailSchema } from '../email'
import { boundedTextSchema, rawLinkedinUrlSchema, rawPhoneSchema } from '../prospect/values'

/** The channels a Prospect can be contacted on, and a Contact Consent or Suppression can name. */
export const CONSENT_CHANNELS = ['phone', 'sms', 'whatsapp', 'email', 'linkedin'] as const

/** A channel a Prospect can be contacted on. */
export const consentChannelSchema = z.enum(CONSENT_CHANNELS)

/** A channel a Prospect can be contacted on. */
export type ConsentChannel = z.infer<typeof consentChannelSchema>

/**
 * The channels where an Agent-initiated contact needs a granted Contact Consent (ADR 0003). Email
 * needs no Suppression and an unsubscribe path instead. This is a fact of the rule, not a setting.
 */
export const CONSENT_REQUIRED_CHANNELS = [
  'phone',
  'sms',
  'whatsapp',
] as const satisfies readonly (typeof CONSENT_CHANNELS)[number][]

/** Where a granted Contact Consent came from. Core sets `hosted_form` from the public route; a person records the others. */
export const CONSENT_GRANT_SOURCES = [
  'hosted_form',
  'verbal_call',
  'import_attestation',
  'crm',
  'manual',
] as const

/** Where a granted Contact Consent came from. */
export const consentGrantSourceSchema = z.enum(CONSENT_GRANT_SOURCES)

/** Where a granted Contact Consent came from. */
export type ConsentGrantSource = z.infer<typeof consentGrantSourceSchema>

/** The sources a Rep or Admin may name when recording a grant; the hosted form is never claimed in a body. */
export const CONSENT_RECORDABLE_SOURCES = [
  'verbal_call',
  'import_attestation',
  'crm',
  'manual',
] as const

/** Where a withdrawal came from: a one-click unsubscribe, a STOP reply, or a person or sync. */
export const CONSENT_WITHDRAWAL_SOURCES = ['unsubscribe', 'stop_reply', 'manual', 'crm'] as const

/** Where a withdrawal came from. */
export const consentWithdrawalSourceSchema = z.enum(CONSENT_WITHDRAWAL_SOURCES)

/** Where a withdrawal came from. */
export type ConsentWithdrawalSource = z.infer<typeof consentWithdrawalSourceSchema>

/** Every source a ledger event can have. */
export const consentSourceSchema = z.union([
  consentGrantSourceSchema,
  consentWithdrawalSourceSchema,
])

/** Every source a ledger event can have. */
export type ConsentSource = z.infer<typeof consentSourceSchema>

/** The longest evidence reference (a form submission, a Call, an attestation note), in characters. */
export const MAX_EVIDENCE_REF_LENGTH = 200

/** A reference to the artefact that shows a consent: bounded text with no control character. */
export const evidenceRefSchema = boundedTextSchema(MAX_EVIDENCE_REF_LENGTH)

/**
 * The opaque signed token of a public route (an unsubscribe link, a hosted consent form): 22 to
 * 256 URL-safe characters. It names no address; core verifies its signature and expiry and
 * answers `consent.invalid_token` for a tampered, expired or unknown one.
 */
export const consentTokenSchema = z
  .string()
  .min(22)
  .max(256)
  .regex(/^[A-Za-z0-9_-]+$/)

/** The purposes a Contact Check is asked for, set by the calling service and never by an outside request body. */
export const CONTACT_PURPOSES = ['agent_initiated', 'rep_initiated', 'reply'] as const

/** The purpose of a Contact Check. */
export const contactPurposeSchema = z.enum(CONTACT_PURPOSES)

/** The purpose of a Contact Check. */
export type ContactPurpose = z.infer<typeof contactPurposeSchema>

/** Why an address is on the Suppression list. */
export const SUPPRESSION_REASONS = [
  'unsubscribe',
  'stop',
  'bounce',
  'complaint',
  'manual',
  'crm',
  'erased',
] as const

/** Why an address is on the Suppression list. */
export const suppressionReasonSchema = z.enum(SUPPRESSION_REASONS)

/** Why an address is on the Suppression list. */
export type SuppressionReason = z.infer<typeof suppressionReasonSchema>

/** The reasons an Admin may remove an entry for, with a recorded reason; every other entry is permanent (ADR 0021). */
export const SUPPRESSION_REMOVABLE_REASONS = ['manual'] as const

/** The kinds of address a Suppression entry is kept for. */
export const SUPPRESSION_ADDRESS_KINDS = ['email', 'phone', 'linkedin'] as const

/** The kind of address a Suppression entry is kept for. */
export const suppressionAddressKindSchema = z.enum(SUPPRESSION_ADDRESS_KINDS)

/** The kind of address a Suppression entry is kept for. */
export type SuppressionAddressKind = z.infer<typeof suppressionAddressKindSchema>

/** A masked address for display (`a***@example.com`): 1 to 100 characters, never the whole address. */
export const maskedAddressSchema = z.string().min(1).max(100)

/** The address fields of a request that names one address: an email, a phone or a LinkedIn address. Pair with {@link hasExactlyOneAddress}. */
export const addressFieldsShape = {
  email: emailSchema.optional(),
  phone: rawPhoneSchema.optional(),
  linkedinUrl: rawLinkedinUrlSchema.optional(),
}

/** True when exactly one of the address fields is present. */
export const hasExactlyOneAddress = (body: {
  email?: unknown
  phone?: unknown
  linkedinUrl?: unknown
}) => [body.email, body.phone, body.linkedinUrl].filter((value) => value !== undefined).length === 1

/** The message of a request that must name exactly one address. */
export const ONE_ADDRESS_MESSAGE = 'Give exactly one of email, phone or linkedinUrl'
