import { defineErrors } from '../errors'

/**
 * The errors the analytics routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`. A row or Conversation outside the caller's view, or of another
 * Organization, is the common `request.not_found` (404), never 403. Too little data is not an
 * error: it is the value state `not_enough_data`.
 *
 * - `analytics.range_too_large` (422): the date range is longer than 13 months, or `from` is after
 *   `to`. The query schemas flag the same fault with the issue message `analytics.range_too_large`
 *   on the `to` field, so a router maps that issue to this code.
 */
export const ANALYTICS_ERRORS = defineErrors('analytics', {
  range_too_large: {
    status: 422,
    message: 'The date range is too large. Ask for 13 months or fewer.',
  },
})

/** An analytics error code. */
export type AnalyticsErrorCode = keyof typeof ANALYTICS_ERRORS
