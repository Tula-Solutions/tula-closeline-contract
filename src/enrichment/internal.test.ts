import { describe, expect, test } from 'bun:test'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import { PROSPECT_ERRORS } from '../prospect/errors'
import { sourceKindSchema } from '../prospect/values'
import { ENRICHMENT_ERRORS } from './errors'
import {
  ENRICHMENT_INTERNAL_ROUTES,
  enrichmentInputParamsSchema,
  enrichmentInputResponseSchema,
  MAX_ENRICHED_FIELD_WRITES,
  writeEnrichedFieldsParamsSchema,
  writeEnrichedFieldsRequestSchema,
  writeEnrichedFieldsResponseSchema,
} from './internal'
import { ENRICHED_FIELDS } from './values'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const prospectId = formatId('prs', hex(1))
const runId = formatId('erun', hex(2))

const field = (name: string, extra: Record<string, unknown> = {}) => ({
  field: name,
  value: 'Acme',
  provider: 'acme_data',
  confidence: 0.9,
  obtainedAt: '2026-10-01T12:00:00Z',
  ...extra,
})
const body = (fields: unknown[]) => ({ runId, fields })

describe('enrichment input', () => {
  test('params take a Prospect id and nothing else', () => {
    expect(enrichmentInputParamsSchema.safeParse({ prospectId }).success).toBe(true)
    expect(enrichmentInputParamsSchema.safeParse({ prospectId, organizationId: 'x' }).success).toBe(
      false
    )
  })
  test('the response parses with nulls and lists the fields present', () => {
    const ok = enrichmentInputResponseSchema.safeParse({
      prospectId,
      email: null,
      firstName: 'Ada',
      lastName: null,
      jobTitle: null,
      companyName: 'Acme',
      companyDomain: null,
      presentFields: ['firstName', 'companyName'],
    })
    expect(ok.success).toBe(true)
  })
  test('an unknown present field is refused', () => {
    const bad = enrichmentInputResponseSchema.safeParse({
      prospectId,
      email: null,
      firstName: null,
      lastName: null,
      jobTitle: null,
      companyName: null,
      companyDomain: null,
      presentFields: ['phone'],
    })
    expect(bad.success).toBe(false)
  })
})

describe('write enriched fields', () => {
  test('a valid body parses', () => {
    expect(writeEnrichedFieldsRequestSchema.safeParse(body([field('jobTitle')])).success).toBe(true)
    expect(writeEnrichedFieldsParamsSchema.safeParse({ prospectId }).success).toBe(true)
  })
  test('all 11 fields at once parse; 12 and 0 do not', () => {
    expect(MAX_ENRICHED_FIELD_WRITES).toBe(11)
    expect(
      writeEnrichedFieldsRequestSchema.safeParse(body(ENRICHED_FIELDS.map((f) => field(f)))).success
    ).toBe(true)
    const twelve = [...ENRICHED_FIELDS.map((f) => field(f)), field('firstName')]
    expect(writeEnrichedFieldsRequestSchema.safeParse(body(twelve)).success).toBe(false)
    expect(writeEnrichedFieldsRequestSchema.safeParse(body([])).success).toBe(false)
  })
  test('a field named twice is refused', () => {
    const dup = body([field('jobTitle'), field('jobTitle', { value: 'CTO' })])
    expect(writeEnrichedFieldsRequestSchema.safeParse(dup).success).toBe(false)
  })
  test('confidence outside 0..1 is refused', () => {
    for (const confidence of [-0.1, 1.1]) {
      expect(
        writeEnrichedFieldsRequestSchema.safeParse(body([field('jobTitle', { confidence })]))
          .success
      ).toBe(false)
    }
    for (const confidence of [0, 1]) {
      expect(
        writeEnrichedFieldsRequestSchema.safeParse(body([field('jobTitle', { confidence })]))
          .success
      ).toBe(true)
    }
  })
  test('a bad provider slug is refused', () => {
    for (const provider of ['', 'Acme', 'a b', 'a-b', '1abc', 'x'.repeat(33), 'enrichment:acme']) {
      expect(
        writeEnrichedFieldsRequestSchema.safeParse(body([field('jobTitle', { provider })])).success
      ).toBe(false)
    }
  })
  test('an unknown field, a phone number and a bad time are refused', () => {
    for (const bad of [field('phone'), field('jobTitle', { obtainedAt: 'yesterday' })]) {
      expect(writeEnrichedFieldsRequestSchema.safeParse(body([bad])).success).toBe(false)
    }
  })
  test('the body never takes a source, actor or Organization', () => {
    for (const extra of [{ source: 'manual' }, { actor: 'u' }, { organizationId: 'o' }]) {
      expect(
        writeEnrichedFieldsRequestSchema.safeParse({ ...body([field('jobTitle')]), ...extra })
          .success
      ).toBe(false)
      expect(
        writeEnrichedFieldsRequestSchema.safeParse(body([field('jobTitle', extra)])).success
      ).toBe(false)
    }
  })
  test('a value is bounded and has no control character', () => {
    expect(
      writeEnrichedFieldsRequestSchema.safeParse(body([field('jobTitle', { value: '' })])).success
    ).toBe(false)
    expect(
      writeEnrichedFieldsRequestSchema.safeParse(
        body([field('jobTitle', { value: 'x'.repeat(5301) })])
      ).success
    ).toBe(false)
    expect(
      writeEnrichedFieldsRequestSchema.safeParse(body([field('jobTitle', { value: 'a\u0000b' })]))
        .success
    ).toBe(false)
  })
  test('the response reports written or suggested per field', () => {
    const ok = writeEnrichedFieldsResponseSchema.safeParse({
      results: [
        { field: 'jobTitle', application: 'written' },
        { field: 'email', application: 'suggested' },
      ],
    })
    expect(ok.success).toBe(true)
    expect(
      writeEnrichedFieldsResponseSchema.safeParse({
        results: [{ field: 'jobTitle', application: 'skipped' }],
      }).success
    ).toBe(false)
  })
})

describe('routes', () => {
  const known = new Set([
    ...Object.keys(ENRICHMENT_ERRORS),
    ...Object.keys(PROSPECT_ERRORS),
    ...Object.keys(ERRORS),
  ])
  test('both are internal, outbound-only and use the existing not-found code', () => {
    for (const r of Object.values(ENRICHMENT_INTERNAL_ROUTES)) {
      expect(r.internal).toBe(true)
      expect(r.path.startsWith('/internal/v1/prospects/{prospectId}/')).toBe(true)
      expect(r.serviceToken).toEqual({ audiences: ['outbound'] })
      expect(r.roles).toEqual([])
      expect(r.errors).toEqual(['enrichment.prospect_not_found'])
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
    expect(ENRICHMENT_INTERNAL_ROUTES.getEnrichmentInput.method).toBe('GET')
    expect(ENRICHMENT_INTERNAL_ROUTES.writeEnrichedFields.method).toBe('POST')
  })
  test('the write is idempotent on the run and documents the Source rules', () => {
    const r = ENRICHMENT_INTERNAL_ROUTES.writeEnrichedFields
    expect(r.idempotent).toBe(true)
    expect(r.description).toContain('enrichment:<provider>')
    expect(r.description).toContain('suggested')
    expect(r.description).toContain('ADR 0020')
    expect(r.description).toContain('runId')
  })
})

describe('provider slug', () => {
  test('every accepted slug makes a valid Source kind', () => {
    for (const provider of ['a', 'acme_data', `a${'b'.repeat(31)}`]) {
      const parsed = writeEnrichedFieldsRequestSchema.safeParse(
        body([field('jobTitle', { provider })])
      )
      expect(parsed.success).toBe(true)
      expect(sourceKindSchema.safeParse(`enrichment:${provider}`).success).toBe(true)
    }
  })
})
