import { describe, expect, test } from 'bun:test'
import { ERRORS } from '../errors'
import {
  DEAL_IMPORT_ROW_REASONS,
  dealImportRowReasonSchema,
  dealImportRowSchema,
  MAX_QUEUED_DEAL_IMPORTS,
  PLAYBOOK_ROUTES,
  SALES_HISTORY_ERRORS,
  SALES_HISTORY_ROUTES,
} from './index'

describe('blank_row (hub #72, item 1)', () => {
  test('is in the closed list of report reasons', () => {
    expect(DEAL_IMPORT_ROW_REASONS).toContain('blank_row')
    expect(dealImportRowReasonSchema.safeParse('blank_row').success).toBe(true)
  })

  test('an interior blank line is a rejected row with no deal id, so the report has no gap', () => {
    expect(
      dealImportRowSchema.safeParse({
        rowNumber: 3,
        dealId: null,
        result: 'rejected',
        reason: 'blank_row',
      }).success
    ).toBe(true)
  })

  test('a blank_row must be rejected and must not echo a deal id', () => {
    expect(
      dealImportRowSchema.safeParse({ rowNumber: 3, dealId: null, result: 'applied', reason: null })
        .success
    ).toBe(false)
    expect(
      dealImportRowSchema.safeParse({
        rowNumber: 3,
        dealId: 'D-1',
        result: 'rejected',
        reason: 'blank_row',
      }).success
    ).toBe(false)
  })

  test('the docs no longer say a blank line is skipped and not reported', () => {
    const text = SALES_HISTORY_ROUTES.uploadDealImport.description
    expect(text).not.toContain('skipped and not reported')
    expect(text).toContain('rejected row with the reason blank_row')
    expect(text).toContain('still counts in the row numbers')
  })
})

describe('deal_import.busy (hub #72, item 2)', () => {
  test('the cap is 5 queued imports, those not yet finished', () => {
    expect(MAX_QUEUED_DEAL_IMPORTS).toBe(5)
  })

  test('the code is a 429 with a fixed message', () => {
    expect(SALES_HISTORY_ERRORS['deal_import.busy'].status).toBe(429)
    expect(SALES_HISTORY_ERRORS['deal_import.busy'].message).toBe(
      'Too many imports are waiting. Try again when some have finished.'
    )
    expect('deal_import.busy' in ERRORS).toBe(false)
  })

  test('the upload route may return it, and says nothing is stored', () => {
    const upload = SALES_HISTORY_ROUTES.uploadDealImport
    expect(upload.errors).toContain('deal_import.busy')
    expect(upload.description).toContain('deal_import.busy (429)')
    expect(upload.description).toContain('nothing is stored')
    expect(upload.description).toContain('MAX_QUEUED_DEAL_IMPORTS')
  })
})

describe('remove-all answers 503 for a transient failure (hub #72, item 3)', () => {
  const route = PLAYBOOK_ROUTES.removeOrganizationDocuments

  test('documents the existing server.unavailable code (503)', () => {
    expect(route.commonErrors).toContain('server.unavailable')
    expect(ERRORS['server.unavailable'].status).toBe(503)
  })

  test('says Retry-After, that a repeat reaches 200, and that 200 never comes while data remains', () => {
    expect(route.description).toContain('503')
    expect(route.description).toContain('Retry-After')
    expect(route.description).toContain('never answers 200 while data remains')
  })
})
