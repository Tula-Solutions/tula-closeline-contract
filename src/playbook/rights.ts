import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { userIdSchema } from '../ids'

/** The largest wording version number; versions are positive integers the service raises when a lawyer changes the wording. */
export const MAX_RIGHTS_WORDING_VERSION = 1_000_000

/** The version of the rights-confirmation wording: a positive integer. The wording itself lives in the portal, checked by a lawyer, and is not in this library. */
export const rightsWordingVersionSchema = z.number().int().min(1).max(MAX_RIGHTS_WORDING_VERSION)

/**
 * The recorded confirmation (ADR 0018, choice 12): that an Owner or Admin confirmed the
 * Organization may share its Recordings and Transcripts, with the `wordingVersion` shown, who
 * (`confirmedByUserId`) and when. There is one per Organization; a new one replaces it.
 */
export const rightsConfirmationSchema = z.object({
  wordingVersion: rightsWordingVersionSchema,
  confirmedByUserId: userIdSchema,
  confirmedAt: timestampSchema,
})

/** The recorded confirmation. */
export type RightsConfirmation = z.infer<typeof rightsConfirmationSchema>

/**
 * The answer to reading the confirmation: the `currentWordingVersion` the portal must show,
 * the stored `confirmation` (`null` if none) and `confirmed`, true only when the stored version
 * is the current one. Uploads of Calls are refused with `rights.confirmation_required` unless
 * `confirmed`; existing Calls stay and stay searchable.
 */
export const rightsStatusSchema = z.object({
  currentWordingVersion: rightsWordingVersionSchema,
  confirmation: rightsConfirmationSchema.nullable(),
  confirmed: z.boolean(),
})

/** The answer to reading the confirmation. */
export type RightsStatus = z.infer<typeof rightsStatusSchema>

/**
 * The body of the request that records the confirmation: the `wordingVersion` the member was shown,
 * which must be the current one (else `rights.version_outdated`). Who and when come from the token
 * and the clock, never from the body. Idempotent by end state.
 */
export const confirmRightsRequestSchema = z.strictObject({
  wordingVersion: rightsWordingVersionSchema,
})

/** The body of the request that records the confirmation. */
export type ConfirmRightsRequest = z.infer<typeof confirmRightsRequestSchema>
