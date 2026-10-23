import { z } from 'zod'
import { timestampSchema } from '../core/values'
import {
  campaignIdSchema,
  enrollmentEventIdSchema,
  enrollmentIdSchema,
  membershipIdSchema,
  prospectIdSchema,
  sendIdSchema,
} from '../ids'
import { MAX_ATTEMPT_EPOCH, MAX_SEQUENCE_STEP } from '../mail/send'
import { pageQuerySchema, pageSchema } from '../pagination'
import { MAX_PROSPECTS_PER_REQUEST, stepKeySchema } from './values'

/** The state of an Enrollment: `active` (in the Sequence), `completed` (reached an end) or `stopped` (taken out, with a reason). */
export const ENROLLMENT_STATES = ['active', 'completed', 'stopped'] as const

/** The state of an Enrollment. */
export const enrollmentStateSchema = z.enum(ENROLLMENT_STATES)

/** The state of an Enrollment. */
export type EnrollmentState = z.infer<typeof enrollmentStateSchema>

/**
 * Why an Enrollment stopped, a closed set: the Prospect `replied`, the address `hard_bounce`d,
 * the Prospect `unsubscribed` or `complaint`ed, the address became `suppressed`, Contact Consent
 * went (`no_consent`), the address is `unverified_address`, a Rep took them out
 * (`removed_by_rep`), a `meeting_booked`, the Prospect was erased (`prospect_erased`), or the
 * Campaign was archived (`campaign_archived`).
 */
export const ENROLLMENT_STOP_REASONS = [
  'replied',
  'hard_bounce',
  'unsubscribed',
  'complaint',
  'suppressed',
  'no_consent',
  'unverified_address',
  'removed_by_rep',
  'meeting_booked',
  'prospect_erased',
  'campaign_archived',
] as const

/** Why an Enrollment stopped. */
export const enrollmentStopReasonSchema = z.enum(ENROLLMENT_STOP_REASONS)

/** Why an Enrollment stopped. */
export type EnrollmentStopReason = z.infer<typeof enrollmentStopReasonSchema>

/**
 * One Prospect in one Campaign. `currentStepKey` is where it is (null once ended) and
 * `currentStep` that Step's position, the number in its send key; `attemptEpoch` is the send
 * key's epoch; `nextDueAt` is when the next Step acts (null when it waits on nothing or has
 * ended). A `stopped` Enrollment has a reason and a time; a `completed` one a time; neither of
 * an ended one is due again. Ids and values only.
 */
export const enrollmentSchema = z
  .strictObject({
    id: enrollmentIdSchema,
    campaignId: campaignIdSchema,
    prospectId: prospectIdSchema,
    state: enrollmentStateSchema,
    stopReason: enrollmentStopReasonSchema.nullable(),
    currentStepKey: stepKeySchema.nullable(),
    currentStep: z.number().int().min(0).max(MAX_SEQUENCE_STEP).nullable(),
    attemptEpoch: z.number().int().min(0).max(MAX_ATTEMPT_EPOCH),
    nextDueAt: timestampSchema.nullable(),
    enrolledAt: timestampSchema,
    stoppedAt: timestampSchema.nullable(),
    completedAt: timestampSchema.nullable(),
  })
  .superRefine((e, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    if ((e.state === 'stopped') !== (e.stopReason !== null)) {
      issue('stopReason', 'Exactly a stopped Enrollment has a reason')
    }
    if ((e.state === 'stopped') !== (e.stoppedAt !== null)) {
      issue('stoppedAt', 'Exactly a stopped Enrollment has a stop time')
    }
    if ((e.state === 'completed') !== (e.completedAt !== null)) {
      issue('completedAt', 'Exactly a completed Enrollment has a completion time')
    }
    if (e.state !== 'active' && e.nextDueAt !== null) {
      issue('nextDueAt', 'An ended Enrollment is not due again')
    }
    if ((e.currentStepKey === null) !== (e.currentStep === null)) {
      issue('currentStep', 'A Step has both a key and a position, or neither')
    }
    if (e.state === 'active' && e.currentStepKey === null) {
      issue('currentStepKey', 'An active Enrollment is at a Step')
    }
  })

/** One Prospect in one Campaign. */
export type Enrollment = z.infer<typeof enrollmentSchema>

/** The path parameters of a request about one Enrollment. */
export const enrollmentParamsSchema = z.strictObject({ enrollmentId: enrollmentIdSchema })

/** The path parameters of a request about the Enrollments of a Campaign. */
export const campaignEnrollmentsParamsSchema = z.strictObject({ campaignId: campaignIdSchema })

/** The body that enrolls 1 to 100 unique Prospects into a Campaign. */
export const enrollProspectsRequestSchema = z.strictObject({
  prospectIds: z
    .array(prospectIdSchema)
    .min(1)
    .max(MAX_PROSPECTS_PER_REQUEST)
    .refine((ids) => new Set(ids).size === ids.length, 'A Prospect is listed once'),
})

/** The body that enrolls Prospects. */
export type EnrollProspectsRequest = z.infer<typeof enrollProspectsRequestSchema>

/** Why a Prospect was not enrolled: `suppressed`, `no_consent` or `already_active` (in another active Campaign, or this one). */
export const ENROLL_REFUSALS = ['suppressed', 'no_consent', 'already_active'] as const

/** Why a Prospect was not enrolled. */
export const enrollRefusalSchema = z.enum(ENROLL_REFUSALS)

/** Why a Prospect was not enrolled. */
export type EnrollRefusal = z.infer<typeof enrollRefusalSchema>

/** The error code each refusal reports. */
export const ENROLL_REFUSAL_CODES = {
  suppressed: 'enrollment.suppressed',
  no_consent: 'enrollment.no_consent',
  already_active: 'enrollment.already_active',
} as const satisfies Record<EnrollRefusal, string>

/**
 * What happened to one Prospect of an enroll request: `enrolled` with its Enrollment, or
 * `refused` with the reason (and the existing Enrollment's id for `already_active` in this
 * Campaign, otherwise null).
 */
export const enrollResultSchema = z
  .strictObject({
    prospectId: prospectIdSchema,
    outcome: z.enum(['enrolled', 'refused']),
    refusal: enrollRefusalSchema.nullable(),
    enrollmentId: enrollmentIdSchema.nullable(),
  })
  .superRefine((r, ctx) => {
    if ((r.outcome === 'refused') !== (r.refusal !== null)) {
      ctx.addIssue({
        code: 'custom',
        path: ['refusal'],
        message: 'Exactly a refused Prospect has a reason',
      })
    }
    if (r.outcome === 'enrolled' && r.enrollmentId === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['enrollmentId'],
        message: 'An enrolled Prospect has an Enrollment',
      })
    }
  })

/** What happened to one Prospect of an enroll request. */
export type EnrollResult = z.infer<typeof enrollResultSchema>

/** The answer to an enroll request: one result per Prospect, in the order asked, at most 100. */
export const enrollProspectsResponseSchema = z.strictObject({
  results: z.array(enrollResultSchema).min(1).max(MAX_PROSPECTS_PER_REQUEST),
})

/** The query parameters of an Enrollment list. */
export const listEnrollmentsQuerySchema = pageQuerySchema
  .extend({
    state: enrollmentStateSchema.optional(),
    stopReason: enrollmentStopReasonSchema.optional(),
    prospectId: prospectIdSchema.optional(),
  })
  .strict()

/** The query parameters of an Enrollment list. */
export type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsQuerySchema>

/** One page of Enrollments, newest first (by `enrolledAt`, then id). */
export const listEnrollmentsResponseSchema = pageSchema(enrollmentSchema)

/** The position in an Enrollment list. */
export const enrollmentCursorSchema = z.strictObject({
  enrolledAt: timestampSchema,
  id: enrollmentIdSchema,
})

/** The body that takes an Enrollment out of its Campaign by a Rep or Admin; the reason is `removed_by_rep`. */
export const removeEnrollmentRequestSchema = z.strictObject({})

/** The kinds of entry in an Enrollment's log. */
export const ENROLLMENT_EVENT_KINDS = [
  'enrolled',
  'step_entered',
  'sent',
  'deferred',
  'refused',
  'rep_task_created',
  'branch_taken',
  'stopped',
  'completed',
] as const

/** The kind of an entry in an Enrollment's log. */
export const enrollmentEventKindSchema = z.enum(ENROLLMENT_EVENT_KINDS)

/**
 * One entry in an Enrollment's log: what happened at which Step, with the send record where one
 * exists. It holds ids and closed values only: no message text, no subject, no address.
 * `actorMembershipId` is the person who caused it (null for the engine).
 */
export const enrollmentEventSchema = z.strictObject({
  id: enrollmentEventIdSchema,
  enrollmentId: enrollmentIdSchema,
  kind: enrollmentEventKindSchema,
  stepKey: stepKeySchema.nullable(),
  variantKey: stepKeySchema.nullable(),
  sendId: sendIdSchema.nullable(),
  stopReason: enrollmentStopReasonSchema.nullable(),
  actorMembershipId: membershipIdSchema.nullable(),
  occurredAt: timestampSchema,
})

/** One entry in an Enrollment's log. */
export type EnrollmentEvent = z.infer<typeof enrollmentEventSchema>

/** One page of an Enrollment's log, newest first (by `occurredAt`, then id). */
export const listEnrollmentActivityResponseSchema = pageSchema(enrollmentEventSchema)

/** The position in an Enrollment's log. */
export const enrollmentActivityCursorSchema = z.strictObject({
  occurredAt: timestampSchema,
  id: enrollmentEventIdSchema,
})
