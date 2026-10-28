import { z } from 'zod'
import { boundedTextSchema } from '../prospect/values'

/** The vendors a Rep can connect a calendar from. Outlook follows later. */
export const CALENDAR_PROVIDERS = ['google'] as const

/** The vendor of a Calendar Connection. */
export const calendarProviderSchema = z.enum(CALENDAR_PROVIDERS)

/** The vendor of a Calendar Connection. */
export type CalendarProvider = z.infer<typeof calendarProviderSchema>

/** The states of a Calendar Connection that exists: `healthy`, or `needs_reconnect` once the grant was revoked or expired. A disconnected calendar has no connection at all. */
export const CALENDAR_CONNECTION_STATES = ['healthy', 'needs_reconnect'] as const

/** The state of a Calendar Connection. */
export const calendarConnectionStateSchema = z.enum(CALENDAR_CONNECTION_STATES)

/** The state of a Calendar Connection. */
export type CalendarConnectionState = z.infer<typeof calendarConnectionStateSchema>

/** How a Booking is held: a phone Call, or a video conversation with a join link. */
export const BOOKING_MODES = ['phone', 'video'] as const

/** How a Booking is held. */
export const bookingModeSchema = z.enum(BOOKING_MODES)

/** How a Booking is held. */
export type BookingMode = z.infer<typeof bookingModeSchema>

/** The states of a Booking: `pending` while the event is being written, `confirmed` once it is on the calendar, `cancelled` after. Rescheduling keeps a Booking `confirmed`. */
export const BOOKING_STATES = ['pending', 'confirmed', 'cancelled'] as const

/** The state of a Booking. */
export const bookingStateSchema = z.enum(BOOKING_STATES)

/** The state of a Booking. */
export type BookingState = z.infer<typeof bookingStateSchema>

/** Where a Booking came from: a member in the portal, the Inbound Agent, or a Prospect on the public page. */
export const BOOKING_ORIGINS = ['member', 'agent', 'public'] as const

/** Where a Booking came from. */
export const bookingOriginSchema = z.enum(BOOKING_ORIGINS)

/** Where a Booking came from. */
export type BookingOrigin = z.infer<typeof bookingOriginSchema>

/** The states of a Booking Type: `active`, or `retired` (kept for old Bookings, no longer bookable). */
export const BOOKING_TYPE_STATES = ['active', 'retired'] as const

/** The state of a Booking Type. */
export const bookingTypeStateSchema = z.enum(BOOKING_TYPE_STATES)

/** The state of a Booking Type. */
export type BookingTypeState = z.infer<typeof bookingTypeStateSchema>

/** The most days ahead a slot search may cover. */
export const MAX_SLOT_RANGE_DAYS = 14

/** The most Reps considered for one slot search, and the most a pool may name. */
export const MAX_ELIGIBLE_REPS = 20

/** The longest name of a Booking Type or Routing Rule. */
export const MAX_BOOKING_NAME_LENGTH = 100

/** A name an Admin gives a Booking Type or a Routing Rule: bounded text with no control character. */
export const bookingNameSchema = boundedTextSchema(MAX_BOOKING_NAME_LENGTH)

/** An IANA time zone name such as `Europe/Dublin` or `UTC`. Core checks it against the zone database. */
export const timeZoneSchema = z
  .string()
  .max(64)
  .regex(/^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+){0,2}$/)

/** A join link: an `https` URL of at most 2,048 characters. */
export const joinUrlSchema = z
  .string()
  .max(2048)
  .regex(/^https:\/\/[^\s]+$/)

/** The opaque, unguessable token of a Booking Type's public link: 32 to 64 URL-safe characters. */
export const bookingLinkTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32,64}$/)

/** The opaque, unguessable token that lets a Prospect manage one Booking: 43 URL-safe characters (256 bits). */
export const bookingManageTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/)
