import { describe, expect, test } from 'bun:test'
import type { z } from 'zod'
import { ERRORS, errorCodeSchema } from '../errors'
import {
  formatId,
  membershipIdSchema,
  prospectCompanyIdSchema,
  prospectIdSchema,
  prospectImportIdSchema,
  prospectMergeIdSchema,
} from '../ids'
import { MAX_PAGE_SIZE } from '../pagination'
import {
  BULK_ASSIGN_SYNC_LIMIT,
  bulkAssignProspectsRequestSchema,
  bulkAssignProspectsResponseSchema,
  createProspectCompanyRequestSchema,
  createProspectRequestSchema,
  duplicateIdentityDetailsSchema,
  listFieldHistoryQuerySchema,
  listProspectCompaniesQuerySchema,
  listProspectDuplicatesQuerySchema,
  listProspectImportRowsQuerySchema,
  listProspectImportsQuerySchema,
  listProspectsQuerySchema,
  MAX_BULK_ASSIGN_PROSPECTS,
  MAX_MERGED_PROSPECTS,
  MAX_PROSPECT_IMPORT_ROWS,
  mergeProspectsRequestSchema,
  PROSPECT_COMPANY_FIELD_NAMES,
  PROSPECT_ERRORS,
  PROSPECT_EVENTS,
  PROSPECT_IMPORT_COLUMNS,
  PROSPECT_IMPORT_INVALID_REASONS,
  PROSPECT_ROUTES,
  prospectCompanyFieldNameSchema,
  prospectCompanySchema,
  prospectErasedEvent,
  prospectImportInvalidDetailsSchema,
  prospectImportRowSchema,
  prospectImportSchema,
  prospectMergeSchema,
  setProspectOwnerRequestSchema,
  updateProspectCompanyRequestSchema,
  updateProspectRequestSchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const prs = (n: number) => formatId('prs', hex(n))
const mem = formatId('mem', hex(900))
const usr = formatId('usr', hex(901))
const pco = formatId('pco', hex(902))
const NOW = '2026-10-22T10:00:00Z'

describe('ids', () => {
  test('the new ids are prefixed', () => {
    expect(prospectCompanyIdSchema.safeParse(pco).success).toBe(true)
    expect(prospectImportIdSchema.safeParse(formatId('pimp', hex(1))).success).toBe(true)
    expect(prospectMergeIdSchema.safeParse(formatId('pmrg', hex(1))).success).toBe(true)
  })
})

describe('list queries', () => {
  const lists: [string, z.ZodType][] = [
    ['listProspects', listProspectsQuerySchema],
    ['listFieldHistory', listFieldHistoryQuerySchema],
    ['listProspectCompanies', listProspectCompaniesQuerySchema],
    ['listProspectDuplicates', listProspectDuplicatesQuerySchema],
    ['listProspectImports', listProspectImportsQuerySchema],
    ['listProspectImportRows', listProspectImportRowsQuerySchema],
  ]
  for (const [name, schema] of lists) {
    test(`${name} accepts a limit of ${MAX_PAGE_SIZE} and refuses ${MAX_PAGE_SIZE + 1}`, () => {
      expect(schema.safeParse({ limit: MAX_PAGE_SIZE }).success).toBe(true)
      expect(schema.safeParse({ limit: MAX_PAGE_SIZE + 1 }).success).toBe(false)
      expect(schema.safeParse({ limit: 0 }).success).toBe(false)
    })
    test(`${name} refuses an unknown parameter and an oversized cursor`, () => {
      expect(schema.safeParse({ surprise: '1' }).success).toBe(false)
      expect(schema.safeParse({ cursor: 'x'.repeat(513) }).success).toBe(false)
      expect(schema.safeParse({}).success).toBe(true)
    })
  }

  test('listProspects takes its filters and refuses a bad one', () => {
    expect(
      listProspectsQuerySchema.safeParse({
        ownerMembershipId: mem,
        source: 'enrichment:apollo',
        companyId: pco,
        status: 'archived',
        q: 'ada',
      }).success
    ).toBe(true)
    expect(listProspectsQuerySchema.safeParse({ source: 'enrichment:' }).success).toBe(false)
    expect(listProspectsQuerySchema.safeParse({ status: 'deleted' }).success).toBe(false)
    expect(listProspectsQuerySchema.safeParse({ q: 'x'.repeat(201) }).success).toBe(false)
  })
})

describe('createProspectRequestSchema', () => {
  test('accepts a valid body and folds the email', () => {
    const parsed = createProspectRequestSchema.parse({
      firstName: 'Ada',
      email: 'Ada@Example.COM',
      ownerMembershipId: mem,
    })
    expect(parsed.email).toBe('ada@example.com')
  })
  test('refuses an unknown field, including source', () => {
    expect(
      createProspectRequestSchema.safeParse({ email: 'a@b.co', source: 'import' }).success
    ).toBe(false)
    expect(createProspectRequestSchema.safeParse({ email: 'a@b.co', extra: 1 }).success).toBe(false)
  })
  test('refuses oversized input', () => {
    expect(createProspectRequestSchema.safeParse({ firstName: 'x'.repeat(1000) }).success).toBe(
      false
    )
    expect(
      createProspectRequestSchema.safeParse({ email: 'a@b.co', notes: 'x'.repeat(5001) }).success
    ).toBe(false)
    expect(
      createProspectRequestSchema.safeParse({
        email: 'a@b.co',
        tags: Array.from({ length: 21 }, (_, i) => `t${i}`),
      }).success
    ).toBe(false)
  })
  test('needs a name, email, phone or LinkedIn address', () => {
    expect(createProspectRequestSchema.safeParse({}).success).toBe(false)
    expect(createProspectRequestSchema.safeParse({ jobTitle: 'CTO' }).success).toBe(false)
  })
})

describe('updateProspectRequestSchema', () => {
  test('accepts a change and null to clear', () => {
    expect(updateProspectRequestSchema.safeParse({ jobTitle: 'CTO', phone: null }).success).toBe(
      true
    )
  })
  test('refuses an empty body, an unknown field and oversized input', () => {
    expect(updateProspectRequestSchema.safeParse({}).success).toBe(false)
    expect(updateProspectRequestSchema.safeParse({ ownerMembershipId: mem }).success).toBe(false)
    expect(updateProspectRequestSchema.safeParse({ notes: 'x'.repeat(5001) }).success).toBe(false)
  })
})

describe('owner and bulk assign', () => {
  test('set owner: valid, unknown field, wrong id', () => {
    expect(setProspectOwnerRequestSchema.safeParse({ ownerMembershipId: mem }).success).toBe(true)
    expect(setProspectOwnerRequestSchema.safeParse({ ownerMembershipId: mem, x: 1 }).success).toBe(
      false
    )
    expect(setProspectOwnerRequestSchema.safeParse({ ownerMembershipId: usr }).success).toBe(false)
  })
  test('bulk assign accepts 5000 and refuses 5001, none and repeats', () => {
    const ids = (n: number) => Array.from({ length: n }, (_, i) => prs(i + 1))
    const body = (n: number) => ({ prospectIds: ids(n), ownerMembershipId: mem })
    expect(
      bulkAssignProspectsRequestSchema.safeParse(body(MAX_BULK_ASSIGN_PROSPECTS)).success
    ).toBe(true)
    expect(
      bulkAssignProspectsRequestSchema.safeParse(body(MAX_BULK_ASSIGN_PROSPECTS + 1)).success
    ).toBe(false)
    expect(bulkAssignProspectsRequestSchema.safeParse(body(0)).success).toBe(false)
    expect(
      bulkAssignProspectsRequestSchema.safeParse({
        prospectIds: [prs(1), prs(1)],
        ownerMembershipId: mem,
      }).success
    ).toBe(false)
    expect(BULK_ASSIGN_SYNC_LIMIT).toBeLessThan(MAX_BULK_ASSIGN_PROSPECTS)
  })
  test('the bulk answer sets counts exactly when applied', () => {
    expect(
      bulkAssignProspectsResponseSchema.safeParse({
        state: 'applied',
        requested: 3,
        assigned: 2,
        skipped: 1,
      }).success
    ).toBe(true)
    expect(
      bulkAssignProspectsResponseSchema.safeParse({
        state: 'queued',
        requested: 600,
        assigned: null,
        skipped: null,
      }).success
    ).toBe(true)
    expect(
      bulkAssignProspectsResponseSchema.safeParse({
        state: 'queued',
        requested: 600,
        assigned: 1,
        skipped: null,
      }).success
    ).toBe(false)
  })
})

describe('Prospect Company requests', () => {
  test('create: valid, unknown field, oversized', () => {
    const parsed = createProspectCompanyRequestSchema.parse({ name: 'Acme', domain: 'ACME.com' })
    expect(parsed.domain).toBe('acme.com')
    expect(createProspectCompanyRequestSchema.safeParse({ name: 'Acme', x: 1 }).success).toBe(false)
    expect(createProspectCompanyRequestSchema.safeParse({ name: 'x'.repeat(1000) }).success).toBe(
      false
    )
    expect(createProspectCompanyRequestSchema.safeParse({}).success).toBe(false)
  })
  test('update: null clears the domain, empty refused', () => {
    expect(updateProspectCompanyRequestSchema.safeParse({ domain: null }).success).toBe(true)
    expect(updateProspectCompanyRequestSchema.safeParse({}).success).toBe(false)
    expect(updateProspectCompanyRequestSchema.safeParse({ name: 'A', x: 1 }).success).toBe(false)
    expect(updateProspectCompanyRequestSchema.safeParse({ name: 'x'.repeat(1000) }).success).toBe(
      false
    )
  })
})

describe('merge', () => {
  test('request: valid, unknown field, too many, repeats, none', () => {
    const ids = (n: number) => Array.from({ length: n }, (_, i) => prs(i + 10))
    expect(
      mergeProspectsRequestSchema.safeParse({
        mergedProspectIds: ids(MAX_MERGED_PROSPECTS),
        fieldChoices: { email: prs(10) },
      }).success
    ).toBe(true)
    expect(mergeProspectsRequestSchema.parse({ mergedProspectIds: ids(1) }).fieldChoices).toEqual(
      {}
    )
    expect(
      mergeProspectsRequestSchema.safeParse({ mergedProspectIds: ids(MAX_MERGED_PROSPECTS + 1) })
        .success
    ).toBe(false)
    expect(mergeProspectsRequestSchema.safeParse({ mergedProspectIds: [] }).success).toBe(false)
    expect(
      mergeProspectsRequestSchema.safeParse({ mergedProspectIds: [prs(1), prs(1)] }).success
    ).toBe(false)
    expect(mergeProspectsRequestSchema.safeParse({ mergedProspectIds: ids(1), x: 1 }).success).toBe(
      false
    )
    expect(
      mergeProspectsRequestSchema.safeParse({
        mergedProspectIds: ids(1),
        fieldChoices: { shoeSize: prs(1) },
      }).success
    ).toBe(false)
  })
  test('record: undoneAt is set exactly when undone', () => {
    const base = {
      id: formatId('pmrg', hex(1)),
      survivorProspectId: prs(1),
      mergedProspectIds: [prs(2)],
      fieldChoices: {},
      mergedByUserId: usr,
      createdAt: NOW,
      undoableUntil: '2026-11-21T10:00:00Z',
    }
    expect(
      prospectMergeSchema.safeParse({ ...base, state: 'merged', undoneAt: null }).success
    ).toBe(true)
    expect(prospectMergeSchema.safeParse({ ...base, state: 'undone', undoneAt: NOW }).success).toBe(
      true
    )
    expect(
      prospectMergeSchema.safeParse({ ...base, state: 'undone', undoneAt: null }).success
    ).toBe(false)
    expect(prospectMergeSchema.safeParse({ ...base, state: 'merged', undoneAt: NOW }).success).toBe(
      false
    )
  })
})

describe('import', () => {
  test('the template columns are the documented ten', () => {
    expect(PROSPECT_IMPORT_COLUMNS).toHaveLength(10)
    expect(MAX_PROSPECT_IMPORT_ROWS).toBe(50_000)
  })
  const job = {
    id: formatId('pimp', hex(1)),
    uploadedByUserId: usr,
    createdAt: NOW,
    updatedAt: NOW,
  }
  test('job counts are set exactly when completed and add up', () => {
    const none = {
      rowCount: null,
      createdCount: null,
      updatedCount: null,
      skippedCount: null,
      rejectedCount: null,
      failureReason: null,
    }
    expect(prospectImportSchema.safeParse({ ...job, ...none, state: 'processing' }).success).toBe(
      true
    )
    const done = {
      ...none,
      state: 'completed',
      rowCount: 10,
      createdCount: 5,
      updatedCount: 2,
      skippedCount: 1,
      rejectedCount: 2,
    }
    expect(prospectImportSchema.safeParse({ ...job, ...done }).success).toBe(true)
    expect(prospectImportSchema.safeParse({ ...job, ...done, rowCount: 11 }).success).toBe(false)
    expect(prospectImportSchema.safeParse({ ...job, ...none, state: 'completed' }).success).toBe(
      false
    )
    expect(prospectImportSchema.safeParse({ ...job, ...none, state: 'failed' }).success).toBe(false)
    expect(
      prospectImportSchema.safeParse({
        ...job,
        ...none,
        state: 'failed',
        failureReason: 'unreadable',
      }).success
    ).toBe(true)
  })
  test('rows follow the result rules and carry no cells', () => {
    const row = (r: object) => prospectImportRowSchema.safeParse(r).success
    expect(row({ rowNumber: 2, result: 'created', reason: null, prospectId: prs(1) })).toBe(true)
    expect(row({ rowNumber: 2, result: 'created', reason: null, prospectId: null })).toBe(false)
    expect(row({ rowNumber: 1, result: 'created', reason: null, prospectId: prs(1) })).toBe(false)
    expect(row({ rowNumber: 3, result: 'skipped', reason: 'no_change', prospectId: prs(1) })).toBe(
      true
    )
    expect(row({ rowNumber: 3, result: 'skipped', reason: null, prospectId: prs(1) })).toBe(false)
    expect(row({ rowNumber: 3, result: 'updated', reason: 'no_change', prospectId: prs(1) })).toBe(
      false
    )
    expect(row({ rowNumber: 4, result: 'rejected', reason: 'no_change', prospectId: null })).toBe(
      false
    )
    expect(row({ rowNumber: 4, result: 'rejected', reason: 'no_change', prospectId: prs(1) })).toBe(
      false
    )
    expect(
      row({ rowNumber: 2, result: 'created', reason: null, prospectId: prs(1), email: 'a@b.co' })
    ).toBe(true) // object schema strips unknown keys; the output below proves nothing leaks
    expect(
      prospectImportRowSchema.parse({
        rowNumber: 2,
        result: 'created',
        reason: null,
        prospectId: prs(1),
        email: 'a@b.co',
      })
    ).toEqual({ rowNumber: 2, result: 'created', reason: null, prospectId: prs(1) })
  })
  test('upload refusal details name one of the four reasons', () => {
    for (const reason of PROSPECT_IMPORT_INVALID_REASONS) {
      expect(prospectImportInvalidDetailsSchema.safeParse({ reason }).success).toBe(true)
    }
    expect(prospectImportInvalidDetailsSchema.safeParse({ reason: 'other' }).success).toBe(false)
    expect(
      prospectImportInvalidDetailsSchema.safeParse({ reason: 'too_large', x: 1 }).success
    ).toBe(false)
  })
})

describe('errors', () => {
  test('a company domain that is taken is its own 409, returned by the routes that set a domain', () => {
    expect(PROSPECT_ERRORS['prospect.company_domain_taken'].status).toBe(409)
    expect(PROSPECT_ROUTES.createProspectCompany.errors).toContain('prospect.company_domain_taken')
    expect(PROSPECT_ROUTES.updateProspectCompany.errors).toContain('prospect.company_domain_taken')
    expect(PROSPECT_ROUTES.updateProspectCompany.description).toContain('company_domain_taken')
  })
  test('the codes have fixed statuses and messages', () => {
    expect(
      Object.fromEntries(Object.entries(PROSPECT_ERRORS).map(([key, value]) => [key, value.status]))
    ).toEqual({
      'prospect.not_found': 404,
      'prospect.duplicate_identity': 409,
      'prospect.import_invalid': 422,
      'prospect.merge_conflict': 409,
      'prospect.forbidden_owner': 403,
      'prospect.company_domain_taken': 409,
    })
    for (const [code, definition] of Object.entries(PROSPECT_ERRORS)) {
      expect(errorCodeSchema.safeParse(code).success).toBe(true)
      expect(definition.message.length).toBeGreaterThan(10)
    }
  })
  test('duplicate_identity details name the kind and, optionally, a Prospect', () => {
    expect(duplicateIdentityDetailsSchema.safeParse({ identityKind: 'email' }).success).toBe(true)
    expect(
      duplicateIdentityDetailsSchema.safeParse({ identityKind: 'phone', prospectId: prs(1) })
        .success
    ).toBe(true)
    expect(duplicateIdentityDetailsSchema.safeParse({ identityKind: 'fax' }).success).toBe(false)
  })
})

describe('events', () => {
  const envelope = (type: string, data: object) => ({
    id: formatId('evt', hex(5)),
    type,
    version: 1,
    occurredAt: NOW,
    organizationId: formatId('org', hex(6)),
    region: 'us',
    data,
  })
  test('each event parses through the envelope', () => {
    expect(
      PROSPECT_EVENTS['prospect.created'].safeParse(
        envelope('prospect.created', {
          prospectId: prs(1),
          companyId: null,
          ownerMembershipId: mem,
          source: 'manual',
        })
      ).success
    ).toBe(true)
    expect(
      PROSPECT_EVENTS['prospect.updated'].safeParse(
        envelope('prospect.updated', {
          prospectId: prs(1),
          changedFields: ['email'],
          ownerChanged: false,
          companyChanged: false,
          statusChanged: false,
          source: 'import',
        })
      ).success
    ).toBe(true)
    expect(
      PROSPECT_EVENTS['prospect.merged'].safeParse(
        envelope('prospect.merged', {
          mergeId: formatId('pmrg', hex(1)),
          survivorProspectId: prs(1),
          mergedProspectIds: [prs(2)],
        })
      ).success
    ).toBe(true)
  })
  test('prospect.merge_undone: valid, unknown field, too many ids', () => {
    const event = PROSPECT_EVENTS['prospect.merge_undone']
    const data = (ids: number, extra: object = {}) => ({
      mergeId: formatId('pmrg', hex(1)),
      survivorProspectId: prs(1),
      restoredProspectIds: Array.from({ length: ids }, (_, i) => prs(i + 2)),
      ...extra,
    })
    expect(event.safeParse(envelope('prospect.merge_undone', data(5))).success).toBe(true)
    expect(event.safeParse(envelope('prospect.merge_undone', data(6))).success).toBe(false)
    expect(event.safeParse(envelope('prospect.merge_undone', data(0))).success).toBe(false)
    expect(
      event.safeParse(envelope('prospect.merge_undone', data(1, { email: 'a@b.co' }))).success
    ).toBe(false)
    expect(PROSPECT_ROUTES.undoProspectMerge.description).toContain('prospect.merge_undone')
  })
  test('prospect.erased carries the id and nothing else', () => {
    expect(
      prospectErasedEvent.safeParse(envelope('prospect.erased', { prospectId: prs(1) })).success
    ).toBe(true)
    expect(
      prospectErasedEvent.safeParse(
        envelope('prospect.erased', { prospectId: prs(1), email: 'a@b.co' })
      ).success
    ).toBe(false)
  })
  test('updated names fields only, never values', () => {
    expect(
      PROSPECT_EVENTS['prospect.updated'].safeParse(
        envelope('prospect.updated', {
          prospectId: prs(1),
          changedFields: ['a@b.co'],
          ownerChanged: false,
          companyChanged: false,
          statusChanged: false,
          source: 'manual',
        })
      ).success
    ).toBe(false)
  })
  test('a wrong type or version is refused', () => {
    expect(
      prospectErasedEvent.safeParse({
        ...envelope('prospect.erased', { prospectId: prs(1) }),
        version: 2,
      }).success
    ).toBe(false)
  })
})

describe('routes', () => {
  const known = new Set<string>([
    ...Object.keys(PROSPECT_ERRORS),
    ...Object.keys(ERRORS),
    'request.invalid',
    'request.too_large',
    'request.unsupported_media_type',
    'request.idempotency_key_reused',
    'request.idempotency_in_progress',
  ])
  test('every code a route lists exists', () => {
    for (const route of Object.values(PROSPECT_ROUTES)) {
      for (const code of [...route.errors, ...route.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
  })
  test('method and path pairs are unique and under /v1', () => {
    const seen = new Set<string>()
    for (const route of Object.values(PROSPECT_ROUTES)) {
      const key = `${route.method} ${route.path}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      expect(route.path.startsWith('/v1/')).toBe(true)
      expect(route.description.length).toBeGreaterThan(20)
    }
  })
  test('destructive and bulk routes are Owner and Admin only', () => {
    for (const name of [
      'eraseProspect',
      'mergeProspects',
      'undoProspectMerge',
      'bulkAssignProspects',
      'uploadProspectImport',
      'setProspectOwner',
    ] as const) {
      expect(PROSPECT_ROUTES[name].roles).toEqual(['owner', 'admin'])
    }
  })
  test('the import description names every identity kind it matches on', () => {
    const text = PROSPECT_ROUTES.uploadProspectImport.description
    for (const kind of ['email', 'phone', 'LinkedIn']) {
      expect(text).toContain(kind)
    }
  })
  test('routes with an Idempotency-Key list its error codes', () => {
    for (const route of Object.values(PROSPECT_ROUTES)) {
      if (route.idempotent) {
        expect(route.commonErrors).toContain('request.idempotency_key_reused')
      }
    }
  })
  test('ids used by the schemas are distinct', () => {
    expect(prospectIdSchema.safeParse(pco).success).toBe(false)
    expect(membershipIdSchema.safeParse(pco).success).toBe(false)
  })
})

describe('Prospect Company enrichment fields', () => {
  const stored = (value: string) => ({
    value,
    source: 'enrichment:apollo',
    sourceRef: null,
    setAt: NOW,
    setByUserId: null,
  })
  test('the history field names include the four, camelCase like the enrichment payload', () => {
    expect([...PROSPECT_COMPANY_FIELD_NAMES]).toEqual([
      'name',
      'domain',
      'industry',
      'employeeCount',
      'region',
      'technologies',
    ])
    expect(prospectCompanyFieldNameSchema.safeParse('employeeCount').success).toBe(true)
    expect(prospectCompanyFieldNameSchema.safeParse('employee_count').success).toBe(false)
  })
  test('read: the new fields are optional, and present ones carry their Source', () => {
    const base = { id: pco, createdAt: NOW, updatedAt: NOW }
    expect(
      prospectCompanySchema.safeParse({ ...base, fields: { name: stored('Acme') } }).success
    ).toBe(true)
    const full = prospectCompanySchema.parse({
      ...base,
      fields: {
        name: stored('Acme'),
        industry: stored('Software'),
        employeeCount: stored('250'),
        region: stored('EMEA'),
        technologies: stored(JSON.stringify(['bun'])),
      },
    })
    expect(full.fields.employeeCount?.value).toBe('250')
  })
  test('read: a full 50-technology JSON value fits', () => {
    const list = Array.from({ length: 50 }, () => 't'.repeat(100))
    const json = JSON.stringify(list)
    expect(json.length).toBeGreaterThan(320)
    expect(json.length).toBeLessThanOrEqual(5300)
    expect(
      prospectCompanySchema.safeParse({
        id: pco,
        createdAt: NOW,
        updatedAt: NOW,
        fields: { name: stored('Acme'), technologies: stored(json) },
      }).success
    ).toBe(true)
  })
  test('create: accepts the four fields, trimming text', () => {
    const parsed = createProspectCompanyRequestSchema.parse({
      name: 'Acme',
      industry: '  Software ',
      region: ' EMEA',
      employeeCount: 250,
      technologies: ['bun', 'postgres'],
    })
    expect(parsed.industry).toBe('Software')
    expect(parsed.region).toBe('EMEA')
    expect(parsed.employeeCount).toBe(250)
    expect(parsed.technologies).toEqual(['bun', 'postgres'])
  })
  const bad: Array<[string, Record<string, unknown>]> = [
    ['empty industry', { industry: '  ' }],
    ['industry over 200', { industry: 'x'.repeat(201) }],
    ['empty region', { region: '' }],
    ['region over 200', { region: 'x'.repeat(201) }],
    ['negative employeeCount', { employeeCount: -1 }],
    ['fractional employeeCount', { employeeCount: 1.5 }],
    ['employeeCount over 999,999,999', { employeeCount: 1_000_000_000 }],
    ['string employeeCount', { employeeCount: '5' }],
    ['51 technologies', { technologies: Array.from({ length: 51 }, (_, i) => `t${i}`) }],
    ['empty technology', { technologies: [''] }],
    ['technology over 100', { technologies: ['x'.repeat(101)] }],
  ]
  for (const [label, extra] of bad) {
    test(`create and update refuse ${label}`, () => {
      expect(createProspectCompanyRequestSchema.safeParse({ name: 'Acme', ...extra }).success).toBe(
        false
      )
      expect(updateProspectCompanyRequestSchema.safeParse(extra).success).toBe(false)
    })
  }
  test('limits are inclusive', () => {
    const ok = {
      name: 'Acme',
      industry: 'x'.repeat(200),
      region: 'y',
      employeeCount: 999_999_999,
      technologies: Array.from({ length: 50 }, () => 't'.repeat(100)),
    }
    expect(createProspectCompanyRequestSchema.safeParse(ok).success).toBe(true)
    expect(
      createProspectCompanyRequestSchema.safeParse({ name: 'A', employeeCount: 0 }).success
    ).toBe(true)
  })
  test('update: each field alone is a change, null clears, empty list is allowed', () => {
    for (const body of [
      { industry: 'Software' },
      { region: 'EMEA' },
      { employeeCount: 0 },
      { technologies: [] },
      { industry: null },
      { region: null },
      { employeeCount: null },
      { technologies: null },
    ]) {
      expect(updateProspectCompanyRequestSchema.safeParse(body).success).toBe(true)
    }
    expect(updateProspectCompanyRequestSchema.safeParse({}).success).toBe(false)
  })
  test('create: null is not accepted', () => {
    expect(
      createProspectCompanyRequestSchema.safeParse({ name: 'A', industry: null }).success
    ).toBe(false)
  })
})
