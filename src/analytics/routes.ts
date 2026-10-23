import { type InboundRoute, inboundRoute } from '../inbound-route'
import type { Role } from '../tenancy'
import type { AnalyticsErrorCode } from './errors'

/** The roles that read dashboard numbers: Owner and Admin all, a Manager their Team's Reps, a Rep their own. */
export const ANALYTICS_READ_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The roles that read Attribution and source performance. */
export const ANALYTICS_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The analytics route names. */
export type AnalyticsRouteName =
  | 'getSeries'
  | 'listTable'
  | 'downloadTableCsv'
  | 'getDealAttribution'
  | 'listSourcePerformance'
  | 'getConversationSummary'

/** One analytics route. */
export type AnalyticsRoute = InboundRoute<AnalyticsErrorCode>

const SCOPE =
  "Rows are scoped by role: a Rep sees only their own, a Manager the Reps on their own Team, an Admin and an Owner all of the Organization's. A second Organization sees nothing of the first. A row outside the caller's view is request.not_found (404), never 403."

const RANGE =
  'The range (from, to) is two real calendar days, from not after to, and spans at most 13 calendar months (to is not after from plus 13 months minus one day), else analytics.range_too_large (422).'

const SAMPLE =
  'Every value carries recordCount, the number of records it rests on. A rate with fewer than 20 records has state not_enough_data and a null value: that is an answer, not an error.'

/**
 * The analytics routes (spec M15). Core owns them and serves them from daily rollups built from
 * events, so a request never scans history. Only counts, labels and ids travel: never Message text.
 */
export const ANALYTICS_ROUTES: Readonly<Record<AnalyticsRouteName, AnalyticsRoute>> = Object.freeze(
  {
    getSeries: inboundRoute({
      method: 'GET',
      path: '/v1/analytics/series',
      roles: ANALYTICS_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: ['analytics.range_too_large'],
      commonErrors: ['request.invalid'],
      description: `Reads one metric (sends, replies, positive_replies, meetings, outcomes_won or outcomes_lost) per day, optionally split by channel, agent_kind, campaign or rep and filtered by channel, Agent kind, Campaign and Rep. Lines (groups) are cursor-paginated, at most 20 a page (limit, cursor), each of at most 400 days. ${RANGE} ${SAMPLE} ${SCOPE}`,
    }),
    listTable: inboundRoute({
      method: 'GET',
      path: '/v1/analytics/table',
      roles: ANALYTICS_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: ['analytics.range_too_large'],
      commonErrors: ['request.invalid'],
      description: `Compares Campaigns or Reps side by side: one row each with sends, replies, positive replies, meetings, won and lost Outcomes, and the reply, positive-reply and win rates. One cursor-paginated page at a time (at most 100). ${RANGE} ${SAMPLE} ${SCOPE}`,
    }),
    downloadTableCsv: inboundRoute({
      method: 'GET',
      path: '/v1/analytics/table.csv',
      roles: ANALYTICS_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: ['analytics.range_too_large'],
      commonErrors: ['request.invalid'],
      description: `Downloads the comparison table as text/csv, one cursor-paginated page at a time (at most 1,000 rows); the next cursor is in the x-next-cursor response header, absent on the last page. The filters are those of the table. Cells that start with =, +, - or @ are escaped so a spreadsheet does not run them. ${RANGE} ${SCOPE}`,
    }),
    getDealAttribution: inboundRoute({
      method: 'GET',
      path: '/v1/analytics/deals/{dealRecordId}/attribution',
      roles: ANALYTICS_ADMIN_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.invalid', 'request.not_found'],
      description:
        'Shows the Attribution of one won or lost Deal: the Messages and Calls that touched the Prospect in the 180-day look-back (a proposal), with first-touch and last-touch credit side by side (firstTouchId and lastTouchId) and the Playbook sources each touch cited. Touches are one cursor-paginated page (at most 100). Ids and times only, never Message text. An open Deal, an unknown Deal or one of another Organization is request.not_found (404), never 403. Owner and Admin only.',
    }),
    listSourcePerformance: inboundRoute({
      method: 'GET',
      path: '/v1/analytics/source-performance',
      roles: ANALYTICS_ADMIN_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.invalid'],
      description:
        'Lists the Moments and Document passages the Agents cited, each with the Deals it touched, the Deals won and a win rate. The win rate is shown only from 20 Deals touched, else state not_enough_data; recordCount is the Deals touched. The optional flag cited_often_lost keeps only sources cited often but correlated with lost Deals. One cursor-paginated page at a time (at most 100). Owner and Admin only; a second Organization sees nothing of the first.',
    }),
    getConversationSummary: inboundRoute({
      method: 'GET',
      path: '/v1/conversations/{conversationId}/summary',
      roles: ANALYTICS_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: [],
      commonErrors: ['request.not_found'],
      description: `Reads the short summary (at most 500 characters) and Outcome label (won, lost, open, no_response or meeting_booked) of a Conversation. The summary is model output: untrusted data, never executed. The route returns the summary only, never a Message body. ${SCOPE}`,
    }),
  }
)
