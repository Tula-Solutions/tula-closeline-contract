import { z } from 'zod'
import { agentKindSchema } from '../agent/instruction'
import { timestampSchema } from '../core/values'
import {
  callIdSchema,
  campaignIdSchema,
  conversationIdSchema,
  dealRecordIdSchema,
  membershipIdSchema,
  messageIdSchema,
  prospectIdSchema,
  touchIdSchema,
} from '../ids'
import { inboxChannelSchema } from '../inbox/values'
import { pageQuerySchema, pageSchema } from '../pagination'
import { citationRefSchema } from '../playbook/citation'
import { calendarDateSchema } from '../playbook/deal-values'

/** The counts a dashboard shows, per day. A closed list. */
export const ANALYTICS_METRICS = [
  'sends',
  'replies',
  'positive_replies',
  'meetings',
  'outcomes_won',
  'outcomes_lost',
] as const

/** A metric a dashboard shows. */
export const analyticsMetricSchema = z.enum(ANALYTICS_METRICS)

/** A metric a dashboard shows. */
export type AnalyticsMetric = z.infer<typeof analyticsMetricSchema>

/** What a series or table can be split by. A closed list. */
export const ANALYTICS_GROUP_BYS = ['channel', 'agent_kind', 'campaign', 'rep'] as const

/** What a series can be split by: the channel, the Agent kind, the Campaign or the Rep. */
export const analyticsGroupBySchema = z.enum(ANALYTICS_GROUP_BYS)

/** What a series can be split by. */
export type AnalyticsGroupBy = z.infer<typeof analyticsGroupBySchema>

/** What a comparison table has one row per: a Campaign or a Rep. */
export const ANALYTICS_TABLE_GROUPS = ['campaign', 'rep'] as const

/** What a comparison table has one row per. */
export const analyticsTableGroupSchema = z.enum(ANALYTICS_TABLE_GROUPS)

/** The longest date range a dashboard read may span, in calendar months. */
export const MAX_ANALYTICS_RANGE_MONTHS = 13

/** The most points one series holds: 13 months of days is at most 396. */
export const MAX_SERIES_POINTS = 400

/** The most lines (groups) one page of a series holds; further groups come on the next page. */
export const MAX_SERIES_GROUPS_PER_PAGE = 20

/** The fewest records a rate needs before it is shown; below it the state is `not_enough_data`. */
export const MIN_RATE_SAMPLE = 20

/** The fewest Deals a source needs before its win rate is shown (spec M15: a proposal to confirm). */
export const MIN_SOURCE_SAMPLE = 20

/** The page size of a CSV download. */
export const MAX_ANALYTICS_CSV_PAGE_SIZE = 1000

/** The default look-back for Attribution, in days (spec M15: a proposal to confirm). */
export const ATTRIBUTION_LOOKBACK_DAYS = 180

/** The most touches one Attribution page holds. */
export const MAX_TOUCH_SOURCES = 20

/** The message on the schema issue for a range that is too wide; a router maps it to `analytics.range_too_large`. */
export const ANALYTICS_RANGE_ISSUE_MESSAGE = 'analytics.range_too_large'

const parseDay = (day: string): [number, number, number] => {
  const [y, m, d] = day.split('-').map(Number)
  return [y as number, m as number, d as number]
}

const lastDayOfMonth = (year: number, monthIndex: number): number =>
  new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()

/** The last day, as `YYYY-MM-DD`, that a range starting on `from` may end on: `from` plus 13 calendar months, minus one day (UTC; a month that is too short clamps to its last day). */
export function lastAllowedAnalyticsDay(from: string): string {
  const [year, month, day] = parseDay(from)
  const target = month - 1 + MAX_ANALYTICS_RANGE_MONTHS
  const targetYear = year + Math.floor(target / 12)
  const targetMonth = target % 12
  const clamped = Math.min(day, lastDayOfMonth(targetYear, targetMonth))
  const end = new Date(Date.UTC(targetYear, targetMonth, clamped) - 24 * 60 * 60 * 1000)
  return end.toISOString().slice(0, 10)
}

/**
 * Whether a range is refused: `from` is after `to`, or `to` is after `from` plus 13 calendar months
 * minus one day. So 2026-01-01 to 2027-01-31 is allowed and 2026-01-01 to 2027-02-01 is not.
 */
export function isAnalyticsRangeTooLarge(from: string, to: string): boolean {
  return from > to || to > lastAllowedAnalyticsDay(from)
}

/** Adds the range issue to `ctx` when `from` and `to` are both given and the range is too large. */
export function checkAnalyticsRange(
  range: { from?: string | undefined; to?: string | undefined },
  ctx: z.RefinementCtx
): void {
  if (range.from !== undefined && range.to !== undefined) {
    if (isAnalyticsRangeTooLarge(range.from, range.to)) {
      ctx.addIssue({ code: 'custom', path: ['to'], message: ANALYTICS_RANGE_ISSUE_MESSAGE })
    }
  }
}

/** The `from` and `to` fields of a ranged query: real calendar days, both included. Use with {@link checkAnalyticsRange}. */
export const analyticsRangeShape = {
  from: calendarDateSchema,
  to: calendarDateSchema,
} as const

/** A date range: real calendar days, `from` not after `to`, at most 13 calendar months (see {@link isAnalyticsRangeTooLarge}). A wider range fails with the issue message `analytics.range_too_large` on `to`. */
export const dateRangeSchema = z
  .strictObject(analyticsRangeShape)
  .superRefine((range, ctx) => checkAnalyticsRange(range, ctx))

/** A date range. */
export type DateRange = z.infer<typeof dateRangeSchema>

/** The filters a series, table or CSV takes: channel, Agent kind, Campaign and Rep. */
export const analyticsFilterShape = {
  channel: inboxChannelSchema.optional(),
  agentKind: agentKindSchema.optional(),
  campaignId: campaignIdSchema.optional(),
  repMembershipId: membershipIdSchema.optional(),
} as const

/** The query of a series read. Without `groupBy` the series is the total. Groups are paged: a cursor and a `limit` of groups (at most 20, default 20). */
export const getSeriesQuerySchema = z
  .object({
    metric: analyticsMetricSchema,
    groupBy: analyticsGroupBySchema.optional(),
    ...analyticsRangeShape,
    ...analyticsFilterShape,
    cursor: pageQuerySchema.shape.cursor,
    limit: z
      .union([z.number(), z.string().regex(/^\d{1,3}$/)])
      .transform((value) => Number(value))
      .pipe(z.number().int().min(1).max(MAX_SERIES_GROUPS_PER_PAGE))
      .default(MAX_SERIES_GROUPS_PER_PAGE),
  })
  .superRefine((query, ctx) => checkAnalyticsRange(query, ctx))

/** The query of a series read. */
export type GetSeriesQuery = z.infer<typeof getSeriesQuerySchema>

/** The query of the comparison table: one row per Campaign or Rep, cursor-paginated. */
export const listTableQuerySchema = z
  .object({
    groupBy: analyticsTableGroupSchema,
    ...analyticsRangeShape,
    ...analyticsFilterShape,
  })
  .extend(pageQuerySchema.shape)
  .superRefine((query, ctx) => checkAnalyticsRange(query, ctx))

/** The query of the comparison table. */
export type ListTableQuery = z.infer<typeof listTableQuerySchema>

/** The query of the table CSV: the table's filters and a page of at most 1,000 rows. */
export const tableCsvQuerySchema = z
  .object({
    groupBy: analyticsTableGroupSchema,
    ...analyticsRangeShape,
    ...analyticsFilterShape,
    cursor: pageQuerySchema.shape.cursor,
    limit: z
      .union([z.number(), z.string().regex(/^\d{1,4}$/)])
      .transform((value) => Number(value))
      .pipe(z.number().int().min(1).max(MAX_ANALYTICS_CSV_PAGE_SIZE))
      .default(MAX_ANALYTICS_CSV_PAGE_SIZE),
  })
  .superRefine((query, ctx) => checkAnalyticsRange(query, ctx))

/** The query of the table CSV. */
export type TableCsvQuery = z.infer<typeof tableCsvQuerySchema>

/** A count: how many, and how many records it rests on (the same number for a plain count). */
export const countValueSchema = z.strictObject({
  kind: z.literal('count'),
  value: z.number().int().min(0),
  recordCount: z.number().int().min(0),
})

/** A rate with enough records behind it (`recordCount` at least {@link MIN_RATE_SAMPLE}), from 0 to 1. */
export const okRateValueSchema = z.strictObject({
  kind: z.literal('rate'),
  state: z.literal('ok'),
  value: z.number().min(0).max(1),
  recordCount: z.number().int().min(MIN_RATE_SAMPLE),
})

/** A rate with too few records: no value, only the count, so no one reads a rate off a small sample. */
export const notEnoughDataRateValueSchema = z.strictObject({
  kind: z.literal('rate'),
  state: z.literal('not_enough_data'),
  value: z.null(),
  recordCount: z
    .number()
    .int()
    .min(0)
    .max(MIN_RATE_SAMPLE - 1),
})

/** A rate: a value from 0 to 1 when `recordCount` is at least 20, else `not_enough_data` with value null. */
export const rateValueSchema = z.union([okRateValueSchema, notEnoughDataRateValueSchema])

/** A rate value. */
export type RateValue = z.infer<typeof rateValueSchema>

/** A metric value: a count or a rate. Every value carries the number of records it rests on. */
export const metricValueSchema = z.union([
  countValueSchema,
  okRateValueSchema,
  notEnoughDataRateValueSchema,
])

/** A metric value. */
export type MetricValue = z.infer<typeof metricValueSchema>

/** What a series or table row is about: a label (a channel or an Agent kind) or an id (Campaign or Rep). */
export const analyticsGroupKeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z][a-z0-9_]*$/)

/** One day of a series. */
export const seriesPointSchema = z.union([
  countValueSchema.extend({ day: calendarDateSchema }),
  okRateValueSchema.extend({ day: calendarDateSchema }),
  notEnoughDataRateValueSchema.extend({ day: calendarDateSchema }),
])

/** One day of a series. */
export type SeriesPoint = z.infer<typeof seriesPointSchema>

/** One line of a series: the group (null for the total) and its days, oldest first. */
export const seriesLineSchema = z.strictObject({
  group: analyticsGroupKeySchema.nullable(),
  points: z.array(seriesPointSchema).max(MAX_SERIES_POINTS),
})

/** The answer to a series read: the metric, the split, the range, one page of at most 20 lines and the cursor of the next page, or null at the end. */
export const getSeriesResponseSchema = z.strictObject({
  metric: analyticsMetricSchema,
  groupBy: analyticsGroupBySchema.nullable(),
  ...analyticsRangeShape,
  series: z.array(seriesLineSchema).max(MAX_SERIES_GROUPS_PER_PAGE),
  nextCursor: pageSchema(z.never()).shape.nextCursor,
})

/** The answer to a series read. */
export type GetSeriesResponse = z.infer<typeof getSeriesResponseSchema>

/** One row of the comparison table: a Campaign or Rep, with counts and rates, each with its record count. */
export const tableRowSchema = z.strictObject({
  group: analyticsGroupKeySchema,
  sends: countValueSchema,
  replies: countValueSchema,
  positiveReplies: countValueSchema,
  meetings: countValueSchema,
  outcomesWon: countValueSchema,
  outcomesLost: countValueSchema,
  replyRate: rateValueSchema,
  positiveReplyRate: rateValueSchema,
  winRate: rateValueSchema,
})

/** One row of the comparison table. */
export type TableRow = z.infer<typeof tableRowSchema>

/** One page of the comparison table. */
export const listTableResponseSchema = pageSchema(tableRowSchema)

/** What a touch was: a Message or a Call. */
export const TOUCH_KINDS = ['message', 'call'] as const

const touchShape = {
  id: touchIdSchema,
  prospectId: prospectIdSchema,
  occurredAt: timestampSchema,
  credit: z.strictObject({ firstTouch: z.boolean(), lastTouch: z.boolean() }),
  sources: z.array(citationRefSchema).max(MAX_TOUCH_SOURCES),
} as const

/** One touch: a Message or a Call in the look-back window, with the credit it earned and the Playbook sources it cited. No Message text. */
export const touchSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('message'), messageId: messageIdSchema, ...touchShape }),
  z.strictObject({ kind: z.literal('call'), callId: callIdSchema, ...touchShape }),
])

/** One touch. */
export type Touch = z.infer<typeof touchSchema>

/** The Outcomes Attribution explains: a Deal that is still open has none. */
export const ATTRIBUTION_OUTCOMES = ['won', 'lost'] as const

/** The query of an Attribution read: a cursor page of touches. */
export const getDealAttributionQuerySchema = pageQuerySchema

/** The Attribution of one Deal: its Outcome, the first-touch and last-touch ids side by side, and a page of touches. */
export const dealAttributionSchema = z.strictObject({
  dealRecordId: dealRecordIdSchema,
  outcome: z.enum(ATTRIBUTION_OUTCOMES),
  lookbackDays: z.number().int().min(1).max(366),
  firstTouchId: touchIdSchema.nullable(),
  lastTouchId: touchIdSchema.nullable(),
  touches: pageSchema(touchSchema),
})

/** The Attribution of one Deal. */
export type DealAttribution = z.infer<typeof dealAttributionSchema>

/** The flag a source can carry: cited often but correlated with lost Deals. */
export const SOURCE_FLAGS = ['cited_often_lost'] as const

/** A source flag. */
export const sourceFlagSchema = z.enum(SOURCE_FLAGS)

/** The query of the source list: a cursor page, optionally only flagged sources. */
export const listSourcePerformanceQuerySchema = pageQuerySchema.extend({
  flag: sourceFlagSchema.optional(),
})

/** The query of the source list. */
export type ListSourcePerformanceQuery = z.infer<typeof listSourcePerformanceQuerySchema>

/** One Moment or Document passage and how its Deals ended. `winRate` is shown only when `recordCount` (the Deals it touched) is at least 20. */
export const sourcePerformanceSchema = z
  .strictObject({
    source: citationRefSchema,
    dealsTouched: z.number().int().min(0),
    dealsWon: z.number().int().min(0),
    recordCount: z.number().int().min(0),
    winRate: z.union([
      z.strictObject({ state: z.literal('ok'), value: z.number().min(0).max(1) }),
      z.strictObject({ state: z.literal('not_enough_data'), value: z.null() }),
    ]),
    flag: sourceFlagSchema.nullable(),
  })
  .superRefine((row, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    if (row.dealsWon > row.dealsTouched) {
      issue('dealsWon', 'Won Deals are a part of the Deals touched')
    }
    if (row.recordCount !== row.dealsTouched) {
      issue('recordCount', 'The record count is the number of Deals touched')
    }
    if ((row.winRate.state === 'ok') !== row.dealsTouched >= MIN_SOURCE_SAMPLE) {
      issue('winRate', 'A win rate is shown only from 20 Deals touched')
    }
  })

/** One source's performance. */
export type SourcePerformance = z.infer<typeof sourcePerformanceSchema>

/** One page of source performance. */
export const listSourcePerformanceResponseSchema = pageSchema(sourcePerformanceSchema)

/** The Outcome label a Conversation summary carries. A closed list. */
export const CONVERSATION_OUTCOME_LABELS = [
  'won',
  'lost',
  'open',
  'no_response',
  'meeting_booked',
] as const

/** The Outcome label of a Conversation. */
export const conversationOutcomeLabelSchema = z.enum(CONVERSATION_OUTCOME_LABELS)

/** The longest summary, in characters. */
export const MAX_SUMMARY_LENGTH = 500

/**
 * A Conversation's summary and Outcome label. The summary is model output: untrusted data, shown
 * as text and never executed. It is stored apart from Message bodies and no route returns a body.
 */
export const conversationSummarySchema = z.strictObject({
  conversationId: conversationIdSchema,
  summary: z.string().trim().min(1).max(MAX_SUMMARY_LENGTH),
  outcomeLabel: conversationOutcomeLabelSchema,
  generatedAt: timestampSchema,
})

/** A Conversation's summary. */
export type ConversationSummary = z.infer<typeof conversationSummarySchema>
