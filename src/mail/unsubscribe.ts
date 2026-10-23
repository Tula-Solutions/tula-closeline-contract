import { z } from 'zod'

/**
 * The signed, expiring token in an unsubscribe link and in the `List-Unsubscribe` header: 22 to
 * 512 URL-safe characters. It names the Organization and the message it came in; it is a
 * credential, so services redact it from logs, traces and error reports.
 */
export const unsubscribeTokenSchema = z
  .string()
  .min(22)
  .max(512)
  .regex(/^[A-Za-z0-9_-]+$/)

/** The path parameters of the public unsubscribe routes. */
export const unsubscribeParamsSchema = z.strictObject({ token: unsubscribeTokenSchema })

/**
 * What the public unsubscribe page shows before the person confirms: who sent the message (the
 * Organization's name) and nothing else. It never shows an address, and a token that is valid
 * for an address that is already suppressed shows the same page.
 */
export const unsubscribePageSchema = z.object({
  organizationName: z.string().min(1).max(200),
})

/** What the public unsubscribe page shows. */
export type UnsubscribePage = z.infer<typeof unsubscribePageSchema>

/**
 * The answer to an unsubscribe, one click (RFC 8058) or a confirmation: always `unsubscribed`,
 * the same for an address that was already suppressed and for one that is unknown, so nothing
 * about whether an address exists is revealed.
 */
export const unsubscribeResultSchema = z.object({
  status: z.literal('unsubscribed'),
  organizationName: z.string().min(1).max(200),
})

/** The answer to an unsubscribe. */
export type UnsubscribeResult = z.infer<typeof unsubscribeResultSchema>

/**
 * The one-click POST body a mail client sends (RFC 8058): the form field
 * `List-Unsubscribe=One-Click`. Any other body is `request.invalid`.
 */
export const oneClickUnsubscribeBodySchema = z.strictObject({
  'List-Unsubscribe': z.literal('One-Click'),
})
