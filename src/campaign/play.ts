import { z } from 'zod'
import { timestampSchema } from '../core/values'
import {
  callIdSchema,
  dealRecordIdSchema,
  documentIdSchema,
  membershipIdSchema,
  playIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { sequenceStepsSchema } from './sequence'
import {
  campaignNameSchema,
  countSchema,
  goalSchema,
  MAX_PLAY_CITATIONS,
  MAX_PROPOSED_PLAYS,
} from './values'

/** What a Play is for: a cold intro, re-engaging closed-lost Deals, following up after an event, or nurturing. */
export const PLAY_INTENTS = [
  'cold_intro',
  'closed_lost_reengagement',
  'post_event_follow_up',
  'nurture',
] as const

/** What a Play is for. */
export const playIntentSchema = z.enum(PLAY_INTENTS)

/** What a Play is for. */
export type PlayIntent = z.infer<typeof playIntentSchema>

/** Where a Play came from: `builtin` (shipped), `seeded` (proposed from the Organization's won Deals) or `custom` (written by a person). */
export const PLAY_SOURCES = ['builtin', 'seeded', 'custom'] as const

/** Where a Play came from. */
export const playSourceSchema = z.enum(PLAY_SOURCES)

/** Where a Play came from. */
export type PlaySource = z.infer<typeof playSourceSchema>

/** A Play's status: `proposed` (awaiting a person), `accepted` (usable by Campaigns) or `discarded`. */
export const PLAY_STATUSES = ['proposed', 'accepted', 'discarded'] as const

/** A Play's status. */
export const playStatusSchema = z.enum(PLAY_STATUSES)

/** A Play's status. */
export type PlayStatus = z.infer<typeof playStatusSchema>

/**
 * Evidence a Play rests on, by id only (no snippet is copied): a Moment of a won Deal's call
 * (`callId` with its `dealRecordId`), or a page of a Playbook document.
 */
export const playCitationSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('moment'),
    callId: callIdSchema,
    dealRecordId: dealRecordIdSchema,
  }),
  z.strictObject({
    kind: z.literal('document'),
    documentId: documentIdSchema,
    page: z.number().int().min(1).max(100_000).nullable(),
  }),
])

/** Evidence a Play rests on. */
export type PlayCitation = z.infer<typeof playCitationSchema>

/**
 * A Play: a reusable Sequence for a stated intent. A `seeded` Play cites the evidence it was
 * proposed from; with no citation `noEvidence` is true and the portal says so. Accepting one with
 * no evidence needs an explicit acknowledgement (`play.no_evidence` otherwise). A `builtin` Play
 * is read-only.
 */
export const playSchema = z
  .strictObject({
    id: playIdSchema,
    name: campaignNameSchema,
    intent: playIntentSchema,
    goal: goalSchema,
    source: playSourceSchema,
    status: playStatusSchema,
    steps: sequenceStepsSchema,
    citations: z.array(playCitationSchema).max(MAX_PLAY_CITATIONS),
    evidenceCount: countSchema,
    noEvidence: z.boolean(),
    createdByMembershipId: membershipIdSchema.nullable(),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
  })
  .superRefine((p, ctx) => {
    if (p.noEvidence !== (p.citations.length === 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['noEvidence'],
        message: 'noEvidence is true exactly when there is no citation',
      })
    }
    if (p.evidenceCount < p.citations.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['evidenceCount'],
        message: 'The evidence count is at least the citations shown',
      })
    }
  })

/** A Play. */
export type Play = z.infer<typeof playSchema>

/** The path parameters of a request about one Play. */
export const playParamsSchema = z.strictObject({ playId: playIdSchema })

/** The query parameters of a Play list. */
export const listPlaysQuerySchema = pageQuerySchema
  .extend({
    intent: playIntentSchema.optional(),
    status: playStatusSchema.optional(),
    source: playSourceSchema.optional(),
  })
  .strict()

/** The query parameters of a Play list. */
export type ListPlaysQuery = z.infer<typeof listPlaysQuerySchema>

/** One page of Plays, newest first (by `createdAt`, then id). */
export const listPlaysResponseSchema = pageSchema(playSchema)

/** The position in a Play list. */
export const playCursorSchema = z.strictObject({ createdAt: timestampSchema, id: playIdSchema })

/** The body that writes a custom Play, accepted at once. */
export const createPlayRequestSchema = z.strictObject({
  name: campaignNameSchema,
  intent: playIntentSchema,
  goal: goalSchema,
  steps: sequenceStepsSchema,
})

/** The body that edits a custom or proposed Play: at least one field. A `builtin` Play is `play.read_only`. */
export const editPlayRequestSchema = z
  .strictObject({
    name: campaignNameSchema.optional(),
    goal: goalSchema.optional(),
    steps: sequenceStepsSchema.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'Change at least one field')

/**
 * The body that asks for proposed Plays from the Organization's won Deals for an intent: at most
 * 5, each citing its evidence. It answers at once with what the Playbook can support, possibly
 * none.
 */
export const proposePlaysRequestSchema = z.strictObject({
  intent: playIntentSchema,
  count: z.number().int().min(1).max(MAX_PROPOSED_PLAYS).default(3),
})

/** The answer to a proposal request: the new `proposed` Plays, at most 5. */
export const proposePlaysResponseSchema = z.strictObject({
  plays: z.array(playSchema).max(MAX_PROPOSED_PLAYS),
})

/** The body that accepts a proposed Play; `acknowledgeNoEvidence` must be true to accept one with no evidence. */
export const acceptPlayRequestSchema = z.strictObject({
  acknowledgeNoEvidence: z.boolean().default(false),
})

/** The body that accepts a proposed Play. */
export type AcceptPlayRequest = z.input<typeof acceptPlayRequestSchema>
