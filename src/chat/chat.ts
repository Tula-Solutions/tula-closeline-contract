import { z } from 'zod'
import { agentTurnRoleSchema } from '../agent/turn'
import { MAX_TURN_SOURCES, MAX_TURN_TEXT_LENGTH } from '../agent/values'
import { copilotDocumentSourceSchema } from '../copilot/card'
import { idempotencyKeySchema, personNameSchema, timestampSchema } from '../core/values'
import { chatIdSchema, consentWordingIdSchema, inquiryIdSchema, prospectIdSchema } from '../ids'
import {
  allowedOriginSchema,
  inquiryKeySchema,
  MAX_HONEYPOT_LENGTH,
  sourceUrlSchema,
} from '../inquiry/values'
import { pageQuerySchema, pageSchema } from '../pagination'
import { boundedTextSchema, rawPhoneSchema } from '../prospect/values'

/** The text a visitor or the Inbound Agent says in a Chat: bounded, no control character, untrusted. */
export const chatTextSchema = boundedTextSchema(MAX_TURN_TEXT_LENGTH)

/** The secret token of a visitor's Chat session: 32 to 64 URL-safe characters. */
export const chatSessionTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32,64}$/)

/** The states of a Chat: `open`, `handed_off` to a Rep, or `closed`. */
export const CHAT_STATES = ['open', 'handed_off', 'closed'] as const

/** The state of a Chat. */
export const chatStateSchema = z.enum(CHAT_STATES)

/** The path parameters of every public route that begins a Chat: the publishable key. */
export const publicChatKeyParamsSchema = z.strictObject({ key: inquiryKeySchema })

/** The path parameters of every public route inside a Chat: the secret session token. */
export const publicChatSessionParamsSchema = z.strictObject({
  sessionToken: chatSessionTokenSchema,
})

/** The headers of a public Chat request that changes nothing: the `Origin`. */
export const publicChatOriginHeadersSchema = z.object({ origin: allowedOriginSchema })

/** The headers of a public Chat request that changes something: the `Origin` and a required `Idempotency-Key`. */
export const publicChatHeadersSchema = z.object({
  origin: allowedOriginSchema,
  'idempotency-key': idempotencyKeySchema,
})

/**
 * The body of a public request to start a Chat: the page address the widget is on. `website` is the
 * honeypot, a field the widget hides from people; a non-empty value marks a bot, still parses, and
 * is answered like a real request with nothing stored. A Chat needs no Contact Consent (the visitor
 * started it); only a callback does (ADR 0003).
 */
export const publicStartChatRequestSchema = z.strictObject({
  sourceUrl: sourceUrlSchema,
  website: z.string().max(MAX_HONEYPOT_LENGTH).default(''),
})

/** What a visitor sees of one message: who said it and what, with no source, tool or id. */
export const publicChatMessageSchema = z.strictObject({
  index: z.number().int().min(0),
  role: agentTurnRoleSchema,
  text: chatTextSchema,
  at: timestampSchema,
})

/** What a visitor sees of one message. */
export type PublicChatMessage = z.infer<typeof publicChatMessageSchema>

/**
 * The answer to starting a Chat: the secret session token, when it expires and the opening
 * message, which states the visitor is talking to an AI. No Chat, Prospect or Rep id.
 */
export const publicStartChatResponseSchema = z.strictObject({
  sessionToken: chatSessionTokenSchema,
  expiresAt: timestampSchema,
  messages: z.array(publicChatMessageSchema).min(1).max(5),
})

/** The body of a public message from the visitor. */
export const publicSendChatMessageRequestSchema = z.strictObject({ text: chatTextSchema })

/**
 * The Inbound Agent's reply as a visitor sees it. `deferred` is true when it said someone will
 * follow up rather than answer; `handoffOffered` is true when it offered a Rep. No Playbook
 * source, tool call, Rep or internal id.
 */
export const publicChatReplySchema = z.strictObject({
  text: chatTextSchema,
  deferred: z.boolean(),
  handoffOffered: z.boolean(),
  at: timestampSchema,
})

/** The reply a visitor gets. */
export type PublicChatReply = z.infer<typeof publicChatReplySchema>

/** The answer to a visitor's message. */
export const publicChatMessageReplySchema = z.strictObject({ reply: publicChatReplySchema })

/** The query parameters of a public request to list a Chat's messages: oldest first, cursor-paginated. */
export const publicListChatMessagesQuerySchema = pageQuerySchema.strict()

/** One page of the messages a visitor sees. */
export const publicChatMessagePageSchema = pageSchema(publicChatMessageSchema)

/**
 * The body of a public request to ask for a callback from inside a Chat: the visitor's name and
 * number and the Consent Wording id and version shown, the choice and the page address. The wording
 * version and page address are required, as for the form Inquiry; with `callbackConsent` false the
 * details are kept and no call is placed.
 */
export const publicChatConsentRequestSchema = z.strictObject({
  name: personNameSchema,
  phone: rawPhoneSchema,
  consentWordingId: consentWordingIdSchema,
  consentWordingVersion: z.number().int().min(1),
  callbackConsent: z.boolean(),
  sourceUrl: sourceUrlSchema,
})

/** The body of a public callback request from a Chat. */
export type PublicChatConsentRequest = z.infer<typeof publicChatConsentRequestSchema>

/** The body of a public request to talk to a Rep: nothing; the Rep is chosen by routing. */
export const publicChatHandoffRequestSchema = z.strictObject({})

/** The answer to asking for a Rep: that a Rep was asked to join. No Rep id or name. */
export const publicChatHandoffReplySchema = z.strictObject({
  requested: z.literal(true),
  at: timestampSchema,
})

/** The path parameters of a request about one Chat. */
export const chatParamsSchema = z.strictObject({ chatId: chatIdSchema })

/**
 * A Chat as staff see it. `prospectId` and `inquiryId` are null until the visitor gave their
 * details or asked for a callback.
 */
export const chatSchema = z.strictObject({
  id: chatIdSchema,
  prospectId: prospectIdSchema.nullable(),
  inquiryId: inquiryIdSchema.nullable(),
  state: chatStateSchema,
  sourceUrl: sourceUrlSchema,
  startedAt: timestampSchema,
  lastMessageAt: timestampSchema,
  closedAt: timestampSchema.nullable(),
})

/** A Chat. */
export type Chat = z.infer<typeof chatSchema>

/** One message of a Chat as staff see it, with the Playbook passages the Agent's answer used. */
export const chatMessageSchema = z.strictObject({
  index: z.number().int().min(0),
  role: agentTurnRoleSchema,
  text: chatTextSchema,
  sources: z.array(copilotDocumentSourceSchema).max(MAX_TURN_SOURCES),
  deferred: z.boolean(),
  at: timestampSchema,
})

/** One message of a Chat. */
export type ChatMessage = z.infer<typeof chatMessageSchema>

/** The query parameters of a request to list Chats: latest first, cursor-paginated, optionally by state. */
export const listChatsQuerySchema = pageQuerySchema
  .extend({ state: chatStateSchema.optional() })
  .strict()

/** One page of Chats. */
export const chatPageSchema = pageSchema(chatSchema)

/** The query parameters of a request to list a Chat's messages: oldest first, cursor-paginated. */
export const listChatMessagesQuerySchema = pageQuerySchema.strict()

/** One page of a Chat's messages. */
export const chatMessagePageSchema = pageSchema(chatMessageSchema)
