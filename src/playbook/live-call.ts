import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { callIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { PLAYBOOK_WRITE_ROLES, type PlaybookRoute } from './routes'

/** One ended Call of the platform that waits for a Deal identifier before the Playbook ingests it. */
export const awaitingDealCallSchema = z.strictObject({
  callId: callIdSchema,
  direction: z.enum(['inbound', 'outbound']),
  endedAt: timestampSchema,
  createdAt: timestampSchema,
})

/** One Call waiting for a Deal. */
export type AwaitingDealCall = z.infer<typeof awaitingDealCallSchema>

/** The query of the awaiting-Deal list: a cursor page. */
export const listAwaitingDealCallsQuerySchema = pageQuerySchema

/** The query of the awaiting-Deal list. */
export type ListAwaitingDealCallsQuery = z.infer<typeof listAwaitingDealCallsQuerySchema>

/** One page of Calls waiting for a Deal. */
export const listAwaitingDealCallsResponseSchema = pageSchema(awaitingDealCallSchema)

/** The live-Call route names. */
export type LiveCallRouteName = 'listAwaitingDealCalls'

/**
 * The live-Call routes (spec M12). The Playbook owns them. Owner and Admin only.
 */
export const LIVE_CALL_ROUTES: Readonly<Record<LiveCallRouteName, PlaybookRoute>> = Object.freeze({
  listAwaitingDealCalls: Object.freeze({
    method: 'GET',
    path: '/playbook/calls/awaiting-deal',
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      'Lists ended platform Calls that carry no Deal identifier and so wait, in the named state awaiting_deal, before the Playbook ingests them. Oldest first, one cursor-paginated page at a time (at most 100). Each gives the Call id, its direction and when it ended. Owner and Admin only.',
  } satisfies PlaybookRoute),
})
