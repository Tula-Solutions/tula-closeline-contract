import { defineErrors } from '../errors'

/**
 * The errors the Inquiry routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`. An Inquiry of another Organization, or one the caller may not see (a
 * Rep's view of another Rep's Inquiry), is `inquiry.not_found` (404, never 403), so existence is
 * not revealed.
 *
 * - `inquiry.origin_not_allowed` (403): the `Origin` of a public request is not one the
 *   Organization allowed for its publishable key. Nothing is stored.
 * - `inquiry.key_invalid` (404): the publishable key is unknown, rotated away or its embed is not
 *   live. It answers exactly as for a key that never existed.
 * - `inquiry.consent_wording_missing` (422): the wording id and version sent are not the Consent
 *   Wording the form is set to display, or the embed has none. The Inquiry is not stored.
 * - `inquiry.embed_invalid` (422): an allowed-origin or wording the Organization cannot use (a
 *   wording that does not exist or does not cover the phone channel).
 * - `inquiry.not_found` (404): the Inquiry is unknown or not the caller's to see.
 */
export const INQUIRY_ERRORS = {
  ...defineErrors('inquiry', {
    origin_not_allowed: { status: 403, message: 'This site is not allowed to send Inquiries.' },
    key_invalid: { status: 404, message: 'The form was not found.' },
    consent_wording_missing: {
      status: 422,
      message: 'The consent wording shown with the form is missing or out of date.',
    },
    embed_invalid: { status: 422, message: 'The embed settings are not valid.' },
    not_found: { status: 404, message: 'The Inquiry was not found.' },
  }),
} as const

/** An Inquiry error code. */
export type InquiryErrorCode = keyof typeof INQUIRY_ERRORS
