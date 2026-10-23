import { z } from 'zod'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import { callIdSchema, chatIdSchema, inquiryIdSchema, prospectIdSchema } from '../ids'
import { inquirySourceSchema } from './values'

/**
 * `voice.inquiry.received` (version 1): an Inquiry was stored and the Prospect upserted. Ids, the
 * source and the time: no name, email, number, message, page address or Qualification answer.
 */
export const voiceInquiryReceivedEvent = defineEvent(
  'voice.inquiry.received',
  1,
  z.strictObject({
    inquiryId: inquiryIdSchema,
    source: inquirySourceSchema,
    prospectId: prospectIdSchema,
    chatId: chatIdSchema.nullable(),
    callId: callIdSchema.nullable(),
    receivedAt: timestampSchema,
  })
)

/** Every Inquiry event, by type. */
export const INQUIRY_EVENTS = {
  'voice.inquiry.received': voiceInquiryReceivedEvent,
} as const

/** The type of an Inquiry event. */
export type InquiryEventType = keyof typeof INQUIRY_EVENTS
