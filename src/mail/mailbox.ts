import { z } from 'zod'
import { idempotencyKeySchema, timestampSchema } from '../core/values'
import { emailSchema } from '../email'
import { mailboxIdSchema, membershipIdSchema, teamIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { boundedTextSchema } from '../prospect/values'
import { healthSummarySchema } from './health'
import {
  effectiveLimitsSchema,
  MAX_MAILBOX_TEAMS,
  MAX_MIN_GAP_SECONDS,
  MAX_SENDS_PER_DAY,
  MAX_SENDS_PER_HOUR,
  mailboxKindSchema,
  mailboxLimitsSchema,
  mailboxProviderSchema,
  mailboxStateReasonSchema,
  mailboxStateSchema,
  rampSchema,
} from './values'

/** The longest display name of a Mailbox, in characters. */
export const MAX_MAILBOX_NAME_LENGTH = 100

/**
 * A Mailbox as every response shows it. It has no token, secret, refresh token, authorization code
 * or key field of any kind: those never leave outbound. The schema strips fields it does not
 * name, so a row that carries a token loses it when the response is built from this schema.
 * `ownerMembershipId` is null for a `shared` Mailbox, which lists the Teams that may use it in
 * `teamIds` (empty for a personal one). `health` is the summary (full reasons are the health
 * route); `limits` are the ones set and `effectiveLimits` those that apply now after the ramp and
 * the health score.
 */
export const mailboxSchema = z
  .object({
    id: mailboxIdSchema,
    provider: mailboxProviderSchema,
    kind: mailboxKindSchema,
    address: emailSchema,
    displayName: boundedTextSchema(MAX_MAILBOX_NAME_LENGTH),
    ownerMembershipId: membershipIdSchema.nullable(),
    teamIds: z.array(teamIdSchema).max(MAX_MAILBOX_TEAMS),
    state: mailboxStateSchema,
    stateReason: mailboxStateReasonSchema.nullable(),
    limits: mailboxLimitsSchema,
    effectiveLimits: effectiveLimitsSchema,
    ramp: rampSchema,
    health: healthSummarySchema,
    connectedAt: timestampSchema,
    lastSyncedAt: timestampSchema.nullable(),
  })
  .superRefine((m, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })
    if ((m.kind === 'personal') !== (m.ownerMembershipId !== null)) {
      issue('ownerMembershipId', 'Exactly a personal Mailbox names its owner')
    }
    if (m.kind === 'personal' && m.teamIds.length > 0) {
      issue('teamIds', 'Only a shared Mailbox is opened to Teams')
    }
    if (m.state === 'limited' && m.stateReason === null) {
      issue('stateReason', 'A limited Mailbox says why')
    }
    if (
      (m.state === 'paused' || m.state === 'disconnected') !== (m.stateReason !== null) &&
      m.state !== 'limited'
    ) {
      issue('stateReason', 'A paused, limited or disconnected Mailbox says why, and no other does')
    }
  })

/** A Mailbox. */
export type Mailbox = z.infer<typeof mailboxSchema>

/** The path parameters of a request about one Mailbox. */
export const mailboxParamsSchema = z.strictObject({ mailboxId: mailboxIdSchema })

/** The headers of a request that requires an `Idempotency-Key` (header names arrive lower-cased). */
export const mailKeyedHeadersSchema = z.object({ 'idempotency-key': idempotencyKeySchema })

/** The cursor position a Mailbox list resumes from: oldest connected first, then id. */
export const mailboxCursorSchema = z.strictObject({
  connectedAt: timestampSchema,
  id: mailboxIdSchema,
})

/** The query of a request to list Mailboxes, narrowed by state, provider, kind and owner. What the caller sees is decided from the token. */
export const listMailboxesQuerySchema = pageQuerySchema
  .extend({
    state: mailboxStateSchema.optional(),
    provider: mailboxProviderSchema.optional(),
    kind: mailboxKindSchema.optional(),
    ownerMembershipId: membershipIdSchema.optional(),
  })
  .strict()

/** The query of a request to list Mailboxes. */
export type ListMailboxesQuery = z.infer<typeof listMailboxesQuerySchema>

/** One page of Mailboxes. */
export const mailboxPageSchema = pageSchema(mailboxSchema)

/**
 * The body of a request to start connecting a Mailbox: the provider and whose it is. A `shared`
 * Mailbox (Owner or Admin only) names the Teams that may use it; a `personal` one takes none.
 */
export const startMailboxConnectRequestSchema = z
  .strictObject({
    provider: mailboxProviderSchema,
    kind: mailboxKindSchema.default('personal'),
    teamIds: z.array(teamIdSchema).max(MAX_MAILBOX_TEAMS).default([]),
  })
  .refine((b) => b.kind === 'shared' || b.teamIds.length === 0, {
    path: ['teamIds'],
    message: 'Only a shared Mailbox is opened to Teams',
  })

/** The body of a request to start connecting a Mailbox. */
export type StartMailboxConnectRequest = z.infer<typeof startMailboxConnectRequestSchema>

/**
 * The answer to starting a connection: where to send the person to consent (an `https` URL of the
 * provider) and when that attempt expires. The `state` stays on the server's side of the link: it
 * is carried in the URL and checked when the connection is completed.
 */
export const mailboxConnectStartSchema = z.object({
  authorizationUrl: z.url({ protocol: /^https?$/ }).max(2048),
  expiresAt: timestampSchema,
})

/** The answer to starting a connection. */
export type MailboxConnectStart = z.infer<typeof mailboxConnectStartSchema>

/**
 * The body of the request that completes a connection after the provider sent the person back:
 * the `state` of the attempt and the authorization `code`. Outbound exchanges the code for tokens
 * and stores them encrypted; the code is single-use, is never logged and is never returned.
 */
export const completeMailboxConnectRequestSchema = z.strictObject({
  state: z.string().regex(/^[A-Za-z0-9_-]{16,256}$/),
  code: z.string().regex(/^[\x21-\x7e]{1,2048}$/),
})

/** The body of a request to complete a connection. */
export type CompleteMailboxConnectRequest = z.infer<typeof completeMailboxConnectRequestSchema>

/** The body of a request to set a Mailbox's limits: the whole set, replacing the old. */
export const setMailboxLimitsRequestSchema = mailboxLimitsSchema

/** The body of a request to set a Mailbox's limits. */
export type SetMailboxLimitsRequest = z.infer<typeof setMailboxLimitsRequestSchema>

/**
 * The Organization's limits: the ceiling no Mailbox may be set above, the floor of the gap, and
 * the daily cap across every Mailbox of the Organization.
 */
export const organizationMailLimitsSchema = z.strictObject({
  perDayCeiling: z.number().int().min(1).max(MAX_SENDS_PER_DAY),
  perHourCeiling: z.number().int().min(1).max(MAX_SENDS_PER_HOUR),
  minGapFloorSeconds: z.number().int().min(0).max(MAX_MIN_GAP_SECONDS),
  organizationDailyCap: z.number().int().min(1).max(100_000),
})

/** The Organization's mail limits. */
export type OrganizationMailLimits = z.infer<typeof organizationMailLimitsSchema>

/**
 * What a Mailbox can still send, for a launch check: what remains today and this hour after the
 * ramp, its health and what was already sent, whether it can send at all (`usable`) and, when
 * not, the state that stops it.
 */
export const mailboxCapacitySchema = z.object({
  mailboxId: mailboxIdSchema,
  state: mailboxStateSchema,
  usable: z.boolean(),
  remainingToday: z.number().int().min(0).max(MAX_SENDS_PER_DAY),
  remainingThisHour: z.number().int().min(0).max(MAX_SENDS_PER_HOUR),
  nextSendAt: timestampSchema.nullable(),
})

/** What a Mailbox can still send. */
export type MailboxCapacity = z.infer<typeof mailboxCapacitySchema>

/** The capacity of the Organization's Mailboxes: each Mailbox the caller may see, and the Organization's remaining daily cap. */
export const mailCapacitySchema = z.object({
  ...pageSchema(mailboxCapacitySchema).shape,
  organizationRemainingToday: z.number().int().min(0).max(100_000),
  organizationDailyCap: z.number().int().min(1).max(100_000),
})

/** The capacity of the Organization's Mailboxes. */
export type MailCapacity = z.infer<typeof mailCapacitySchema>
