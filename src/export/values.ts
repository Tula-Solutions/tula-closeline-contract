import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { exportJobIdSchema, membershipIdSchema, prospectCompanyIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { prospectStatusSchema } from '../prospect/prospect'
import { sourceKindSchema } from '../prospect/values'

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

/** What an export holds: the whole Organization's data, or only enriched Prospect and Prospect Company data. */
export const EXPORT_KINDS = ['organization', 'enriched_prospects'] as const

/** What an export holds. */
export const exportKindSchema = z.enum(EXPORT_KINDS)

/** What an export holds. */
export type ExportKind = z.infer<typeof exportKindSchema>

/** The formats of an enriched Prospect export. CSV is the only one. */
export const ENRICHED_EXPORT_FORMATS = ['csv'] as const

/** The format of an enriched Prospect export. */
export const enrichedExportFormatSchema = z.enum(ENRICHED_EXPORT_FORMATS)

/** The format of an enriched Prospect export. */
export type EnrichedExportFormat = z.infer<typeof enrichedExportFormatSchema>

/**
 * Which Prospects an enriched export holds. Every field narrows and none is required, so `{}` is
 * every Prospect of the Organization. It is closed and bounded (ids, an enum and a Source kind of
 * at most 43 characters). `source` keeps a Prospect that has any current field value from that
 * Source, on the Prospect or its Prospect Company and has no cursor: the job pages through core itself.
 */
export const enrichedProspectsFilterSchema = z.strictObject({
  ownerMembershipId: membershipIdSchema.optional(),
  companyId: prospectCompanyIdSchema.optional(),
  status: prospectStatusSchema.optional(),
  source: sourceKindSchema.optional(),
})

/** Which Prospects an enriched export holds. */
export type EnrichedProspectsFilter = z.infer<typeof enrichedProspectsFilterSchema>

/**
 * The columns of an enriched Prospect export CSV, in order: one row per Prospect with its Prospect
 * Company. Each sourced field is followed by `<field>_source`, the Source kind of its current
 * value (`import`, `manual`, `enrichment:<provider>` and so on). Phone numbers are not enriched
 * and are left out. There is no consent evidence, IP address, user agent, transcript, message
 * body or note in any column, and none may be added.
 */
export const ENRICHED_EXPORT_COLUMNS = [
  'prospect_id',
  'status',
  'first_name',
  'first_name_source',
  'last_name',
  'last_name_source',
  'job_title',
  'job_title_source',
  'email',
  'email_source',
  'linkedin_url',
  'linkedin_url_source',
  'company_id',
  'company_name',
  'company_name_source',
  'company_domain',
  'company_domain_source',
  'company_industry',
  'company_industry_source',
  'company_employee_count',
  'company_employee_count_source',
  'company_region',
  'company_region_source',
  'company_technologies',
  'company_technologies_source',
] as const

/** The body of a request to start an export. Recordings are included as links, never copied inline. Unknown fields are refused. */
export const createExportRequestSchema = z
  .strictObject({
    kind: exportKindSchema.default('organization'),
    includeRecordingLinks: z.boolean().default(false),
    format: enrichedExportFormatSchema.optional(),
    filter: enrichedProspectsFilterSchema.optional(),
  })
  .superRefine((body, ctx) => {
    if (body.kind === 'organization') {
      for (const key of ['format', 'filter'] as const) {
        if (body[key] !== undefined) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} applies only to an enriched_prospects export`,
          })
        }
      }
    } else if (body.includeRecordingLinks) {
      ctx.addIssue({
        code: 'custom',
        path: ['includeRecordingLinks'],
        message: 'An enriched_prospects export holds no recordings',
      })
    }
  })
  .transform((body) =>
    body.kind === 'enriched_prospects' ? { ...body, format: body.format ?? ('csv' as const) } : body
  )

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
 * An export job as read (`format` and `filter` are set only for `enriched_prospects`). Never carries a download link or an object-storage path: the link comes
 * only from the download call. `failureReason` is set exactly when the state is `failed`.
 */
export const exportJobSchema = z
  .object({
    id: exportJobIdSchema,
    kind: exportKindSchema,
    format: enrichedExportFormatSchema.nullable(),
    filter: enrichedProspectsFilterSchema.nullable(),
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
    if (job.kind === 'organization' && (job.format !== null || job.filter !== null)) {
      ctx.addIssue({
        code: 'custom',
        path: ['format'],
        message: 'An organization export has no format or filter',
      })
    }
    if (job.kind === 'enriched_prospects') {
      if (job.format === null) {
        ctx.addIssue({
          code: 'custom',
          path: ['format'],
          message: 'An enriched export has a format',
        })
      }
      if (job.parts.some((part) => part.service !== 'core')) {
        ctx.addIssue({
          code: 'custom',
          path: ['parts'],
          message: 'An enriched export has only the core slice',
        })
      }
    }
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
