import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { emailSchema } from '../email'
import { membershipIdSchema, prospectCompanyIdSchema, prospectIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  boundedTextSchema,
  fieldHistoryEntrySchema,
  fieldValueSchema,
  MAX_PROSPECT_SEARCH_LENGTH,
  prospectCompanyDomainSchema,
  prospectCompanyEmployeeCountSchema,
  prospectCompanyFieldNameSchema,
  prospectCompanyIndustrySchema,
  prospectCompanyNameSchema,
  prospectCompanyRegionSchema,
  prospectCompanyTechnologiesSchema,
  prospectFieldNameSchema,
  prospectJobTitleSchema,
  prospectNamePartSchema,
  prospectNotesSchema,
  prospectTagsSchema,
  rawLinkedinUrlSchema,
  rawPhoneSchema,
  sourceKindSchema,
} from './values'

/** The states of a Prospect: `active`, or `archived` to hide it from the default list without erasing it. */
export const PROSPECT_STATUSES = ['active', 'archived'] as const

/** The state of a Prospect. */
export const prospectStatusSchema = z.enum(PROSPECT_STATUSES)

/** The state of a Prospect. */
export type ProspectStatus = z.infer<typeof prospectStatusSchema>

/**
 * A Prospect as core returns it. `fields` holds the current value of each field that has one, with
 * its Source, time and actor (ADR 0020); a field with no value is absent. `email`, `phone` and
 * `linkedinUrl` are the normalised identity values (ADR 0011: ASCII-folded email, E.164 phone,
 * normalised LinkedIn address). `source` is the Source kind that created the Prospect.
 * `ownerMembershipId` is the owner Rep's Membership, `null` while unassigned.
 */
export const prospectSchema = z.object({
  id: prospectIdSchema,
  companyId: prospectCompanyIdSchema.nullable(),
  ownerMembershipId: membershipIdSchema.nullable(),
  status: prospectStatusSchema,
  source: sourceKindSchema,
  tags: prospectTagsSchema,
  notes: z.string().min(1).max(5000).nullable(),
  fields: z.partialRecord(prospectFieldNameSchema, fieldValueSchema),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

/** A Prospect as core returns it. */
export type Prospect = z.infer<typeof prospectSchema>

/** The path parameters of a request about one Prospect. */
export const prospectParamsSchema = z.strictObject({ prospectId: prospectIdSchema })

/** The path parameters of a request about one Prospect. */
export type ProspectParams = z.infer<typeof prospectParamsSchema>

const hasPersonalField = (body: {
  firstName?: unknown
  lastName?: unknown
  email?: unknown
  phone?: unknown
  linkedinUrl?: unknown
}) =>
  body.firstName !== undefined ||
  body.lastName !== undefined ||
  body.email !== undefined ||
  body.phone !== undefined ||
  body.linkedinUrl !== undefined

/**
 * The body of a request to create a Prospect by hand. It must carry at least one of a name, an
 * email, a phone or a LinkedIn address. The Source is `manual` and the actor the caller, both set
 * by core, never read from the body, so an unknown field such as `source` is refused. A Rep is the
 * owner of the Prospect they create; only Owner and Admin may name another `ownerMembershipId`,
 * and anyone else gets `prospect.forbidden_owner`. An identity another Prospect of the
 * Organization already has is `prospect.duplicate_identity`. The call accepts an `Idempotency-Key`
 * header (`idempotencyKeySchema`): a replay returns the original Prospect.
 */
export const createProspectRequestSchema = z
  .strictObject({
    firstName: prospectNamePartSchema.optional(),
    lastName: prospectNamePartSchema.optional(),
    jobTitle: prospectJobTitleSchema.optional(),
    email: emailSchema.optional(),
    phone: rawPhoneSchema.optional(),
    linkedinUrl: rawLinkedinUrlSchema.optional(),
    companyId: prospectCompanyIdSchema.optional(),
    ownerMembershipId: membershipIdSchema.optional(),
    tags: prospectTagsSchema.optional(),
    notes: prospectNotesSchema.optional(),
  })
  .refine(hasPersonalField, 'Give at least a name, an email, a phone or a LinkedIn address')

/** The body of a request to create a Prospect. */
export type CreateProspectRequest = z.infer<typeof createProspectRequestSchema>

/**
 * The body of a request to edit a Prospect. Only the fields sent change; each is written with the
 * Source `manual`, which beats every other Source (ADR 0020). A `null` clears a field or the
 * Prospect Company, the explicit Rep or Admin action that is the only way to remove a manual
 * value. At least one field is required. Ownership is changed by the owner routes, not here.
 */
export const updateProspectRequestSchema = z
  .strictObject({
    firstName: prospectNamePartSchema.nullable().optional(),
    lastName: prospectNamePartSchema.nullable().optional(),
    jobTitle: prospectJobTitleSchema.nullable().optional(),
    email: emailSchema.nullable().optional(),
    phone: rawPhoneSchema.nullable().optional(),
    linkedinUrl: rawLinkedinUrlSchema.nullable().optional(),
    companyId: prospectCompanyIdSchema.nullable().optional(),
    status: prospectStatusSchema.optional(),
    tags: prospectTagsSchema.optional(),
    notes: prospectNotesSchema.nullable().optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), 'Send a change')

/** The body of a request to edit a Prospect. */
export type UpdateProspectRequest = z.infer<typeof updateProspectRequestSchema>

/** The search text of a list request: trimmed, 1 to 100 characters, matched against name, email and company. */
export const prospectSearchSchema = boundedTextSchema(MAX_PROSPECT_SEARCH_LENGTH)

/**
 * The query parameters of a request to list Prospects: a cursor and a limit of at most 100, and
 * optionally `ownerMembershipId`, `source` (the Source kind that created it), `companyId`,
 * `status` and `q`. An unknown parameter is refused. Who sees which Prospect is decided from the
 * token's role and Team membership (a Rep sees what they own, a Manager what their Team's Reps
 * own, Owner and Admin all); a filter can narrow that, never widen it.
 */
export const listProspectsQuerySchema = pageQuerySchema
  .extend({
    ownerMembershipId: membershipIdSchema.optional(),
    source: sourceKindSchema.optional(),
    companyId: prospectCompanyIdSchema.optional(),
    status: prospectStatusSchema.optional(),
    q: prospectSearchSchema.optional(),
  })
  .strict()

/** The query parameters of a request to list Prospects. */
export type ListProspectsQuery = z.infer<typeof listProspectsQuerySchema>

/** One page of Prospects, newest first (by `createdAt`, then id, both descending). */
export const listProspectsResponseSchema = pageSchema(prospectSchema)

/** One page of Prospects. */
export type ListProspectsResponse = z.infer<typeof listProspectsResponseSchema>

/** The position in a Prospect list: where the last item of the page was. */
export const prospectCursorSchema = z.strictObject({
  createdAt: timestampSchema,
  id: prospectIdSchema,
})

/** The position in a Prospect list. */
export type ProspectCursor = z.infer<typeof prospectCursorSchema>

/** The path parameters of a request for the history of one Prospect field. */
export const prospectFieldParamsSchema = z.strictObject({
  prospectId: prospectIdSchema,
  field: prospectFieldNameSchema,
})

/** The path parameters of a request for the history of one Prospect field. */
export type ProspectFieldParams = z.infer<typeof prospectFieldParamsSchema>

/** The query parameters of a request for a field's history: a page. */
export const listFieldHistoryQuerySchema = pageQuerySchema.strict()

/** The query parameters of a request for a field's history. */
export type ListFieldHistoryQuery = z.infer<typeof listFieldHistoryQuerySchema>

/** One page of a field's history, newest first; the current value, earlier values and enrichment suggestions all appear, each with its Source. */
export const listFieldHistoryResponseSchema = pageSchema(fieldHistoryEntrySchema)

/** One page of a field's history. */
export type ListFieldHistoryResponse = z.infer<typeof listFieldHistoryResponseSchema>

/** The position in a field's history. */
export const fieldHistoryCursorSchema = z.strictObject({
  setAt: timestampSchema,
  seq: z.number().int().min(0),
})

/** The position in a field's history. */
export type FieldHistoryCursor = z.infer<typeof fieldHistoryCursorSchema>

/**
 * The body of a request to change a Prospect's owner Rep. The new owner must be a Rep or Manager
 * of the same Organization, else `prospect.forbidden_owner`. Owner and Admin only.
 */
export const setProspectOwnerRequestSchema = z.strictObject({
  ownerMembershipId: membershipIdSchema,
})

/** The body of a request to change a Prospect's owner. */
export type SetProspectOwnerRequest = z.infer<typeof setProspectOwnerRequestSchema>

/** The most Prospects one bulk assignment may name. */
export const MAX_BULK_ASSIGN_PROSPECTS = 5000

/** Up to this many Prospects of a bulk assignment are applied before the call answers; more are queued and answered 202. */
export const BULK_ASSIGN_SYNC_LIMIT = 500

/**
 * The body of a request to assign many Prospects to one owner: 1 to 5,000 distinct ids. Up to 500
 * are applied at once (200); more are queued (202). A Prospect that does not exist or is not
 * visible is not named in the answer, only counted as `skipped`. Accepts an `Idempotency-Key`
 * header: a retry changes nothing twice.
 */
export const bulkAssignProspectsRequestSchema = z.strictObject({
  prospectIds: z
    .array(prospectIdSchema)
    .min(1)
    .max(MAX_BULK_ASSIGN_PROSPECTS)
    .refine((ids) => new Set(ids).size === ids.length, 'No duplicate ids'),
  ownerMembershipId: membershipIdSchema,
})

/** The body of a request to assign many Prospects. */
export type BulkAssignProspectsRequest = z.infer<typeof bulkAssignProspectsRequestSchema>

/** The answer to a bulk assignment: `applied` counts when it ran at once, `queued` when it was handed to a job (then the counts are `null`). */
export const bulkAssignProspectsResponseSchema = z
  .object({
    state: z.enum(['applied', 'queued']),
    requested: z.number().int().min(1).max(MAX_BULK_ASSIGN_PROSPECTS),
    assigned: z.number().int().min(0).max(MAX_BULK_ASSIGN_PROSPECTS).nullable(),
    skipped: z.number().int().min(0).max(MAX_BULK_ASSIGN_PROSPECTS).nullable(),
  })
  .refine(
    (body) =>
      body.state === 'applied'
        ? body.assigned !== null && body.skipped !== null
        : body.assigned === null && body.skipped === null,
    'The counts are set exactly when the assignment was applied'
  )

/** The answer to a bulk assignment. */
export type BulkAssignProspectsResponse = z.infer<typeof bulkAssignProspectsResponseSchema>

/** The answer to an erasure request: it is a queued job, so the Prospect is gone once `prospect.erased` is published. Carries no personal data. */
export const eraseProspectResponseSchema = z.object({
  prospectId: prospectIdSchema,
  state: z.literal('queued'),
})

/** The answer to an erasure request. */
export type EraseProspectResponse = z.infer<typeof eraseProspectResponseSchema>

/**
 * A Prospect Company as core returns it: the fields with their Source, time and actor. `domain` is
 * the normalised domain (ASCII-folded host). `name` is always present. `employeeCount` is a decimal
 * string and `technologies` JSON text of a list of strings; the other fields may be absent.
 */
export const prospectCompanySchema = z.object({
  id: prospectCompanyIdSchema,
  fields: z.object({
    name: fieldValueSchema,
    domain: fieldValueSchema.optional(),
    industry: fieldValueSchema.optional(),
    employeeCount: fieldValueSchema.optional(),
    region: fieldValueSchema.optional(),
    technologies: fieldValueSchema.optional(),
  }),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

/** A Prospect Company as core returns it. */
export type ProspectCompany = z.infer<typeof prospectCompanySchema>

/** The path parameters of a request about one Prospect Company. */
export const prospectCompanyParamsSchema = z.strictObject({ companyId: prospectCompanyIdSchema })

/** The path parameters of a request about one Prospect Company. */
export type ProspectCompanyParams = z.infer<typeof prospectCompanyParamsSchema>

/** The path parameters of a request for the history of one Prospect Company field. */
export const prospectCompanyFieldParamsSchema = z.strictObject({
  companyId: prospectCompanyIdSchema,
  field: prospectCompanyFieldNameSchema,
})

/** The path parameters of a request for the history of one Prospect Company field. */
export type ProspectCompanyFieldParams = z.infer<typeof prospectCompanyFieldParamsSchema>

/**
 * The body of a request to create a Prospect Company, written with the Source `manual`. Accepts an
 * `Idempotency-Key` header: a replay returns the original record.
 */
export const createProspectCompanyRequestSchema = z.strictObject({
  name: prospectCompanyNameSchema,
  domain: prospectCompanyDomainSchema.optional(),
  industry: prospectCompanyIndustrySchema.optional(),
  region: prospectCompanyRegionSchema.optional(),
  employeeCount: prospectCompanyEmployeeCountSchema.optional(),
  technologies: prospectCompanyTechnologiesSchema.optional(),
})

/** The body of a request to create a Prospect Company. */
export type CreateProspectCompanyRequest = z.infer<typeof createProspectCompanyRequestSchema>

/** The body of a request to edit a Prospect Company: only the fields sent change, written with the Source `manual`; `null` clears the domain, industry, region, employee count or technologies. At least one field is required. */
export const updateProspectCompanyRequestSchema = z
  .strictObject({
    name: prospectCompanyNameSchema.optional(),
    domain: prospectCompanyDomainSchema.nullable().optional(),
    industry: prospectCompanyIndustrySchema.nullable().optional(),
    region: prospectCompanyRegionSchema.nullable().optional(),
    employeeCount: prospectCompanyEmployeeCountSchema.nullable().optional(),
    technologies: prospectCompanyTechnologiesSchema.nullable().optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), 'Send a change')

/** The body of a request to edit a Prospect Company. */
export type UpdateProspectCompanyRequest = z.infer<typeof updateProspectCompanyRequestSchema>

/** The query parameters of a request to list Prospect Companies: a page and optionally a `q` search on name and domain. An unknown parameter is refused. */
export const listProspectCompaniesQuerySchema = pageQuerySchema
  .extend({ q: prospectSearchSchema.optional() })
  .strict()

/** The query parameters of a request to list Prospect Companies. */
export type ListProspectCompaniesQuery = z.infer<typeof listProspectCompaniesQuerySchema>

/** One page of Prospect Companies, newest first (by `createdAt`, then id, both descending). */
export const listProspectCompaniesResponseSchema = pageSchema(prospectCompanySchema)

/** One page of Prospect Companies. */
export type ListProspectCompaniesResponse = z.infer<typeof listProspectCompaniesResponseSchema>

/** The position in a Prospect Company list. */
export const prospectCompanyCursorSchema = z.strictObject({
  createdAt: timestampSchema,
  id: prospectCompanyIdSchema,
})

/** The position in a Prospect Company list. */
export type ProspectCompanyCursor = z.infer<typeof prospectCompanyCursorSchema>
