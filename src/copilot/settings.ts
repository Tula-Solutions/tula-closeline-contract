import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { membershipIdSchema } from '../ids'

/** The fewest Moments, and the fewest distinct won Deals, a card may be allowed to rest on: a card is never shown without evidence. */
export const MIN_COPILOT_MIN_EVIDENCE = 1

/** The most an Organization can ask of a card, in Moments and in Deals. */
export const MAX_COPILOT_MIN_EVIDENCE = 20

/** The default minimum Evidence, in Moments: 3. */
export const DEFAULT_COPILOT_MIN_MOMENTS = 3

/** The default minimum Evidence, in distinct won Deals: 2. */
export const DEFAULT_COPILOT_MIN_DEALS = 2

const minEvidenceSchema = z
  .number()
  .int()
  .min(MIN_COPILOT_MIN_EVIDENCE)
  .max(MAX_COPILOT_MIN_EVIDENCE)

/**
 * The Copilot settings of an Organization: whether Reps may choose the Copilot for a Call, and the
 * least Evidence (similar Moments, and distinct won Deals among them) a card needs before it is
 * shown. There is one row per Organization. Nothing here, and no request, changes what a Call
 * tells the Prospect: the Disclosure of a Copilot Call always says the Call is recorded and that
 * AI is assisting (ADR 0003), and the Copilot cannot start before it has played.
 */
export const copilotSettingsSchema = z
  .strictObject({
    enabled: z.boolean(),
    minMoments: minEvidenceSchema,
    minDeals: minEvidenceSchema,
    updatedAt: timestampSchema.nullable(),
    updatedBy: membershipIdSchema.nullable(),
  })
  .refine((settings) => settings.minDeals <= settings.minMoments, {
    path: ['minDeals'],
    message: 'The minimum Deals are no more than the minimum Moments',
  })

/** The Copilot settings of an Organization. */
export type CopilotSettings = z.infer<typeof copilotSettingsSchema>

/**
 * The body of a request to set the Copilot settings; it replaces them, so a repeat of the same
 * body changes nothing. A `minDeals` above `minMoments`, or a minimum outside 1 to 20, is refused
 * by the service as `copilot.min_evidence_invalid`.
 */
export const setCopilotSettingsRequestSchema = z
  .strictObject({
    enabled: z.boolean(),
    minMoments: minEvidenceSchema,
    minDeals: minEvidenceSchema,
  })
  .refine((settings) => settings.minDeals <= settings.minMoments, {
    path: ['minDeals'],
    message: 'The minimum Deals are no more than the minimum Moments',
  })

/** The body of a request to set the Copilot settings. */
export type SetCopilotSettingsRequest = z.infer<typeof setCopilotSettingsRequestSchema>
