import { z } from 'zod'
import { stepKeySchema } from '../campaign/values'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import { campaignIdSchema, draftIdSchema, prospectIdSchema } from '../ids'
import { draftChannelSchema } from './values'

/** `draft.created` (version 1): a Draft was written for a Prospect. Ids and values only; never the subject or body. */
export const draftCreatedEvent = defineEvent(
  'draft.created',
  1,
  z.strictObject({
    draftId: draftIdSchema,
    prospectId: prospectIdSchema,
    campaignId: campaignIdSchema.nullable(),
    stepKey: stepKeySchema.nullable(),
    channel: draftChannelSchema,
    ungrounded: z.boolean(),
    checksPassed: z.boolean(),
    voiceVersion: z.number().int().min(1).max(1_000_000),
    createdAt: timestampSchema,
  })
)

/** Why a Draft needs a person's approval before it goes. */
export const APPROVAL_REASONS = ['ungrounded', 'check_failed', 'review_mode'] as const

/** `draft.approved_required` (version 1): a Draft cannot go without a person's approval, for the closed reasons given. Ids and values only. */
export const draftApprovalRequiredEvent = defineEvent(
  'draft.approved_required',
  1,
  z.strictObject({
    draftId: draftIdSchema,
    prospectId: prospectIdSchema,
    campaignId: campaignIdSchema.nullable(),
    reasons: z.array(z.enum(APPROVAL_REASONS)).min(1).max(APPROVAL_REASONS.length),
    requiredAt: timestampSchema,
  })
)

/** The events the messaging area publishes, by type. */
export const MESSAGING_EVENTS = {
  'draft.created': draftCreatedEvent,
  'draft.approved_required': draftApprovalRequiredEvent,
} as const

/** The type of a messaging event. */
export type MessagingEventType = keyof typeof MESSAGING_EVENTS
