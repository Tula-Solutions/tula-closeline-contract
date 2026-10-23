import { z } from 'zod'
import { stepKeySchema } from '../campaign/values'
import { prospectIdSchema } from '../ids'
import { outreachDraftSchema } from './draft'
import { researchBriefSchema } from './research'
import { MAX_PREVIEW_PROSPECTS } from './values'

/** Why a preview row has no Draft: a closed list of the `area.reason` codes that can stop one Prospect. */
export const PREVIEW_FAILURE_CODES = [
  'draft.no_prospect_data',
  'draft.model_unavailable',
  'draft.budget_exceeded',
  'research.timeout',
] as const

/** Why a preview row has no Draft. */
export const previewFailureCodeSchema = z.enum(PREVIEW_FAILURE_CODES)

/**
 * The body to preview a Campaign's Sequence at a version: one to five Prospects, unique, and the
 * Step to show (the first email Step when left out). More than five is `preview.too_many_prospects`.
 */
export const previewRequestSchema = z.strictObject({
  sequenceVersion: z.number().int().min(1).max(1_000_000),
  stepKey: stepKeySchema.optional(),
  prospectIds: z
    .array(prospectIdSchema)
    .min(1)
    .max(MAX_PREVIEW_PROSPECTS)
    .refine((ids) => new Set(ids).size === ids.length, 'Each Prospect once'),
})

/** The body to preview a Campaign's Sequence. */
export type PreviewRequest = z.infer<typeof previewRequestSchema>

/** One Prospect's preview: the Research Brief and Draft, or the `failureCode` that stopped it. Nothing is sent. */
export const previewItemSchema = z
  .strictObject({
    prospectId: prospectIdSchema,
    brief: researchBriefSchema.nullable(),
    draft: outreachDraftSchema.nullable(),
    failureCode: previewFailureCodeSchema.nullable(),
  })
  .refine((item) => (item.draft === null) === (item.failureCode !== null), 'A Draft or a failure')

/** One Prospect's preview. */
export type PreviewItem = z.infer<typeof previewItemSchema>

/** The result of a preview: one item per Prospect, in request order, and the Sequence version shown. */
export const previewResultSchema = z.strictObject({
  sequenceVersion: z.number().int().min(1).max(1_000_000),
  stepKey: stepKeySchema,
  items: z.array(previewItemSchema).min(1).max(MAX_PREVIEW_PROSPECTS),
})

/** The result of a preview. */
export type PreviewResult = z.infer<typeof previewResultSchema>

/** The body to accept a preview, so the Campaign counts as previewed at that Sequence version. */
export const acceptPreviewRequestSchema = z.strictObject({
  sequenceVersion: z.number().int().min(1).max(1_000_000),
})

/** The body to accept a preview. */
export type AcceptPreviewRequest = z.infer<typeof acceptPreviewRequestSchema>
