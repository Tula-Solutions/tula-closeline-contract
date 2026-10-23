import { z } from 'zod'
import { consentChannelSchema } from '../consent/values'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import {
  callIdSchema,
  chatIdSchema,
  handoffIdSchema,
  inquiryIdSchema,
  membershipIdSchema,
  prospectIdSchema,
} from '../ids'
import { voiceCallFailureReasonSchema } from '../voice/values'
import { handoffChannelSchema, handoffResultSchema } from './handoff'
import { MAX_AGENT_CALL_SECONDS } from './values'

/** How an Inbound Agent Call ended. */
export const AGENT_CALL_OUTCOMES = [
  'completed',
  'booked',
  'handed_off',
  'prospect_stopped',
  'failed',
] as const

/** How an Inbound Agent Call ended. */
export const agentCallOutcomeSchema = z.enum(AGENT_CALL_OUTCOMES)

/**
 * `voice.agent_call.ended` (version 1): an Inbound Agent Call is over. Ids, times and the outcome:
 * no transcript, number, name or Qualification answer. A Call that was not `failed` carries the
 * version of the Disclosure wording that was played; only a `failed` Call may have none.
 */
export const voiceAgentCallEndedEvent = defineEvent(
  'voice.agent_call.ended',
  1,
  z
    .strictObject({
      callId: callIdSchema,
      inquiryId: inquiryIdSchema.nullable(),
      prospectId: prospectIdSchema.nullable(),
      outcome: agentCallOutcomeSchema,
      failureReason: voiceCallFailureReasonSchema.nullable(),
      startedAt: timestampSchema,
      endedAt: timestampSchema,
      durationSeconds: z.number().int().min(0).max(MAX_AGENT_CALL_SECONDS),
      disclosureWordingVersion: z.number().int().min(1).nullable(),
    })
    .superRefine((d, ctx) => {
      if ((d.outcome === 'failed') !== (d.failureReason !== null)) {
        ctx.addIssue({
          code: 'custom',
          path: ['failureReason'],
          message: 'Only a failed Call has a failure reason',
        })
      }
      if (d.outcome !== 'failed' && d.disclosureWordingVersion === null) {
        ctx.addIssue({
          code: 'custom',
          path: ['disclosureWordingVersion'],
          message: 'A Call that connected played the Disclosure',
        })
      }
    })
)

/**
 * `voice.handoff.completed` (version 1): a Handoff is over. Ids, times, the channel and how it
 * ended: no summary, transcript or Qualification answer.
 */
export const voiceHandoffCompletedEvent = defineEvent(
  'voice.handoff.completed',
  1,
  z.strictObject({
    handoffId: handoffIdSchema,
    channel: handoffChannelSchema,
    callId: callIdSchema.nullable(),
    chatId: chatIdSchema.nullable(),
    inquiryId: inquiryIdSchema.nullable(),
    prospectId: prospectIdSchema,
    repMembershipId: membershipIdSchema.nullable(),
    result: handoffResultSchema,
    attempts: z.number().int().min(1).max(10),
    requestedAt: timestampSchema,
    answeredAt: timestampSchema.nullable(),
    completedAt: timestampSchema,
  })
)

/** What made a Contact Consent end during a Call or Chat. */
export const CONSENT_REVOKE_TRIGGERS = ['agent_call', 'chat', 'sms_stop'] as const

/** What made a Contact Consent end. */
export const consentRevokeTriggerSchema = z.enum(CONSENT_REVOKE_TRIGGERS)

/**
 * `voice.consent.revoked` (version 1): a Prospect withdrew Contact Consent on a Call, in a Chat or
 * by a stop reply. Core records the withdrawal; this event is the notice. Ids, the channel and the
 * time only: never the words the Prospect said.
 */
export const voiceConsentRevokedEvent = defineEvent(
  'voice.consent.revoked',
  1,
  z.strictObject({
    prospectId: prospectIdSchema,
    channel: consentChannelSchema,
    trigger: consentRevokeTriggerSchema,
    callId: callIdSchema.nullable(),
    chatId: chatIdSchema.nullable(),
    revokedAt: timestampSchema,
  })
)

/** Every Inbound Agent event, by type. */
export const AGENT_EVENTS = {
  'voice.agent_call.ended': voiceAgentCallEndedEvent,
  'voice.handoff.completed': voiceHandoffCompletedEvent,
  'voice.consent.revoked': voiceConsentRevokedEvent,
} as const

/** The type of an Inbound Agent event. */
export type AgentEventType = keyof typeof AGENT_EVENTS
