import { defineErrors } from '../errors'

/**
 * The errors the Assessment routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`.
 *
 * - `assessment.not_found` (404): unknown Assessment or finding, or one outside the caller's view
 *   (a Manager sees only their Team's; a Rep only the Assessment of a Draft they can see); one of
 *   another Organization the same, never 403.
 * - `assessment.reassess_required` (409): the Draft's text changed since it was judged, so it must be
 *   judged again before it can be released.
 */
export const ASSESSMENT_ERRORS = defineErrors('assessment', {
  not_found: { status: 404, message: 'The Assessment was not found.' },
  reassess_required: {
    status: 409,
    message: 'The Draft changed since it was judged and must be assessed again.',
  },
})

/** An Assessment error code. */
export type AssessmentErrorCode = keyof typeof ASSESSMENT_ERRORS
