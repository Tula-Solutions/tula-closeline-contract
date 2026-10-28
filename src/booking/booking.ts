import { z } from 'zod'
import { idempotencyKeySchema, personNameSchema, timestampSchema } from '../core/values'
import { emailSchema } from '../email'
import {
  bookingIdSchema,
  bookingTypeIdSchema,
  membershipIdSchema,
  prospectIdSchema,
  routingDecisionIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  bookingLinkTokenSchema,
  bookingModeSchema,
  bookingOriginSchema,
  bookingStateSchema,
  joinUrlSchema,
  MAX_SLOT_RANGE_DAYS,
  timeZoneSchema,
} from './values'

const DAY_MS = 86_400_000

const withinRange = (query: { from: string; to: string }) => {
  const span = Date.parse(query.to) - Date.parse(query.from)
  return span > 0 && span <= MAX_SLOT_RANGE_DAYS * DAY_MS
}

const RANGE_MESSAGE = `The range is after its start and at most ${MAX_SLOT_RANGE_DAYS} days`

/** A Booking: a time reserved on a Rep's calendar for a Prospect. `joinUrl` is the video link, null for a phone Booking. */
export const bookingSchema = z
  .strictObject({
    id: bookingIdSchema,
    bookingTypeId: bookingTypeIdSchema,
    repMembershipId: membershipIdSchema,
    prospectId: prospectIdSchema,
    startsAt: timestampSchema,
    endsAt: timestampSchema,
    mode: bookingModeSchema,
    state: bookingStateSchema,
    origin: bookingOriginSchema,
    joinUrl: joinUrlSchema.nullable(),
    routingDecisionId: routingDecisionIdSchema.nullable(),
    createdAt: timestampSchema,
    cancelledAt: timestampSchema.nullable(),
  })
  .refine((booking) => Date.parse(booking.endsAt) > Date.parse(booking.startsAt), {
    message: 'A Booking ends after it starts',
    path: ['endsAt'],
  })
  .refine((booking) => (booking.state === 'cancelled') === (booking.cancelledAt !== null), {
    message: 'Only a cancelled Booking has a cancellation time',
    path: ['cancelledAt'],
  })
  .refine((booking) => booking.mode === 'video' || booking.joinUrl === null, {
    message: 'Only a video Booking has a join link',
    path: ['joinUrl'],
  })

/** A Booking. */
export type Booking = z.infer<typeof bookingSchema>

/** The path parameters of a request about one Booking. */
export const bookingParamsSchema = z.strictObject({ bookingId: bookingIdSchema })

/**
 * The query parameters of a request for free times: the Booking Type, the Prospect (so routing
 * can choose the Reps) and a range of at most 14 days. One cursor-paginated page at a time.
 */
export const listSlotsQuerySchema = pageQuerySchema
  .extend({
    bookingTypeId: bookingTypeIdSchema,
    prospectId: prospectIdSchema,
    from: timestampSchema,
    to: timestampSchema,
  })
  .strict()
  .refine(withinRange, { message: RANGE_MESSAGE, path: ['to'] })

/** The query parameters of a request for free times. */
export type ListSlotsQuery = z.infer<typeof listSlotsQuerySchema>

/** A free time with the Rep who would take it. */
export const slotSchema = z.strictObject({
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  repMembershipId: membershipIdSchema,
})

/** A free time with the Rep who would take it. */
export type Slot = z.infer<typeof slotSchema>

/** One page of free times, earliest first. */
export const slotPageSchema = pageSchema(slotSchema)

/**
 * The headers of a request to book. The `Idempotency-Key` header is required (header names arrive
 * lower-cased): a retry of the same key answers the original Booking and writes the calendar once,
 * and the same key with a different body is `request.idempotency_key_reused`.
 */
export const bookHeadersSchema = z.object({ 'idempotency-key': idempotencyKeySchema })

/**
 * The body of a request to book a time for a Prospect. The idempotency key is not in the body:
 * see `bookHeadersSchema`. `repMembershipId` is the Rep a slot named; when absent core routes
 * the Prospect and takes the first candidate free at that time.
 */
export const bookRequestSchema = z.strictObject({
  bookingTypeId: bookingTypeIdSchema,
  prospectId: prospectIdSchema,
  startsAt: timestampSchema,
  repMembershipId: membershipIdSchema.optional(),
})

/** The body of a request to book. */
export type BookRequest = z.infer<typeof bookRequestSchema>

/** The body of a request to move a Booking to another start time; the length stays. Idempotent by end state. */
export const rescheduleBookingRequestSchema = z.strictObject({ startsAt: timestampSchema })

/** The body of a request to move a Booking. */
export type RescheduleBookingRequest = z.infer<typeof rescheduleBookingRequestSchema>

/** Which end of the start times a Booking list begins at: `asc` soonest first, `desc` latest first. */
export const bookingListOrderSchema = z.enum(['asc', 'desc'])

/** Which end of the start times a Booking list begins at. */
export type BookingListOrder = z.infer<typeof bookingListOrderSchema>

/**
 * The cursor position a Booking list resumes from: start, then id, in the order the cursor was
 * issued for. A cursor used with the other order is request.invalid.
 */
export const bookingCursorSchema = z.strictObject({
  startsAt: timestampSchema,
  id: bookingIdSchema,
  order: bookingListOrderSchema.default('desc'),
})

/**
 * The query parameters of a request to list Bookings: latest start first (or soonest first with
 * `order=asc`), one cursor-paginated page at a time, optionally narrowed by state, Rep, Prospect
 * and a start range. What the caller sees is decided from the token and a filter never widens it.
 */
export const listBookingsQuerySchema = pageQuerySchema
  .extend({
    state: bookingStateSchema.optional(),
    repMembershipId: membershipIdSchema.optional(),
    prospectId: prospectIdSchema.optional(),
    from: timestampSchema.optional(),
    to: timestampSchema.optional(),
    order: bookingListOrderSchema.default('desc'),
  })
  .strict()
  .refine(
    (q) => q.from === undefined || q.to === undefined || Date.parse(q.to) > Date.parse(q.from),
    {
      message: 'The range ends after it starts',
      path: ['to'],
    }
  )

/** The query parameters of a request to list Bookings. */
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>

/** One page of Bookings. */
export const bookingPageSchema = pageSchema(bookingSchema)

/** The path parameters of a public request: the Booking Type's unguessable token. */
export const publicBookingParamsSchema = z.strictObject({ token: bookingLinkTokenSchema })

/**
 * The query parameters of a public request for free times (nobody signed in): a range of at most
 * 14 days, one cursor-paginated page at a time.
 */
export const publicListSlotsQuerySchema = pageQuerySchema
  .extend({ from: timestampSchema, to: timestampSchema })
  .strict()
  .refine(withinRange, { message: RANGE_MESSAGE, path: ['to'] })

/**
 * A free time as a Prospect sees it: a start and an end, nothing more. No Rep, no event title, no
 * attendee and no busy block ever reaches a public page.
 */
export const publicSlotSchema = z.strictObject({
  startsAt: timestampSchema,
  endsAt: timestampSchema,
})

/** A free time as a Prospect sees it. */
export type PublicSlot = z.infer<typeof publicSlotSchema>

/** What a public page shows about the Booking Type: its name, length and mode. */
export const publicBookingTypeSchema = z.strictObject({
  name: z.string().min(1).max(100),
  lengthMinutes: z.number().int().min(5).max(480),
  mode: bookingModeSchema,
})

/** What a public page shows about the Booking Type. */
export type PublicBookingType = z.infer<typeof publicBookingTypeSchema>

/** One page of free times for a public page, with the Booking Type they belong to. */
export const publicSlotPageSchema = pageSchema(publicSlotSchema).extend({
  bookingType: publicBookingTypeSchema,
})

/** The longest honeypot value a public booking form may send. */
export const MAX_PUBLIC_BOOKING_FIELD_LENGTH = 200

/**
 * The body of a public request to book (nobody signed in): the Prospect's name and work email
 * (folded to lower case), the chosen start and their time zone. The honeypot, `website`, is a
 * field the form hides from people, so a non-empty value marks a bot: it still parses, so the
 * service answers as for a real request and stores nothing. Core upserts the Prospect by email.
 * The idempotency key is the `Idempotency-Key` header (`bookHeadersSchema`).
 */
export const publicBookRequestSchema = z.strictObject({
  name: personNameSchema,
  email: emailSchema,
  startsAt: timestampSchema,
  timeZone: timeZoneSchema,
  website: z.string().max(MAX_PUBLIC_BOOKING_FIELD_LENGTH).default(''),
})

/** The body of a public request to book. */
export type PublicBookRequest = z.infer<typeof publicBookRequestSchema>

/**
 * The confirmation a Prospect gets: the time and how to join, and no id of a Rep, a Prospect or
 * the Organization. The invitation itself is the calendar's own.
 */
export const publicBookingConfirmationSchema = z.strictObject({
  id: bookingIdSchema,
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  mode: bookingModeSchema,
  joinUrl: joinUrlSchema.nullable(),
})

/** The confirmation a Prospect gets. */
export type PublicBookingConfirmation = z.infer<typeof publicBookingConfirmationSchema>
