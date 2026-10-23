import { z } from 'zod'
import { hasControlCharacter } from '../prospect/values'

/** The most Prospects one preview request may name. */
export const MAX_PREVIEW_PROSPECTS = 5

/** The most statements one Research Brief holds. */
export const MAX_BRIEF_STATEMENTS = 20

/** The longest statement of a Research Brief, in characters. */
export const MAX_BRIEF_STATEMENT_LENGTH = 500

/** The longest angle of a Research Brief or a regeneration request, in characters. */
export const MAX_ANGLE_LENGTH = 500

/** The most Citations one Draft carries. */
export const MAX_DRAFT_CITATIONS = 20

/** The longest subject of a Draft, in characters. */
export const MAX_DRAFT_SUBJECT_LENGTH = 200

/** The longest body of a Draft, in characters. */
export const MAX_DRAFT_BODY_LENGTH = 5000

/** The longest tone description of a Brand Voice, in characters. */
export const MAX_TONE_LENGTH = 500

/** The most preferred words a Brand Voice lists. */
export const MAX_PREFERRED_WORDS = 50

/** The most banned phrases a Brand Voice lists. */
export const MAX_BANNED_PHRASES = 100

/** The longest preferred word or banned phrase, in characters. */
export const MAX_VOICE_TERM_LENGTH = 100

/** The longest sign-off of a Brand Voice, in characters. */
export const MAX_SIGN_OFF_LENGTH = 200

/** The largest message length a Brand Voice may set, in characters. */
export const MAX_VOICE_LENGTH_CHARACTERS = 5000

/** The longest web address a Citation holds, in characters. */
export const MAX_CITATION_URL_LENGTH = 2048

/** Text of 1 to `maxLength` characters, trimmed, with no control character; line breaks are allowed when `multiline`. */
export function messagingTextSchema(maxLength: number, multiline = false) {
  return z
    .string()
    .max(maxLength * 2)
    .trim()
    .pipe(
      z
        .string()
        .min(1)
        .max(maxLength)
        .refine((text) => !hasControlCharacter(text, multiline), 'No control characters')
    )
}

/** A web address a Citation points at: http or https, no credentials, at most 2048 characters. */
export const citationUrlSchema = z
  .string()
  .max(MAX_CITATION_URL_LENGTH)
  .refine((text) => {
    try {
      const url = new URL(text)
      return (
        (url.protocol === 'http:' || url.protocol === 'https:') &&
        url.username === '' &&
        url.password === ''
      )
    } catch {
      return false
    }
  }, 'An http or https address without credentials')

/** The channels a Draft is written for. A closed list; email only until messaging channels ship. */
export const DRAFT_CHANNELS = ['email'] as const

/** A channel a Draft is written for. */
export const draftChannelSchema = z.enum(DRAFT_CHANNELS)

/** The channel of a Draft. */
export type DraftChannel = z.infer<typeof draftChannelSchema>
