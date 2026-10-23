import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { mailboxIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'

/** The days of sending a health score looks at. */
export const HEALTH_WINDOW_DAYS = 14

/** The fewest sends in the window below which a Mailbox shows `not_enough_data` instead of a score. A starting value. */
export const HEALTH_MINIMUM_SAMPLE = 30

/** The score below which a Mailbox's daily limit is halved. A starting value. */
export const HEALTH_WARNING_SCORE = 70

/** The score below which a Mailbox is paused. A starting value. */
export const HEALTH_CRITICAL_SCORE = 40

/**
 * What a health score is made of: `hard_bounce_rate`, `complaint_rate`, `soft_bounce_error_rate`
 * (soft bounces and send errors), `reply_rate` (a reply helps) and `provider_warnings` (a count).
 */
export const HEALTH_COMPONENTS = [
  'hard_bounce_rate',
  'complaint_rate',
  'soft_bounce_error_rate',
  'reply_rate',
  'provider_warnings',
] as const

/** What a health score is made of. */
export const healthComponentKindSchema = z.enum(HEALTH_COMPONENTS)

/** What a health score is made of. */
export type HealthComponentKind = z.infer<typeof healthComponentKindSchema>

/** How one component stands against its thresholds. */
export const healthComponentStateSchema = z.enum(['ok', 'warning', 'critical'])

/** How one component stands. */
export type HealthComponentState = z.infer<typeof healthComponentStateSchema>

/**
 * One reason behind a health score: the component, its measured value over the window (a rate from
 * 0 to 1, or a count for `provider_warnings`), its stated weight (0 to 100, all weights summing to
 * 100) and its warning and critical thresholds in the same unit, and where it stands.
 */
export const healthComponentSchema = z.object({
  component: healthComponentKindSchema,
  value: z.number().min(0).max(1_000_000),
  weight: z.number().int().min(0).max(100),
  warningThreshold: z.number().min(0).max(1_000_000),
  criticalThreshold: z.number().min(0).max(1_000_000),
  state: healthComponentStateSchema,
})

/** One reason behind a health score. */
export type HealthComponent = z.infer<typeof healthComponentSchema>

/**
 * The health of a Mailbox over the last 14 days: a 0 to 100 score with its components, or
 * `not_enough_data` with a null score when the sends are fewer than `minimumSample`. The
 * `effect` says what the score does now: nothing, the daily limit halved, or the Mailbox paused.
 */
export const mailboxHealthSchema = z
  .object({
    mailboxId: mailboxIdSchema,
    status: z.enum(['scored', 'not_enough_data']),
    score: z.number().int().min(0).max(100).nullable(),
    effect: z.enum(['none', 'limit_halved', 'paused']),
    windowDays: z.number().int().min(1).max(90),
    sampleSize: z.number().int().min(0).max(10_000_000),
    minimumSample: z.number().int().min(1).max(10_000),
    components: z.array(healthComponentSchema).max(10),
    scoredAt: timestampSchema,
  })
  .superRefine((h, ctx) => {
    if ((h.status === 'scored') !== (h.score !== null)) {
      ctx.addIssue({
        code: 'custom',
        path: ['score'],
        message: 'Exactly a scored Mailbox has a score',
      })
    }
    if (h.status === 'not_enough_data' && h.effect !== 'none') {
      ctx.addIssue({ code: 'custom', path: ['effect'], message: 'No score means no effect' })
    }
  })

/** The short form of a Mailbox's health shown on the Mailbox itself: status, score, effect and when it was scored. */
export const healthSummarySchema = z.object({
  status: z.enum(['scored', 'not_enough_data']),
  score: z.number().int().min(0).max(100).nullable(),
  effect: z.enum(['none', 'limit_halved', 'paused']),
  scoredAt: timestampSchema,
})

/** The short form of a Mailbox's health. */
export type HealthSummary = z.infer<typeof healthSummarySchema>

/** The health of a Mailbox. */
export type MailboxHealth = z.infer<typeof mailboxHealthSchema>

/** One day of a Mailbox's stored health: the date (`YYYY-MM-DD`, UTC), the score and the day's counts. */
export const healthDailySchema = z.object({
  date: z.iso.date(),
  score: z.number().int().min(0).max(100).nullable(),
  sent: z.number().int().min(0).max(10_000_000),
  hardBounces: z.number().int().min(0).max(10_000_000),
  softBounces: z.number().int().min(0).max(10_000_000),
  complaints: z.number().int().min(0).max(10_000_000),
  replies: z.number().int().min(0).max(10_000_000),
  errors: z.number().int().min(0).max(10_000_000),
  components: z.array(healthComponentSchema).max(10),
})

/** One day of a Mailbox's stored health. */
export type HealthDaily = z.infer<typeof healthDailySchema>

/** The query of a request for a Mailbox's daily health history, newest day first. */
export const listHealthHistoryQuerySchema = pageQuerySchema.strict()

/** One page of daily health. */
export const healthDailyPageSchema = pageSchema(healthDailySchema)

/** The cursor position a health history resumes from: the last date returned. */
export const healthHistoryCursorSchema = z.strictObject({ date: z.iso.date() })
