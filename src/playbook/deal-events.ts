import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import { dealRecordIdSchema, prospectIdSchema } from '../ids'
import { outcomeSchema } from './deal-values'

/**
 * `deal.outcome_changed` (version 1): a Deal's Outcome moved, by import, CRM sync or a Rep. Ids and
 * labels only: the opaque `dealRecordId` (the customer's own deal id never travels), the Prospect
 * when the Deal is linked to one, and the old and new Outcome, which differ. Core consumes it to
 * write Attribution and the outcome counts.
 */
export const dealOutcomeChangedEvent = defineEvent(
  'deal.outcome_changed',
  1,
  z
    .strictObject({
      dealRecordId: dealRecordIdSchema,
      prospectId: prospectIdSchema.nullable(),
      previousOutcome: outcomeSchema,
      outcome: outcomeSchema,
      changedAt: timestampSchema,
    })
    .refine((data) => data.previousOutcome !== data.outcome, {
      message: 'The Outcome must change',
      path: ['outcome'],
    })
)

/** Every Playbook event, by type. */
export const PLAYBOOK_EVENTS = {
  'deal.outcome_changed': dealOutcomeChangedEvent,
} as const

/** The type of a Playbook event. */
export type PlaybookEventType = keyof typeof PLAYBOOK_EVENTS
