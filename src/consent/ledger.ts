import { z } from 'zod'
import { timestampSchema } from '../core/values'
import {
  callIdSchema,
  consentEventIdSchema,
  consentFormIdSchema,
  consentWordingIdSchema,
  prospectIdSchema,
  userIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  CONSENT_CHANNELS,
  CONSENT_GRANT_SOURCES,
  CONSENT_RECORDABLE_SOURCES,
  CONSENT_WITHDRAWAL_SOURCES,
  consentChannelSchema,
  consentSourceSchema,
  evidenceRefSchema,
  suppressionReasonSchema,
} from './values'

/** The current state of one channel's Contact Consent, derived from the ledger and never edited. */
export const CONSENT_STATES = ['granted', 'withdrawn', 'none'] as const

/** The current state of a channel's Contact Consent. */
export const consentStateSchema = z.enum(CONSENT_STATES)

/** The current state of a channel's Contact Consent. */
export type ConsentState = z.infer<typeof consentStateSchema>

/**
 * One event of the append-only consent ledger (ADR 0021). A `granted` event carries the Consent
 * Wording shown (`wordingId`), the `evidenceRef` and, by source, the Call (`verbal_call`) or the
 * hosted form (`hosted_form`); a `withdrawn` event needs neither wording nor evidence and has a
 * withdrawal source. `stopAll` is true on each event a STOP-all appended. `occurredAt` is when the
 * Prospect agreed or withdrew, `recordedAt` when core stored it; `recordedByUserId` is null when a
 * system (a form, a STOP reply, a sync) recorded it. The ledger is never updated or deleted.
 */
export const consentEventSchema = z
  .object({
    id: consentEventIdSchema,
    prospectId: prospectIdSchema,
    channel: consentChannelSchema,
    kind: z.enum(['granted', 'withdrawn']),
    source: consentSourceSchema,
    wordingId: consentWordingIdSchema.nullable(),
    evidenceRef: evidenceRefSchema.nullable(),
    callId: callIdSchema.nullable(),
    formId: consentFormIdSchema.nullable(),
    stopAll: z.boolean(),
    recordedByUserId: userIdSchema.nullable(),
    occurredAt: timestampSchema,
    recordedAt: timestampSchema,
  })
  .superRefine((event, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: 'custom', message })
    const grant = event.kind === 'granted'
    const sources: readonly string[] = grant ? CONSENT_GRANT_SOURCES : CONSENT_WITHDRAWAL_SOURCES
    if (!sources.includes(event.source)) {
      issue(grant ? 'A grant has a grant source' : 'A withdrawal has a withdrawal source')
    }
    if (grant && (event.wordingId === null || event.evidenceRef === null)) {
      issue('A grant carries the wording shown and an evidence reference')
    }
    if (grant && event.stopAll) {
      issue('Only a withdrawal can be a STOP-all')
    }
    if ((event.source === 'verbal_call') !== (event.callId !== null)) {
      issue('A verbal grant links the Call, and only a verbal grant does')
    }
    if ((event.source === 'hosted_form') !== (event.formId !== null)) {
      issue('A hosted grant links the form, and only a hosted grant does')
    }
  })

/** One event of the consent ledger. */
export type ConsentEvent = z.infer<typeof consentEventSchema>

/** The state of one channel for a Prospect: `since` and the last event are null while there is no event. */
export const channelConsentSchema = z
  .object({
    channel: consentChannelSchema,
    state: consentStateSchema,
    since: timestampSchema.nullable(),
    lastEventId: consentEventIdSchema.nullable(),
    wordingId: consentWordingIdSchema.nullable(),
  })
  .refine(
    (c) =>
      (c.state === 'none') === (c.since === null && c.lastEventId === null) &&
      (c.state === 'granted' || c.wordingId === null),
    'A channel with no event has no time or event; only a grant carries wording'
  )

/**
 * A Prospect's Contact Consent per channel, derived from the ledger, with whether the Prospect
 * is on the Suppression list and why. Every channel appears exactly once. `suppressed` is true
 * exactly when `suppressionReason` is set; a suppressed Prospect is refused on every channel.
 */
export const prospectConsentSchema = z
  .object({
    prospectId: prospectIdSchema,
    channels: z.array(channelConsentSchema).length(CONSENT_CHANNELS.length),
    suppressed: z.boolean(),
    suppressionReason: suppressionReasonSchema.nullable(),
  })
  .refine(
    (c) => new Set(c.channels.map((channel) => channel.channel)).size === CONSENT_CHANNELS.length,
    'Each channel appears once'
  )
  .refine(
    (c) => c.suppressed === (c.suppressionReason !== null),
    'A suppressed Prospect has a reason'
  )

/** A Prospect's Contact Consent per channel. */
export type ProspectConsent = z.infer<typeof prospectConsentSchema>

/**
 * The body of a request to record a granted Contact Consent. `source` is one a person may claim
 * (never `hosted_form`; core sets that from the form); the wording must be one the Organization
 * wrote that covers the channel, and `evidenceRef` points at the artefact. A `verbal_call` grant
 * names the Call as `callId`; other sources must not. The actor is the caller, set by core.
 * `occurredAt` defaults to now and may not be in the future. Without a source, wording and
 * reference core refuses the request: a checkbox is not proof. Accepts an `Idempotency-Key`.
 */
export const recordConsentRequestSchema = z
  .strictObject({
    channel: consentChannelSchema,
    source: z.enum(CONSENT_RECORDABLE_SOURCES),
    wordingId: consentWordingIdSchema,
    evidenceRef: evidenceRefSchema,
    callId: callIdSchema.optional(),
    occurredAt: timestampSchema.optional(),
  })
  .refine(
    (body) => (body.source === 'verbal_call') === (body.callId !== undefined),
    'A verbal grant names the Call, and only a verbal grant does'
  )

/** The body of a request to record a granted Contact Consent. */
export type RecordConsentRequest = z.infer<typeof recordConsentRequestSchema>

/**
 * The body of a request to record a withdrawal: the named `channels`, or `all: true` for a
 * STOP-all that withdraws every channel. Exactly one of the two. A withdrawal on some channels
 * leaves the others alone. The source is `manual` and the actor the caller, set by core.
 */
export const withdrawConsentRequestSchema = z
  .strictObject({
    channels: z
      .array(consentChannelSchema)
      .min(1)
      .max(CONSENT_CHANNELS.length)
      .refine((channels) => new Set(channels).size === channels.length, 'No repeats')
      .optional(),
    all: z.literal(true).optional(),
    occurredAt: timestampSchema.optional(),
  })
  .refine(
    (body) => (body.channels === undefined) !== (body.all === undefined),
    'Give channels or all'
  )

/** The body of a request to record a withdrawal. */
export type WithdrawConsentRequest = z.infer<typeof withdrawConsentRequestSchema>

/** The path parameters of a request about one Prospect's consent. */
export const consentProspectParamsSchema = z.strictObject({ prospectId: prospectIdSchema })

/** The query parameters of a request to list a Prospect's consent events: newest first, optionally one channel. */
export const listConsentEventsQuerySchema = pageQuerySchema
  .extend({ channel: consentChannelSchema.optional() })
  .strict()

/** The query parameters of a request to list consent events. */
export type ListConsentEventsQuery = z.infer<typeof listConsentEventsQuerySchema>

/** One page of consent events. */
export const consentEventPageSchema = pageSchema(consentEventSchema)

/** The answer to recording a grant or a withdrawal: the events appended (one per channel) and the Prospect's consent now. */
export const recordedConsentSchema = z.object({
  events: z.array(consentEventSchema).min(1).max(CONSENT_CHANNELS.length),
  consent: prospectConsentSchema,
})

/** The answer to recording a grant or a withdrawal. */
export type RecordedConsent = z.infer<typeof recordedConsentSchema>
