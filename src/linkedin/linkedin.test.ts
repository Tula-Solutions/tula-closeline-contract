import { describe, expect, test } from 'bun:test'
import { id, NOW } from '../core/fixtures'
import { ERRORS } from '../errors'
import { MAX_PAGE_SIZE } from '../pagination'
import {
  acceptLinkedinRiskRequestSchema,
  LINKEDIN_DAILY_CONNECTION_CEILING,
  LINKEDIN_DAILY_MESSAGE_CEILING,
  LINKEDIN_ERRORS,
  LINKEDIN_EVENTS,
  LINKEDIN_LIMIT_ISSUE_MESSAGE,
  LINKEDIN_RISK_WORDING,
  LINKEDIN_RISK_WORDING_VERSION,
  LINKEDIN_ROUTES,
  LINKEDIN_SEND_GUARD_ORDER,
  LINKEDIN_WEEKLY_CONNECTION_CEILING,
  linkedinAccountPageSchema,
  linkedinAccountSchema,
  linkedinChannelDisabledEvent,
  linkedinInvitationAcceptedEvent,
  linkedinLimitsSchema,
  linkedinSettingsSchema,
  linkedinUsagePageSchema,
  startLinkedinConnectionResponseSchema,
  updateLinkedinSettingsRequestSchema,
} from './index'

const limits = { dailyConnections: 20, dailyMessages: 40, weeklyConnections: 80 }
const account = {
  id: id('lia'),
  membershipId: id('mem'),
  status: 'connected',
  pauseReason: null,
  limits,
  connectedAt: NOW,
  updatedAt: NOW,
}
const envelope = (type: string, data: unknown) => ({
  id: id('evt'),
  type,
  version: 1,
  occurredAt: NOW,
  organizationId: id('org'),
  region: 'us',
  data,
})

describe('errors', () => {
  test('the six codes exist with a status and message', () => {
    expect(LINKEDIN_ERRORS['linkedin.channel_disabled'].status).toBe(409)
    expect(LINKEDIN_ERRORS['linkedin.risk_not_accepted'].status).toBe(409)
    expect(LINKEDIN_ERRORS['linkedin.account_not_connected'].status).toBe(409)
    expect(LINKEDIN_ERRORS['linkedin.limit_reached'].status).toBe(429)
    expect(LINKEDIN_ERRORS['linkedin.not_account_owner'].status).toBe(403)
    expect(LINKEDIN_ERRORS['linkedin.limit_above_ceiling'].status).toBe(422)
    expect(Object.keys(LINKEDIN_ERRORS)).toHaveLength(6)
    for (const e of Object.values(LINKEDIN_ERRORS)) {
      expect(e.message.length).toBeGreaterThan(0)
    }
  })
})

describe('limits', () => {
  test('ceilings are 20, 40 and 80', () => {
    expect(LINKEDIN_DAILY_CONNECTION_CEILING).toBe(20)
    expect(LINKEDIN_DAILY_MESSAGE_CEILING).toBe(40)
    expect(LINKEDIN_WEEKLY_CONNECTION_CEILING).toBe(80)
  })

  test('accepts the ceiling and zero', () => {
    expect(linkedinLimitsSchema.safeParse(limits).success).toBe(true)
    expect(
      linkedinLimitsSchema.safeParse({
        dailyConnections: 0,
        dailyMessages: 0,
        weeklyConnections: 0,
      }).success
    ).toBe(true)
  })

  test.each([
    ['dailyConnections', 21],
    ['dailyMessages', 41],
    ['weeklyConnections', 81],
  ])('rejects %s above its ceiling with the issue message', (field, value) => {
    const result = linkedinLimitsSchema.safeParse({ ...limits, [field]: value })
    expect(result.success).toBe(false)
    const issue = result.error?.issues[0]
    expect(issue?.message).toBe(LINKEDIN_LIMIT_ISSUE_MESSAGE)
    expect(issue?.path).toEqual([field])
    expect(`${issue?.message}` in LINKEDIN_ERRORS).toBe(true)
  })

  test('rejects negative and fractional limits', () => {
    expect(linkedinLimitsSchema.safeParse({ ...limits, dailyMessages: -1 }).success).toBe(false)
    expect(linkedinLimitsSchema.safeParse({ ...limits, dailyMessages: 1.5 }).success).toBe(false)
  })
})

describe('risk acceptance', () => {
  test('the wording version and text are set', () => {
    expect(LINKEDIN_RISK_WORDING_VERSION.length).toBeGreaterThan(0)
    expect(LINKEDIN_RISK_WORDING.length).toBeGreaterThan(0)
  })

  test('accepts the current version and a trimmed name', () => {
    const result = acceptLinkedinRiskRequestSchema.safeParse({
      wordingVersion: LINKEDIN_RISK_WORDING_VERSION,
      typedFullName: '  Ada Lovelace  ',
    })
    expect(result.success).toBe(true)
    expect(result.data?.typedFullName).toBe('Ada Lovelace')
  })

  test('rejects another version, a short name and control characters', () => {
    const ok = { wordingVersion: LINKEDIN_RISK_WORDING_VERSION, typedFullName: 'Ada Lovelace' }
    expect(
      acceptLinkedinRiskRequestSchema.safeParse({ ...ok, wordingVersion: 'old' }).success
    ).toBe(false)
    expect(acceptLinkedinRiskRequestSchema.safeParse({ ...ok, typedFullName: 'A' }).success).toBe(
      false
    )
    expect(
      acceptLinkedinRiskRequestSchema.safeParse({ ...ok, typedFullName: 'Ada\u0000 L' }).success
    ).toBe(false)
  })
})

describe('schemas', () => {
  test('the settings every role reads carry no acceptance details', () => {
    const keys = Object.keys(linkedinSettingsSchema.shape)
    expect(keys).not.toContain('activeAcceptance')
    expect(keys).not.toContain('typedFullName')
    expect(keys).not.toContain('acceptedByMembershipId')
  })

  test('the hosted login address is https only', () => {
    const base = { expiresAt: NOW }
    expect(
      startLinkedinConnectionResponseSchema.safeParse({
        ...base,
        hostedLoginUrl: 'http://a.test/x',
      }).success
    ).toBe(false)
    expect(
      startLinkedinConnectionResponseSchema.safeParse({
        ...base,
        hostedLoginUrl: 'https://a.test/x',
      }).success
    ).toBe(true)
  })

  test('an account parses and rejects a provider account reference', () => {
    expect(linkedinAccountSchema.safeParse(account).success).toBe(true)
    expect(
      linkedinAccountSchema.safeParse({ ...account, providerAccountRef: 'acct_1' }).success
    ).toBe(false)
  })

  test('the settings update takes the switch only', () => {
    expect(updateLinkedinSettingsRequestSchema.safeParse({ enabled: false }).success).toBe(true)
    expect(
      updateLinkedinSettingsRequestSchema.safeParse({ enabled: true, skipSuppression: true })
        .success
    ).toBe(false)
  })

  test('list pages cap at the maximum page size', () => {
    const items = Array.from({ length: MAX_PAGE_SIZE + 1 }, () => account)
    expect(linkedinAccountPageSchema.safeParse({ items, nextCursor: null }).success).toBe(false)
    expect(
      linkedinAccountPageSchema.safeParse({ items: items.slice(1), nextCursor: null }).success
    ).toBe(true)
    expect(linkedinUsagePageSchema.safeParse({ items: [], nextCursor: null }).success).toBe(true)
  })

  test('the send guard order is fixed and ends with quota', () => {
    expect(LINKEDIN_SEND_GUARD_ORDER).toEqual([
      'channel_enabled',
      'account_connected',
      'contact_consent',
      'suppression',
      'quota',
    ])
  })
})

describe('routes', () => {
  const routes = Object.values(LINKEDIN_ROUTES)

  test('start connection is Rep only and needs a key', () => {
    const route = LINKEDIN_ROUTES.startConnection
    expect(route.roles).toEqual(['rep'])
    expect(route.roles).not.toContain('admin')
    expect(route.keyRequired).toBe(true)
  })

  test('method and path pairs are unique', () => {
    const keys = routes.map((r) => `${r.method} ${r.path}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  test('every listed error code exists', () => {
    for (const route of routes) {
      for (const code of route.errors) {
        expect(code in LINKEDIN_ERRORS).toBe(true)
      }
      for (const code of route.commonErrors) {
        expect(code in ERRORS).toBe(true)
      }
    }
  })

  test('list routes describe pagination', () => {
    for (const name of ['listAccounts', 'listRiskAcceptances', 'listUsage'] as const) {
      expect(LINKEDIN_ROUTES[name].description).toContain('cursor-paginated')
    }
  })

  test('read routes say other Organizations get 404, not 403', () => {
    expect(LINKEDIN_ROUTES.getAccount.description).toContain('request.not_found (404), never 403')
    expect(LINKEDIN_ROUTES.listUsage.description).toContain('request.not_found (404), never 403')
  })
})

describe('events', () => {
  test('a valid envelope parses', () => {
    const data = {
      accountId: id('lia'),
      membershipId: id('mem'),
      prospectId: id('prs'),
      acceptedAt: NOW,
    }
    expect(
      linkedinInvitationAcceptedEvent.safeParse(envelope('linkedin.invitation_accepted', data))
        .success
    ).toBe(true)
    expect(
      linkedinChannelDisabledEvent.safeParse(
        envelope('linkedin.channel_disabled', { reason: 'wording_changed', byMembershipId: null })
      ).success
    ).toBe(true)
  })

  test('extra keys and unknown reasons are rejected', () => {
    expect(
      linkedinChannelDisabledEvent.safeParse(
        envelope('linkedin.channel_disabled', {
          reason: 'admin_switch',
          byMembershipId: id('mem'),
          text: 'hello',
        })
      ).success
    ).toBe(false)
    expect(
      linkedinChannelDisabledEvent.safeParse(
        envelope('linkedin.channel_disabled', { reason: 'other', byMembershipId: null })
      ).success
    ).toBe(false)
  })

  test('the map holds the three events', () => {
    expect(Object.keys(LINKEDIN_EVENTS).sort()).toEqual([
      'linkedin.account_paused',
      'linkedin.channel_disabled',
      'linkedin.invitation_accepted',
    ])
  })
})
