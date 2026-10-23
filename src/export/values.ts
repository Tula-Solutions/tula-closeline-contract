import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { exportJobIdSchema, membershipIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'

/** The services that contribute a slice to an export. A closed list. */
export const EXPORT_SERVICES = ['core', 'playbook', 'voice', 'outbound'] as const

/** A service that contributes a slice to an export. */
export const exportServiceSchema = z.enum(EXPORT_SERVICES)

/** A service that contributes a slice to an export. */
export type ExportService = z.infer<typeof exportServiceSchema>

/** Where an export job is: queued, running, ready to download, failed, or expired (the files are gone). */
export const EXPORT_STATES = ['queued', 'running', 'ready', 'failed', 'expired'] as const

/** Where an export job is. */
export const exportStateSchema = z.enum(EXPORT_STATES)

/** Where an export job is. */
export type ExportState = z.infer<typeof exportStateSchema>

/** The states in which a job counts as running for `export.already_running`. */
export const EXPORT_ACTIVE_STATES = ['queued', 'running'] as const satisfies readonly ExportState[]

/** Where one service's slice is. */
export const EXPORT_PART_STATES = ['pending', 'ready', 'failed'] as const

/** Where one service's slice is. */
export const exportPartStateSchema = z.enum(EXPORT_PART_STATES)

/** Why an export failed: a closed list, never a vendor or system message. */
export const EXPORT_FAILURE_REASONS = ['part_failed', 'timed_out', 'storage_unavailable'] as const

/** Why an export failed. */
export const exportFailureReasonSchema = z.enum(EXPORT_FAILURE_REASONS)

/** Why an export failed. */
export type ExportFailureReason = z.infer<typeof exportFailureReasonSchema>

/** Why one service could not write its slice: a closed list, never a system message. */
export const EXPORT_PART_FAILURE_REASONS = [
  'write_failed',
  'storage_unavailable',
  'source_unavailable',
] as const

/** Why one service could not write its slice. */
export const exportPartFailureReasonSchema = z.enum(EXPORT_PART_FAILURE_REASONS)

/** The most exports one Organization may request in a day. A third is `export.daily_limit`. */
export const MAX_EXPORTS_PER_DAY = 2

/** How long a download link stays valid, in hours. */
export const EXPORT_LINK_HOURS = 24

/** The most files one service's slice may hold. */
export const MAX_EXPORT_PART_FILES = 10_000

/** The largest size of one service's slice, in bytes (50 GB). */
export const MAX_EXPORT_PART_BYTES = 50_000_000_000

/**
 * The object-storage prefix a service wrote its slice under, relative to the export bucket:
 * letters, digits and `_-./`, with no `..` and no leading slash.
 */
export const exportPrefixSchema = z
  .string()
  .max(300)
  .regex(/^[A-Za-z0-9_][A-Za-z0-9_\-./]*$/)
  .refine((prefix) => !prefix.split('/').includes('..'), 'No parent directory in a prefix')

/** The body of a request to start an export. Recordings are included as links, never copied inline. Unknown fields are refused. */
export const createExportRequestSchema = z.strictObject({
  includeRecordingLinks: z.boolean().default(false),
})

/** The body of a request to start an export. */
export type CreateExportRequest = z.infer<typeof createExportRequestSchema>

/** One service's slice of an export job. */
export const exportPartSchema = z.object({
  service: exportServiceSchema,
  state: exportPartStateSchema,
  fileCount: z.number().int().min(0).max(MAX_EXPORT_PART_FILES).nullable(),
  bytes: z.number().int().min(0).max(MAX_EXPORT_PART_BYTES).nullable(),
  readyAt: timestampSchema.nullable(),
})

/** One service's slice of an export job. */
export type ExportPart = z.infer<typeof exportPartSchema>

/**
 * An export job as read. Never carries a download link or an object-storage path: the link comes
 * only from the download call. `failureReason` is set exactly when the state is `failed`.
 */
export const exportJobSchema = z
  .object({
    id: exportJobIdSchema,
    state: exportStateSchema,
    requestedByMembershipId: membershipIdSchema,
    includeRecordingLinks: z.boolean(),
    parts: z.array(exportPartSchema).max(EXPORT_SERVICES.length),
    failureReason: exportFailureReasonSchema.nullable(),
    requestedAt: timestampSchema,
    completedAt: timestampSchema.nullable(),
    expiresAt: timestampSchema.nullable(),
  })
  .superRefine((job, ctx) => {
    if ((job.state === 'failed') !== (job.failureReason !== null)) {
      ctx.addIssue({
        code: 'custom',
        path: ['failureReason'],
        message: 'Only a failed export has a failure reason',
      })
    }
  })

/** An export job as read. */
export type ExportJob = z.infer<typeof exportJobSchema>

/** The query of an export list: cursor and limit (at most 100). */
export const listExportsQuerySchema = pageQuerySchema

/** One page of export jobs, newest first. */
export const listExportsResponseSchema = pageSchema(exportJobSchema)

/** The answer to asking for a download: a time-limited link. Returned by the call, never stored on the job. */
export const exportDownloadSchema = z.object({
  exportId: exportJobIdSchema,
  url: z.url({ protocol: /^https$/ }).max(2048),
  expiresAt: timestampSchema,
})

/** The answer to asking for a download. */
export type ExportDownload = z.infer<typeof exportDownloadSchema>
