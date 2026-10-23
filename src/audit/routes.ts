import { type InboundRoute, inboundRoute } from '../inbound-route'
import type { Role } from '../tenancy'
import type { AuditErrorCode } from './errors'

/** The roles that read the audit log: an Owner or Admin all of it, a Manager the events about their Team's Prospects. */
export const AUDIT_READ_ROLES = ['owner', 'admin', 'manager'] as const satisfies readonly Role[]

/** The roles that download the log as CSV and verify its chain. */
export const AUDIT_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The audit route names. */
export type AuditRouteName =
  | 'listAuditEvents'
  | 'getAuditEvent'
  | 'downloadAuditCsv'
  | 'verifyAuditLog'

/** One audit route. */
export type AuditRoute = InboundRoute<AuditErrorCode>

const NO_WRITE =
  'There is no route to write, change or delete an event: services record them through the audit.recorded event, and core writes its own.'

const RANGE = 'The time range (from, to) spans at most 366 days, else audit.range_too_large (422).'

const NO_TEXT =
  'An event holds ids and labels only: never Message text, recordings, secrets or free text.'

/**
 * The audit routes (spec M16). Core owns them. The log is append-only and hash-chained per
 * Organization; these routes only read and verify it. Every list is cursor-paginated with a page of
 * at most 100 (1,000 for a CSV page).
 */
export const AUDIT_ROUTES: Readonly<Record<AuditRouteName, AuditRoute>> = Object.freeze({
  listAuditEvents: inboundRoute({
    method: 'GET',
    path: '/v1/audit-events',
    roles: AUDIT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ['audit.range_too_large'],
    commonErrors: ['request.invalid'],
    description: `Lists audit events, newest first, one cursor-paginated page at a time (at most 100), filtered by actor kind and id, action, subject, Prospect and time. ${RANGE} An Owner or Admin sees every event; a Manager only events about Prospects owned by Reps on their Team; a Rep none (auth.forbidden). Each event names its actor (member, agent, api_key or system), the instruction version it ran under, the request id and its place in the hash chain. ${NO_TEXT} ${NO_WRITE}`,
  }),
  getAuditEvent: inboundRoute({
    method: 'GET',
    path: '/v1/audit-events/{auditEventId}',
    roles: AUDIT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ['audit.event_not_found'],
    commonErrors: [],
    description:
      "Reads one audit event. An event outside the caller's view, or of another Organization, is audit.event_not_found (404), never 403. Owner and Admin see every event; a Manager only those about their Team's Prospects.",
  }),
  downloadAuditCsv: inboundRoute({
    method: 'GET',
    path: '/v1/audit-csv',
    roles: AUDIT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['audit.range_too_large'],
    commonErrors: ['request.invalid'],
    description: `Downloads the filtered log as text/csv, oldest first, one cursor-paginated page at a time (at most 1,000 rows); the next cursor is in the x-next-cursor response header, absent on the last page. The filters are those of the list. ${RANGE} Cells that start with =, +, - or @ are escaped so a spreadsheet does not run them. Owner and Admin only. The download is itself audited. ${NO_TEXT}`,
  }),
  verifyAuditLog: inboundRoute({
    method: 'GET',
    path: '/v1/audit-verification',
    roles: AUDIT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      'Checks that the hash chain has not been altered, from a sequence number for at most 1,000 events per call, so the work does not grow with the log. Answers how many events were checked, the first sequence whose hash or link is wrong (null when intact) and where to continue (null at the end). A caller walks the log with nextSequence. Owner and Admin only.',
  }),
})
