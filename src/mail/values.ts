import { z } from 'zod'
import { timeZoneSchema, weekdaySchema } from '../booking'

/** The email providers a Mailbox can be connected through. Others are added behind the same port later. */
export const MAILBOX_PROVIDERS = ['gmail', 'outlook'] as const

/** An email provider a Mailbox is connected through. */
export const mailboxProviderSchema = z.enum(MAILBOX_PROVIDERS)

/** An email provider a Mailbox is connected through. */
export type MailboxProvider = z.infer<typeof mailboxProviderSchema>

/** Whose address a Mailbox is: a Rep's `personal` one, or a `shared` one an Admin connected for Teams. */
export const MAILBOX_KINDS = ['personal', 'shared'] as const

/** Whose address a Mailbox is. */
export const mailboxKindSchema = z.enum(MAILBOX_KINDS)

/** Whose address a Mailbox is. */
export type MailboxKind = z.infer<typeof mailboxKindSchema>

/**
 * The state of a Mailbox: `warming` (newly connected, following the published ramp), `healthy`,
 * `limited` (its limits were lowered because its health fell), `paused` (nothing is sent) and
 * `disconnected` (the grant is gone or the owner disconnected it; its tokens are deleted).
 */
export const MAILBOX_STATES = ['warming', 'healthy', 'limited', 'paused', 'disconnected'] as const

/** The state of a Mailbox. */
export const mailboxStateSchema = z.enum(MAILBOX_STATES)

/** The state of a Mailbox. */
export type MailboxState = z.infer<typeof mailboxStateSchema>

/**
 * Why a Mailbox is in its state: a closed set, never the provider's text. `owner_paused` and
 * `admin_paused` are a person's choice; `complaint_spike`, `bounce_spike` and `provider_suspended`
 * are automatic; `auth_revoked` is a revoked grant; `disconnected_by_owner` is a disconnect.
 */
export const MAILBOX_STATE_REASONS = [
  'owner_paused',
  'admin_paused',
  'complaint_spike',
  'bounce_spike',
  'provider_suspended',
  'auth_revoked',
  'disconnected_by_owner',
  'health_warning',
] as const

/** Why a Mailbox is in its state. */
export const mailboxStateReasonSchema = z.enum(MAILBOX_STATE_REASONS)

/** Why a Mailbox is in its state. */
export type MailboxStateReason = z.infer<typeof mailboxStateReasonSchema>

/** The largest number of sends a Mailbox may be set to in a day. */
export const MAX_SENDS_PER_DAY = 500

/** The largest number of sends a Mailbox may be set to in an hour. */
export const MAX_SENDS_PER_HOUR = 100

/** The longest minimum gap between two sends of a Mailbox, in seconds. */
export const MAX_MIN_GAP_SECONDS = 3600

/** The most Teams a shared Mailbox can be opened to. */
export const MAX_MAILBOX_TEAMS = 50

/** A number of sends in a day or an hour or a count of them: a whole number from 0 up to the bound. */
const countSchema = (max: number) => z.number().int().min(0).max(max)

/** A time of day as minutes after midnight: 0 to 1439. */
export const minuteOfDaySchema = z.number().int().min(0).max(1439)

/**
 * When a Mailbox may send: on the listed days, from `startMinute` to before `endMinute`, in the
 * time zone. The window ends after it starts and never crosses midnight.
 */
export const sendWindowSchema = z
  .strictObject({
    timeZone: timeZoneSchema,
    days: z.array(weekdaySchema).min(1).max(7),
    startMinute: minuteOfDaySchema,
    endMinute: z.number().int().min(1).max(1440),
  })
  .superRefine((w, ctx) => {
    if (w.endMinute <= w.startMinute) {
      ctx.addIssue({
        code: 'custom',
        path: ['endMinute'],
        message: 'The window ends after it starts',
      })
    }
    if (new Set(w.days).size !== w.days.length) {
      ctx.addIssue({ code: 'custom', path: ['days'], message: 'A day is listed once' })
    }
  })

/** When a Mailbox may send. */
export type SendWindow = z.infer<typeof sendWindowSchema>

/**
 * The limits an Admin or the owner sets on a Mailbox: sends per day and per hour, the least gap
 * between two sends, and the send window. The Organization's ceiling bounds them
 * (`mailbox.limit_above_ceiling`); the ramp and the health score can only lower what applies.
 */
export const mailboxLimitsSchema = z.strictObject({
  perDay: z.number().int().min(1).max(MAX_SENDS_PER_DAY),
  perHour: z.number().int().min(1).max(MAX_SENDS_PER_HOUR),
  minGapSeconds: z.number().int().min(0).max(MAX_MIN_GAP_SECONDS),
  window: sendWindowSchema,
})

/** The limits set on a Mailbox. */
export type MailboxLimits = z.infer<typeof mailboxLimitsSchema>

/** The sends a Mailbox may make now, after the ramp and its health have lowered its set limits. */
export const effectiveLimitsSchema = z.object({
  perDay: countSchema(MAX_SENDS_PER_DAY),
  perHour: countSchema(MAX_SENDS_PER_HOUR),
  minGapSeconds: z.number().int().min(0).max(MAX_MIN_GAP_SECONDS),
})

/** The limits that apply to a Mailbox now. */
export type EffectiveLimits = z.infer<typeof effectiveLimitsSchema>

/**
 * The published ramp of a new Mailbox: from `fromDay` (days since it was connected) at most
 * `perDay` sends a day. Starting values, tuned against real sending; there is no simulated
 * warm-up traffic (ADR for email sending through connected Mailboxes).
 */
export const MAILBOX_RAMP_STEPS = [
  { fromDay: 0, perDay: 10 },
  { fromDay: 7, perDay: 15 },
  { fromDay: 14, perDay: 25 },
  { fromDay: 21, perDay: 40 },
] as const

/** The Mailbox ramp as shown to its owner. `active` is false once the last step is passed. */
export const rampSchema = z.object({
  active: z.boolean(),
  dayIndex: z.number().int().min(0).max(36500),
  perDayNow: z.number().int().min(0).max(MAX_SENDS_PER_DAY).nullable(),
  steps: z
    .array(
      z.strictObject({
        fromDay: z.number().int().min(0).max(365),
        perDay: countSchema(MAX_SENDS_PER_DAY),
      })
    )
    .max(20),
})

/** The ramp of a Mailbox. */
export type Ramp = z.infer<typeof rampSchema>
