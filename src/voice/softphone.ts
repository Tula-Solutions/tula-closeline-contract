import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { membershipIdSchema } from '../ids'

/** The shortest a Softphone token lives, in seconds. */
export const MIN_SOFTPHONE_TOKEN_TTL_SECONDS = 60

/** The longest a Softphone token lives, in seconds: one hour. */
export const MAX_SOFTPHONE_TOKEN_TTL_SECONDS = 3600

/** The longest Softphone token, in characters. */
export const MAX_SOFTPHONE_TOKEN_LENGTH = 4096

/**
 * A short-lived token the browser uses to register the Softphone with the telephony provider. It
 * is a credential for one Rep: shown once to the caller, never logged or stored, and it stops
 * working at `expiresAt`. The Rep takes Calls only while one is held.
 */
export const softphoneTokenSchema = z.strictObject({
  token: z.string().min(1).max(MAX_SOFTPHONE_TOKEN_LENGTH),
  identity: membershipIdSchema,
  ttlSeconds: z
    .number()
    .int()
    .min(MIN_SOFTPHONE_TOKEN_TTL_SECONDS)
    .max(MAX_SOFTPHONE_TOKEN_TTL_SECONDS),
  expiresAt: timestampSchema,
})

/** A short-lived Softphone token. */
export type SoftphoneToken = z.infer<typeof softphoneTokenSchema>
