import { z } from 'zod'
import { defineErrors } from '../errors'
import { prospectIdSchema } from '../ids'
import { prospectIdentityKindSchema } from './values'

/**
 * The errors the Prospect routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`. A record of another Organization, or one the caller may not see (a
 * Rep's view of another Rep's Prospect), is `prospect.not_found` (404, never 403), so existence is
 * not revealed; `details.resource` names which kind of record it was.
 *
 * - `prospect.duplicate_identity` (409): another Prospect of the Organization already has this
 *   normalised email, phone or LinkedIn address. `details` is {@link duplicateIdentityDetailsSchema};
 *   `prospectId` is present only when the caller may see that Prospect.
 * - `prospect.import_invalid` (422): the upload was refused before anything was stored;
 *   `details.reason` is one of `PROSPECT_IMPORT_INVALID_REASONS`. A bad row is never an HTTP error:
 *   it is a row in the report.
 * - `prospect.merge_conflict` (409): the merge cannot be made or undone, for example a Prospect is
 *   already merged, the same Prospect is named twice, or the thirty-day undo window has passed.
 * - `prospect.forbidden_owner` (403): the named owner is not allowed: a member of another
 *   Organization, someone who is not a Rep or Manager, or a Rep naming someone other than themselves.
 */
export const PROSPECT_ERRORS = {
  ...defineErrors('prospect', {
    not_found: {
      status: 404,
      message: 'The requested Prospect, Prospect Company, import or merge was not found.',
    },
    duplicate_identity: {
      status: 409,
      message: 'Another Prospect already has this email, phone or LinkedIn address.',
    },
    import_invalid: { status: 422, message: 'The import file cannot be accepted.' },
    merge_conflict: {
      status: 409,
      message: 'These Prospects cannot be merged, or this merge cannot be undone.',
    },
    forbidden_owner: { status: 403, message: 'This member cannot own the Prospect.' },
  }),
} as const

/** A code from the {@link PROSPECT_ERRORS} registry. */
export type ProspectErrorCode = keyof typeof PROSPECT_ERRORS

/** The `details` of `prospect.not_found`: which kind of record was not found. */
export const prospectNotFoundDetailsSchema = z.strictObject({
  resource: z.enum(['prospect', 'company', 'import', 'merge']),
})

/** The `details` of `prospect.not_found`. */
export type ProspectNotFoundDetails = z.infer<typeof prospectNotFoundDetailsSchema>

/** The `details` of `prospect.duplicate_identity`: which kind of identity clashed and, when the caller may see it, the other Prospect. */
export const duplicateIdentityDetailsSchema = z.strictObject({
  identityKind: prospectIdentityKindSchema,
  prospectId: prospectIdSchema.optional(),
})

/** The `details` of `prospect.duplicate_identity`. */
export type DuplicateIdentityDetails = z.infer<typeof duplicateIdentityDetailsSchema>
