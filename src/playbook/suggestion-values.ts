import { z } from 'zod'

// Shared by `search.ts` and `suggestion.ts`; kept apart so neither imports the other (`citation.ts` sits between them).

/** Who wrote a Moment: imported from history, a Rep, or an Agent. Agent-authored Moments are weighted lower so Agents do not learn only from themselves. A closed list. */
export const MOMENT_ORIGINS = ['imported', 'rep', 'agent'] as const

/** Who wrote a Moment. */
export const momentOriginSchema = z.enum(MOMENT_ORIGINS)

/** Who wrote a Moment. */
export type MomentOrigin = z.infer<typeof momentOriginSchema>

/** What a Suggestion proposes to add. A closed list. */
export const SUGGESTION_KINDS = ['objection_answer', 'discovery_question', 'closing_move'] as const

/** What a Suggestion proposes to add. */
export const suggestionKindSchema = z.enum(SUGGESTION_KINDS)

/** What a Suggestion proposes to add. */
export type SuggestionKind = z.infer<typeof suggestionKindSchema>

/** Where a Suggestion is: waiting for an Admin, accepted (and indexed), or rejected (kept so it is not proposed again). */
export const SUGGESTION_STATUSES = ['pending', 'accepted', 'rejected'] as const

/** Where a Suggestion is. */
export const suggestionStatusSchema = z.enum(SUGGESTION_STATUSES)

/** Where a Suggestion is. */
export type SuggestionStatus = z.infer<typeof suggestionStatusSchema>

/** The longest Suggestion text, in characters. */
export const MAX_SUGGESTION_TEXT_LENGTH = 1000

/** The most Moments one Suggestion cites. */
export const MAX_SUGGESTION_MOMENTS = 10

/** The text of a Suggestion: derived from a Deal's Calls, so untrusted data; shown, never run. */
export const suggestionTextSchema = z.string().trim().min(1).max(MAX_SUGGESTION_TEXT_LENGTH)
