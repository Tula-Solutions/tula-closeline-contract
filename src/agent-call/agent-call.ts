import { z } from 'zod'
import { MAX_AGENT_CALL_SECONDS } from '../agent/values'
import { goalSchema, stepKeySchema } from '../campaign/values'
import { idempotencyKeySchema, timestampSchema } from '../core/values'
import {
  agentCallIdSchema,
  callIdSchema,
  enrollmentIdSchema,
  lineIdSchema,
  membershipIdSchema,
  prospectIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  agentCallSourceSchema,
  agentCallStateSchema,
  callEndReasonSchema,
  callGateCodeSchema,
  callResultSchema,
  MAX_CALL_ATTEMPTS,
} from './values'

/**
 * One request that the Outbound Agent place a Call, and what came of it. Ids, closed values and
 * times only: never the number, the words said or the Transcript (they are on the Call, by
 * `callId`). `result` is set exactly when the state is `ended`; an answered Call has an
 * `endReason`; a `blocked` result has the `gateCode` that refused it. A deferred request is
 * `queued` with a `gateCode` and the `retryAt` it will be tried again. A `campaign_step` request
 * names its Enrollment and Step; a `rep_request` names the Rep who asked.
 */
export const agentCallSchema = z
  .strictObject({
    id: agentCallIdSchema,
    source: agentCallSourceSchema,
    prospectId: prospectIdSchema,
    lineId: lineIdSchema.nullable(),
    enrollmentId: enrollmentIdSchema.nullable(),
    stepKey: stepKeySchema.nullable(),
    requestedByMembershipId: membershipIdSchema.nullable(),
    attempt: z.number().int().min(1).max(MAX_CALL_ATTEMPTS),
    state: agentCallStateSchema,
    result: callResultSchema.nullable(),
    endReason: callEndReasonSchema.nullable(),
    gateCode: callGateCodeSchema.nullable(),
    retryAt: timestampSchema.nullable(),
    callId: callIdSchema.nullable(),
    durationSeconds: z.number().int().min(0).max(MAX_AGENT_CALL_SECONDS).nullable(),
    createdAt: timestampSchema,
    endedAt: timestampSchema.nullable(),
  })
  .superRefine((c, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    const ended = c.state === 'ended'
    if (ended !== (c.result !== null)) {
      issue('result', 'Exactly an ended Agent Call has a result')
    }
    if (ended !== (c.endedAt !== null)) {
      issue('endedAt', 'Exactly an ended Agent Call has an end time')
    }
    if ((c.result === 'answered') !== (c.endReason !== null)) {
      issue('endReason', 'Exactly an answered Agent Call has an end reason')
    }
    if (c.result === 'blocked' && c.gateCode === null) {
      issue('gateCode', 'A blocked Agent Call has the code that refused it')
    }
    if (c.gateCode !== null && c.result !== 'blocked' && c.state !== 'queued') {
      issue('gateCode', 'Only a blocked or a deferred Agent Call has a gate code')
    }
    if ((c.state === 'queued') !== (c.retryAt !== null)) {
      issue('retryAt', 'Exactly a queued Agent Call has a retry time')
    }
    if (c.state === 'live' && c.callId === null) {
      issue('callId', 'A live Agent Call has its Call')
    }
    if ((c.state === 'queued' || c.result === 'blocked') && c.callId !== null) {
      issue('callId', 'A queued or blocked Agent Call was never dialed, so it has no Call')
    }
    if (c.durationSeconds !== null && c.callId === null) {
      issue('durationSeconds', 'Only a dialed Agent Call has a duration')
    }
    if (c.source === 'campaign_step') {
      if (c.enrollmentId === null || c.stepKey === null) {
        issue('enrollmentId', 'A Step request names its Enrollment and Step')
      }
      if (c.requestedByMembershipId !== null) {
        issue('requestedByMembershipId', 'A Step request was not made by a Rep')
      }
    } else {
      if (c.enrollmentId !== null || c.stepKey !== null) {
        issue('enrollmentId', 'A Rep request has no Enrollment or Step')
      }
      if (c.requestedByMembershipId === null) {
        issue('requestedByMembershipId', 'A Rep request names the Rep')
      }
    }
  })

/** One request that the Outbound Agent place a Call. */
export type AgentCall = z.infer<typeof agentCallSchema>

/** The path parameters of a request about one Agent Call. */
export const agentCallRecordParamsSchema = z.strictObject({ agentCallId: agentCallIdSchema })

/**
 * The body `outbound` sends to ask `voice` to place the Call of a call Step. `idempotencyKey` is
 * required and is `<enrollment id>:<step key>:<attempt>`: a known key answers the existing Agent
 * Call and dials once. The Organization is the service token's subject, never a field. There is no
 * field that waives the Contact Consent, the Disclosure or the calling window (ADR 0003).
 */
export const requestAgentCallRequestSchema = z.strictObject({
  idempotencyKey: idempotencyKeySchema,
  prospectId: prospectIdSchema,
  lineId: lineIdSchema.nullable(),
  enrollmentId: enrollmentIdSchema,
  stepKey: stepKeySchema,
  attempt: z.number().int().min(1).max(MAX_CALL_ATTEMPTS),
  goal: goalSchema,
})

/** The body that asks for the Call of a call Step. */
export type RequestAgentCallRequest = z.infer<typeof requestAgentCallRequestSchema>

/** The body a Rep sends to ask the Agent to call one Prospect now. The `Idempotency-Key` header is required (see {@link repAgentCallHeadersSchema}). `lineId` null: the default outbound Line. */
export const repAgentCallRequestSchema = z.strictObject({
  prospectId: prospectIdSchema,
  lineId: lineIdSchema.nullable(),
  goal: goalSchema,
})

/** The body that asks the Agent to call one Prospect now. */
export type RepAgentCallRequest = z.infer<typeof repAgentCallRequestSchema>

/** The headers of a Rep's request: `Idempotency-Key` is required (header names arrive lower-cased). */
export const repAgentCallHeadersSchema = z.object({ 'idempotency-key': idempotencyKeySchema })

/** The query parameters of an Agent Call list. */
export const listAgentCallsQuerySchema = pageQuerySchema
  .extend({
    state: agentCallStateSchema.optional(),
    result: callResultSchema.optional(),
    source: agentCallSourceSchema.optional(),
    prospectId: prospectIdSchema.optional(),
    enrollmentId: enrollmentIdSchema.optional(),
  })
  .strict()

/** The query parameters of an Agent Call list. */
export type ListAgentCallsQuery = z.infer<typeof listAgentCallsQuerySchema>

/** One page of Agent Calls, newest first (by `createdAt`, then id). */
export const listAgentCallsResponseSchema = pageSchema(agentCallSchema)

/** The position in an Agent Call list. */
export const agentCallCursorSchema = z.strictObject({
  createdAt: timestampSchema,
  id: agentCallIdSchema,
})
