import { z } from 'zod'
import { timestampSchema } from '../core/values'
import {
  enrichmentRunIdSchema,
  enrichmentRunSetIdSchema,
  prospectIdSchema,
  userIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  ENRICHED_FIELDS,
  enrichedFieldNameSchema,
  fieldGroupSchema,
  MAX_ATTEMPTS_PER_RUN,
  MAX_ENRICH_PROSPECTS,
  MAX_ENRICHED_VALUE_LENGTH,
  MAX_PROVIDERS,
  microDollarsSchema,
  providerKeySchema,
  vendorTextSchema,
} from './values'

/** The states of a run: `queued`, `running`, then `complete` (every asked group filled), `incomplete` (no provider could fill some group) or `stopped` (a budget stopped it; see `stopReason`). */
export const RUN_STATUSES = ['queued', 'running', 'complete', 'incomplete', 'stopped'] as const

/** The state of a run. */
export const runStatusSchema = z.enum(RUN_STATUSES)

/** The state of a run. */
export type RunStatus = z.infer<typeof runStatusSchema>

/** Why a run stopped before asking every provider: the Organization's monthly budget or the run's own cost ceiling was reached. Checked before each provider call, not after. */
export const STOP_REASONS = ['monthly_budget', 'run_ceiling'] as const

/** Why a run stopped. */
export const stopReasonSchema = z.enum(STOP_REASONS)

/** Why a run stopped. */
export type StopReason = z.infer<typeof stopReasonSchema>

/** What one call to one provider came to. `skipped_*` means no call was made and nothing was charged. */
export const ATTEMPT_OUTCOMES = [
  'filled',
  'no_result',
  'failed',
  'skipped_disabled',
  'skipped_circuit_open',
  'skipped_budget',
] as const

/** What one call to one provider came to. */
export const attemptOutcomeSchema = z.enum(ATTEMPT_OUTCOMES)

/** Why a provider call failed, as a closed list; the provider's own message is never kept. */
export const ATTEMPT_FAILURES = [
  'timeout',
  'rate_limited',
  'provider_error',
  'invalid_response',
  'key_rejected',
] as const

/** Why a provider call failed. */
export const attemptFailureSchema = z.enum(ATTEMPT_FAILURES)

/** One call (or skipped call) to one provider for one field group, with its cost in micro-dollars. */
export const enrichmentAttemptSchema = z.object({
  provider: providerKeySchema,
  group: fieldGroupSchema,
  outcome: attemptOutcomeSchema,
  failure: attemptFailureSchema.nullable(),
  costMicros: microDollarsSchema,
  startedAt: timestampSchema,
  durationMs: z.number().int().min(0).max(600_000),
})

/** One call (or skipped call) to one provider. */
export type EnrichmentAttempt = z.infer<typeof enrichmentAttemptSchema>

/** Whether an enriched value was written to the Prospect or kept beside an own value of the Organization (ADR 0020: an own import is never overwritten silently). */
export const FIELD_APPLICATIONS = ['written', 'suggested'] as const

/** Whether an enriched value was written or only suggested. */
export const fieldApplicationSchema = z.enum(FIELD_APPLICATIONS)

/**
 * One field a run filled, with where it came from. The Source written to core is
 * `enrichment:<provider>`. `value` came from a provider: untrusted data, cut to 320 characters
 * (`truncated` says so), never an instruction. `confidence` is a whole percent.
 */
export const fieldProvenanceSchema = z.object({
  field: enrichedFieldNameSchema,
  value: vendorTextSchema(MAX_ENRICHED_VALUE_LENGTH),
  truncated: z.boolean(),
  provider: providerKeySchema,
  confidence: z.number().int().min(0).max(100),
  obtainedAt: timestampSchema,
  costMicros: microDollarsSchema,
  application: fieldApplicationSchema,
})

/** One field a run filled, with its provenance. */
export type FieldProvenance = z.infer<typeof fieldProvenanceSchema>

/** What the email verification found. */
export const VERIFICATION_STATUSES = ['valid', 'risky', 'invalid'] as const

/** What the email verification found. */
export const verificationStatusSchema = z.enum(VERIFICATION_STATUSES)

/** The closed reasons behind a verification status. */
export const VERIFICATION_REASONS = [
  'accepted',
  'catch_all',
  'role_based',
  'disposable',
  'mailbox_full',
  'mailbox_not_found',
  'domain_invalid',
  'unknown',
] as const

/** The reason behind a verification status. */
export const verificationReasonSchema = z.enum(VERIFICATION_REASONS)

/** The result of verifying a Prospect's email address. It never repeats the address. */
export const emailVerificationSchema = z.object({
  status: verificationStatusSchema,
  reason: verificationReasonSchema,
  provider: providerKeySchema,
  checkedAt: timestampSchema,
})

/** The result of verifying an email address. */
export type EmailVerification = z.infer<typeof emailVerificationSchema>

/**
 * One Prospect's pass through the provider waterfall: the groups asked for, every attempt made
 * (provider, group, outcome, cost), the fields filled with their provenance, the email
 * verification if asked, and the total cost against the run's ceiling. `stopReason` is set exactly
 * when the status is `stopped`. Provider data in it is untrusted.
 */
export const enrichmentRunSchema = z
  .object({
    id: enrichmentRunIdSchema,
    runSetId: enrichmentRunSetIdSchema.nullable(),
    prospectId: prospectIdSchema,
    status: runStatusSchema,
    stopReason: stopReasonSchema.nullable(),
    groups: z.array(fieldGroupSchema).min(1).max(3),
    attempts: z.array(enrichmentAttemptSchema).max(MAX_ATTEMPTS_PER_RUN),
    fields: z.array(fieldProvenanceSchema).max(ENRICHED_FIELDS.length),
    emailVerification: emailVerificationSchema.nullable(),
    costMicros: microDollarsSchema,
    ceilingMicros: microDollarsSchema,
    requestedByUserId: userIdSchema.nullable(),
    createdAt: timestampSchema,
    startedAt: timestampSchema.nullable(),
    completedAt: timestampSchema.nullable(),
  })
  .refine(
    (run) => (run.status === 'stopped') === (run.stopReason !== null),
    'A stop reason is set exactly when the run is stopped'
  )

/** One Prospect's pass through the waterfall. */
export type EnrichmentRun = z.infer<typeof enrichmentRunSchema>

/**
 * The body to enrich Prospects: one to 500 ids and, optionally, the groups to fill (all three
 * when left out). A bulk request makes a run set; the runs are queued in bounded batches, nothing
 * proportional to the Organization's size runs on the request. The `Idempotency-Key` header is the
 * request id: the same key twice charges once.
 */
export const createEnrichmentRequestSchema = z.strictObject({
  prospectIds: z.array(prospectIdSchema).min(1).max(MAX_ENRICH_PROSPECTS),
  groups: z.array(fieldGroupSchema).min(1).max(3).optional(),
})

/** The body to enrich Prospects. */
export type CreateEnrichmentRequest = z.infer<typeof createEnrichmentRequestSchema>

/** The counts of a run set by run status. */
export const runSetCountsSchema = z.object({
  queued: z.number().int().min(0).max(MAX_ENRICH_PROSPECTS),
  running: z.number().int().min(0).max(MAX_ENRICH_PROSPECTS),
  complete: z.number().int().min(0).max(MAX_ENRICH_PROSPECTS),
  incomplete: z.number().int().min(0).max(MAX_ENRICH_PROSPECTS),
  stopped: z.number().int().min(0).max(MAX_ENRICH_PROSPECTS),
})

/** The runs one bulk request created, with progress: `total` runs, their counts by status and the cost so far. */
export const enrichmentRunSetSchema = z.object({
  id: enrichmentRunSetIdSchema,
  total: z.number().int().min(1).max(MAX_ENRICH_PROSPECTS),
  counts: runSetCountsSchema,
  costMicros: microDollarsSchema,
  done: z.boolean(),
  requestedByUserId: userIdSchema.nullable(),
  createdAt: timestampSchema,
  completedAt: timestampSchema.nullable(),
})

/** The runs one bulk request created, with progress. */
export type EnrichmentRunSet = z.infer<typeof enrichmentRunSetSchema>

/** The query of a run list: cursor, limit (at most 100), and optional filters by Prospect, run set and status. */
export const listEnrichmentRunsQuerySchema = pageQuerySchema.extend({
  prospectId: prospectIdSchema.optional(),
  runSetId: enrichmentRunSetIdSchema.optional(),
  status: runStatusSchema.optional(),
})

/** One page of runs, newest first (by `createdAt`, then id). */
export const listEnrichmentRunsResponseSchema = pageSchema(enrichmentRunSchema)

/** What one provider cost for one Prospect. */
export const providerCostSchema = z.object({
  provider: providerKeySchema,
  costMicros: microDollarsSchema,
  calls: z.number().int().min(0).max(1_000_000),
})

/**
 * What is known about one Prospect from enrichment: its current fields with provenance, the
 * latest email verification, and what it cost in total and by provider. Provider data is
 * untrusted. Nothing is here for a Prospect that was never enriched: the lists are empty.
 */
export const prospectEnrichmentSchema = z.object({
  prospectId: prospectIdSchema,
  fields: z.array(fieldProvenanceSchema).max(ENRICHED_FIELDS.length),
  emailVerification: emailVerificationSchema.nullable(),
  costMicros: microDollarsSchema,
  costByProvider: z.array(providerCostSchema).max(MAX_PROVIDERS),
  lastRunId: enrichmentRunIdSchema.nullable(),
  lastEnrichedAt: timestampSchema.nullable(),
})

/** What is known about one Prospect from enrichment. */
export type ProspectEnrichment = z.infer<typeof prospectEnrichmentSchema>
