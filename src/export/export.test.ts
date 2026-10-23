import { describe, expect, test } from 'bun:test'
import { ERRORS } from '../errors'
import { formatId } from '../ids'
import {
  createExportRequestSchema,
  EXPORT_ERRORS,
  EXPORT_EVENTS,
  EXPORT_PART_FAILURE_REASONS,
  EXPORT_ROUTES,
  EXPORT_STATES,
  exportJobSchema,
  exportPartFailedEvent,
  exportPartReadyEvent,
  exportRequestedEvent,
  exportStateSchema,
  listExportsQuerySchema,
} from './index'

const hex = (n: number) => n.toString(16).padStart(32, '0')
const id = (prefix: string, n: number) => formatId(prefix as never, hex(n))
const NOW = '2026-10-22T10:00:00.000Z'

const job = {
  id: id('exp', 1),
  state: 'running',
  requestedByMembershipId: id('mem', 1),
  includeRecordingLinks: false,
  parts: [{ service: 'core', state: 'ready', fileCount: 3, bytes: 100, readyAt: NOW }],
  failureReason: null,
  requestedAt: NOW,
  completedAt: null,
  expiresAt: null,
}

describe('export job', () => {
  test('states are a closed list', () => {
    expect(EXPORT_STATES.length).toBe(5)
    expect(exportStateSchema.safeParse('paused').success).toBe(false)
  })
  test('a failure reason exists exactly when failed', () => {
    expect(exportJobSchema.safeParse(job).success).toBe(true)
    expect(exportJobSchema.safeParse({ ...job, failureReason: 'part_failed' }).success).toBe(false)
    expect(exportJobSchema.safeParse({ ...job, state: 'failed' }).success).toBe(false)
    expect(
      exportJobSchema.safeParse({ ...job, state: 'failed', failureReason: 'timed_out' }).success
    ).toBe(true)
  })
  test('drops unknown fields, including a download url', () => {
    const parsed = exportJobSchema.parse({
      ...job,
      url: 'https://x.example/a',
      parts: [{ ...job.parts[0], path: '/x' }],
    })
    expect('url' in parsed).toBe(false)
    expect('path' in (parsed.parts[0] ?? {})).toBe(false)
  })
})

describe('requests', () => {
  test('create refuses unknown fields and defaults recordings off', () => {
    expect(createExportRequestSchema.parse({}).includeRecordingLinks).toBe(false)
    expect(createExportRequestSchema.safeParse({ everything: true }).success).toBe(false)
  })
  test('list page size is at most 100', () => {
    expect(listExportsQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
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
  const requested = {
    exportId: id('exp', 1),
    requestedByMembershipId: id('mem', 1),
    includeRecordingLinks: true,
    requestedAt: NOW,
  }
  const ready = {
    exportId: id('exp', 1),
    service: 'core',
    prefix: 'exports/org/exp/core',
    fileCount: 2,
    bytes: 10,
    readyAt: NOW,
  }
  test('parse, are version 1, and refuse empty and extra fields', () => {
    expect(exportRequestedEvent.safeParse(envelope('export.requested', requested)).success).toBe(
      true
    )
    expect(exportPartReadyEvent.safeParse(envelope('export.part_ready', ready)).success).toBe(true)
    expect(exportRequestedEvent.version).toBe(1)
    expect(exportPartReadyEvent.version).toBe(1)
    expect(exportRequestedEvent.safeParse(envelope('export.requested', {})).success).toBe(false)
    expect(
      exportPartReadyEvent.safeParse(envelope('export.part_ready', { ...ready, url: 'x' })).success
    ).toBe(false)
  })
  test('export.part_failed is version 1, carries a closed reason and no free text', () => {
    const failed = {
      exportId: id('exp', 1),
      service: 'voice',
      reason: 'write_failed',
      failedAt: NOW,
    }
    expect(exportPartFailedEvent.version).toBe(1)
    expect(exportPartFailedEvent.type).toBe('export.part_failed')
    expect(EXPORT_EVENTS['export.part_failed']).toBe(exportPartFailedEvent)
    expect(exportPartFailedEvent.safeParse(envelope('export.part_failed', failed)).success).toBe(
      true
    )
    expect(exportPartFailedEvent.safeParse(envelope('export.part_failed', {})).success).toBe(false)
    expect(
      exportPartFailedEvent.safeParse(
        envelope('export.part_failed', { ...failed, reason: 'disk is full' })
      ).success
    ).toBe(false)
    expect(
      exportPartFailedEvent.safeParse(
        envelope('export.part_failed', { ...failed, message: 'boom' })
      ).success
    ).toBe(false)
    expect(EXPORT_PART_FAILURE_REASONS.length).toBeGreaterThan(0)
  })
  test('the descriptions name the timeout as the backstop', () => {
    expect(EXPORT_ROUTES.getExport.description).toContain('export.part_failed')
    expect(EXPORT_ROUTES.getExport.description).toContain('backstop')
  })
  test('a prefix cannot climb out of the bucket', () => {
    for (const prefix of ['../x', '/abs', 'a/../b']) {
      expect(
        exportPartReadyEvent.safeParse(envelope('export.part_ready', { ...ready, prefix })).success
      ).toBe(false)
    }
  })
})

describe('errors and routes', () => {
  const routes = Object.entries(EXPORT_ROUTES)
  test('codes are area.reason and distinct from common codes', () => {
    const common = new Set<string>(Object.values(ERRORS).map((e) => e.code))
    for (const entry of Object.values(EXPORT_ERRORS)) {
      expect(entry.code).toMatch(/^export\.[a-z_]+$/)
      expect(common.has(entry.code)).toBe(false)
    }
    expect(EXPORT_ERRORS['export.already_running'].code).toBe('export.already_running')
  })
  test('4 routes, known codes, every area code used, mutations keyed', () => {
    expect(routes.length).toBe(4)
    const known = new Set<string>(
      [...Object.values(EXPORT_ERRORS), ...Object.values(ERRORS)].map((e) => e.code)
    )
    for (const [, r] of routes) {
      expect(r.path.startsWith('/v1/')).toBe(true)
      expect(r.description.length).toBeGreaterThan(40)
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
      if (r.method !== 'GET') {
        expect(r.keyRequired).toBe(true)
        expect(r.idempotent).toBe(true)
        expect(r.commonErrors).toContain('request.idempotency_key_reused')
        expect(r.description).toContain('Idempotency-Key')
      }
    }
    const used = new Set(routes.flatMap(([, r]) => r.errors as string[]))
    for (const entry of Object.values(EXPORT_ERRORS)) {
      expect(used.has(entry.code)).toBe(true)
    }
    expect(EXPORT_ROUTES.listExports.description).toContain('cursor')
    expect(EXPORT_ROUTES.listExports.description).toContain('100')
  })
})
