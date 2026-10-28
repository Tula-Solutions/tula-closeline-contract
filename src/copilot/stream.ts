import { z } from 'zod'
import { callIdSchema } from '../ids'
import { transcriptTurnSchema } from '../voice/call'
import { copilotCardSchema } from './card'
import { MAX_COPILOT_CARDS_PER_CALL } from './values'

/** The longest id of a stream message, in characters. */
export const MAX_COPILOT_STREAM_ID_LENGTH = 64

/**
 * The id of a message in a Call's stream, sent as the SSE `id:` line and read back from the
 * `Last-Event-ID` header to resume. It is opaque to the client and only ever made of these
 * characters, so it cannot carry a line break into the frame.
 */
export const copilotStreamIdSchema = z
  .string()
  .min(1)
  .max(MAX_COPILOT_STREAM_ID_LENGTH)
  .regex(/^[A-Za-z0-9_.:-]+$/)

/** The headers of a request to open the stream; header names arrive lower-cased. `Last-Event-ID` resumes after that message from what is stored. */
export const copilotStreamHeadersSchema = z.object({
  'last-event-id': copilotStreamIdSchema.optional(),
})

/** The states of the Copilot on a Call, as the stream says them. */
export const COPILOT_STREAM_STATES = ['waiting_for_disclosure', 'live', 'ended'] as const

/** The state of the Copilot on a Call. */
export const copilotStreamStateSchema = z.enum(COPILOT_STREAM_STATES)

/**
 * Why the panel is quiet, for a Rep who wonders if it is broken; null when there is nothing to explain.
 * `not_enough_won_moments`: the Organization has no won Moments; `below_minimum_evidence`: the Playbook
 * found some but fewer than the Organization's Copilot minimum.
 */
export const COPILOT_QUIET_REASONS = [
  'not_enough_won_moments',
  'below_minimum_evidence',
  'playbook_unavailable',
  'transcript_unavailable',
] as const

/** Why the panel shows no cards. */
export const copilotQuietReasonSchema = z.enum(COPILOT_QUIET_REASONS)

/** Why the Transcript stopped: the speech-to-text failed or its stream could not be recovered. The Call itself goes on. */
export const COPILOT_TRANSCRIPT_UNAVAILABLE_REASONS = [
  'speech_to_text_failed',
  'stream_dropped',
] as const

/** `copilot.status`: the state of the Copilot on this Call, and why it is quiet. */
export const copilotStatusDataSchema = z.strictObject({
  callId: callIdSchema,
  state: copilotStreamStateSchema,
  quietReason: copilotQuietReasonSchema.nullable(),
})

/** `transcript.turn`: one final turn of the live Transcript, in order. The text is spoken words: untrusted data, never logged. */
export const copilotTurnDataSchema = z.strictObject({
  callId: callIdSchema,
  sequence: z.number().int().min(1),
  turn: transcriptTurnSchema,
})

/** `transcript.unavailable`: the live Transcript stopped. The Call and its Recording are not affected. */
export const copilotTranscriptUnavailableDataSchema = z.strictObject({
  callId: callIdSchema,
  reason: z.enum(COPILOT_TRANSCRIPT_UNAVAILABLE_REASONS),
})

/** `copilot.card` and `copilot.card_updated`: a card, whole, as it now stands. A card upgraded in place, rated, dismissed or pinned is sent again under its id. */
export const copilotCardDataSchema = z.strictObject({ card: copilotCardSchema })

/** The names of the events of the stream. */
export const COPILOT_STREAM_EVENTS = [
  'copilot.status',
  'transcript.turn',
  'transcript.unavailable',
  'copilot.card',
  'copilot.card_updated',
] as const

const message = <const E extends string, D extends z.ZodType>(event: E, data: D) =>
  z.strictObject({ id: copilotStreamIdSchema, event: z.literal(event), data })

/**
 * One message of the Server-Sent Events stream of a Call, sent to the Rep's browser that holds the
 * same token as every other call. The `event:` line is the name, `data:` the JSON of `data` and
 * `id:` the id to resume from. The Transcript turns and the card text in a message are tenant text
 * and model output, so UNTRUSTED DATA: shown as plain text, never as markup or instructions, never
 * spoken into the Call and never logged. A stream carries no more than
 * {@link MAX_COPILOT_CARDS_PER_CALL} cards.
 */
export const copilotStreamMessageSchema = z.discriminatedUnion('event', [
  message('copilot.status', copilotStatusDataSchema),
  message('transcript.turn', copilotTurnDataSchema),
  message('transcript.unavailable', copilotTranscriptUnavailableDataSchema),
  message('copilot.card', copilotCardDataSchema),
  message('copilot.card_updated', copilotCardDataSchema),
])

/** One message of the stream of a Call. */
export type CopilotStreamMessage = z.infer<typeof copilotStreamMessageSchema>

/** The name of an event of the stream. */
export type CopilotStreamEventName = (typeof COPILOT_STREAM_EVENTS)[number]

/**
 * Writes one message as an SSE frame (`id:`, `event:` and `data:` lines and a blank line). The
 * message is parsed first and an invalid one throws, so a frame never carries an unbounded or
 * malformed field. The data is one line of JSON, which cannot hold a raw line break, so text in a
 * Transcript or card cannot end the frame or start another.
 */
export function formatCopilotStreamFrame(input: CopilotStreamMessage): string {
  const parsed = copilotStreamMessageSchema.parse(input)
  return `id: ${parsed.id}\nevent: ${parsed.event}\ndata: ${JSON.stringify(parsed.data)}\n\n`
}
