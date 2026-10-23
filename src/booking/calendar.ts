import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { membershipIdSchema } from '../ids'
import { calendarConnectionStateSchema, calendarProviderSchema, timeZoneSchema } from './values'

/**
 * The body of a request to start connecting the caller's calendar. Core answers with the vendor's
 * consent URL; the redirect address is core's own configuration and never comes from the request.
 */
export const startCalendarConnectionRequestSchema = z.strictObject({
  provider: calendarProviderSchema,
})

/** The body of a request to start a Calendar Connection. */
export type StartCalendarConnectionRequest = z.infer<typeof startCalendarConnectionRequestSchema>

/** The answer to starting a Calendar Connection: where to send the Rep, and the `state` to hand back on completion. */
export const startCalendarConnectionResponseSchema = z.strictObject({
  authorizationUrl: z.url().max(2048),
  state: z.string().min(1).max(512),
})

/** The answer to starting a Calendar Connection. */
export type StartCalendarConnectionResponse = z.infer<typeof startCalendarConnectionResponseSchema>

/** The body of a request to complete a Calendar Connection with what the vendor returned. The code is used once and never stored or logged. */
export const completeCalendarConnectionRequestSchema = z.strictObject({
  state: z.string().min(1).max(512),
  code: z.string().min(1).max(2048),
})

/** The body of a request to complete a Calendar Connection. */
export type CompleteCalendarConnectionRequest = z.infer<
  typeof completeCalendarConnectionRequestSchema
>

/**
 * A Rep's Calendar Connection: the vendor, whether it is healthy and when it was last checked.
 * It carries no token and no calendar content; tokens are never returned.
 */
export const calendarConnectionSchema = z.strictObject({
  membershipId: membershipIdSchema,
  provider: calendarProviderSchema,
  state: calendarConnectionStateSchema,
  connectedAt: timestampSchema,
  lastCheckedAt: timestampSchema.nullable(),
})

/** A Calendar Connection. */
export type CalendarConnection = z.infer<typeof calendarConnectionSchema>

/** The days of the week, Monday first. */
export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

/** A day of the week. */
export const weekdaySchema = z.enum(WEEKDAYS)

/** A day of the week. */
export type Weekday = z.infer<typeof weekdaySchema>

/** The most working windows one day may have. */
export const MAX_WINDOWS_PER_DAY = 4

/** A time of day as `HH:MM` on a 24-hour clock. */
export const timeOfDaySchema = z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)

/** A working window within one day: `start` before `end`, both `HH:MM`. */
export const workingWindowSchema = z
  .strictObject({ start: timeOfDaySchema, end: timeOfDaySchema })
  .refine((window) => window.start < window.end, { message: 'A window ends after it starts' })

/** A working window. */
export type WorkingWindow = z.infer<typeof workingWindowSchema>

/** One day's working windows: ordered, not overlapping, at most {@link MAX_WINDOWS_PER_DAY}. */
export const workingDaySchema = z
  .strictObject({
    day: weekdaySchema,
    windows: z.array(workingWindowSchema).min(1).max(MAX_WINDOWS_PER_DAY),
  })
  .refine(
    (day) =>
      day.windows.every((window, i) => i === 0 || window.start >= (day.windows[i - 1]?.end ?? '')),
    { message: 'Windows are in order and do not overlap', path: ['windows'] }
  )

/** The most Bookings a Rep may allow in one day. */
export const MAX_DAILY_BOOKING_CAP = 50

/** The longest a Rep may be marked away, in days. */
export const MAX_AWAY_DAYS = 365

/**
 * A Rep's availability: time zone, working hours (days not listed are off), an optional cap on
 * Bookings per day (null for no cap) and an optional time they are away until (null when not away).
 * Round-robin skips a Rep who is off shift, away or at the cap.
 */
export const availabilitySchema = z.strictObject({
  timeZone: timeZoneSchema,
  hours: z
    .array(workingDaySchema)
    .max(7)
    .refine((days) => new Set(days.map((d) => d.day)).size === days.length, {
      message: 'Each day appears once',
    }),
  dailyCap: z.number().int().min(1).max(MAX_DAILY_BOOKING_CAP).nullable(),
  awayUntil: timestampSchema.nullable(),
})

/** A Rep's availability. */
export type Availability = z.infer<typeof availabilitySchema>
