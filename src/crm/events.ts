import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import { crmConnectionIdSchema, crmSyncRunIdSchema, membershipIdSchema } from '../ids'
import { crmObjectKindSchema, crmProviderSchema } from './values'

/**
 * `crm.connected` (version 1): an Owner or Admin connected a CRM. Ids and the provider only; no
 * token, scope list, account name or CRM data.
 */
export const crmConnectedEvent = defineEvent(
  'crm.connected',
  1,
  z.strictObject({
    connectionId: crmConnectionIdSchema,
    provider: crmProviderSchema,
    connectedByMembershipId: membershipIdSchema,
    connectedAt: timestampSchema,
  })
)

/**
 * `crm.disconnected` (version 1): a CRM connection ended and its tokens were deleted. The member who
 * disconnected is `null` when the connection ended without one (not used by the first release).
 */
export const crmDisconnectedEvent = defineEvent(
  'crm.disconnected',
  1,
  z.strictObject({
    connectionId: crmConnectionIdSchema,
    provider: crmProviderSchema,
    disconnectedByMembershipId: membershipIdSchema.nullable(),
    disconnectedAt: timestampSchema,
  })
)

/**
 * `crm.run_completed` (version 1): a sync run reached `completed` or `failed`. Ids and the end
 * state only: counts and reasons are read from the run, never carried here.
 */
export const crmRunCompletedEvent = defineEvent(
  'crm.run_completed',
  1,
  z.strictObject({
    runId: crmSyncRunIdSchema,
    connectionId: crmConnectionIdSchema,
    provider: crmProviderSchema,
    objectKind: crmObjectKindSchema,
    state: z.enum(['completed', 'failed']),
    completedAt: timestampSchema,
  })
)

/** Every CRM event, by type. */
export const CRM_EVENTS = {
  'crm.connected': crmConnectedEvent,
  'crm.disconnected': crmDisconnectedEvent,
  'crm.run_completed': crmRunCompletedEvent,
} as const

/** The type of a CRM event. */
export type CrmEventType = keyof typeof CRM_EVENTS
