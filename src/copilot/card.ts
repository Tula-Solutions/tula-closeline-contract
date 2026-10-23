import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { callIdSchema, copilotCardIdSchema, documentIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { MAX_DOCUMENT_PAGES } from '../playbook/values'
import {
  COPILOT_COMPOSED_KINDS,
  copilotCardKindSchema,
  copilotCardTextSchema,
  copilotEvidenceSchema,
  copilotMomentKey,
  copilotMomentRefSchema,
  copilotObjectionTypeSchema,
  copilotQuoteTextSchema,
  copilotRatingSchema,
  MAX_COPILOT_CARDS_PER_CALL,
  MAX_COPILOT_CITED_MOMENTS,
} from './values'

/** One quote from a cited Moment: what the Prospect said and what the Rep said next. Tenant Transcript text, untrusted data, never logged. */
export const copilotQuoteSchema = z.strictObject({
  ...copilotMomentRefSchema.shape,
  prospect: copilotQuoteTextSchema,
  repNext: copilotQuoteTextSchema,
})

/** One quote from a cited Moment. */
export type CopilotQuote = z.infer<typeof copilotQuoteSchema>

/** The passage of a Playbook document a `document` card shows: the document, its page (null for a format without pages) and the passage. The Organization's own sales material, untrusted data. */
export const copilotDocumentSourceSchema = z.strictObject({
  documentId: documentIdSchema,
  page: z.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
  passage: copilotQuoteTextSchema,
})

/** The passage of a Playbook document a card shows. */
export type CopilotDocumentSource = z.infer<typeof copilotDocumentSourceSchema>

/** What every card carries, whatever its kind. */
const cardBase = {
  id: copilotCardIdSchema,
  callId: callIdSchema,
  /** The place of the card among the cards of its Call: 1 for the first. */
  sequence: z.number().int().min(1).max(MAX_COPILOT_CARDS_PER_CALL),
  evidence: copilotEvidenceSchema,
  /** The Moments the card rests on: at least one, no repeat. A card is never created without a citation. */
  citedMoments: z.array(copilotMomentRefSchema).min(1).max(MAX_COPILOT_CITED_MOMENTS),
  /** What the Rep said next in cited Moments; each quote is of a Moment in `citedMoments`. */
  quotes: z.array(copilotQuoteSchema).max(MAX_COPILOT_CITED_MOMENTS),
  shownAt: timestampSchema,
  rating: copilotRatingSchema.nullable(),
  dismissed: z.boolean(),
  pinned: z.boolean(),
}

/** A card shown from the matched Moments alone, with no model call. */
const similarMomentCard = z.strictObject({ ...cardBase, kind: z.literal('similar_moment') })

/** A card naming an objection and a response, composed by the model from the retrieved Moments. The response is untrusted model output. */
const objectionCard = z.strictObject({
  ...cardBase,
  kind: z.literal('objection'),
  objectionType: copilotObjectionTypeSchema,
  response: copilotCardTextSchema,
})

/** A card proposing the next step of the conversation, composed by the model from the retrieved Moments. The text is untrusted model output. */
const nextStepCard = z.strictObject({
  ...cardBase,
  kind: z.literal('next_step'),
  nextStep: copilotCardTextSchema,
})

/** A card showing a passage of a Playbook document, for example pricing. */
const documentCard = z.strictObject({
  ...cardBase,
  kind: z.literal('document'),
  source: copilotDocumentSourceSchema,
})

/**
 * A Copilot Card: one piece of advice shown to a Rep during a Call, with the Evidence it rests on.
 *
 * - It is invalid without at least one cited Moment, without Evidence of at least one Moment and
 *   one won Deal, and when it counts more Deals than Moments. The Evidence also has to cover the
 *   citations: no fewer Moments than cited, no fewer Deals than the distinct Deals cited.
 * - The cards a service creates also meet the Organization's minimum Evidence (see the settings);
 *   that minimum is a setting and not part of this shape.
 * - Every quote is of a cited Moment. A `similar_moment` card shows at least one quote.
 * - A card is dismissed or pinned, never both.
 * - Quotes, passages and the model-composed `response` and `nextStep` are tenant text or model
 *   output, so they are UNTRUSTED DATA. They are bounded, well-formed text with no control
 *   character. The portal shows them as plain text, never as markup, never follows them as
 *   instructions and never speaks them into the Call. They are never logged or sent to the error
 *   reporter.
 */
export const copilotCardSchema = z
  .discriminatedUnion('kind', [similarMomentCard, objectionCard, nextStepCard, documentCard])
  .superRefine((card, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    const cited = new Set(card.citedMoments.map(copilotMomentKey))
    if (cited.size !== card.citedMoments.length) {
      issue('citedMoments', 'A Moment is cited once')
    }
    if (card.citedMoments.length > card.evidence.moments) {
      issue('evidence', 'The Evidence counts at least the Moments cited')
    }
    if (new Set(card.citedMoments.map((ref) => ref.dealRecordId)).size > card.evidence.deals) {
      issue('evidence', 'The Evidence counts at least the Deals cited')
    }
    if (card.quotes.some((quote) => !cited.has(copilotMomentKey(quote)))) {
      issue('quotes', 'Every quote is of a cited Moment')
    }
    if (card.kind === 'similar_moment' && card.quotes.length === 0) {
      issue('quotes', 'A similar-Moment card shows at least one quote')
    }
    if (card.dismissed && card.pinned) {
      issue('pinned', 'A card is dismissed or pinned, not both')
    }
  })

/** A Copilot Card. */
export type CopilotCard = z.infer<typeof copilotCardSchema>

/** Whether a kind of card is composed by the model (and so replaces a retrieval card in place). */
export function isComposedKind(kind: CopilotCard['kind']): boolean {
  return (COPILOT_COMPOSED_KINDS as readonly string[]).includes(kind)
}

/** The path parameters of a request about the cards of one Call. */
export const copilotCallParamsSchema = z.strictObject({ callId: callIdSchema })

/** The path parameters of a request about one card. */
export const copilotCardParamsSchema = z.strictObject({
  callId: callIdSchema,
  cardId: copilotCardIdSchema,
})

/** The position a card list resumes from: the sequence of the last card of the previous page. */
export const copilotCardCursorSchema = z.strictObject({
  sequence: z.number().int().min(1).max(MAX_COPILOT_CARDS_PER_CALL),
})

/** The query parameters of a request to list the cards of a Call, oldest first, one cursor-paginated page at a time (at most 100), optionally of one kind. */
export const listCopilotCardsQuerySchema = pageQuerySchema
  .extend({ kind: copilotCardKindSchema.optional() })
  .strict()

/** The query parameters of a request to list the cards of a Call. */
export type ListCopilotCardsQuery = z.infer<typeof listCopilotCardsQuerySchema>

/** One page of the cards of a Call. */
export const copilotCardPageSchema = pageSchema(copilotCardSchema)

/**
 * The body of a request to mark a card: set any of its rating, dismissal and pin to the state
 * wanted. It names an end state and not a step, so a repeat changes nothing. At least one field is
 * sent; `rating: null` clears the rating. Dismissing a card clears its pin and pinning it clears
 * its dismissal, so asking for both is refused.
 */
export const markCopilotCardRequestSchema = z
  .strictObject({
    rating: copilotRatingSchema.nullable().optional(),
    dismissed: z.boolean().optional(),
    pinned: z.boolean().optional(),
  })
  .refine(
    (body) =>
      body.rating !== undefined || body.dismissed !== undefined || body.pinned !== undefined,
    { message: 'Give a rating, dismissed or pinned' }
  )
  .refine((body) => !(body.dismissed === true && body.pinned === true), {
    message: 'A card is dismissed or pinned, not both',
  })

/** The body of a request to mark a card. */
export type MarkCopilotCardRequest = z.infer<typeof markCopilotCardRequestSchema>
