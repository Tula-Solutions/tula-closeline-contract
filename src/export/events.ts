import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import { exportJobIdSchema, membershipIdSchema } from '../ids'
import {
  enrichedExportFormatSchema,
  enrichedProspectsFilterSchema,
  exportPartFailureReasonSchema,
  exportPrefixSchema,
  exportServiceSchema,
  MAX_EXPORT_PART_BYTES,
  MAX_EXPORT_PART_FILES,
} from './values'

/**
 * `export.requested` (version 1): an Admin or Owner asked for an export. Every service that holds
 * a slice writes it and answers with `export.part_ready`. Ids and a flag only.
 */
export const exportRequestedEvent = defineEvent(
  'export.requested',
  1,
  z.strictObject({
    exportId: exportJobIdSchema,
    requestedByMembershipId: membershipIdSchema,
    includeRecordingLinks: z.boolean(),
    requestedAt: timestampSchema,
  })
)

/**
 * `export.enriched_prospects_requested` (version 1): an Owner or Admin asked for an enriched
 * Prospect export. Only core, which owns Prospects and their Sources, writes it: one CSV file, paged
 * internally, then `export.part_ready` (or `export.part_failed`) for `core`. Ids, a format and the
 * bounded filter only; never exported data.
 */
export const exportEnrichedProspectsRequestedEvent = defineEvent(
  'export.enriched_prospects_requested',
  1,
  z.strictObject({
    exportId: exportJobIdSchema,
    requestedByMembershipId: membershipIdSchema,
    format: enrichedExportFormatSchema,
    filter: enrichedProspectsFilterSchema.nullable(),
    requestedAt: timestampSchema,
  })
)

/**
 * `export.part_ready` (version 1): one service finished writing its slice (newline-delimited JSON and
 * files, or the one CSV of an enriched Prospect export) under `prefix`. A redelivery for the same `exportId` and `service` changes nothing.
 * Counts and a path only; never any exported data.
 */
export const exportPartReadyEvent = defineEvent(
  'export.part_ready',
  1,
  z.strictObject({
    exportId: exportJobIdSchema,
    service: exportServiceSchema,
    prefix: exportPrefixSchema,
    fileCount: z.number().int().min(0).max(MAX_EXPORT_PART_FILES),
    bytes: z.number().int().min(0).max(MAX_EXPORT_PART_BYTES),
    readyAt: timestampSchema,
  })
)

/**
 * `export.part_failed` (version 1): one service could not write its slice, so the job fails at
 * once instead of waiting for the timeout, which stays as the backstop for a service that never
 * answers. The reason is from a closed list; no message, path or exported data.
 */
export const exportPartFailedEvent = defineEvent(
  'export.part_failed',
  1,
  z.strictObject({
    exportId: exportJobIdSchema,
    service: exportServiceSchema,
    reason: exportPartFailureReasonSchema,
    failedAt: timestampSchema,
  })
)

/** Every export event, by type. */
export const EXPORT_EVENTS = {
  'export.requested': exportRequestedEvent,
  'export.enriched_prospects_requested': exportEnrichedProspectsRequestedEvent,
  'export.part_ready': exportPartReadyEvent,
  'export.part_failed': exportPartFailedEvent,
} as const

/** The type of an export event. */
export type ExportEventType = keyof typeof EXPORT_EVENTS
