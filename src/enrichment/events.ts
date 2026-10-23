import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import {
  enrichmentRunIdSchema,
  enrichmentRunSetIdSchema,
  prospectIdSchema,
  signalIdSchema,
} from '../ids'
import { signalKindSchema } from './signal'
import { MAX_CRITERION_WEIGHT, MAX_FIT_CRITERIA, microDollarsSchema } from './values'

/** The ways a run ends, as the event reports them. */
export const RUN_END_STATUSES = ['complete', 'incomplete', 'stopped'] as const

/** `enrichment.completed` (version 1): a run ended. Ids, counts and cost only; never a field value, an address or a provider message. */
export const enrichmentCompletedEvent = defineEvent(
  'enrichment.completed',
  1,
  z.strictObject({
    runId: enrichmentRunIdSchema,
    runSetId: enrichmentRunSetIdSchema.nullable(),
    prospectId: prospectIdSchema,
    status: z.enum(RUN_END_STATUSES),
    fieldsFilled: z.number().int().min(0).max(100),
    costMicros: microDollarsSchema,
    completedAt: timestampSchema,
  })
)

/** `signal.recorded` (version 1): a signal was recorded for a Prospect. Ids and values only; never the signal's text or address. */
export const signalRecordedEvent = defineEvent(
  'signal.recorded',
  1,
  z.strictObject({
    signalId: signalIdSchema,
    prospectId: prospectIdSchema,
    kind: signalKindSchema,
    observedAt: timestampSchema,
    recordedAt: timestampSchema,
  })
)

const scoreSchema = z
  .number()
  .int()
  .min(0)
  .max(MAX_FIT_CRITERIA * MAX_CRITERION_WEIGHT)

/** `prospect.fit_changed` (version 1): a Prospect's fit score changed (`previousScore` is null the first time). Ids and numbers only. */
export const prospectFitChangedEvent = defineEvent(
  'prospect.fit_changed',
  1,
  z.strictObject({
    prospectId: prospectIdSchema,
    previousScore: scoreSchema.nullable(),
    score: scoreSchema,
    maxScore: scoreSchema,
    criteriaVersion: z.number().int().min(0).max(1_000_000),
    changedAt: timestampSchema,
  })
)

/** The events the enrichment area publishes, by type. */
export const ENRICHMENT_EVENTS = {
  'enrichment.completed': enrichmentCompletedEvent,
  'signal.recorded': signalRecordedEvent,
  'prospect.fit_changed': prospectFitChangedEvent,
} as const

/** The type of an enrichment event. */
export type EnrichmentEventType = keyof typeof ENRICHMENT_EVENTS
