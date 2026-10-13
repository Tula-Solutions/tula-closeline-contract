import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { callIdSchema, userIdSchema } from '../ids'
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
  repChoiceSchema,
  speakerLabelSchema,
} from './call-values'
import { dealIdSchema } from './deal-values'
import { documentFileNameSchema, normaliseFileName } from './values'

/**
 * A Call as the service returns it. It names the file and the Deal but never carries a Transcript,
 * audio or any turn. `kind` is what it was uploaded as. `rep` is the chosen Rep and is `null`
 * exactly while the state is `awaiting_rep` (and for a Recording not yet transcribed or failed
 * before a choice); a `ready` Call always has one. `speakerLabels` are the labels the Call's
 * speakers carry (those of the file, or `A`, `B` from the transcriber), at most
 * `MAX_CALL_SPEAKERS`, for the portal's Rep pick; they are untrusted text. `failureReason` is set
 * exactly when `state` is `failed`; `deletedAt` and `purgeAt` exactly when it is `deleted`. A
 * Transcript is never `transcribing` or `awaiting_rep`. `durationSeconds` is `null` for a
 * Transcript and until a Recording has been read. Whether the Call is held back from search
 * because its Deal is not won is read from the Deal, not here. The service must send the output of
 * `callSchema.parse(row)`, never the row.
 */
export const callSchema = z
  .object({
    id: callIdSchema,
    dealId: dealIdSchema,
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
  })

/** A Call as the service returns it. */
export type Call = z.infer<typeof callSchema>

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
  rep: z.string().max(512).optional(),
})

/** The text fields of the multipart upload of a Call. */
export type UploadCallFields = z.infer<typeof uploadCallFieldsSchema>

/** Parses the JSON text of the `rep` form field; returns undefined, never throws, for anything that is not a valid Rep choice. */
export function parseRepField(text: string): z.infer<typeof repChoiceSchema> | undefined {
  try {
    const result = repChoiceSchema.safeParse(JSON.parse(text))
    return result.success ? result.data : undefined
  } catch {
    return undefined
  }
}

/** The path parameters of a request about one Call. */
export const callParamsSchema = z.strictObject({ callId: callIdSchema })

/** The path parameters of a request about one Call. */
export type CallParams = z.infer<typeof callParamsSchema>

/**
 * The query parameters of a request to list Calls: a page, and optionally one `state` and one
 * `dealId`. With no `state`, every Call that is not `deleted` is listed; `state=deleted` lists
 * those that can still be restored, and `state=awaiting_rep` the ones waiting for a Rep. An
 * unknown parameter is rejected.
 */
export const listCallsQuerySchema = pageQuerySchema
  .extend({ state: callStateSchema.optional(), dealId: dealIdSchema.optional() })
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
