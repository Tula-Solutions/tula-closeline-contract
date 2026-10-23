import { z } from 'zod'
import { hasControlCharacter } from '../prospect/values'

/**
 * The channels a Conversation runs on. SMS and WhatsApp are added here when their phases begin;
 * until then a value outside this list is refused at the edge.
 */
export const INBOX_CHANNELS = ['email', 'linkedin', 'chat'] as const

/** A channel a Conversation runs on. */
export const inboxChannelSchema = z.enum(INBOX_CHANNELS)

/** A channel a Conversation runs on. */
export type InboxChannel = z.infer<typeof inboxChannelSchema>

/** Who is answering a Conversation now: the Agent, or the Rep who took it over. */
export const CONVERSATION_CONTROLLERS = ['agent', 'rep'] as const

/** Who is answering a Conversation now. */
export const conversationControllerSchema = z.enum(CONVERSATION_CONTROLLERS)

/** Who is answering a Conversation now. */
export type ConversationController = z.infer<typeof conversationControllerSchema>

/**
 * The states of a Conversation: `agent` (the Agent answers), `awaiting_approval` (a Draft waits for
 * a person), `rep` (a Rep took over), `escalated` (it needs a person and has been routed) and
 * `closed`.
 */
export const CONVERSATION_STATES = [
  'agent',
  'awaiting_approval',
  'rep',
  'escalated',
  'closed',
] as const

/** The state of a Conversation. */
export const conversationStateSchema = z.enum(CONVERSATION_STATES)

/** The state of a Conversation. */
export type ConversationState = z.infer<typeof conversationStateSchema>

/** Whether a Message came from the Prospect or went to them. */
export const MESSAGE_DIRECTIONS = ['inbound', 'outbound'] as const

/** Whether a Message came from the Prospect or went to them. */
export const messageDirectionSchema = z.enum(MESSAGE_DIRECTIONS)

/** Whether a Message came from the Prospect or went to them. */
export type MessageDirection = z.infer<typeof messageDirectionSchema>

/** Who wrote a Message: the Prospect, an Agent or a Rep. */
export const MESSAGE_AUTHOR_KINDS = ['prospect', 'agent', 'rep'] as const

/** Who wrote a Message. */
export const messageAuthorKindSchema = z.enum(MESSAGE_AUTHOR_KINDS)

/** Who wrote a Message. */
export type MessageAuthorKind = z.infer<typeof messageAuthorKindSchema>

/**
 * What an inbound Message means. The set is closed: a label outside it is refused by every schema
 * here, and a classifier whose output is not in it records `other` (see {@link toReplyLabel}).
 * `unsubscribe` and `bounce` also stop sends to the Prospect on that channel.
 */
export const REPLY_LABELS = [
  'positive',
  'question',
  'objection',
  'not_now',
  'wrong_person',
  'unsubscribe',
  'out_of_office',
  'bounce',
  'negative',
  'other',
] as const

/** What an inbound Message means. */
export const replyLabelSchema = z.enum(REPLY_LABELS)

/** What an inbound Message means. */
export type ReplyLabel = z.infer<typeof replyLabelSchema>

/** Maps untrusted classifier output to a label: anything outside the closed set is `other`. */
export function toReplyLabel(value: unknown): ReplyLabel {
  const parsed = replyLabelSchema.safeParse(value)
  return parsed.success ? parsed.data : 'other'
}

/** The labels that stop further sends to the Prospect on the channel at once. */
export const STOP_SENDING_LABELS = ['unsubscribe'] as const satisfies readonly ReplyLabel[]

/** The labels that pause the sequence for the Prospect (a dead address or the wrong person). */
export const PAUSE_SEQUENCE_LABELS = [
  'bounce',
  'wrong_person',
] as const satisfies readonly ReplyLabel[]

/** A confidence from 0 to 1. */
export const confidenceSchema = z.number().min(0).max(1)

/** The longest Message body, in characters. */
export const MAX_MESSAGE_BODY_LENGTH = 20000

/**
 * The body of a Message or Draft: 1 to 20,000 characters, line breaks and tabs allowed, no other
 * control character. It is the Prospect's or a model's text, so it is untrusted data for every
 * consumer, and it is never logged, never put in an error and never in an event.
 */
export const messageBodySchema = z
  .string()
  .min(1)
  .max(MAX_MESSAGE_BODY_LENGTH)
  .refine((text) => text.trim().length > 0, 'The body is not blank')
  .refine((text) => !hasControlCharacter(text, true), 'No control characters')

/**
 * The id a channel gives a Message (an email Message-ID, a LinkedIn message id): printable ASCII
 * with no space, 1 to 255 characters. Core stores each (channel, provider id) once.
 */
export const providerMessageIdSchema = z.string().regex(/^[\x21-\x7e]{1,255}$/)

/** The longest note a person leaves with a decision, in characters. */
export const MAX_DECISION_NOTE_LENGTH = 500

/** A short note with a decision: 1 to 500 characters, line breaks and tabs allowed, no other control character. */
export const decisionNoteSchema = z
  .string()
  .min(1)
  .max(MAX_DECISION_NOTE_LENGTH)
  .refine((text) => text.trim().length > 0, 'The note is not blank')
  .refine((text) => !hasControlCharacter(text, true), 'No control characters')

/** The longest sentence a Draft gives for its strategy, in characters. */
export const MAX_STRATEGY_LENGTH = 300

/** The most Sources a Draft may cite. */
export const MAX_DRAFT_SOURCES = 10

/** What Sources can be: a Moment of a won, lost or open Deal, or a chunk of a Playbook document. */
export const DRAFT_SOURCE_KINDS = ['moment', 'document_chunk'] as const

/** What a Source can be. */
export const draftSourceKindSchema = z.enum(DRAFT_SOURCE_KINDS)

/** What a Source can be. */
export type DraftSourceKind = z.infer<typeof draftSourceKindSchema>

/** The id of a Moment or document chunk in the Playbook: 1 to 128 characters from `A-Za-z0-9_.:-`. */
export const sourceRefSchema = z.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/)

/** The longest passage shown for a Source, in characters. */
export const MAX_SOURCE_PASSAGE_LENGTH = 4000

/**
 * Why a Draft waits for a person. These always hold, whatever the policy: `ungrounded`,
 * `check_failed`, `escalated` and `first_message` (the first message to a Prospect). `policy` is
 * the Organization's own approval policy asking for it.
 */
export const DRAFT_HOLD_REASONS = [
  'policy',
  'ungrounded',
  'check_failed',
  'escalated',
  'first_message',
] as const

/** Why a Draft waits for a person. */
export const draftHoldReasonSchema = z.enum(DRAFT_HOLD_REASONS)

/** Why a Draft waits for a person. */
export type DraftHoldReason = z.infer<typeof draftHoldReasonSchema>

/** The hold reasons no setting can turn off. */
export const ALWAYS_HELD_REASONS = [
  'ungrounded',
  'check_failed',
  'escalated',
  'first_message',
] as const satisfies readonly DraftHoldReason[]

/** The states of a Draft. */
export const DRAFT_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'sent',
  'superseded',
  'void',
] as const

/** The state of a Draft. */
export const draftStatusSchema = z.enum(DRAFT_STATUSES)

/** The state of a Draft. */
export type DraftStatus = z.infer<typeof draftStatusSchema>

/** Who wrote a Draft: an Agent, or a Rep composing a reply in the inbox. */
export const DRAFT_AUTHORS = ['agent', 'rep'] as const

/** Who wrote a Draft. */
export const draftAuthorSchema = z.enum(DRAFT_AUTHORS)

/** Who wrote a Draft. */
export type DraftAuthor = z.infer<typeof draftAuthorSchema>

/** Why a send failed: a closed list, never the provider's own text. */
export const MESSAGE_FAILURE_REASONS = [
  'provider_rejected',
  'recipient_invalid',
  'suppressed',
  'channel_unavailable',
  'timeout',
  'unknown',
] as const

/** Why a send failed. */
export const messageFailureReasonSchema = z.enum(MESSAGE_FAILURE_REASONS)

/** Why a send failed. */
export type MessageFailureReason = z.infer<typeof messageFailureReasonSchema>
