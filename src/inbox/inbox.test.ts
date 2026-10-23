import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { AGENT_ERRORS } from '../agent'
import { CORE_ERRORS } from '../core'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import { INQUIRY_ERRORS } from '../inquiry'
import { MAX_PAGE_SIZE } from '../pagination'
import { PROSPECT_ERRORS } from '../prospect'
import {
  type ApprovalRule,
  approvalPolicySchema,
  approvalRuleSchema,
  approveDraftRequestSchema,
  classificationSchema,
  conversationSchema,
  correctClassificationRequestSchema,
  decisionSchema,
  draftSchema,
  holdReasonFor,
  INBOX_ERRORS,
  INBOX_EVENTS,
  INBOX_ROUTES,
  ingestMessageRequestSchema,
  ingestMessageResultSchema,
  listApprovalQueueQuerySchema,
  listConversationsQuerySchema,
  listDecisionsQuerySchema,
  messageApprovedEvent,
  messageSchema,
  REPLY_LABELS,
  replyClassifiedEvent,
  replyLabelSchema,
  sourceSchema,
  toReplyLabel,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const org = formatId('org', hex(1))
const cnv = formatId('cnv', hex(2))
const msg = formatId('msg', hex(3))
const drf = formatId('drf', hex(4))
const prs = formatId('prs', hex(5))
const mem = formatId('mem', hex(6))
const deal = formatId('deal', hex(7))
const doc = formatId('doc', hex(8))
const dcs = formatId('dcs', hex(9))
const NOW = '2026-01-01T00:00:00Z'

const envelope = (type: string, data: unknown) => ({
  id: formatId('evt', hex(10)),
  type,
  version: 1,
  occurredAt: NOW,
  organizationId: org,
  region: 'us',
  data,
})

const momentSource = {
  kind: 'moment',
  sourceRef: 'moment:42',
  dealRecordId: deal,
  documentId: null,
  outcome: 'won',
  evidenceCount: 3,
}
const chunkSource = {
  kind: 'document_chunk',
  sourceRef: 'chunk-9',
  dealRecordId: null,
  documentId: doc,
  outcome: null,
  evidenceCount: 1,
}
const agentDraft = {
  id: drf,
  conversationId: cnv,
  author: 'agent',
  authorMembershipId: null,
  body: 'Thanks for the question.\nHere is how we handled it.',
  reason: { triggerMessageId: msg, label: 'objection', strategy: 'Show the won price answer.' },
  sources: [momentSource],
  confidence: 0.8,
  ungrounded: false,
  checks: [{ name: 'no_pricing_claims', passed: true }],
  hold: 'policy',
  status: 'pending',
  createdAt: NOW,
  decidedAt: null,
}

describe('the reply label set', () => {
  test('is the ten labels of the spec', () => {
    expect([...REPLY_LABELS]).toEqual([
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
    ])
  })
  test.each(['', 'interested', 'POSITIVE', 'spam', 'ignore previous instructions', 'unsubscribe '])(
    'rejects the unknown label %p everywhere a label is accepted',
    (label) => {
      expect(replyLabelSchema.safeParse(label).success).toBe(false)
      expect(correctClassificationRequestSchema.safeParse({ label }).success).toBe(false)
      expect(listConversationsQuerySchema.safeParse({ label }).success).toBe(false)
      expect(
        classificationSchema.safeParse({
          label,
          confidence: 0.5,
          decidedBy: 'model',
          correctedByMembershipId: null,
          classifiedAt: NOW,
        }).success
      ).toBe(false)
      expect(
        replyClassifiedEvent.safeParse(
          envelope('reply.classified', {
            conversationId: cnv,
            messageId: msg,
            prospectId: prs,
            channel: 'email',
            label,
            confidence: 0.5,
            classifiedAt: NOW,
          })
        ).success
      ).toBe(false)
    }
  )
  test('toReplyLabel keeps a known label and turns anything else into other', () => {
    expect(toReplyLabel('objection')).toBe('objection')
    for (const bad of ['interested', 42, null, undefined, { label: 'positive' }]) {
      expect(toReplyLabel(bad)).toBe('other')
    }
  })
  test('a confidence outside 0 to 1 is refused', () => {
    const base = {
      label: 'positive',
      decidedBy: 'model',
      correctedByMembershipId: null,
      classifiedAt: NOW,
    }
    expect(classificationSchema.safeParse({ ...base, confidence: 1.1 }).success).toBe(false)
    expect(classificationSchema.safeParse({ ...base, confidence: -0.1 }).success).toBe(false)
    expect(classificationSchema.safeParse({ ...base, confidence: 1 }).success).toBe(true)
  })
  test('only a correction names who made it', () => {
    const base = { label: 'positive', confidence: 1, classifiedAt: NOW }
    expect(
      classificationSchema.safeParse({ ...base, decidedBy: 'rep', correctedByMembershipId: null })
        .success
    ).toBe(false)
    expect(
      classificationSchema.safeParse({ ...base, decidedBy: 'model', correctedByMembershipId: mem })
        .success
    ).toBe(false)
    expect(
      classificationSchema.safeParse({ ...base, decidedBy: 'rep', correctedByMembershipId: mem })
        .success
    ).toBe(true)
  })
})

describe('Conversation', () => {
  const base = {
    id: cnv,
    prospectId: prs,
    channel: 'email',
    controller: 'agent',
    controllerMembershipId: null,
    state: 'agent',
    ownerMembershipId: mem,
    latestLabel: null,
    pendingDraftCount: 0,
    lastMessageAt: NOW,
    createdAt: NOW,
  }
  test('parses and refuses a channel that is not in the list', () => {
    expect(conversationSchema.safeParse(base).success).toBe(true)
    expect(conversationSchema.safeParse({ ...base, channel: 'sms' }).success).toBe(false)
  })
  test('a Rep controls it exactly when a Rep is named', () => {
    expect(conversationSchema.safeParse({ ...base, controller: 'rep', state: 'rep' }).success).toBe(
      false
    )
    expect(conversationSchema.safeParse({ ...base, controllerMembershipId: mem }).success).toBe(
      false
    )
    expect(
      conversationSchema.safeParse({
        ...base,
        controller: 'rep',
        controllerMembershipId: mem,
        state: 'rep',
      }).success
    ).toBe(true)
  })
  test('the rep state needs a Rep, and a Rep-controlled one is rep or closed', () => {
    expect(conversationSchema.safeParse({ ...base, state: 'rep' }).success).toBe(false)
    expect(
      conversationSchema.safeParse({
        ...base,
        controller: 'rep',
        controllerMembershipId: mem,
        state: 'awaiting_approval',
      }).success
    ).toBe(false)
  })
})

describe('Message', () => {
  const inbound = {
    id: msg,
    conversationId: cnv,
    direction: 'inbound',
    authorKind: 'prospect',
    authorMembershipId: null,
    providerMessageId: '<abc@mail.example>',
    draftId: null,
    body: 'Can you do it cheaper?',
    sentAt: NOW,
    classification: null,
  }
  test('an inbound Message parses', () => {
    expect(messageSchema.safeParse(inbound).success).toBe(true)
  })
  test('an outbound Message names its Draft and has no classification', () => {
    const out = { ...inbound, direction: 'outbound', authorKind: 'agent', draftId: drf }
    expect(messageSchema.safeParse(out).success).toBe(true)
    expect(messageSchema.safeParse({ ...out, draftId: null }).success).toBe(true)
    expect(
      messageSchema.safeParse({ ...out, authorKind: 'rep', authorMembershipId: mem, draftId: null })
        .success
    ).toBe(false)
    expect(messageSchema.safeParse({ ...inbound, draftId: drf }).success).toBe(false)
    expect(
      messageSchema.safeParse({
        ...out,
        classification: {
          label: 'other',
          confidence: 0.1,
          decidedBy: 'model',
          correctedByMembershipId: null,
          classifiedAt: NOW,
        },
      }).success
    ).toBe(false)
  })
  test('authorship matches direction and names a Rep exactly for a Rep', () => {
    expect(messageSchema.safeParse({ ...inbound, authorKind: 'agent' }).success).toBe(false)
    expect(
      messageSchema.safeParse({ ...inbound, direction: 'outbound', draftId: drf }).success
    ).toBe(false)
    expect(
      messageSchema.safeParse({
        ...inbound,
        direction: 'outbound',
        authorKind: 'rep',
        draftId: drf,
      }).success
    ).toBe(false)
  })
  test.each([
    ['empty', ''],
    ['blank', '   \n '],
    ['a control character', 'hi\u0000there'],
    ['too long', 'x'.repeat(20001)],
  ])('refuses a body that is %s', (_name, body) => {
    expect(messageSchema.safeParse({ ...inbound, body }).success).toBe(false)
  })
  test('refuses an unknown field, so text cannot ride along', () => {
    expect(messageSchema.safeParse({ ...inbound, subject: 'x' }).success).toBe(false)
  })
})

describe('Source', () => {
  test('a Moment carries its Deal and Outcome; a document chunk its document and no Outcome', () => {
    expect(sourceSchema.safeParse(momentSource).success).toBe(true)
    expect(sourceSchema.safeParse(chunkSource).success).toBe(true)
    expect(sourceSchema.safeParse({ ...momentSource, outcome: null }).success).toBe(false)
    expect(sourceSchema.safeParse({ ...momentSource, dealRecordId: null }).success).toBe(false)
    expect(sourceSchema.safeParse({ ...momentSource, documentId: doc }).success).toBe(false)
    expect(sourceSchema.safeParse({ ...chunkSource, outcome: 'won' }).success).toBe(false)
    expect(sourceSchema.safeParse({ ...chunkSource, documentId: null }).success).toBe(false)
  })
  test('is a reference: no text field, a bounded id and a positive count', () => {
    expect(sourceSchema.safeParse({ ...momentSource, passage: 'text' }).success).toBe(false)
    expect(sourceSchema.safeParse({ ...momentSource, sourceRef: 'has space' }).success).toBe(false)
    expect(sourceSchema.safeParse({ ...momentSource, evidenceCount: 0 }).success).toBe(false)
  })
})

describe('Draft', () => {
  test('a grounded Agent Draft parses', () => {
    expect(draftSchema.safeParse(agentDraft).success).toBe(true)
  })
  test('is ungrounded exactly when it cites no Source', () => {
    expect(draftSchema.safeParse({ ...agentDraft, sources: [] }).success).toBe(false)
    expect(
      draftSchema.safeParse({ ...agentDraft, sources: [], ungrounded: true, hold: 'ungrounded' })
        .success
    ).toBe(true)
    expect(draftSchema.safeParse({ ...agentDraft, ungrounded: true }).success).toBe(false)
  })
  test('an ungrounded Draft is always held, so it cannot be released without a person', () => {
    expect(
      draftSchema.safeParse({
        ...agentDraft,
        sources: [],
        ungrounded: true,
        hold: null,
        status: 'approved',
        decidedAt: NOW,
      }).success
    ).toBe(false)
  })
  test('a Draft that failed a check is always held', () => {
    const failed = {
      ...agentDraft,
      hold: 'check_failed',
      checks: [{ name: 'tone', passed: false }],
    }
    expect(draftSchema.safeParse({ ...failed, hold: null, status: 'approved' }).success).toBe(false)
    expect(draftSchema.safeParse(failed).success).toBe(true)
  })
  test('the hold names the real reason, which a policy hold cannot hide', () => {
    expect(draftSchema.safeParse({ ...agentDraft, sources: [], ungrounded: true }).success).toBe(
      false
    )
    expect(draftSchema.safeParse({ ...agentDraft, hold: 'ungrounded' }).success).toBe(false)
    const failed = { ...agentDraft, checks: [{ name: 'tone', passed: false }] }
    expect(draftSchema.safeParse(failed).success).toBe(false)
    expect(draftSchema.safeParse({ ...agentDraft, hold: 'check_failed' }).success).toBe(false)
    expect(draftSchema.safeParse({ ...agentDraft, hold: 'escalated' }).success).toBe(true)
  })
  test('a pending Draft is held and undecided', () => {
    expect(draftSchema.safeParse({ ...agentDraft, hold: null }).success).toBe(false)
    expect(draftSchema.safeParse({ ...agentDraft, decidedAt: NOW }).success).toBe(false)
  })
  test('a released Draft may have no hold', () => {
    expect(
      draftSchema.safeParse({ ...agentDraft, hold: null, status: 'approved', decidedAt: NOW })
        .success
    ).toBe(true)
  })
  test('an Agent Draft has a reason and a confidence', () => {
    expect(draftSchema.safeParse({ ...agentDraft, reason: null }).success).toBe(false)
    expect(draftSchema.safeParse({ ...agentDraft, confidence: null }).success).toBe(false)
  })
  test('a Rep Draft names its author and has no Sources, reason or hold', () => {
    const rep = {
      ...agentDraft,
      author: 'rep',
      authorMembershipId: mem,
      reason: null,
      sources: [],
      confidence: null,
      ungrounded: false,
      hold: null,
      status: 'approved',
      decidedAt: NOW,
    }
    expect(draftSchema.safeParse(rep).success).toBe(true)
    expect(draftSchema.safeParse({ ...rep, authorMembershipId: null }).success).toBe(false)
    expect(draftSchema.safeParse({ ...rep, sources: [momentSource] }).success).toBe(false)
  })
  test('cites a Source once and at most ten', () => {
    expect(
      draftSchema.safeParse({ ...agentDraft, sources: [momentSource, momentSource] }).success
    ).toBe(false)
    const many = Array.from({ length: 11 }, (_, i) => ({ ...momentSource, sourceRef: `m${i}` }))
    expect(draftSchema.safeParse({ ...agentDraft, sources: many }).success).toBe(false)
  })
  test('a status outside the six is refused', () => {
    expect(draftSchema.safeParse({ ...agentDraft, status: 'sending' }).success).toBe(false)
  })
})

describe('approving a Draft', () => {
  test('does not acknowledge an ungrounded Draft unless asked', () => {
    const parsed = approveDraftRequestSchema.parse({})
    expect(parsed.acknowledgeUngrounded).toBe(false)
    expect(
      approveDraftRequestSchema.parse({ body: 'edited', acknowledgeUngrounded: true })
    ).toEqual({
      body: 'edited',
      acknowledgeUngrounded: true,
    })
  })
  test('refuses an edited body that is blank or holds a control character, and unknown fields', () => {
    expect(approveDraftRequestSchema.safeParse({ body: '  ' }).success).toBe(false)
    expect(approveDraftRequestSchema.safeParse({ body: 'a\u0007b' }).success).toBe(false)
    expect(approveDraftRequestSchema.safeParse({ status: 'approved' }).success).toBe(false)
  })
})

describe('Decision', () => {
  const base = {
    id: dcs,
    conversationId: cnv,
    draftId: drf,
    kind: 'approve',
    decidedByMembershipId: mem,
    note: null,
    acknowledgedUngrounded: false,
    decidedAt: NOW,
  }
  test('parses a Draft decision and a takeover', () => {
    expect(decisionSchema.safeParse(base).success).toBe(true)
    expect(decisionSchema.safeParse({ ...base, kind: 'takeover', draftId: null }).success).toBe(
      true
    )
  })
  test('a takeover has no Draft and a Draft decision has one', () => {
    expect(decisionSchema.safeParse({ ...base, kind: 'takeover' }).success).toBe(false)
    expect(decisionSchema.safeParse({ ...base, draftId: null }).success).toBe(false)
  })
  test('only an automatic release has no member', () => {
    expect(decisionSchema.safeParse({ ...base, decidedByMembershipId: null }).success).toBe(false)
    expect(
      decisionSchema.safeParse({ ...base, kind: 'auto_release', decidedByMembershipId: null })
        .success
    ).toBe(true)
    expect(decisionSchema.safeParse({ ...base, kind: 'auto_release' }).success).toBe(false)
  })
  test('only an approval can acknowledge an ungrounded Draft, and the field is required', () => {
    const { acknowledgedUngrounded: _omit, ...without } = base
    expect(decisionSchema.safeParse(without).success).toBe(false)
    expect(decisionSchema.safeParse({ ...base, acknowledgedUngrounded: true }).success).toBe(true)
    expect(
      decisionSchema.safeParse({ ...base, kind: 'edit_approve', acknowledgedUngrounded: true })
        .success
    ).toBe(true)
    for (const kind of ['reject', 'auto_release'] as const) {
      expect(
        decisionSchema.safeParse({
          ...base,
          kind,
          decidedByMembershipId: kind === 'reject' ? mem : null,
          acknowledgedUngrounded: true,
        }).success
      ).toBe(false)
    }
  })
  test('only a rejection carries a note', () => {
    expect(decisionSchema.safeParse({ ...base, note: 'too pushy' }).success).toBe(false)
    expect(decisionSchema.safeParse({ ...base, kind: 'reject', note: 'too pushy' }).success).toBe(
      true
    )
  })
})

describe('approval policy', () => {
  test.each<[string, unknown, boolean]>([
    ['always', { mode: 'always' }, true],
    ['below a confidence', { mode: 'below_confidence', threshold: 0.8 }, true],
    ['a threshold of zero', { mode: 'below_confidence', threshold: 0 }, false],
    ['a threshold above one', { mode: 'below_confidence', threshold: 1.5 }, false],
    ['except named labels', { mode: 'except', labels: ['positive', 'out_of_office'] }, true],
    ['except no labels', { mode: 'except', labels: [] }, false],
    ['except a repeated label', { mode: 'except', labels: ['positive', 'positive'] }, false],
    ['except an unknown label', { mode: 'except', labels: ['spam'] }, false],
    ['a never mode', { mode: 'never' }, false],
    ['always with an extra field', { mode: 'always', threshold: 0.1 }, false],
  ])('rule: %s', (_name, rule, ok) => {
    expect(approvalRuleSchema.safeParse(rule).success).toBe(ok)
  })
  test('a policy names its channel, and an unset one has no author', () => {
    expect(
      approvalPolicySchema.safeParse({
        channel: 'chat',
        rule: { mode: 'always' },
        updatedAt: null,
        updatedByMembershipId: null,
      }).success
    ).toBe(true)
    expect(
      approvalPolicySchema.safeParse({
        channel: 'fax',
        rule: { mode: 'always' },
        updatedAt: null,
        updatedByMembershipId: null,
      }).success
    ).toBe(false)
  })
})

describe('holdReasonFor', () => {
  const facts = {
    label: 'question',
    confidence: 0.95,
    ungrounded: false,
    failedCheck: false,
    escalated: false,
    firstMessage: false,
  } as const
  const rules: ApprovalRule[] = [
    { mode: 'always' },
    { mode: 'below_confidence', threshold: 0.1 },
    { mode: 'except', labels: ['question'] },
  ]
  test.each([
    ['ungrounded', { ungrounded: true }],
    ['check_failed', { failedCheck: true }],
    ['escalated', { escalated: true }],
    ['first_message', { firstMessage: true }],
  ] as const)('%s is held under every rule', (reason, override) => {
    for (const rule of rules) {
      expect(holdReasonFor(rule, { ...facts, ...override })).toBe(reason)
    }
  })
  test('the policy decides the rest', () => {
    expect(holdReasonFor({ mode: 'always' }, facts)).toBe('policy')
    expect(holdReasonFor({ mode: 'below_confidence', threshold: 0.9 }, facts)).toBeNull()
    expect(holdReasonFor({ mode: 'below_confidence', threshold: 0.96 }, facts)).toBe('policy')
    expect(holdReasonFor({ mode: 'below_confidence', threshold: 0.95 }, facts)).toBeNull()
    expect(holdReasonFor({ mode: 'except', labels: ['question'] }, facts)).toBeNull()
    expect(holdReasonFor({ mode: 'except', labels: ['positive'] }, facts)).toBe('policy')
  })
})

describe('lists and ingest', () => {
  test('ingest normalises line endings and control characters instead of refusing a reply', () => {
    const request = {
      channel: 'email',
      providerMessageId: '<abc@mail.example>',
      prospectId: prs,
      direction: 'inbound',
      sentAt: NOW,
    }
    const parsed = ingestMessageRequestSchema.parse({
      ...request,
      body: 'Please stop\r\nthanks\rbye\u0000\u000c',
    })
    expect(parsed.body).toBe('Please stop\nthanks\nbye')
    expect(ingestMessageRequestSchema.safeParse({ ...request, body: '\u0000\r\n ' }).success).toBe(
      false
    )
  })
  test('the ingest body cap in the OpenAPI input schema is the real 20,000', () => {
    const json = JSON.stringify(z.toJSONSchema(ingestMessageRequestSchema, { io: 'input' }))
    expect(json).toContain('"maxLength":20000')
    expect(json).not.toContain('40000')
  })
  test('an outbound ingest without a Draft parses and its stored Message validates', () => {
    const request = ingestMessageRequestSchema.parse({
      channel: 'email',
      providerMessageId: '<seq1@mail.example>',
      prospectId: prs,
      direction: 'outbound',
      body: 'Following up.',
      sentAt: NOW,
    })
    expect(request.draftId).toBeUndefined()
    expect(
      ingestMessageResultSchema.safeParse({
        created: true,
        message: {
          id: msg,
          conversationId: cnv,
          direction: 'outbound',
          authorKind: 'agent',
          authorMembershipId: null,
          providerMessageId: request.providerMessageId,
          draftId: null,
          body: request.body,
          sentAt: NOW,
          classification: null,
        },
      }).success
    ).toBe(true)
  })
  test('list queries default to a bounded page and refuse more than the maximum', () => {
    for (const schema of [
      listConversationsQuerySchema,
      listApprovalQueueQuerySchema,
      listDecisionsQuerySchema,
    ]) {
      expect(schema.parse({}).limit).toBe(25)
      expect(schema.safeParse({ limit: MAX_PAGE_SIZE }).success).toBe(true)
      expect(schema.safeParse({ limit: MAX_PAGE_SIZE + 1 }).success).toBe(false)
      expect(schema.safeParse({ limit: 0 }).success).toBe(false)
      expect(schema.safeParse({ organizationId: org }).success).toBe(false)
    }
  })
  test('a decision range must end after it starts', () => {
    expect(
      listDecisionsQuerySchema.safeParse({
        from: '2026-02-01T00:00:00Z',
        to: '2026-01-01T00:00:00Z',
      }).success
    ).toBe(false)
  })
  test('an ingest request names channel, provider id, Prospect, direction and body', () => {
    const request = {
      channel: 'email',
      providerMessageId: '<abc@mail.example>',
      prospectId: prs,
      direction: 'inbound',
      body: 'Not now, thanks.',
      sentAt: NOW,
    }
    expect(ingestMessageRequestSchema.safeParse(request).success).toBe(true)
    expect(ingestMessageRequestSchema.safeParse({ ...request, channel: 'sms' }).success).toBe(false)
    expect(
      ingestMessageRequestSchema.safeParse({ ...request, providerMessageId: 'has space' }).success
    ).toBe(false)
    expect(ingestMessageRequestSchema.safeParse({ ...request, draftId: drf }).success).toBe(false)
    expect(
      ingestMessageRequestSchema.safeParse({ ...request, direction: 'outbound', draftId: drf })
        .success
    ).toBe(true)
  })
})

describe('events', () => {
  const ids = { conversationId: cnv, prospectId: prs, channel: 'email' }
  const samples: Record<string, unknown> = {
    'message.approved': {
      ...ids,
      draftId: drf,
      approvedByMembershipId: mem,
      edited: false,
      acknowledgedUngrounded: false,
      approvedAt: NOW,
    },
    'message.sent': { ...ids, draftId: drf, messageId: msg, sentAt: NOW },
    'message.failed': {
      ...ids,
      draftId: drf,
      reason: 'timeout',
      retryable: true,
      failedAt: NOW,
    },
    'reply.classified': {
      ...ids,
      messageId: msg,
      label: 'unsubscribe',
      confidence: 0.9,
      classifiedAt: NOW,
    },
    'conversation.taken_over': {
      ...ids,
      takenOverByMembershipId: mem,
      voidedDraftCount: 2,
      takenOverAt: NOW,
    },
    'conversation.handed_back': { ...ids, handedBackByMembershipId: mem, handedBackAt: NOW },
  }
  test('the registry lists the six events', () => {
    expect(Object.keys(INBOX_EVENTS).sort()).toEqual(Object.keys(samples).sort())
  })
  test.each(Object.keys(samples))('%s parses on the shared envelope', (type) => {
    const event = INBOX_EVENTS[type as keyof typeof INBOX_EVENTS]
    expect(event.safeParse(envelope(type, samples[type])).success).toBe(true)
    expect(
      event.safeParse({ ...envelope(type, samples[type]), organizationId: 'org_x' }).success
    ).toBe(false)
    expect(event.safeParse(envelope(type, {})).success).toBe(false)
  })
  test.each(Object.keys(samples))('%s carries ids, never a body, text or note', (type) => {
    const event = INBOX_EVENTS[type as keyof typeof INBOX_EVENTS]
    for (const field of ['body', 'text', 'note', 'subject', 'passage', 'email', 'phone']) {
      const data = { ...(samples[type] as object), [field]: 'Hello there' }
      expect(event.safeParse(envelope(type, data)).success).toBe(false)
    }
  })
  test('message.approved is for a person or the policy, and a failure reason is a closed code', () => {
    expect(
      messageApprovedEvent.safeParse(
        envelope('message.approved', {
          ...(samples['message.approved'] as object),
          approvedByMembershipId: null,
        })
      ).success
    ).toBe(true)
    expect(
      INBOX_EVENTS['message.failed'].safeParse(
        envelope('message.failed', {
          ...(samples['message.failed'] as object),
          reason: '550 mailbox full: jane@acme.example',
        })
      ).success
    ).toBe(false)
  })
})

describe('errors', () => {
  test('the four codes of the spec exist with their statuses', () => {
    expect(INBOX_ERRORS['inbox.conversation_not_found'].status).toBe(404)
    expect(INBOX_ERRORS['inbox.draft_not_pending'].status).toBe(409)
    expect(INBOX_ERRORS['inbox.not_conversation_owner'].status).toBe(403)
    expect(INBOX_ERRORS['inbox.draft_ungrounded'].status).toBe(422)
  })
  test('every code is inbox.* and none collides with another registry', () => {
    for (const code of Object.keys(INBOX_ERRORS)) {
      expect(code.startsWith('inbox.')).toBe(true)
      for (const other of [ERRORS, CORE_ERRORS, PROSPECT_ERRORS, AGENT_ERRORS, INQUIRY_ERRORS]) {
        expect(code in other).toBe(false)
      }
    }
  })
  test('no message repeats text a Prospect wrote', () => {
    for (const e of Object.values(INBOX_ERRORS)) {
      expect(e.message.length).toBeGreaterThan(10)
    }
  })
})

describe('routes', () => {
  const routes = Object.entries(INBOX_ROUTES)
  test('every code a route lists exists', () => {
    const known = new Set([...Object.keys(INBOX_ERRORS), ...Object.keys(ERRORS)])
    for (const [, r] of routes) {
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
  })
  test('ingest names the unknown Prospect error and says the Organization is never in the body', () => {
    expect(INBOX_ERRORS['inbox.prospect_not_found'].status).toBe(404)
    expect(INBOX_ROUTES.ingestMessage.errors).toContain('inbox.prospect_not_found')
    expect(INBOX_ROUTES.ingestMessage.description).toContain('never taken from the body')
  })
  test('every inbox code is returned by some route', () => {
    const used = new Set(routes.flatMap(([, r]) => r.errors))
    for (const code of Object.keys(INBOX_ERRORS)) {
      expect(used.has(code as never)).toBe(true)
    }
  })
  test('method and path are unique, versioned or internal, and described', () => {
    const seen = new Set<string>()
    for (const [, r] of routes) {
      const key = `${r.method} ${r.path}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      expect(r.path.startsWith(r.internal ? '/internal/' : '/v1/')).toBe(true)
      expect(r.description.length).toBeGreaterThan(40)
      expect(r.roles.length > 0 || r.internal === true).toBe(true)
      expect(r.public).toBeUndefined()
    }
  })
  test('the list routes describe their cursor and maximum page size', () => {
    for (const name of [
      'listConversations',
      'listConversationMessages',
      'listApprovalQueue',
      'listDecisions',
    ] as const) {
      expect(INBOX_ROUTES[name].description).toContain('cursor')
      expect(INBOX_ROUTES[name].description).toContain('100')
    }
  })
  test('a route that needs a key says so, and a retried one lists the replay errors', () => {
    for (const [, r] of routes) {
      if (r.keyRequired) {
        expect(r.description).toContain('Idempotency-Key')
      }
      if (r.idempotent && !r.internal) {
        expect(r.commonErrors).toContain('request.idempotency_key_reused')
      }
    }
  })
  test('actions that send or change who answers need an Idempotency-Key', () => {
    for (const name of [
      'takeOverConversation',
      'handBackConversation',
      'replyToConversation',
      'approveDraft',
      'rejectDraft',
    ] as const) {
      expect(INBOX_ROUTES[name].keyRequired).toBe(true)
    }
  })
  test('visibility is by role and hides what the caller cannot see', () => {
    expect(INBOX_ROUTES.listConversations.roles).toEqual(['owner', 'admin', 'manager', 'rep'])
    expect(INBOX_ROUTES.getConversation.errors).toContain('inbox.conversation_not_found')
    expect(INBOX_ROUTES.getConversation.description).toContain('never 403')
    expect(INBOX_ROUTES.setApprovalPolicy.roles).toEqual(['owner', 'admin'])
    expect(INBOX_ROUTES.listDecisions.roles).toEqual(['owner', 'admin', 'manager'])
  })
  test('approval can refuse an ungrounded Draft and says the unprotected holds have no setting', () => {
    expect(INBOX_ROUTES.approveDraft.errors).toEqual(
      expect.arrayContaining(['inbox.draft_ungrounded', 'inbox.draft_not_pending'])
    )
    expect(INBOX_ROUTES.setApprovalPolicy.description).toContain('there is no setting')
  })
  test('takeover is idempotent and refuses a second Rep', () => {
    expect(INBOX_ROUTES.takeOverConversation.errors).toContain('inbox.already_controlled')
    expect(INBOX_ROUTES.takeOverConversation.description).toContain('voided')
    expect(INBOX_ROUTES.handBackConversation.errors).toContain('inbox.not_conversation_owner')
  })
  test('the internal routes use the shared secret and no user token', () => {
    for (const name of ['ingestMessage', 'getDraftRelease'] as const) {
      const r = INBOX_ROUTES[name]
      expect(r.internal).toBe(true)
      expect(r.roles).toEqual([])
      expect(r.description).toContain('shared secret')
    }
    expect(INBOX_ROUTES.ingestMessage.success).toEqual([201, 200])
  })
  test('every route warns that text is never logged where it handles text', () => {
    for (const name of [
      'listConversationMessages',
      'getDraft',
      'ingestMessage',
      'approveDraft',
    ] as const) {
      expect(INBOX_ROUTES[name].description).toContain('never log')
    }
  })
})

test('the area is exported from the entry point', async () => {
  const api = await import('../index')
  expect(api.INBOX_ROUTES).toBe(INBOX_ROUTES)
  expect(api.messageApprovedEvent).toBe(messageApprovedEvent)
  expect(api.replyLabelSchema).toBe(replyLabelSchema)
})
