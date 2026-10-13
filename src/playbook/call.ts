import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { callIdSchema, dealRecordIdSchema, userIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import {
  ACCEPTED_RECORDING_EXTENSIONS,
  ACCEPTED_TRANSCRIPT_EXTENSIONS,
  type CallKind,
  callFailureReasonSchema,
  callKindSchema,
  callMediaTypeSchema,
  callStateSchema,
  MAX_CALL_SPEAKERS,
  MAX_RECORDING_BYTES,
  MAX_RECORDING_SECONDS,
  MAX_TRANSCRIPT_BYTES,
  type RepChoice,
  repChoiceSchema,
  speakerLabelSchema,
} from './call-values'
import { dealIdSchema, outcomeSchema } from './deal-values'
import { documentFileNameSchema, normaliseFileName } from './values'

/**
 * A Call as the service returns it. It names the file and the Deal but never carries a Transcript,
 * audio or any turn. `kind` is what it was uploaded as. `rep` is the chosen Rep and is `null`
 * exactly while the state is `awaiting_rep` (and for a Recording not yet transcribed or failed
 * before a choice); a `ready` Call always has one. `speakerLabels` are the labels the Call's
 * speakers carry (those of the file, or `A`, `B` from the transcriber), at most
 * `MAX_CALL_SPEAKERS`, for the portal's Rep pick; they are untrusted text. `failureReason` is set
 * exactly when `state` is `failed`; `deletedAt` and `purgeAt` exactly when it is `deleted`. A
 * Transcript is never `transcribing` or `awaiting_rep`, has no duration and is within
 * `MAX_TRANSCRIPT_BYTES`; `kind` agrees with `mediaType` (text for a Transcript, audio for a
 * Recording); the labels are unique; and a `ready` Call's speaker Rep is one of them. A Call with
 * more speakers than `MAX_CALL_SPEAKERS` fails with `too_many_speakers`, lists no speaker labels and
 * never reaches a response with more than the cap, so a read route cannot throw on it. `durationSeconds` is `null` for a
 * Transcript and until a Recording has been read. `dealRecordId` is the Deal's opaque id (the one
 * a Deal's path uses) and `dealOutcome` its Outcome; `inSearch` is true only for a `ready` Call of a
 * `won` Deal, and may be false for a Call whose Deal has just become won until the re-tag job
 * finishes (the database decides, the index may lag). `dealId` is the customer's text and is never
 * logged. The service must send the output of
 * `callSchema.parse(row)`, never the row.
 */
export const callSchema = z
  .object({
    id: callIdSchema,
    dealId: dealIdSchema,
    dealRecordId: dealRecordIdSchema,
    dealOutcome: outcomeSchema,
    inSearch: z.boolean(),
    kind: callKindSchema,
    fileName: documentFileNameSchema,
    mediaType: callMediaTypeSchema,
    sizeBytes: z.number().int().min(1).max(MAX_RECORDING_BYTES),
    durationSeconds: z.number().int().min(1).max(MAX_RECORDING_SECONDS).nullable(),
    state: callStateSchema,
    failureReason: callFailureReasonSchema.nullable(),
    rep: repChoiceSchema.nullable(),
    speakerLabels: z.array(speakerLabelSchema).max(MAX_CALL_SPEAKERS),
    deletedAt: timestampSchema.nullable(),
    purgeAt: timestampSchema.nullable(),
    uploadedByUserId: userIdSchema,
    createdAt: timestampSchema,
    updatedAt: timestampSchema,
  })
  .superRefine((call, context) => {
    const issue = (path: string, message: string) =>
      context.addIssue({ code: 'custom', path: [path], message })
    if ((call.state === 'failed') !== (call.failureReason !== null)) {
      issue('failureReason', 'A failure reason is set exactly when the state is failed')
    }
    const deleted = call.state === 'deleted'
    if (deleted !== (call.deletedAt !== null) || deleted !== (call.purgeAt !== null)) {
      issue('purgeAt', 'A deletion time and a purge time are set exactly when the state is deleted')
    }
    if (call.state === 'awaiting_rep' && call.rep !== null) {
      issue('rep', 'A Call awaiting its Rep has none')
    }
    if (call.state === 'ready' && call.rep === null) {
      issue('rep', 'A ready Call has a Rep')
    }
    if (
      call.kind === 'transcript' &&
      (call.state === 'transcribing' || call.state === 'awaiting_rep')
    ) {
      issue('state', 'A Transcript is not transcribed and has its Rep at upload')
    }
    if (call.kind === 'transcript' && call.durationSeconds !== null) {
      issue('durationSeconds', 'A Transcript has no duration')
    }
    if (call.kind === 'transcript' && call.sizeBytes > MAX_TRANSCRIPT_BYTES) {
      issue('sizeBytes', 'A Transcript is within the Transcript size limit')
    }
    if (
      call.kind === 'recording'
        ? !call.mediaType.startsWith('audio/')
        : call.mediaType.startsWith('audio/')
    ) {
      issue('mediaType', 'The kind agrees with the media type')
    }
    if (call.failureReason === 'too_many_speakers' && call.speakerLabels.length > 0) {
      issue('speakerLabels', 'A Call with too many speakers lists none')
    }
    if (new Set(call.speakerLabels).size !== call.speakerLabels.length) {
      issue('speakerLabels', 'Speaker labels are unique')
    }
    if (call.inSearch && (call.state !== 'ready' || call.dealOutcome !== 'won')) {
      issue('inSearch', 'A Call is in search only when it is ready and its Deal is won')
    }
    if (
      call.state === 'ready' &&
      call.rep?.by === 'speaker' &&
      !call.speakerLabels.includes(call.rep.label)
    ) {
      issue('rep', "A ready Call's Rep label is among its speakers")
    }
  })

/** A Call as the service returns it. */
export type Call = z.infer<typeof callSchema>

/** The most characters the `rep` form field may hold; a longer text is refused without being parsed. */
export const MAX_REP_FIELD_LENGTH = 512

/**
 * The text fields of the multipart upload of a Call, beside the one file part
 * ({@link UPLOAD_FILE_FIELD} `file`, as for a document): `dealId` (a deal id; a Deal that does not
 * exist is created `open`) and `rep`, the {@link repChoiceSchema} as JSON text, which is a speaker
 * label for a Transcript, a channel for a per-side Recording (the uploader declares it), or absent
 * for a Recording that will wait in `awaiting_rep`. The request carries an `Idempotency-Key`
 * header. Parse the text of `rep` with {@link parseRepField}.
 */
export const uploadCallFieldsSchema = z.strictObject({
  dealId: dealIdSchema,
  rep: z.string().max(MAX_REP_FIELD_LENGTH).optional(),
})

/** The text fields of the multipart upload of a Call. */
export type UploadCallFields = z.infer<typeof uploadCallFieldsSchema>

/** What {@link parseRepField} answers: a Rep choice, no Rep at all (the field was not sent), or an invalid field. */
export type ParseRepFieldResult =
  | { readonly ok: true; readonly rep: RepChoice | null }
  | { readonly ok: false; readonly code: 'call.rep_invalid' }

/**
 * Reads the `rep` form field. An absent field (`undefined`) is `{ ok: true, rep: null }`, which
 * suits a Recording that will wait in `awaiting_rep`; a field that is present but empty, longer
 * than {@link MAX_REP_FIELD_LENGTH}, not JSON or not a valid Rep choice is `call.rep_invalid`
 * (422), never silently treated as absent. It never throws.
 */
export function parseRepField(text: string | undefined): ParseRepFieldResult {
  if (text === undefined) {
    return { ok: true, rep: null }
  }
  const invalid = { ok: false, code: 'call.rep_invalid' } as const
  if (text.length === 0 || text.length > MAX_REP_FIELD_LENGTH) {
    return invalid
  }
  try {
    const result = repChoiceSchema.safeParse(JSON.parse(text))
    return result.success ? { ok: true, rep: result.data } : invalid
  } catch {
    return invalid
  }
}

/** The path parameters of a request about one Call. */
export const callParamsSchema = z.strictObject({ callId: callIdSchema })

/** The path parameters of a request about one Call. */
export type CallParams = z.infer<typeof callParamsSchema>

/**
 * The query parameters of a request to list Calls: a page, and optionally one `state` and one
 * `dealRecordId` (the Deal's opaque id; the customer's deal id never goes in a query string). With no `state`, every Call that is not `deleted` is listed; `state=deleted` lists
 * those that can still be restored, and `state=awaiting_rep` the ones waiting for a Rep. An
 * unknown parameter is rejected.
 */
export const listCallsQuerySchema = pageQuerySchema
  .extend({ state: callStateSchema.optional(), dealRecordId: dealRecordIdSchema.optional() })
  .strict()

/** The query parameters of a request to list Calls. */
export type ListCallsQuery = z.infer<typeof listCallsQuerySchema>

/** One page of Calls. */
export const listCallsResponseSchema = pageSchema(callSchema)

/** One page of Calls. */
export type ListCallsResponse = z.infer<typeof listCallsResponseSchema>

/**
 * The body of the request that picks or changes a Call's Rep: a required choice (`null` is not a
 * choice). It is for a Call `awaiting_rep`, `ready` or `failed`, otherwise `call.rep_not_changeable`;
 * a choice that does not suit the Call's kind or, for a speaker, is not among its labels is
 * `call.rep_invalid`. It is idempotent by end state.
 */
export const setCallRepRequestSchema = z.strictObject({ rep: repChoiceSchema })

/** The body of the request that picks or changes a Call's Rep. */
export type SetCallRepRequest = z.infer<typeof setCallRepRequestSchema>

const CALL_FILE_KEYS: readonly string[] = ['fileName', 'declaredMediaType', 'sizeBytes']

/** What the service reads off the file part of a Call upload, and the kind it was recognised as. */
export const uploadCallFileSchema = z.strictObject({
  fileName: documentFileNameSchema,
  declaredMediaType: z.string().max(255).nullable(),
  sizeBytes: z.number().int().min(1),
})

/** The answer of {@link checkCallFile}: the parsed file and its kind, or the one error code to return. */
export type CheckCallFileResult =
  | {
      readonly ok: true
      readonly kind: CallKind
      readonly file: z.infer<typeof uploadCallFileSchema>
    }
  | {
      readonly ok: false
      readonly code: 'call.too_large' | 'call.unsupported_type' | 'request.invalid'
    }

function callKindOf(fileName: string): CallKind | undefined {
  const lower = fileName.toLowerCase()
  if (ACCEPTED_TRANSCRIPT_EXTENSIONS.some((extension) => lower.endsWith(extension))) {
    return 'transcript'
  }
  if (ACCEPTED_RECORDING_EXTENSIONS.some((extension) => lower.endsWith(extension))) {
    return 'recording'
  }
  return undefined
}

/**
 * The one call that checks the file part of a Call upload, in the style of `checkUploadFile`. It
 * runs the size check first against the largest limit (`MAX_RECORDING_BYTES`, `call.too_large`
 * 413), then the type on the stored form of the name (`call.unsupported_type` 415: the extension
 * is judged after control and bidirectional characters are stripped and the name trimmed), then
 * the limit of the recognised kind (a Transcript over `MAX_TRANSCRIPT_BYTES` is `call.too_large`),
 * then the shape (`request.invalid`). The kind comes from the extension; the service confirms it
 * from the content. Fields are read once, as own properties, into a copy all checks use, and a
 * non-finite size, a missing field or an extra own key is `request.invalid`. The Recording's
 * duration is not known here: the job checks `MAX_RECORDING_SECONDS`. The result carries no name or
 * content, so it is safe to log.
 */
export function checkCallFile(input: unknown): CheckCallFileResult {
  const invalid = { ok: false, code: 'request.invalid' } as const
  if (typeof input !== 'object' || input === null) {
    return invalid
  }
  if (Object.keys(input).some((key) => !CALL_FILE_KEYS.includes(key))) {
    return invalid
  }
  const copy: Record<string, unknown> = Object.create(null)
  for (const key of CALL_FILE_KEYS) {
    if (Object.hasOwn(input, key)) {
      copy[key] = (input as Record<string, unknown>)[key]
    }
  }
  const { fileName, sizeBytes } = copy
  if (
    typeof fileName !== 'string' ||
    typeof sizeBytes !== 'number' ||
    !Number.isFinite(sizeBytes)
  ) {
    return invalid
  }
  if (sizeBytes > MAX_RECORDING_BYTES) {
    return { ok: false, code: 'call.too_large' }
  }
  const kind = callKindOf(normaliseFileName(fileName))
  if (kind === undefined) {
    return { ok: false, code: 'call.unsupported_type' }
  }
  if (kind === 'transcript' && sizeBytes > MAX_TRANSCRIPT_BYTES) {
    return { ok: false, code: 'call.too_large' }
  }
  const parsed = uploadCallFileSchema.safeParse(copy)
  return parsed.success ? { ok: true, kind, file: parsed.data } : invalid
}

/** The position a Call list continues from: `createdAt`, then the Call's own `id`. It never holds a deal id. */
export const callCursorSchema = z.strictObject({ createdAt: timestampSchema, id: callIdSchema })

/** The position a Call list continues from. */
export type CallCursor = z.infer<typeof callCursorSchema>
