import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { mailboxIdSchema } from '../ids'

/** The DNS records a domain check looks at. */
export const DOMAIN_CHECK_RECORDS = ['spf', 'dkim', 'dmarc'] as const

/** A DNS record a domain check looks at. */
export const domainCheckRecordSchema = z.enum(DOMAIN_CHECK_RECORDS)

/** A DNS record a domain check looks at. */
export type DomainCheckRecord = z.infer<typeof domainCheckRecordSchema>

/**
 * How one record came out: `pass`, `weak` (present but not enough, such as a DMARC policy of
 * `none`), `fail` (present and wrong), `missing`, or `unknown` (the resolver could not answer, or
 * DKIM selectors of the provider could not be found).
 */
export const DOMAIN_CHECK_STATUSES = ['pass', 'weak', 'fail', 'missing', 'unknown'] as const

/** How one record came out. */
export const domainCheckStatusSchema = z.enum(DOMAIN_CHECK_STATUSES)

/** How one record came out. */
export type DomainCheckStatus = z.infer<typeof domainCheckStatusSchema>

/** The longest explanation or suggested record of a check, in characters. */
export const MAX_DOMAIN_CHECK_TEXT_LENGTH = 1000

/**
 * One record's result: its status, a plain-language explanation of what it means and what to
 * fix, and, when there is something to add, the record to publish. The explanation is written
 * by Closeline; DNS text read from the domain is not copied into it.
 */
export const domainCheckResultSchema = z.object({
  record: domainCheckRecordSchema,
  status: domainCheckStatusSchema,
  explanation: z.string().min(1).max(MAX_DOMAIN_CHECK_TEXT_LENGTH),
  suggestedRecord: z.string().min(1).max(MAX_DOMAIN_CHECK_TEXT_LENGTH).nullable(),
})

/** One record's result. */
export type DomainCheckResult = z.infer<typeof domainCheckResultSchema>

/**
 * The state of a Mailbox's domain: the domain the Mailbox sends from, one result for each of SPF,
 * DKIM and DMARC, and when it was checked. `checkedAt` is null and `results` empty until the
 * first check.
 */
export const domainCheckSchema = z
  .object({
    mailboxId: mailboxIdSchema,
    domain: z.string().min(1).max(253),
    results: z.array(domainCheckResultSchema).max(DOMAIN_CHECK_RECORDS.length),
    checkedAt: timestampSchema.nullable(),
  })
  .superRefine((d, ctx) => {
    if ((d.checkedAt === null) !== (d.results.length === 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['results'],
        message: 'Exactly a checked domain has results',
      })
    }
    if (new Set(d.results.map((r) => r.record)).size !== d.results.length) {
      ctx.addIssue({ code: 'custom', path: ['results'], message: 'A record is reported once' })
    }
  })

/** The state of a Mailbox's domain. */
export type DomainCheck = z.infer<typeof domainCheckSchema>
