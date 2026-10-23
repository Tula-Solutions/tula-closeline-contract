import { defineErrors } from '../errors'

/**
 * The errors the messaging routes return, as `area.reason` codes. A role that is not allowed is
 * the common `auth.forbidden`. A Prospect, Campaign, Research Brief or Draft outside the caller's
 * view is its `*.not_found` (404, never 403), so existence is not revealed.
 *
 * - `research.not_found` (404): unknown Research Brief, or not the caller's to see.
 * - `research.timeout` (504): research on the Prospect did not finish in time; nothing was kept.
 * - `draft.not_found` (404): unknown Draft, or not the caller's to see.
 * - `draft.invalid_state` (409): the Draft was edited since it was read, or is already approved or
 *   sent; reload it.
 * - `draft.no_prospect_data` (422): the Prospect has too little in its record to write from.
 * - `draft.model_unavailable` (503): the model could not answer; try again later.
 * - `draft.budget_exceeded` (429): the Organization's drafting budget for the period is spent.
 * - `voice.not_found` (404): the Organization has no Brand Voice yet.
 * - `voice.version_conflict` (409): the Brand Voice was saved since the caller read it.
 * - `voice.invalid` (422): the Brand Voice settings are not valid (a banned phrase also in the
 *   preferred words, for one). The body schema rejects most of this; the service answers this
 *   code, not `request.invalid`, for a body that fails a rule across fields.
 * - `preview.too_many_prospects` (422): a preview names more than five Prospects. The body schema
 *   (`previewRequestSchema`) rejects the same input; the service answers this code, not
 *   `request.invalid`, as `campaign.invalid_sequence` does for its schema.
 */
export const MESSAGING_ERRORS = {
  ...defineErrors('research', {
    not_found: { status: 404, message: 'The Research Brief was not found.' },
    timeout: { status: 504, message: 'Research on the Prospect took too long. Try again.' },
  }),
  ...defineErrors('draft', {
    not_found: { status: 404, message: 'The Draft was not found.' },
    invalid_state: { status: 409, message: 'The Draft is not in a state that allows this.' },
    no_prospect_data: {
      status: 422,
      message: 'There is too little about this Prospect to write a message from.',
    },
    model_unavailable: { status: 503, message: 'The writing model is not available. Try again.' },
    budget_exceeded: { status: 429, message: 'The drafting budget for this period is spent.' },
  }),
  ...defineErrors('voice', {
    not_found: { status: 404, message: 'There is no Brand Voice yet.' },
    version_conflict: {
      status: 409,
      message: 'The Brand Voice changed since it was read. Reload it and try again.',
    },
    invalid: { status: 422, message: 'The Brand Voice is not valid.' },
  }),
  ...defineErrors('preview', {
    too_many_prospects: { status: 422, message: 'A preview covers at most five Prospects.' },
  }),
} as const

/** An error code the messaging routes return. */
export type MessagingErrorCode = keyof typeof MESSAGING_ERRORS
