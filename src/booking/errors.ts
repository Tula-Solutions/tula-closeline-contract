import { defineErrors } from '../errors'

/**
 * The errors the booking, routing and calendar routes return, as `area.reason` codes. A role that
 * is not allowed is the common `auth.forbidden`. A record of another Organization, or one the
 * caller may not see (a Rep's view of another Rep's Booking, a Manager's view outside their Team),
 * is the `not_found` code of its kind (404, never 403), so existence is not revealed. A public
 * route answers a token it does not know as `booking.type_not_found`.
 *
 * - `booking.slot_taken` (409): the time was taken (or became busy) before the Booking was made;
 *   the caller picks another time. Nothing is written.
 * - `booking.calendar_unavailable` (503): the Rep's calendar could not be read or written in time;
 *   the Booking was removed, nothing half-written remains, and a retry with the same
 *   `Idempotency-Key` is safe.
 * - `booking.no_eligible_rep` (409): routing found no Rep who can take this Prospect.
 * - `booking.slot_invalid` (422): the start is in the past, inside the minimum notice, outside
 *   the 14-day window or not on a time the slots offered.
 * - `booking.type_invalid` (422): a Booking Type with a length, buffer or notice core refuses.
 * - `booking.type_not_found` (404): the Booking Type is unknown, retired, or its token is wrong.
 * - `booking.not_found` (404): the Booking is unknown or not the caller's to see.
 * - `booking.not_active` (409): the Booking is cancelled and cannot be moved.
 * - `routing.rule_invalid` (422): a Routing Rule names a Team, Rep or Booking Type that is not in
 *   the Organization, is not a Rep, has a second default, or puts the default anywhere but last.
 * - `routing.rule_not_found` (404): the Routing Rule is unknown or not the caller's to change.
 * - `calendar.not_connected` (404): the caller has no Calendar Connection.
 * - `calendar.authorization_failed` (422): the vendor refused the grant, or the `state` is wrong
 *   or expired.
 * - `calendar.hours_invalid` (422): the time zone is unknown or the hours cannot be kept.
 */
export const BOOKING_ERRORS = {
  ...defineErrors('booking', {
    slot_taken: { status: 409, message: 'That time was just taken. Pick another.' },
    calendar_unavailable: {
      status: 503,
      message: 'The calendar is not available right now. Try again shortly.',
    },
    no_eligible_rep: { status: 409, message: 'No Rep is available for this Prospect.' },
    slot_invalid: { status: 422, message: 'That time cannot be booked.' },
    type_invalid: { status: 422, message: 'The Booking Type is not valid.' },
    type_not_found: { status: 404, message: 'The Booking Type was not found.' },
    not_found: { status: 404, message: 'The Booking was not found.' },
    not_active: { status: 409, message: 'The Booking was cancelled.' },
  }),
  ...defineErrors('routing', {
    rule_invalid: { status: 422, message: 'The Routing Rule is not valid.' },
    rule_not_found: { status: 404, message: 'The Routing Rule was not found.' },
  }),
  ...defineErrors('calendar', {
    not_connected: { status: 404, message: 'No calendar is connected.' },
    authorization_failed: {
      status: 422,
      message: 'The calendar could not be connected. Start again.',
    },
    hours_invalid: { status: 422, message: 'The working hours are not valid.' },
  }),
} as const

/** A booking, routing or calendar error code. */
export type BookingErrorCode = keyof typeof BOOKING_ERRORS
