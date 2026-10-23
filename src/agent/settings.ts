import { z } from 'zod'
import { workingDaySchema } from '../booking/calendar'
import { timeZoneSchema } from '../booking/values'
import { timestampSchema } from '../core/values'
import { membershipIdSchema } from '../ids'
import { boundedTextSchema } from '../prospect/values'
import {
  agentLanguageSchema,
  agentVoiceStyleSchema,
  MAX_AGENT_CALL_COST_USD_CENTS,
  MAX_AGENT_CALL_SECONDS,
  MAX_AGENT_CONCURRENCY,
  MAX_AGENT_GREETING_LENGTH,
} from './values'

const hoursSchema = z
  .array(workingDaySchema)
  .max(7)
  .refine((days) => new Set(days.map((d) => d.day)).size === days.length, {
    message: 'Each day appears once',
  })

/**
 * What an Admin may set on the Inbound Agent. There is deliberately no field for the Disclosure,
 * the Recording or Contact Consent: they are not settings (ADR 0003), and an unknown field is
 * refused. `hours` can only narrow the fixed calling window, in the Prospect's local time, and a
 * paused Agent places and answers nothing. A set replaces the whole value, so a repeat is safe.
 */
export const setAgentSettingsRequestSchema = z.strictObject({
  paused: z.boolean(),
  greeting: boundedTextSchema(MAX_AGENT_GREETING_LENGTH),
  voiceStyle: agentVoiceStyleSchema,
  timeZone: timeZoneSchema,
  hours: hoursSchema,
  maxCallSeconds: z.number().int().min(30).max(MAX_AGENT_CALL_SECONDS),
  maxCostUsdCents: z.number().int().min(1).max(MAX_AGENT_CALL_COST_USD_CENTS),
  concurrencyCap: z.number().int().min(1).max(MAX_AGENT_CONCURRENCY),
})

/** The body of a request to set the Inbound Agent settings. */
export type SetAgentSettingsRequest = z.infer<typeof setAgentSettingsRequestSchema>

/** The Inbound Agent settings as stored: what was set, the languages (fixed) and who last changed them. */
export const agentSettingsSchema = setAgentSettingsRequestSchema.extend({
  languages: z.array(agentLanguageSchema).min(1).max(1),
  updatedAt: timestampSchema,
  updatedByMembershipId: membershipIdSchema.nullable(),
})

/** The Inbound Agent settings. */
export type AgentSettings = z.infer<typeof agentSettingsSchema>
