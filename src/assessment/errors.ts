import { defineErrors } from '../errors'

/**
 * The errors the Assessment routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`.
 *
 * - `assessment.not_found` (404): unknown Assessment or finding, or one outside the caller's view
 *   (a Manager sees only their Team's; a Rep only the Assessment of a Draft they can see); one of
 *   another Organization the same, never 403.
 */
export const ASSESSMENT_ERRORS = defineErrors('assessment', {
  not_found: { status: 404, message: 'The Assessment was not found.' },
})

/** An Assessment error code. */
export type AssessmentErrorCode = keyof typeof ASSESSMENT_ERRORS
