import { z } from 'zod'
import { assessmentVerdictSchema, findingSchema, MAX_FINDINGS } from '../assessment/values'
import { idempotencyKeySchema, timestampSchema } from '../core/values'
import {
  assessmentIdSchema,
  conversationIdSchema,
  dealRecordIdSchema,
  decisionIdSchema,
  documentIdSchema,
  draftIdSchema,
  membershipIdSchema,
  messageIdSchema,
  prospectIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { outcomeSchema } from '../playbook/deal-values'
import { hasControlCharacter } from '../prospect/values'
import {
  confidenceSchema,
  conversationControllerSchema,
  conversationStateSchema,
  decisionNoteSchema,
  draftAuthorSchema,
  draftHoldReasonSchema,
  draftSourceKindSchema,
  draftStatusSchema,
  inboxChannelSchema,
  MAX_DRAFT_SOURCES,
  MAX_MESSAGE_BODY_LENGTH,
  MAX_SOURCE_PASSAGE_LENGTH,
  MAX_STRATEGY_LENGTH,
  messageAuthorKindSchema,
  messageBodySchema,
  messageDirectionSchema,
  providerMessageIdSchema,
  replyLabelSchema,
  sourceRefSchema,
} from './values'

const issueAt =
  (ctx: z.RefinementCtx) =>
  (path: string, message: string): void =>
    ctx.addIssue({ code: 'custom', path: [path], message })

/**
 * The meaning of an inbound Message: a label from the closed set, a confidence, and who decided
 * it. `model` is the classifier; `rep` is a person's correction, which names them.
 */
export const classificationSchema = z
  .strictObject({
    label: replyLabelSchema,
    confidence: confidenceSchema,
    decidedBy: z.enum(['model', 'rep']),
    correctedByMembershipId: membershipIdSchema.nullable(),
    classifiedAt: timestampSchema,
  })
  .superRefine((c, ctx) => {
    if ((c.decidedBy === 'rep') !== (c.correctedByMembershipId !== null)) {
      issueAt(ctx)('correctedByMembershipId', 'Only a correction names who made it')
    }
  })

/** The meaning of an inbound Message. */
export type Classification = z.infer<typeof classificationSchema>

/**
 * A Conversation: all Messages between one Prospect and the Organization on one channel, and who
 * answers now. `controllerMembershipId` names the Rep exactly when `controller` is `rep`, and the
 * `rep` state means the Rep controls it. `ownerMembershipId` is the Rep who owns the Prospect (the
 * one whose inbox it is), null while unassigned in the Admin queue. `latestLabel` is the label of
 * the latest inbound Message, null until one is classified.
 */
export const conversationSchema = z
  .strictObject({
    id: conversationIdSchema,
    prospectId: prospectIdSchema,
    channel: inboxChannelSchema,
    controller: conversationControllerSchema,
    controllerMembershipId: membershipIdSchema.nullable(),
    state: conversationStateSchema,
    ownerMembershipId: membershipIdSchema.nullable(),
    latestLabel: replyLabelSchema.nullable(),
    pendingDraftCount: z.number().int().min(0).max(1000),
    lastMessageAt: timestampSchema,
    createdAt: timestampSchema,
  })
  .superRefine((c, ctx) => {
    const issue = issueAt(ctx)
    if ((c.controller === 'rep') !== (c.controllerMembershipId !== null)) {
      issue('controllerMembershipId', 'Exactly a Rep-controlled Conversation names its Rep')
    }
    if (c.state === 'rep' && c.controller !== 'rep') {
      issue('controller', 'A Conversation in the rep state is controlled by a Rep')
    }
    if (c.controller === 'rep' && c.state !== 'rep' && c.state !== 'closed') {
      issue('state', 'A Rep-controlled Conversation is in the rep or closed state')
    }
  })

/** A Conversation. */
export type Conversation = z.infer<typeof conversationSchema>

/**
 * A Message: one piece of text in a Conversation. Messages are append-only. An inbound Message is
 * written by the Prospect and carries a classification (null until classified); an outbound one is
 * written by an Agent or a Rep, carries the Draft it came from and is recorded when the channel
 * confirms it was sent. The body is the Prospect's or a model's text: untrusted, and never logged
 * or put in an event or an error.
 */
export const messageSchema = z
  .strictObject({
    id: messageIdSchema,
    conversationId: conversationIdSchema,
    direction: messageDirectionSchema,
    authorKind: messageAuthorKindSchema,
    authorMembershipId: membershipIdSchema.nullable(),
    providerMessageId: providerMessageIdSchema,
    draftId: draftIdSchema.nullable(),
    body: messageBodySchema,
    sentAt: timestampSchema,
    classification: classificationSchema.nullable(),
  })
  .superRefine((m, ctx) => {
    const issue = issueAt(ctx)
    if ((m.direction === 'inbound') !== (m.authorKind === 'prospect')) {
      issue('authorKind', 'An inbound Message is the Prospect’s and an outbound one is not')
    }
    if ((m.authorKind === 'rep') !== (m.authorMembershipId !== null)) {
      issue('authorMembershipId', 'Exactly a Rep’s Message names the Rep')
    }
    if (m.direction === 'inbound' && m.draftId !== null) {
      issue('draftId', 'An inbound Message has no Draft')
    }
    if (m.authorKind === 'rep' && m.draftId === null) {
      issue(
        'draftId',
        'A Rep’s Message comes from a Draft; only an Agent’s sequence Message has none'
      )
    }
    if (m.direction === 'outbound' && m.classification !== null) {
      issue('classification', 'Only an inbound Message has a classification')
    }
  })

/** A Message. */
export type Message = z.infer<typeof messageSchema>

/**
 * A Source a Draft cites: a Moment of a Deal (with that Deal's Outcome) or a chunk of a Playbook
 * document (no Outcome), and how many Moments or passages support it. It is a reference, never
 * the text: model output is untrusted, so a Source id is accepted only when the Playbook returned
 * it for this request, and the passage is read from the Playbook (`DraftSourcePassage`).
 */
export const sourceSchema = z
  .strictObject({
    kind: draftSourceKindSchema,
    sourceRef: sourceRefSchema,
    dealRecordId: dealRecordIdSchema.nullable(),
    documentId: documentIdSchema.nullable(),
    outcome: outcomeSchema.nullable(),
    evidenceCount: z.number().int().min(1).max(100000),
  })
  .superRefine((s, ctx) => {
    const issue = issueAt(ctx)
    if (s.kind === 'moment') {
      if (s.dealRecordId === null) {
        issue('dealRecordId', 'A Moment names its Deal')
      }
      if (s.documentId !== null) {
        issue('documentId', 'A Moment has no document')
      }
      if (s.outcome === null) {
        issue('outcome', 'A Moment carries its Deal’s Outcome')
      }
    } else {
      if (s.documentId === null) {
        issue('documentId', 'A document chunk names its document')
      }
      if (s.dealRecordId !== null) {
        issue('dealRecordId', 'A document chunk has no Deal')
      }
      if (s.outcome !== null) {
        issue('outcome', 'A document chunk has no Outcome')
      }
    }
  })

/** A Source a Draft cites. */
export type Source = z.infer<typeof sourceSchema>

/** A Source with the passage it points to, read from the Playbook for display; untrusted text. */
export const sourcePassageSchema = z.strictObject({
  source: sourceSchema,
  passage: z.string().min(1).max(MAX_SOURCE_PASSAGE_LENGTH),
})

/** A Source with its passage. */
export type SourcePassage = z.infer<typeof sourcePassageSchema>

/** Why a Draft was written: the Message it answers, that Message's label and the strategy in one sentence. */
export const draftReasonSchema = z.strictObject({
  triggerMessageId: messageIdSchema,
  label: replyLabelSchema,
  strategy: z.string().min(1).max(MAX_STRATEGY_LENGTH),
})

/** Why a Draft was written. */
export type DraftReason = z.infer<typeof draftReasonSchema>

/** The result of one check run on a Draft before release. */
export const draftCheckSchema = z.strictObject({
  name: z.string().regex(/^[a-z][a-z0-9_]{0,49}$/),
  passed: z.boolean(),
})

/**
 * The Assessment of a Draft as the inbox shows it: which Assessment, what it decided and its
 * findings (spans and explanations, never the text).
 */
export const draftAssessmentSchema = z.strictObject({
  id: assessmentIdSchema,
  verdict: assessmentVerdictSchema,
  findings: z.array(findingSchema).max(MAX_FINDINGS),
})

/** The Assessment of a Draft. */
export type DraftAssessment = z.infer<typeof draftAssessmentSchema>

/**
 * A Draft: text an Agent wrote (or a Rep composed in the inbox) for a Conversation and has not
 * sent. An Agent Draft has a reason, a confidence and its Sources; one with no Source is
 * `ungrounded`. `hold` says why it waits for a person, null when it was released without one. A
 * Draft that is ungrounded, or has a failed check, always has a hold: no setting releases it. A
 * Rep's Draft is already approved by its author.
 */
export const draftSchema = z
  .strictObject({
    id: draftIdSchema,
    conversationId: conversationIdSchema,
    author: draftAuthorSchema,
    authorMembershipId: membershipIdSchema.nullable(),
    body: messageBodySchema,
    reason: draftReasonSchema.nullable(),
    sources: z.array(sourceSchema).max(MAX_DRAFT_SOURCES),
    confidence: confidenceSchema.nullable(),
    ungrounded: z.boolean(),
    checks: z.array(draftCheckSchema).max(20),
    hold: draftHoldReasonSchema.nullable(),
    assessment: draftAssessmentSchema.nullable(),
    status: draftStatusSchema,
    createdAt: timestampSchema,
    decidedAt: timestampSchema.nullable(),
  })
  .superRefine((d, ctx) => {
    const issue = issueAt(ctx)
    const agent = d.author === 'agent'
    if (agent !== (d.reason !== null)) {
      issue('reason', 'Exactly an Agent Draft has a reason')
    }
    if (agent !== (d.confidence !== null)) {
      issue('confidence', 'Exactly an Agent Draft has a confidence')
    }
    if (agent === (d.authorMembershipId !== null)) {
      issue('authorMembershipId', 'Exactly a Rep’s Draft names its author')
    }
    if (!agent && (d.sources.length > 0 || d.ungrounded || d.hold !== null)) {
      issue('sources', 'A Rep’s Draft has no Sources, is not ungrounded and is not held')
    }
    if (agent && d.ungrounded !== (d.sources.length === 0)) {
      issue('ungrounded', 'A Draft is ungrounded exactly when it cites no Source')
    }
    if (new Set(d.sources.map((s) => `${s.kind}:${s.sourceRef}`)).size !== d.sources.length) {
      issue('sources', 'A Source is cited once')
    }
    const failedCheck = d.checks.some((c) => !c.passed)
    if ((d.ungrounded || failedCheck) && d.hold === null) {
      issue('hold', 'An ungrounded Draft or one that failed a check is always held')
    }
    if (d.ungrounded && d.hold !== null && d.hold !== 'ungrounded') {
      issue('hold', 'An ungrounded Draft is held as ungrounded, whatever else holds it')
    }
    if (!d.ungrounded && failedCheck && d.hold !== null && d.hold !== 'check_failed') {
      issue('hold', 'A Draft that failed a check is held as check_failed')
    }
    if (d.hold === 'ungrounded' && !d.ungrounded) {
      issue('hold', 'Only an ungrounded Draft is held as ungrounded')
    }
    if (d.hold === 'check_failed' && !failedCheck) {
      issue('hold', 'Only a Draft that failed a check is held as check_failed')
    }
    if (d.status === 'pending' && d.hold === null) {
      issue('hold', 'A pending Draft waits because it is held')
    }
    if (d.status === 'pending' && d.decidedAt !== null) {
      issue('decidedAt', 'A pending Draft has no decision time')
    }
  })

/** A Draft. */
export type Draft = z.infer<typeof draftSchema>

/** What a recorded Decision was. */
export const DECISION_KINDS = [
  'approve',
  'edit_approve',
  'reject',
  'auto_release',
  'takeover',
  'hand_back',
] as const

/** What a recorded Decision was. */
export const decisionKindSchema = z.enum(DECISION_KINDS)

/** What a recorded Decision was. */
export type DecisionKind = z.infer<typeof decisionKindSchema>

/**
 * A Decision: one approval, edit, rejection, automatic release, takeover or hand-back, with who
 * and when. It names its Draft except for a takeover or hand-back. Only an automatic release has
 * no member. `acknowledgedUngrounded` is true when a person approved an ungrounded Draft knowing
 * it cites no Source. The edited text is the Message that was sent, not stored here.
 */
export const decisionSchema = z
  .strictObject({
    id: decisionIdSchema,
    conversationId: conversationIdSchema,
    draftId: draftIdSchema.nullable(),
    kind: decisionKindSchema,
    decidedByMembershipId: membershipIdSchema.nullable(),
    note: decisionNoteSchema.nullable(),
    acknowledgedUngrounded: z.boolean(),
    decidedAt: timestampSchema,
  })
  .superRefine((d, ctx) => {
    const issue = issueAt(ctx)
    const aboutConversation = d.kind === 'takeover' || d.kind === 'hand_back'
    if (aboutConversation !== (d.draftId === null)) {
      issue('draftId', 'A Draft decision names its Draft and a takeover or hand-back does not')
    }
    if ((d.kind === 'auto_release') !== (d.decidedByMembershipId === null)) {
      issue('decidedByMembershipId', 'Only an automatic release has no member')
    }
    if (d.acknowledgedUngrounded && d.kind !== 'approve' && d.kind !== 'edit_approve') {
      issue('acknowledgedUngrounded', 'Only an approval can acknowledge an ungrounded Draft')
    }
    if (d.note !== null && d.kind !== 'reject') {
      issue('note', 'Only a rejection carries a note')
    }
  })

/** A Decision. */
export type Decision = z.infer<typeof decisionSchema>

/** What an Organization's approval policy asks for a channel. See {@link approvalRuleSchema}. */
export const APPROVAL_MODES = ['always', 'below_confidence', 'except'] as const

/** The most labels an `except` rule may name. */
export const MAX_EXCEPT_LABELS = 10

/**
 * The approval rule for a channel. `always` (the default): every Draft waits for a person.
 * `below_confidence`: a Draft waits only when its confidence is below `threshold`. `except`: a
 * Draft waits unless its label is one of `labels`. The rule never overrides the holds that
 * always apply (an ungrounded Draft, a failed check, an escalated Conversation, the first
 * message to a Prospect).
 */
export const approvalRuleSchema = z.discriminatedUnion('mode', [
  z.strictObject({ mode: z.literal('always') }),
  z.strictObject({
    mode: z.literal('below_confidence'),
    threshold: z.number().gt(0).max(1),
  }),
  z.strictObject({
    mode: z.literal('except'),
    labels: z
      .array(replyLabelSchema)
      .min(1)
      .max(MAX_EXCEPT_LABELS)
      .refine((labels) => new Set(labels).size === labels.length, 'No repeats'),
  }),
])

/** The approval rule for a channel. */
export type ApprovalRule = z.infer<typeof approvalRuleSchema>

/** The approval policy of one channel: its rule, and when and by whom it was last set (null while it is the default). */
export const approvalPolicySchema = z.strictObject({
  channel: inboxChannelSchema,
  rule: approvalRuleSchema,
  updatedAt: timestampSchema.nullable(),
  updatedByMembershipId: membershipIdSchema.nullable(),
})

/** The approval policy of one channel. */
export type ApprovalPolicy = z.infer<typeof approvalPolicySchema>

/** What decides whether a Draft waits for a person. */
export type HoldFacts = {
  readonly label: z.infer<typeof replyLabelSchema>
  readonly confidence: number
  readonly ungrounded: boolean
  readonly failedCheck: boolean
  readonly escalated: boolean
  readonly firstMessage: boolean
}

/**
 * Says why a Draft waits for a person, or null when it may be released at once. The four holds
 * that always apply come first and no rule can turn them off; only then is the policy's rule asked.
 */
export function holdReasonFor(
  rule: ApprovalRule,
  facts: HoldFacts
): z.infer<typeof draftHoldReasonSchema> | null {
  if (facts.ungrounded) {
    return 'ungrounded'
  }
  if (facts.failedCheck) {
    return 'check_failed'
  }
  if (facts.escalated) {
    return 'escalated'
  }
  if (facts.firstMessage) {
    return 'first_message'
  }
  switch (rule.mode) {
    case 'always':
      return 'policy'
    case 'below_confidence':
      return facts.confidence < rule.threshold ? 'policy' : null
    case 'except':
      return rule.labels.includes(facts.label) ? null : 'policy'
  }
}

// --- requests and responses ---------------------------------------------------------------

/** The path parameters of a request about one Conversation. */
export const conversationParamsSchema = z.strictObject({ conversationId: conversationIdSchema })

/** The path parameters of a request about one Message of a Conversation. */
export const conversationMessageParamsSchema = z.strictObject({
  conversationId: conversationIdSchema,
  messageId: messageIdSchema,
})

/** The path parameters of a request about one Draft. */
export const draftParamsSchema = z.strictObject({ draftId: draftIdSchema })

/** The path parameters of a request about one channel's policy. */
export const channelParamsSchema = z.strictObject({ channel: inboxChannelSchema })

/** The headers of a request that requires an `Idempotency-Key` (header names arrive lower-cased). */
export const inboxKeyedHeadersSchema = z.object({ 'idempotency-key': idempotencyKeySchema })

/** The cursor position a Conversation list resumes from: latest activity first, then id. */
export const conversationCursorSchema = z.strictObject({
  lastMessageAt: timestampSchema,
  id: conversationIdSchema,
})

/**
 * The query parameters of a request to list Conversations: latest activity first, one
 * cursor-paginated page at a time, narrowed by channel, state, controller, the latest label and
 * Prospect. What the caller sees is decided from the token and a filter never widens it.
 */
export const listConversationsQuerySchema = pageQuerySchema
  .extend({
    channel: inboxChannelSchema.optional(),
    state: conversationStateSchema.optional(),
    controller: conversationControllerSchema.optional(),
    label: replyLabelSchema.optional(),
    prospectId: prospectIdSchema.optional(),
  })
  .strict()

/** The query parameters of a request to list Conversations. */
export type ListConversationsQuery = z.infer<typeof listConversationsQuerySchema>

/** One page of Conversations. */
export const conversationPageSchema = pageSchema(conversationSchema)

/** The cursor position a Message list resumes from: oldest first, then id. */
export const messageCursorSchema = z.strictObject({
  sentAt: timestampSchema,
  id: messageIdSchema,
})

/** The query parameters of a request to list the Messages of a Conversation, oldest first. */
export const listMessagesQuerySchema = pageQuerySchema.strict()

/** One page of Messages. */
export const messagePageSchema = pageSchema(messageSchema)

/** The body of a request to correct the label of an inbound Message. */
export const correctClassificationRequestSchema = z.strictObject({ label: replyLabelSchema })

/** The body of a request to take over or hand back a Conversation: none. */
export const conversationActionRequestSchema = z.strictObject({})

/** The body of a Rep's reply from the inbox: the text to send through the Conversation's channel. */
export const replyRequestSchema = z.strictObject({ body: messageBodySchema })

/**
 * The body of a request to approve a Draft. With `body` the Draft is edited and approved: that
 * text is what is sent, and the Decision is `edit_approve`. A Draft with no Source is approved
 * only with `acknowledgeUngrounded` true; without it the answer is `inbox.draft_ungrounded`.
 */
export const approveDraftRequestSchema = z.strictObject({
  body: messageBodySchema.optional(),
  acknowledgeUngrounded: z.boolean().default(false),
})

/** The body of a request to approve a Draft. */
export type ApproveDraftRequest = z.infer<typeof approveDraftRequestSchema>

/** The body of a request to reject a Draft, with an optional short note. */
export const rejectDraftRequestSchema = z.strictObject({ note: decisionNoteSchema.optional() })

/** The Sources of a Draft with their passages. */
export const draftSourcesSchema = z.strictObject({
  items: z.array(sourcePassageSchema).max(MAX_DRAFT_SOURCES),
})

/** An entry of the approval queue: a Draft waiting for a person, the Conversation it belongs to, and whether the caller may decide it. */
export const approvalQueueItemSchema = z.strictObject({
  draft: draftSchema,
  channel: inboxChannelSchema,
  prospectId: prospectIdSchema,
  ownerMembershipId: membershipIdSchema.nullable(),
  canApprove: z.boolean(),
})

/** An entry of the approval queue. */
export type ApprovalQueueItem = z.infer<typeof approvalQueueItemSchema>

/** The cursor position the approval queue resumes from: oldest first, then id. */
export const approvalQueueCursorSchema = z.strictObject({
  createdAt: timestampSchema,
  id: draftIdSchema,
})

/** The query parameters of a request to list the approval queue, oldest first. */
export const listApprovalQueueQuerySchema = pageQuerySchema
  .extend({
    channel: inboxChannelSchema.optional(),
    conversationId: conversationIdSchema.optional(),
  })
  .strict()

/** One page of the approval queue. */
export const approvalQueuePageSchema = pageSchema(approvalQueueItemSchema)

/** The cursor position a Decision list resumes from: latest first, then id. */
export const decisionCursorSchema = z.strictObject({
  decidedAt: timestampSchema,
  id: decisionIdSchema,
})

/** The query parameters of a request to list Decisions, latest first, optionally in a time range. */
export const listDecisionsQuerySchema = pageQuerySchema
  .extend({
    conversationId: conversationIdSchema.optional(),
    draftId: draftIdSchema.optional(),
    kind: decisionKindSchema.optional(),
    from: timestampSchema.optional(),
    to: timestampSchema.optional(),
  })
  .strict()
  .refine(
    (q) => q.from === undefined || q.to === undefined || Date.parse(q.to) > Date.parse(q.from),
    { message: 'The range ends after it starts', path: ['to'] }
  )

/** One page of Decisions. */
export const decisionPageSchema = pageSchema(decisionSchema)

/** The approval policy of every channel: one entry per channel, the default `always` until set. */
export const approvalPoliciesSchema = z.strictObject({
  items: z.array(approvalPolicySchema).max(3),
})

/** The body of a request to set a channel's approval rule; it replaces the rule, so a repeat changes nothing. */
export const setApprovalPolicyRequestSchema = z.strictObject({ rule: approvalRuleSchema })

/**
 * An ingested body: a Prospect's text as the channel gave it. Line endings become `\n` and other
 * control characters are dropped, so an ordinary CRLF reply is never refused (a lost reply could
 * be a lost unsubscribe). The cap applies to the raw text: 20,000 characters, so the normalised
 * body never exceeds it and the generated OpenAPI limit is the real one. It must not be blank.
 */
const ingestBodySchema = z
  .string()
  .max(MAX_MESSAGE_BODY_LENGTH)
  .transform((text) =>
    text
      .replace(/\r\n?/g, '\n')
      .split('')
      .filter((ch) => !hasControlCharacter(ch, true))
      .join('')
  )
  .pipe(messageBodySchema)

/**
 * The body a channel service posts to `/internal/messages` for every Message it received or sent.
 * Core stores one Message per channel and provider id. An inbound Message is the Prospect's;
 * an outbound one carries its Draft's id when it came from one, else it is an Agent's sequence
 * message. The body is untrusted text and never logged.
 */
export const ingestMessageRequestSchema = z
  .strictObject({
    channel: inboxChannelSchema,
    providerMessageId: providerMessageIdSchema,
    prospectId: prospectIdSchema,
    direction: messageDirectionSchema,
    body: ingestBodySchema,
    draftId: draftIdSchema.optional(),
    sentAt: timestampSchema,
  })
  .superRefine((m, ctx) => {
    if (m.direction === 'inbound' && m.draftId !== undefined) {
      issueAt(ctx)('draftId', 'An inbound Message has no Draft')
    }
  })

/** The body posted to `/internal/messages`. */
export type IngestMessageRequest = z.infer<typeof ingestMessageRequestSchema>

/** The answer to an ingest: the stored Message, and whether this call stored it (false for a repeat). */
export const ingestMessageResultSchema = z.strictObject({
  message: messageSchema,
  created: z.boolean(),
})

/** What a channel service needs to send an approved Draft: where, to whom and the text. Sensitive; never logged. */
export const draftReleaseSchema = z.strictObject({
  draftId: draftIdSchema,
  conversationId: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  body: messageBodySchema,
})

/** What a channel service needs to send an approved Draft. */
export type DraftRelease = z.infer<typeof draftReleaseSchema>
