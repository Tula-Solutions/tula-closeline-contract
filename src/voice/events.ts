import { z } from 'zod'
import { agentKindSchema } from '../agent/instruction'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import { callIdSchema, lineIdSchema, membershipIdSchema, prospectIdSchema } from '../ids'
import { citationRefSchema, MAX_CITATION_REFS } from '../playbook/citation'
import { dealIdSchema } from '../playbook/deal-values'
import { MAX_CALL_DURATION_SECONDS } from './call'
import { phoneHashSchema, voiceCallDirectionSchema, voiceCallFailureReasonSchema } from './values'

/** The longest storage key of a Recording, in characters. */
export const MAX_RECORDING_KEY_LENGTH = 512

/** The key of a Recording in the Region's storage: opaque, made of ids, never a number or a name. */
export const recordingKeySchema = z
  .string()
  .min(1)
  .max(MAX_RECORDING_KEY_LENGTH)
  .regex(/^[A-Za-z0-9][A-Za-z0-9/_.-]*$/)

/**
 * `voice.call.started` (version 1): a Call began to ring. Ids, the direction and a keyed hash of the
 * Prospect's number: no number in clear, no name, no Transcript text.
 */
export const voiceCallStartedEvent = defineEvent(
  'voice.call.started',
  1,
  z.strictObject({
    callId: callIdSchema,
    direction: voiceCallDirectionSchema,
    lineId: lineIdSchema,
    repMembershipId: membershipIdSchema.nullable(),
    prospectId: prospectIdSchema.nullable(),
    prospectPhoneHash: phoneHashSchema,
    startedAt: timestampSchema,
  })
)

/** How a Call ended, as the event says it. */
export const VOICE_CALL_OUTCOMES = ['completed', 'failed', 'missed'] as const

/** How a Call ended. */
export const voiceCallOutcomeSchema = z.enum(VOICE_CALL_OUTCOMES)

/**
 * `voice.call.ended` (version 1): a Call reached a final state. Carries the Call id, the Rep, the
 * Prospect's phone hash, the direction, the times, the Recording key (null when there is none) and
 * the Deal identifier when the Rep has set one. The Playbook fetches the Recording from voice by
 * the Call id (ADR 0013), never by the key. No number in clear, no Transcript text.
 */
export const voiceCallEndedEvent = defineEvent(
  'voice.call.ended',
  1,
  z
    .strictObject({
      callId: callIdSchema,
      direction: voiceCallDirectionSchema,
      lineId: lineIdSchema,
      repMembershipId: membershipIdSchema.nullable(),
      prospectId: prospectIdSchema.nullable(),
      prospectPhoneHash: phoneHashSchema,
      outcome: voiceCallOutcomeSchema,
      failureReason: voiceCallFailureReasonSchema.nullable(),
      startedAt: timestampSchema,
      answeredAt: timestampSchema.nullable(),
      endedAt: timestampSchema,
      durationSeconds: z.number().int().min(0).max(MAX_CALL_DURATION_SECONDS).nullable(),
      disclosureWordingVersion: z.number().int().min(1).nullable(),
      recordingKey: recordingKeySchema.nullable(),
      dealId: dealIdSchema.nullable(),
    })
    .superRefine((data, ctx) => {
      const issue = (path: string, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message })
      if ((data.outcome === 'failed') !== (data.failureReason !== null)) {
        issue('failureReason', 'Only a failed Call has a failure reason')
      }
      if ((data.outcome === 'completed') !== (data.durationSeconds !== null)) {
        issue('durationSeconds', 'Only a completed Call has a duration')
      }
      if (data.failureReason === 'disclosure_failed' && data.disclosureWordingVersion !== null) {
        issue('failureReason', 'A Call whose Disclosure played did not fail on it')
      }
      if (data.outcome === 'completed' && data.disclosureWordingVersion === null) {
        issue('disclosureWordingVersion', 'A completed Call played its Disclosure')
      }
      if (data.recordingKey !== null && data.disclosureWordingVersion === null) {
        issue('recordingKey', 'A Recording exists only after the Disclosure')
      }
      if (data.outcome !== 'completed' && data.dealId !== null) {
        issue('dealId', 'Only a completed Call has a Deal identifier')
      }
    })
)

/**
 * `call.turn_completed` (version 1): an Agent finished one turn of a Call. Core judges it afterwards
 * (an Assessment). Ids, the Agent kind, the instruction version and the Playbook sources the turn
 * cited: no Transcript text.
 */
export const callTurnCompletedEvent = defineEvent(
  'call.turn_completed',
  1,
  z.strictObject({
    callId: callIdSchema,
    turnIndex: z.number().int().min(0).max(100_000),
    agentKind: agentKindSchema,
    instructionVersion: z.number().int().min(1).nullable(),
    prospectId: prospectIdSchema.nullable(),
    citedSources: z.array(citationRefSchema).max(MAX_CITATION_REFS),
    completedAt: timestampSchema,
  })
)

/** Every voice event, by type. */
export const VOICE_EVENTS = {
  'voice.call.started': voiceCallStartedEvent,
  'voice.call.ended': voiceCallEndedEvent,
  'call.turn_completed': callTurnCompletedEvent,
} as const

/** The type of a voice event. */
export type VoiceEventType = keyof typeof VOICE_EVENTS
