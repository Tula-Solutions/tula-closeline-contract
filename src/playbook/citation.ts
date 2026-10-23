import { z } from 'zod'
import { callIdSchema, dealRecordIdSchema, documentIdSchema } from '../ids'
import { PLAYBOOK_READ_ROLES, type PlaybookRoute } from './routes'
import { momentIndexSchema, momentSnippetSchema } from './search'
import { documentFileNameSchema, MAX_DOCUMENT_PAGES } from './values'

/** The most Citations one resolve request names. */
export const MAX_CITATION_REFS = 20

/**
 * What a Citation points at in the Playbook, as the resolve request names it: a Moment of a won
 * Deal (`callId` and `dealRecordId`, opaque ids, and an optional `momentIndex`: absent means the
 * lowest-numbered Moment of the Call) or a page of a Playbook document. Unknown fields
 * are rejected.
 */
export const citationRefSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('moment'),
    callId: callIdSchema,
    dealRecordId: dealRecordIdSchema,
    momentIndex: momentIndexSchema.optional(),
  }),
  z.strictObject({
    kind: z.literal('document'),
    documentId: documentIdSchema,
    page: z.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
  }),
])

/** What a Citation points at in the Playbook. */
export type CitationRef = z.infer<typeof citationRefSchema>

/** The request to resolve Citations: one to `MAX_CITATION_REFS` references, in the order wanted back. */
export const resolveCitationsRequestSchema = z.strictObject({
  refs: z.array(citationRefSchema).min(1).max(MAX_CITATION_REFS),
})

/** The request to resolve Citations. */
export type ResolveCitationsRequest = z.infer<typeof resolveCitationsRequestSchema>

/**
 * One resolved Citation. `available` carries the text to show (snippets of at most 512 characters:
 * what the Prospect said and what the Rep said next for a Moment, the file name and passage for a
 * document). `removed` means the Deal, Call or document is gone, not searchable any more, or not
 * the caller's Organization's: it carries the ids and no text, and unknown fields are dropped, so
 * a removed item cannot leak what it pointed at. It never carries the customer's `dealId`, name or
 * amount. The snippets are tenant text: never logged.
 */
export const resolvedCitationSchema = z.union([
  z.object({
    state: z.literal('available'),
    kind: z.literal('moment'),
    callId: callIdSchema,
    dealRecordId: dealRecordIdSchema,
    momentIndex: momentIndexSchema.optional(),
    prospect: momentSnippetSchema,
    repNext: momentSnippetSchema,
  }),
  z.object({
    state: z.literal('available'),
    kind: z.literal('document'),
    documentId: documentIdSchema,
    page: z.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
    fileName: documentFileNameSchema,
    snippet: momentSnippetSchema,
  }),
  z.object({
    state: z.literal('removed'),
    kind: z.literal('moment'),
    callId: callIdSchema,
    dealRecordId: dealRecordIdSchema,
    momentIndex: momentIndexSchema.optional(),
  }),
  z.object({
    state: z.literal('removed'),
    kind: z.literal('document'),
    documentId: documentIdSchema,
    page: z.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
  }),
])

/** One resolved Citation. */
export type ResolvedCitation = z.infer<typeof resolvedCitationSchema>

/** The answer to a resolve request: one item per reference, in request order. */
export const resolveCitationsResponseSchema = z.object({
  items: z.array(resolvedCitationSchema).min(1).max(MAX_CITATION_REFS),
})

/** The answer to a resolve request. */
export type ResolveCitationsResponse = z.infer<typeof resolveCitationsResponseSchema>

const route = (definition: PlaybookRoute): PlaybookRoute => Object.freeze(definition)

/** The citation routes, by name. */
export type CitationRouteName = 'resolveCitations'

/**
 * The Playbook route that turns Citations back into text (spec M06). It only reads, so it takes no
 * Idempotency-Key. It has no domain error code: an unknown, other-Organization or no-longer-searchable
 * reference is a `removed` item, not an error.
 */
export const CITATION_ROUTES: Readonly<Record<CitationRouteName, PlaybookRoute>> = Object.freeze({
  resolveCitations: route({
    method: 'POST',
    path: '/playbook/citations/resolve',
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ['request.invalid', 'server.timeout', 'server.unavailable'],
    description:
      "Resolves the Citations on a Draft back to the text they point at, so a Rep sees why a sentence was written. The body is refs: one to 20 references, each a Moment (callId, dealRecordId and an optional momentIndex, the 0-based number of the Moment within the Call) or a document page (documentId, page or null). When momentIndex is present, a Moment resolves to that Moment of the Call's current build, or to removed if the current build no longer has it; when it is absent, it resolves to the lowest-numbered Moment of the Call's current build. An item for a Moment echoes the momentIndex it resolved (or was asked for, when removed). It answers one item per reference, in request order. An item is state available, with the snippets of at most 512 characters (what the Prospect said and the Rep said next for a Moment; the file name and passage for a document), or state removed, with the ids only and no text, when the Call, Deal or document was deleted, is no longer searchable, never existed or belongs to another Organization; none of those is an error, so existence is not revealed. It never returns the customer's dealId, name or amount. The snippets are tenant text and are never logged. It only reads, so it takes no Idempotency-Key and a repeat is harmless. request.invalid (400) for a body outside the bounds; server.timeout (504) when it takes too long; server.unavailable (503) with a Retry-After header when the store cannot answer. Every role that reads the Playbook (Owner, Admin, Manager and Rep) may call it; any other is auth.forbidden.",
  }),
})
