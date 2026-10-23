import { z } from 'zod'
import { AGENT_KINDS } from '../agent/instruction'
import { timestampSchema } from '../core/values'
import {
  apiKeyIdSchema,
  auditEventIdSchema,
  membershipIdSchema,
  prospectIdSchema,
  requestIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'

/** The kinds of actor an audit event names. A closed list. */
export const AUDIT_ACTOR_KINDS = ['member', 'agent', 'api_key', 'system'] as const

/** The kind of actor of an audit event. */
export const auditActorKindSchema = z.enum(AUDIT_ACTOR_KINDS)

/** The kind of actor of an audit event. */
export type AuditActorKind = z.infer<typeof auditActorKindSchema>

/** Who or what did it: a member, an Agent (by kind), an API key (not a person) or the system. */
export const auditActorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('member'), membershipId: membershipIdSchema }),
  z.object({ kind: z.literal('agent'), agentKind: z.enum(AGENT_KINDS) }),
  z.object({ kind: z.literal('api_key'), apiKeyId: apiKeyIdSchema }),
  z.object({ kind: z.literal('system') }),
])

/** The same actor with unknown fields refused, for an event a service publishes. */
export const strictAuditActorSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('member'), membershipId: membershipIdSchema }),
  z.strictObject({ kind: z.literal('agent'), agentKind: z.enum(AGENT_KINDS) }),
  z.strictObject({ kind: z.literal('api_key'), apiKeyId: apiKeyIdSchema }),
  z.strictObject({ kind: z.literal('system') }),
])

/** Who or what did it. */
export type AuditActor = z.infer<typeof auditActorSchema>

/** What was done, in `area.verb` form, such as `draft.approved` or `agent_settings.changed`. */
export const auditActionSchema = z
  .string()
  .max(100)
  .regex(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/)

/** The kind of subject, a lower-case label such as `draft`, `call` or `api_key`. */
export const auditSubjectTypeSchema = z
  .string()
  .max(40)
  .regex(/^[a-z][a-z0-9_]*$/)

/** The id of a subject: an id of another area, such as `drf_…` or `prs_…`. */
export const auditSubjectIdSchema = z
  .string()
  .max(64)
  .regex(/^[a-z][a-z0-9_]*_[0-9a-f]{32}$/)

/** What the event was done to. */
export const auditSubjectSchema = z.object({
  type: auditSubjectTypeSchema,
  id: auditSubjectIdSchema,
})

/** What the event was done to, with unknown fields refused, for an event a service publishes. */
export const strictAuditSubjectSchema = z.strictObject({
  type: auditSubjectTypeSchema,
  id: auditSubjectIdSchema,
})

/** What the event was done to. */
export type AuditSubject = z.infer<typeof auditSubjectSchema>

/** The most entries one event's metadata may hold. */
export const MAX_AUDIT_METADATA_KEYS = 20

/** The longest string a metadata value may be, in characters: ids and labels, never prose. */
export const MAX_AUDIT_METADATA_VALUE_LENGTH = 200

/**
 * The words that may not appear in a metadata key, whether the key is `body`, `messageBody` or
 * `reply_text`, or run together as `replytext`: they name free text, recordings or secrets, which the log never holds.
 */
export const FORBIDDEN_AUDIT_METADATA_WORDS = [
  'body',
  'text',
  'message',
  'content',
  'transcript',
  'recording',
  'secret',
  'token',
  'password',
  'html',
] as const

const keyWords = (key: string): string[] =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

/** One metadata key: a short identifier, with none of {@link FORBIDDEN_AUDIT_METADATA_WORDS} as a word. */
export const auditMetadataKeySchema = z
  .string()
  .max(40)
  .regex(/^[a-z][A-Za-z0-9_]*$/)
  .refine(
    (key) => {
      const squashed = keyWords(key).join('')
      return !FORBIDDEN_AUDIT_METADATA_WORDS.some((word) => squashed.includes(word))
    },
    { message: 'A metadata key may not name free text, a recording or a secret' }
  )

/** One metadata value: a short single-line label or id, a number, a flag or null. Never prose. */
export const auditMetadataValueSchema = z.union([
  z
    .string()
    .max(MAX_AUDIT_METADATA_VALUE_LENGTH)
    .refine(
      (value) => ![...value].some((c) => (c.codePointAt(0) ?? 0) < 0x20 || c === '\u007f'),
      'No control characters'
    ),
  z.number().finite(),
  z.boolean(),
  z.null(),
])

/**
 * What else is worth knowing about an event: ids, labels, numbers and flags under short keys. It
 * refuses a key named like free text (`body`, `text`, `message`, ...), a recording or a secret, and
 * a string over 200 characters, so the log is never a second copy of a Message.
 */
export const auditMetadataSchema = z
  .record(auditMetadataKeySchema, auditMetadataValueSchema)
  .refine((metadata) => Object.keys(metadata).length <= MAX_AUDIT_METADATA_KEYS, {
    message: `At most ${MAX_AUDIT_METADATA_KEYS} metadata entries`,
  })

const auditContent = <A extends z.ZodType, S extends z.ZodType>(actor: A, subject: S) => ({
  occurredAt: timestampSchema,
  actor,
  action: auditActionSchema,
  subject: subject.nullable(),
  prospectId: prospectIdSchema.nullable(),
  instructionVersion: z.number().int().min(1).nullable(),
  requestId: requestIdSchema.nullable(),
  metadata: auditMetadataSchema,
})

/** What an audit event says, apart from its place in the chain; unknown nested fields are dropped. */
export const auditContentShape = auditContent(auditActorSchema, auditSubjectSchema)

/** What an audit event says, with unknown nested fields refused: the data of the `audit.recorded` event. */
export const strictAuditContentShape = auditContent(
  strictAuditActorSchema,
  strictAuditSubjectSchema
)

/** A SHA-256 hash as 64 lower-case hex characters. */
export const auditHashSchema = z.string().regex(/^[0-9a-f]{64}$/)

/**
 * One audit event as stored and read: immutable. `sequence` counts from 1 per Organization with no
 * gaps; `hash` covers the content and `previousHash` (null for the first), so a change anywhere
 * breaks every hash after it.
 */
export const auditEventSchema = z.object({
  id: auditEventIdSchema,
  sequence: z.number().int().min(1),
  ...auditContentShape,
  previousHash: auditHashSchema.nullable(),
  hash: auditHashSchema,
})

/** One audit event. */
export type AuditEvent = z.infer<typeof auditEventSchema>

/**
 * The most days one filtered read or CSV may span. Core enforces it and answers a wider range
 * with `audit.range_too_large`; the query schemas do not, so the caller gets the domain code.
 */
export const MAX_AUDIT_RANGE_DAYS = 366

/** The most rows one CSV page holds. */
export const MAX_AUDIT_CSV_PAGE_SIZE = 1000

/** The most events one verification pass checks. */
export const MAX_AUDIT_VERIFY_COUNT = 1000

const filterShape = {
  actorKind: auditActorKindSchema.optional(),
  actorId: z
    .string()
    .max(64)
    .regex(/^[a-z][a-z0-9_]*$/)
    .optional(),
  action: auditActionSchema.optional(),
  subjectType: auditSubjectTypeSchema.optional(),
  subjectId: auditSubjectIdSchema.optional(),
  prospectId: prospectIdSchema.optional(),
  from: timestampSchema.optional(),
  to: timestampSchema.optional(),
}

/** The filters of an audit read: actor, action, subject, Prospect and a time range of at most 366 days. */
export const auditFilterSchema = z.object(filterShape).refine(
  (filter) => {
    if (!filter.from || !filter.to) {
      return true
    }
    return Date.parse(filter.from) <= Date.parse(filter.to)
  },
  { message: 'from is not after to', path: ['from'] }
)

/** The query of an audit list: cursor, limit (at most 100) and the filters. */
export const listAuditEventsQuerySchema = pageQuerySchema.extend(filterShape)

/** One page of audit events, newest first (by sequence). */
export const listAuditEventsResponseSchema = pageSchema(auditEventSchema)

/** The query of one CSV page: a cursor and a limit of at most 1,000, with the same filters. */
export const auditCsvQuerySchema = z.object({
  ...filterShape,
  cursor: pageQuerySchema.shape.cursor,
  limit: z
    .union([z.number(), z.string().regex(/^\d{1,4}$/)])
    .transform((value) => Number(value))
    .pipe(z.number().int().min(1).max(MAX_AUDIT_CSV_PAGE_SIZE))
    .default(MAX_AUDIT_CSV_PAGE_SIZE),
})

/** The query of a verification pass: where to start and how many events to check (at most 1,000). */
export const verifyAuditQuerySchema = z.object({
  fromSequence: z
    .union([z.number(), z.string().regex(/^\d{1,12}$/)])
    .transform((value) => Number(value))
    .pipe(z.number().int().min(1))
    .default(1),
  count: z
    .union([z.number(), z.string().regex(/^\d{1,4}$/)])
    .transform((value) => Number(value))
    .pipe(z.number().int().min(1).max(MAX_AUDIT_VERIFY_COUNT))
    .default(MAX_AUDIT_VERIFY_COUNT),
})

/**
 * The answer to a verification pass: how many events were checked, the first sequence whose hash
 * or link is wrong (null when intact) and where to continue (null at the end of the log).
 */
export const verifyAuditResponseSchema = z.object({
  checked: z.number().int().min(0).max(MAX_AUDIT_VERIFY_COUNT),
  firstBrokenSequence: z.number().int().min(1).nullable(),
  nextSequence: z.number().int().min(1).nullable(),
})
