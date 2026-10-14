import { z } from 'zod'
import { callIdSchema, dealRecordIdSchema } from '../ids'
import { PLAYBOOK_READ_ROLES, type PlaybookRoute } from './routes'
import { isWellFormedText } from './values'

/** The most Moments a search returns (the `limit` ceiling). */
export const MAX_SEARCH_LIMIT = 20

/** How many Moments a search returns when `limit` is left out. */
export const DEFAULT_SEARCH_LIMIT = 5

/** The most turns in a search query: the live window of the conversation, at most six turns. */
export const MAX_SEARCH_TURNS = 6

/** The most characters (Unicode code points) of all the turns of a search query together. */
export const MAX_SEARCH_TEXT_CHARACTERS = 2000

/** The most characters (Unicode code points) of one snippet in a search result. */
export const MAX_MOMENT_SNIPPET_CHARACTERS = 512

/** The most candidate Moments a search looks at before it keeps the best `limit`; it bounds `evidence`. */
export const MAX_SEARCH_CANDIDATES = 100

const codePointCount = (text: string): number => Array.from(text).length

/** One turn of the live conversation: who spoke (`rep` or `prospect`) and what was said. Tenant conversation text: never logged. */
export const searchTurnSchema = z.strictObject({
  role: z.enum(['rep', 'prospect']),
  text: z
    .string()
    .min(1)
    .max(MAX_SEARCH_TEXT_CHARACTERS * 2)
    .refine(isWellFormedText, 'Well-formed text only'),
})

/** One turn of the live conversation. */
export type SearchTurn = z.infer<typeof searchTurnSchema>

/**
 * The body of a search over won Deals: the latest turns of the conversation (1 to
 * `MAX_SEARCH_TURNS`, at most `MAX_SEARCH_TEXT_CHARACTERS` code points in all) and an optional
 * `limit` (1 to `MAX_SEARCH_LIMIT`, default `DEFAULT_SEARCH_LIMIT`). It is conversation text of the
 * Organization, so it is sent in a body and never logged. An unknown key is rejected.
 */
export const searchMomentsRequestSchema = z
  .strictObject({
    turns: z.array(searchTurnSchema).min(1).max(MAX_SEARCH_TURNS),
    limit: z.number().int().min(1).max(MAX_SEARCH_LIMIT).default(DEFAULT_SEARCH_LIMIT),
  })
  .superRefine((request, context) => {
    const total = request.turns.reduce((sum, turn) => sum + codePointCount(turn.text), 0)
    if (total > MAX_SEARCH_TEXT_CHARACTERS) {
      context.addIssue({
        code: 'custom',
        path: ['turns'],
        message: 'The turns together are within the character limit',
      })
    }
  })

/** The body of a search over won Deals, with the default limit applied. */
export type SearchMomentsRequest = z.infer<typeof searchMomentsRequestSchema>

/** A short piece of a Moment's text: at most `MAX_MOMENT_SNIPPET_CHARACTERS` code points, possibly empty. Tenant Transcript text. */
export const momentSnippetSchema = z
  .string()
  .max(MAX_MOMENT_SNIPPET_CHARACTERS * 2)
  .refine((text) => codePointCount(text) <= MAX_MOMENT_SNIPPET_CHARACTERS, 'Within the snippet cap')
  .refine(isWellFormedText, 'Well-formed text only')

/**
 * One similar Moment from a won Deal: the Call and Deal it comes from (opaque ids), its similarity
 * `score` (higher is closer) and two snippets, what the Prospect said and what the Rep said next.
 * It never carries the customer's `dealId`, name or amount; unknown fields are dropped. The
 * snippets are tenant Transcript text: never logged.
 */
export const momentMatchSchema = z.object({
  callId: callIdSchema,
  dealRecordId: dealRecordIdSchema,
  score: z.number().finite(),
  prospect: momentSnippetSchema,
  repNext: momentSnippetSchema,
})

/** One similar Moment from a won Deal. */
export type MomentMatch = z.infer<typeof momentMatchSchema>

/** How much a search found: `moments` candidates that may be returned and the distinct won Deals (`deals`) among them, both at most `MAX_SEARCH_CANDIDATES`. */
export const searchEvidenceSchema = z.object({
  moments: z.number().int().min(0).max(MAX_SEARCH_CANDIDATES),
  deals: z.number().int().min(0).max(MAX_SEARCH_CANDIDATES),
})

/** How much a search found. */
export type SearchEvidence = z.infer<typeof searchEvidenceSchema>

/**
 * The answer to a search: the best matches, at most `MAX_SEARCH_LIMIT`, best first, and the
 * evidence. There is no cursor: the result is a bounded top-k. The items are the first of the
 * `moments` candidates and the Deals are among them, so neither count is above `evidence.moments`, and `evidence.deals` is at least the number of distinct Deals among the items.
 */
export const searchMomentsResponseSchema = z
  .object({
    items: z.array(momentMatchSchema).max(MAX_SEARCH_LIMIT),
    evidence: searchEvidenceSchema,
  })
  .superRefine((response, context) => {
    const itemDeals = new Set(response.items.map((match) => match.dealRecordId)).size
    if (
      response.evidence.deals > response.evidence.moments ||
      response.items.length > response.evidence.moments ||
      response.evidence.deals < itemDeals
    ) {
      context.addIssue({
        code: 'custom',
        path: ['evidence'],
        message:
          'The items and Deals fit within the candidate Moments, and the Deals cover the items',
      })
    }
  })

/** The answer to a search. */
export type SearchMomentsResponse = z.infer<typeof searchMomentsResponseSchema>

const ROLE_LABELS = { rep: 'Rep', prospect: 'Prospect' } as const

/**
 * The text that is embedded for a window of turns: one `Rep: ` or `Prospect: ` line per turn,
 * joined by a newline. The indexer (a Moment's text) and the search (the query) both call this, so
 * what is stored and what is asked cannot drift. It adds no speaker label and no Rep reply. The
 * result is tenant conversation text: never log it.
 */
export function momentQueryText(turns: readonly SearchTurn[]): string {
  return turns.map((turn) => `${ROLE_LABELS[turn.role]}: ${turn.text}`).join('\n')
}

const route = (definition: PlaybookRoute): PlaybookRoute => Object.freeze(definition)

/** The search routes, by name. */
export type SearchRouteName = 'searchMoments'

/**
 * The search route: a read-only `POST` (the body is conversation text) for every role that reads
 * the Playbook. It uses existing codes only, so it has no domain code of its own.
 */
export const SEARCH_ROUTES: Readonly<Record<SearchRouteName, PlaybookRoute>> = Object.freeze({
  searchMoments: route({
    method: 'POST',
    path: '/playbook/search/moments',
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ['request.invalid', 'server.timeout', 'server.unavailable'],
    description:
      "Finds Moments in the Organization's won Deals that resemble the conversation so far, so the Copilot can show what worked. The body is the latest turns (1 to 6, each a role of rep or prospect and its text, at most 2000 characters in all) and an optional limit (1 to 20, default 5). It answers the best matches, best first, at most 20, each with the opaque callId and dealRecordId, a score and two snippets of at most 512 characters (what the Prospect said and what the Rep said next), and evidence: the number of candidate Moments and the distinct won Deals among them. There is no cursor: the result is a bounded top-k. Only Moments of Calls whose Deal is won and whose Call is in search are returned, and only from the caller's Organization. It never returns the customer's dealId, name or amount. The request and the snippets are tenant conversation text and are never logged. It only reads, so it takes no Idempotency-Key and a repeat is harmless. request.invalid (400) for a body outside the bounds; server.timeout (504) when it takes too long; server.unavailable (503) with a Retry-After header when the embedding model or the vector store cannot answer. Every role that reads the Playbook (Owner, Admin, Manager and Rep) may call it; any other is auth.forbidden.",
  }),
})
