import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import {
  campaignIdSchema,
  enrollmentIdSchema,
  membershipIdSchema,
  prospectIdSchema,
  sendIdSchema,
} from '../ids'
import { MAX_SEQUENCE_STEP } from '../mail/send'
import { enrollmentStopReasonSchema } from './enrollment'
import { stepKeySchema } from './values'
import { promotionSourceSchema } from './variant'

/** `campaign.launched` (version 1): a Campaign started running at a Sequence version, by a person. Ids and values only. */
export const campaignLaunchedEvent = defineEvent(
  'campaign.launched',
  1,
  z.strictObject({
    campaignId: campaignIdSchema,
    launchedByMembershipId: membershipIdSchema,
    sequenceVersion: z.number().int().min(1).max(1_000_000),
    launchedAt: timestampSchema,
  })
)

/** `enrollment.stopped` (version 1): an Enrollment stopped, with the closed reason. Ids and values only. */
export const enrollmentStoppedEvent = defineEvent(
  'enrollment.stopped',
  1,
  z.strictObject({
    campaignId: campaignIdSchema,
    enrollmentId: enrollmentIdSchema,
    prospectId: prospectIdSchema,
    stopReason: enrollmentStopReasonSchema,
    stoppedAt: timestampSchema,
  })
)

/**
 * `step.sent` (version 1): an email Step was sent for an Enrollment. `step` is the Step's
 * position, the number in the send key. `variantKey` is null when the Step has no test. No
 * subject, body or address.
 */
export const stepSentEvent = defineEvent(
  'step.sent',
  1,
  z.strictObject({
    campaignId: campaignIdSchema,
    enrollmentId: enrollmentIdSchema,
    prospectId: prospectIdSchema,
    sendId: sendIdSchema,
    stepKey: stepKeySchema,
    step: z.number().int().min(0).max(MAX_SEQUENCE_STEP),
    variantKey: stepKeySchema.nullable(),
    sentAt: timestampSchema,
  })
)

/**
 * `variant.promoted` (version 1): a Variant became a Step's winner, by a person (`manual`, with
 * who) or by the engine (`auto`, with no one). Ids and values only.
 */
export const variantPromotedEvent = defineEvent(
  'variant.promoted',
  1,
  z.strictObject({
    campaignId: campaignIdSchema,
    stepKey: stepKeySchema,
    variantKey: stepKeySchema,
    mode: promotionSourceSchema,
    promotedByMembershipId: membershipIdSchema.nullable(),
    promotedAt: timestampSchema,
  })
)

/** The events the campaign area publishes, by type. */
export const CAMPAIGN_EVENTS = {
  'campaign.launched': campaignLaunchedEvent,
  'enrollment.stopped': enrollmentStoppedEvent,
  'step.sent': stepSentEvent,
  'variant.promoted': variantPromotedEvent,
} as const

/** The type of a campaign event. */
export type CampaignEventType = keyof typeof CAMPAIGN_EVENTS
