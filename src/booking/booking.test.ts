import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { CORE_ERRORS } from '../core'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import { MAX_PAGE_SIZE } from '../pagination'
import { PROSPECT_ERRORS } from '../prospect'
import {
  availabilitySchema,
  BOOKING_ERRORS,
  BOOKING_EVENTS,
  BOOKING_ROUTES,
  bookHeadersSchema,
  bookingCancelledEvent,
  bookingCreatedEvent,
  bookingCursorSchema,
  bookingManageTokenSchema,
  bookingRescheduledEvent,
  bookingSchema,
  bookRequestSchema,
  createBookingTypeRequestSchema,
  createRoutingRuleRequestSchema,
  listBookingsQuerySchema,
  listSlotsQuerySchema,
  publicBookingConfirmationSchema,
  publicBookRequestSchema,
  publicListSlotsQuerySchema,
  publicManagedBookingSchema,
  publicManageParamsSchema,
  publicRescheduleRequestSchema,
  publicSlotPageSchema,
  publicSlotSchema,
  reorderRoutingRulesRequestSchema,
  routingResultSchema,
  routingRuleSchema,
  slotSchema,
  testRoutingRequestSchema,
  updateBookingTypeRequestSchema,
  workingDaySchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const org = formatId('org', hex(1))
const bkg = formatId('bkg', hex(2))
const bkt = formatId('bkt', hex(3))
const mem = formatId('mem', hex(4))
const mem2 = formatId('mem', hex(5))
const prs = formatId('prs', hex(6))
const team = formatId('team', hex(7))
const rrl = formatId('rrl', hex(8))
const rdc = formatId('rdc', hex(9))
const NOW = '2026-01-01T00:00:00Z'
const LATER = '2026-01-01T00:30:00Z'
const KEY = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'
const MANAGE = 'A'.repeat(43)
const TOKEN = 'Abcdefghijklmnopqrstuvwxyz012345_-'

const booking = {
  id: bkg,
  bookingTypeId: bkt,
  repMembershipId: mem,
  prospectId: prs,
  startsAt: NOW,
  endsAt: LATER,
  mode: 'video',
  state: 'confirmed',
  origin: 'member',
  joinUrl: 'https://meet.google.com/abc-defg-hij',
  routingDecisionId: rdc,
  createdAt: NOW,
  cancelledAt: null,
}

describe('book requires an idempotency key', () => {
  test('the header is required', () => {
    expect(bookHeadersSchema.safeParse({}).success).toBe(false)
    expect(bookHeadersSchema.safeParse({ 'idempotency-key': 'short' }).success).toBe(false)
    expect(bookHeadersSchema.safeParse({ 'idempotency-key': KEY }).success).toBe(true)
  })
  test('the key is not a body field', () => {
    const body = { bookingTypeId: bkt, prospectId: prs, startsAt: NOW }
    expect(bookRequestSchema.safeParse(body).success).toBe(true)
    expect(bookRequestSchema.safeParse({ ...body, idempotencyKey: KEY }).success).toBe(false)
  })
  test('routes: both book routes require it and say so', () => {
    for (const name of ['book', 'publicBook'] as const) {
      expect(BOOKING_ROUTES[name].keyRequired).toBe(true)
      expect(BOOKING_ROUTES[name].idempotent).toBe(true)
      expect(BOOKING_ROUTES[name].description).toContain('Idempotency-Key')
    }
    expect(BOOKING_ROUTES.book.description).toContain('Idempotency-Key header is required')
  })
})

describe('Booking', () => {
  test('a confirmed video Booking parses', () => {
    expect(bookingSchema.safeParse(booking).success).toBe(true)
  })
  test.each([
    ['ends before it starts', { endsAt: '2025-12-31T00:00:00Z' }],
    ['cancelled without a time', { state: 'cancelled' }],
    ['a time without being cancelled', { cancelledAt: NOW }],
    ['a phone Booking with a join link', { mode: 'phone' }],
    ['an http join link', { joinUrl: 'http://meet.example/x' }],
    ['an unknown key', { title: 'Call with Ada' }],
  ])('rejects %s', (_name, change) => {
    expect(bookingSchema.safeParse({ ...booking, ...change }).success).toBe(false)
  })
})

describe('slots', () => {
  const base = { bookingTypeId: bkt, prospectId: prs, from: NOW, to: '2026-01-10T00:00:00Z' }
  test('a range of at most 14 days', () => {
    expect(listSlotsQuerySchema.safeParse(base).success).toBe(true)
    expect(listSlotsQuerySchema.safeParse({ ...base, to: '2026-01-15T00:00:00Z' }).success).toBe(
      true
    )
    expect(listSlotsQuerySchema.safeParse({ ...base, to: '2026-01-15T00:00:01Z' }).success).toBe(
      false
    )
    expect(listSlotsQuerySchema.safeParse({ ...base, to: NOW }).success).toBe(false)
  })
  test('the page size is capped', () => {
    expect(listSlotsQuerySchema.safeParse({ ...base, limit: MAX_PAGE_SIZE + 1 }).success).toBe(
      false
    )
    expect(listSlotsQuerySchema.parse({ ...base, limit: '100' }).limit).toBe(100)
  })
  test('a slot names its Rep; a public slot is a start and an end only', () => {
    expect(
      slotSchema.safeParse({ startsAt: NOW, endsAt: LATER, repMembershipId: mem }).success
    ).toBe(true)
    expect(publicSlotSchema.safeParse({ startsAt: NOW, endsAt: LATER }).success).toBe(true)
  })
})

describe('public routes do not leak Rep calendars', () => {
  const FORBIDDEN_KEYS = ['title', 'summary', 'attendees', 'attendee', 'busy', 'repMembershipId']
  test.each(FORBIDDEN_KEYS)('a public slot refuses %s', (key) => {
    expect(publicSlotSchema.safeParse({ startsAt: NOW, endsAt: LATER, [key]: 'x' }).success).toBe(
      false
    )
  })
  test('a public page refuses a slot with a Rep or a title', () => {
    const page = {
      items: [{ startsAt: NOW, endsAt: LATER, repMembershipId: mem }],
      nextCursor: null,
      bookingType: { name: 'Discovery', lengthMinutes: 30, mode: 'video' },
    }
    expect(publicSlotPageSchema.safeParse(page).success).toBe(false)
    expect(
      publicSlotPageSchema.safeParse({ ...page, items: [{ startsAt: NOW, endsAt: LATER }] }).success
    ).toBe(true)
  })
  test('the confirmation carries no Rep, Prospect or Organization id', () => {
    const ok = {
      id: bkg,
      startsAt: NOW,
      endsAt: LATER,
      mode: 'phone',
      joinUrl: null,
      manageToken: MANAGE,
    }
    expect(publicBookingConfirmationSchema.safeParse(ok).success).toBe(true)
    for (const extra of [{ repMembershipId: mem }, { prospectId: prs }, { organizationId: org }]) {
      expect(publicBookingConfirmationSchema.safeParse({ ...ok, ...extra }).success).toBe(false)
    }
  })
  test('the confirmation requires a well-formed manage token', () => {
    const ok = { id: bkg, startsAt: NOW, endsAt: LATER, mode: 'phone', joinUrl: null }
    expect(publicBookingConfirmationSchema.safeParse(ok).success).toBe(false)
    expect(publicBookingConfirmationSchema.safeParse({ ...ok, manageToken: MANAGE }).success).toBe(
      true
    )
    for (const bad of ['', 'short', `${'A'.repeat(42)}=`, `${'A'.repeat(42)}/`, 'A'.repeat(44)]) {
      expect(bookingManageTokenSchema.safeParse(bad).success).toBe(false)
      expect(publicManageParamsSchema.safeParse({ manageToken: bad }).success).toBe(false)
    }
    expect(publicManageParamsSchema.safeParse({ manageToken: MANAGE, x: 1 }).success).toBe(false)
  })
  test('the managed view shows the Booking and its type, no Rep, Prospect or email', () => {
    const view = {
      id: bkg,
      startsAt: NOW,
      endsAt: LATER,
      mode: 'video',
      joinUrl: 'https://meet.example/x',
      state: 'confirmed',
      bookingType: { name: 'Intro', lengthMinutes: 30, mode: 'video' },
    }
    expect(publicManagedBookingSchema.safeParse(view).success).toBe(true)
    for (const extra of [
      { repMembershipId: mem },
      { prospectId: prs },
      { email: 'a@b.co' },
      { manageToken: MANAGE },
    ]) {
      expect(publicManagedBookingSchema.safeParse({ ...view, ...extra }).success).toBe(false)
    }
  })
  test('the reschedule body is a start and a zone, strict', () => {
    const body = { startsAt: NOW, timeZone: 'Europe/Dublin' }
    expect(publicRescheduleRequestSchema.safeParse(body).success).toBe(true)
    expect(publicRescheduleRequestSchema.safeParse({ startsAt: NOW }).success).toBe(false)
    expect(publicRescheduleRequestSchema.safeParse({ ...body, email: 'a@b.co' }).success).toBe(
      false
    )
  })
  test('the manage routes: paths, methods, redaction, Retry-After, errors', () => {
    const paths = {
      publicGetManagedBooking: ['GET', '/v1/public/bookings/manage/{manageToken}'],
      publicListManagedSlots: ['GET', '/v1/public/bookings/manage/{manageToken}/slots'],
      publicCancelBooking: ['POST', '/v1/public/bookings/manage/{manageToken}/cancel'],
      publicRescheduleBooking: ['POST', '/v1/public/bookings/manage/{manageToken}/reschedule'],
    } as const
    for (const [name, [method, path]] of Object.entries(paths)) {
      const r = BOOKING_ROUTES[name as keyof typeof paths]
      expect([r.method, r.path]).toEqual([method, path])
      expect(r.public).toBe(true)
      expect(r.roles).toEqual([])
      expect(r.errors).toContain('booking.not_found')
      expect(r.commonErrors).toContain('rate.limited')
      expect(r.description).toContain('redact')
      expect(r.description).toContain('Retry-After')
      expect(r.description).toContain('no token')
    }
    expect(BOOKING_ROUTES.publicListManagedSlots.description).toContain('100')
    expect(BOOKING_ROUTES.publicCancelBooking.errors).toContain('booking.already_started')
    expect(BOOKING_ROUTES.publicCancelBooking.description).toContain('booking.cancelled')
    const re = BOOKING_ROUTES.publicRescheduleBooking
    expect(re.keyRequired).toBe(true)
    expect(re.idempotent).toBe(true)
    expect(re.description).toContain('Idempotency-Key')
    expect(re.errors).toEqual(
      expect.arrayContaining([
        'booking.slot_taken',
        'booking.calendar_unavailable',
        'booking.not_active',
        'booking.already_started',
        'booking.slot_invalid',
      ])
    )
    expect(re.description).toContain('booking.rescheduled')
    expect(BOOKING_ROUTES.publicBook.description).toContain('manageToken')
  })
  test('public routes are marked public with no roles and no auth errors', () => {
    for (const name of ['publicListSlots', 'publicBook'] as const) {
      const r = BOOKING_ROUTES[name]
      expect(r.public).toBe(true)
      expect(r.roles).toEqual([])
      expect(r.path.startsWith('/v1/public/')).toBe(true)
      for (const code of r.commonErrors) {
        expect(code.startsWith('auth.')).toBe(false)
      }
      expect(r.description).toContain('no token')
    }
  })
  test('the path token is a secret to redact, and 429 carries Retry-After', () => {
    for (const name of ['publicListSlots', 'publicBook'] as const) {
      const r = BOOKING_ROUTES[name]
      expect(r.description).toContain('redact')
      expect(r.description).toContain('Retry-After')
      expect(r.commonErrors).toContain('rate.limited')
    }
  })
  test('the public page is bounded like the rest', () => {
    const q = { from: NOW, to: '2026-01-20T00:00:00Z' }
    expect(publicListSlotsQuerySchema.safeParse(q).success).toBe(false)
    expect(publicListSlotsQuerySchema.safeParse({ ...q, to: LATER }).success).toBe(true)
  })
  test('the public book body: name, email, start, zone and a honeypot', () => {
    const body = {
      name: 'Ada Lovelace',
      email: 'Ada@Example.com',
      startsAt: NOW,
      timeZone: 'Europe/Dublin',
    }
    const parsed = publicBookRequestSchema.parse(body)
    expect(parsed.email).toBe('ada@example.com')
    expect(parsed.website).toBe('')
    expect(publicBookRequestSchema.safeParse({ ...body, website: 'http://spam' }).success).toBe(
      true
    )
    expect(publicBookRequestSchema.safeParse({ ...body, prospectId: prs }).success).toBe(false)
    expect(publicBookRequestSchema.safeParse({ ...body, timeZone: 'not a zone' }).success).toBe(
      false
    )
  })
})

describe('Booking Types', () => {
  const ok = {
    name: 'Discovery',
    lengthMinutes: 30,
    bufferBeforeMinutes: 5,
    bufferAfterMinutes: 5,
    minimumNoticeMinutes: 240,
    mode: 'video',
  }
  test('valid, and bounded', () => {
    expect(createBookingTypeRequestSchema.safeParse(ok).success).toBe(true)
    for (const change of [
      { lengthMinutes: 4 },
      { lengthMinutes: 481 },
      { bufferAfterMinutes: -1 },
      { bufferBeforeMinutes: 121 },
      { minimumNoticeMinutes: 43_201 },
      { mode: 'zoom' },
      { publicToken: TOKEN },
    ]) {
      expect(createBookingTypeRequestSchema.safeParse({ ...ok, ...change }).success).toBe(false)
    }
  })
  test('an update changes at least one field', () => {
    expect(updateBookingTypeRequestSchema.safeParse({}).success).toBe(false)
    expect(updateBookingTypeRequestSchema.safeParse({ mode: 'phone' }).success).toBe(true)
  })
})

describe('availability', () => {
  const ok = {
    timeZone: 'America/New_York',
    hours: [{ day: 'mon', windows: [{ start: '09:00', end: '17:00' }] }],
    dailyCap: 6,
    awayUntil: null,
  }
  test('valid hours parse; a day off is one not listed', () => {
    expect(availabilitySchema.safeParse(ok).success).toBe(true)
    expect(availabilitySchema.safeParse({ ...ok, hours: [], dailyCap: null }).success).toBe(true)
  })
  test.each([
    ['end before start', [{ day: 'mon', windows: [{ start: '17:00', end: '09:00' }] }]],
    [
      'overlapping windows',
      [
        {
          day: 'mon',
          windows: [
            { start: '09:00', end: '12:00' },
            { start: '11:00', end: '14:00' },
          ],
        },
      ],
    ],
    [
      'a day twice',
      [
        { day: 'mon', windows: [{ start: '09:00', end: '10:00' }] },
        { day: 'mon', windows: [{ start: '11:00', end: '12:00' }] },
      ],
    ],
    ['hour 24', [{ day: 'tue', windows: [{ start: '09:00', end: '24:00' }] }]],
    ['no windows', [{ day: 'tue', windows: [] }]],
  ])('rejects %s', (_name, hours) => {
    expect(availabilitySchema.safeParse({ ...ok, hours }).success).toBe(false)
  })
  test('a day has at most four windows', () => {
    const windows = ['08', '10', '12', '14', '16'].map((h) => ({
      start: `${h}:00`,
      end: `${h}:30`,
    }))
    expect(workingDaySchema.safeParse({ day: 'wed', windows }).success).toBe(false)
    expect(workingDaySchema.safeParse({ day: 'wed', windows: windows.slice(0, 4) }).success).toBe(
      true
    )
  })
  test('the daily cap is bounded', () => {
    expect(availabilitySchema.safeParse({ ...ok, dailyCap: 0 }).success).toBe(false)
    expect(availabilitySchema.safeParse({ ...ok, dailyCap: 51 }).success).toBe(false)
  })
})

describe('Routing Rules', () => {
  const rule = {
    name: 'Ireland to Dublin Team',
    conditions: { countries: ['IE'], companySizeBands: ['51-200'] },
    target: { kind: 'team', teamId: team },
    isDefault: false,
  }
  test('a rule with conditions and each kind of target parses', () => {
    expect(createRoutingRuleRequestSchema.safeParse(rule).success).toBe(true)
    for (const target of [
      { kind: 'rep', membershipId: mem },
      { kind: 'pool', membershipIds: [mem, mem2] },
    ]) {
      expect(createRoutingRuleRequestSchema.safeParse({ ...rule, target }).success).toBe(true)
    }
  })
  test('the default rule has no conditions, and a rule without conditions is the default', () => {
    expect(
      createRoutingRuleRequestSchema.safeParse({ ...rule, conditions: {}, isDefault: true }).success
    ).toBe(true)
    expect(createRoutingRuleRequestSchema.safeParse({ ...rule, isDefault: true }).success).toBe(
      false
    )
    expect(createRoutingRuleRequestSchema.safeParse({ ...rule, conditions: {} }).success).toBe(
      false
    )
  })
  test.each([
    ['a pool of one', { kind: 'pool', membershipIds: [mem] }],
    ['a pool with a duplicate', { kind: 'pool', membershipIds: [mem, mem] }],
    [
      'a pool over 20',
      {
        kind: 'pool',
        membershipIds: Array.from({ length: 21 }, (_, i) => formatId('mem', hex(100 + i))),
      },
    ],
    ['an unknown kind', { kind: 'everyone' }],
  ])('rejects %s', (_name, target) => {
    expect(createRoutingRuleRequestSchema.safeParse({ ...rule, target }).success).toBe(false)
  })
  test.each([
    ['a lower-case country', { countries: ['ie'] }],
    ['an empty list', { countries: [] }],
    ['a duplicate band', { companySizeBands: ['1-10', '1-10'] }],
    ['an unknown band', { companySizeBands: ['huge'] }],
    ['an unknown condition', { favouriteColour: ['red'] }],
  ])('rejects conditions with %s', (_name, conditions) => {
    expect(createRoutingRuleRequestSchema.safeParse({ ...rule, conditions }).success).toBe(false)
  })
  test('a stored rule has a position', () => {
    const stored = { ...rule, id: rrl, position: 1, createdAt: NOW }
    expect(routingRuleSchema.safeParse(stored).success).toBe(true)
    expect(routingRuleSchema.safeParse({ ...stored, position: 0 }).success).toBe(false)
  })
  test('reorder lists each id once', () => {
    expect(reorderRoutingRulesRequestSchema.safeParse({ ruleIds: [rrl] }).success).toBe(true)
    expect(reorderRoutingRulesRequestSchema.safeParse({ ruleIds: [rrl, rrl] }).success).toBe(false)
    expect(reorderRoutingRulesRequestSchema.safeParse({ ruleIds: [] }).success).toBe(false)
  })
  test('a test takes sample attributes, and a result has only ids and closed reasons', () => {
    const attributes = {
      country: 'IE',
      region: null,
      companySizeBand: '11-50',
      accountOwnerMembershipId: null,
      source: 'manual',
    }
    expect(testRoutingRequestSchema.safeParse({ attributes }).success).toBe(true)
    expect(
      testRoutingRequestSchema.safeParse({ attributes: { ...attributes, email: 'a@b.co' } }).success
    ).toBe(false)
    const result = {
      decisionId: null,
      matchedRuleId: rrl,
      candidates: [{ membershipId: mem, reason: 'round_robin_team' }],
      skipped: [{ membershipId: mem2, reason: 'daily_cap_reached' }],
      decidedAt: null,
    }
    expect(routingResultSchema.safeParse(result).success).toBe(true)
    expect(
      routingResultSchema.safeParse({
        ...result,
        skipped: [{ membershipId: mem2, reason: 'rude' }],
      }).success
    ).toBe(false)
  })
})

describe('list Bookings', () => {
  test('cursor-paginated with a maximum page size', () => {
    expect(listBookingsQuerySchema.safeParse({ limit: MAX_PAGE_SIZE + 1 }).success).toBe(false)
    expect(listBookingsQuerySchema.parse({}).limit).toBe(25)
    expect(listBookingsQuerySchema.safeParse({ from: LATER, to: NOW }).success).toBe(false)
    expect(listBookingsQuerySchema.safeParse({ organizationId: org }).success).toBe(false)
  })

  test('the cursor carries the order it was issued for', () => {
    const at = { startsAt: NOW, id: bkg }
    expect(bookingCursorSchema.parse({ ...at, order: 'asc' }).order).toBe('asc')
    expect(bookingCursorSchema.parse(at).order).toBe('desc')
    expect(bookingCursorSchema.safeParse({ ...at, order: 'up' }).success).toBe(false)
  })

  test('order defaults to desc, accepts asc and rejects anything else', () => {
    expect(listBookingsQuerySchema.parse({}).order).toBe('desc')
    expect(listBookingsQuerySchema.parse({ order: 'asc' }).order).toBe('asc')
    expect(listBookingsQuerySchema.safeParse({ order: 'newest' }).success).toBe(false)
  })
})

describe('events', () => {
  const envelope = (type: string, data: unknown) => ({
    id: formatId('evt', hex(50)),
    type,
    version: 1,
    occurredAt: NOW,
    organizationId: org,
    region: 'us',
    data,
  })
  const created = {
    bookingId: bkg,
    bookingTypeId: bkt,
    repMembershipId: mem,
    prospectId: prs,
    startsAt: NOW,
    endsAt: LATER,
    mode: 'video',
    origin: 'public',
    routingDecisionId: rdc,
  }
  test('booking.created uses the event envelope', () => {
    expect(bookingCreatedEvent.safeParse(envelope('booking.created', created)).success).toBe(true)
    expect(bookingCreatedEvent.safeParse(envelope('booking.cancelled', created)).success).toBe(
      false
    )
    const { organizationId: _o, ...noOrg } = envelope('booking.created', created)
    expect(bookingCreatedEvent.safeParse(noOrg).success).toBe(false)
  })
  test('the registry lists the three events', () => {
    expect(Object.keys(BOOKING_EVENTS)).toEqual([
      'booking.created',
      'booking.cancelled',
      'booking.rescheduled',
    ])
  })
  test('no personal data beyond ids', () => {
    for (const extra of [
      { email: 'ada@example.com' },
      { phone: '+14155550123' },
      { prospectName: 'Ada' },
      { joinUrl: 'https://meet.google.com/x' },
      { title: 'Call with Ada' },
    ]) {
      expect(
        bookingCreatedEvent.safeParse(envelope('booking.created', { ...created, ...extra })).success
      ).toBe(false)
    }
  })
  test('times are ordered', () => {
    expect(
      bookingCreatedEvent.safeParse(
        envelope('booking.created', { ...created, endsAt: '2025-12-31T00:00:00Z' })
      ).success
    ).toBe(false)
  })
  test('cancelled and rescheduled', () => {
    const cancelled = {
      bookingId: bkg,
      bookingTypeId: bkt,
      repMembershipId: mem,
      prospectId: prs,
      startsAt: NOW,
      endsAt: LATER,
      cancelledBy: 'prospect',
      cancelledAt: NOW,
    }
    expect(bookingCancelledEvent.safeParse(envelope('booking.cancelled', cancelled)).success).toBe(
      true
    )
    expect(
      bookingCancelledEvent.safeParse(
        envelope('booking.cancelled', { ...cancelled, cancelledBy: 'ada@example.com' })
      ).success
    ).toBe(false)
    const moved = {
      bookingId: bkg,
      bookingTypeId: bkt,
      repMembershipId: mem,
      prospectId: prs,
      previousStartsAt: NOW,
      startsAt: LATER,
      endsAt: '2026-01-01T01:00:00Z',
    }
    expect(bookingRescheduledEvent.safeParse(envelope('booking.rescheduled', moved)).success).toBe(
      true
    )
    expect(
      bookingRescheduledEvent.safeParse(
        envelope('booking.rescheduled', { ...moved, previousStartsAt: 'soon' })
      ).success
    ).toBe(false)
  })
})

describe('errors', () => {
  test.each([
    ['booking.slot_taken', 409],
    ['booking.calendar_unavailable', 503],
    ['booking.no_eligible_rep', 409],
    ['routing.rule_invalid', 422],
    ['calendar.not_connected', 404],
  ] as const)('%s exists with status %d', (code, status) => {
    expect(BOOKING_ERRORS[code].status).toBe(status)
    expect(BOOKING_ERRORS[code].code).toBe(code)
  })
  test('area.reason form, and no collision with another registry', () => {
    for (const code of Object.keys(BOOKING_ERRORS)) {
      expect(code).toMatch(/^[a-z]+\.[a-z_]+$/)
      expect(code in ERRORS).toBe(false)
      expect(code in CORE_ERRORS).toBe(false)
      expect(code in PROSPECT_ERRORS).toBe(false)
    }
  })
})

describe('routes', () => {
  const routes = Object.entries(BOOKING_ROUTES)
  test('every code a route lists exists', () => {
    const known = new Set([
      ...Object.keys(BOOKING_ERRORS),
      ...Object.keys(PROSPECT_ERRORS),
      ...Object.keys(ERRORS),
    ])
    for (const [, r] of routes) {
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
  })
  test('method and path are unique, versioned and described; roles are listed', () => {
    const seen = new Set<string>()
    for (const [, r] of routes) {
      const key = `${r.method} ${r.path}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      expect(r.path.startsWith('/v1/')).toBe(true)
      expect(r.description.length).toBeGreaterThan(40)
      expect(r.success.length).toBeGreaterThan(0)
      expect(r.roles.length > 0 || r.public === true).toBe(true)
    }
  })
  test('a list route describes its cursor and its maximum page size', () => {
    for (const name of [
      'listBookingTypes',
      'listRoutingRules',
      'listSlots',
      'listBookings',
      'publicListSlots',
      'publicListManagedSlots',
    ] as const) {
      expect(BOOKING_ROUTES[name].description).toContain('cursor')
      expect(BOOKING_ROUTES[name].description).toContain('100')
    }
  })
  test('idempotent routes list the replay errors', () => {
    for (const [, r] of routes) {
      if (r.idempotent) {
        expect(r.commonErrors).toContain('request.idempotency_key_reused')
      }
    }
  })
  test('the routes named in the spec carry their errors', () => {
    expect(BOOKING_ROUTES.book.errors).toEqual(
      expect.arrayContaining([
        'booking.slot_taken',
        'booking.calendar_unavailable',
        'booking.no_eligible_rep',
      ])
    )
    expect(BOOKING_ROUTES.createRoutingRule.errors).toContain('routing.rule_invalid')
    expect(BOOKING_ROUTES.getCalendarConnection.errors).toContain('calendar.not_connected')
  })
  test('roles', () => {
    expect(BOOKING_ROUTES.createBookingType.roles).toEqual(['owner', 'admin'])
    expect(BOOKING_ROUTES.createRoutingRule.roles).toEqual(['owner', 'admin', 'manager'])
    expect(BOOKING_ROUTES.createRoutingRule.description).toContain('Manager')
    expect(BOOKING_ROUTES.startCalendarConnection.roles).toContain('rep')
  })
  test('only the public routes are public', () => {
    expect(routes.filter(([, r]) => r.public).map(([n]) => n)).toEqual([
      'publicListSlots',
      'publicBook',
      'publicGetManagedBooking',
      'publicListManagedSlots',
      'publicCancelBooking',
      'publicRescheduleBooking',
    ])
  })
})

test('the whole area is exported from the entry point', async () => {
  const api = await import('../index')
  expect(api.BOOKING_ROUTES).toBe(BOOKING_ROUTES)
  expect(api.bookingCreatedEvent).toBe(bookingCreatedEvent)
  expect(z.string().safeParse(api.BOOKING_ERRORS['booking.slot_taken'].message).success).toBe(true)
})
