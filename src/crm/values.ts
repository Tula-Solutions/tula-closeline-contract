import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { crmConnectionIdSchema, crmSyncRunIdSchema, membershipIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { PROSPECT_COMPANY_FIELD_NAMES, PROSPECT_FIELD_NAMES } from '../prospect/values'

/** The CRMs Closeline connects to. HubSpot is first, Salesforce second; one connection per provider per Organization (ADR 0022). */
export const CRM_PROVIDERS = ['hubspot', 'salesforce'] as const

/** A CRM provider. */
export const crmProviderSchema = z.enum(CRM_PROVIDERS)

/** A CRM provider. */
export type CrmProvider = z.infer<typeof crmProviderSchema>

/** The Source kind (ADR 0020) of values a provider's sync writes: `crm:hubspot` or `crm:salesforce`. */
export function crmSourceKind(provider: CrmProvider): `crm:${CrmProvider}` {
  return `crm:${provider}`
}

/** The kinds of CRM object a sync run pulls: Deals, Calls, companies and contacts. */
export const CRM_OBJECT_KINDS = ['deal', 'call', 'company', 'contact'] as const

/** A kind of CRM object. */
export const crmObjectKindSchema = z.enum(CRM_OBJECT_KINDS)

/** A kind of CRM object. */
export type CrmObjectKind = z.infer<typeof crmObjectKindSchema>

/** The longest id of a CRM's own record, stage, pipeline or account, in characters. */
export const MAX_CRM_EXTERNAL_ID_LENGTH = 128

/** The longest display label read from a CRM (an account, stage or pipeline name), in characters. */
export const MAX_CRM_LABEL_LENGTH = 200

const externalIdSchema = z.string().min(1).max(MAX_CRM_EXTERNAL_ID_LENGTH)
const labelSchema = z.string().min(1).max(MAX_CRM_LABEL_LENGTH)
const countSchema = z.number().int().min(0).max(100_000_000)

// ---------------------------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------------------------

/** What a connection can do: `read` is the minimum read set; `read_write` is asked for only when write-back is switched on (ADR 0022). */
export const CRM_SCOPE_LEVELS = ['read', 'read_write'] as const

/** What a connection can do. */
export const crmScopeLevelSchema = z.enum(CRM_SCOPE_LEVELS)

/** The states of a stored connection; `not_connected` is the status when none exists. */
export const CRM_CONNECTION_STATES = ['connected', 'needs_reconnect'] as const

/**
 * A CRM connection as the API returns it (ADR 0022). It never carries an access token, a refresh
 * token, a client secret, the authorisation `state` or the CRM's cursor: the read shape has no
 * field for them and drops any a service passes by mistake. `accountLabel` is the CRM account's
 * display name, read from the CRM and so untrusted text.
 */
export const crmConnectionSchema = z
  .object({
    id: crmConnectionIdSchema,
    provider: crmProviderSchema,
    state: z.enum(CRM_CONNECTION_STATES),
    accountLabel: labelSchema.nullable(),
    scopeLevel: crmScopeLevelSchema,
    connectedByMembershipId: membershipIdSchema,
    connectedAt: timestampSchema,
    lastSyncedAt: timestampSchema.nullable(),
    needsReconnectSince: timestampSchema.nullable(),
  })
  .refine((c) => (c.state === 'needs_reconnect') === (c.needsReconnectSince !== null), {
    message: 'needsReconnectSince is set exactly when the state is needs_reconnect',
  })

/** A CRM connection as the API returns it. */
export type CrmConnection = z.infer<typeof crmConnectionSchema>

/** The status an Organization's CRM shows: `not_connected` (the default), `connected` or `needs_reconnect`. */
export const CRM_STATUS_STATES = ['not_connected', 'connected', 'needs_reconnect'] as const

/** The Integrations status of one provider: the state and, unless `not_connected`, the connection. */
export const crmConnectionStatusSchema = z
  .object({
    provider: crmProviderSchema,
    state: z.enum(CRM_STATUS_STATES),
    connection: crmConnectionSchema.nullable(),
  })
  .refine(
    (s) =>
      s.state === 'not_connected'
        ? s.connection === null
        : s.connection !== null &&
          s.connection.state === s.state &&
          s.connection.provider === s.provider,
    { message: 'the connection must match the state and the provider' }
  )

/** The Integrations status of one provider. */
export type CrmConnectionStatus = z.infer<typeof crmConnectionStatusSchema>

/** One page of CRM connections (one at most per provider). */
export const listCrmConnectionsResponseSchema = pageSchema(crmConnectionSchema)

/** The query of the connection list: cursor and limit (at most 100). */
export const listCrmConnectionsQuerySchema = pageQuerySchema

/**
 * The request to start connecting: `writeBack` asks for write scopes as well, which is off by
 * default. The redirect address is never chosen by the caller; it is set in core's configuration.
 */
export const crmAuthorisationRequestSchema = z.strictObject({
  writeBack: z.boolean().default(false),
})

/** The answer to starting a connection: the CRM's sign-in address and when the `state` inside it expires. */
export const crmAuthorisationSchema = z.object({
  authorisationUrl: z.url({ protocol: /^https$/ }).max(2048),
  expiresAt: timestampSchema,
})

/** The longest value of a callback query parameter, in characters. */
export const MAX_CRM_CALLBACK_PARAM_LENGTH = 2048

/**
 * The query the CRM's sign-in returns to the callback with: the one-time `code` or an `error`, and
 * the signed `state`. Parameters this contract does not name are dropped, not refused, because a
 * provider may add its own; nothing from them is used.
 */
export const crmCallbackQuerySchema = z.object({
  code: z.string().min(1).max(MAX_CRM_CALLBACK_PARAM_LENGTH).optional(),
  state: z.string().min(1).max(MAX_CRM_CALLBACK_PARAM_LENGTH),
  error: z.string().min(1).max(100).optional(),
})

/** The path parameter that names a provider. */
export const crmProviderParamsSchema = z.strictObject({ provider: crmProviderSchema })

// ---------------------------------------------------------------------------------------------
// Field directions
// ---------------------------------------------------------------------------------------------

/** Which way a field moves (ADR 0022): `read_only` is CRM to Closeline, `write_only` is Closeline to CRM, `both` is each. */
export const CRM_DIRECTIONS = ['read_only', 'write_only', 'both'] as const

/** Which way a field moves. */
export const crmDirectionSchema = z.enum(CRM_DIRECTIONS)

/** Which way a field moves. */
export type CrmDirection = z.infer<typeof crmDirectionSchema>

/** The direction every field has until an Admin changes it: read only (ADR 0022). */
export const CRM_DEFAULT_DIRECTION = 'read_only' as const satisfies CrmDirection

/**
 * The fields an Admin sets a direction for: a Deal's Outcome, each Prospect and Prospect Company
 * field that carries a Source, and the activity notes Closeline writes. Calls are not a setting:
 * they only ever come in, and only under the rights confirmation.
 */
export const CRM_FIELD_KEYS = [
  'deal.outcome',
  ...PROSPECT_COMPANY_FIELD_NAMES.map((name) => `company.${name}` as const),
  ...PROSPECT_FIELD_NAMES.map((name) => `contact.${name}` as const),
  'activity.notes',
] as const

/** A field with a direction setting. */
export const crmFieldKeySchema = z.enum(CRM_FIELD_KEYS)

/** A field with a direction setting. */
export type CrmFieldKey = z.infer<typeof crmFieldKeySchema>

const fieldDirectionEntrySchema = z.object({
  field: crmFieldKeySchema,
  direction: crmDirectionSchema,
})

const notesNeverComeBack = (entry: { field: CrmFieldKey; direction: CrmDirection }) =>
  entry.field !== 'activity.notes' || entry.direction !== 'both'

const NOTES_MESSAGE = 'activity.notes only goes to the CRM (write_only) or stays off (read_only)'

/** The direction of one field. `activity.notes` is `write_only` or `read_only` (off), never `both`. */
export const crmFieldDirectionSchema = fieldDirectionEntrySchema.refine(notesNeverComeBack, {
  message: NOTES_MESSAGE,
})

/** The direction of one field. */
export type CrmFieldDirection = z.infer<typeof crmFieldDirectionSchema>

/**
 * The direction settings as returned: every field in `CRM_FIELD_KEYS` once, in that order. A field
 * never set is `read_only`; a service may leave unset fields out and the schema fills them in.
 */
export const crmFieldDirectionsSchema = z.object({
  entries: z
    .array(crmFieldDirectionSchema)
    .max(CRM_FIELD_KEYS.length)
    .transform((entries) => {
      const set = new Map(entries.map((entry) => [entry.field, entry.direction]))
      return CRM_FIELD_KEYS.map((field) => ({
        field,
        direction: set.get(field) ?? CRM_DEFAULT_DIRECTION,
      }))
    }),
})

/** The direction settings as returned. */
export type CrmFieldDirections = z.output<typeof crmFieldDirectionsSchema>

/** The request that changes direction settings: the fields named change, the rest stay as they are. Each field once. */
export const crmSetFieldDirectionsRequestSchema = z.strictObject({
  entries: z
    .array(crmFieldDirectionSchema)
    .min(1)
    .max(CRM_FIELD_KEYS.length)
    .refine((entries) => new Set(entries.map((e) => e.field)).size === entries.length, {
      message: 'name each field once',
    }),
})

// ---------------------------------------------------------------------------------------------
// Stage mapping
// ---------------------------------------------------------------------------------------------

/** What a CRM deal stage means to Closeline (ADR 0022). */
export const CRM_STAGE_OUTCOMES = ['won', 'lost', 'open'] as const

/** What a CRM deal stage means to Closeline. */
export const crmStageOutcomeSchema = z.enum(CRM_STAGE_OUTCOMES)

/** What a CRM deal stage means to Closeline. */
export type CrmStageOutcome = z.infer<typeof crmStageOutcomeSchema>

/** The most stages a Stage mapping holds. */
export const MAX_CRM_STAGE_MAPPINGS = 500

/** One CRM deal stage, as the CRM names it, with the Outcome an Admin gave it. `label` is for display only and is untrusted text from the CRM. */
export const crmStageMappingEntrySchema = z.strictObject({
  stageId: externalIdSchema,
  label: labelSchema.nullable().default(null),
  outcome: crmStageOutcomeSchema,
})

/** One entry of a Stage mapping. */
export type CrmStageMappingEntry = z.infer<typeof crmStageMappingEntrySchema>

/**
 * The Stage mapping of one connection (ADR 0022). `confirmed` is true only once an Owner or Admin
 * confirmed it; until then no Deal is imported (`crm.mapping_incomplete`).
 */
export const crmStageMappingSchema = z
  .object({
    provider: crmProviderSchema,
    entries: z.array(crmStageMappingEntrySchema).max(MAX_CRM_STAGE_MAPPINGS),
    confirmed: z.boolean(),
    confirmedByMembershipId: membershipIdSchema.nullable(),
    confirmedAt: timestampSchema.nullable(),
  })
  .refine(
    (m) =>
      m.confirmed
        ? m.confirmedByMembershipId !== null && m.confirmedAt !== null
        : m.confirmedByMembershipId === null && m.confirmedAt === null,
    { message: 'who and when are set exactly when the mapping is confirmed' }
  )

/** The Stage mapping of one connection. */
export type CrmStageMapping = z.infer<typeof crmStageMappingSchema>

/** The request that confirms the Stage mapping: the whole list replaces the earlier one, each stage once. Saving it is the confirmation. */
export const crmSetStageMappingRequestSchema = z.strictObject({
  entries: z
    .array(crmStageMappingEntrySchema)
    .min(1)
    .max(MAX_CRM_STAGE_MAPPINGS)
    .refine((entries) => new Set(entries.map((e) => e.stageId)).size === entries.length, {
      message: 'map each stage once',
    }),
})

/** A deal stage of the CRM, listed for an Admin to map. All text comes from the CRM and is untrusted. */
export const crmStageSchema = z.object({
  stageId: externalIdSchema,
  label: labelSchema,
  pipelineId: externalIdSchema.nullable(),
  pipelineLabel: labelSchema.nullable(),
})

/** A deal stage of the CRM. */
export type CrmStage = z.infer<typeof crmStageSchema>

/** One page of the CRM's deal stages. */
export const listCrmStagesResponseSchema = pageSchema(crmStageSchema)

/** The query of the stage list: cursor and limit (at most 100). */
export const listCrmStagesQuerySchema = pageQuerySchema

// ---------------------------------------------------------------------------------------------
// Sync runs
// ---------------------------------------------------------------------------------------------

/** Why a run started. */
export const CRM_RUN_TRIGGERS = ['first_load', 'manual', 'webhook', 'sweep', 'retry'] as const

/** Where a run is. `completed` may still hold failed records; `failed` means the run itself stopped. */
export const CRM_RUN_STATES = ['queued', 'running', 'completed', 'failed'] as const

/** Where a run is. */
export const crmRunStateSchema = z.enum(CRM_RUN_STATES)

/** Where a run is. */
export type CrmRunState = z.infer<typeof crmRunStateSchema>

/** Why a record was skipped: a closed list, never a message. `manual_value_kept` is a field a person set and a sync never overwrites (ADR 0020). */
export const CRM_SKIP_REASONS = [
  'no_recording_or_transcript',
  'manual_value_kept',
  'own_echo',
  'missing_required_field',
] as const

/** Why a record was skipped. */
export const crmSkipReasonSchema = z.enum(CRM_SKIP_REASONS)

/** Why a record failed: a closed list. A poison record is reported and does not stop the run. */
export const CRM_FAILURE_REASONS = [
  'invalid_record',
  'write_rejected',
  'provider_error',
  'timed_out',
] as const

/** Why a record failed. */
export const crmFailureReasonSchema = z.enum(CRM_FAILURE_REASONS)

/** The most failed records a run names; the count in `counts.failed` is exact. */
export const MAX_CRM_RUN_FAILURES = 50

/** The crm codes a run can end with. */
export const CRM_RUN_ERROR_CODES = [
  'crm.needs_reconnect',
  'crm.rate_limited',
  'crm.mapping_incomplete',
  'crm.rights_not_confirmed',
] as const

/** The counts of a run, exact. `unlinked` is a Deal deleted in the CRM and marked unlinked here. */
export const crmRunCountsSchema = z.object({
  created: countSchema,
  updated: countSchema,
  skipped: countSchema,
  failed: countSchema,
  unlinked: countSchema,
})

/**
 * A sync run and its report (ADR 0022). `skipped` counts by reason; `skippedFields` counts, by field,
 * the values a manual edit protected. `failures` names at most 50 CRM records by their id in the CRM,
 * with a closed reason: no message, no CRM data. The CRM cursor is never returned.
 */
export const crmSyncRunSchema = z
  .object({
    id: crmSyncRunIdSchema,
    connectionId: crmConnectionIdSchema,
    provider: crmProviderSchema,
    objectKind: crmObjectKindSchema,
    trigger: z.enum(CRM_RUN_TRIGGERS),
    state: crmRunStateSchema,
    requestedAt: timestampSchema,
    requestedByMembershipId: membershipIdSchema.nullable(),
    startedAt: timestampSchema.nullable(),
    completedAt: timestampSchema.nullable(),
    counts: crmRunCountsSchema,
    skipped: z
      .array(z.object({ reason: crmSkipReasonSchema, count: countSchema }))
      .max(CRM_SKIP_REASONS.length),
    skippedFields: z
      .array(z.object({ field: crmFieldKeySchema, count: countSchema }))
      .max(CRM_FIELD_KEYS.length),
    failures: z
      .array(z.object({ objectRef: externalIdSchema, reason: crmFailureReasonSchema }))
      .max(MAX_CRM_RUN_FAILURES),
    failuresTruncated: z.boolean(),
    errorCode: z.enum(CRM_RUN_ERROR_CODES).nullable(),
    retryOfRunId: crmSyncRunIdSchema.nullable(),
  })
  .refine((run) => run.errorCode === null || run.state === 'failed', {
    message: 'only a failed run has an error code',
  })

/** A sync run and its report. */
export type CrmSyncRun = z.infer<typeof crmSyncRunSchema>

/** The request that starts a run for one kind of object. Nothing else: no cursor and no page size, core owns both. */
export const crmStartRunRequestSchema = z.strictObject({
  objectKind: crmObjectKindSchema,
})

/** The query of a sync run list: cursor, limit (at most 100) and optional narrowing by state or object kind. */
export const crmListRunsQuerySchema = pageQuerySchema.extend({
  state: crmRunStateSchema.optional(),
  objectKind: crmObjectKindSchema.optional(),
})

/** One page of sync runs, newest first. */
export const listCrmSyncRunsResponseSchema = pageSchema(crmSyncRunSchema)

/** The preview of a first load: what a run would do, counted, with nothing written. */
export const crmSyncPreviewSchema = z.object({
  objectKind: crmObjectKindSchema,
  total: countSchema,
  skipped: z
    .array(z.object({ reason: crmSkipReasonSchema, count: countSchema }))
    .max(CRM_SKIP_REASONS.length),
  truncated: z.boolean(),
})

// ---------------------------------------------------------------------------------------------
// Webhook
// ---------------------------------------------------------------------------------------------

/** How far a webhook delivery's timestamp may be from now, in seconds, either way. A delivery outside it is refused (ADR 0022). Receipts are kept this long plus a margin. */
export const CRM_WEBHOOK_WINDOW_SECONDS = 300

/** The most notices one delivery is read for; the rest of an oversized batch is refused. */
export const MAX_CRM_WEBHOOK_NOTICES = 100

/** The largest webhook body core reads, in bytes. */
export const MAX_CRM_WEBHOOK_BODY_BYTES = 262_144

/**
 * What core takes from a verified webhook delivery, whatever the provider's own body looks like: which
 * account, which kind of object and which object changed. It names an object to pull; the payload is
 * never trusted or kept as data, so every other field is dropped.
 */
export const crmWebhookNoticeSchema = z.object({
  provider: crmProviderSchema,
  externalAccountId: externalIdSchema,
  objectKind: crmObjectKindSchema,
  objectId: externalIdSchema,
  eventId: externalIdSchema,
  occurredAt: timestampSchema,
})

/** What core takes from a verified webhook delivery. */
export type CrmWebhookNotice = z.infer<typeof crmWebhookNoticeSchema>

/** The webhook's answer: how many notices queued a pull. It is fast and does no sync work. */
export const crmWebhookAckSchema = z.object({
  accepted: z.number().int().min(0).max(MAX_CRM_WEBHOOK_NOTICES),
})
