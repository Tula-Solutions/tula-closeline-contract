import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { MAX_EMAIL_LENGTH } from '../email'
import { enrichmentRunIdSchema, prospectIdSchema } from '../ids'
import { type InboundRoute, inboundRoute } from '../inbound-route'
import {
  boundedTextSchema,
  MAX_PROSPECT_COMPANY_NAME_LENGTH,
  MAX_PROSPECT_FIELD_VALUE_LENGTH,
  MAX_PROSPECT_JOB_TITLE_LENGTH,
  MAX_PROSPECT_NAME_PART_LENGTH,
} from '../prospect/values'
import type { EnrichmentErrorCode } from './errors'
import { ENRICHED_FIELDS, enrichedFieldNameSchema, providerKeySchema } from './values'

/*
 * The calls the outbound service makes to core to enrich a Prospect. They are not part of core's
 * public API: they are served on the internal network only and called with a service token whose
 * audience is `outbound`. The Organization is the token's subject, never a path, query or body
 * field. Requests are strict; responses strip keys they do not name, so core must send the output
 * of `Schema.parse(row)`, never the row.
 */

/** The most fields one write carries: one entry per enrichable field, none twice. */
export const MAX_ENRICHED_FIELD_WRITES = ENRICHED_FIELDS.length

/** Internal: the path parameters of an enrichment input read; the Prospect is in the path. */
export const enrichmentInputParamsSchema = z.strictObject({
  prospectId: prospectIdSchema,
})

/** Internal: the path parameters of an enrichment input read. */
export type EnrichmentInputParams = z.infer<typeof enrichmentInputParamsSchema>

/**
 * Internal: what outbound needs to look a Prospect up with a provider: the identity and company
 * fields core holds (`null` for one it does not) and `presentFields`, the enrichable fields that
 * already have a value, so outbound can skip a provider call for them. Values are untrusted text.
 */
export const enrichmentInputResponseSchema = z.object({
  prospectId: prospectIdSchema,
  email: z.string().max(MAX_EMAIL_LENGTH).nullable(),
  firstName: z.string().max(MAX_PROSPECT_NAME_PART_LENGTH).nullable(),
  lastName: z.string().max(MAX_PROSPECT_NAME_PART_LENGTH).nullable(),
  jobTitle: z.string().max(MAX_PROSPECT_JOB_TITLE_LENGTH).nullable(),
  companyName: z.string().max(MAX_PROSPECT_COMPANY_NAME_LENGTH).nullable(),
  companyDomain: z.string().max(253).nullable(),
  presentFields: z.array(enrichedFieldNameSchema).max(MAX_ENRICHED_FIELD_WRITES),
})

/** Internal: the answer to an enrichment input read. */
export type EnrichmentInputResponse = z.infer<typeof enrichmentInputResponseSchema>

/** Internal: the path parameters of an enriched-fields write; the Prospect is in the path. */
export const writeEnrichedFieldsParamsSchema = z.strictObject({
  prospectId: prospectIdSchema,
})

/** Internal: the path parameters of an enriched-fields write. */
export type WriteEnrichedFieldsParams = z.infer<typeof writeEnrichedFieldsParamsSchema>

/** Internal: one value a provider found for one field, with where and how surely it was found. */
export const enrichedFieldWriteSchema = z.strictObject({
  field: enrichedFieldNameSchema,
  value: boundedTextSchema(MAX_PROSPECT_FIELD_VALUE_LENGTH),
  provider: providerKeySchema,
  confidence: z.number().min(0).max(1),
  obtainedAt: timestampSchema,
})

/** Internal: one value a provider found for one field. */
export type EnrichedFieldWrite = z.infer<typeof enrichedFieldWriteSchema>

/**
 * Internal: `POST /internal/v1/prospects/{prospectId}/enriched-fields`, the body of the call
 * outbound makes to hand core what a run found: 1 to 11 fields, none named twice. `runId` is the
 * enrichment run and the idempotency key. Source and actor are never read from the body; core sets
 * them (see `ENRICHMENT_INTERNAL_ROUTES`).
 */
export const writeEnrichedFieldsRequestSchema = z
  .strictObject({
    runId: enrichmentRunIdSchema,
    fields: z.array(enrichedFieldWriteSchema).min(1).max(MAX_ENRICHED_FIELD_WRITES),
  })
  .refine((body) => new Set(body.fields.map((f) => f.field)).size === body.fields.length, {
    message: 'A field may be named once',
    path: ['fields'],
  })

/** Internal: the body of an enriched-fields write. */
export type WriteEnrichedFieldsRequest = z.infer<typeof writeEnrichedFieldsRequestSchema>

/** What core did with a field: `written` became the current value, `suggested` was kept beside the current one. */
export const ENRICHED_FIELD_APPLICATIONS = ['written', 'suggested'] as const

/** What core did with one enriched field. */
export const enrichedFieldApplicationSchema = z.enum(ENRICHED_FIELD_APPLICATIONS)

/** What core did with one enriched field. */
export type EnrichedFieldApplication = z.infer<typeof enrichedFieldApplicationSchema>

/** Internal: the answer to an enriched-fields write: one result per field sent, in no fixed order. */
export const writeEnrichedFieldsResponseSchema = z.object({
  results: z
    .array(
      z.object({
        field: enrichedFieldNameSchema,
        application: enrichedFieldApplicationSchema,
      })
    )
    .max(MAX_ENRICHED_FIELD_WRITES),
})

/** Internal: the answer to an enriched-fields write. */
export type WriteEnrichedFieldsResponse = z.infer<typeof writeEnrichedFieldsResponseSchema>

/** The internal enrichment route names. */
export type EnrichmentInternalRouteName = 'getEnrichmentInput' | 'writeEnrichedFields'

/** One internal enrichment route. */
export type EnrichmentInternalRoute = InboundRoute<EnrichmentErrorCode>

const SCOPE =
  "Internal: served on the internal network only and called with a service token whose audience is outbound; any other caller, including a user token, is auth.forbidden (403). The Organization is the service token's subject, never a path, query or body field. A Prospect that is unknown, or of another Organization, is enrichment.prospect_not_found (404), never 403."

/**
 * The routes outbound calls on core to enrich a Prospect (spec M05): read what to look up, write
 * what a provider found. Internal, with a service token; unlike `ENRICHMENT_ROUTES` they are not
 * outbound's own API but core's.
 */
export const ENRICHMENT_INTERNAL_ROUTES: Readonly<
  Record<EnrichmentInternalRouteName, EnrichmentInternalRoute>
> = Object.freeze({
  getEnrichmentInput: inboundRoute({
    method: 'GET',
    path: '/internal/v1/prospects/{prospectId}/enrichment-input',
    roles: [],
    internal: true,
    serviceToken: { audiences: ['outbound'] },
    success: [200],
    idempotent: false,
    errors: ['enrichment.prospect_not_found'],
    commonErrors: [
      'request.invalid',
      'auth.unauthenticated',
      'auth.forbidden',
      'server.unavailable',
    ],
    description: `Reads what outbound needs to enrich one Prospect: email, first and last name, job title, company name and company domain (each null when core holds none) and presentFields, the enrichable fields that already have a value. Values are untrusted text and are never logged. ${SCOPE}`,
  }),
  writeEnrichedFields: inboundRoute({
    method: 'POST',
    path: '/internal/v1/prospects/{prospectId}/enriched-fields',
    roles: [],
    internal: true,
    serviceToken: { audiences: ['outbound'] },
    success: [200],
    idempotent: true,
    errors: ['enrichment.prospect_not_found'],
    commonErrors: [
      'request.invalid',
      'auth.unauthenticated',
      'auth.forbidden',
      'server.unavailable',
    ],
    description: `Hands core the values a provider found for one Prospect: 1 to 11 fields, none named twice, each with its provider slug (lower-case letters, digits and underscores, starting with a letter, at most 32 characters, so that enrichment:<provider> is a valid Source kind), confidence (0 to 1) and the time it was obtained. Core records the Source as enrichment:<provider> and sets the actor itself; the body never carries a source or an actor. A value is written when no own import or manual value exists for the field; when one does, the value is kept beside it as suggested and the current value is unchanged (ADR 0020). The answer lists written or suggested for every field sent. The route is idempotent on (prospectId, runId): runId is the idempotency key and no Idempotency-Key header is needed, so a replay writes nothing new and returns the original results, even if its body differs. Values are untrusted text, shown to people and never run as an instruction or logged. ${SCOPE}`,
  }),
})
