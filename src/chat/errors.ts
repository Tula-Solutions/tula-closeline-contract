import { defineErrors } from '../errors'

/**
 * The errors the Chat routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`. A Chat of another Organization, or one the caller may not see, is
 * `chat.not_found` (404, never 403). The public routes answer an unknown, expired or rotated
 * secret exactly as one that never existed.
 *
 * - `chat.origin_not_allowed` (403): the `Origin` of a public request is not one the Organization
 *   allowed. Nothing is stored.
 * - `chat.key_invalid` (404): the publishable key is unknown, rotated away or its embed is not live.
 * - `chat.session_not_found` (404): the session token is unknown or expired.
 * - `chat.session_closed` (409): the Chat has ended (closed, or handed to a Rep and finished); start another.
 * - `chat.consent_wording_missing` (422): the wording id and version sent are not the Consent
 *   Wording the Chat displays. No consent is recorded.
 * - `chat.not_found` (404): the Chat is unknown or not the caller's to see.
 */
export const CHAT_ERRORS = {
  ...defineErrors('chat', {
    origin_not_allowed: { status: 403, message: 'This site is not allowed to start a Chat.' },
    key_invalid: { status: 404, message: 'The Chat was not found.' },
    session_not_found: { status: 404, message: 'The Chat session was not found.' },
    session_closed: { status: 409, message: 'This Chat has ended.' },
    consent_wording_missing: {
      status: 422,
      message: 'The consent wording shown with the Chat is missing or out of date.',
    },
    not_found: { status: 404, message: 'The Chat was not found.' },
  }),
} as const

/** A Chat error code. */
export type ChatErrorCode = keyof typeof CHAT_ERRORS
