import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { bookingTypeIdSchema } from '../ids'
import { pageQuerySchema } from '../pagination'
import {
  bookingLinkTokenSchema,
  bookingModeSchema,
  bookingNameSchema,
  bookingTypeStateSchema,
} from './values'

/** The longest a Booking may be, in minutes. */
export const MAX_BOOKING_LENGTH_MINUTES = 480

/** The longest buffer before or after a Booking, in minutes. */
export const MAX_BOOKING_BUFFER_MINUTES = 120

/** The longest minimum notice before a Booking, in minutes: 30 days. */
export const MAX_BOOKING_NOTICE_MINUTES = 43_200

const bookingTypeFields = {
  name: bookingNameSchema,
  lengthMinutes: z.number().int().min(5).max(MAX_BOOKING_LENGTH_MINUTES),
  bufferBeforeMinutes: z.number().int().min(0).max(MAX_BOOKING_BUFFER_MINUTES),
  bufferAfterMinutes: z.number().int().min(0).max(MAX_BOOKING_BUFFER_MINUTES),
  minimumNoticeMinutes: z.number().int().min(0).max(MAX_BOOKING_NOTICE_MINUTES),
  mode: bookingModeSchema,
}

/**
 * A Booking Type: a named kind of Booking with a length, buffers, minimum notice and mode, such as
 * "Discovery, 30 minutes". `publicToken` is the unguessable part of its public link and is shown
 * to Owner and Admin only (null for everyone else).
 */
export const bookingTypeSchema = z.strictObject({
  id: bookingTypeIdSchema,
  ...bookingTypeFields,
  state: bookingTypeStateSchema,
  publicToken: bookingLinkTokenSchema.nullable(),
  createdAt: timestampSchema,
})

/** A Booking Type. */
export type BookingType = z.infer<typeof bookingTypeSchema>

/** The body of a request to create a Booking Type. Core makes the public token. */
export const createBookingTypeRequestSchema = z.strictObject(bookingTypeFields)

/** The body of a request to create a Booking Type. */
export type CreateBookingTypeRequest = z.infer<typeof createBookingTypeRequestSchema>

/** The body of a request to change a Booking Type: any of the fields, at least one. */
export const updateBookingTypeRequestSchema = z
  .strictObject({
    name: bookingTypeFields.name.optional(),
    lengthMinutes: bookingTypeFields.lengthMinutes.optional(),
    bufferBeforeMinutes: bookingTypeFields.bufferBeforeMinutes.optional(),
    bufferAfterMinutes: bookingTypeFields.bufferAfterMinutes.optional(),
    minimumNoticeMinutes: bookingTypeFields.minimumNoticeMinutes.optional(),
    mode: bookingTypeFields.mode.optional(),
  })
  .refine((body) => Object.values(body).some((v) => v !== undefined), {
    message: 'Change at least one field',
  })

/** The path parameters of a request about one Booking Type. */
export const bookingTypeParamsSchema = z.strictObject({ bookingTypeId: bookingTypeIdSchema })

/** The position a Booking Type list resumes from: by creation time then id. */
export const bookingTypeCursorSchema = z.strictObject({
  createdAt: timestampSchema,
  id: bookingTypeIdSchema,
})

/** The query parameters of a request to list Booking Types, optionally of one state. */
export const listBookingTypesQuerySchema = pageQuerySchema
  .extend({ state: bookingTypeStateSchema.optional() })
  .strict()
