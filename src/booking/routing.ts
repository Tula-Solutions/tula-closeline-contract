import { z } from 'zod'
import { timestampSchema } from '../core/values'
import {
  bookingTypeIdSchema,
  membershipIdSchema,
  prospectIdSchema,
  routingDecisionIdSchema,
  routingRuleIdSchema,
  teamIdSchema,
} from '../ids'
import { pageQuerySchema } from '../pagination'
import { boundedTextSchema, sourceKindSchema } from '../prospect/values'
import { countryCodeSchema } from '../voice/values'
import { bookingNameSchema, MAX_ELIGIBLE_REPS } from './values'

/** The company size bands a Routing Rule can match, by number of employees. */
export const COMPANY_SIZE_BANDS = [
  '1-10',
  '11-50',
  '51-200',
  '201-1000',
  '1001-5000',
  '5001+',
] as const

/** A company size band. */
export const companySizeBandSchema = z.enum(COMPANY_SIZE_BANDS)

/** A company size band. */
export type CompanySizeBand = z.infer<typeof companySizeBandSchema>

/** The most Routing Rules an Organization may have. */
export const MAX_ROUTING_RULES = 200

/** The most values one condition of a Routing Rule may list. */
export const MAX_CONDITION_VALUES = 50

/** The longest region name in a condition. */
export const MAX_REGION_LENGTH = 100

const conditionList = <T extends z.ZodType>(item: T, max = MAX_CONDITION_VALUES) =>
  z
    .array(item)
    .min(1)
    .max(max)
    .refine((values) => new Set(values).size === values.length, 'No duplicate values')
    .optional()

/**
 * What a Routing Rule matches on. Every key is optional and a missing key matches anything; a
 * rule matches when every key it has matches (within one key, any value matches). A rule with no
 * key matches every Prospect, which is what the default rule is.
 */
export const routingConditionsSchema = z.strictObject({
  countries: conditionList(countryCodeSchema),
  regions: conditionList(boundedTextSchema(MAX_REGION_LENGTH)),
  companySizeBands: conditionList(companySizeBandSchema, COMPANY_SIZE_BANDS.length),
  accountOwnerMembershipIds: conditionList(membershipIdSchema),
  sources: conditionList(sourceKindSchema, 20),
  bookingTypeIds: conditionList(bookingTypeIdSchema, 20),
})

/** What a Routing Rule matches on. */
export type RoutingConditions = z.infer<typeof routingConditionsSchema>

/**
 * Who a Routing Rule picks: one Rep, a Team in round-robin, or a named pool of 2 to 20 Reps in
 * round-robin.
 */
export const routingTargetSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('rep'), membershipId: membershipIdSchema }),
  z.strictObject({ kind: z.literal('team'), teamId: teamIdSchema }),
  z.strictObject({
    kind: z.literal('pool'),
    membershipIds: z
      .array(membershipIdSchema)
      .min(2)
      .max(MAX_ELIGIBLE_REPS)
      .refine((ids) => new Set(ids).size === ids.length, 'No duplicate ids'),
  }),
])

/** Who a Routing Rule picks. */
export type RoutingTarget = z.infer<typeof routingTargetSchema>

const hasCondition = (conditions: RoutingConditions) =>
  Object.values(conditions).some((v) => v !== undefined)

const ruleFields = {
  name: bookingNameSchema,
  conditions: routingConditionsSchema,
  target: routingTargetSchema,
  isDefault: z.boolean(),
}

/** A rule marked default has no conditions, and a rule without conditions is the default one. */
const defaultMatchesNoConditions = {
  check: (rule: { isDefault: boolean; conditions: RoutingConditions }) =>
    rule.isDefault === !hasCondition(rule.conditions),
  message: 'The default rule has no conditions, and a rule with no conditions is the default',
}

/**
 * A Routing Rule: ordered by `position` (1 first; the first rule that matches wins), with
 * conditions and a target. The default rule matches when nothing else does, has no conditions and
 * is last; an Organization has at most one.
 */
export const routingRuleSchema = z
  .strictObject({
    id: routingRuleIdSchema,
    ...ruleFields,
    position: z.number().int().min(1).max(MAX_ROUTING_RULES),
    createdAt: timestampSchema,
  })
  .refine(defaultMatchesNoConditions.check, { message: defaultMatchesNoConditions.message })

/** A Routing Rule. */
export type RoutingRule = z.infer<typeof routingRuleSchema>

/** The body of a request to create a Routing Rule; it goes last, before the default rule if there is one. */
export const createRoutingRuleRequestSchema = z
  .strictObject(ruleFields)
  .refine(defaultMatchesNoConditions.check, { message: defaultMatchesNoConditions.message })

/** The body of a request to create a Routing Rule. */
export type CreateRoutingRuleRequest = z.infer<typeof createRoutingRuleRequestSchema>

/** The body of a request to replace a Routing Rule's name, conditions, target and default flag. */
export const updateRoutingRuleRequestSchema = createRoutingRuleRequestSchema

/** The path parameters of a request about one Routing Rule. */
export const routingRuleParamsSchema = z.strictObject({ ruleId: routingRuleIdSchema })

/** The body of a request to set the order of every Routing Rule: all the ids, once each, first to last. */
export const reorderRoutingRulesRequestSchema = z.strictObject({
  ruleIds: z
    .array(routingRuleIdSchema)
    .min(1)
    .max(MAX_ROUTING_RULES)
    .refine((ids) => new Set(ids).size === ids.length, 'No duplicate ids'),
})

/** The query parameters of a request to list Routing Rules, in order. */
export const listRoutingRulesQuerySchema = pageQuerySchema.strict()

/** The attributes of a Prospect that routing looks at; a missing one is null and matches no condition on it. */
export const routingAttributesSchema = z.strictObject({
  country: countryCodeSchema.nullable(),
  region: boundedTextSchema(MAX_REGION_LENGTH).nullable(),
  companySizeBand: companySizeBandSchema.nullable(),
  accountOwnerMembershipId: membershipIdSchema.nullable(),
  source: sourceKindSchema.nullable(),
})

/** The attributes of a Prospect that routing looks at. */
export type RoutingAttributes = z.infer<typeof routingAttributesSchema>

/** The body of a request to route a Prospect: core reads its attributes. `bookingTypeId` narrows rules that name Booking Types. */
export const routeRequestSchema = z.strictObject({
  prospectId: prospectIdSchema,
  bookingTypeId: bookingTypeIdSchema.optional(),
})

/** The body of a request to route a Prospect. */
export type RouteRequest = z.infer<typeof routeRequestSchema>

/** The body of a request to test the Routing Rules with a sample Prospect, nothing stored and nobody notified. */
export const testRoutingRequestSchema = z.strictObject({
  attributes: routingAttributesSchema,
  bookingTypeId: bookingTypeIdSchema.optional(),
})

/** The body of a request to test the Routing Rules. */
export type TestRoutingRequest = z.infer<typeof testRoutingRequestSchema>

/** Why a Rep is a candidate: the rule named them, they are next in the Team's or pool's round-robin, or the default rule picked them. */
export const ROUTING_CANDIDATE_REASONS = [
  'named_rep',
  'round_robin_team',
  'round_robin_pool',
  'default_rule',
] as const

/** Why a Rep is a candidate. */
export const routingCandidateReasonSchema = z.enum(ROUTING_CANDIDATE_REASONS)

/** Why a Rep was skipped: off shift, away, at the daily cap, or without a healthy calendar. */
export const ROUTING_SKIP_REASONS = [
  'off_shift',
  'on_leave',
  'daily_cap_reached',
  'calendar_not_connected',
  'needs_reconnect',
] as const

/** Why a Rep was skipped. */
export const routingSkipReasonSchema = z.enum(ROUTING_SKIP_REASONS)

/** Why a Rep was skipped. */
export type RoutingSkipReason = z.infer<typeof routingSkipReasonSchema>

/**
 * The outcome of routing: the rule that won (null when none matched and there is no default),
 * the candidates in the order to try them, each with a reason, and the Reps skipped, each with
 * why. Only ids and closed reasons: no name and no calendar content. `decisionId` is null for a
 * test, which stores nothing.
 */
export const routingResultSchema = z.strictObject({
  decisionId: routingDecisionIdSchema.nullable(),
  matchedRuleId: routingRuleIdSchema.nullable(),
  candidates: z
    .array(
      z.strictObject({ membershipId: membershipIdSchema, reason: routingCandidateReasonSchema })
    )
    .max(MAX_ELIGIBLE_REPS),
  skipped: z
    .array(z.strictObject({ membershipId: membershipIdSchema, reason: routingSkipReasonSchema }))
    .max(MAX_ELIGIBLE_REPS),
  decidedAt: timestampSchema.nullable(),
})

/** The outcome of routing. */
export type RoutingResult = z.infer<typeof routingResultSchema>
