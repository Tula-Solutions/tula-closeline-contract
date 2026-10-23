import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { defineErrors } from '../errors'
import { dealRecordIdSchema, membershipIdSchema, suggestionIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { citationRefSchema } from './citation'
import { PLAYBOOK_WRITE_ROLES, type PlaybookRoute } from './routes'

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

const momentRefSchema = citationRefSchema.options[0]

/** Where a Suggestion came from: the won Deal (opaque id) and the Moments it cites. */
export const suggestionProvenanceSchema = z.strictObject({
  dealRecordId: dealRecordIdSchema,
  moments: z.array(momentRefSchema).max(MAX_SUGGESTION_MOMENTS),
})

/**
 * One Suggestion. It influences no Agent until accepted. `pending` is exactly the state with no
 * decision: `decidedAt` and `decidedByMembershipId` are null if and only if it is pending.
 */
export const suggestionSchema = z
  .strictObject({
    id: suggestionIdSchema,
    kind: suggestionKindSchema,
    status: suggestionStatusSchema,
    text: suggestionTextSchema,
    provenance: suggestionProvenanceSchema,
    createdAt: timestampSchema,
    decidedAt: timestampSchema.nullable(),
    decidedByMembershipId: membershipIdSchema.nullable(),
  })
  .superRefine((suggestion, ctx) => {
    const pending = suggestion.status === 'pending'
    if (pending !== (suggestion.decidedAt === null)) {
      ctx.addIssue({
        code: 'custom',
        path: ['decidedAt'],
        message: 'Only a pending Suggestion has no decision time',
      })
    }
    if (pending !== (suggestion.decidedByMembershipId === null)) {
      ctx.addIssue({
        code: 'custom',
        path: ['decidedByMembershipId'],
        message: 'Only a pending Suggestion has no decider',
      })
    }
  })

/** One Suggestion. */
export type Suggestion = z.infer<typeof suggestionSchema>

/** The request to accept a Suggestion, optionally with edited text. Without `text` the proposed text is used. */
export const acceptSuggestionRequestSchema = z.strictObject({
  text: suggestionTextSchema.optional(),
})

/** The request to accept a Suggestion. */
export type AcceptSuggestionRequest = z.infer<typeof acceptSuggestionRequestSchema>

/** The request to reject a Suggestion: no fields. */
export const rejectSuggestionRequestSchema = z.strictObject({})

/** The query of the Suggestion list: a cursor page and an optional status. */
export const listSuggestionsQuerySchema = pageQuerySchema.extend({
  status: suggestionStatusSchema.optional(),
})

/** The query of the Suggestion list. */
export type ListSuggestionsQuery = z.infer<typeof listSuggestionsQuerySchema>

/** One page of Suggestions. */
export const listSuggestionsResponseSchema = pageSchema(suggestionSchema)

/**
 * The errors the Suggestion routes return.
 *
 * - `suggestion.not_found` (404): unknown, or of another Organization; never 403.
 * - `suggestion.not_pending` (409): it was already accepted or rejected.
 */
export const SUGGESTION_ERRORS = defineErrors('suggestion', {
  not_found: { status: 404, message: 'The Suggestion was not found.' },
  not_pending: { status: 409, message: 'The Suggestion was already accepted or rejected.' },
})

/** A Suggestion error code. */
export type SuggestionErrorCode = keyof typeof SUGGESTION_ERRORS

/** The Suggestion route names. */
export type SuggestionRouteName =
  | 'listSuggestions'
  | 'getSuggestion'
  | 'acceptSuggestion'
  | 'rejectSuggestion'

/** One Suggestion route: the shape of a Playbook route, with Suggestion error codes. */
export type SuggestionRoute = Omit<PlaybookRoute, 'errors'> & {
  readonly errors: readonly SuggestionErrorCode[]
}

const route = (definition: SuggestionRoute): SuggestionRoute => Object.freeze(definition)

/**
 * The Suggestion routes (spec M15). The Playbook owns them. Owner and Admin only, for reading and
 * deciding. Accepted Suggestions are indexed for search with their provenance; rejected ones are
 * kept. An unknown or other-Organization Suggestion is `suggestion.not_found` (404), never 403.
 */
export const SUGGESTION_ROUTES: Readonly<Record<SuggestionRouteName, SuggestionRoute>> =
  Object.freeze({
    listSuggestions: route({
      method: 'GET',
      path: '/playbook/suggestions',
      internal: false,
      roles: PLAYBOOK_WRITE_ROLES,
      success: [200],
      errors: [],
      commonErrors: ['request.invalid'],
      description:
        'Lists proposed Playbook Suggestions, newest first, one cursor-paginated page at a time (at most 100), optionally only one status (pending, accepted or rejected). Each names its kind (objection_answer, discovery_question or closing_move), its text (untrusted data) and its provenance: the Deal (opaque id) and the Moments it cites. Owner and Admin only.',
    }),
    getSuggestion: route({
      method: 'GET',
      path: '/playbook/suggestions/{suggestionId}',
      internal: false,
      roles: PLAYBOOK_WRITE_ROLES,
      success: [200],
      errors: ['suggestion.not_found'],
      commonErrors: [],
      description:
        'Reads one Suggestion with its provenance. An unknown one, or one of another Organization, is suggestion.not_found (404), never 403. Owner and Admin only.',
    }),
    acceptSuggestion: route({
      method: 'POST',
      path: '/playbook/suggestions/{suggestionId}/accept',
      internal: false,
      roles: PLAYBOOK_WRITE_ROLES,
      success: [200],
      errors: ['suggestion.not_found', 'suggestion.not_pending'],
      commonErrors: [
        'request.invalid',
        'request.idempotency_key_reused',
        'request.idempotency_in_progress',
      ],
      description:
        'Accepts a pending Suggestion, optionally with edited text (the body is empty or {"text"}). The accepted text is indexed for search with its provenance; nothing reaches an Agent before this. Answers the Suggestion in state accepted. A Suggestion already decided is suggestion.not_pending (409). Owner and Admin only. Accepts an Idempotency-Key header.',
    }),
    rejectSuggestion: route({
      method: 'POST',
      path: '/playbook/suggestions/{suggestionId}/reject',
      internal: false,
      roles: PLAYBOOK_WRITE_ROLES,
      success: [200],
      errors: ['suggestion.not_found', 'suggestion.not_pending'],
      commonErrors: [
        'request.invalid',
        'request.idempotency_key_reused',
        'request.idempotency_in_progress',
      ],
      description:
        'Rejects a pending Suggestion (the body is empty). It is kept, in state rejected, so it is not proposed again. A Suggestion already decided is suggestion.not_pending (409). Owner and Admin only. Accepts an Idempotency-Key header.',
    }),
  })
