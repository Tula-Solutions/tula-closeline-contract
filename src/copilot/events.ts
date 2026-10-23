import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import { callIdSchema, copilotCardIdSchema, membershipIdSchema } from '../ids'
import {
  copilotCardKindSchema,
  copilotEvidenceSchema,
  copilotMomentRefSchema,
  copilotObjectionTypeSchema,
  copilotRatingSchema,
  MAX_COPILOT_CITED_MOMENTS,
} from './values'

/**
 * `voice.copilot.card_shown` (version 1): a Copilot Card appeared on a Rep's screen. Ids, the kind,
 * the Evidence and the cited Moments, and no card text, quote or Transcript: those are tenant text
 * and are read through the routes by those who may see the Call.
 */
export const voiceCopilotCardShownEvent = defineEvent(
  'voice.copilot.card_shown',
  1,
  z
    .strictObject({
      callId: callIdSchema,
      cardId: copilotCardIdSchema,
      repMembershipId: membershipIdSchema,
      kind: copilotCardKindSchema,
      objectionType: copilotObjectionTypeSchema.nullable(),
      evidence: copilotEvidenceSchema,
      citedMoments: z.array(copilotMomentRefSchema).min(1).max(MAX_COPILOT_CITED_MOMENTS),
      shownAt: timestampSchema,
    })
    .refine((data) => (data.kind === 'objection') === (data.objectionType !== null), {
      path: ['objectionType'],
      message: 'Only an objection card names an objection type',
    })
)

/**
 * `voice.copilot.card_rated` (version 1): a Rep changed how they marked a card (rated, dismissed,
 * pinned). Carries the end state after the change, so a consumer (M15) applies it without having
 * seen the earlier events. A repeat that changes nothing publishes no event. No card text.
 */
export const voiceCopilotCardRatedEvent = defineEvent(
  'voice.copilot.card_rated',
  1,
  z
    .strictObject({
      callId: callIdSchema,
      cardId: copilotCardIdSchema,
      repMembershipId: membershipIdSchema,
      kind: copilotCardKindSchema,
      rating: copilotRatingSchema.nullable(),
      dismissed: z.boolean(),
      pinned: z.boolean(),
      ratedAt: timestampSchema,
    })
    .refine((data) => !(data.dismissed && data.pinned), {
      path: ['pinned'],
      message: 'A card is dismissed or pinned, not both',
    })
)

/** Every Copilot event, by type. */
export const COPILOT_EVENTS = {
  'voice.copilot.card_shown': voiceCopilotCardShownEvent,
  'voice.copilot.card_rated': voiceCopilotCardRatedEvent,
} as const

/** The type of a Copilot event. */
export type CopilotEventType = keyof typeof COPILOT_EVENTS
