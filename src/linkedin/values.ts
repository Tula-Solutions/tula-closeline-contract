import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { linkedinAccountIdSchema, linkedinRiskAcceptanceIdSchema, membershipIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { calendarDateSchema } from '../playbook/deal-values'

/** The most connection requests one account sends in a day. A conservative starting value (ADR 0004), to confirm against the provider's guidance; an Organization can only lower it. */
export const LINKEDIN_DAILY_CONNECTION_CEILING = 20

/** The most messages one account sends in a day. A conservative starting value (ADR 0004); an Organization can only lower it. */
export const LINKEDIN_DAILY_MESSAGE_CEILING = 40

/** The most connection requests one account sends in a week. A conservative starting value (ADR 0004); an Organization can only lower it. */
export const LINKEDIN_WEEKLY_CONNECTION_CEILING = 80

/** The message on the schema issue for a limit above its ceiling; a router maps it to `linkedin.limit_above_ceiling`. */
export const LINKEDIN_LIMIT_ISSUE_MESSAGE = 'linkedin.limit_above_ceiling'

/** The states of a LinkedIn account. */
export const LINKEDIN_ACCOUNT_STATUSES = [
  'connected',
  'needs_login',
  'paused',
  'restricted',
  'disconnected',
] as const

/** The state of a LinkedIn account. */
export const linkedinAccountStatusSchema = z.enum(LINKEDIN_ACCOUNT_STATUSES)

/** The state of a LinkedIn account. */
export type LinkedinAccountStatus = z.infer<typeof linkedinAccountStatusSchema>

/** Why an account is paused. A closed list. */
export const LINKEDIN_PAUSE_REASONS = [
  'restricted',
  'checkpoint',
  'provider_unavailable',
  'admin',
  'rate_limited',
] as const

/** Why an account is paused. */
export const linkedinPauseReasonSchema = z.enum(LINKEDIN_PAUSE_REASONS)

/** Why an account is paused. */
export type LinkedinPauseReason = z.infer<typeof linkedinPauseReasonSchema>

/** The version of the risk wording. A changed wording gets a new version and needs a new acceptance. */
export const LINKEDIN_RISK_WORDING_VERSION = '2026-10-1'

/** The risk statement an Admin reads and accepts, and a Rep reads before connecting. Plain text. */
export const LINKEDIN_RISK_WORDING = [
  "Automated activity on LinkedIn breaks LinkedIn's terms of use.",
  'LinkedIn can restrict or close an account that sends connection requests or messages this way.',
  'The penalty lands on the Rep who owns the account, not on Closeline.',
  'Closeline enforces low daily and weekly limits and spreads sends through working hours, but this lowers the risk and does not remove it.',
  'The LinkedIn channel can be switched off at any time, and revoking this acceptance stops every LinkedIn send at once.',
  'This acceptance is tied to this wording version. If the wording changes, it must be accepted again.',
].join('\n')

/** The most characters of a typed full name. */
export const MAX_LINKEDIN_TYPED_NAME_LENGTH = 200

const limitField = (ceiling: number) =>
  z
    .number()
    .int()
    .min(0)
    .superRefine((value, ctx) => {
      if (value > ceiling) {
        ctx.addIssue({ code: 'custom', message: LINKEDIN_LIMIT_ISSUE_MESSAGE })
      }
    })

/** The limits of one account: connection requests a day, messages a day, connection requests a week. Each is a whole number from 0 up to its system ceiling. */
export const linkedinLimitsSchema = z.strictObject({
  dailyConnections: limitField(LINKEDIN_DAILY_CONNECTION_CEILING),
  dailyMessages: limitField(LINKEDIN_DAILY_MESSAGE_CEILING),
  weeklyConnections: limitField(LINKEDIN_WEEKLY_CONNECTION_CEILING),
})

/** The limits of one account. */
export type LinkedinLimits = z.infer<typeof linkedinLimitsSchema>

/** A LinkedIn account as the portal sees it. Never carries the provider's account reference or any credential. */
export const linkedinAccountSchema = z.strictObject({
  id: linkedinAccountIdSchema,
  membershipId: membershipIdSchema,
  status: linkedinAccountStatusSchema,
  pauseReason: linkedinPauseReasonSchema.nullable(),
  limits: linkedinLimitsSchema,
  connectedAt: timestampSchema,
  updatedAt: timestampSchema,
})

/** A LinkedIn account as the portal sees it. */
export type LinkedinAccount = z.infer<typeof linkedinAccountSchema>

/** The body that starts a connection: nothing, the Rep is the caller. */
export const startLinkedinConnectionRequestSchema = z.strictObject({})

/** The hosted login the Rep opens to connect their account; Closeline never sees the password. */
export const startLinkedinConnectionResponseSchema = z.strictObject({
  hostedLoginUrl: z.url({ protocol: /^https?$/ }).max(2048),
  expiresAt: timestampSchema,
})

/** The hosted login the Rep opens to connect their account. */
export type StartLinkedinConnectionResponse = z.infer<typeof startLinkedinConnectionResponseSchema>

/** The current risk statement: its version and text. */
export const linkedinRiskStatementSchema = z.strictObject({
  version: z.string().min(1).max(40),
  text: z.string().min(1).max(4000),
})

/** The current risk statement. */
export type LinkedinRiskStatement = z.infer<typeof linkedinRiskStatementSchema>

/** A full name as typed: trimmed, 2 to 200 characters, no control characters. */
export const linkedinTypedNameSchema = z
  .string()
  .trim()
  .min(2)
  .max(MAX_LINKEDIN_TYPED_NAME_LENGTH)
  .refine((value) => !/\p{Cc}/u.test(value), 'No control characters')

/** The body that records a risk acceptance: the wording version being accepted (it must be the current one) and the Admin's typed full name. */
export const acceptLinkedinRiskRequestSchema = z.strictObject({
  wordingVersion: z.literal(LINKEDIN_RISK_WORDING_VERSION),
  typedFullName: linkedinTypedNameSchema,
})

/** The body that records a risk acceptance. */
export type AcceptLinkedinRiskRequest = z.infer<typeof acceptLinkedinRiskRequestSchema>

/** A recorded risk acceptance. The Organization comes from the token, not the record. */
export const linkedinRiskAcceptanceSchema = z.strictObject({
  id: linkedinRiskAcceptanceIdSchema,
  wordingVersion: z.string().min(1).max(40),
  acceptedByMembershipId: membershipIdSchema,
  typedFullName: z.string().min(2).max(MAX_LINKEDIN_TYPED_NAME_LENGTH),
  acceptedAt: timestampSchema,
  revokedAt: timestampSchema.nullable(),
})

/** A recorded risk acceptance. */
export type LinkedinRiskAcceptance = z.infer<typeof linkedinRiskAcceptanceSchema>

/** The LinkedIn channel settings. `effectivelyEnabled` is set by the service: true only with the switch on and a non-revoked acceptance of the current wording. */
export const linkedinSettingsSchema = z.strictObject({
  enabled: z.boolean(),
  currentWordingVersion: z.string().min(1).max(40),
  activeAcceptance: linkedinRiskAcceptanceSchema.nullable(),
  effectivelyEnabled: z.boolean(),
})

/** The LinkedIn channel settings. */
export type LinkedinSettings = z.infer<typeof linkedinSettingsSchema>

/** The body that flips the Admin switch. It is the only setting: no consent, suppression or limit guard can be turned off. */
export const updateLinkedinSettingsRequestSchema = z.strictObject({ enabled: z.boolean() })

/** The body that flips the Admin switch. */
export type UpdateLinkedinSettingsRequest = z.infer<typeof updateLinkedinSettingsRequestSchema>

/** The body that lowers an account's limits. The same ceilings apply; a limit above one is `linkedin.limit_above_ceiling`. */
export const updateLinkedinAccountLimitsRequestSchema = linkedinLimitsSchema

/** The query of the accounts list: a cursor and a bounded limit. */
export const listLinkedinAccountsQuerySchema = pageQuerySchema

/** One page of LinkedIn accounts. */
export const linkedinAccountPageSchema = pageSchema(linkedinAccountSchema)

/** The query of the risk acceptance history: a cursor and a bounded limit. */
export const listLinkedinRiskAcceptancesQuerySchema = pageQuerySchema

/** One page of risk acceptances, newest first. */
export const linkedinRiskAcceptancePageSchema = pageSchema(linkedinRiskAcceptanceSchema)

/** One account's use on one day: today's counts, the week's connection count and the limits they run against. */
export const linkedinUsageSchema = z.strictObject({
  accountId: linkedinAccountIdSchema,
  day: calendarDateSchema,
  connectionsUsed: z.number().int().min(0),
  messagesUsed: z.number().int().min(0),
  weeklyConnectionsUsed: z.number().int().min(0),
  limits: linkedinLimitsSchema,
})

/** One account's use on one day. */
export type LinkedinUsage = z.infer<typeof linkedinUsageSchema>

/** The query of the usage list: an optional day (default today) and a cursor and bounded limit. */
export const listLinkedinUsageQuerySchema = pageQuerySchema.extend({
  day: calendarDateSchema.optional(),
})

/** One page of per-account usage. */
export const linkedinUsagePageSchema = pageSchema(linkedinUsageSchema)

/**
 * The fixed order of checks before any LinkedIn send, first to last; a failed step stops the
 * send. An Agent-initiated LinkedIn contact needs a Contact Consent for the linkedin channel
 * (ADR 0003; core's Contact Check denies it today, and a Rep-initiated or reply path follows
 * consent/contact-check.ts), and suppression always holds. No setting disables any step.
 */
export const LINKEDIN_SEND_GUARD_ORDER = [
  'channel_enabled',
  'account_connected',
  'contact_consent',
  'suppression',
  'quota',
] as const

/** One step of the LinkedIn send guard. */
export type LinkedinSendGuardStep = (typeof LINKEDIN_SEND_GUARD_ORDER)[number]
