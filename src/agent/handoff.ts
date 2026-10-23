import { z } from 'zod'
import { timestampSchema } from '../core/values'
import {
  callIdSchema,
  chatIdSchema,
  handoffIdSchema,
  membershipIdSchema,
  prospectIdSchema,
} from '../ids'
import { qualificationSchema } from '../inquiry/qualification'
import { pageQuerySchema, pageSchema } from '../pagination'
import { agentTurnSchema } from './turn'
import { MAX_HANDOFF_CONTEXT_TURNS } from './values'

/** Where a Handoff happens: a phone Call or a Chat. */
export const HANDOFF_CHANNELS = ['call', 'chat'] as const

/** Where a Handoff happens. */
export const handoffChannelSchema = z.enum(HANDOFF_CHANNELS)

/**
 * The states of a Handoff. `pending` waits for the Rep it is ringing; `accepted` is taken and
 * `completed` is over; `declined` and `timed_out` pass to the next Rep; `no_rep` means none took
 * it and the Agent offered a Booking instead.
 */
export const HANDOFF_STATES = [
  'pending',
  'accepted',
  'completed',
  'declined',
  'timed_out',
  'no_rep',
] as const

/** The state of a Handoff. */
export const handoffStateSchema = z.enum(HANDOFF_STATES)

/** Why the Inbound Agent handed off: a closed list. */
export const HANDOFF_REASONS = [
  'asked_for_rep',
  'qualified',
  'agent_unsure',
  'prospect_frustrated',
] as const

/** Why the Inbound Agent handed off. */
export const handoffReasonSchema = z.enum(HANDOFF_REASONS)

/** How a Handoff ended, for the event: the Rep was bridged, a Booking was offered, or the Prospect left. */
export const HANDOFF_RESULTS = ['bridged', 'booking_offered', 'abandoned'] as const

/** How a Handoff ended. */
export const handoffResultSchema = z.enum(HANDOFF_RESULTS)

/**
 * A Handoff: the Inbound Agent passing a Call or Chat to a Rep. A Call Handoff names the Call and a
 * Chat Handoff names the Chat. `repMembershipId` is the Rep it is currently offered to (null when
 * none is left); `attempt` counts the Reps tried.
 */
export const handoffSchema = z
  .strictObject({
    id: handoffIdSchema,
    state: handoffStateSchema,
    channel: handoffChannelSchema,
    callId: callIdSchema.nullable(),
    chatId: chatIdSchema.nullable(),
    repMembershipId: membershipIdSchema.nullable(),
    attempt: z.number().int().min(1).max(10),
    reason: handoffReasonSchema,
    requestedAt: timestampSchema,
    answeredAt: timestampSchema.nullable(),
    completedAt: timestampSchema.nullable(),
  })
  .superRefine((h, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    if (h.channel === 'call' && (h.callId === null || h.chatId !== null)) {
      issue('callId', 'A call Handoff names its Call and no Chat')
    }
    if (h.channel === 'chat' && (h.chatId === null || h.callId !== null)) {
      issue('chatId', 'A chat Handoff names its Chat and no Call')
    }
  })

/** A Handoff. */
export type Handoff = z.infer<typeof handoffSchema>

/** The path parameters of a request about one Handoff. */
export const handoffParamsSchema = z.strictObject({ handoffId: handoffIdSchema })

/** The query parameters of a request to list Handoffs: latest first, cursor-paginated, optionally by state. */
export const listHandoffsQuerySchema = pageQuerySchema
  .extend({ state: handoffStateSchema.optional() })
  .strict()

/** One page of Handoffs. */
export const handoffPageSchema = pageSchema(handoffSchema)

/**
 * What the Rep the Handoff is offered to sees before answering: the Prospect, the Qualification so
 * far and the last turns (at most 20). It carries no email or number; the Prospect's details come
 * from the Prospect record under the usual role rules.
 */
export const handoffContextSchema = z.strictObject({
  handoffId: handoffIdSchema,
  prospectId: prospectIdSchema,
  qualification: qualificationSchema,
  recentTurns: z.array(agentTurnSchema).max(MAX_HANDOFF_CONTEXT_TURNS),
})

/** The context of a Handoff. */
export type HandoffContext = z.infer<typeof handoffContextSchema>

/** The body of a request to accept or decline a Handoff: nothing, since the Rep is the token's. */
export const answerHandoffRequestSchema = z.strictObject({})
