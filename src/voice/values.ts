import { z } from 'zod'
import { boundedTextSchema } from '../prospect/values'

/** The directions of a Call. */
export const VOICE_CALL_DIRECTIONS = ['inbound', 'outbound'] as const

/** The direction of a Call: `outbound` is placed by a Rep to a Prospect, `inbound` rings on a Line. */
export const voiceCallDirectionSchema = z.enum(VOICE_CALL_DIRECTIONS)

/** The direction of a Call. */
export type VoiceCallDirection = z.infer<typeof voiceCallDirectionSchema>

/**
 * The states of a Call. It moves `ringing`, `connecting`, `disclosing`, `live`, `ended`, or ends
 * `failed` or `missed`. `live` is reached only after the Disclosure has played: a Call in `live` or
 * `ended` always carries the time and wording version of its Disclosure.
 */
export const VOICE_CALL_STATES = [
  'ringing',
  'connecting',
  'disclosing',
  'live',
  'ended',
  'failed',
  'missed',
] as const

/** The state of a Call. */
export const voiceCallStateSchema = z.enum(VOICE_CALL_STATES)

/** The state of a Call. */
export type VoiceCallState = z.infer<typeof voiceCallStateSchema>

/** The states a Call can no longer leave. */
export const VOICE_CALL_FINAL_STATES = [
  'ended',
  'failed',
  'missed',
] as const satisfies readonly VoiceCallState[]

/** Why a Call ended in `failed`: a closed list the portal maps to its own wording, never free text. */
export const VOICE_CALL_FAILURE_REASONS = [
  'disclosure_failed',
  'carrier_dropped',
  'carrier_rejected',
  'busy',
  'no_answer',
  'rep_unreachable',
  'provider_error',
  'timeout',
] as const

/** Why a Call ended in `failed`. */
export const voiceCallFailureReasonSchema = z.enum(VOICE_CALL_FAILURE_REASONS)

/** Why a Call ended in `failed`. */
export type VoiceCallFailureReason = z.infer<typeof voiceCallFailureReasonSchema>

/** Who ended a Call that ended: the Rep, the Prospect, or the system (a time limit). */
export const VOICE_CALL_ENDED_BY = ['rep', 'prospect', 'system'] as const

/** Who ended a Call. */
export const voiceCallEndedBySchema = z.enum(VOICE_CALL_ENDED_BY)

/** Why a Call ended, stated for clients to show: a cap reached, the Agent's end tool, or a party hanging up. */
export const VOICE_CALL_END_REASONS = [
  'duration_cap',
  'cost_cap',
  'agent_ended',
  'prospect_hung_up',
  'rep_ended',
] as const

/** Why a Call ended. */
export const voiceCallEndReasonSchema = z.enum(VOICE_CALL_END_REASONS)

/** Why a Call ended. */
export type VoiceCallEndReason = z.infer<typeof voiceCallEndReasonSchema>

/** The state of a Call's Recording. `none` until the Disclosure has played; `storing` while it is copied to the Region's storage; `stored` once playable; `deleted` after an Admin deleted it. */
export const VOICE_RECORDING_STATES = ['none', 'storing', 'stored', 'deleted'] as const

/** The state of a Call's Recording. */
export const voiceRecordingStateSchema = z.enum(VOICE_RECORDING_STATES)

/** The state of a Call's Recording. */
export type VoiceRecordingState = z.infer<typeof voiceRecordingStateSchema>

/** The state of a Call's Transcript: `pending` until it is made, `ready` once readable, `deleted` after the Recording and Transcript were deleted. */
export const VOICE_TRANSCRIPT_STATES = ['pending', 'ready', 'deleted'] as const

/** The state of a Call's Transcript. */
export const voiceTranscriptStateSchema = z.enum(VOICE_TRANSCRIPT_STATES)

/** The state of a Call's Transcript. */
export type VoiceTranscriptState = z.infer<typeof voiceTranscriptStateSchema>

/** The most characters of a wrap-up note. */
export const MAX_WRAP_UP_NOTE_LENGTH = 2000

/** A wrap-up note: bounded text with no control character; untrusted text for display. */
export const wrapUpNoteSchema = boundedTextSchema(MAX_WRAP_UP_NOTE_LENGTH)

/** The longest label of a Line. */
export const MAX_LINE_LABEL_LENGTH = 100

/** A label an Admin gives a Line: bounded text with no control character. */
export const lineLabelSchema = boundedTextSchema(MAX_LINE_LABEL_LENGTH)

/** A two-letter ISO 3166-1 country code in upper case, such as `US` or `IE`. */
export const countryCodeSchema = z.string().regex(/^[A-Z]{2}$/)

/**
 * A keyed SHA-256 of a Prospect's E.164 number, as lower-case hex (64 characters). The key is the
 * Organization's, so a number cannot be recovered by hashing a list of guesses. Events carry this
 * and never the number.
 */
export const phoneHashSchema = z.string().regex(/^[0-9a-f]{64}$/)
