import { z } from 'zod'
import { callIdSchema, dealRecordIdSchema, documentIdSchema } from '../ids'
import { excerptText } from './call-values'
import { PLAYBOOK_READ_ROLES, type PlaybookRoute } from './routes'
import { SALES_HISTORY_READ_ROLES } from './sales-history-routes'
import {
  documentFileNameSchema,
  hasStrippableCharacter,
  isWellFormedText,
  MAX_DOCUMENT_PAGES,
} from './values'

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
    .refine(isWellFormedText, 'Well-formed text only')
    .refine((text) => text.trim().length > 0, 'Not only whitespace'),
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

/**
 * A short piece of a Moment's text: at most `MAX_MOMENT_SNIPPET_CHARACTERS` code points, possibly
 * empty, well-formed and with no control or bidirectional character (newlines and tabs included),
 * the same rule as a speaker excerpt. Build one with {@link momentSnippet}. Tenant Transcript text.
 */
export const momentSnippetSchema = z
  .string()
  .max(MAX_MOMENT_SNIPPET_CHARACTERS * 2)
  .refine((text) => codePointCount(text) <= MAX_MOMENT_SNIPPET_CHARACTERS, 'Within the snippet cap')
  .refine(isWellFormedText, 'Well-formed text only')
  .refine((text) => !hasStrippableCharacter(text), 'No control characters')

/**
 * Makes a snippet from stored Transcript text: whitespace collapsed, control and bidirectional
 * characters removed and the text cut to `MAX_MOMENT_SNIPPET_CHARACTERS` code points at a word
 * boundary with an ellipsis. It always passes {@link momentSnippetSchema}. Never log the result.
 */
export function momentSnippet(text: string): string {
  return excerptText(text, MAX_MOMENT_SNIPPET_CHARACTERS)
}

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
 * what is stored and what is asked cannot drift, so the indexer must use this function too. Each
 * turn's text is trimmed. It adds no speaker label and no Rep reply. The
 * result is tenant conversation text: never log it.
 */
export function momentQueryText(turns: readonly SearchTurn[]): string {
  return turns.map((turn) => `${ROLE_LABELS[turn.role]}: ${turn.text.trim()}`).join('\n')
}

const route = (definition: PlaybookRoute): PlaybookRoute => Object.freeze(definition)

/** The body of a search over Playbook documents: the same turns and limit as {@link searchMomentsRequestSchema}, with the same bounds. Tenant conversation text: never logged. */
export const searchDocumentsRequestSchema = searchMomentsRequestSchema

/**
 * The text that is embedded to search Playbook documents: each turn's text trimmed and joined by a
 * newline, with no role labels, because document chunks are embedded as plain text and a label
 * would skew the similarity. The Moments search uses {@link momentQueryText} instead. The result
 * is tenant conversation text: never log it.
 */
export function documentQueryText(turns: readonly SearchTurn[]): string {
  return turns.map((turn) => turn.text.trim()).join('\n')
}

/** The body of a search over Playbook documents. */
export type SearchDocumentsRequest = SearchMomentsRequest

/**
 * One matching passage of a Playbook document: the document (`documentId`, and its `fileName`, the
 * Organization's own file name, the same as the document's `fileName`), the `page` it is on, its
 * similarity `score` (higher is closer) and a `snippet` of the passage, cleaned and cut with
 * {@link momentSnippet}. `page` is the 1-based page for a paginated format (PDF) and `null` for a
 * format without pages (TXT, MD, DOCX, and anything else the parser reads as one page); the service
 * decides by media type. One item per chunk. Unknown fields are dropped. The snippet is the
 * Organization's own sales material: never log it.
 */
export const documentMatchSchema = z.object({
  documentId: documentIdSchema,
  fileName: documentFileNameSchema,
  page: z.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
  score: z.number().finite(),
  snippet: momentSnippetSchema,
})

/** One matching passage of a Playbook document. */
export type DocumentMatch = z.infer<typeof documentMatchSchema>

/** How much a document search found: `chunks` that may be returned and the distinct `documents` among them, both at most `MAX_SEARCH_CANDIDATES`. */
export const documentSearchEvidenceSchema = z.object({
  chunks: z.number().int().min(0).max(MAX_SEARCH_CANDIDATES),
  documents: z.number().int().min(0).max(MAX_SEARCH_CANDIDATES),
})

/** How much a document search found. */
export type DocumentSearchEvidence = z.infer<typeof documentSearchEvidenceSchema>

/**
 * The answer to a document search: the best passages, at most `MAX_SEARCH_LIMIT`, best first, and
 * the evidence. There is no cursor. As for Moments, neither the items nor the documents exceed
 * `evidence.chunks`, and `evidence.documents` is at least the number of distinct documents among
 * the items.
 */
export const searchDocumentsResponseSchema = z
  .object({
    items: z.array(documentMatchSchema).max(MAX_SEARCH_LIMIT),
    evidence: documentSearchEvidenceSchema,
  })
  .superRefine((response, context) => {
    const itemDocuments = new Set(response.items.map((match) => match.documentId)).size
    if (
      response.evidence.documents > response.evidence.chunks ||
      response.items.length > response.evidence.chunks ||
      response.evidence.documents < itemDocuments
    ) {
      context.addIssue({
        code: 'custom',
        path: ['evidence'],
        message:
          'The items and documents fit within the candidate chunks, and the documents cover the items',
      })
    }
  })

/** The answer to a document search. */
export type SearchDocumentsResponse = z.infer<typeof searchDocumentsResponseSchema>

/** The search routes, by name. */
export type SearchRouteName = 'searchMoments' | 'searchDocuments'

/**
 * The search routes: read-only `POST`s (the body is conversation text). `searchMoments` is for
 * Owner and Admin only (the roles that read sales history); `searchDocuments` is for every role
 * that reads the Playbook. They use existing codes only, so they have no domain code of their own.
 */
export const SEARCH_ROUTES: Readonly<Record<SearchRouteName, PlaybookRoute>> = Object.freeze({
  searchMoments: route({
    method: 'POST',
    path: '/playbook/search/moments',
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ['request.invalid', 'server.timeout', 'server.unavailable'],
    description:
      "Finds Moments in the Organization's won Deals that resemble the conversation so far, so the Copilot can show what worked. The body is the latest turns (1 to 6, each a role of rep or prospect and its text, at most 2000 characters in all) and an optional limit (1 to 20, default 5). It answers the best matches, best first, at most 20, each with the opaque callId and dealRecordId, a score and two snippets of at most 512 characters (what the Prospect said and what the Rep said next), and evidence: the number of candidate Moments and the distinct won Deals among them. The evidence counts only the over-fetched candidate window (the best min(100, limit x 5) Moments by similarity, after the eligibility checks), not every won Deal in the Organization. There is no cursor: the result is a bounded top-k. Only Moments of Calls whose Deal is won and whose Call is in search are returned, and only from the caller's Organization. It never returns the customer's dealId, name or amount. The request and the snippets are tenant conversation text and are never logged. It only reads, so it takes no Idempotency-Key and a repeat is harmless. request.invalid (400) for a body outside the bounds; server.timeout (504) when it takes too long; server.unavailable (503) with a Retry-After header when the embedding model or the vector store cannot answer. Owner and Admin only, as for all sales history (the owner's decision of 2026-10-13); a Manager or a Rep gets auth.forbidden, because a Rep sees only their own conversations. The phase-2 Copilot calls this service-to-service, not with a Rep's token.",
  }),
  searchDocuments: route({
    method: 'POST',
    path: '/playbook/search/documents',
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ['request.invalid', 'server.timeout', 'server.unavailable'],
    description:
      "Finds passages in the Organization's Playbook documents that resemble the conversation so far, so a Rep can see what the company's own material says. The body is the same as for the Moments search: the latest turns (1 to 6, each a role of rep or prospect and its text, at most 2000 characters in all) and an optional limit (1 to 20, default 5). It answers the best passages, best first, at most 20, one item per chunk, each with the documentId, the document's fileName (the Organization's own file name), the page (the 1-based page for a paginated format such as PDF, null for a format without pages such as TXT, MD or DOCX and anything else the parser reads as one page; the service decides by media type), a score and a snippet of at most 512 characters, and evidence: the number of candidate chunks that survive the staleness check and the distinct documents among them. The evidence counts only the over-fetched candidate window (the best min(100, limit x 5) chunks by similarity, after the staleness check), not every document in the Organization. The query is embedded with documentQueryText (the turns trimmed and joined by a newline, no role labels), because document chunks are embedded as plain text. There is no cursor: the result is a bounded top-k. Only chunks of documents that are ready and not replaced are returned, and only from the caller's Organization. The request and the snippets are the Organization's own conversation and sales text and are never logged. It only reads, so it takes no Idempotency-Key and a repeat is harmless. request.invalid (400) for a body outside the bounds; server.timeout (504) when it takes too long; server.unavailable (503) with a Retry-After header when the embedding model or the vector store cannot answer. Every role that reads the Playbook (Owner, Admin, Manager and Rep) may call it, because the text is the Organization's own sales material; any other is auth.forbidden.",
  }),
})
