import { z } from 'zod'
import { CONSENT_CHANNELS } from '../consent/values'
import { agentInstructionVersionIdSchema } from '../ids'
import type { ServiceAudience } from '../inbound-route'
import {
  agentChannelSchema,
  agentSendWindowSchema,
  controlLevelSchema,
  escalationRulesSchema,
} from './control'
import { type AgentKind, agentKindSchema, instructionVersionSchema } from './instruction'

/** The Agent kind a service runs, by the audience of its token: voice runs the Inbound Agent, outbound the Outbound Agent. */
export function runtimeAgentKind(audience: ServiceAudience): AgentKind {
  return audience === 'voice' ? 'inbound' : 'outbound'
}

/**
 * The controls of one channel as a running Agent reads them (`channel` is `null` for the kind's
 * default, which a channel without its own controls uses). Strict; it carries no audit fields, and
 * no field for Contact Consent, the AI and recording disclosure or suppression (ADR 0003).
 */
export const agentRuntimeControlSchema = z.strictObject({
  channel: agentChannelSchema.nullable(),
  level: controlLevelSchema,
  sendWindow: agentSendWindowSchema,
  escalationRules: escalationRulesSchema,
})

/** The controls of one channel as a running Agent reads them. */
export type AgentRuntimeControl = z.infer<typeof agentRuntimeControlSchema>

/**
 * What a service needs to run an Agent for one Organization: the published instruction version, its
 * text, the controls (the kind's default and its per-channel overrides, at most one each) and whether
 * every Agent of the Organization is paused. Strict. A service falls back to the default controls for
 * a channel with none of its own, and to nothing (no conversation) when `paused` is true.
 */
export const agentRuntimeConfigSchema = z.strictObject({
  agentKind: agentKindSchema,
  paused: z.boolean(),
  instructionVersionId: agentInstructionVersionIdSchema,
  instructions: instructionVersionSchema.shape.text,
  controls: z
    .array(agentRuntimeControlSchema)
    .max(CONSENT_CHANNELS.length + 1)
    .refine((controls) => new Set(controls.map((c) => c.channel)).size === controls.length, {
      message: 'Each channel appears once',
    }),
})

/** What a service needs to run an Agent for one Organization. */
export type AgentRuntimeConfig = z.infer<typeof agentRuntimeConfigSchema>
