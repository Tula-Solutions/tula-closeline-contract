import { defineErrors } from '../errors'

/**
 * The errors the Assessment routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`.
 *
 * - `assessment.not_found` (404): unknown Assessment or finding, or one outside the caller's view
 *   (a Manager sees only their Team's; a Rep only the Assessment of a Draft they can see); one of
 *   another Organization the same, never 403.
 * - `assessment.reassess_required` (409): the Draft is held because it failed its check, and the
 *   approval neither edits it (so it can be judged again) nor comes from an Owner or Admin.
 */
export const ASSESSMENT_ERRORS = defineErrors('assessment', {
  not_found: { status: 404, message: 'The Assessment was not found.' },
  reassess_required: {
    status: 409,
    message: 'The Draft failed its check: edit it to have it judged again, or ask an Admin.',
  },
})

/** An Assessment error code. */
export type AssessmentErrorCode = keyof typeof ASSESSMENT_ERRORS
