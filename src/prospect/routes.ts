import type { CommonErrorCode } from '../errors'
import type { Role } from '../tenancy'
import type { ProspectErrorCode } from './errors'

/** The roles that may do everything to every Prospect: merge, import, erase, assign in bulk. */
export const PROSPECT_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The roles that may create, read and edit Prospects, each within what they may see (a Rep their own, a Manager their Team's Reps', Owner and Admin all). */
export const PROSPECT_ALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The Prospect routes, by name. */
export type ProspectRouteName =
  | 'createProspect'
  | 'listProspects'
  | 'getProspect'
  | 'updateProspect'
  | 'setProspectOwner'
  | 'bulkAssignProspects'
  | 'eraseProspect'
  | 'listProspectFieldHistory'
  | 'createProspectCompany'
  | 'listProspectCompanies'
  | 'getProspectCompany'
  | 'updateProspectCompany'
  | 'listProspectCompanyFieldHistory'
  | 'listProspectDuplicates'
  | 'mergeProspects'
  | 'getProspectMerge'
  | 'undoProspectMerge'
  | 'uploadProspectImport'
  | 'listProspectImports'
  | 'getProspectImport'
  | 'listProspectImportRows'
  | 'downloadProspectImportReport'

/** What the service needs to describe one route: method, path, who may call it, what it answers. */
export type ProspectRoute = {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly path: string
  /** The roles allowed. Any other role is the common `auth.forbidden`. */
  readonly roles: readonly Role[]
  /** The success statuses, the first being the usual one. */
  readonly success: readonly number[]
  /** True when the route accepts an `Idempotency-Key` header. */
  readonly idempotent: boolean
  /** The domain codes the route may return, beyond the common ones. */
  readonly errors: readonly ProspectErrorCode[]
  /** The common codes the route may return, beyond those every route may. */
  readonly commonErrors: readonly CommonErrorCode[]
  /** The description for the OpenAPI document, role rules included. */
  readonly description: string
}

const route = (definition: ProspectRoute): ProspectRoute => Object.freeze(definition)

const IDEMPOTENT_ERRORS = [
  'request.invalid',
  'request.idempotency_key_reused',
  'request.idempotency_in_progress',
] as const

const VISIBILITY =
  'Visibility is decided from the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a record of another Organization.'

/**
 * The Prospect routes (spec M2), described as `SALES_HISTORY_ROUTES` describes its routes. Every
 * route may also return the common `auth.*`, `rate.limited` and `server.*` codes. Every list is
 * cursor-paginated with at most 100 items per page. A record of another Organization is always
 * `prospect.not_found`. Source and actor are set by core from the route and the token, never read
 * from a body.
 */
export const PROSPECT_ROUTES: Readonly<Record<ProspectRouteName, ProspectRoute>> = Object.freeze({
  createProspect: route({
    method: 'POST',
    path: '/v1/prospects',
    roles: PROSPECT_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ['prospect.duplicate_identity', 'prospect.forbidden_owner', 'prospect.not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Creates a Prospect by hand with the Source manual. Every role may; a Rep becomes its owner and only Owner and Admin may name another owner (else prospect.forbidden_owner). An email, phone or LinkedIn address another Prospect already has is prospect.duplicate_identity; the answer names that Prospect only if the caller may see it. A Prospect Company that does not exist is prospect.not_found. Answers 201, or 200 with the original Prospect for a replay of the same Idempotency-Key.',
  }),
  listProspects: route({
    method: 'GET',
    path: '/v1/prospects',
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists Prospects, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100). Filters: ownerMembershipId, source, companyId, status and q (a search on name, email and company). ${VISIBILITY} A filter can narrow what the caller sees, never widen it.`,
  }),
  getProspect: route({
    method: 'GET',
    path: '/v1/prospects/{prospectId}',
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description: `Reads one Prospect with every current field and its Source, time and actor. ${VISIBILITY}`,
  }),
  updateProspect: route({
    method: 'PATCH',
    path: '/v1/prospects/{prospectId}',
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found', 'prospect.duplicate_identity'],
    commonErrors: ['request.invalid'],
    description: `Edits a Prospect; each field sent is written with the Source manual, which beats every other Source (ADR 0020). null clears a field. Changing an identity to one another Prospect has is prospect.duplicate_identity. Owner is changed by setProspectOwner. Publishes prospect.updated once per change. ${VISIBILITY}`,
  }),
  setProspectOwner: route({
    method: 'PUT',
    path: '/v1/prospects/{prospectId}/owner',
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found', 'prospect.forbidden_owner'],
    commonErrors: ['request.invalid'],
    description:
      'Assigns or reassigns the owner Rep. Owner and Admin only. The new owner must be a Rep or Manager of the same Organization, else prospect.forbidden_owner. Idempotent by end state. Publishes prospect.updated.',
  }),
  bulkAssignProspects: route({
    method: 'POST',
    path: '/v1/prospects/assign',
    roles: PROSPECT_ADMIN_ROLES,
    success: [200, 202],
    idempotent: true,
    errors: ['prospect.forbidden_owner'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Assigns up to 5,000 Prospects to one owner. Owner and Admin only. Up to 500 are applied at once (200); more are queued (202) and finish in the background. The owner rules of setProspectOwner apply (prospect.forbidden_owner). Prospects that do not exist are counted as skipped, not named. A retry with the same Idempotency-Key changes nothing twice.',
  }),
  eraseProspect: route({
    method: 'DELETE',
    path: '/v1/prospects/{prospectId}',
    roles: PROSPECT_ADMIN_ROLES,
    success: [202],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Erases a Prospect on request: a queued job deletes its fields, identities and notes, writes a salted-hash suppression entry and publishes prospect.erased, which carries no personal data. Owner and Admin only; a Rep or Manager gets auth.forbidden. Answers 202 at once; the Prospect is then prospect.not_found.',
  }),
  listProspectFieldHistory: route({
    method: 'GET',
    path: '/v1/prospects/{prospectId}/fields/{field}/history',
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description: `Lists one field's history, newest first, cursor-paginated (at most 100): the current value, earlier values and enrichment values kept as suggestions, each with Source, time and actor. At most 50 entries are kept per field. ${VISIBILITY}`,
  }),
  createProspectCompany: route({
    method: 'POST',
    path: '/v1/prospect-companies',
    roles: PROSPECT_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Creates a Prospect Company with the Source manual. Every role may. Answers 201, or 200 with the original record for a replay of the same Idempotency-Key.',
  }),
  listProspectCompanies: route({
    method: 'GET',
    path: '/v1/prospect-companies',
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      'Lists the Organization’s Prospect Companies, newest first, cursor-paginated (at most 100), with an optional q search on name and domain. Every role sees every Prospect Company; a Company carries no Prospect.',
  }),
  getProspectCompany: route({
    method: 'GET',
    path: '/v1/prospect-companies/{companyId}',
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description: 'Reads one Prospect Company with its fields and their Sources.',
  }),
  updateProspectCompany: route({
    method: 'PATCH',
    path: '/v1/prospect-companies/{companyId}',
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Edits a Prospect Company; each field sent is written with the Source manual (ADR 0020). null clears the domain.',
  }),
  listProspectCompanyFieldHistory: route({
    method: 'GET',
    path: '/v1/prospect-companies/{companyId}/fields/{field}/history',
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Lists one Prospect Company field’s history, newest first, cursor-paginated (at most 100), with Source, time and actor.',
  }),
  listProspectDuplicates: route({
    method: 'GET',
    path: '/v1/prospect-duplicates',
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Lists suspected duplicate pairs: Prospects that share a normalised email, phone or LinkedIn address, found from the indexed identities and bounded per request (at most 100 per page, cursor-paginated). Optionally for one prospectId. Owner and Admin only.',
  }),
  mergeProspects: route({
    method: 'POST',
    path: '/v1/prospects/{prospectId}/merges',
    roles: PROSPECT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ['prospect.not_found', 'prospect.merge_conflict'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Merges up to 5 Prospects into the survivor in the path, with a value chosen per field; both histories are kept and links move to the survivor. Owner and Admin only. A Prospect already merged or named twice is prospect.merge_conflict. Publishes prospect.merged. Undo is possible for 30 days.',
  }),
  getProspectMerge: route({
    method: 'GET',
    path: '/v1/prospect-merges/{mergeId}',
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Reads one merge record, including until when it can be undone. Owner and Admin only.',
  }),
  undoProspectMerge: route({
    method: 'POST',
    path: '/v1/prospect-merges/{mergeId}/undo',
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found', 'prospect.merge_conflict'],
    commonErrors: ['request.invalid'],
    description:
      'Reverses a merge, restoring both records exactly as the snapshot holds them. Owner and Admin only. After the 30-day window, or when a record has been merged again, it is prospect.merge_conflict. Undoing an undone merge answers 200 with the record as it is. Takes no body.',
  }),
  uploadProspectImport: route({
    method: 'POST',
    path: '/v1/prospect-imports',
    roles: PROSPECT_ADMIN_ROLES,
    success: [202],
    idempotent: true,
    errors: ['prospect.import_invalid'],
    commonErrors: ['request.too_large', 'request.unsupported_media_type', ...IDEMPOTENT_ERRORS],
    description:
      'Uploads the CSV template (PROSPECT_IMPORT_COLUMNS; up to 10 MB and 50,000 rows) as multipart/form-data with one file part named "file". Owner and Admin only. The type, size and header are checked before anything is stored; a refusal is prospect.import_invalid with details.reason. The rows are processed in a queued, resumable job that matches on the normalised email, writes the Source import and never replaces a manual value. Bad rows are reported, never dropped. Answers 202 with the import; the same Idempotency-Key creates nothing new.',
  }),
  listProspectImports: route({
    method: 'GET',
    path: '/v1/prospect-imports',
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      'Lists the Organization’s imports, newest first, cursor-paginated (at most 100). Owner and Admin only.',
  }),
  getProspectImport: route({
    method: 'GET',
    path: '/v1/prospect-imports/{importId}',
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Reads one import: its state, failure reason and counts, so a page opened mid-job shows live status. Owner and Admin only.',
  }),
  listProspectImportRows: route({
    method: 'GET',
    path: '/v1/prospect-imports/{importId}/rows',
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Reads the report in CSV order, cursor-paginated (at most 100), optionally only one result. Each row has its number, result, reason and Prospect id; no cell of the file is returned. Owner and Admin only.',
  }),
  downloadProspectImportReport: route({
    method: 'GET',
    path: '/v1/prospect-imports/{importId}/report.csv',
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Downloads the report as text/csv with the columns PROSPECT_IMPORT_REPORT_COLUMNS, streamed in pages and never held whole. Owner and Admin only. Contains no cell of the uploaded file.',
  }),
})
