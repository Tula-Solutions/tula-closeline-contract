import { z } from 'zod'
import { MAX_AGENT_CALL_SECONDS } from '../agent/values'
import { stepKeySchema } from '../campaign/values'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import { agentCallIdSchema, callIdSchema, enrollmentIdSchema, prospectIdSchema } from '../ids'
import {
  agentCallSourceSchema,
  callEndReasonSchema,
  callGateCodeSchema,
  callResultSchema,
  MAX_CALL_ATTEMPTS,
} from './values'

/**
 * `voice.agent_call.ended` (version 2): an outbound Agent Call has its final result. Version 1 is
 * the Inbound Agent's and is unchanged. Ids and closed values only: no number, words or Transcript.
 * `callId` is null for a `blocked` result (never dialed) and `durationSeconds` is null without a
 * Call. An `answered` result has an end reason and the Disclosure wording version that played; a
 * `blocked` one has the gate code. `outbound` records it on the Enrollment, branches and retries.
 */
export const voiceAgentCallEndedV2Event = defineEvent(
  'voice.agent_call.ended',
  2,
  z
    .strictObject({
      agentCallId: agentCallIdSchema,
      callId: callIdSchema.nullable(),
      source: agentCallSourceSchema,
      enrollmentId: enrollmentIdSchema.nullable(),
      stepKey: stepKeySchema.nullable(),
      prospectId: prospectIdSchema,
      attempt: z.number().int().min(1).max(MAX_CALL_ATTEMPTS),
      result: callResultSchema,
      endReason: callEndReasonSchema.nullable(),
      gateCode: callGateCodeSchema.nullable(),
      durationSeconds: z.number().int().min(0).max(MAX_AGENT_CALL_SECONDS).nullable(),
      disclosureWordingVersion: z.number().int().min(1).nullable(),
      endedAt: timestampSchema,
    })
    .superRefine((d, ctx) => {
      const issue = (path: string, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message })
      if ((d.result === 'answered') !== (d.endReason !== null)) {
        issue('endReason', 'Exactly an answered Call has an end reason')
      }
      if ((d.result === 'blocked') !== (d.gateCode !== null)) {
        issue('gateCode', 'Exactly a blocked Call has a gate code')
      }
      if (d.result === 'blocked' && d.callId !== null) {
        issue('callId', 'A blocked request was never dialed, so it has no Call')
      }
      if (d.result !== 'blocked' && d.callId === null) {
        issue('callId', 'A dialed request has its Call')
      }
      if (d.result === 'answered' && d.disclosureWordingVersion === null) {
        issue('disclosureWordingVersion', 'An answered Call played the Disclosure')
      }
      if (d.result === 'blocked' && d.disclosureWordingVersion !== null) {
        issue('disclosureWordingVersion', 'A blocked request played nothing')
      }
      if (d.durationSeconds !== null && d.callId === null) {
        issue('durationSeconds', 'Only a dialed Call has a duration')
      }
    })
)

/** The `agent_call` events, by type. `voice.agent_call.ended` is here at version 2; version 1 stays in `AGENT_EVENTS`. */
export const AGENT_CALL_EVENTS = {
  'voice.agent_call.ended': voiceAgentCallEndedV2Event,
} as const

/** The type of an `agent_call` event. */
export type AgentCallEventType = keyof typeof AGENT_CALL_EVENTS
