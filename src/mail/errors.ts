import { defineErrors } from '../errors'

/**
 * The errors the mail routes return, as `area.reason` codes. A role that is not allowed is the
 * common `auth.forbidden`. A Mailbox of another Organization, or one the caller may not see (a
 * Rep's view of another Rep's Mailbox), is `mailbox.not_found` (404, never 403), and the same
 * holds for send records, so existence is not revealed. A refused send is never the provider's
 * text: only these codes.
 *
 * - `mailbox.not_found` (404): unknown or not the caller's to see.
 * - `mailbox.not_connected` (409): the Mailbox is disconnected, or none is connected to send from.
 * - `mailbox.limit_reached` (429): a per-day, per-hour or minimum-gap limit stops the send now;
 *   `details` carries which and `retryAfter` (the `Retry-After` header too).
 * - `mailbox.paused` (409): the Mailbox is paused by a person or automatically; nothing is sent.
 * - `mailbox.auth_revoked` (409): the provider revoked or expired the grant; the Mailbox is
 *   `disconnected` until its owner reconnects.
 * - `mailbox.already_connected` (409): the address is already a connected Mailbox of the
 *   Organization.
 * - `mailbox.limit_above_ceiling` (422): a limit is above the Organization's ceiling or its gap
 *   below the floor.
 * - `mailbox.oauth_state_invalid` (400): the connection attempt is unknown, expired, already used
 *   or another person's.
 * - `send.suppressed` (409): core says the Prospect's address is suppressed; nothing was sent.
 * - `send.no_consent` (409): the channel needs a Contact Consent the Prospect has not given.
 * - `send.unverified_address` (422): the address is not verified and the Admin did not accept
 *   unverified ones.
 * - `send.outside_window` (409): the Campaign's or Mailbox's send window is closed; the send is
 *   deferred to the next opening.
 * - `send.duplicate` (409): that send key was already used; the earlier record stands.
 * - `send.campaign_not_running` (409): the Campaign is not running.
 * - `send.organization_cap_reached` (429): the Organization's daily cap across Mailboxes is used.
 * - `send.not_found` (404): the send record is unknown or not the caller's to see.
 * - `unsubscribe.invalid_token` (400): the token of a public unsubscribe route is tampered,
 *   expired or unknown. It answers the same for all three and never says which.
 */
export const MAIL_ERRORS = {
  ...defineErrors('mailbox', {
    not_found: { status: 404, message: 'The Mailbox was not found.' },
    not_connected: { status: 409, message: 'The Mailbox is not connected.' },
    limit_reached: {
      status: 429,
      message: 'The Mailbox has reached a sending limit. Try again later.',
    },
    paused: { status: 409, message: 'The Mailbox is paused.' },
    auth_revoked: {
      status: 409,
      message: 'The email provider no longer allows access. Reconnect the Mailbox.',
    },
    already_connected: { status: 409, message: 'This address is already a connected Mailbox.' },
    limit_above_ceiling: {
      status: 422,
      message: 'A limit is outside what the Organization allows.',
    },
    oauth_state_invalid: {
      status: 400,
      message: 'This connection attempt is not valid or has expired. Start again.',
    },
  }),
  ...defineErrors('send', {
    suppressed: { status: 409, message: 'This address must not be contacted.' },
    no_consent: { status: 409, message: 'There is no consent to contact this Prospect by email.' },
    unverified_address: { status: 422, message: 'The address has not been verified.' },
    outside_window: {
      status: 409,
      message: 'The send window is closed. The send waits for it to open.',
    },
    duplicate: { status: 409, message: 'This message was already sent or is being sent.' },
    campaign_not_running: { status: 409, message: 'The Campaign is not running.' },
    organization_cap_reached: {
      status: 429,
      message: 'The Organization has reached its daily sending cap. Try again tomorrow.',
    },
    not_found: { status: 404, message: 'The send record was not found.' },
  }),
  ...defineErrors('unsubscribe', {
    invalid_token: { status: 400, message: 'This link is not valid or has expired.' },
  }),
} as const

/** A mail error code. */
export type MailErrorCode = keyof typeof MAIL_ERRORS
