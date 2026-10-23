import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { campaignIdSchema, membershipIdSchema } from '../ids'
import { campaignNameSchema, countSchema, stepKeySchema, stepTextSchema } from './values'

/** The fewest Variants a tested Step has. */
export const MIN_VARIANTS = 2

/** The most Variants a tested Step has. */
export const MAX_VARIANTS = 4

/** The weights of a Step's Variants add up to this. */
export const VARIANT_WEIGHT_TOTAL = 100

/** The fewest sends of every Variant before its results are anything but "not enough data". */
export const MIN_VARIANT_SAMPLE = 100

/** The largest sample an Admin may ask for before a Variant is promoted. */
export const MAX_PROMOTION_SAMPLE = 100_000

/**
 * One Variant of an email Step: its `key` (unique in the Step), a `label` for the portal, the
 * `angle` the drafter is told to take, and its `weight`, a whole percentage from 1 to 99. The
 * message text is drafted per Prospect, not stored here.
 */
export const variantSchema = z.strictObject({
  key: stepKeySchema,
  label: campaignNameSchema,
  angle: stepTextSchema,
  weight: z
    .number()
    .int()
    .min(1)
    .max(VARIANT_WEIGHT_TOTAL - 1),
})

/** One Variant of an email Step. */
export type Variant = z.infer<typeof variantSchema>

/**
 * How a winner is chosen. `manual`: only an Admin promotes one. `auto`: the engine promotes the
 * Variant whose reply rate leads every other by at least `marginPercentagePoints` once each has
 * at least `minSamplePerVariant` sends (not below `MIN_VARIANT_SAMPLE`). The change is logged and
 * published as `variant.promoted`.
 */
export const promotionPolicySchema = z.discriminatedUnion('mode', [
  z.strictObject({ mode: z.literal('manual') }),
  z.strictObject({
    mode: z.literal('auto'),
    minSamplePerVariant: z.number().int().min(MIN_VARIANT_SAMPLE).max(MAX_PROMOTION_SAMPLE),
    marginPercentagePoints: z.number().min(1).max(50),
  }),
])

/** How a winner is chosen. */
export type PromotionPolicy = z.infer<typeof promotionPolicySchema>

/**
 * The test on an email Step: two to four Variants whose weights add up to exactly 100, with
 * unique keys, and a promotion policy. Assignment is deterministic by Prospect and Step, so a
 * retry never flips a Variant.
 */
export const variantGroupSchema = z
  .strictObject({
    variants: z.array(variantSchema).min(MIN_VARIANTS).max(MAX_VARIANTS),
    promotion: promotionPolicySchema,
  })
  .superRefine((group, ctx) => {
    const total = group.variants.reduce((sum, v) => sum + v.weight, 0)
    if (total !== VARIANT_WEIGHT_TOTAL) {
      ctx.addIssue({
        code: 'custom',
        path: ['variants'],
        message: `The weights add up to ${VARIANT_WEIGHT_TOTAL}`,
      })
    }
    if (new Set(group.variants.map((v) => v.key)).size !== group.variants.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['variants'],
        message: 'A Variant key is used once',
      })
    }
  })

/** The test on an email Step. */
export type VariantGroup = z.infer<typeof variantGroupSchema>

/**
 * A rate with its 95% interval, each in [0, 1], the estimate between the bounds. Present only once
 * a Variant has the minimum sample.
 */
export const rateIntervalSchema = z
  .strictObject({
    estimate: z.number().min(0).max(1),
    lower: z.number().min(0).max(1),
    upper: z.number().min(0).max(1),
  })
  .refine(
    (r) => r.lower <= r.estimate && r.estimate <= r.upper,
    'The estimate is inside its interval'
  )

/** A rate with its 95% interval. */
export type RateInterval = z.infer<typeof rateIntervalSchema>

/**
 * The results of one Variant: sent, delivered, replied, positive reply (null until the reply
 * classification exists), bounced and unsubscribed, and the reply rate with an interval (null
 * while the Step is `not_enough_data`). There is no open or click count: nothing is tracked.
 */
export const variantResultSchema = z
  .strictObject({
    key: stepKeySchema,
    sent: countSchema,
    delivered: countSchema,
    replied: countSchema,
    positiveReplied: countSchema.nullable(),
    bounced: countSchema,
    unsubscribed: countSchema,
    replyRate: rateIntervalSchema.nullable(),
  })
  .superRefine((r, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    for (const field of ['delivered', 'replied', 'bounced', 'unsubscribed'] as const) {
      if (r[field] > r.sent) {
        issue(field, 'No count is above the number sent')
      }
    }
    if (r.positiveReplied !== null && r.positiveReplied > r.replied) {
      issue('positiveReplied', 'Positive replies are among the replies')
    }
  })

/** The results of one Variant. */
export type VariantResult = z.infer<typeof variantResultSchema>

/** Whether the Variants have enough sends to compare. */
export const VARIANT_RESULT_STATUSES = ['not_enough_data', 'measured'] as const

/** Whether the Variants have enough sends to compare. */
export const variantResultStatusSchema = z.enum(VARIANT_RESULT_STATUSES)

/** How a winner was promoted. */
export const PROMOTION_SOURCES = ['manual', 'auto'] as const

/** How a winner was promoted. */
export const promotionSourceSchema = z.enum(PROMOTION_SOURCES)

/** How a winner was promoted. */
export type PromotionSource = z.infer<typeof promotionSourceSchema>

/** The promoted Variant of a Step, how and by whom (null for an automatic promotion), and when. */
export const promotionRecordSchema = z
  .strictObject({
    variantKey: stepKeySchema,
    source: promotionSourceSchema,
    promotedByMembershipId: membershipIdSchema.nullable(),
    promotedAt: timestampSchema,
  })
  .refine((p) => (p.source === 'manual') === (p.promotedByMembershipId !== null), {
    message: 'Exactly a manual promotion names the person',
    path: ['promotedByMembershipId'],
  })

/**
 * The results of the Variants of one email Step. Below `minimumSample` sends of any Variant the
 * `status` is `not_enough_data` and no interval is given, so a winner is never called early.
 * `promotion` is set once a winner was chosen; later sends all use it.
 */
export const stepVariantResultsSchema = z
  .strictObject({
    campaignId: campaignIdSchema,
    stepKey: stepKeySchema,
    status: variantResultStatusSchema,
    minimumSample: z.number().int().min(MIN_VARIANT_SAMPLE).max(MAX_PROMOTION_SAMPLE),
    variants: z.array(variantResultSchema).min(MIN_VARIANTS).max(MAX_VARIANTS),
    promotion: promotionRecordSchema.nullable(),
    computedAt: timestampSchema,
  })
  .superRefine((r, ctx) => {
    const noData = r.status === 'not_enough_data'
    r.variants.forEach((v, i) => {
      if (noData && v.replyRate !== null) {
        ctx.addIssue({
          code: 'custom',
          path: ['variants', i, 'replyRate'],
          message: 'No interval is given while there is not enough data',
        })
      }
      if (!noData && v.replyRate === null) {
        ctx.addIssue({
          code: 'custom',
          path: ['variants', i, 'replyRate'],
          message: 'A measured Step gives every Variant an interval',
        })
      }
    })
  })

/** The results of the Variants of one email Step. */
export type StepVariantResults = z.infer<typeof stepVariantResultsSchema>

/** The path parameters of a request about the Variants of one Step. */
export const stepVariantsParamsSchema = z.strictObject({
  campaignId: campaignIdSchema,
  stepKey: stepKeySchema,
})

/** The path parameters of a request about one Variant. */
export const variantParamsSchema = z.strictObject({
  campaignId: campaignIdSchema,
  stepKey: stepKeySchema,
  variantKey: stepKeySchema,
})

/** The result of promoting a Variant: the Step's promotion record. */
export const promoteVariantResponseSchema = promotionRecordSchema
