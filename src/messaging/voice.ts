import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { brandVoiceIdSchema, membershipIdSchema } from '../ids'
import {
  MAX_BANNED_PHRASES,
  MAX_PREFERRED_WORDS,
  MAX_SIGN_OFF_LENGTH,
  MAX_TONE_LENGTH,
  MAX_VOICE_LENGTH_CHARACTERS,
  MAX_VOICE_TERM_LENGTH,
  messagingTextSchema,
} from './values'

const termSchema = messagingTextSchema(MAX_VOICE_TERM_LENGTH)

/** The settings of a Brand Voice, as an Owner or Admin writes them. Unknown fields are rejected. */
export const brandVoiceSettingsSchema = z.strictObject({
  tone: messagingTextSchema(MAX_TONE_LENGTH, true),
  preferredWords: z.array(termSchema).max(MAX_PREFERRED_WORDS).default([]),
  bannedPhrases: z.array(termSchema).max(MAX_BANNED_PHRASES).default([]),
  signOff: messagingTextSchema(MAX_SIGN_OFF_LENGTH, true).nullable().default(null),
  maxLengthCharacters: z.number().int().min(100).max(MAX_VOICE_LENGTH_CHARACTERS).default(1500),
})

/** The settings of a Brand Voice. */
export type BrandVoiceSettings = z.infer<typeof brandVoiceSettingsSchema>

/**
 * A Brand Voice: how an Organization's outreach sounds. There is one per Organization; each change
 * saves a new `version` (the id changes with it), so a Draft names the exact version it was
 * written with. It is a style guide for the drafter, never a way to skip a check.
 */
export const brandVoiceSchema = z.strictObject({
  id: brandVoiceIdSchema,
  version: z.number().int().min(1).max(1_000_000),
  ...brandVoiceSettingsSchema.shape,
  createdByMembershipId: membershipIdSchema,
  createdAt: timestampSchema,
})

/** A Brand Voice. */
export type BrandVoice = z.infer<typeof brandVoiceSchema>

/** The body to save a new Brand Voice version: the settings and the version the caller read (0 when none exists yet). */
export const setBrandVoiceRequestSchema = z.strictObject({
  ...brandVoiceSettingsSchema.shape,
  expectedVersion: z.number().int().min(0).max(1_000_000),
})

/** The body to save a new Brand Voice version. */
export type SetBrandVoiceRequest = z.infer<typeof setBrandVoiceRequestSchema>
