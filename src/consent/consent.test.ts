import { describe, expect, test } from 'bun:test'
import { z } from 'zod'
import { ERRORS } from '../errors'
import { formatId, organizationIdSchema, prospectIdSchema } from '../ids'
import { MAX_PAGE_SIZE } from '../pagination'
import { PROSPECT_ERRORS } from '../prospect'
import {
  addSuppressionRequestSchema,
  CONSENT_CHANNELS,
  CONSENT_ERRORS,
  CONSENT_EVENTS,
  CONSENT_REQUIRED_CHANNELS,
  CONSENT_ROUTES,
  CONTACT_DENIAL_CODES,
  consentChannelSchema,
  consentEventSchema,
  consentFormSchema,
  consentGrantedEvent,
  consentWithdrawnEvent,
  consentWordingSchema,
  contactCheckRequestSchema,
  contactCheckResultSchema,
  createConsentFormRequestSchema,
  createConsentWordingRequestSchema,
  evidenceEventSchema,
  hostedConsentSubmissionSchema,
  listConsentEventsQuerySchema,
  listConsentFormsQuerySchema,
  listConsentWordingsQuerySchema,
  listContactChecksQuerySchema,
  listEvidenceQuerySchema,
  listSuppressionEntriesQuerySchema,
  listSuppressionImportRowsQuerySchema,
  lookupSuppressionRequestSchema,
  oneClickUnsubscribeRequestSchema,
  prospectConsentSchema,
  recordConsentRequestSchema,
  recordDeliveryFailureRequestSchema,
  recordWithdrawalRequestSchema,
  removeSuppressionRequestSchema,
  SUPPRESSION_REASONS,
  SUPPRESSION_REMOVABLE_REASONS,
  suppressionAddedEvent,
  suppressionEntrySchema,
  suppressionImportSchema,
  suppressionRemovedEvent,
  updateConsentWordingRequestSchema,
  withdrawConsentRequestSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const org = formatId('org', hex(1))
const prs = formatId('prs', hex(2))
const usr = formatId('usr', hex(3))
const cev = formatId('cev', hex(4))
const cwd = formatId('cwd', hex(5))
const sup = formatId('sup', hex(6))
const cfm = formatId('cfm', hex(7))
const chk = formatId('chk', hex(8))
const simp = formatId('simp', hex(9))
const call = formatId('call', hex(10))
const NOW = '2026-10-22T10:00:00Z'
const TOKEN = 'A'.repeat(43)

describe('ids', () => {
  test('the new ids are prefixed and distinct', () => {
    expect(prospectIdSchema.safeParse(cev).success).toBe(false)
    expect(organizationIdSchema.safeParse(sup).success).toBe(false)
  })
})

describe('channels', () => {
  test('the five channels, three of which need a Contact Consent for an Agent', () => {
    expect([...CONSENT_CHANNELS]).toEqual(['phone', 'sms', 'whatsapp', 'email', 'linkedin'])
    expect([...CONSENT_REQUIRED_CHANNELS]).toEqual(['phone', 'sms', 'whatsapp'])
    expect(consentChannelSchema.safeParse('fax').success).toBe(false)
  })
})

describe('list queries', () => {
  const lists = {
    events: listConsentEventsQuerySchema,
    wordings: listConsentWordingsQuerySchema,
    forms: listConsentFormsQuerySchema,
    suppression: listSuppressionEntriesQuerySchema,
    importRows: listSuppressionImportRowsQuerySchema,
    checks: listContactChecksQuerySchema,
    evidence: listEvidenceQuerySchema,
  }
  for (const [name, schema] of Object.entries(lists)) {
    test(`${name} accepts a limit of ${MAX_PAGE_SIZE}, refuses one more, unknown keys and a long cursor`, () => {
      expect(schema.safeParse({ limit: String(MAX_PAGE_SIZE) }).success).toBe(true)
      expect(schema.safeParse({ limit: String(MAX_PAGE_SIZE + 1) }).success).toBe(false)
      expect(schema.safeParse({ nope: 1 }).success).toBe(false)
      expect(schema.safeParse({ cursor: 'x'.repeat(513) }).success).toBe(false)
    })
  }
  test('the list takes a reason and never an address in the query string', () => {
    expect(listSuppressionEntriesQuerySchema.safeParse({ reason: 'stop' }).success).toBe(true)
    expect(listSuppressionEntriesQuerySchema.safeParse({ q: 'a@example.com' }).success).toBe(false)
    expect(listSuppressionEntriesQuerySchema.safeParse({ reason: 'dnc' }).success).toBe(false)
  })
  test('a lookup names exactly one address in a body', () => {
    expect(lookupSuppressionRequestSchema.safeParse({ email: 'a@example.com' }).success).toBe(true)
    expect(lookupSuppressionRequestSchema.safeParse({}).success).toBe(false)
    expect(
      lookupSuppressionRequestSchema.safeParse({ email: 'a@example.com', phone: '+14155550100' })
        .success
    ).toBe(false)
  })
})

const grantedEvent = {
  id: cev,
  prospectId: prs,
  channel: 'sms',
  kind: 'granted',
  source: 'verbal_call',
  wordingId: cwd,
  evidenceRef: 'call recording 17',
  callId: call,
  formId: null,
  stopAll: false,
  recordedByUserId: usr,
  occurredAt: NOW,
  recordedAt: NOW,
}

describe('consent events', () => {
  test('a granted event carries wording and evidence', () => {
    expect(consentEventSchema.safeParse(grantedEvent).success).toBe(true)
    expect(consentEventSchema.safeParse({ ...grantedEvent, wordingId: null }).success).toBe(false)
    expect(consentEventSchema.safeParse({ ...grantedEvent, evidenceRef: null }).success).toBe(false)
  })
  test('a verbal grant links the Call and a hosted grant links the form', () => {
    expect(consentEventSchema.safeParse({ ...grantedEvent, callId: null }).success).toBe(false)
    expect(
      consentEventSchema.safeParse({ ...grantedEvent, source: 'manual', callId: call }).success
    ).toBe(false)
    const hosted = { ...grantedEvent, source: 'hosted_form', callId: null, formId: cfm }
    expect(consentEventSchema.safeParse(hosted).success).toBe(true)
    expect(consentEventSchema.safeParse({ ...hosted, formId: null }).success).toBe(false)
  })
  test('a withdrawn event has a withdrawal source and needs no wording', () => {
    const withdrawn = {
      ...grantedEvent,
      kind: 'withdrawn',
      source: 'stop_reply',
      wordingId: null,
      evidenceRef: null,
      callId: null,
      recordedByUserId: null,
      stopAll: true,
    }
    expect(consentEventSchema.safeParse(withdrawn).success).toBe(true)
    expect(consentEventSchema.safeParse({ ...withdrawn, source: 'verbal_call' }).success).toBe(
      false
    )
    expect(consentEventSchema.safeParse({ ...grantedEvent, stopAll: true }).success).toBe(false)
  })
  test('manual and crm are valid sources on both a grant and a withdrawal', () => {
    const withdrawn = {
      ...grantedEvent,
      kind: 'withdrawn',
      wordingId: null,
      evidenceRef: null,
      callId: null,
    }
    for (const source of ['manual', 'crm']) {
      expect(consentEventSchema.safeParse({ ...grantedEvent, source, callId: null }).success).toBe(
        true
      )
      expect(consentEventSchema.safeParse({ ...withdrawn, source }).success).toBe(true)
    }
  })
  test('a withdrawal-only source is refused on a grant, and a grant-only source on a withdrawal', () => {
    const withdrawn = {
      ...grantedEvent,
      kind: 'withdrawn',
      wordingId: null,
      evidenceRef: null,
      callId: null,
    }
    for (const source of ['stop_reply', 'unsubscribe']) {
      expect(consentEventSchema.safeParse({ ...grantedEvent, source, callId: null }).success).toBe(
        false
      )
      expect(consentEventSchema.safeParse({ ...withdrawn, source }).success).toBe(true)
    }
    expect(
      consentEventSchema.safeParse({ ...withdrawn, source: 'import_attestation' }).success
    ).toBe(false)
    expect(
      consentEventSchema.safeParse({ ...withdrawn, source: 'hosted_form', formId: cfm }).success
    ).toBe(false)
    expect(
      consentEventSchema.safeParse({ ...withdrawn, source: 'verbal_call', callId: call }).success
    ).toBe(false)
  })
  test('the evidence event adds the wording text and the hosted submission, only for a form', () => {
    const wording = { id: cwd, version: 2, text: 'I agree to be texted by an AI.' }
    expect(
      evidenceEventSchema.safeParse({ ...grantedEvent, wording, submission: null }).success
    ).toBe(true)
    const hosted = {
      ...grantedEvent,
      source: 'hosted_form',
      callId: null,
      formId: cfm,
      wording,
      submission: { ipAddress: '203.0.113.9', userAgent: 'Mozilla/5.0' },
    }
    expect(evidenceEventSchema.safeParse(hosted).success).toBe(true)
    expect(evidenceEventSchema.safeParse({ ...hosted, submission: null }).success).toBe(false)
    expect(
      evidenceEventSchema.safeParse({
        ...grantedEvent,
        wording,
        submission: { ipAddress: '203.0.113.9', userAgent: 'x' },
      }).success
    ).toBe(false)
  })
  test('a Prospect consent lists each channel once and its suppression state', () => {
    const channels = CONSENT_CHANNELS.map((channel) => ({
      channel,
      state: channel === 'sms' ? 'granted' : 'none',
      since: channel === 'sms' ? NOW : null,
      lastEventId: channel === 'sms' ? cev : null,
      wordingId: channel === 'sms' ? cwd : null,
    }))
    const body = { prospectId: prs, channels, suppressed: false, suppressionReason: null }
    expect(prospectConsentSchema.safeParse(body).success).toBe(true)
    expect(prospectConsentSchema.safeParse({ ...body, channels: channels.slice(1) }).success).toBe(
      false
    )
    expect(
      prospectConsentSchema.safeParse({ ...body, suppressed: true, suppressionReason: null })
        .success
    ).toBe(false)
    expect(
      prospectConsentSchema.safeParse({ ...body, suppressed: true, suppressionReason: 'stop' })
        .success
    ).toBe(true)
    expect(
      prospectConsentSchema.safeParse({
        ...body,
        channels: channels.map((c) => ({ ...c, state: 'none', since: NOW })),
      }).success
    ).toBe(false)
  })
})

describe('recording and withdrawing', () => {
  const grant = {
    channel: 'sms',
    source: 'verbal_call',
    wordingId: cwd,
    evidenceRef: 'call 17 at 04:12',
    callId: call,
  }
  test('a grant needs a source, wording and a reference', () => {
    expect(recordConsentRequestSchema.safeParse(grant).success).toBe(true)
    for (const key of ['source', 'wordingId', 'evidenceRef', 'channel']) {
      const { [key]: _gone, ...rest } = grant as Record<string, unknown>
      expect(recordConsentRequestSchema.safeParse(rest).success).toBe(false)
    }
  })
  test('a request cannot claim the hosted form source, set the actor or switch anything off', () => {
    expect(recordConsentRequestSchema.safeParse({ ...grant, source: 'hosted_form' }).success).toBe(
      false
    )
    expect(recordConsentRequestSchema.safeParse({ ...grant, recordedByUserId: usr }).success).toBe(
      false
    )
    expect(recordConsentRequestSchema.safeParse({ ...grant, source: 'unsubscribe' }).success).toBe(
      false
    )
  })
  test('a verbal grant needs the Call, others must not carry one', () => {
    const { callId: _c, ...noCall } = grant
    expect(recordConsentRequestSchema.safeParse(noCall).success).toBe(false)
    expect(recordConsentRequestSchema.safeParse({ ...grant, source: 'manual' }).success).toBe(false)
  })
  test('an evidence reference is bounded text and the time is optional', () => {
    expect(
      recordConsentRequestSchema.safeParse({ ...grant, evidenceRef: 'x'.repeat(201) }).success
    ).toBe(false)
    expect(recordConsentRequestSchema.safeParse({ ...grant, occurredAt: NOW }).success).toBe(true)
    expect(
      recordConsentRequestSchema.safeParse({ ...grant, occurredAt: 'yesterday' }).success
    ).toBe(false)
  })
  test('a withdrawal names channels or all, not both and not neither', () => {
    expect(withdrawConsentRequestSchema.safeParse({ channels: ['sms'] }).success).toBe(true)
    expect(withdrawConsentRequestSchema.safeParse({ all: true }).success).toBe(true)
    expect(withdrawConsentRequestSchema.safeParse({}).success).toBe(false)
    expect(withdrawConsentRequestSchema.safeParse({ channels: ['sms'], all: true }).success).toBe(
      false
    )
    expect(withdrawConsentRequestSchema.safeParse({ channels: ['sms', 'sms'] }).success).toBe(false)
    expect(withdrawConsentRequestSchema.safeParse({ channels: [] }).success).toBe(false)
    expect(withdrawConsentRequestSchema.safeParse({ all: false }).success).toBe(false)
  })
})

describe('wording', () => {
  const wording = {
    id: cwd,
    version: 1,
    text: 'I agree that an AI may call or text me.\nI can reply STOP.',
    channels: ['phone', 'sms'],
    locked: false,
    supersedesId: null,
    createdAt: NOW,
    createdByUserId: usr,
  }
  test('a wording has text, channels and a lock', () => {
    expect(consentWordingSchema.safeParse(wording).success).toBe(true)
    expect(consentWordingSchema.safeParse({ ...wording, version: 0 }).success).toBe(false)
    expect(consentWordingSchema.safeParse({ ...wording, channels: [] }).success).toBe(false)
    expect(consentWordingSchema.safeParse({ ...wording, channels: ['sms', 'sms'] }).success).toBe(
      false
    )
    expect(
      consentWordingSchema.safeParse({ ...wording, version: 2, supersedesId: null }).success
    ).toBe(false)
  })
  test('create and update are strict and bounded', () => {
    const body = { text: wording.text, channels: ['sms'] }
    expect(createConsentWordingRequestSchema.safeParse(body).success).toBe(true)
    expect(
      createConsentWordingRequestSchema.safeParse({ ...body, text: 'x'.repeat(5001) }).success
    ).toBe(false)
    expect(createConsentWordingRequestSchema.safeParse({ ...body, locked: true }).success).toBe(
      false
    )
    expect(updateConsentWordingRequestSchema.safeParse({}).success).toBe(false)
    expect(updateConsentWordingRequestSchema.safeParse({ text: 'New' }).success).toBe(true)
  })
})

describe('forms', () => {
  const form = {
    id: cfm,
    wordingId: cwd,
    name: 'Webinar sign-up',
    channels: ['sms'],
    state: 'published',
    token: TOKEN,
    createdAt: NOW,
    createdByUserId: usr,
    publishedAt: NOW,
    closedAt: null,
  }
  test('a form has a token and a publish time exactly when published or closed', () => {
    expect(consentFormSchema.safeParse(form).success).toBe(true)
    expect(consentFormSchema.safeParse({ ...form, token: null }).success).toBe(true)
    expect(consentFormSchema.safeParse({ ...form, token: null, publishedAt: null }).success).toBe(
      false
    )
    expect(consentFormSchema.safeParse({ ...form, state: 'draft' }).success).toBe(false)
    expect(
      consentFormSchema.safeParse({ ...form, state: 'draft', token: null, publishedAt: null })
        .success
    ).toBe(true)
    expect(consentFormSchema.safeParse({ ...form, state: 'draft' }).success).toBe(false)
    expect(consentFormSchema.safeParse({ ...form, state: 'closed' }).success).toBe(false)
    expect(consentFormSchema.safeParse({ ...form, closedAt: NOW }).success).toBe(false)
  })
  test('create takes a wording and the channels offered', () => {
    expect(
      createConsentFormRequestSchema.safeParse({ wordingId: cwd, name: 'F', channels: ['sms'] })
        .success
    ).toBe(true)
    expect(
      createConsentFormRequestSchema.safeParse({ wordingId: cwd, name: 'F', channels: [] }).success
    ).toBe(false)
  })
})

describe('hosted submission', () => {
  const body = {
    wordingId: cwd,
    firstName: 'Ada',
    phone: '+1 415 555 0100',
    choices: [{ channel: 'sms', agreed: true }],
  }
  test('every offered channel needs an explicit choice and one must be a yes', () => {
    expect(hostedConsentSubmissionSchema.safeParse(body).success).toBe(true)
    expect(hostedConsentSubmissionSchema.safeParse({ ...body, choices: [] }).success).toBe(false)
    expect(
      hostedConsentSubmissionSchema.safeParse({
        ...body,
        choices: [{ channel: 'sms', agreed: false }],
      }).success
    ).toBe(false)
    expect(
      hostedConsentSubmissionSchema.safeParse({
        ...body,
        choices: [
          { channel: 'sms', agreed: true },
          { channel: 'sms', agreed: true },
        ],
      }).success
    ).toBe(false)
    expect(
      hostedConsentSubmissionSchema.safeParse({ ...body, choices: [{ channel: 'sms' }] }).success
    ).toBe(false)
  })
  test('the address needed for a channel is required, and ip and agent are never read from the body', () => {
    const { phone: _p, ...noPhone } = body
    expect(hostedConsentSubmissionSchema.safeParse(noPhone).success).toBe(false)
    expect(
      hostedConsentSubmissionSchema.safeParse({
        ...noPhone,
        email: 'a@b.co',
        choices: [{ channel: 'email', agreed: true }],
      }).success
    ).toBe(true)
    expect(hostedConsentSubmissionSchema.safeParse({ ...body, ipAddress: '1.1.1.1' }).success).toBe(
      false
    )
    expect(hostedConsentSubmissionSchema.safeParse({ ...body, prospectId: prs }).success).toBe(
      false
    )
  })
})

describe('hosted submission channels', () => {
  const base = { wordingId: cwd, phone: '+1 415 555 0100' }
  test('an email choice needs an email and LinkedIn is not offered', () => {
    expect(
      hostedConsentSubmissionSchema.safeParse({
        ...base,
        choices: [{ channel: 'email', agreed: true }],
      }).success
    ).toBe(false)
    expect(
      hostedConsentSubmissionSchema.safeParse({
        ...base,
        choices: [{ channel: 'linkedin', agreed: true }],
      }).success
    ).toBe(false)
  })
})

describe('unsubscribe', () => {
  test('the one-click body is the RFC 8058 pair and nothing else', () => {
    expect(
      oneClickUnsubscribeRequestSchema.safeParse({ 'List-Unsubscribe': 'One-Click' }).success
    ).toBe(true)
    expect(oneClickUnsubscribeRequestSchema.safeParse({}).success).toBe(false)
    expect(
      oneClickUnsubscribeRequestSchema.safeParse({
        'List-Unsubscribe': 'One-Click',
        email: 'a@b.co',
      }).success
    ).toBe(false)
  })
})

describe('suppression', () => {
  const entry = {
    id: sup,
    addressKind: 'email',
    maskedAddress: 'a***@example.com',
    reason: 'manual',
    channel: null,
    sourceRef: null,
    addedByUserId: usr,
    removable: true,
    createdAt: NOW,
    removedAt: null,
    removedByUserId: null,
    removalReason: null,
  }
  test('only a manual entry is removable', () => {
    expect([...SUPPRESSION_REMOVABLE_REASONS]).toEqual(['manual'])
    expect(suppressionEntrySchema.safeParse(entry).success).toBe(true)
    expect(suppressionEntrySchema.safeParse({ ...entry, removable: false }).success).toBe(false)
    expect(suppressionEntrySchema.safeParse({ ...entry, reason: 'stop' }).success).toBe(false)
    expect(
      suppressionEntrySchema.safeParse({ ...entry, reason: 'stop', removable: false }).success
    ).toBe(true)
  })
  test('an erased entry keeps no address and a removed entry says who and why', () => {
    expect([...SUPPRESSION_REASONS]).toEqual([
      'unsubscribe',
      'stop',
      'bounce',
      'complaint',
      'manual',
      'crm',
      'erased',
    ])
    const erased = { ...entry, reason: 'erased', removable: false, maskedAddress: null }
    expect(suppressionEntrySchema.safeParse(erased).success).toBe(true)
    expect(suppressionEntrySchema.safeParse({ ...erased, maskedAddress: 'a***' }).success).toBe(
      false
    )
    const removed = {
      ...entry,
      removedAt: NOW,
      removedByUserId: usr,
      removalReason: 'Added in error',
    }
    expect(suppressionEntrySchema.safeParse(removed).success).toBe(true)
    expect(suppressionEntrySchema.safeParse({ ...removed, removalReason: null }).success).toBe(
      false
    )
  })
  test('an entry never carries the address or its hash', () => {
    expect(suppressionEntrySchema.safeParse({ ...entry, address: 'a@example.com' }).success).toBe(
      true
    )
    const parsed = suppressionEntrySchema.parse({ ...entry, address: 'a@example.com', hash: 'ab' })
    expect(Object.keys(parsed)).not.toContain('address')
    expect(Object.keys(parsed)).not.toContain('hash')
  })
  test('add takes exactly one address and removal needs a reason', () => {
    expect(addSuppressionRequestSchema.safeParse({ email: 'A@Example.com' }).success).toBe(true)
    expect(addSuppressionRequestSchema.safeParse({ phone: '+1 415 555 0100' }).success).toBe(true)
    expect(
      addSuppressionRequestSchema.safeParse({ email: 'a@b.co', phone: '+14155550100' }).success
    ).toBe(false)
    expect(addSuppressionRequestSchema.safeParse({}).success).toBe(false)
    expect(addSuppressionRequestSchema.safeParse({ email: 'a@b.co', reason: 'stop' }).success).toBe(
      false
    )
    expect(removeSuppressionRequestSchema.safeParse({ reason: 'Added in error' }).success).toBe(
      true
    )
    expect(removeSuppressionRequestSchema.safeParse({}).success).toBe(false)
  })
  test('internal withdrawal and delivery failure name the Organization and the address', () => {
    const base = { organizationId: org, channel: 'sms', phone: '+14155550100', sourceRef: 'msg-1' }
    expect(recordWithdrawalRequestSchema.safeParse({ ...base, stopAll: false }).success).toBe(true)
    expect(recordWithdrawalRequestSchema.safeParse({ ...base, organizationId: prs }).success).toBe(
      false
    )
    expect(recordWithdrawalRequestSchema.safeParse({ ...base, reason: 'manual' }).success).toBe(
      false
    )
    const failure = { organizationId: org, email: 'a@b.co', reason: 'bounce', sourceRef: 'ses-1' }
    expect(recordDeliveryFailureRequestSchema.safeParse(failure).success).toBe(true)
    expect(
      recordDeliveryFailureRequestSchema.safeParse({ ...failure, reason: 'manual' }).success
    ).toBe(false)
  })
  test('an import is counted exactly when completed', () => {
    const imp = {
      id: simp,
      state: 'completed',
      failureReason: null,
      totalRows: 3,
      addedRows: 1,
      alreadySuppressedRows: 1,
      invalidRows: 1,
      createdAt: NOW,
      completedAt: NOW,
      createdByUserId: usr,
    }
    expect(suppressionImportSchema.safeParse(imp).success).toBe(true)
    expect(suppressionImportSchema.safeParse({ ...imp, invalidRows: 0 }).success).toBe(false)
    expect(
      suppressionImportSchema.safeParse({
        ...imp,
        state: 'processing',
        completedAt: null,
      }).success
    ).toBe(false)
  })
})

describe('contact check', () => {
  const request = {
    organizationId: org,
    prospectId: prs,
    channel: 'sms',
    purpose: 'agent_initiated',
    caller: 'voice',
  }
  test('the request names an Organization, a target, a channel, a purpose and the caller', () => {
    expect(contactCheckRequestSchema.safeParse(request).success).toBe(true)
    expect(
      contactCheckRequestSchema.safeParse({
        ...request,
        prospectId: undefined,
        email: 'a@b.co',
      }).success
    ).toBe(true)
    const { prospectId: _p, ...none } = request
    expect(contactCheckRequestSchema.safeParse(none).success).toBe(false)
    expect(contactCheckRequestSchema.safeParse({ ...request, purpose: 'cold' }).success).toBe(false)
    expect(contactCheckRequestSchema.safeParse({ ...request, force: true }).success).toBe(false)
    expect(
      contactCheckRequestSchema.safeParse({ ...request, email: 'a@b.co', phone: '+14155550100' })
        .success
    ).toBe(false)
  })
  test('a Prospect may come with one address of the channel kind', () => {
    const addresses = {
      phone: { phone: '+14155550100' },
      sms: { phone: '+14155550100' },
      whatsapp: { phone: '+14155550100' },
      email: { email: 'a@b.co' },
      linkedin: { linkedinUrl: 'https://www.linkedin.com/in/someone' },
    } as const
    for (const [channel, address] of Object.entries(addresses)) {
      expect(contactCheckRequestSchema.safeParse({ ...request, channel, ...address }).success).toBe(
        true
      )
    }
  })
  test('a Prospect with an address of the wrong kind for the channel is refused', () => {
    const wrong = [
      ['sms', { email: 'a@b.co' }],
      ['whatsapp', { linkedinUrl: 'https://www.linkedin.com/in/someone' }],
      ['phone', { email: 'a@b.co' }],
      ['email', { phone: '+14155550100' }],
      ['email', { linkedinUrl: 'https://www.linkedin.com/in/someone' }],
      ['linkedin', { phone: '+14155550100' }],
      ['linkedin', { email: 'a@b.co' }],
    ] as const
    for (const [channel, address] of wrong) {
      expect(contactCheckRequestSchema.safeParse({ ...request, channel, ...address }).success).toBe(
        false
      )
    }
  })
  test('a Prospect with two addresses, and a request with no target, are refused', () => {
    expect(
      contactCheckRequestSchema.safeParse({
        ...request,
        phone: '+14155550100',
        email: 'a@b.co',
      }).success
    ).toBe(false)
    const { prospectId: _p, ...none } = request
    expect(contactCheckRequestSchema.safeParse(none).success).toBe(false)
  })
  test('an address alone and a Prospect alone are still valid', () => {
    const { prospectId: _p, ...base } = request
    expect(contactCheckRequestSchema.safeParse({ ...base, phone: '+14155550100' }).success).toBe(
      true
    )
    expect(
      contactCheckRequestSchema.safeParse({ ...base, channel: 'email', phone: '+14155550100' })
        .success
    ).toBe(true)
    expect(contactCheckRequestSchema.safeParse(request).success).toBe(true)
  })
  test('a denial is a typed result with a code, an allowance has none', () => {
    expect(
      contactCheckResultSchema.safeParse({ allowed: true, checkId: chk, basis: 'consent_granted' })
        .success
    ).toBe(true)
    for (const code of CONTACT_DENIAL_CODES) {
      expect(
        contactCheckResultSchema.safeParse({
          allowed: false,
          checkId: code === 'consent.unavailable' ? null : chk,
          code,
          suppressionReason: code === 'consent.suppressed' ? 'stop' : null,
        }).success
      ).toBe(true)
    }
    expect(
      contactCheckResultSchema.safeParse({
        allowed: false,
        checkId: chk,
        code: 'consent.wording_locked',
      }).success
    ).toBe(false)
    expect(contactCheckResultSchema.safeParse({ allowed: false, checkId: chk }).success).toBe(false)
    expect(
      contactCheckResultSchema.safeParse({
        allowed: true,
        checkId: chk,
        basis: 'consent_granted',
        code: 'consent.missing',
      }).success
    ).toBe(false)
    expect(
      contactCheckResultSchema.safeParse({
        allowed: false,
        checkId: null,
        code: 'consent.missing',
        suppressionReason: null,
      }).success
    ).toBe(false)
    expect(
      contactCheckResultSchema.safeParse({
        allowed: false,
        checkId: chk,
        code: 'consent.missing',
        suppressionReason: 'stop',
      }).success
    ).toBe(false)
  })
  test('the denial codes are exactly the typed reasons, and none is an HTTP error of a route', () => {
    expect([...CONTACT_DENIAL_CODES]).toEqual([
      'consent.missing',
      'consent.withdrawn',
      'consent.suppressed',
      'consent.unavailable',
    ])
    for (const route of Object.values(CONSENT_ROUTES)) {
      for (const code of route.errors) {
        expect((CONTACT_DENIAL_CODES as readonly string[]).includes(code)).toBe(false)
      }
    }
  })
  test('the contact check route answers 200 only', () => {
    expect(CONSENT_ROUTES.contactCheck.success).toEqual([200])
    expect(CONSENT_ROUTES.contactCheck.access).toBe('internal')
  })
})

describe('errors', () => {
  test('the codes and statuses', () => {
    expect(CONSENT_ERRORS['consent.wording_locked'].status).toBe(409)
    expect(CONSENT_ERRORS['consent.invalid_token'].status).toBe(400)
    expect(CONSENT_ERRORS['consent.entry_not_removable'].status).toBe(409)
    expect(CONSENT_ERRORS['consent.not_found'].status).toBe(404)
    for (const code of ['missing', 'withdrawn', 'suppressed', 'unavailable']) {
      expect(`consent.${code}` in CONSENT_ERRORS).toBe(true)
    }
  })
})

describe('events', () => {
  const envelope = (type: string, data: unknown) => ({
    id: formatId('evt', hex(50)),
    type,
    version: 1,
    occurredAt: NOW,
    organizationId: org,
    region: 'us',
    data,
  })
  test('ids only, strict', () => {
    const granted = {
      consentEventId: cev,
      prospectId: prs,
      channel: 'sms',
      source: 'hosted_form',
      wordingId: cwd,
    }
    expect(consentGrantedEvent.safeParse(envelope('consent.granted', granted)).success).toBe(true)
    expect(
      consentGrantedEvent.safeParse(envelope('consent.granted', { ...granted, phone: '+1' }))
        .success
    ).toBe(false)
    const withdrawn = {
      consentEventId: cev,
      prospectId: prs,
      channel: 'sms',
      source: 'stop_reply',
      stopAll: false,
    }
    expect(consentWithdrawnEvent.safeParse(envelope('consent.withdrawn', withdrawn)).success).toBe(
      true
    )
    const added = { suppressionEntryId: sup, addressKind: 'phone', reason: 'stop', prospectId: prs }
    expect(suppressionAddedEvent.safeParse(envelope('suppression.added', added)).success).toBe(true)
    expect(
      suppressionAddedEvent.safeParse(envelope('suppression.added', { ...added, prospectId: null }))
        .success
    ).toBe(true)
    expect(
      suppressionAddedEvent.safeParse(
        envelope('suppression.added', { ...added, address: 'a@b.co' })
      ).success
    ).toBe(false)
    expect(
      suppressionRemovedEvent.safeParse(
        envelope('suppression.removed', { suppressionEntryId: sup, addressKind: 'email' })
      ).success
    ).toBe(true)
    expect(Object.keys(CONSENT_EVENTS)).toEqual([
      'consent.granted',
      'consent.withdrawn',
      'suppression.added',
      'suppression.removed',
    ])
  })
  test('a wrong type is refused', () => {
    expect(
      consentWithdrawnEvent.safeParse(
        envelope('consent.granted', {
          consentEventId: cev,
          prospectId: prs,
          channel: 'sms',
          source: 'stop_reply',
          stopAll: false,
        })
      ).success
    ).toBe(false)
  })
})

describe('routes', () => {
  const known = new Set<string>([
    ...Object.keys(CONSENT_ERRORS),
    ...Object.keys(PROSPECT_ERRORS),
    ...Object.keys(ERRORS),
  ])
  test('every code a route lists exists', () => {
    for (const route of Object.values(CONSENT_ROUTES)) {
      for (const code of [...route.errors, ...route.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
  })
  test('method and path pairs are unique, versioned and described', () => {
    const seen = new Set<string>()
    for (const route of Object.values(CONSENT_ROUTES)) {
      const key = `${route.method} ${route.path}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      expect(/^\/(internal\/)?v1\//.test(route.path)).toBe(true)
      expect(route.description.length).toBeGreaterThan(20)
    }
  })
  test('public routes take no role, sit under /v1/public and are rate limited', () => {
    const publicRoutes = Object.values(CONSENT_ROUTES).filter((r) => r.access === 'public')
    expect(publicRoutes.length).toBe(4)
    for (const route of publicRoutes) {
      expect(route.path.startsWith('/v1/public/')).toBe(true)
      expect(route.roles).toEqual([])
      expect(route.commonErrors).toContain('rate.limited')
      expect(route.path).toContain('{token}')
      expect(route.errors).toContain('consent.invalid_token')
      expect(route.description).toContain('never')
    }
  })
  test('internal routes take no role and sit under /internal/v1', () => {
    const internal = Object.values(CONSENT_ROUTES).filter((r) => r.access === 'internal')
    expect(internal.length).toBe(3)
    for (const route of internal) {
      expect(route.path.startsWith('/internal/v1/')).toBe(true)
      expect(route.roles).toEqual([])
    }
  })
  test('suppression, wording, form and evidence routes are Owner and Admin only', () => {
    for (const name of [
      'addSuppression',
      'listSuppressionEntries',
      'lookupSuppression',
      'removeSuppression',
      'uploadSuppressionImport',
      'createConsentWording',
      'updateConsentWording',
      'createConsentForm',
      'publishConsentForm',
      'getProspectConsentEvidence',
      'listContactChecks',
    ] as const) {
      expect(CONSENT_ROUTES[name].roles).toEqual(['owner', 'admin'])
    }
  })
  test('removing an entry lists entry_not_removable and editing a wording lists wording_locked', () => {
    expect(CONSENT_ROUTES.removeSuppression.errors).toContain('consent.entry_not_removable')
    expect(CONSENT_ROUTES.updateConsentWording.errors).toContain('consent.wording_locked')
  })
  test('routes with effects that can be retried take an Idempotency-Key', () => {
    for (const route of Object.values(CONSENT_ROUTES)) {
      if (route.idempotent) {
        expect(route.commonErrors).toContain('request.idempotency_key_reused')
      }
    }
    expect(CONSENT_ROUTES.submitHostedConsentForm.idempotent).toBe(true)
    expect(CONSENT_ROUTES.recordWithdrawal.idempotent).toBe(true)
  })
  test('lists say they are cursor-paginated with a maximum', () => {
    for (const [name, route] of Object.entries(CONSENT_ROUTES)) {
      if (name.startsWith('list')) {
        expect(route.description).toContain('cursor')
        expect(route.description).toContain('100')
      }
    }
  })
})

describe('no switch for the rules (ADR 0003)', () => {
  const FORBIDDEN = /disable|bypass|skip|override|ignore|waive|force|exempt/i
  function collectNames(node: unknown, names: Set<string>): void {
    if (Array.isArray(node)) {
      for (const item of node) {
        collectNames(item, names)
      }
      return
    }
    if (node !== null && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if (key === 'properties' && value !== null && typeof value === 'object') {
          for (const property of Object.keys(value)) {
            names.add(property)
          }
        }
        if (key === 'enum' && Array.isArray(value)) {
          for (const item of value) {
            if (typeof item === 'string') {
              names.add(item)
            }
          }
        }
        if (key === 'const' && typeof value === 'string') {
          names.add(value)
        }
        collectNames(value, names)
      }
    }
  }
  test('no consent schema has a field, flag or value that disables Contact Consent or the disclosure', () => {
    const schemas: Record<string, z.ZodType> = {
      consentEventSchema,
      evidenceEventSchema,
      prospectConsentSchema,
      recordConsentRequestSchema,
      withdrawConsentRequestSchema,
      consentWordingSchema,
      createConsentWordingRequestSchema,
      updateConsentWordingRequestSchema,
      consentFormSchema,
      createConsentFormRequestSchema,
      hostedConsentSubmissionSchema,
      suppressionEntrySchema,
      addSuppressionRequestSchema,
      removeSuppressionRequestSchema,
      suppressionImportSchema,
      contactCheckRequestSchema,
      contactCheckResultSchema,
      recordWithdrawalRequestSchema,
      recordDeliveryFailureRequestSchema,
      oneClickUnsubscribeRequestSchema,
    }
    for (const [name, schema] of Object.entries(schemas)) {
      const names = new Set<string>()
      collectNames(z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }), names)
      expect(names.size).toBeGreaterThan(0)
      for (const item of names) {
        expect(`${name}.${item}`).not.toMatch(FORBIDDEN)
      }
    }
  })
  test('the route names and the error codes carry none either', () => {
    for (const name of Object.keys(CONSENT_ROUTES)) {
      expect(name).not.toMatch(FORBIDDEN)
    }
    for (const code of Object.keys(CONSENT_ERRORS)) {
      expect(code).not.toMatch(FORBIDDEN)
    }
  })
})
