import { z } from 'zod'
import { timeZoneSchema } from '../booking/values'
import { consentChannelSchema } from '../consent/values'
import { timestampSchema } from '../core/values'
import { membershipIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { agentKindSchema } from './instruction'
import { agentWorkingDaysSchema } from './values'

/**
 * How much an Agent may do without a person's approval. A closed list. Supervised: every Draft is
 * approved. Assisted: only grounded, assessment-passing Drafts on low-risk labels go out alone.
 * Autonomous: everything goes out alone except the fixed holds (ungrounded, failed assessment,
 * first message). No level changes Contact Consent, disclosure or suppression (ADR 0003).
 */
export const CONTROL_LEVELS = ['supervised', 'assisted', 'autonomous'] as const

/** The control level of an Agent. */
export const controlLevelSchema = z.enum(CONTROL_LEVELS)

/** The control level of an Agent. */
export type ControlLevel = z.infer<typeof controlLevelSchema>

/** The level an Agent starts at, and the one used where nothing is set. */
export const DEFAULT_CONTROL_LEVEL = 'supervised' as const satisfies ControlLevel

/** The channels an Agent can act on, as the channels of Contact Consent. */
export const agentChannelSchema = consentChannelSchema

/** The `{channel}` path parameter of the controls routes: a channel, or `default` for the kind's fallback. */
export const agentControlChannelParamSchema = z.union([agentChannelSchema, z.literal('default')])

/**
 * The reasons an Agent must hand over to a person. A closed list: an Admin turns each on or off for
 * the level and channel, and cannot add a free-text rule. A Prospect asking for a person is always
 * handed over and is not on this list.
 */
export const ESCALATION_TRIGGERS = [
  'pricing_question',
  'contract_or_legal',
  'complaint',
  'competitor_mentioned',
  'senior_decision_maker',
  'negative_sentiment',
  'out_of_playbook',
] as const

/** A reason an Agent must hand over. */
export const escalationTriggerSchema = z.enum(ESCALATION_TRIGGERS)

/** A reason an Agent must hand over. */
export type EscalationTrigger = z.infer<typeof escalationTriggerSchema>

/** What an Agent does on an escalation trigger: hand the conversation to a Rep, or only notify a Manager and carry on. */
export const ESCALATION_ACTIONS = ['hand_over', 'notify_manager'] as const

/** What an Agent does on an escalation trigger. */
export const escalationActionSchema = z.enum(ESCALATION_ACTIONS)

/** One escalation rule: on this trigger, do this. */
export const escalationRuleSchema = z.strictObject({
  trigger: escalationTriggerSchema,
  action: escalationActionSchema,
})

/** One escalation rule. */
export type EscalationRule = z.infer<typeof escalationRuleSchema>

/** The escalation rules of one set of controls: each trigger at most once. */
export const escalationRulesSchema = z
  .array(escalationRuleSchema)
  .max(ESCALATION_TRIGGERS.length)
  .refine((rules) => new Set(rules.map((r) => r.trigger)).size === rules.length, {
    message: 'Each trigger appears once',
  })

/**
 * When an Agent may write or call, in the Prospect's local time unless `timeZone` says otherwise:
 * windows by weekday. It can only narrow the fixed calling window and the quiet hours (those are
 * not settings). A day that is absent has no window, so nothing goes out that day.
 */
export const agentSendWindowSchema = z.strictObject({
  timeZone: timeZoneSchema,
  days: agentWorkingDaysSchema,
})

/** When an Agent may write or call. */
export type AgentSendWindow = z.infer<typeof agentSendWindowSchema>

/**
 * The controls of one Agent kind on one channel (`channel` is `null` for the kind's default, which
 * a channel without its own settings uses). A set replaces the whole value, so a repeat is safe.
 * There is deliberately no field for Contact Consent, the AI and recording disclosure or
 * suppression: they are not settings (ADR 0003), and an unknown field is refused.
 */
export const setAgentControlRequestSchema = z.strictObject({
  level: controlLevelSchema,
  sendWindow: agentSendWindowSchema,
  escalationRules: escalationRulesSchema,
})

/** The body of a request to set the controls of an Agent kind on a channel. */
export type SetAgentControlRequest = z.infer<typeof setAgentControlRequestSchema>

/** The controls of one Agent kind on one channel, as stored; unknown fields are dropped. */
export const agentControlSchema = z.object({
  agentKind: agentKindSchema,
  channel: agentChannelSchema.nullable(),
  level: controlLevelSchema,
  sendWindow: agentSendWindowSchema,
  escalationRules: z
    .array(z.object({ trigger: escalationTriggerSchema, action: escalationActionSchema }))
    .max(ESCALATION_TRIGGERS.length),
  updatedAt: timestampSchema,
  updatedByMembershipId: membershipIdSchema.nullable(),
})

/** The controls of one Agent kind on one channel. */
export type AgentControl = z.infer<typeof agentControlSchema>

/** The query of a controls list: cursor, limit (at most 100) and optionally one Agent kind. */
export const listAgentControlsQuerySchema = pageQuerySchema.extend({
  agentKind: agentKindSchema.optional(),
})

/** One page of controls: the default of each Agent kind and its channel overrides. */
export const listAgentControlsResponseSchema = pageSchema(agentControlSchema)

/** The body of a request to pause or resume every Agent of the Organization. Strict. */
export const setAgentsPausedRequestSchema = z.strictObject({ paused: z.boolean() })

/** Whether every Agent of the Organization is paused, and who last changed it. */
export const agentsPausedSchema = z.object({
  paused: z.boolean(),
  updatedAt: timestampSchema.nullable(),
  updatedByMembershipId: membershipIdSchema.nullable(),
})

/** Whether every Agent of the Organization is paused. */
export type AgentsPaused = z.infer<typeof agentsPausedSchema>
