import { describe, expect, test } from 'bun:test'
import {
  calendarDateSchema,
  dealSchema,
  parseClosedAtCell,
  setDealOutcomeRequestSchema,
} from './index'

describe('calendarDateSchema (hub #90)', () => {
  test.each([
    ['2026-10-12', true],
    ['1970-01-01', true],
    ['2100-12-31', true],
    ['1969-12-31', false],
    ['2101-01-01', false],
    ['0001-01-01', false],
    ['9999-12-31', false],
    ['2024-02-29', true],
    ['2026-02-30', false],
    ['2026-02-29', false],
    ['2026-13-01', false],
    ['2026-00-10', false],
    ['2026-10-00', false],
    ['2026-1-2', false],
    ['26-10-12', false],
    ['2026-10-12T00:00:00.000Z', false],
    ['2026-10-12 ', false],
    [' 2026-10-12', false],
    ['', false],
  ])('%s is valid: %s', (value, valid) => {
    expect(calendarDateSchema.safeParse(value).success).toBe(valid)
  })

  test('the API and the CSV give the same verdict on a date', () => {
    for (const value of ['0001-01-01', '1969-12-31', '1970-01-01', '2100-12-31', '2101-01-01']) {
      expect(calendarDateSchema.safeParse(value).success).toBe(parseClosedAtCell(value).ok)
    }
  })

  test('closedAt on a Deal and on the Outcome request is a date, not a timestamp', () => {
    const outcome = (closedAt: unknown) =>
      setDealOutcomeRequestSchema.safeParse({ outcome: 'won', closedAt }).success
    expect(outcome('2026-10-12')).toBe(true)
    expect(outcome(null)).toBe(true)
    expect(outcome('2026-10-12T00:00:00.000Z')).toBe(false)
    expect(outcome('2026-02-30')).toBe(false)
    expect(dealSchema.shape.closedAt.safeParse('2026-10-12').success).toBe(true)
    expect(dealSchema.shape.closedAt.safeParse('2026-10-12T00:00:00.000Z').success).toBe(false)
  })
})
