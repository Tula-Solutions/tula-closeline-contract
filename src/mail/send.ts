import { z } from 'zod'
import { idempotencyKeySchema, timestampSchema } from '../core/values'
import {
  campaignIdSchema,
  enrollmentIdSchema,
  mailboxIdSchema,
  prospectIdSchema,
  sendIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'

/**
 * The checks run before every send, in this order: the Campaign is running (`campaign`), the send
 * is inside the window (`window`), the address is verified (`address`), core's decision allows it
 * (`suppression` and `consent`), the Mailbox is usable (`mailbox`), it is under its limits
 * (`limits`), the Organization is under its daily cap (`organization_cap`) and the key is new
 * (`idempotency`). None has a setting that turns it off.
 */
export const SEND_CHECKS = [
  'campaign',
  'window',
  'address',
  'suppression',
  'consent',
  'mailbox',
  'limits',
  'organization_cap',
  'idempotency',
] as const

/** A check run before a send. */
export const sendCheckSchema = z.enum(SEND_CHECKS)

/** A check run before a send. */
export type SendCheck = z.infer<typeof sendCheckSchema>

/**
 * The state of a send record: `sending` (recorded before the transport call; if the process stops
 * here the send is reconciled against the provider's Sent folder, never repeated blind), `sent`,
 * `refused` (a check said no; never retried blindly), `deferred` (a limit or window said not yet;
 * it will be tried again) and `failed` (the provider refused it).
 */
export const SEND_STATES = ['sending', 'sent', 'refused', 'deferred', 'failed'] as const

/** The state of a send record. */
export const sendStateSchema = z.enum(SEND_STATES)

/** The state of a send record. */
export type SendState = z.infer<typeof sendStateSchema>

/**
 * Why a send was refused or deferred: a closed set, never free text. The first six match the
 * checks; `campaign_not_running`, `mailbox_unavailable` and `limit_reached` and
 * `organization_cap_reached` name the rest. `duplicate` is a key already used.
 */
export const SEND_REFUSAL_REASONS = [
  'campaign_not_running',
  'outside_window',
  'unverified_address',
  'suppressed',
  'no_consent',
  'mailbox_unavailable',
  'limit_reached',
  'organization_cap_reached',
  'duplicate',
] as const

/** Why a send was refused or deferred. */
export const sendRefusalReasonSchema = z.enum(SEND_REFUSAL_REASONS)

/** Why a send was refused or deferred. */
export type SendRefusalReason = z.infer<typeof sendRefusalReasonSchema>

/** The reasons that defer a send to a later try instead of refusing it for good. */
export const SEND_DEFERRING_REASONS = [
  'outside_window',
  'limit_reached',
  'organization_cap_reached',
] as const satisfies readonly SendRefusalReason[]

/** The longest attempt epoch of a send key. */
export const MAX_ATTEMPT_EPOCH = 1000

/** The most Steps a Sequence has, as far as a send key goes. */
export const MAX_SEQUENCE_STEP = 1000

/**
 * The send key: an Enrollment, the Step and the attempt epoch. One key is sent at most once, and
 * the transport call carries it where the provider allows; otherwise a header of the message does.
 */
export const sendKeySchema = z.strictObject({
  enrollmentId: enrollmentIdSchema,
  step: z.number().int().min(0).max(MAX_SEQUENCE_STEP),
  attemptEpoch: z.number().int().min(0).max(MAX_ATTEMPT_EPOCH),
})

/** The send key. */
export type SendKey = z.infer<typeof sendKeySchema>

/** One check and how it came out, as the decision record keeps it. */
export const sendCheckResultSchema = z.object({
  check: sendCheckSchema,
  passed: z.boolean(),
})

/**
 * The record of one send decision: which Step of which Enrollment, through which Mailbox
 * (null when none was chosen), what each check said, and the outcome with its reason. A `refused`
 * or `deferred` record names the reason, and a `deferred` one `retryAt`; a `sent`, `sending` or
 * `failed` one names the Mailbox. It holds no message body, no subject and no address: ids, closed
 * values and times only.
 */
export const sendRecordSchema = z
  .object({
    id: sendIdSchema,
    campaignId: campaignIdSchema,
    enrollmentId: enrollmentIdSchema,
    prospectId: prospectIdSchema,
    step: z.number().int().min(0).max(MAX_SEQUENCE_STEP),
    attemptEpoch: z.number().int().min(0).max(MAX_ATTEMPT_EPOCH),
    mailboxId: mailboxIdSchema.nullable(),
    state: sendStateSchema,
    reason: sendRefusalReasonSchema.nullable(),
    checks: z.array(sendCheckResultSchema).max(SEND_CHECKS.length),
    retryAt: timestampSchema.nullable(),
    decidedAt: timestampSchema,
    sentAt: timestampSchema.nullable(),
  })
  .superRefine((r, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    const declined = r.state === 'refused' || r.state === 'deferred'
    if (declined !== (r.reason !== null)) {
      issue('reason', 'Exactly a refused or deferred send names a reason')
    }
    if ((r.state === 'deferred') !== (r.retryAt !== null)) {
      issue('retryAt', 'Exactly a deferred send says when it is tried again')
    }
    if (
      r.state === 'deferred' &&
      r.reason !== null &&
      !(SEND_DEFERRING_REASONS as readonly string[]).includes(r.reason)
    ) {
      issue('reason', 'This reason refuses a send, it does not defer it')
    }
    if (
      r.state === 'refused' &&
      r.reason !== null &&
      (SEND_DEFERRING_REASONS as readonly string[]).includes(r.reason)
    ) {
      issue('reason', 'This reason defers a send, it does not refuse it')
    }
    if (['sending', 'sent', 'failed'].includes(r.state) && r.mailboxId === null) {
      issue('mailboxId', 'A send that reached the transport names its Mailbox')
    }
    if ((r.state === 'sent') !== (r.sentAt !== null)) {
      issue('sentAt', 'Exactly a sent send has a sent time')
    }
  })

/** The record of one send decision. */
export type SendRecord = z.infer<typeof sendRecordSchema>

/** The path parameters of a request about one send record. */
export const sendParamsSchema = z.strictObject({ sendId: sendIdSchema })

/**
 * The body of a request to send one Step. The key is the Enrollment, Step and attempt epoch; the
 * Idempotency-Key header must carry the same string form (`enr_…:step:epoch`) so a replay answers
 * the same record. The message text is not in the body: outbound reads the Draft held by the
 * sequence engine.
 */
export const submitSendRequestSchema = z.strictObject({
  campaignId: campaignIdSchema,
  prospectId: prospectIdSchema,
  key: sendKeySchema,
  acceptUnverifiedAddress: z.boolean().default(false),
})

/** The body of a request to send one Step. */
export type SubmitSendRequest = z.infer<typeof submitSendRequestSchema>

/** The one string form of a send key used as an Idempotency-Key: `<enrollment id>:<step>:<epoch>`. */
export function sendKeyToString(key: SendKey): string {
  return idempotencyKeySchema.parse(`${key.enrollmentId}:${key.step}:${key.attemptEpoch}`)
}

/**
 * What a limit refusal carries in `details`: which limit was reached and how many whole seconds to
 * wait, as a `Retry-After` header says too.
 */
export const limitDetailsSchema = z.strictObject({
  limit: z.enum(['per_day', 'per_hour', 'min_gap', 'organization_daily_cap']),
  retryAfter: z.number().int().positive(),
})

/** What a limit refusal carries in `details`. */
export type LimitDetails = z.infer<typeof limitDetailsSchema>

/** The cursor position a send list resumes from: newest first, then id. */
export const sendCursorSchema = z.strictObject({ decidedAt: timestampSchema, id: sendIdSchema })

/** The query of a request to list send records, newest first, narrowed by Campaign, Prospect, Mailbox, state, reason and time. */
export const listSendsQuerySchema = pageQuerySchema
  .extend({
    campaignId: campaignIdSchema.optional(),
    prospectId: prospectIdSchema.optional(),
    mailboxId: mailboxIdSchema.optional(),
    state: sendStateSchema.optional(),
    reason: sendRefusalReasonSchema.optional(),
    from: timestampSchema.optional(),
    to: timestampSchema.optional(),
  })
  .strict()

/** The query of a request to list send records. */
export type ListSendsQuery = z.infer<typeof listSendsQuerySchema>

/** One page of send records. */
export const sendPageSchema = pageSchema(sendRecordSchema)
