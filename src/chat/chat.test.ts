import { describe, expect, test } from 'bun:test'
import { AGENT_ERRORS } from '../agent'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import { INQUIRY_ERRORS } from '../inquiry'
import {
  CHAT_ERRORS,
  CHAT_ROUTES,
  chatMessageSchema,
  chatSchema,
  listChatMessagesQuerySchema,
  listChatsQuerySchema,
  publicChatConsentReceiptSchema,
  publicChatConsentRequestSchema,
  publicChatConsentWordingSchema,
  publicChatHeadersSchema,
  publicChatMessageReplySchema,
  publicChatReplySchema,
  publicSendChatMessageRequestSchema,
  publicStartChatRequestSchema,
  publicStartChatResponseSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const cht = formatId('cht', hex(1))
const prs = formatId('prs', hex(2))
const inq = formatId('inq', hex(3))
const cwd = formatId('cwd', hex(4))
const NOW = '2026-01-01T00:00:00Z'
const LATER = '2026-01-01T01:00:00Z'
const KEY = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'
const TOKEN = 'Abcdefghijklmnopqrstuvwxyz012345_-'

describe('public Chat bodies', () => {
  test('starting a Chat needs the page address and takes a honeypot', () => {
    const body = { sourceUrl: 'https://acme.example/pricing' }
    const parsed = publicStartChatRequestSchema.safeParse(body)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.website).toBe('')
    }
    expect(publicStartChatRequestSchema.safeParse({}).success).toBe(false)
    expect(publicStartChatRequestSchema.safeParse({ ...body, website: 'http://x' }).success).toBe(
      true
    )
    expect(publicStartChatRequestSchema.safeParse({ ...body, prospectId: prs }).success).toBe(false)
  })
  test('a visitor message is bounded text', () => {
    expect(publicSendChatMessageRequestSchema.safeParse({ text: 'Hi' }).success).toBe(true)
    expect(publicSendChatMessageRequestSchema.safeParse({ text: '' }).success).toBe(false)
    expect(publicSendChatMessageRequestSchema.safeParse({ text: 'x'.repeat(5000) }).success).toBe(
      false
    )
  })
  test('headers need the origin; a change needs the Idempotency-Key', () => {
    expect(publicChatHeadersSchema.safeParse({ origin: 'https://acme.example' }).success).toBe(
      false
    )
    expect(
      publicChatHeadersSchema.safeParse({ origin: 'https://acme.example', 'idempotency-key': KEY })
        .success
    ).toBe(true)
  })
  test('callback consent carries the wording id, version and source URL', () => {
    const body = {
      name: 'Ada Lovelace',
      phone: '+14155550123',
      consentWordingId: cwd,
      consentWordingVersion: 3,
      callbackConsent: true,
      sourceUrl: 'https://acme.example/c',
    }
    expect(publicChatConsentRequestSchema.safeParse(body).success).toBe(true)
    const { consentWordingVersion: _v, ...noVersion } = body
    const { sourceUrl: _s, ...noUrl } = body
    expect(publicChatConsentRequestSchema.safeParse(noVersion).success).toBe(false)
    expect(publicChatConsentRequestSchema.safeParse(noUrl).success).toBe(false)
  })
})

describe('what a visitor sees', () => {
  test('starting answers a secret token, the AI notice and an expiry; no ids', () => {
    const body = {
      sessionToken: TOKEN,
      expiresAt: LATER,
      messages: [{ index: 0, role: 'agent', text: 'Hi, I am an AI assistant for Acme.', at: NOW }],
    }
    expect(publicStartChatResponseSchema.safeParse(body).success).toBe(true)
    expect(publicStartChatResponseSchema.safeParse({ ...body, chatId: cht }).success).toBe(false)
  })
  test('a reply has text, deferral and the handoff offer, and no sources, Rep or internal id', () => {
    const reply = { text: 'We charge per seat.', deferred: false, handoffOffered: false, at: NOW }
    expect(publicChatReplySchema.safeParse(reply).success).toBe(true)
    for (const extra of [
      { sources: [] },
      { repMembershipId: formatId('mem', hex(9)) },
      { toolCall: { name: 'book' } },
    ]) {
      expect(publicChatReplySchema.safeParse({ ...reply, ...extra }).success).toBe(false)
    }
    expect(publicChatMessageReplySchema.safeParse({ reply }).success).toBe(true)
  })
})

describe('admin Chat views', () => {
  const chat = {
    id: cht,
    prospectId: prs,
    inquiryId: inq,
    state: 'open',
    sourceUrl: 'https://acme.example/pricing',
    startedAt: NOW,
    lastMessageAt: NOW,
    closedAt: null,
  }
  test('a Chat parses; lists are bounded', () => {
    expect(chatSchema.safeParse(chat).success).toBe(true)
    expect(listChatsQuerySchema.safeParse({ limit: 101 }).success).toBe(false)
    expect(listChatMessagesQuerySchema.safeParse({ limit: 101 }).success).toBe(false)
    expect(listChatMessagesQuerySchema.safeParse({ limit: 100 }).success).toBe(true)
  })
  test('a message to staff may carry its sources', () => {
    expect(
      chatMessageSchema.safeParse({
        index: 1,
        role: 'agent',
        text: 'We charge per seat.',
        sources: [],
        deferred: false,
        at: NOW,
      }).success
    ).toBe(true)
  })
})

describe('the callback receipt and the honeypot', () => {
  test('the receipt has a time only, no id and no verdict on the number', () => {
    expect(
      publicChatConsentReceiptSchema.safeParse({ received: true, receivedAt: NOW }).success
    ).toBe(true)
    expect(
      publicChatConsentReceiptSchema.safeParse({ received: true, receivedAt: NOW, inquiryId: inq })
        .success
    ).toBe(false)
    expect(
      publicChatConsentReceiptSchema.safeParse({
        received: true,
        receivedAt: NOW,
        callbackExpected: true,
      }).success
    ).toBe(false)
  })
  test('the route says what a honeypot hit gets', () => {
    expect(CHAT_ROUTES.publicStartChat.description).toContain('unusable session token')
  })
})

describe('errors', () => {
  test('codes exist and none collides', () => {
    expect(Object.keys(CHAT_ERRORS)).toEqual(
      expect.arrayContaining(['chat.origin_not_allowed', 'chat.session_not_found'])
    )
    for (const code of Object.keys(CHAT_ERRORS)) {
      for (const other of [ERRORS, AGENT_ERRORS, INQUIRY_ERRORS]) {
        expect(code in other).toBe(false)
      }
    }
  })
})

describe('routes', () => {
  const routes = Object.entries(CHAT_ROUTES)
  test('every code a route lists exists', () => {
    const known = new Set([
      ...Object.keys(CHAT_ERRORS),
      ...Object.keys(AGENT_ERRORS),
      ...Object.keys(ERRORS),
    ])
    for (const [, r] of routes) {
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
  })
  test('method and path are unique and versioned; roles or public', () => {
    const seen = new Set<string>()
    for (const [, r] of routes) {
      const key = `${r.method} ${r.path}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      expect(r.path.startsWith('/v1/')).toBe(true)
      expect(r.description.length).toBeGreaterThan(40)
      expect(r.roles.length > 0 || r.public === true).toBe(true)
    }
  })
  test('every public route: no token, no auth errors, redacted secret, Retry-After', () => {
    const pub = routes.filter(([, r]) => r.public)
    expect(pub.length).toBeGreaterThan(0)
    for (const [, r] of pub) {
      expect(r.roles).toEqual([])
      expect(r.commonErrors.some((c) => c.startsWith('auth.'))).toBe(false)
      expect(r.description).toContain('no token')
      expect(r.description).toContain('redact')
      expect(r.description).toContain('Retry-After')
    }
  })
  test('public routes that change something require the Idempotency-Key', () => {
    for (const [name, r] of routes) {
      if (r.public && r.method !== 'GET') {
        expect(r.keyRequired).toBe(true)
        expect(r.description).toContain('Idempotency-Key')
        expect(name.startsWith('public')).toBe(true)
      }
    }
  })
  test('starting a Chat has a honeypot; the handoff can fail with no Rep', () => {
    expect(CHAT_ROUTES.publicStartChat.description).toContain('honeypot')
    expect(CHAT_ROUTES.publicRequestChatHandoff.errors).toContain('handoff.no_rep_available')
  })
  test('lists describe the cursor and the maximum page size', () => {
    for (const name of ['listChats', 'listChatMessages', 'publicListChatMessages'] as const) {
      expect(CHAT_ROUTES[name].description).toContain('cursor')
      expect(CHAT_ROUTES[name].description).toContain('100')
    }
  })
  test('the glossary words are used: Chat, not live chat or chatbot', () => {
    for (const [, r] of routes) {
      expect(r.description).not.toMatch(/live chat|chatbot|conversation/i)
    }
  })
})

test('the area is exported from the entry point', async () => {
  const api = await import('../index')
  expect(api.CHAT_ROUTES).toBe(CHAT_ROUTES)
})

describe('the current consent wording', () => {
  test('has the wording id and version only', () => {
    const wording = {
      consentWordingId: formatId('cwd', crypto.randomUUID()),
      consentWordingVersion: 2,
    }
    expect(publicChatConsentWordingSchema.safeParse(wording).success).toBe(true)
    expect(publicChatConsentWordingSchema.safeParse({ ...wording, text: 'x' }).success).toBe(false)
    expect(
      publicChatConsentWordingSchema.safeParse({ ...wording, consentWordingVersion: 0 }).success
    ).toBe(false)
  })
})
