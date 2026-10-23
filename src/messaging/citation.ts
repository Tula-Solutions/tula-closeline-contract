import { z } from 'zod'
import { timestampSchema } from '../core/values'
import {
  callIdSchema,
  dealRecordIdSchema,
  documentIdSchema,
  prospectIdSchema,
  signalIdSchema,
} from '../ids'
import { MAX_DOCUMENT_PAGES } from '../playbook/values'
import { prospectFieldNameSchema } from '../prospect/values'
import { citationUrlSchema } from './values'

/**
 * What a statement or a Draft sentence rests on. One of: a field of the Prospect's own record, a
 * dated buying signal, a web page read at a time, a Moment of a won Deal, or a page of a Playbook
 * document. Unknown fields are dropped, so a customer's deal identifier, name or amount cannot ride
 * along on a Citation. Playbook ids are opaque; the text behind them is fetched with the
 * Playbook's citation resolve route.
 */
export const citationSourceSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('prospect_field'),
    prospectId: prospectIdSchema,
    field: prospectFieldNameSchema,
  }),
  z.object({ kind: z.literal('signal'), signalId: signalIdSchema, observedAt: timestampSchema }),
  z.object({ kind: z.literal('web_page'), url: citationUrlSchema, retrievedAt: timestampSchema }),
  z.object({ kind: z.literal('moment'), callId: callIdSchema, dealRecordId: dealRecordIdSchema }),
  z.object({
    kind: z.literal('document'),
    documentId: documentIdSchema,
    page: z.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
  }),
])

/** What a statement or a Draft sentence rests on. */
export type CitationSource = z.infer<typeof citationSourceSchema>

/**
 * A Citation on a Draft: its source and whether it `applies` to the text as it stands (false once
 * an edit removed or changed the sentence it supported). A Moment or document Citation also has
 * the similarity `score` the search gave it. Unknown fields are dropped. Model-generated text is
 * untrusted data, so a Draft is read together with its Citations, never alone.
 */
export const draftCitationSchema = z.intersection(
  citationSourceSchema,
  z.object({ applies: z.boolean(), score: z.number().finite().optional() })
)

/** A Citation on a Draft. */
export type DraftCitation = z.infer<typeof draftCitationSchema>
