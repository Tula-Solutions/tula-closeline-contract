import { z } from 'zod'
import { defineEvent } from '../events'
import { auditEventIdSchema } from '../ids'
import { strictAuditContentShape } from './values'

/**
 * `audit.recorded` (version 1): a service did something the log must hold. Every service publishes
 * it (through the kit's audit recorder) and core writes the row, assigning the sequence and the
 * hash. `auditEventId` is chosen by the publisher, so a redelivery writes one row. Ids, labels,
 * numbers and flags only: metadata refuses free text, recordings and secrets.
 */
export const auditRecordedEvent = defineEvent(
  'audit.recorded',
  1,
  z.strictObject({
    auditEventId: auditEventIdSchema,
    ...strictAuditContentShape,
  })
)

/** Every audit event, by type. */
export const AUDIT_EVENTS = {
  'audit.recorded': auditRecordedEvent,
} as const

/** The type of an audit event. */
export type AuditEventType = keyof typeof AUDIT_EVENTS
