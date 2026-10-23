import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import {
  bookingIdSchema,
  bookingTypeIdSchema,
  membershipIdSchema,
  prospectIdSchema,
  routingDecisionIdSchema,
} from '../ids'
import { bookingModeSchema, bookingOriginSchema } from './values'

const ordered = (data: { startsAt: string; endsAt: string }) =>
  Date.parse(data.endsAt) > Date.parse(data.startsAt)

const ORDER_ISSUE = { message: 'A Booking ends after it starts', path: ['endsAt'] }

/**
 * `booking.created` (version 1): a Booking was confirmed on a Rep's calendar. Ids, the times, the
 * mode and where it came from: no Prospect name, email or number, no join link and no event text.
 */
export const bookingCreatedEvent = defineEvent(
  'booking.created',
  1,
  z
    .strictObject({
      bookingId: bookingIdSchema,
      bookingTypeId: bookingTypeIdSchema,
      repMembershipId: membershipIdSchema,
      prospectId: prospectIdSchema,
      startsAt: timestampSchema,
      endsAt: timestampSchema,
      mode: bookingModeSchema,
      origin: bookingOriginSchema,
      routingDecisionId: routingDecisionIdSchema.nullable(),
    })
    .refine(ordered, ORDER_ISSUE)
)

/** Who cancelled a Booking: a member of the Organization, the Prospect, or the system (the Rep's calendar was removed). */
export const BOOKING_CANCELLED_BY = ['member', 'prospect', 'system'] as const

/** Who cancelled a Booking. */
export const bookingCancelledBySchema = z.enum(BOOKING_CANCELLED_BY)

/** `booking.cancelled` (version 1): a Booking was cancelled. Ids and times only. */
export const bookingCancelledEvent = defineEvent(
  'booking.cancelled',
  1,
  z
    .strictObject({
      bookingId: bookingIdSchema,
      bookingTypeId: bookingTypeIdSchema,
      repMembershipId: membershipIdSchema,
      prospectId: prospectIdSchema,
      startsAt: timestampSchema,
      endsAt: timestampSchema,
      cancelledBy: bookingCancelledBySchema,
      cancelledAt: timestampSchema,
    })
    .refine(ordered, ORDER_ISSUE)
)

/** `booking.rescheduled` (version 1): a Booking moved to another time. Carries the old start and the new times; ids only. */
export const bookingRescheduledEvent = defineEvent(
  'booking.rescheduled',
  1,
  z
    .strictObject({
      bookingId: bookingIdSchema,
      bookingTypeId: bookingTypeIdSchema,
      repMembershipId: membershipIdSchema,
      prospectId: prospectIdSchema,
      previousStartsAt: timestampSchema,
      startsAt: timestampSchema,
      endsAt: timestampSchema,
    })
    .refine(ordered, ORDER_ISSUE)
)

/** Every booking event, by type. */
export const BOOKING_EVENTS = {
  'booking.created': bookingCreatedEvent,
  'booking.cancelled': bookingCancelledEvent,
  'booking.rescheduled': bookingRescheduledEvent,
} as const

/** The type of a booking event. */
export type BookingEventType = keyof typeof BOOKING_EVENTS
