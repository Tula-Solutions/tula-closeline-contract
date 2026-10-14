import { z } from 'zod'
import {
  hasStrippableCharacter,
  isWellFormedText,
  MAX_UTF8_BYTES_PER_CODE_POINT,
  normaliseFileName,
} from './values'

/**
 * The states a Call is in (ADR 0018, with ADR 0016). A Transcript goes `uploaded`, `processing`,
 * `ready`; a Recording goes `uploaded`, `transcribing`, then `awaiting_rep` (no Rep chosen yet) or
 * `processing`, then `ready`. `processing` is also where a Call goes when its Rep changes and its
 * Moments are rebuilt, and where a restored Call goes. `awaiting_rep` is the named wait of choice 9:
 * no Moments exist and the Call is not in search. `deleted` is soft-deleted and awaiting purge. A
 * Call held back from search because its Deal is not won is `ready`: that is read from the Deal,
 * not a state. An upload still streaming has no Call yet, so it has no state.
 */
export const CALL_STATES = [
  'uploaded',
  'transcribing',
  'awaiting_rep',
  'processing',
  'ready',
  'failed',
  'deleted',
] as const

/** The state of a Call. */
export const callStateSchema = z.enum(CALL_STATES)

/** The state of a Call. */
export type CallState = z.infer<typeof callStateSchema>

/**
 * Why a Call ended in `failed`: a closed list the portal maps to its own wording, never free text.
 * `too_long` is found by the job from the audio, not at upload, so it is a reason and not an HTTP
 * code. `too_many_speakers` is a Call with more speakers than `MAX_CALL_SPEAKERS`. `rep_label_not_found` and `not_per_side` can be fixed by changing the Rep (see {@link repChangeAllowed}). The list is the
 * lead's reading of ADR 0018.
 */
export const CALL_FAILURE_REASONS = [
  'no_turns',
  'too_few_speakers',
  'too_many_speakers',
  'rep_label_not_found',
  'not_per_side',
  'too_long',
  'transcription_failed',
  'transcription_timed_out',
  'unreadable',
  'processing_failed',
] as const

/** Why a Call ended in `failed`. */
export const callFailureReasonSchema = z.enum(CALL_FAILURE_REASONS)

/** Why a Call ended in `failed`. */
export type CallFailureReason = z.infer<typeof callFailureReasonSchema>

/** What a Call was uploaded as: a written Transcript or an audio Recording. */
export const CALL_KINDS = ['transcript', 'recording'] as const

/** What a Call was uploaded as. */
export const callKindSchema = z.enum(CALL_KINDS)

/** What a Call was uploaded as. */
export type CallKind = z.infer<typeof callKindSchema>

/** The lead's default (ADR 0018, refinements; not the owner's): the Transcript extensions accepted: plain text, WebVTT, SRT and a JSON turn list. */
export const ACCEPTED_TRANSCRIPT_EXTENSIONS = ['.txt', '.vtt', '.srt', '.json'] as const

/** The lead's default (ADR 0018, refinements; not the owner's): the Recording extensions accepted. */
export const ACCEPTED_RECORDING_EXTENSIONS = [
  '.mp3',
  '.m4a',
  '.wav',
  '.ogg',
  '.webm',
  '.flac',
] as const

/** An accepted Call file extension. */
export type AcceptedCallExtension =
  | (typeof ACCEPTED_TRANSCRIPT_EXTENSIONS)[number]
  | (typeof ACCEPTED_RECORDING_EXTENSIONS)[number]

/** The media type of a stored Call file, as the service detected it from the content. */
export const CALL_MEDIA_TYPES = [
  'text/plain',
  'text/vtt',
  'application/x-subrip',
  'application/json',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
] as const

/** The media type of a stored Call file. */
export const callMediaTypeSchema = z.enum(CALL_MEDIA_TYPES)

/** The media type of a stored Call file. */
export type CallMediaType = z.infer<typeof callMediaTypeSchema>

/** The media type each accepted Call extension stands for. */
export const MEDIA_TYPE_BY_CALL_EXTENSION: Readonly<Record<AcceptedCallExtension, CallMediaType>> =
  Object.freeze({
    '.txt': 'text/plain',
    '.vtt': 'text/vtt',
    '.srt': 'application/x-subrip',
    '.json': 'application/json',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.webm': 'audio/webm',
    '.flac': 'audio/flac',
  })

/** The lead's default (ADR 0018, refinements; not the owner's): the largest Transcript accepted, 5 MB counted as 5 * 1024 * 1024 bytes. */
export const MAX_TRANSCRIPT_BYTES = 5 * 1024 * 1024

/** The lead's default (ADR 0018, refinements; not the owner's): the largest Recording accepted, 500 MB counted as 500 * 1024 * 1024 bytes; streamed, never held whole. */
export const MAX_RECORDING_BYTES = 500 * 1024 * 1024

/** The lead's default (ADR 0018, refinements; not the owner's): the longest Recording, 3 hours in seconds; the job checks it, so a longer one ends `failed` with `too_long`. */
export const MAX_RECORDING_SECONDS = 3 * 60 * 60

/** The ticket's default (ADR 0018 leaves it open): hours after which the parts of an incomplete streamed upload are discarded. */
export const INCOMPLETE_UPLOAD_PARTS_TTL_HOURS = 24

/** The ticket's default (ADR 0018 leaves it open): the most Rep turns stored after a Moment (choice 11). */
export const MAX_REP_FOLLOWING_TURNS = 5

/** The ticket's default (ADR 0018 leaves it open): the most characters (Unicode code points) of Rep turns stored after a Moment, so a long turn cannot make it unbounded. */
export const MAX_REP_FOLLOWING_CHARACTERS = 4000

/** The ticket's default (ADR 0018 leaves it open): Calls an Organization may hold, soft-deleted and `awaiting_rep` ones included until purged. */
export const DEFAULT_MAX_CALLS = 2000

/** The ticket's default (ADR 0018 leaves it open): Recording bytes an Organization may hold, 50 GB counted as 50 * 1024^3. */
export const DEFAULT_MAX_RECORDING_BYTES_TOTAL = 50 * 1024 * 1024 * 1024

/** The ticket's default (ADR 0018 leaves it open): Deals an Organization may hold. */
export const DEFAULT_MAX_DEALS = 20_000

/** The ticket's default (ADR 0018 leaves it open): the most speakers a Call may have and list for a Rep pick; a Call with more fails with `too_many_speakers`. */
export const MAX_CALL_SPEAKERS = 20

/** The longest speaker label, in Unicode code points, once control and direction characters are stripped. */
export const MAX_SPEAKER_LABEL_LENGTH = 64

/** The most UTF-8 bytes a stored speaker label can take: 64 code points at 4 bytes each. A column must allow this many bytes. */
export const MAX_SPEAKER_LABEL_BYTES = MAX_SPEAKER_LABEL_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT

/** The stored form of a speaker label: control and bidirectional characters removed, then trimmed. Labels read from a file and labels in a request must both pass through this. */
export function normaliseSpeakerLabel(label: string): string {
  return normaliseFileName(label)
}

/**
 * A speaker label, in a request and in a response: at most 1000 raw Unicode code points, then control and
 * bidirectional characters are removed and the rest trimmed to 1 to 64 well-formed Unicode code
 * points (at most `MAX_SPEAKER_LABEL_BYTES` bytes in UTF-8). It is text taken from a file (`Alice`, or `A` from the transcriber), so display code must
 * treat it as untrusted text, and it never appears in an error body. It is compared exactly and
 * case-sensitively with the labels in the file.
 */
export const speakerLabelSchema = z
  .string()
  .max(1000)
  .transform(normaliseSpeakerLabel)
  .pipe(
    z
      .string()
      .min(1)
      .max(MAX_SPEAKER_LABEL_LENGTH)
      .refine(isWellFormedText, 'Well-formed text only')
      .refine((label) => !hasStrippableCharacter(label), 'No control characters')
  )

/** The most Unicode code points of a speaker excerpt, the ellipsis included. */
export const MAX_SPEAKER_EXCERPT_LENGTH = 240

/** Whitespace, plus the C1 line break U+0085 (which `\s` misses and the label cleaner would otherwise glue words over). */
const SPACES = new RegExp(`[\\s${String.fromCharCode(0x85)}]+`, 'g')

const ELLIPSIS = String.fromCodePoint(0x2026)

function isLoneSurrogate(char: string): boolean {
  const code = char.codePointAt(0) ?? 0
  return char.length === 1 && code >= 0xd800 && code <= 0xdfff
}

/**
 * Cleans text for a short excerpt or snippet and cuts it to `max` code points: whitespace
 * (newlines and tabs included) collapsed to one space, control and bidirectional characters and
 * lone surrogates removed, then, when still too long, cut at a word boundary with an ellipsis (a
 * single word longer than `max` is cut hard); the cut never splits a code point. What it returns
 * always passes the excerpt and snippet schemas. The result is tenant text: never log it.
 */
export function excerptText(text: string, max: number): string {
  const collapse = (value: string) => value.replace(SPACES, ' ')
  const clean = collapse(normaliseSpeakerLabel(collapse(text)))
  const chars = Array.from(clean).filter((char) => !isLoneSurrogate(char))
  if (chars.length <= max) {
    return chars.join('')
  }
  const room = max - 1
  let end = room
  if (chars[room] !== ' ') {
    const space = chars.slice(0, room).lastIndexOf(' ')
    end = space > 0 ? space : room
  }
  return chars.slice(0, end).join('').trimEnd() + ELLIPSIS
}

/**
 * Builds the excerpt that helps a person pick the Rep: the speaker's first turns joined with a
 * space and cleaned and cut by {@link excerptText} to at most `MAX_SPEAKER_EXCERPT_LENGTH` code
 * points. The result is tenant Transcript text: never log it.
 */
export function speakerExcerpt(turns: readonly string[]): string {
  return excerptText(turns.join(' '), MAX_SPEAKER_EXCERPT_LENGTH)
}

/**
 * One speaker of a Call with a short excerpt of what they said, so a person can tell who is the
 * Rep. The label is untrusted text from the file and the excerpt is tenant Transcript text: both
 * are returned only to the owning Organization's Owner and Admin and are never logged.
 */
export const speakerExcerptSchema = z.strictObject({
  label: speakerLabelSchema,
  excerpt: z
    .string()
    .min(1)
    .max(MAX_SPEAKER_EXCERPT_LENGTH * 2)
    .refine((text) => Array.from(text).length <= MAX_SPEAKER_EXCERPT_LENGTH, 'Within the cap')
    .refine(isWellFormedText, 'Well-formed text only')
    .refine((text) => !hasStrippableCharacter(text), 'No control characters'),
})

/** One speaker of a Call with a short excerpt. */
export type SpeakerExcerpt = z.infer<typeof speakerExcerptSchema>

/** The channels of a per-side Recording: the left one or the right one. */
export const CALL_CHANNELS = ['left', 'right'] as const

/** A channel of a per-side Recording. */
export const callChannelSchema = z.enum(CALL_CHANNELS)

/**
 * Which side of a Call is the Rep: a speaker label (a Transcript, or a Recording that waited in
 * `awaiting_rep`) or a channel (a per-side Recording). A Recording whose Rep is not yet known has
 * no choice at all (`null` on the Call, an absent `rep` at upload).
 */
export const repChoiceSchema = z.discriminatedUnion('by', [
  z.strictObject({ by: z.literal('speaker'), label: speakerLabelSchema }),
  z.strictObject({ by: z.literal('channel'), channel: callChannelSchema }),
])

/** Which side of a Call is the Rep. */
export type RepChoice = z.infer<typeof repChoiceSchema>

/**
 * Whether a Rep choice suits a Call of this kind, for the one moment named. At `upload`, a
 * Transcript needs a speaker label (ADR 0018, refinements), and a Recording takes a channel (the
 * uploader declares it per-side) or nothing (it then waits in `awaiting_rep`); a speaker label for
 * a Recording is not known at upload. At `change`, a choice is required: a Transcript takes a
 * speaker label and a Recording takes a speaker label (from the detected speakers) or a channel.
 * Whether a channel fits the file (exactly two channels) is the service's check, and a mismatch
 * ends the Call `failed` with `not_per_side`. A failure here is `call.rep_invalid`.
 */
export function repChoiceSuits(
  kind: CallKind,
  rep: RepChoice | null | undefined,
  when: 'upload' | 'change'
): boolean {
  if (rep === null || rep === undefined) {
    return when === 'upload' && kind === 'recording'
  }
  if (kind === 'transcript') {
    return rep.by === 'speaker'
  }
  return when === 'change' || rep.by === 'channel'
}

/** What fixes a failed Call: a different Rep, a re-upload of the same file (the reason may be transient), or deleting the Call and uploading a corrected file. */
export type CallFailureFix = 'change_rep' | 'reupload' | 'delete_and_upload'

/**
 * What fixes each failure reason. `change_rep`: `rep_label_not_found` and `not_per_side` are fixed
 * by choosing a different Rep. `reupload`: `transcription_failed`, `transcription_timed_out` and
 * `processing_failed` may be transient, so a same-Deal re-upload of the same content re-queues the
 * Call. `delete_and_upload`: `too_many_speakers`, `no_turns`, `too_few_speakers`, `too_long` and
 * `unreadable` come from the file itself, so the Call must be deleted and a corrected file uploaded.
 */
export const CALL_FAILURE_FIXES: Readonly<Record<CallFailureReason, CallFailureFix>> =
  Object.freeze({
    rep_label_not_found: 'change_rep',
    not_per_side: 'change_rep',
    transcription_failed: 'reupload',
    transcription_timed_out: 'reupload',
    processing_failed: 'reupload',
    too_many_speakers: 'delete_and_upload',
    no_turns: 'delete_and_upload',
    too_few_speakers: 'delete_and_upload',
    too_long: 'delete_and_upload',
    unreadable: 'delete_and_upload',
  })

/**
 * Whether a same-Deal re-upload of identical content re-queues a `failed` Call: only for a reason
 * that can be transient (`reupload` in {@link CALL_FAILURE_FIXES}). For any other reason the upload
 * answers 200 with the failed Call unchanged, as the same file would fail the same way.
 */
export function callReuploadRequeues(failureReason: CallFailureReason | null): boolean {
  return failureReason !== null && CALL_FAILURE_FIXES[failureReason] === 'reupload'
}

/**
 * Whether a Call's Rep may be picked or changed: when it is `ready` or `awaiting_rep`, or `failed`
 * with a reason a different Rep can fix (`rep_label_not_found`, `not_per_side`). Any other state
 * or reason is `call.rep_not_changeable`.
 */
export function repChangeAllowed(
  state: CallState,
  failureReason: CallFailureReason | null
): boolean {
  if (state === 'ready' || state === 'awaiting_rep') {
    return true
  }
  return (
    state === 'failed' &&
    (failureReason === 'rep_label_not_found' || failureReason === 'not_per_side')
  )
}
