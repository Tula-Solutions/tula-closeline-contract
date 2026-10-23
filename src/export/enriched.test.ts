import { describe, expect, test } from 'bun:test'
import { formatId } from '../ids'
import { PROSPECT_COMPANY_FIELD_NAMES, PROSPECT_FIELD_NAMES } from '../prospect/values'
import {
  createExportRequestSchema,
  ENRICHED_EXPORT_COLUMNS,
  ENRICHED_EXPORT_FORMATS,
  EXPORT_EVENTS,
  EXPORT_KINDS,
  EXPORT_ROUTES,
  enrichedProspectsFilterSchema,
  exportEnrichedProspectsRequestedEvent,
  exportJobSchema,
  exportKindSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const id = (prefix: string, n: number) => formatId(prefix as never, hex(n))
const NOW = '2026-10-22T10:00:00.000Z'

const baseJob = {
  id: id('exp', 1),
  state: 'running',
  requestedByMembershipId: id('mem', 1),
  includeRecordingLinks: false,
  parts: [{ service: 'core', state: 'pending', fileCount: null, bytes: null, readyAt: null }],
  failureReason: null,
  requestedAt: NOW,
  completedAt: null,
  expiresAt: null,
}
const orgJob = { ...baseJob, kind: 'organization', format: null, filter: null }
const enrichedJob = {
  ...baseJob,
  kind: 'enriched_prospects',
  format: 'csv',
  filter: { status: 'active' },
}

describe('export kinds', () => {
  test('two kinds, one format (csv)', () => {
    expect([...EXPORT_KINDS]).toEqual(['organization', 'enriched_prospects'])
    expect([...ENRICHED_EXPORT_FORMATS]).toEqual(['csv'])
    expect(exportKindSchema.safeParse('everything').success).toBe(false)
  })
})

describe('create request', () => {
  test('an old body still means the whole-Organization export', () => {
    const parsed = createExportRequestSchema.parse({ includeRecordingLinks: true })
    expect(parsed.kind).toBe('organization')
    expect(createExportRequestSchema.parse({}).kind).toBe('organization')
  })
  test('an enriched export defaults to csv and no filter', () => {
    const parsed = createExportRequestSchema.parse({ kind: 'enriched_prospects' })
    expect(parsed.format).toBe('csv')
    expect(parsed.filter).toBeUndefined()
  })
  test.each([
    ['a format on an Organization export', { format: 'csv' }],
    ['a filter on an Organization export', { filter: { status: 'active' } }],
    [
      'recording links on an enriched export',
      { kind: 'enriched_prospects', includeRecordingLinks: true },
    ],
    ['an unknown format', { kind: 'enriched_prospects', format: 'xlsx' }],
    ['an unknown kind', { kind: 'recordings' }],
    ['an unknown field', { kind: 'enriched_prospects', cursor: 'abc' }],
    ['an unknown filter field', { kind: 'enriched_prospects', filter: { q: 'a'.repeat(5000) } }],
  ])('refuses %s', (_name, body) => {
    expect(createExportRequestSchema.safeParse(body).success).toBe(false)
  })
  test('accepts a bounded filter and carries no cursor', () => {
    const body = {
      kind: 'enriched_prospects',
      filter: {
        ownerMembershipId: id('mem', 2),
        companyId: id('pco', 3),
        status: 'archived',
        source: 'enrichment:apollo',
      },
    }
    expect(createExportRequestSchema.safeParse(body).success).toBe(true)
    expect(enrichedProspectsFilterSchema.safeParse({ cursor: 'x' }).success).toBe(false)
    expect(
      enrichedProspectsFilterSchema.safeParse({ source: `enrichment:${'a'.repeat(40)}` }).success
    ).toBe(false)
    expect(enrichedProspectsFilterSchema.safeParse({ status: 'deleted' }).success).toBe(false)
    expect(enrichedProspectsFilterSchema.safeParse({ ownerMembershipId: 'nope' }).success).toBe(
      false
    )
  })
})

test('a Source kind is bounded at its exact length', () => {
  const at = (n: number) => `enrichment:${'a'.repeat(n)}`
  expect(enrichedProspectsFilterSchema.safeParse({ source: at(32) }).success).toBe(true)
  expect(enrichedProspectsFilterSchema.safeParse({ source: at(33) }).success).toBe(false)
})

describe('export job', () => {
  test('carries its kind, format and filter', () => {
    expect(exportJobSchema.safeParse(orgJob).success).toBe(true)
    expect(exportJobSchema.safeParse(enrichedJob).success).toBe(true)
  })
  test('an enriched job needs a format and an Organization job has none', () => {
    expect(exportJobSchema.safeParse({ ...enrichedJob, format: null }).success).toBe(false)
    expect(exportJobSchema.safeParse({ ...orgJob, format: 'csv' }).success).toBe(false)
    expect(exportJobSchema.safeParse({ ...orgJob, filter: { status: 'active' } }).success).toBe(
      false
    )
  })
  test('an enriched job has only the core slice', () => {
    const parts = [
      ...enrichedJob.parts,
      { service: 'voice', state: 'pending', fileCount: null, bytes: null, readyAt: null },
    ]
    expect(exportJobSchema.safeParse({ ...enrichedJob, parts }).success).toBe(false)
  })
})

describe('columns', () => {
  test('cover every sourced Prospect and Prospect Company enrichment field with its Source', () => {
    const cols = new Set<string>(ENRICHED_EXPORT_COLUMNS)
    for (const c of ['prospect_id', 'company_id', 'status']) {
      expect(cols.has(c)).toBe(true)
    }
    for (const f of ['industry', 'employee_count', 'region', 'technologies']) {
      expect(cols.has(`company_${f}`)).toBe(true)
      expect(cols.has(`company_${f}_source`)).toBe(true)
    }
    for (const f of ['first_name', 'last_name', 'job_title', 'email', 'linkedin_url']) {
      expect(cols.has(f)).toBe(true)
      expect(cols.has(`${f}_source`)).toBe(true)
    }
    expect(cols.has('company_name')).toBe(true)
    expect(cols.has('company_domain')).toBe(true)
    expect(PROSPECT_FIELD_NAMES.length).toBeGreaterThan(0)
    expect(PROSPECT_COMPANY_FIELD_NAMES.length).toBeGreaterThan(0)
  })
  test('are unique snake_case names', () => {
    expect(new Set(ENRICHED_EXPORT_COLUMNS).size).toBe(ENRICHED_EXPORT_COLUMNS.length)
    for (const c of ENRICHED_EXPORT_COLUMNS) {
      expect(c).toMatch(/^[a-z][a-z0-9_]*$/)
    }
  })
  test('never include consent evidence, addresses of devices, transcripts, messages or secrets', () => {
    const banned =
      /consent|evidence|ip_|_ip|address_ip|user_agent|agent_string|transcript|message|body|recording|note|token|secret|password|api_key|phone/
    for (const c of ENRICHED_EXPORT_COLUMNS) {
      expect(c).not.toMatch(banned)
    }
  })
})

describe('event', () => {
  const data = {
    exportId: id('exp', 1),
    requestedByMembershipId: id('mem', 1),
    format: 'csv',
    filter: { status: 'active' },
    requestedAt: NOW,
  }
  const envelope = (d: unknown, version = 1) => ({
    id: id('evt', 50),
    type: 'export.enriched_prospects_requested',
    version,
    occurredAt: NOW,
    organizationId: id('org', 1),
    region: 'us',
    data: d,
  })
  test('is version 1 and registered', () => {
    expect(exportEnrichedProspectsRequestedEvent.version).toBe(1)
    expect(EXPORT_EVENTS['export.enriched_prospects_requested']).toBe(
      exportEnrichedProspectsRequestedEvent
    )
    expect(exportEnrichedProspectsRequestedEvent.safeParse(envelope(data)).success).toBe(true)
    expect(
      exportEnrichedProspectsRequestedEvent.safeParse(envelope({ ...data, filter: null })).success
    ).toBe(true)
  })
  test('refuses empty, extra and out-of-range data', () => {
    expect(exportEnrichedProspectsRequestedEvent.safeParse(envelope({})).success).toBe(false)
    expect(
      exportEnrichedProspectsRequestedEvent.safeParse(envelope({ ...data, cursor: 'x' })).success
    ).toBe(false)
    expect(
      exportEnrichedProspectsRequestedEvent.safeParse(envelope({ ...data, format: 'xlsx' })).success
    ).toBe(false)
    expect(exportEnrichedProspectsRequestedEvent.safeParse(envelope(data, 2)).success).toBe(false)
  })
})

describe('routes', () => {
  test('createExport describes the enriched kind, the one-at-a-time rule and the roles', () => {
    const d = EXPORT_ROUTES.createExport.description
    expect(d).toContain('enriched_prospects')
    expect(d).toContain('CSV')
    expect(d).toContain('export.enriched_prospects_requested')
    expect(EXPORT_ROUTES.createExport.roles).toEqual(['owner', 'admin'])
    expect('publicApi' in EXPORT_ROUTES.createExport).toBe(false)
  })
})
