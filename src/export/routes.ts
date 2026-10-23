import { IDEMPOTENT_ERRORS, type InboundRoute, inboundRoute } from '../inbound-route'
import type { Role } from '../tenancy'
import type { ExportErrorCode } from './errors'

/** The roles that request, read and download an export. */
export const EXPORT_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The export route names. */
export type ExportRouteName = 'createExport' | 'listExports' | 'getExport' | 'createExportDownload'

/** One export route. */
export type ExportRoute = InboundRoute<ExportErrorCode>

const KEY =
  'Requires an Idempotency-Key header: a replay answers the same result and does the work once.'

const ORG_ONLY =
  "An export belongs to the caller's Organization alone; one of another Organization is export.not_found (404), never 403."

const SAFE =
  'The export leaves out password hashes, tokens, API keys and their hashes, and every row of another Organization.'

/**
 * The export routes (spec M16). Core orchestrates; each service writes its own slice. Owner and
 * Admin only. The request, the download and each failure are audited.
 */
export const EXPORT_ROUTES: Readonly<Record<ExportRouteName, ExportRoute>> = Object.freeze({
  createExport: inboundRoute({
    method: 'POST',
    path: '/v1/exports',
    roles: EXPORT_ROLES,
    success: [202, 200],
    idempotent: true,
    keyRequired: true,
    errors: ['export.already_running', 'export.daily_limit'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Starts an export of the Organization's data and answers 202 with the job; nothing is built on the request. It publishes export.requested, each service writes its slice and publishes export.part_ready (or export.part_failed, which fails the job at once; the timeout is the backstop), and core builds the manifest. Recordings are included as links on request, never copied inline. ${SAFE} Only one export runs at a time (export.already_running, 409) and at most two are requested in 24 hours (export.daily_limit, 429). ${KEY} The same key twice answers 200 with the same job. Owner and Admin only. ${ORG_ONLY}`,
  }),
  listExports: inboundRoute({
    method: 'GET',
    path: '/v1/exports',
    roles: EXPORT_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description: `Lists the Organization's export jobs, newest first, one cursor-paginated page at a time (at most 100). A job shows its state, each service's slice, the failure reason when it failed and when it expires; never a download link. Owner and Admin only. ${ORG_ONLY}`,
  }),
  getExport: inboundRoute({
    method: 'GET',
    path: '/v1/exports/{exportId}',
    roles: EXPORT_ROLES,
    success: [200],
    idempotent: false,
    errors: ['export.not_found'],
    commonErrors: [],
    description: `Reads one export job: its state, the state of each service's slice, the failure reason (part_failed, timed_out or storage_unavailable) and its expiry. A service that cannot write its slice reports export.part_failed and the job fails at once; the timeout (timed_out) is only the backstop for a service that never answers. Poll it, or wait for the notice that it finished or failed. Never carries a download link. Owner and Admin only. ${ORG_ONLY}`,
  }),
  createExportDownload: inboundRoute({
    method: 'POST',
    path: '/v1/exports/{exportId}/download-links',
    roles: EXPORT_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ['export.not_found', 'export.not_ready', 'export.expired'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Makes a download link for a ready export, valid for 24 hours from the export finishing and no longer than that. An export that has not finished or has failed is export.not_ready (409); one past its expiry is export.expired (410). ${KEY} The same key answers the same link. The link is never logged and never stored on the job. Owner and Admin only. The download is audited. ${ORG_ONLY}`,
  }),
})
