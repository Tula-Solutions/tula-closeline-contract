import { z } from 'zod'
import { callIdSchema, dealRecordIdSchema } from '../ids'
import { MAX_SEARCH_CANDIDATES } from '../playbook/search'
import { hasStrippableCharacter, isWellFormedText } from '../playbook/values'

/**
 * The kinds of Copilot Card. `similar_moment` and `document` are built from retrieval alone, with
 * no model call. `objection` and `next_step` are what a retrieval card is upgraded into, in place,
 * by the model composer, which sees only the retrieved Moments.
 */
export const COPILOT_CARD_KINDS = ['similar_moment', 'objection', 'next_step', 'document'] as const

/** The kind of a Copilot Card. */
export const copilotCardKindSchema = z.enum(COPILOT_CARD_KINDS)

/** The kind of a Copilot Card. */
export type CopilotCardKind = z.infer<typeof copilotCardKindSchema>

/** The kinds a model composes (the rest are built from retrieval alone). */
export const COPILOT_COMPOSED_KINDS = [
  'objection',
  'next_step',
] as const satisfies readonly CopilotCardKind[]

/** The closed taxonomy of an objection a Copilot Card names. */
export const COPILOT_OBJECTION_TYPES = [
  'price',
  'timing',
  'competitor',
  'authority',
  'need',
  'trust',
] as const

/** The type of an objection. */
export const copilotObjectionTypeSchema = z.enum(COPILOT_OBJECTION_TYPES)

/** The type of an objection. */
export type CopilotObjectionType = z.infer<typeof copilotObjectionTypeSchema>

/** How a Rep rated a card. A card with no rating has `null`. */
export const COPILOT_RATINGS = ['useful', 'not_useful'] as const

/** How a Rep rated a card. */
export const copilotRatingSchema = z.enum(COPILOT_RATINGS)

/** How a Rep rated a card. */
export type CopilotRating = z.infer<typeof copilotRatingSchema>

/** The most cards one Call can show (spec M13). */
export const MAX_COPILOT_CARDS_PER_CALL = 60

/** The most Moments one card cites, and the most quotes it shows: the Playbook search the card is built from returns at most five. */
export const MAX_COPILOT_CITED_MOMENTS = 5

/** The most characters of the model-composed text of a card (an objection response or a next step). */
export const MAX_COPILOT_CARD_TEXT_LENGTH = 600

/** The most characters of one quote of a Moment, the same cap the Playbook search puts on its text. */
export const MAX_COPILOT_QUOTE_LENGTH = 512

const codePointCount = (text: string): number => Array.from(text).length

/**
 * Builds a schema for card text that is bounded in code points, well-formed, non-blank and free of
 * control and bidirectional characters (newlines included). Such text is model output or
 * the Organization's own Transcript text. It is untrusted data: the portal shows it as plain text,
 * never as markup and never as an instruction to follow, and it is never spoken into the Call.
 * @param max the most code points
 */
export function copilotTextSchema(max: number) {
  return z
    .string()
    .max(max * 4)
    .refine((text) => codePointCount(text) <= max, `At most ${max} characters`)
    .refine(isWellFormedText, 'Well-formed text only')
    .refine((text) => !hasStrippableCharacter(text), 'No control characters')
    .refine((text) => text.trim().length > 0, 'Not only whitespace')
}

/** The model-composed text of a card: untrusted model output, at most {@link MAX_COPILOT_CARD_TEXT_LENGTH} characters. */
export const copilotCardTextSchema = copilotTextSchema(MAX_COPILOT_CARD_TEXT_LENGTH)

/** One quote of a Moment: what the Prospect said or what the Rep said next. Tenant Transcript text, untrusted, never logged. */
export const copilotQuoteTextSchema = copilotTextSchema(MAX_COPILOT_QUOTE_LENGTH)

/**
 * A Moment a card cites. The Playbook gives a Moment no id of its own yet; its search names one by
 * the opaque Call and Deal record it comes from, and so does a citation. Both ids already exist in
 * the contract and neither carries the customer's own Deal identifier.
 */
export const copilotMomentRefSchema = z.strictObject({
  callId: callIdSchema,
  dealRecordId: dealRecordIdSchema,
})

/** A Moment a card cites. */
export type CopilotMomentRef = z.infer<typeof copilotMomentRefSchema>

/** The Evidence behind a card: the similar Moments and the distinct won Deals among them. At least one of each, and never more Deals than Moments. */
export const copilotEvidenceSchema = z
  .strictObject({
    moments: z.number().int().min(1).max(MAX_SEARCH_CANDIDATES),
    deals: z.number().int().min(1).max(MAX_SEARCH_CANDIDATES),
  })
  .refine((evidence) => evidence.deals <= evidence.moments, {
    path: ['deals'],
    message: 'There are no more distinct Deals than Moments',
  })

/** The Evidence behind a card. */
export type CopilotEvidence = z.infer<typeof copilotEvidenceSchema>

/** The key of a Moment reference, to compare two. */
export const copilotMomentKey = (ref: CopilotMomentRef): string =>
  `${ref.callId}|${ref.dealRecordId}`
