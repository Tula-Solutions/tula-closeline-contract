import { z } from 'zod'

/** The longest Organization or Team name, in characters; the same bound as the database check. */
export const MAX_NAME_LENGTH = 200

function hasControlCharacter(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)
    if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) {
      return true
    }
  }
  return false
}

function isWellFormed(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        return false
      }
      index += 1
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return false
    }
  }
  return true
}

const nameSchema = z
  .string()
  .trim()
  .pipe(
    z
      .string()
      .min(1)
      .max(MAX_NAME_LENGTH)
      .refine(isWellFormed, 'Well-formed text only')
      .refine((text) => !hasControlCharacter(text), 'No control characters')
  )

/**
 * An Organization's name in a request: trimmed, then 1 to 200 characters, well-formed UTF-16 (no
 * lone surrogate) and no control characters. Zero-width and direction-override characters are
 * allowed, so display code must treat a name as untrusted text.
 */
export const organizationNameSchema = nameSchema

/**
 * A Team's name in a request: trimmed, then 1 to 200 characters, well-formed UTF-16 (no lone
 * surrogate) and no control characters. Zero-width and direction-override characters are allowed,
 * so display code must treat a name as untrusted text.
 */
export const teamNameSchema = nameSchema

/**
 * A name as a response carries it: any 1 to 200 character string, so a name that is already
 * stored can never fail a response parse. Display code must treat it as untrusted text.
 */
export const storedNameSchema = z.string().min(1).max(MAX_NAME_LENGTH)

/** The states an Invitation is in; "expired" is not a state, it is read from `expiresAt`. */
export const INVITATION_STATES = ['pending', 'accepted', 'revoked'] as const

/** The state of an Invitation. */
export const invitationStateSchema = z.enum(INVITATION_STATES)

/** The state of an Invitation. */
export type InvitationState = z.infer<typeof invitationStateSchema>

/** A point in time as an ISO 8601 string with an offset, as every response carries it. */
export const timestampSchema = z.iso.datetime({ offset: true }).max(64)

/**
 * The raw token of an Invitation: 22 to 256 URL-safe characters (128 bits or more). It exists in
 * the email sent to the invitee and in the sign-up call to core, never in a response.
 */
export const invitationTokenSchema = z
  .string()
  .min(22)
  .max(256)
  .regex(/^[A-Za-z0-9_-]+$/)

/**
 * The header that carries an idempotency key on a call that has effects. Every public POST accepts
 * it too: a replay returns the original result, and the same key with a different body is
 * `request.idempotency_key_reused`.
 */
export const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key'

/** The value of the {@link IDEMPOTENCY_KEY_HEADER} header: 16 to 128 characters from `A-Za-z0-9_.:-`, such as a UUID. */
export const idempotencyKeySchema = z
  .string()
  .min(16)
  .max(128)
  .regex(/^[A-Za-z0-9_.:-]+$/)

/** An idempotency key. */
export type IdempotencyKey = z.infer<typeof idempotencyKeySchema>
