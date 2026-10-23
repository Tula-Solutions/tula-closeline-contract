import { z } from 'zod'
import { consentWordingIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { consentEventSchema } from './ledger'
import { consentChannelSchema } from './values'

/** The longest IP address text (IPv6 with a zone), in characters. */
const MAX_IP_LENGTH = 64

/** The longest stored user agent, in characters. */
const MAX_USER_AGENT_LENGTH = 512

/**
 * One ledger event with everything that proves it: the wording shown (id, version and exact text)
 * and, for a hosted form, the IP address and user agent core read from the request. Only Owner and
 * Admin read it. `submission` is set exactly for a `hosted_form` event.
 */
export const evidenceEventSchema = consentEventSchema
  .and(
    z.object({
      wording: z
        .object({
          id: consentWordingIdSchema,
          version: z.number().int().min(1),
          text: z.string().min(1).max(10_000),
        })
        .nullable(),
      submission: z
        .object({
          ipAddress: z.string().min(1).max(MAX_IP_LENGTH),
          userAgent: z.string().max(MAX_USER_AGENT_LENGTH),
        })
        .nullable(),
    })
  )
  .refine(
    (e) => (e.source === 'hosted_form') === (e.submission !== null),
    'A hosted grant carries the submission evidence, and only a hosted grant does'
  )

/** One ledger event with its evidence. */
export type EvidenceEvent = z.infer<typeof evidenceEventSchema>

/** The query parameters of a request for a Prospect's evidence, newest first, optionally one channel. */
export const listEvidenceQuerySchema = pageQuerySchema
  .extend({ channel: consentChannelSchema.optional() })
  .strict()

/** One page of evidence events. */
export const evidencePageSchema = pageSchema(evidenceEventSchema)

/** The columns of the CSV evidence export, in order. The file carries the same fields as the JSON and no more. */
export const EVIDENCE_CSV_COLUMNS = [
  'event_id',
  'prospect_id',
  'channel',
  'kind',
  'source',
  'occurred_at',
  'recorded_at',
  'wording_id',
  'wording_version',
  'wording_text',
  'evidence_ref',
  'ip_address',
  'user_agent',
] as const
