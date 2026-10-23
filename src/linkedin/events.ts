import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import { linkedinAccountIdSchema, membershipIdSchema, prospectIdSchema } from '../ids'
import { linkedinAccountStatusSchema, linkedinPauseReasonSchema } from './values'

/** `linkedin.invitation_accepted` (version 1): a Prospect accepted a connection request, so the next step may start. Ids and times only; no profile data. */
export const linkedinInvitationAcceptedEvent = defineEvent(
  'linkedin.invitation_accepted',
  1,
  z.strictObject({
    accountId: linkedinAccountIdSchema,
    membershipId: membershipIdSchema,
    prospectId: prospectIdSchema,
    acceptedAt: timestampSchema,
  })
)

/** `linkedin.account_paused` (version 1): an account stopped sending, for the closed reason given. Ids and values only. */
export const linkedinAccountPausedEvent = defineEvent(
  'linkedin.account_paused',
  1,
  z.strictObject({
    accountId: linkedinAccountIdSchema,
    membershipId: membershipIdSchema,
    status: linkedinAccountStatusSchema,
    reason: linkedinPauseReasonSchema,
  })
)

/** Why the LinkedIn channel stopped. A closed list. */
export const LINKEDIN_CHANNEL_DISABLED_REASONS = [
  'admin_switch',
  'acceptance_revoked',
  'wording_changed',
] as const

/** `linkedin.channel_disabled` (version 1): the channel stopped for the closed reason given; `byMembershipId` is the Admin who did it, null when the wording changed. */
export const linkedinChannelDisabledEvent = defineEvent(
  'linkedin.channel_disabled',
  1,
  z.strictObject({
    reason: z.enum(LINKEDIN_CHANNEL_DISABLED_REASONS),
    byMembershipId: membershipIdSchema.nullable(),
  })
)

/** The events the LinkedIn area publishes, by type. */
export const LINKEDIN_EVENTS = {
  'linkedin.invitation_accepted': linkedinInvitationAcceptedEvent,
  'linkedin.account_paused': linkedinAccountPausedEvent,
  'linkedin.channel_disabled': linkedinChannelDisabledEvent,
} as const

/** The type of a LinkedIn event. */
export type LinkedinEventType = keyof typeof LINKEDIN_EVENTS
