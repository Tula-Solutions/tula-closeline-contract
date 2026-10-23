import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { emailSchema } from '../email'
import { organizationIdSchema, prospectIdSchema, signalIdSchema, userIdSchema } from '../ids'
import { citationUrlSchema } from '../messaging/values'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  enrichmentTextSchema,
  MAX_SIGNAL_FRESHNESS_DAYS,
  MAX_SIGNAL_LABEL_LENGTH,
  MAX_SIGNAL_TEXT_LENGTH,
  providerKeySchema,
  vendorTextSchema,
} from './values'

/** The kinds of signal, in the order the portal lists them. */
export const SIGNAL_KINDS = [
  'funding',
  'hiring_spike',
  'job_change',
  'technology_change',
  'website_visit',
  'note',
] as const

/** The kind of a signal. */
export const signalKindSchema = z.enum(SIGNAL_KINDS)

/** The kind of a signal. */
export type SignalKind = z.infer<typeof signalKindSchema>

/** How a signal got here: from a provider, from the Organization's own signed webhook, or typed in by a person. */
export const signalSourceSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('provider'), provider: providerKeySchema }),
  z.object({ type: z.literal('webhook') }),
  z.object({ type: z.literal('manual'), userId: userIdSchema }),
])

/** How a signal got here. */
export type SignalSource = z.infer<typeof signalSourceSchema>

/** The closed list of funding rounds; anything else a provider names is `other`. */
export const FUNDING_ROUNDS = [
  'pre_seed',
  'seed',
  'series_a',
  'series_b',
  'series_c',
  'later_stage',
  'debt',
  'grant',
  'other',
] as const

const label = vendorTextSchema(MAX_SIGNAL_LABEL_LENGTH)

const signalBase = {
  id: signalIdSchema,
  prospectId: prospectIdSchema,
  source: signalSourceSchema,
  /** When it happened; a Citation of this signal carries the same time as `observedAt`. */
  observedAt: timestampSchema,
  recordedAt: timestampSchema,
  /** When it stops being fresh, from the Organization's freshness setting for its kind. */
  expiresAt: timestampSchema,
  /** True while `expiresAt` is in the future. A stale signal is shown but never used in a message. */
  fresh: z.boolean(),
}

/**
 * A dated, typed event about a Prospect or its company that gives a reason to contact them now.
 * A union by `kind`. Text in it came from a provider, a web page, a webhook or a person: untrusted
 * data, bounded, shown to people and never run as an instruction. Unknown fields are dropped.
 */
export const signalSchema = z.discriminatedUnion('kind', [
  z.object({
    ...signalBase,
    kind: z.literal('funding'),
    round: z.enum(FUNDING_ROUNDS),
    amountMajorUnits: z.number().int().min(0).max(1_000_000_000_000).nullable(),
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .nullable(),
  }),
  z.object({
    ...signalBase,
    kind: z.literal('hiring_spike'),
    openRoles: z.number().int().min(1).max(100_000),
    windowDays: z.number().int().min(1).max(365),
    department: label.nullable(),
  }),
  z.object({
    ...signalBase,
    kind: z.literal('job_change'),
    previousTitle: label.nullable(),
    newTitle: label,
    previousCompany: label.nullable(),
    newCompany: label.nullable(),
  }),
  z.object({
    ...signalBase,
    kind: z.literal('technology_change'),
    technology: label,
    change: z.enum(['adopted', 'dropped']),
  }),
  z.object({
    ...signalBase,
    kind: z.literal('website_visit'),
    pageUrl: citationUrlSchema,
    visitCount: z.number().int().min(1).max(1_000_000),
  }),
  z.object({
    ...signalBase,
    kind: z.literal('note'),
    text: vendorTextSchema(MAX_SIGNAL_TEXT_LENGTH),
  }),
])

/** A signal. */
export type Signal = z.infer<typeof signalSchema>

/** The body to record a note: a Rep's own words about a Prospect, such as "met at the conference". The other kinds come from providers and the webhook, not from people. */
export const recordNoteRequestSchema = z.strictObject({
  kind: z.literal('note'),
  text: enrichmentTextSchema(MAX_SIGNAL_TEXT_LENGTH, true),
  observedAt: timestampSchema.optional(),
})

/** The body to record a note. */
export type RecordNoteRequest = z.infer<typeof recordNoteRequestSchema>

/** The query of a signal list: cursor, limit (at most 100), an optional kind and whether to list only fresh signals. */
export const listSignalsQuerySchema = pageQuerySchema.extend({
  kind: signalKindSchema.optional(),
  fresh: z
    .union([z.boolean(), z.enum(['true', 'false']).transform((text) => text === 'true')])
    .optional(),
})

/** One page of signals, newest first (by `observedAt`, then id). */
export const listSignalsResponseSchema = pageSchema(signalSchema)

/** The header that carries the webhook timestamp. */
export const SIGNAL_WEBHOOK_TIMESTAMP_HEADER = 'x-closeline-timestamp'

/** The header that carries the webhook signature: lower-case hex of HMAC-SHA256 over `<timestamp>.<raw body>` with the Organization's signing secret. */
export const SIGNAL_WEBHOOK_SIGNATURE_HEADER = 'x-closeline-signature'

/** How far a webhook timestamp may be from the receiver's clock, in seconds; older or newer is refused. */
export const SIGNAL_WEBHOOK_TOLERANCE_SECONDS = 300

/**
 * The body of the signed webhook an Organization calls from its own site: one website visit,
 * naming the Prospect by id or by email address, with an `eventId` that makes a replay record
 * nothing twice. The Organization comes from the path, and the Prospect must be that
 * Organization's own.
 */
export const signalWebhookRequestSchema = z.union([
  z.strictObject({
    eventId: z.string().regex(/^[A-Za-z0-9_-]{8,100}$/),
    kind: z.literal('website_visit'),
    prospectId: prospectIdSchema,
    pageUrl: citationUrlSchema,
    visitedAt: timestampSchema,
  }),
  z.strictObject({
    eventId: z.string().regex(/^[A-Za-z0-9_-]{8,100}$/),
    kind: z.literal('website_visit'),
    email: emailSchema,
    pageUrl: citationUrlSchema,
    visitedAt: timestampSchema,
  }),
])

/** The body of the signed webhook. */
export type SignalWebhookRequest = z.infer<typeof signalWebhookRequestSchema>

/** What the webhook answers: the signal recorded, or `duplicate` (and no signal) for an `eventId` already seen. */
export const signalWebhookResponseSchema = z.object({
  recorded: z.boolean(),
  duplicate: z.boolean(),
  signalId: signalIdSchema.nullable(),
})

/** What the webhook answers. */
export type SignalWebhookResponse = z.infer<typeof signalWebhookResponseSchema>

const kindSettingShape = {
  kind: signalKindSchema,
  enabled: z.boolean(),
  freshnessDays: z.number().int().min(1).max(MAX_SIGNAL_FRESHNESS_DAYS),
}

/** How long one kind of signal stays fresh, and whether it counts at all (response side). */
export const signalKindSettingSchema = z.object(kindSettingShape)

/** The same setting in a request, which refuses unknown fields. */
const kindSettingRequestSchema = z.strictObject(kindSettingShape)

/** The setting of one kind of signal. */
export type SignalKindSetting = z.infer<typeof signalKindSettingSchema>

/** Whether the Organization's signing secret is set, and when it was last changed. The secret is never returned here. */
export const signalWebhookStateSchema = z.object({
  configured: z.boolean(),
  rotatedAt: timestampSchema.nullable(),
})

/** The signal settings: one entry per kind (each kind once), the webhook state and a version. */
export const signalSettingsSchema = z.object({
  kinds: z.array(signalKindSettingSchema).length(SIGNAL_KINDS.length),
  webhook: signalWebhookStateSchema,
  version: z.number().int().min(0).max(1_000_000),
  updatedAt: timestampSchema.nullable(),
})

/** The signal settings. */
export type SignalSettings = z.infer<typeof signalSettingsSchema>

/** The body to save the signal settings: every kind once, and the `expectedVersion` the caller read. */
export const setSignalSettingsRequestSchema = z
  .strictObject({
    kinds: z.array(kindSettingRequestSchema).length(SIGNAL_KINDS.length),
    expectedVersion: z.number().int().min(0).max(1_000_000),
  })
  .refine(
    (body) => new Set(body.kinds.map((setting) => setting.kind)).size === SIGNAL_KINDS.length,
    'Each kind is set once'
  )

/** The body to save the signal settings. */
export type SetSignalSettingsRequest = z.infer<typeof setSignalSettingsRequestSchema>

/** The webhook secret, shown once when it is made: 43 URL-safe characters (256 bits). */
export const signalWebhookSecretSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/)

/** The answer to a rotation: the new secret, returned this once, and the address to call. */
export const rotateSignalWebhookResponseSchema = z.object({
  organizationId: organizationIdSchema,
  secret: signalWebhookSecretSchema,
  rotatedAt: timestampSchema,
})

/** The answer to a rotation of the webhook secret. */
export type RotateSignalWebhookResponse = z.infer<typeof rotateSignalWebhookResponseSchema>
