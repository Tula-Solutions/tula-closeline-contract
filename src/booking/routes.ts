import { IDEMPOTENT_ERRORS, type InboundRoute, PUBLIC_ERRORS } from '../inbound-route'
import type { ProspectErrorCode } from '../prospect/errors'
import type { Role } from '../tenancy'
import type { BookingErrorCode } from './errors'

/** Every role: each may use the calendar and availability that are their own, and read Booking Types and free times. */
export const BOOKING_ALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The roles that define Booking Types and manage every Routing Rule. */
export const BOOKING_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The roles that read and test Routing Rules; a Manager changes only rules that target their own Team. */
export const ROUTING_ROLES = ['owner', 'admin', 'manager'] as const satisfies readonly Role[]

/** The booking, routing and calendar routes, by name. */
export type BookingRouteName =
  | 'startCalendarConnection'
  | 'completeCalendarConnection'
  | 'getCalendarConnection'
  | 'disconnectCalendarConnection'
  | 'getAvailability'
  | 'setAvailability'
  | 'listBookingTypes'
  | 'createBookingType'
  | 'getBookingType'
  | 'updateBookingType'
  | 'retireBookingType'
  | 'listRoutingRules'
  | 'createRoutingRule'
  | 'getRoutingRule'
  | 'updateRoutingRule'
  | 'deleteRoutingRule'
  | 'reorderRoutingRules'
  | 'testRouting'
  | 'route'
  | 'listSlots'
  | 'book'
  | 'listBookings'
  | 'getBooking'
  | 'getBookingRouting'
  | 'rescheduleBooking'
  | 'cancelBooking'
  | 'publicListSlots'
  | 'publicBook'

/** What the service needs to describe one route: method, path, who may call it, what it answers. */
export type BookingRoute = Omit<
  InboundRoute<BookingErrorCode | Extract<ProspectErrorCode, 'prospect.not_found'>>,
  'internal' | 'serviceToken' | 'etag'
>

const route = (definition: BookingRoute): BookingRoute => Object.freeze(definition)

const BOOKING_VISIBILITY =
  'Visibility is decided from the token: a Rep sees the Bookings they take, a Manager those of the Reps on their Team, Owner and Admin every Booking; anything else is booking.not_found (404), as is a Booking of another Organization.'

const RULE_ROLES =
  'A Manager may change only rules whose target is a Rep or Team they manage, or a pool of such Reps; any other rule is routing.rule_not_found (404). A rule of another Organization is routing.rule_not_found.'

/**
 * The booking, routing and calendar routes (spec M10). Every authenticated route may also return
 * the common `auth.*`, `rate.limited` and `server.*` codes. Every list is cursor-paginated with at
 * most 100 items per page. A record of another Organization is always not found. The two public
 * routes take no token: they are reached by an unguessable Booking Type token, are rate-limited by
 * address and token, and show a Prospect only start and end times, never a Rep, an event title, an
 * attendee or a busy block.
 */
export const BOOKING_ROUTES: Readonly<Record<BookingRouteName, BookingRoute>> = Object.freeze({
  startCalendarConnection: route({
    method: 'POST',
    path: '/v1/calendar-connection/start',
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      "Starts connecting the caller's own calendar and answers the vendor's consent URL and a one-time state. The redirect address is core's own and never comes from the request. A caller connects only their own calendar; there is no route to connect another member's.",
  }),
  completeCalendarConnection: route({
    method: 'POST',
    path: '/v1/calendar-connection/complete',
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['calendar.authorization_failed'],
    commonErrors: ['request.invalid'],
    description:
      "Completes the caller's Calendar Connection with the state and the one-time code the vendor returned. The tokens are stored encrypted and are never returned or logged. A refused grant or a wrong or expired state is calendar.authorization_failed (422). Answers the connection, healthy.",
  }),
  getCalendarConnection: route({
    method: 'GET',
    path: '/v1/calendar-connection',
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['calendar.not_connected'],
    commonErrors: [],
    description:
      "Reads the caller's own Calendar Connection: healthy, or needs_reconnect when the grant was revoked. No token is returned. A caller with no connection gets calendar.not_connected (404); no route reads another member's connection.",
  }),
  disconnectCalendarConnection: route({
    method: 'DELETE',
    path: '/v1/calendar-connection',
    roles: BOOKING_ALL_ROLES,
    success: [204],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description:
      "Disconnects the caller's own calendar: the grant is revoked and the stored tokens are deleted. Idempotent by end state: disconnecting a calendar that is not connected answers 204 as well. Future Bookings on the calendar stay.",
  }),
  getAvailability: route({
    method: 'GET',
    path: '/v1/availability',
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description:
      "Reads the caller's own availability: time zone, working hours, daily cap and away-until time.",
  }),
  setAvailability: route({
    method: 'PUT',
    path: '/v1/availability',
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['calendar.hours_invalid'],
    commonErrors: ['request.invalid'],
    description:
      "Replaces the caller's own availability. An unknown time zone is calendar.hours_invalid (422). Setting what is already set answers 200 unchanged. A caller sets only their own; an Admin cannot set another member's.",
  }),
  listBookingTypes: route({
    method: 'GET',
    path: '/v1/booking-types',
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: 'bookings:read' },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      "Lists the Organization's Booking Types, one cursor-paginated page at a time (at most 100); optionally one state. Every role may read them. The public token is shown to Owner and Admin only and is null for everyone else.",
  }),
  createBookingType: route({
    method: 'POST',
    path: '/v1/booking-types',
    roles: BOOKING_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ['booking.type_invalid'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Creates a Booking Type: name, length (5 to 480 minutes), buffers, minimum notice and mode (phone or video). Core makes the unguessable public token. A length, buffer or notice core refuses is booking.type_invalid (422). Owner and Admin only. Answers 201, or 200 with the original Booking Type for a replay of the same Idempotency-Key.',
  }),
  getBookingType: route({
    method: 'GET',
    path: '/v1/booking-types/{bookingTypeId}',
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: 'bookings:read' },
    success: [200],
    idempotent: false,
    errors: ['booking.type_not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Reads one Booking Type. The public token is shown to Owner and Admin only. A Booking Type of another Organization is booking.type_not_found (404).',
  }),
  updateBookingType: route({
    method: 'PATCH',
    path: '/v1/booking-types/{bookingTypeId}',
    roles: BOOKING_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['booking.type_not_found', 'booking.type_invalid'],
    commonErrors: ['request.invalid'],
    description:
      'Changes any of the fields of a Booking Type; at least one. Bookings already made keep their time. Owner and Admin only.',
  }),
  retireBookingType: route({
    method: 'POST',
    path: '/v1/booking-types/{bookingTypeId}/retire',
    roles: BOOKING_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['booking.type_not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Retires a Booking Type: it can no longer be booked and its public link stops answering, but its Bookings stay. Idempotent by end state: retiring a retired Booking Type answers 200 with it. Takes no body. Owner and Admin only.',
  }),
  listRoutingRules: route({
    method: 'GET',
    path: '/v1/routing-rules',
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      "Lists the Organization's Routing Rules in the order they are tried, one cursor-paginated page at a time (at most 100). Owner, Admin and Manager; a Manager sees every rule but may change only those that target their own Team.",
  }),
  createRoutingRule: route({
    method: 'POST',
    path: '/v1/routing-rules',
    roles: ROUTING_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ['routing.rule_invalid'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Creates a Routing Rule: conditions (country, region, company size band, named-account owner, source, Booking Type), and a target of one Rep, a Team in round-robin or a pool of 2 to 20 Reps. It goes last, before the default rule if there is one. A target, Rep or Booking Type that is not in the Organization, a target that is not a Rep, or a second default rule is routing.rule_invalid (422). ${RULE_ROLES} Answers 201, or 200 with the original rule for a replay of the same Idempotency-Key.`,
  }),
  getRoutingRule: route({
    method: 'GET',
    path: '/v1/routing-rules/{ruleId}',
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: ['routing.rule_not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Reads one Routing Rule. A rule of another Organization is routing.rule_not_found (404).',
  }),
  updateRoutingRule: route({
    method: 'PUT',
    path: '/v1/routing-rules/{ruleId}',
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: ['routing.rule_not_found', 'routing.rule_invalid'],
    commonErrors: ['request.invalid'],
    description: `Replaces a Routing Rule's name, conditions, target and default flag; its place in the order stays. ${RULE_ROLES} A change that makes the rule invalid is routing.rule_invalid (422).`,
  }),
  deleteRoutingRule: route({
    method: 'DELETE',
    path: '/v1/routing-rules/{ruleId}',
    roles: ROUTING_ROLES,
    success: [204],
    idempotent: false,
    errors: ['routing.rule_not_found'],
    commonErrors: ['request.invalid'],
    description: `Deletes a Routing Rule; decisions already stored keep naming it. Idempotent by end state for a rule the caller may change: deleting a rule already gone answers 204. ${RULE_ROLES}`,
  }),
  reorderRoutingRules: route({
    method: 'POST',
    path: '/v1/routing-rules/reorder',
    roles: BOOKING_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['routing.rule_invalid'],
    commonErrors: ['request.invalid'],
    description:
      'Sets the order of every Routing Rule from a list of all their ids, once each, first to last. A list that misses a rule, names an unknown one or puts the default rule anywhere but last is routing.rule_invalid (422). Answers 200 with the first page of rules in the new order. Owner and Admin only.',
  }),
  testRouting: route({
    method: 'POST',
    path: '/v1/routing-rules/test',
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      'Tests the Routing Rules with a sample Prospect (its country, region, company size band, account owner and source) and optionally a Booking Type. Answers which rule wins, the candidate Reps in order with a reason each, and the Reps skipped with why. Nothing is stored, no round-robin state advances and nobody is notified; the answer has no decision id.',
  }),
  route: route({
    method: 'POST',
    path: '/v1/routing/route',
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Routes a Prospect: reads its attributes and answers the ordered candidate Reps with a reason each, and the Reps skipped (off shift, on leave, at the daily cap, calendar not connected or needing reconnection) with why. The decision is stored and its id answered. Also gives a Handoff its live-transfer candidates in order. A prospectId the caller may not see is prospect.not_found. An empty candidate list is a 200; booking answers booking.no_eligible_rep.',
  }),
  listSlots: route({
    method: 'GET',
    path: '/v1/booking-slots',
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: 'bookings:read' },
    success: [200],
    idempotent: false,
    errors: ['booking.type_not_found', 'booking.no_eligible_rep', 'prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Lists free times for a Booking Type and a Prospect, earliest first, one cursor-paginated page at a time (at most 100). The range is at most 14 days and at most 20 Reps are considered. Each time names the Rep who would take it. Times are read from stored busy blocks, working hours and Bookings; the live calendar is not called. Routing finding nobody is booking.no_eligible_rep (409). This is also the route the Inbound Agent uses.',
  }),
  book: route({
    method: 'POST',
    path: '/v1/bookings',
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: 'bookings:write' },
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'booking.slot_taken',
      'booking.calendar_unavailable',
      'booking.no_eligible_rep',
      'booking.slot_invalid',
      'booking.type_not_found',
      'prospect.not_found',
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      "Books a time for a Prospect. The Idempotency-Key header is required (a request without it is request.invalid): a retry of the same key answers the original Booking and writes the calendar once; the same key with another body is request.idempotency_key_reused. Core locks the Rep's slot, re-checks the live calendar, stores the Booking pending, writes the event and confirms it. A time taken meanwhile is booking.slot_taken (409); a calendar that cannot be read or written in time is booking.calendar_unavailable (503) with the Booking removed and nothing half-written, and a retry with the same key is safe; routing finding nobody is booking.no_eligible_rep (409); a start in the past, inside the minimum notice or past 14 days is booking.slot_invalid (422). Publishes booking.created. Answers 201, or 200 for a replay.",
  }),
  listBookings: route({
    method: 'GET',
    path: '/v1/bookings',
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: 'bookings:read' },
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists Bookings, one cursor-paginated page at a time (at most 100), latest start first by default; order=asc lists the soonest start first. A cursor is valid only with the order it was issued for: a cursor used with the other order is request.invalid (400). Filters: state, repMembershipId, prospectId and a start range. ${BOOKING_VISIBILITY} A filter can narrow what the caller sees, never widen it.`,
  }),
  getBooking: route({
    method: 'GET',
    path: '/v1/bookings/{bookingId}',
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: 'bookings:read' },
    success: [200],
    idempotent: false,
    errors: ['booking.not_found'],
    commonErrors: ['request.invalid'],
    description: `Reads one Booking. ${BOOKING_VISIBILITY}`,
  }),
  getBookingRouting: route({
    method: 'GET',
    path: '/v1/bookings/{bookingId}/routing',
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: ['booking.not_found'],
    commonErrors: ['request.invalid'],
    description:
      "Reads why a Booking went to its Rep: the rule that matched, the candidates and who was skipped and why. Owner and Admin for every Booking, a Manager for their Team's; anything else is booking.not_found (404).",
  }),
  rescheduleBooking: route({
    method: 'POST',
    path: '/v1/bookings/{bookingId}/reschedule',
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: 'bookings:write' },
    success: [200],
    idempotent: false,
    errors: [
      'booking.not_found',
      'booking.not_active',
      'booking.slot_taken',
      'booking.calendar_unavailable',
      'booking.slot_invalid',
    ],
    commonErrors: ['request.invalid'],
    description: `Moves a Booking to another start time with the same Rep; the length stays. Idempotent by end state: asking for the time it already has answers 200 with it. A cancelled Booking is booking.not_active (409); a taken time is booking.slot_taken (409); the calendar failing is booking.calendar_unavailable (503) and the Booking keeps its old time. Publishes booking.rescheduled. ${BOOKING_VISIBILITY}`,
  }),
  cancelBooking: route({
    method: 'POST',
    path: '/v1/bookings/{bookingId}/cancel',
    roles: BOOKING_ALL_ROLES,
    publicApi: { scope: 'bookings:write' },
    success: [200],
    idempotent: false,
    errors: ['booking.not_found', 'booking.calendar_unavailable'],
    commonErrors: ['request.invalid'],
    description: `Cancels a Booking and removes its calendar event. Idempotent by end state: cancelling a cancelled Booking answers 200 with it and publishes nothing. Takes no body. A calendar that cannot be written is booking.calendar_unavailable (503) and the Booking stays confirmed. Publishes booking.cancelled. ${BOOKING_VISIBILITY}`,
  }),
  publicListSlots: route({
    method: 'GET',
    path: '/v1/public/booking-types/{token}/slots',
    roles: [],
    public: true,
    success: [200],
    idempotent: false,
    errors: ['booking.type_not_found', 'booking.no_eligible_rep'],
    commonErrors: [...PUBLIC_ERRORS],
    description:
      "Public: no token, no Organization; the Booking Type's unguessable token in the path stands in for both. Lists free times for that Booking Type, earliest first, one cursor-paginated page at a time (at most 100), over a range of at most 14 days, with the Booking Type's name, length and mode. A time is only a start and an end: never a Rep, an event title, an attendee or a busy block. An unknown, wrong or retired token is booking.type_not_found (404). Rate-limited by client address and by token (rate.limited, 429, with a Retry-After header). The token is a secret: services redact it from logs, traces and error reports.",
  }),
  publicBook: route({
    method: 'POST',
    path: '/v1/public/booking-types/{token}/bookings',
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      'booking.slot_taken',
      'booking.calendar_unavailable',
      'booking.no_eligible_rep',
      'booking.slot_invalid',
      'booking.type_not_found',
    ],
    commonErrors: [
      ...PUBLIC_ERRORS,
      'request.idempotency_key_reused',
      'request.idempotency_in_progress',
    ],
    description:
      "Public: no token, no Organization; the Booking Type's unguessable token stands in for both. A Prospect books a time with their name, work email, the start and their time zone; core upserts the Prospect by email and routes it. Requires an Idempotency-Key header (16 to 128 characters; the client generates one per submission): a replay answers the original confirmation with 200 and writes the calendar once, the same key with another body is request.idempotency_key_reused, and the same key while the first request runs is request.idempotency_in_progress. Answers 201 with the id, the times, the mode and the join link, and no Rep or Prospect id. A time taken meanwhile is booking.slot_taken (409); a calendar that fails is booking.calendar_unavailable (503) with nothing half-written. A filled honeypot is answered exactly as a real request and stores nothing. Rate-limited by client address and by token (rate.limited, 429). The invitation to the Prospect is the calendar's own; Closeline sends no email. Publishes booking.created. The token in the path is a secret: services redact it from logs, traces and error reports. A 429 (rate.limited) carries a Retry-After header.",
  }),
})
