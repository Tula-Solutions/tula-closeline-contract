import { z } from 'zod'

/** The longest email address stored, in characters; the same bound as the database check. */
export const MAX_EMAIL_LENGTH = 320

/**
 * Lower-cases the ASCII letters A to Z and nothing else, so the result does not depend on the
 * locale. `toLowerCase()` is wrong here: it also folds letters such as `É`, and the database does
 * not. Use this wherever an email or a Team name is compared or stored.
 */
export function foldAscii(text: string): string {
  return text.replace(/[A-Z]/g, (letter) => String.fromCharCode(letter.charCodeAt(0) + 32))
}

function isPrintableAscii(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)
    if (code < 0x21 || code > 0x7e) {
      return false
    }
  }
  return true
}

function hasOneInteriorAt(text: string): boolean {
  const first = text.indexOf('@')
  return first > 0 && first < text.length - 1 && text.indexOf('@', first + 1) === -1
}

/**
 * An email address, folded to lower case (ASCII letters only) and checked with the rule the
 * database enforces: 3 to 320 characters, exactly one `@` that is neither first nor last, and
 * every character printable ASCII (`!` to `~`), so whitespace, control characters, zero-width and
 * no-break spaces, bidirectional overrides and a fullwidth `@` are all refused. An
 * internationalised domain is stored in its ASCII (A-label, punycode) form: the service converts
 * it before validating, and this schema does not convert. It is a backstop, not an address
 * parser; a verified address comes from the auth service.
 */
export const emailSchema = z
  .string()
  .max(MAX_EMAIL_LENGTH)
  .transform(foldAscii)
  .pipe(
    z
      .string()
      .min(3)
      .refine(hasOneInteriorAt, 'Exactly one @, neither first nor last')
      .refine(isPrintableAscii, 'Printable ASCII only')
  )

/** An email address, folded to lower case. */
export type Email = z.output<typeof emailSchema>
