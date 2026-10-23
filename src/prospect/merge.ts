import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { prospectIdSchema, prospectMergeIdSchema, userIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { prospectFieldNameSchema, prospectIdentityKindSchema } from './values'

/** How many days after a merge it can be undone (spec M2, story 13). */
export const PROSPECT_MERGE_UNDO_DAYS = 30

/** The most Prospects one merge folds into the survivor. */
export const MAX_MERGED_PROSPECTS = 5

/** The path parameters of a request about one merge. */
export const prospectMergeParamsSchema = z.strictObject({ mergeId: prospectMergeIdSchema })

/** The path parameters of a request about one merge. */
export type ProspectMergeParams = z.infer<typeof prospectMergeParamsSchema>

/**
 * The body of a request to merge Prospects into the survivor named in the path (`prospectId`).
 * `fieldChoices` says, per field, which of the merging Prospects' value to keep, by Prospect id
 * (the survivor's or one of `mergedProspectIds`); a field not named keeps the value that ADR 0020
 * would choose across all the records. Every merged Prospect's history is kept, with the
 * survivor's. Owner and Admin only. A Prospect that is not visible, or already merged, is
 * `prospect.merge_conflict` or `prospect.not_found`. Accepts an `Idempotency-Key` header.
 */
export const mergeProspectsRequestSchema = z.strictObject({
  mergedProspectIds: z
    .array(prospectIdSchema)
    .min(1)
    .max(MAX_MERGED_PROSPECTS)
    .refine((ids) => new Set(ids).size === ids.length, 'No duplicate ids'),
  fieldChoices: z.partialRecord(prospectFieldNameSchema, prospectIdSchema).default({}),
})

/** The body of a request to merge Prospects. */
export type MergeProspectsRequest = z.infer<typeof mergeProspectsRequestSchema>

/** The states of a merge: `merged`, or `undone` once reversed. */
export const PROSPECT_MERGE_STATES = ['merged', 'undone'] as const

/**
 * A merge record. Undo is possible while `state` is `merged` and now is before `undoableUntil`
 * (thirty days after `createdAt`); later it is `prospect.merge_conflict`. `undoneAt` is set exactly
 * when the state is `undone`. The snapshot that restores both records stays in core and is not returned.
 */
export const prospectMergeSchema = z
  .object({
    id: prospectMergeIdSchema,
    survivorProspectId: prospectIdSchema,
    mergedProspectIds: z.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS),
    fieldChoices: z.partialRecord(prospectFieldNameSchema, prospectIdSchema),
    state: z.enum(PROSPECT_MERGE_STATES),
    mergedByUserId: userIdSchema,
    createdAt: timestampSchema,
    undoableUntil: timestampSchema,
    undoneAt: timestampSchema.nullable(),
  })
  .refine((merge) => (merge.state === 'undone') === (merge.undoneAt !== null), {
    path: ['undoneAt'],
    message: 'undoneAt is set exactly when the state is undone',
  })

/** A merge record. */
export type ProspectMerge = z.infer<typeof prospectMergeSchema>

/**
 * The query parameters of a request to list suspected duplicates: a page and optionally the
 * `prospectId` whose duplicates to list. Matching runs on the indexed normalised identities.
 */
export const listProspectDuplicatesQuerySchema = pageQuerySchema
  .extend({ prospectId: prospectIdSchema.optional() })
  .strict()

/** The query parameters of a request to list suspected duplicates. */
export type ListProspectDuplicatesQuery = z.infer<typeof listProspectDuplicatesQuerySchema>

/** One suspected duplicate: two Prospects (in id order) and the identity kinds they share. */
export const prospectDuplicateSchema = z.object({
  prospectIds: z.tuple([prospectIdSchema, prospectIdSchema]),
  matchedOn: z.array(prospectIdentityKindSchema).min(1).max(3),
})

/** One suspected duplicate. */
export type ProspectDuplicate = z.infer<typeof prospectDuplicateSchema>

/** One page of suspected duplicates. */
export const listProspectDuplicatesResponseSchema = pageSchema(prospectDuplicateSchema)

/** One page of suspected duplicates. */
export type ListProspectDuplicatesResponse = z.infer<typeof listProspectDuplicatesResponseSchema>

/** The position in the suspected-duplicate list. */
export const prospectDuplicateCursorSchema = z.strictObject({
  first: prospectIdSchema,
  second: prospectIdSchema,
})

/** The position in the suspected-duplicate list. */
export type ProspectDuplicateCursor = z.infer<typeof prospectDuplicateCursorSchema>
