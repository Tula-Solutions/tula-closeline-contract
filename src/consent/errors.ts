import { defineErrors } from '../errors'

/**
 * The errors the consent routes return, as `area.reason` codes.
 *
 * - `consent.not_found` (404): a Consent Wording, form, Suppression entry or import that does not
 *   exist or belongs to another Organization; `details.resource` is `wording`, `form`, `entry` or
 *   `import`. An unknown Prospect is `prospect.not_found`.
 * - `consent.wording_locked` (409): the wording is referenced by a consent event or a published
 *   form, so it cannot be edited; write a new version.
 * - `consent.invalid_token` (400): the token of a public route is tampered, expired or unknown. It
 *   never says which, and never echoes an address.
 * - `consent.entry_not_removable` (409): only a `manual` Suppression entry can be removed.
 * - `consent.missing`, `consent.withdrawn`, `consent.suppressed` and `consent.unavailable` are the
 *   denial codes of a Contact Check. They are results (see `CONTACT_DENIAL_CODES`), never the error
 *   of a route; they sit in this registry so every service names them the same way. The status
 *   shown is for a caller that chooses to surface a denial over HTTP; `consent.unavailable` is
 *   synthesised by the kit's client, never answered by core.
 */
export const CONSENT_ERRORS = {
  ...defineErrors('consent', {
    not_found: {
      status: 404,
      message: 'The requested Consent Wording, form, Suppression entry or import was not found.',
    },
    missing: { status: 403, message: 'There is no Contact Consent for this contact.' },
    withdrawn: { status: 403, message: 'The Contact Consent for this contact was withdrawn.' },
    suppressed: { status: 403, message: 'This contact is on the Suppression list.' },
    unavailable: { status: 503, message: 'The Contact Check could not be completed.' },
    wording_locked: {
      status: 409,
      message: 'This Consent Wording is in use and cannot be edited. Write a new version.',
    },
    invalid_token: { status: 400, message: 'This link is not valid or has expired.' },
    entry_not_removable: {
      status: 409,
      message: 'Only a manually added Suppression entry can be removed.',
    },
  }),
} as const

/** A consent error code. */
export type ConsentErrorCode = keyof typeof CONSENT_ERRORS
