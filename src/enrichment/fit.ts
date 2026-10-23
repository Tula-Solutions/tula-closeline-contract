import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { fitCriterionIdSchema, prospectIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  enrichmentTextSchema,
  MAX_CRITERION_NAME_LENGTH,
  MAX_CRITERION_VALUE_LENGTH,
  MAX_CRITERION_VALUES,
  MAX_CRITERION_WEIGHT,
  MAX_FIT_CRITERIA,
} from './values'

/** The Prospect or company attributes a fit criterion can look at: title, industry, size, region and technology. */
export const FIT_FIELDS = [
  'jobTitle',
  'industry',
  'employeeCount',
  'region',
  'technologies',
] as const

/** An attribute a fit criterion looks at. */
export const fitFieldSchema = z.enum(FIT_FIELDS)

/** An attribute a fit criterion looks at. */
export type FitField = z.infer<typeof fitFieldSchema>

const valuesSchema = z
  .array(enrichmentTextSchema(MAX_CRITERION_VALUE_LENGTH))
  .min(1)
  .max(MAX_CRITERION_VALUES)

const bound = z.number().int().min(0).max(100_000_000)

/**
 * What a criterion asks of the attribute: `one_of` (equals one of the values, ignoring case),
 * `contains_any` (contains one of the values, ignoring case) or `between` (a whole number, at
 * least `min` and at most `max`; one of the two may be left out). `between` is for
 * `employeeCount` only and `employeeCount` takes nothing else.
 */
function conditionOf(strict: boolean) {
  const make = <T extends z.core.$ZodLooseShape>(shape: T) =>
    strict ? z.strictObject(shape) : z.object(shape)
  return z.discriminatedUnion('operator', [
    make({ operator: z.literal('one_of'), values: valuesSchema }),
    make({ operator: z.literal('contains_any'), values: valuesSchema }),
    make({
      operator: z.literal('between'),
      min: bound.nullable(),
      max: bound.nullable(),
    })
      .refine((condition) => condition.min !== null || condition.max !== null, 'Give min or max')
      .refine(
        (condition) =>
          condition.min === null || condition.max === null || condition.min <= condition.max,
        'min is not above max'
      ),
  ])
}

export const fitConditionSchema = conditionOf(false)

const fitConditionRequestSchema = conditionOf(true)

export type FitCondition = z.infer<typeof fitConditionSchema>

/** Whether an operator suits an attribute: `between` only for `employeeCount`, and `employeeCount` only with `between`. */
export function fitConditionSuitsField(field: FitField, condition: FitCondition): boolean {
  return (field === 'employeeCount') === (condition.operator === 'between')
}

const WEIGHT = z.number().int().min(1).max(MAX_CRITERION_WEIGHT)

/** One named, weighted part of an Organization's ideal customer. A matched criterion adds its weight to the fit score. */
export const fitCriterionSchema = z.object({
  id: fitCriterionIdSchema,
  name: enrichmentTextSchema(MAX_CRITERION_NAME_LENGTH),
  field: fitFieldSchema,
  condition: fitConditionSchema,
  weight: WEIGHT,
  enabled: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

/** One fit criterion. */
export type FitCriterion = z.infer<typeof fitCriterionSchema>

/** The body to add a criterion; at most 50 per Organization and names are unique. An operator that does not suit the attribute is `fit.invalid_criteria`. */
export const createFitCriterionRequestSchema = z.strictObject({
  name: enrichmentTextSchema(MAX_CRITERION_NAME_LENGTH),
  field: fitFieldSchema,
  condition: fitConditionRequestSchema,
  weight: WEIGHT,
  enabled: z.boolean().default(true),
})

/** The body to add a criterion. */
export type CreateFitCriterionRequest = z.infer<typeof createFitCriterionRequestSchema>

/** The body to change a criterion: any of its parts, at least one. */
export const updateFitCriterionRequestSchema = z
  .strictObject({
    name: enrichmentTextSchema(MAX_CRITERION_NAME_LENGTH).optional(),
    field: fitFieldSchema.optional(),
    condition: fitConditionRequestSchema.optional(),
    weight: WEIGHT.optional(),
    enabled: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'Change at least one part')

/** The body to change a criterion. */
export type UpdateFitCriterionRequest = z.infer<typeof updateFitCriterionRequestSchema>

/** The query of a criteria list: cursor and limit (at most 100). */
export const listFitCriteriaQuerySchema = pageQuerySchema

/** One page of criteria (oldest first, by `createdAt`, then id) with the version of the whole set, which rises on every change. */
export const listFitCriteriaResponseSchema = pageSchema(fitCriterionSchema).extend({
  criteriaVersion: z.number().int().min(0).max(1_000_000),
})

/** Whether a criterion matched: `unknown` when the Prospect has no value for its attribute (it adds nothing, and is not a miss). */
export const FIT_RESULTS = ['matched', 'missed', 'unknown'] as const

/** Whether a criterion matched. */
export const fitResultSchema = z.enum(FIT_RESULTS)

/** One criterion's part in a score. */
export const fitMatchSchema = z.object({
  criterionId: fitCriterionIdSchema,
  name: enrichmentTextSchema(MAX_CRITERION_NAME_LENGTH),
  weight: WEIGHT,
  result: fitResultSchema,
})

/** One criterion's part in a score. */
export type FitMatch = z.infer<typeof fitMatchSchema>

/**
 * A Prospect's fit score: the sum of the weights of the matched criteria (`score`) out of the sum
 * of all enabled criteria (`maxScore`), and every criterion with its result, so the score explains
 * itself. `criteriaVersion` is the version of the criteria it was scored with.
 */
export const fitScoreSchema = z
  .object({
    prospectId: prospectIdSchema,
    score: z
      .number()
      .int()
      .min(0)
      .max(MAX_FIT_CRITERIA * MAX_CRITERION_WEIGHT),
    maxScore: z
      .number()
      .int()
      .min(0)
      .max(MAX_FIT_CRITERIA * MAX_CRITERION_WEIGHT),
    matches: z.array(fitMatchSchema).max(MAX_FIT_CRITERIA),
    criteriaVersion: z.number().int().min(0).max(1_000_000),
    scoredAt: timestampSchema,
  })
  .refine((fit) => fit.score <= fit.maxScore, 'The score is not above the maximum')

/** A Prospect's fit score. */
export type FitScore = z.infer<typeof fitScoreSchema>

/** The query of a score list: cursor, limit (at most 100) and an optional lowest score. */
export const listFitScoresQuerySchema = pageQuerySchema.extend({
  minScore: z
    .union([z.number(), z.string().regex(/^\d{1,5}$/)])
    .transform((value) => Number(value))
    .pipe(
      z
        .number()
        .int()
        .min(0)
        .max(MAX_FIT_CRITERIA * MAX_CRITERION_WEIGHT)
    )
    .optional(),
})

/** One page of scores for the Prospects the caller may see, highest first (by `score`, then Prospect id). */
export const listFitScoresResponseSchema = pageSchema(fitScoreSchema)
