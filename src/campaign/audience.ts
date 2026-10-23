import { z } from 'zod'
import { timestampSchema } from '../core/values'
import {
  campaignIdSchema,
  membershipIdSchema,
  prospectCompanyIdSchema,
  prospectIdSchema,
} from '../ids'
import { prospectSearchSchema, prospectStatusSchema, sourceKindSchema } from '../prospect'
import { countSchema, MAX_AUDIENCE_PROSPECTS } from './values'

/**
 * A Campaign's audience, by kind. `filter`: the Prospects the caller may see that match, read
 * again when the audience is checked and at launch (every filter field is optional, and an empty
 * filter means every Prospect the caller may see). `prospects`: 1 to 500 listed Prospects, unique.
 * There is no saved Prospect list in this release.
 */
export const audienceSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('filter'),
    ownerMembershipId: membershipIdSchema.optional(),
    source: sourceKindSchema.optional(),
    companyId: prospectCompanyIdSchema.optional(),
    status: prospectStatusSchema.optional(),
    q: prospectSearchSchema.optional(),
  }),
  z.strictObject({
    kind: z.literal('prospects'),
    prospectIds: z
      .array(prospectIdSchema)
      .min(1)
      .max(MAX_AUDIENCE_PROSPECTS)
      .refine((ids) => new Set(ids).size === ids.length, 'A Prospect is listed once'),
  }),
])

/** A Campaign's audience. */
export type Audience = z.infer<typeof audienceSchema>

/** How far an audience check has got. */
export const AUDIENCE_CHECK_STATES = ['pending', 'ready', 'failed'] as const

/** How far an audience check has got. */
export const audienceCheckStateSchema = z.enum(AUDIENCE_CHECK_STATES)

/** How far an audience check has got. */
export type AudienceCheckState = z.infer<typeof audienceCheckStateSchema>

/**
 * What an audience check counted. `total` Prospects match; of them `verified` and `unverified`
 * (an address not verified) add up to `total`; `suppressed`, `noConsent` (no Contact Consent for
 * email) and `activeInOtherCampaign` (one active Campaign per Prospect) are Prospects that would
 * be refused; `eligible` would be enrolled. No count is above `total`, and `eligible` is at most
 * `total` less the largest refusal count. A count is a number, never a list of people.
 */
export const audienceCountsSchema = z
  .strictObject({
    total: countSchema,
    verified: countSchema,
    unverified: countSchema,
    suppressed: countSchema,
    noConsent: countSchema,
    activeInOtherCampaign: countSchema,
    eligible: countSchema,
  })
  .superRefine((c, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    if (c.verified + c.unverified !== c.total) {
      issue('unverified', 'Verified and unverified add up to the total')
    }
    const refused = Math.max(c.suppressed, c.noConsent, c.activeInOtherCampaign)
    if (c.eligible + refused > c.total) {
      issue('eligible', 'Eligible and the largest refusal count fit in the total')
    }
    for (const field of ['suppressed', 'noConsent', 'activeInOtherCampaign', 'eligible'] as const) {
      if (c[field] > c.total) {
        issue(field, 'No count is above the total')
      }
    }
  })

/** What an audience check counted. */
export type AudienceCounts = z.infer<typeof audienceCountsSchema>

/**
 * The latest audience check of a Campaign. It runs in the background, so it is `pending` first;
 * `counts` is null until `ready`. `failed` carries no detail: start another. `audienceVersion`
 * says which audience it read, so a stale result is never taken for the current one.
 */
export const audienceCheckSchema = z
  .strictObject({
    campaignId: campaignIdSchema,
    state: audienceCheckStateSchema,
    audienceVersion: z.number().int().min(0).max(1_000_000),
    counts: audienceCountsSchema.nullable(),
    requestedAt: timestampSchema,
    completedAt: timestampSchema.nullable(),
  })
  .superRefine((c, ctx) => {
    if ((c.state === 'ready') !== (c.counts !== null)) {
      ctx.addIssue({
        code: 'custom',
        path: ['counts'],
        message: 'Exactly a ready check has counts',
      })
    }
    if ((c.state === 'pending') !== (c.completedAt === null)) {
      ctx.addIssue({
        code: 'custom',
        path: ['completedAt'],
        message: 'Exactly a finished check has a completion time',
      })
    }
  })

/** The latest audience check of a Campaign. */
export type AudienceCheck = z.infer<typeof audienceCheckSchema>

/** The checks a launch needs, each reported once. */
export const LAUNCH_CHECKS = ['sequence', 'preview', 'audience', 'mailbox'] as const

/** A check a launch needs. */
export const launchCheckNameSchema = z.enum(LAUNCH_CHECKS)

/** A check a launch needs. */
export type LaunchCheckName = z.infer<typeof launchCheckNameSchema>

/** How one launch check came out: `pending` is not yet known (a preview or audience check not done). */
export const LAUNCH_CHECK_RESULTS = ['pass', 'fail', 'pending'] as const

/** How one launch check came out. */
export const launchCheckResultSchema = z.enum(LAUNCH_CHECK_RESULTS)

/** How one launch check came out. */
export type LaunchCheckResult = z.infer<typeof launchCheckResultSchema>

/** The error code a failed check would raise at launch. */
const launchFailureCodeSchema = z.enum([
  'campaign.invalid_sequence',
  'campaign.not_previewed',
  'campaign.audience_empty',
  'campaign.audience_check_pending',
  'campaign.no_healthy_mailbox',
])

const LAUNCH_CHECK_CODES: Record<(typeof LAUNCH_CHECKS)[number], readonly string[]> = {
  sequence: ['campaign.invalid_sequence'],
  preview: ['campaign.not_previewed'],
  audience: ['campaign.audience_empty', 'campaign.audience_check_pending'],
  mailbox: ['campaign.no_healthy_mailbox'],
}

/**
 * One launch check: its result, and for a check that did not pass the error code a launch would
 * return (null for a pass).
 */
export const launchCheckItemSchema = z
  .strictObject({
    check: launchCheckNameSchema,
    result: launchCheckResultSchema,
    code: launchFailureCodeSchema.nullable(),
  })
  .refine((c) => (c.result === 'pass') === (c.code === null), {
    message: 'Exactly a check that did not pass names a code',
    path: ['code'],
  })
  .refine((c) => c.code === null || LAUNCH_CHECK_CODES[c.check].includes(c.code), {
    message: 'The code belongs to the check',
    path: ['code'],
  })

/**
 * Whether a Campaign can launch now. Four checks, each once: the Sequence is valid, the current
 * version was previewed, the audience check is ready with someone eligible, and a healthy Mailbox
 * exists. `canLaunch` is true only when all pass. The counts of Prospects refused for consent and
 * suppression are shown so an Admin sees them first; they are reported, never bypassed: Contact
 * Consent is checked again by core at send time (ADR 0003) and no setting skips it.
 * `dailyCapacity` is what the healthy Mailboxes could send today.
 */
export const launchCheckSchema = z
  .strictObject({
    campaignId: campaignIdSchema,
    checks: z.array(launchCheckItemSchema).length(LAUNCH_CHECKS.length),
    canLaunch: z.boolean(),
    suppressed: countSchema.nullable(),
    noConsent: countSchema.nullable(),
    eligible: countSchema.nullable(),
    dailyCapacity: countSchema,
    checkedAt: timestampSchema,
  })
  .superRefine((c, ctx) => {
    const names = c.checks.map((i) => i.check)
    if (LAUNCH_CHECKS.some((name) => names.filter((n) => n === name).length !== 1)) {
      ctx.addIssue({ code: 'custom', path: ['checks'], message: 'Each check is reported once' })
    }
    if (c.canLaunch !== c.checks.every((i) => i.result === 'pass')) {
      ctx.addIssue({
        code: 'custom',
        path: ['canLaunch'],
        message: 'A Campaign can launch only when every check passes',
      })
    }
  })

/** Whether a Campaign can launch now. */
export type LaunchCheck = z.infer<typeof launchCheckSchema>
