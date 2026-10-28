import { z } from 'zod'
import { contactDenialCodeSchema } from '../consent/contact-check'
import { suppressionReasonSchema } from '../consent/values'
import { idempotencyKeySchema, timestampSchema } from '../core/values'
import { callIdSchema, lineIdSchema, membershipIdSchema, prospectIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { dealIdSchema } from '../playbook/deal-values'
import { e164PhoneSchema, rawPhoneSchema } from '../prospect/values'
import {
  voiceCallDirectionSchema,
  voiceCallEndedBySchema,
  voiceCallEndReasonSchema,
  voiceCallFailureReasonSchema,
  voiceCallStateSchema,
  voiceRecordingStateSchema,
  voiceTranscriptStateSchema,
  wrapUpNoteSchema,
} from './values'

/** The longest a Call can last, in seconds: 12 hours. */
export const MAX_CALL_DURATION_SECONDS = 43_200

/**
 * The Disclosure a Call played: the version of the wording and when it finished playing, both null
 * until it has. `aiAssisted` is whether it also told the Prospect an AI takes part (the Copilot,
 * an Agent). Nothing here, and no request, can turn the Disclosure off.
 */
export const callDisclosureSchema = z
  .strictObject({
    wordingVersion: z.number().int().min(1).nullable(),
    playedAt: timestampSchema.nullable(),
    aiAssisted: z.boolean(),
  })
  .refine((d) => (d.wordingVersion === null) === (d.playedAt === null), {
    message: 'The wording version and the time are both set once the Disclosure has played',
  })

/** The Disclosure a Call played. */
export type CallDisclosure = z.infer<typeof callDisclosureSchema>

/**
 * A Call placed or taken in the Softphone. The Prospect's number is tenant data: it is shown to
 * those who may see the Call and never logged. The invariants of the state machine are checked:
 * `live` and `ended` need a played Disclosure, a Recording exists only after it, `failed` has a
 * reason and nothing else does, and the wrap-up (Deal identifier, note) exists only on `ended`.
 */
export const voiceCallSchema = z
  .object({
    id: callIdSchema,
    direction: voiceCallDirectionSchema,
    state: voiceCallStateSchema,
    lineId: lineIdSchema,
    repMembershipId: membershipIdSchema.nullable(),
    prospectId: prospectIdSchema.nullable(),
    prospectNumber: e164PhoneSchema,
    disclosure: callDisclosureSchema,
    createdAt: timestampSchema,
    answeredAt: timestampSchema.nullable(),
    endedAt: timestampSchema.nullable(),
    durationSeconds: z.number().int().min(0).max(MAX_CALL_DURATION_SECONDS).nullable(),
    endedBy: voiceCallEndedBySchema.nullable(),
    failureReason: voiceCallFailureReasonSchema.nullable(),
    // optional so a service that predates the field still parses
    endReason: voiceCallEndReasonSchema.nullable().optional(),
    dealId: dealIdSchema.nullable(),
    note: wrapUpNoteSchema.nullable(),
    recordingState: voiceRecordingStateSchema,
    transcriptState: voiceTranscriptStateSchema,
  })
  .superRefine((call, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    const played = call.disclosure.playedAt !== null
    const final = call.state === 'ended' || call.state === 'failed' || call.state === 'missed'
    if ((call.state === 'live' || call.state === 'ended') && !played) {
      issue('disclosure', 'A live or ended Call has played its Disclosure')
    }
    if ((call.state === 'failed') !== (call.failureReason !== null)) {
      issue('failureReason', 'Only a failed Call has a failure reason')
    }
    if (call.failureReason === 'disclosure_failed' && played) {
      issue('failureReason', 'A Call whose Disclosure played did not fail on it')
    }
    if (final !== (call.endedAt !== null)) {
      issue('endedAt', 'Only a Call in a final state has an end time')
    }
    if ((call.state === 'live' || call.state === 'ended') !== (call.answeredAt !== null)) {
      issue('answeredAt', 'A Call is answered once it is live or ended, and not before')
    }
    if ((call.state === 'ended') !== (call.durationSeconds !== null)) {
      issue('durationSeconds', 'Only an ended Call has a duration')
    }
    if (call.endedBy !== null && !final) {
      issue('endedBy', 'Only a Call in a final state says who ended it')
    }
    if (call.state !== 'ended' && (call.dealId !== null || call.note !== null)) {
      issue('dealId', 'Only an ended Call has a wrap-up')
    }
    if (call.recordingState !== 'none' && !played) {
      issue('recordingState', 'A Recording starts after the Disclosure has played')
    }
    if (call.transcriptState === 'ready' && call.recordingState !== 'stored') {
      issue('transcriptState', 'A ready Transcript comes from a stored Recording')
    }
  })

/** A Call. */
export type VoiceCall = z.infer<typeof voiceCallSchema>

/** The path parameters of a request about one Call. */
export const voiceCallParamsSchema = z.strictObject({ callId: callIdSchema })

/** The position a Call list resumes from: newest first, by creation time then id. */
export const voiceCallCursorSchema = z.strictObject({
  createdAt: timestampSchema,
  id: callIdSchema,
})

/**
 * The body of a request to place a Call to a number from the Rep's browser. The idempotency key is
 * not in the body: see `placeCallHeadersSchema`. `to` is as typed; voice normalises it to
 * E.164 and refuses what it cannot as `call.number_invalid`. `lineId` is the caller identity, the
 * Rep's own Line when absent. `prospectId` links the Call to a Prospect the caller may see. `copilot`
 * dials with the Copilot on (default off): the Disclosure then uses the AI-assisted wording and the
 * live transcript starts once it has played. There is no field that turns off the Disclosure or the
 * Recording.
 */
export const placeCallRequestSchema = z.strictObject({
  to: rawPhoneSchema,
  lineId: lineIdSchema.optional(),
  prospectId: prospectIdSchema.optional(),
  copilot: z.boolean().optional(),
})

/**
 * The headers of a request to place a Call. The `Idempotency-Key` header is required (header names
 * arrive lower-cased): a retry of the same key answers the original Call and dials once, and the
 * same key with a different body is `request.idempotency_key_reused`.
 */
export const placeCallHeadersSchema = z.object({ 'idempotency-key': idempotencyKeySchema })

/** The body of a request to place a Call. */
export type PlaceCallRequest = z.infer<typeof placeCallRequestSchema>

/**
 * A warning for the Rep from the Contact Check on the number: the code of the denial and, for a
 * suppressed number, the reason. A Rep may still call (ADR 0003); the warning is for their eyes.
 */
export const contactWarningSchema = z.strictObject({
  code: contactDenialCodeSchema,
  suppressionReason: suppressionReasonSchema.nullable(),
})

/** A warning from the Contact Check. */
export type ContactWarning = z.infer<typeof contactWarningSchema>

/** The answer to placing a Call: the Call, as it stands, and any warnings from the Contact Check. */
export const placedCallSchema = z.strictObject({
  call: voiceCallSchema,
  warnings: z.array(contactWarningSchema).max(4),
})

/** The answer to placing a Call. */
export type PlacedCall = z.infer<typeof placedCallSchema>

const MAX_FILTER_TIME_LENGTH = 64

/**
 * The query parameters of a request to list Calls, newest first. Filters narrow what the caller
 * may see and never widen it. `from` and `to` bound `createdAt` (from inclusive, to exclusive).
 */
export const listVoiceCallsQuerySchema = pageQuerySchema
  .extend({
    direction: voiceCallDirectionSchema.optional(),
    state: voiceCallStateSchema.optional(),
    repMembershipId: membershipIdSchema.optional(),
    lineId: lineIdSchema.optional(),
    prospectId: prospectIdSchema.optional(),
    from: timestampSchema.max(MAX_FILTER_TIME_LENGTH).optional(),
    to: timestampSchema.max(MAX_FILTER_TIME_LENGTH).optional(),
  })
  .strict()
  .refine(
    (q) => q.from === undefined || q.to === undefined || Date.parse(q.from) < Date.parse(q.to),
    {
      message: 'from is before to',
    }
  )

/** The query parameters of a request to list Calls. */
export type ListVoiceCallsQuery = z.infer<typeof listVoiceCallsQuerySchema>

/** One page of Calls. */
export const voiceCallPageSchema = pageSchema(voiceCallSchema)

/** Who spoke a turn of a Call's Transcript: the Rep (channel 1) or the Prospect. */
export const transcriptSpeakerSchema = z.enum(['rep', 'prospect'])

/** The longest text of one Transcript turn, in characters. */
export const MAX_TRANSCRIPT_TURN_LENGTH = 4000

/** One turn of a Transcript: who spoke, when (milliseconds from the start of the Recording) and what. The text is the Prospect's and Rep's words: untrusted text, never logged. */
export const transcriptTurnSchema = z
  .strictObject({
    speaker: transcriptSpeakerSchema,
    startMs: z
      .number()
      .int()
      .min(0)
      .max(MAX_CALL_DURATION_SECONDS * 1000),
    endMs: z
      .number()
      .int()
      .min(0)
      .max(MAX_CALL_DURATION_SECONDS * 1000),
    text: z.string().min(1).max(MAX_TRANSCRIPT_TURN_LENGTH),
  })
  .refine((turn) => turn.endMs >= turn.startMs, { message: 'A turn ends after it starts' })

/** One turn of a Transcript. */
export type TranscriptTurn = z.infer<typeof transcriptTurnSchema>

/** The position a Transcript resumes from: the index of the next turn. */
export const transcriptCursorSchema = z.strictObject({ index: z.number().int().min(0) })

/** The query parameters of a request to read a Transcript, one cursor-paginated page of turns at a time. */
export const getTranscriptQuerySchema = pageQuerySchema.strict()

/** One page of a Call's Transcript, in time order, with the state of the Transcript. Turns are empty unless `ready`. */
export const transcriptPageSchema = pageSchema(transcriptTurnSchema)
  .extend({ callId: callIdSchema, state: voiceTranscriptStateSchema })
  .refine((page) => page.state === 'ready' || page.items.length === 0, {
    message: 'Only a ready Transcript has turns',
  })

/** One page of a Call's Transcript. */
export type TranscriptPage = z.infer<typeof transcriptPageSchema>

/** The media types a Recording is played back as. */
export const RECORDING_MEDIA_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'] as const

/** The longest a playback URL can be, in characters. */
export const MAX_PLAYBACK_URL_LENGTH = 2048

/**
 * A short-lived signed URL to play a Recording, two channels (Rep and Prospect). It is a
 * credential: shown to the caller, never logged or stored, and it stops working at `expiresAt`.
 */
export const recordingPlaybackSchema = z.strictObject({
  callId: callIdSchema,
  url: z.url({ protocol: /^https$/ }).max(MAX_PLAYBACK_URL_LENGTH),
  expiresAt: timestampSchema,
  mediaType: z.enum(RECORDING_MEDIA_TYPES),
  channels: z.literal(2),
  durationSeconds: z.number().int().min(0).max(MAX_CALL_DURATION_SECONDS),
})

/** A short-lived signed URL to play a Recording. */
export type RecordingPlayback = z.infer<typeof recordingPlaybackSchema>

/**
 * The body of a request to wrap up a Call: the Deal identifier (the customer's own, as in the
 * Playbook) and a note. A field left out is left alone; null clears it. At least one is sent.
 */
export const wrapUpRequestSchema = z
  .strictObject({
    dealId: dealIdSchema.nullable().optional(),
    note: wrapUpNoteSchema.nullable().optional(),
  })
  .refine((body) => body.dealId !== undefined || body.note !== undefined, {
    message: 'Give a dealId or a note',
  })

/** The body of a request to wrap up a Call. */
export type WrapUpRequest = z.infer<typeof wrapUpRequestSchema>

/** The answer to deleting a Recording: the Call, whose Recording and Transcript are now `deleted`. */
export const deletedRecordingSchema = voiceCallSchema
