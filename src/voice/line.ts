import { z } from 'zod'
import { idempotencyKeySchema, timestampSchema } from '../core/values'
import { lineIdSchema, membershipIdSchema, teamIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { e164PhoneSchema, rawPhoneSchema } from '../prospect/values'
import { roleSchema } from '../tenancy'
import { countryCodeSchema, lineLabelSchema } from './values'

/** The states of a Line: `porting` while a number moves to Closeline, `active` when Calls can use it, `released` once given up. */
export const LINE_STATES = ['porting', 'active', 'released'] as const

/** The state of a Line. */
export const lineStateSchema = z.enum(LINE_STATES)

/** The state of a Line. */
export type LineState = z.infer<typeof lineStateSchema>

/**
 * Who a Line is assigned to: nobody yet, a Team, one member of any role (`rep` is the kind name
 * kept for stored rows; `membershipId` may be an Owner, Admin, Manager or Rep), or a whole role
 * (every member with that role).
 */
export const lineAssignmentSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('unassigned') }),
  z.strictObject({ kind: z.literal('team'), teamId: teamIdSchema }),
  z.strictObject({ kind: z.literal('rep'), membershipId: membershipIdSchema }),
  z.strictObject({ kind: z.literal('role'), role: roleSchema }),
])

/** Who a Line is assigned to. */
export type LineAssignment = z.infer<typeof lineAssignmentSchema>

/** A Line: a phone number the Organization uses to place and receive Calls. */
export const lineSchema = z
  .object({
    id: lineIdSchema,
    number: e164PhoneSchema,
    country: countryCodeSchema,
    label: lineLabelSchema.nullable(),
    state: lineStateSchema,
    assignment: lineAssignmentSchema,
    createdAt: timestampSchema,
    releasedAt: timestampSchema.nullable(),
  })
  .refine((line) => (line.state === 'released') === (line.releasedAt !== null), {
    message: 'Only a released Line has a release time',
  })
  .refine((line) => line.state !== 'released' || line.assignment.kind === 'unassigned', {
    message: 'A released Line is unassigned',
  })

/** A Line. */
export type Line = z.infer<typeof lineSchema>

/** The path parameters of a request about one Line. */
export const lineParamsSchema = z.strictObject({ lineId: lineIdSchema })

/** The position a Line list resumes from: newest first, by creation time then id. */
export const lineCursorSchema = z.strictObject({ createdAt: timestampSchema, id: lineIdSchema })

/** The query parameters of a request to list Lines, newest first, optionally of one state. */
export const listLinesQuerySchema = pageQuerySchema
  .extend({ state: lineStateSchema.optional() })
  .strict()

/** The query parameters of a request to list Lines. */
export type ListLinesQuery = z.infer<typeof listLinesQuerySchema>

/** One page of Lines. */
export const linePageSchema = pageSchema(lineSchema)

/**
 * The body of a request to add a Line: buy a new number (optionally with an area code) or port
 * one the Organization already owns. The `Idempotency-Key` header is required (see
 * `addLineHeadersSchema`) so a retry buys one number.
 */
export const addLineRequestSchema = z.discriminatedUnion('method', [
  z.strictObject({
    method: z.literal('buy'),
    country: countryCodeSchema,
    areaCode: z
      .string()
      .regex(/^[0-9]{2,6}$/)
      .optional(),
    label: lineLabelSchema.optional(),
  }),
  z.strictObject({
    method: z.literal('port'),
    number: rawPhoneSchema,
    label: lineLabelSchema.optional(),
  }),
])

/** The headers of a request to add a Line: the required `Idempotency-Key`, so a retry never buys a second number. */
export const addLineHeadersSchema = z.object({ 'idempotency-key': idempotencyKeySchema })

/** The body of a request to add a Line. */
export type AddLineRequest = z.infer<typeof addLineRequestSchema>

/** The body of a request to assign a Line: to a Team, one member of any role, a whole role, or nobody. */
export const assignLineRequestSchema = lineAssignmentSchema

/** The body of a request to assign a Line. */
export type AssignLineRequest = z.infer<typeof assignLineRequestSchema>
