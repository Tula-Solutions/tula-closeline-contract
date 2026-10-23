import { describe, expect, test } from 'bun:test'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import { MAX_PAGE_SIZE } from '../pagination'
import { sourceKindSchema } from '../prospect/values'
import {
  CRM_DEFAULT_DIRECTION,
  CRM_ERRORS,
  CRM_EVENTS,
  CRM_FIELD_KEYS,
  CRM_ROUTES,
  CRM_WEBHOOK_WINDOW_SECONDS,
  crmAuthorisationRequestSchema,
  crmCallbackQuerySchema,
  crmConnectedEvent,
  crmConnectionSchema,
  crmConnectionStatusSchema,
  crmDisconnectedEvent,
  crmFieldDirectionsSchema,
  crmListRunsQuerySchema,
  crmProviderSchema,
  crmRunCompletedEvent,
  crmSetFieldDirectionsRequestSchema,
  crmSetStageMappingRequestSchema,
  crmSourceKind,
  crmStageMappingSchema,
  crmStartRunRequestSchema,
  crmSyncRunSchema,
  crmWebhookNoticeSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const id = (prefix: string, n: number) => formatId(prefix as never, hex(n))
const NOW = '2026-10-23T10:00:00.000Z'

const connection = {
  id: id('crn', 1),
  provider: 'hubspot',
  state: 'connected',
  accountLabel: 'Acme HubSpot',
  scopeLevel: 'read',
  connectedByMembershipId: id('mem', 1),
  connectedAt: NOW,
  lastSyncedAt: null,
  needsReconnectSince: null,
}

const run = {
  id: id('crun', 1),
  connectionId: id('crn', 1),
  provider: 'hubspot',
  objectKind: 'deal',
  trigger: 'manual',
  state: 'completed',
  requestedAt: NOW,
  requestedByMembershipId: id('mem', 1),
  startedAt: NOW,
  completedAt: NOW,
  counts: { created: 2, updated: 1, skipped: 1, failed: 1, unlinked: 0 },
  skipped: [{ reason: 'manual_value_kept', count: 1 }],
  skippedFields: [{ field: 'contact.email', count: 1 }],
  failures: [{ objectRef: '12345', reason: 'invalid_record' }],
  failuresTruncated: false,
  errorCode: null,
  retryOfRunId: null,
}

describe('providers and connection', () => {
  test('a provider has the Source kind ADR 0020 names', () => {
    expect(crmSourceKind('hubspot')).toBe('crm:hubspot')
    expect(sourceKindSchema.safeParse(crmSourceKind('salesforce')).success).toBe(true)
  })
  test('providers are a closed list', () => {
    expect(crmProviderSchema.safeParse('hubspot').success).toBe(true)
    expect(crmProviderSchema.safeParse('pipedrive').success).toBe(false)
  })
  test('a connection read carries no token or secret, whatever the service passes', () => {
    const parsed = crmConnectionSchema.parse({
      ...connection,
      accessToken: 'x',
      refreshToken: 'y',
      clientSecret: 'z',
    })
    expect(JSON.stringify(parsed)).not.toMatch(/token|secret/i)
    expect(Object.keys(crmConnectionSchema.shape).join()).not.toMatch(/token|secret/i)
  })
  test('needsReconnectSince is set exactly when the state is needs_reconnect', () => {
    expect(crmConnectionSchema.safeParse({ ...connection, needsReconnectSince: NOW }).success).toBe(
      false
    )
    expect(crmConnectionSchema.safeParse({ ...connection, state: 'needs_reconnect' }).success).toBe(
      false
    )
    expect(
      crmConnectionSchema.safeParse({
        ...connection,
        state: 'needs_reconnect',
        needsReconnectSince: NOW,
      }).success
    ).toBe(true)
  })
  test('status is not_connected with no connection, otherwise it matches the connection', () => {
    expect(
      crmConnectionStatusSchema.safeParse({
        provider: 'hubspot',
        state: 'not_connected',
        connection: null,
      }).success
    ).toBe(true)
    expect(
      crmConnectionStatusSchema.safeParse({
        provider: 'hubspot',
        state: 'connected',
        connection: null,
      }).success
    ).toBe(false)
    expect(
      crmConnectionStatusSchema.safeParse({
        provider: 'hubspot',
        state: 'not_connected',
        connection,
      }).success
    ).toBe(false)
    expect(
      crmConnectionStatusSchema.safeParse({
        provider: 'salesforce',
        state: 'connected',
        connection,
      }).success
    ).toBe(false)
    expect(
      crmConnectionStatusSchema.safeParse({ provider: 'hubspot', state: 'connected', connection })
        .success
    ).toBe(true)
  })
  test('an authorisation request defaults to read scopes and refuses unknown fields', () => {
    expect(crmAuthorisationRequestSchema.parse({}).writeBack).toBe(false)
    expect(
      crmAuthorisationRequestSchema.safeParse({ redirectUri: 'https://x.example' }).success
    ).toBe(false)
  })
  test('the callback query is bounded and needs a state', () => {
    expect(crmCallbackQuerySchema.safeParse({ code: 'abc', state: 's' }).success).toBe(true)
    expect(crmCallbackQuerySchema.safeParse({ code: 'abc' }).success).toBe(false)
    expect(crmCallbackQuerySchema.safeParse({ code: 'a'.repeat(5000), state: 's' }).success).toBe(
      false
    )
    expect(crmCallbackQuerySchema.safeParse({ error: 'access_denied', state: 's' }).success).toBe(
      true
    )
  })
})

describe('field directions', () => {
  test('every field defaults to read only and the default is exported', () => {
    expect(CRM_DEFAULT_DIRECTION).toBe('read_only')
    const parsed = crmFieldDirectionsSchema.parse({ entries: [] })
    expect(parsed.entries.length).toBe(CRM_FIELD_KEYS.length)
    expect(parsed.entries.every((e) => e.direction === 'read_only')).toBe(true)
  })
  test('a set request lists each field once, from the closed list', () => {
    const ok = { entries: [{ field: 'deal.outcome', direction: 'both' }] }
    expect(crmSetFieldDirectionsRequestSchema.safeParse(ok).success).toBe(true)
    expect(
      crmSetFieldDirectionsRequestSchema.safeParse({
        entries: [ok.entries[0], ok.entries[0]],
      }).success
    ).toBe(false)
    expect(
      crmSetFieldDirectionsRequestSchema.safeParse({
        entries: [{ field: 'contact.password', direction: 'both' }],
      }).success
    ).toBe(false)
    expect(
      crmSetFieldDirectionsRequestSchema.safeParse({
        entries: [{ field: 'deal.outcome', direction: 'sometimes' }],
      }).success
    ).toBe(false)
    expect(crmSetFieldDirectionsRequestSchema.safeParse({ ...ok, extra: 1 }).success).toBe(false)
  })
  test('activity notes only go to the CRM or stay off, they are never read back', () => {
    const note = (direction: string) => ({ entries: [{ field: 'activity.notes', direction }] })
    expect(crmSetFieldDirectionsRequestSchema.safeParse(note('write_only')).success).toBe(true)
    expect(crmSetFieldDirectionsRequestSchema.safeParse(note('read_only')).success).toBe(true)
    expect(crmSetFieldDirectionsRequestSchema.safeParse(note('both')).success).toBe(false)
  })
})

describe('stage mapping', () => {
  const entry = { stageId: 'closedwon', label: 'Closed won', outcome: 'won' }
  test('a mapping needs at least one stage, bounded, each stage once', () => {
    expect(crmSetStageMappingRequestSchema.safeParse({ entries: [entry] }).success).toBe(true)
    expect(crmSetStageMappingRequestSchema.safeParse({ entries: [] }).success).toBe(false)
    expect(crmSetStageMappingRequestSchema.safeParse({ entries: [entry, entry] }).success).toBe(
      false
    )
    expect(
      crmSetStageMappingRequestSchema.safeParse({
        entries: Array.from({ length: 501 }, (_, i) => ({ ...entry, stageId: `s${i}` })),
      }).success
    ).toBe(false)
    expect(
      crmSetStageMappingRequestSchema.safeParse({ entries: [{ ...entry, outcome: 'maybe' }] })
        .success
    ).toBe(false)
  })
  test('the read shape says whether an Admin confirmed it', () => {
    const base = {
      provider: 'hubspot',
      entries: [entry],
      confirmed: true,
      confirmedByMembershipId: id('mem', 1),
      confirmedAt: NOW,
    }
    expect(crmStageMappingSchema.safeParse(base).success).toBe(true)
    expect(
      crmStageMappingSchema.safeParse({
        provider: 'hubspot',
        entries: [],
        confirmed: false,
        confirmedByMembershipId: null,
        confirmedAt: null,
      }).success
    ).toBe(true)
    expect(crmStageMappingSchema.safeParse({ ...base, confirmedAt: null }).success).toBe(false)
  })
})

describe('sync run', () => {
  test('parses a report and drops unknown fields', () => {
    expect(crmSyncRunSchema.safeParse(run).success).toBe(true)
    expect('cursor' in crmSyncRunSchema.parse({ ...run, cursor: 'opaque' })).toBe(false)
  })
  test('skipped and failed reasons come from closed lists, never free text', () => {
    expect(
      crmSyncRunSchema.safeParse({ ...run, skipped: [{ reason: 'because', count: 1 }] }).success
    ).toBe(false)
    expect(
      crmSyncRunSchema.safeParse({
        ...run,
        failures: [{ objectRef: '1', reason: 'HTTP 500 body {...}' }],
      }).success
    ).toBe(false)
    expect(
      crmSyncRunSchema.safeParse({
        ...run,
        skipped: [{ reason: 'no_recording_or_transcript', count: 4 }],
      }).success
    ).toBe(true)
  })
  test('lists are bounded', () => {
    const many = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ objectRef: `${i}`, reason: 'invalid_record' }))
    expect(crmSyncRunSchema.safeParse({ ...run, failures: many(50) }).success).toBe(true)
    expect(crmSyncRunSchema.safeParse({ ...run, failures: many(51) }).success).toBe(false)
    expect(
      crmSyncRunSchema.safeParse({
        ...run,
        failures: [{ objectRef: 'x'.repeat(200), reason: 'invalid_record' }],
      }).success
    ).toBe(false)
  })
  test('an error code is one of the crm codes, and only a failed run has one', () => {
    expect(
      crmSyncRunSchema.safeParse({ ...run, state: 'failed', errorCode: 'crm.needs_reconnect' })
        .success
    ).toBe(true)
    expect(
      crmSyncRunSchema.safeParse({ ...run, state: 'failed', errorCode: 'auth.forbidden' }).success
    ).toBe(false)
    expect(crmSyncRunSchema.safeParse({ ...run, errorCode: 'crm.rate_limited' }).success).toBe(
      false
    )
  })
  test('a start request names an object kind and refuses unknown fields', () => {
    expect(crmStartRunRequestSchema.safeParse({ objectKind: 'deal' }).success).toBe(true)
    expect(crmStartRunRequestSchema.safeParse({ objectKind: 'recording' }).success).toBe(false)
    expect(crmStartRunRequestSchema.safeParse({ objectKind: 'deal', cursor: 'x' }).success).toBe(
      false
    )
  })
  test('the run list page size is at most 100', () => {
    expect(crmListRunsQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
    expect(crmListRunsQuerySchema.safeParse({ limit: '100', state: 'failed' }).success).toBe(true)
  })
})

describe('webhook', () => {
  test('a notice names an object and nothing else, and drops payload data', () => {
    const notice = {
      provider: 'hubspot',
      externalAccountId: '12345',
      objectKind: 'deal',
      objectId: '987',
      eventId: 'evt-1',
      occurredAt: NOW,
    }
    expect(crmWebhookNoticeSchema.safeParse(notice).success).toBe(true)
    expect('properties' in crmWebhookNoticeSchema.parse({ ...notice, properties: { a: 1 } })).toBe(
      false
    )
    expect(crmWebhookNoticeSchema.safeParse({ ...notice, objectId: '' }).success).toBe(false)
  })
  test('the replay window is bounded', () => {
    expect(CRM_WEBHOOK_WINDOW_SECONDS).toBeGreaterThan(0)
    expect(CRM_WEBHOOK_WINDOW_SECONDS).toBeLessThanOrEqual(900)
  })
})

describe('events', () => {
  const envelope = (type: string, data: unknown) => ({
    id: id('evt', 50),
    type,
    version: 1,
    occurredAt: NOW,
    organizationId: id('org', 1),
    region: 'us',
    data,
  })
  test('three events, version 1, ids and closed words only', () => {
    expect(Object.keys(CRM_EVENTS).sort()).toEqual([
      'crm.connected',
      'crm.disconnected',
      'crm.run_completed',
    ])
    const connected = {
      connectionId: id('crn', 1),
      provider: 'hubspot',
      connectedByMembershipId: id('mem', 1),
      connectedAt: NOW,
    }
    const disconnected = {
      connectionId: id('crn', 1),
      provider: 'hubspot',
      disconnectedByMembershipId: id('mem', 1),
      disconnectedAt: NOW,
    }
    const completed = {
      runId: id('crun', 1),
      connectionId: id('crn', 1),
      provider: 'hubspot',
      objectKind: 'deal',
      state: 'completed',
      completedAt: NOW,
    }
    expect(crmConnectedEvent.safeParse(envelope('crm.connected', connected)).success).toBe(true)
    expect(crmDisconnectedEvent.safeParse(envelope('crm.disconnected', disconnected)).success).toBe(
      true
    )
    expect(crmRunCompletedEvent.safeParse(envelope('crm.run_completed', completed)).success).toBe(
      true
    )
    expect(
      crmRunCompletedEvent.safeParse(
        envelope('crm.run_completed', { ...completed, state: 'running' })
      ).success
    ).toBe(false)
    expect(
      crmRunCompletedEvent.safeParse(envelope('crm.run_completed', { ...completed, counts: {} }))
        .success
    ).toBe(false)
    expect(
      crmConnectedEvent.safeParse(
        envelope('crm.connected', { ...connected, accessToken: 'secret' })
      ).success
    ).toBe(false)
    expect(crmConnectedEvent.version).toBe(1)
  })
})

describe('errors and routes', () => {
  const routes = Object.entries(CRM_ROUTES)
  test('exactly the six ADR 0022 codes, area.reason, with a status each', () => {
    expect(Object.keys(CRM_ERRORS).sort()).toEqual([
      'crm.authorisation_failed',
      'crm.mapping_incomplete',
      'crm.needs_reconnect',
      'crm.not_connected',
      'crm.rate_limited',
      'crm.rights_not_confirmed',
    ])
    const common = new Set<string>(Object.values(ERRORS).map((e) => e.code))
    for (const entry of Object.values(CRM_ERRORS)) {
      expect(common.has(entry.code)).toBe(false)
    }
    expect(CRM_ERRORS['crm.rate_limited'].status).toBe(429)
    expect(CRM_ERRORS['crm.not_connected'].status).toBe(404)
  })
  test('routes use known codes, every crm code is used, mutations are keyed', () => {
    const known = new Set<string>(
      [...Object.values(CRM_ERRORS), ...Object.values(ERRORS)].map((e) => e.code)
    )
    for (const [name, r] of routes) {
      expect(r.path.startsWith('/v1/')).toBe(true)
      expect(r.description.length).toBeGreaterThan(40)
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
      const mutates = r.method !== 'GET' && !r.public && name !== 'previewCrmSync'
      if (mutates) {
        expect(r.keyRequired).toBe(true)
        expect(r.idempotent).toBe(true)
        expect(r.description).toContain('Idempotency-Key')
      }
    }
    const used = new Set(routes.flatMap(([, r]) => r.errors as string[]))
    for (const entry of Object.values(CRM_ERRORS)) {
      expect(used.has(entry.code)).toBe(true)
    }
  })
  test('settings are Owner and Admin, status is readable by a Manager, no Rep', () => {
    for (const name of [
      'startCrmAuthorisation',
      'disconnectCrm',
      'setCrmFieldDirections',
      'setCrmStageMapping',
      'startCrmSync',
      'retryCrmSyncRun',
    ] as const) {
      expect(CRM_ROUTES[name].roles).toEqual(['owner', 'admin'])
    }
    expect(CRM_ROUTES.getCrmConnection.roles).toEqual(['owner', 'admin', 'manager'])
    expect(CRM_ROUTES.listCrmSyncRuns.roles).toEqual(['owner', 'admin', 'manager'])
    for (const [, r] of routes) {
      expect(r.roles as readonly string[]).not.toContain('rep')
    }
  })
  test('lists name their cursor and maximum page', () => {
    for (const name of ['listCrmConnections', 'listCrmStages', 'listCrmSyncRuns'] as const) {
      expect(CRM_ROUTES[name].description).toContain('cursor')
      expect(CRM_ROUTES[name].description).toContain(String(MAX_PAGE_SIZE))
    }
  })
  test('the callback and the webhook are public, the webhook is signed and fast', () => {
    expect(CRM_ROUTES.crmOAuthCallback.public).toBe(true)
    expect(CRM_ROUTES.crmOAuthCallback.roles).toEqual([])
    expect(CRM_ROUTES.crmOAuthCallback.success).toEqual([302])
    expect(CRM_ROUTES.crmWebhook.public).toBe(true)
    expect(CRM_ROUTES.crmWebhook.description).toContain('signature')
    expect(CRM_ROUTES.crmWebhook.description).toContain('constant time')
    expect(CRM_ROUTES.crmWebhook.errors).not.toContain('crm.not_connected')
  })
  test('no description invites a token in a response', () => {
    expect(CRM_ROUTES.getCrmConnection.description).toContain('No token')
    expect(CRM_ROUTES.disconnectCrm.description).toContain('deleted')
  })
})
