import { z } from 'zod'
import { campaignLanguageSchema } from '../campaign/values'
import { timestampSchema } from '../core/values'
import { briefIdSchema, prospectIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { citationSourceSchema } from './citation'
import {
  MAX_ANGLE_LENGTH,
  MAX_BRIEF_STATEMENT_LENGTH,
  MAX_BRIEF_STATEMENTS,
  messagingTextSchema,
} from './values'

/** One statement of a Research Brief: a fact about the Prospect and the one source it rests on. A statement with no source is never kept. */
export const briefStatementSchema = z.strictObject({
  text: messagingTextSchema(MAX_BRIEF_STATEMENT_LENGTH),
  source: citationSourceSchema,
})

/** One statement of a Research Brief. */
export type BriefStatement = z.infer<typeof briefStatementSchema>

/** Where the suggested angle came from: the Organization's won Deals, or the model's default when it has none. */
export const ANGLE_ORIGINS = ['won_deals', 'model_default'] as const

/** Where the suggested angle came from. */
export const angleOriginSchema = z.enum(ANGLE_ORIGINS)

/**
 * The angle a Draft is told to take, with where it came from and what backs it. An angle from
 * `won_deals` cites at least one Moment; one from `model_default` cites nothing and says so.
 */
export const briefAngleSchema = z
  .strictObject({
    text: messagingTextSchema(MAX_ANGLE_LENGTH),
    origin: angleOriginSchema,
    sources: z.array(citationSourceSchema).max(MAX_BRIEF_STATEMENTS),
  })
  .refine(
    (angle) =>
      angle.origin === 'won_deals'
        ? angle.sources.some((source) => source.kind === 'moment')
        : angle.sources.length === 0,
    'An angle from won Deals cites a Moment; a default angle cites nothing'
  )

/** The angle of a Research Brief. */
export type BriefAngle = z.infer<typeof briefAngleSchema>

/**
 * A Research Brief: the cited facts about one Prospect that a Draft is written from. Every
 * statement carries exactly one source; `droppedCount` is how many the model proposed that had none
 * or whose source did not resolve, and were left out. It is cached until `expiresAt` and stale as
 * soon as the Prospect's record changes after `prospectUpdatedAt`. Model output: untrusted data.
 */
export const researchBriefSchema = z.strictObject({
  id: briefIdSchema,
  prospectId: prospectIdSchema,
  statements: z.array(briefStatementSchema).min(1).max(MAX_BRIEF_STATEMENTS),
  angle: briefAngleSchema,
  droppedCount: z.number().int().min(0).max(1000),
  prospectUpdatedAt: timestampSchema,
  language: campaignLanguageSchema,
  model: z.string().min(1).max(100),
  createdAt: timestampSchema,
  expiresAt: timestampSchema,
})

/** A Research Brief. */
export type ResearchBrief = z.infer<typeof researchBriefSchema>

/** The body to make a Research Brief: `refresh` builds a new one even when a cached one is still fresh. */
export const createBriefRequestSchema = z.strictObject({
  refresh: z.boolean().default(false),
})

/** The body to make a Research Brief. */
export type CreateBriefRequest = z.infer<typeof createBriefRequestSchema>

/** The query of a Research Brief list: cursor and limit (at most 100). */
export const listBriefsQuerySchema = pageQuerySchema

/** One page of Research Briefs, newest first (by `createdAt`, then id). */
export const listBriefsResponseSchema = pageSchema(researchBriefSchema)
