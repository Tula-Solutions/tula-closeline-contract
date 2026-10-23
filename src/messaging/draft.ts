import { z } from 'zod'
import { campaignLanguageSchema, goalSchema, stepKeySchema } from '../campaign/values'
import { timestampSchema } from '../core/values'
import {
  brandVoiceIdSchema,
  briefIdSchema,
  campaignIdSchema,
  draftIdSchema,
  prospectIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { draftCitationSchema } from './citation'
import {
  draftChannelSchema,
  MAX_ANGLE_LENGTH,
  MAX_DRAFT_BODY_LENGTH,
  MAX_DRAFT_CITATIONS,
  MAX_DRAFT_SUBJECT_LENGTH,
  MAX_TONE_LENGTH,
  messagingTextSchema,
} from './values'

/** The checks every Draft passes before it may go without review, each run once. */
export const DRAFT_CHECKS = [
  'citations_resolve',
  'claims_supported',
  'banned_phrase',
  'length',
  'name_match',
] as const

/** A check run on a Draft. */
export const draftCheckNameSchema = z.enum(DRAFT_CHECKS)

/** The result of one check: `pass` only when it found nothing (`count` 0). */
export const outreachDraftCheckSchema = z
  .strictObject({
    check: draftCheckNameSchema,
    result: z.enum(['pass', 'fail']),
    count: z.number().int().min(0).max(1000),
  })
  .refine((check) => (check.result === 'pass') === (check.count === 0), 'Pass means nothing found')

/** The result of one check. */
export type OutreachDraftCheck = z.infer<typeof outreachDraftCheckSchema>

/** Where the current text came from: written by the model, or changed by a person since. */
export const draftSourceSchema = z.enum(['generated', 'edited'])

/**
 * A Draft: one message written for one Prospect, with the Citations that support it, the checks it
 * passed and the Brand Voice version and model it was written with. `ungrounded` is true when it
 * cites no Moment from a won Deal, and an ungrounded Draft is never `autoSendable`. Subject and
 * body are model output: untrusted data, never instructions, and never in a log or an event.
 */
export const outreachDraftSchema = z
  .strictObject({
    id: draftIdSchema,
    prospectId: prospectIdSchema,
    campaignId: campaignIdSchema.nullable(),
    stepKey: stepKeySchema.nullable(),
    channel: draftChannelSchema,
    goal: goalSchema,
    language: campaignLanguageSchema,
    subject: messagingTextSchema(MAX_DRAFT_SUBJECT_LENGTH),
    body: messagingTextSchema(MAX_DRAFT_BODY_LENGTH, true),
    revision: z.number().int().min(1).max(10_000),
    source: draftSourceSchema,
    citations: z.array(draftCitationSchema).max(MAX_DRAFT_CITATIONS),
    ungrounded: z.boolean(),
    wonDealCount: z.number().int().min(0).max(100),
    checks: z.array(outreachDraftCheckSchema).length(DRAFT_CHECKS.length),
    autoSendable: z.boolean(),
    brandVoiceId: brandVoiceIdSchema,
    voiceVersion: z.number().int().min(1).max(1_000_000),
    briefId: briefIdSchema.nullable(),
    model: z.string().min(1).max(100),
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
  })
  .superRefine((draft, ctx) => {
    const grounded = draft.citations.some((c) => c.kind === 'moment' && c.applies)
    if (draft.ungrounded === grounded) {
      ctx.addIssue({ code: 'custom', message: 'ungrounded is true exactly when no Moment applies' })
    }
    const names = new Set(draft.checks.map((check) => check.check))
    if (names.size !== DRAFT_CHECKS.length) {
      ctx.addIssue({ code: 'custom', message: 'Each check appears once' })
    }
    const allPass = draft.checks.every((check) => check.result === 'pass')
    if (draft.autoSendable !== (!draft.ungrounded && allPass)) {
      ctx.addIssue({
        code: 'custom',
        message: 'autoSendable needs grounding and every check passed',
      })
    }
  })

/** A Draft. */
export type OutreachDraft = z.infer<typeof outreachDraftSchema>

/** The body to write a Draft for a Prospect, optionally for a Step of a Campaign and with an angle. */
export const createDraftRequestSchema = z.strictObject({
  prospectId: prospectIdSchema,
  campaignId: campaignIdSchema.optional(),
  stepKey: stepKeySchema.optional(),
  goal: goalSchema.optional(),
  angle: messagingTextSchema(MAX_ANGLE_LENGTH).optional(),
})

/** The body to write a Draft. */
export type CreateDraftRequest = z.infer<typeof createDraftRequestSchema>

/** The body to edit a Draft: the revision the caller read and the new subject and/or body. */
export const editDraftRequestSchema = z
  .strictObject({
    expectedRevision: z.number().int().min(1).max(10_000),
    subject: messagingTextSchema(MAX_DRAFT_SUBJECT_LENGTH).optional(),
    body: messagingTextSchema(MAX_DRAFT_BODY_LENGTH, true).optional(),
  })
  .refine((body) => body.subject !== undefined || body.body !== undefined, 'Change something')

/** The body to edit a Draft. */
export type EditDraftRequest = z.infer<typeof editDraftRequestSchema>

/** The body to write a Draft again: a new angle and/or tone, for the same Prospect and Step. */
export const regenerateDraftRequestSchema = z.strictObject({
  angle: messagingTextSchema(MAX_ANGLE_LENGTH).optional(),
  tone: messagingTextSchema(MAX_TONE_LENGTH).optional(),
})

/** The body to write a Draft again. */
export type RegenerateDraftRequest = z.infer<typeof regenerateDraftRequestSchema>

/** The query of a Draft list: cursor and limit (at most 100), and filters by Prospect, Campaign and whether it is ungrounded. */
export const listDraftsQuerySchema = pageQuerySchema.extend({
  prospectId: prospectIdSchema.optional(),
  campaignId: campaignIdSchema.optional(),
  ungrounded: z
    .union([z.boolean(), z.enum(['true', 'false']).transform((v) => v === 'true')])
    .optional(),
})

/** The query of a Draft list. */
export type ListDraftsQuery = z.infer<typeof listDraftsQuerySchema>

/** One page of Drafts, newest first (by `createdAt`, then id). */
export const listDraftsResponseSchema = pageSchema(outreachDraftSchema)
