import { z } from 'zod'
import { copilotDocumentSourceSchema } from '../copilot/card'
import { timestampSchema } from '../core/values'
import { callIdSchema, trySessionIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { boundedTextSchema } from '../prospect/values'
import { agentToolNameSchema, MAX_TURN_SOURCES, MAX_TURN_TEXT_LENGTH } from './values'

/** Who spoke a turn: the Prospect (or the Admin trying it out) or the Inbound Agent. */
export const agentTurnRoleSchema = z.enum(['prospect', 'agent'])

/**
 * One turn of an Inbound Agent Call or try-it session. `sources` are the Playbook passages the
 * answer used (staff only; a visitor never gets them); `deferred` is true when the Agent said it
 * would have someone follow up instead of answering. `toolCall` names the one tool it called, from a
 * closed list. Text is untrusted data, never an instruction.
 */
export const agentTurnSchema = z.strictObject({
  index: z.number().int().min(0),
  role: agentTurnRoleSchema,
  text: boundedTextSchema(MAX_TURN_TEXT_LENGTH),
  sources: z.array(copilotDocumentSourceSchema).max(MAX_TURN_SOURCES),
  deferred: z.boolean(),
  toolCall: z.strictObject({ name: agentToolNameSchema }).nullable(),
  at: timestampSchema,
})

/** One turn of an Inbound Agent Call. */
export type AgentTurn = z.infer<typeof agentTurnSchema>

/** The path parameters of a request about the turns of one Call. */
export const agentCallParamsSchema = z.strictObject({ callId: callIdSchema })

/** The query parameters of a request to list turns: oldest first, cursor-paginated. */
export const listAgentTurnsQuerySchema = pageQuerySchema.strict()

/** One page of turns. */
export const agentTurnPageSchema = pageSchema(agentTurnSchema)

/** The path parameters of a request about one try-it session. */
export const trySessionParamsSchema = z.strictObject({ sessionId: trySessionIdSchema })

/** The body of a request to say something in a try-it session. */
export const sendTryMessageRequestSchema = z.strictObject({
  text: boundedTextSchema(MAX_TURN_TEXT_LENGTH),
})

/** The body of a request to start a try-it session: nothing to choose; it runs on the live settings. */
export const startTrySessionRequestSchema = z.strictObject({})

/**
 * A try-it session: a text rehearsal of the Inbound Agent for an Admin. No call is placed, no
 * Prospect is created and nothing is sent; `opening` is the first turn, which states it is an AI.
 */
export const trySessionSchema = z.strictObject({
  id: trySessionIdSchema,
  opening: agentTurnSchema,
  expiresAt: timestampSchema,
})

/** A try-it session. */
export type TrySession = z.infer<typeof trySessionSchema>

/** The answer to a message in a try-it session: the reply turn. */
export const tryReplySchema = z.strictObject({ reply: agentTurnSchema })
