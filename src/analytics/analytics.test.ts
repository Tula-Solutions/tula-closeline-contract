import { describe, expect, test } from 'bun:test'
import { id, NOW } from '../core/fixtures'
import { ERRORS } from '../errors'
import { MAX_PAGE_SIZE } from '../pagination'
import {
  ANALYTICS_ERRORS,
  ANALYTICS_RANGE_ISSUE_MESSAGE,
  ANALYTICS_RATE_METRICS,
  ANALYTICS_ROUTES,
  conversationSummarySchema,
  countValueSchema,
  dateRangeSchema,
  dealAttributionSchema,
  getSeriesQuerySchema,
  getSeriesResponseSchema,
  isAnalyticsRangeTooLarge,
  lastAllowedAnalyticsDay,
  listSourcePerformanceQuerySchema,
  listTableQuerySchema,
  metricValueSchema,
  rateValueSchema,
  sourcePerformanceSchema,
  tableCsvQuerySchema,
  tableRowSchema,
  touchSchema,
} from './index'

const moment = { kind: 'moment', callId: id('call'), dealRecordId: id('deal') }

describe('date range', () => {
  test('the last allowed day is 13 months minus a day', () => {
    expect(lastAllowedAnalyticsDay('2026-01-01')).toBe('2027-01-31')
    expect(lastAllowedAnalyticsDay('2025-01-31')).toBe('2026-02-27')
    expect(lastAllowedAnalyticsDay('2024-02-29')).toBe('2025-03-28')
  })

  test('refuses a range that is wider than 13 months or backwards', () => {
    expect(isAnalyticsRangeTooLarge('2026-01-01', '2027-01-31')).toBe(false)
    expect(isAnalyticsRangeTooLarge('2026-01-01', '2027-02-01')).toBe(true)
    expect(isAnalyticsRangeTooLarge('2026-02-02', '2026-02-01')).toBe(true)
    expect(isAnalyticsRangeTooLarge('2026-02-01', '2026-02-01')).toBe(false)
  })

  test('the schema fails a wide range with the code as the issue message on `to`', () => {
    const result = dateRangeSchema.safeParse({ from: '2026-01-01', to: '2027-02-01' })
    expect(result.success).toBe(false)
    const issue = result.error?.issues[0]
    expect(issue?.message).toBe(ANALYTICS_RANGE_ISSUE_MESSAGE)
    expect(issue?.path).toEqual(['to'])
    expect(dateRangeSchema.safeParse({ from: '2026-01-01', to: '2027-01-31' }).success).toBe(true)
  })

  test('refuses a day that does not exist', () => {
    expect(dateRangeSchema.safeParse({ from: '2026-02-30', to: '2026-03-01' }).success).toBe(false)
    expect(
      dateRangeSchema.safeParse({ from: '2026-03-01', to: '2026-03-01T00:00:00Z' }).success
    ).toBe(false)
  })

  test('every ranged query enforces it', () => {
    const wide = { from: '2026-01-01', to: '2027-02-01' }
    expect(getSeriesQuerySchema.safeParse({ metric: 'sends', ...wide }).success).toBe(false)
    expect(listTableQuerySchema.safeParse({ groupBy: 'campaign', ...wide }).success).toBe(false)
    expect(tableCsvQuerySchema.safeParse({ groupBy: 'rep', ...wide }).success).toBe(false)
  })
})

describe('queries', () => {
  const range = { from: '2026-09-01', to: '2026-10-01' }

  test('a series query takes a closed metric, split and filters', () => {
    const ok = getSeriesQuerySchema.safeParse({
      metric: 'positive_replies',
      groupBy: 'agent_kind',
      channel: 'email',
      agentKind: 'outbound',
      campaignId: id('cpg'),
      repMembershipId: id('mem'),
      ...range,
    })
    expect(ok.success).toBe(true)
    expect(getSeriesQuerySchema.safeParse({ metric: 'revenue', ...range }).success).toBe(false)
    expect(
      getSeriesQuerySchema.safeParse({ metric: 'sends', groupBy: 'team', ...range }).success
    ).toBe(false)
  })

  test('the table is paged and the CSV page is at most 1,000', () => {
    expect(listTableQuerySchema.safeParse({ groupBy: 'rep', ...range, limit: '100' }).success).toBe(
      true
    )
    expect(listTableQuerySchema.safeParse({ groupBy: 'rep', ...range, limit: '101' }).success).toBe(
      false
    )
    expect(tableCsvQuerySchema.parse({ groupBy: 'rep', ...range }).limit).toBe(1000)
    expect(tableCsvQuerySchema.safeParse({ groupBy: 'rep', ...range, limit: '1001' }).success).toBe(
      false
    )
    expect(listTableQuerySchema.safeParse({ groupBy: 'team', ...range }).success).toBe(false)
  })

  test('a table has one row per channel, Agent kind, Campaign or Rep', () => {
    for (const groupBy of ['channel', 'agent_kind', 'campaign', 'rep']) {
      expect(listTableQuerySchema.safeParse({ groupBy, ...range }).success).toBe(true)
      expect(tableCsvQuerySchema.safeParse({ groupBy, ...range }).success).toBe(true)
    }
  })

  test('a series can chart a ratio metric, which is a rate and never a count', () => {
    for (const metric of ANALYTICS_RATE_METRICS) {
      expect(getSeriesQuerySchema.safeParse({ metric, ...range }).success).toBe(true)
    }
    expect(ANALYTICS_RATE_METRICS).toEqual([
      'reply_rate',
      'positive_reply_rate',
      'meeting_rate',
      'win_rate',
    ])
    const few = {
      day: '2026-09-01',
      kind: 'rate',
      state: 'not_enough_data',
      value: null,
      recordCount: 4,
    }
    const response = {
      metric: 'reply_rate',
      groupBy: null,
      ...range,
      series: [{ group: null, points: [few] }],
      nextCursor: null,
    }
    expect(getSeriesResponseSchema.safeParse(response).success).toBe(true)
  })

  test('the source list takes the one flag', () => {
    expect(listSourcePerformanceQuerySchema.safeParse({ flag: 'cited_often_lost' }).success).toBe(
      true
    )
    expect(listSourcePerformanceQuerySchema.safeParse({ flag: 'other' }).success).toBe(false)
  })
})

describe('values', () => {
  test('a count carries its record count', () => {
    expect(countValueSchema.safeParse({ kind: 'count', value: 3, recordCount: 3 }).success).toBe(
      true
    )
    expect(countValueSchema.safeParse({ kind: 'count', value: 3 }).success).toBe(false)
    expect(countValueSchema.safeParse({ kind: 'count', value: -1, recordCount: 0 }).success).toBe(
      false
    )
  })

  test('a rate is shown only from 20 records', () => {
    const ok = { kind: 'rate', state: 'ok', value: 0.25, recordCount: 20 }
    const few = { kind: 'rate', state: 'not_enough_data', value: null, recordCount: 19 }
    expect(rateValueSchema.safeParse(ok).success).toBe(true)
    expect(rateValueSchema.safeParse(few).success).toBe(true)
    expect(rateValueSchema.safeParse({ ...ok, recordCount: 19 }).success).toBe(false)
    expect(rateValueSchema.safeParse({ ...few, recordCount: 20 }).success).toBe(false)
    expect(rateValueSchema.safeParse({ ...few, value: 0.5 }).success).toBe(false)
    expect(rateValueSchema.safeParse({ ...ok, value: 1.5 }).success).toBe(false)
    expect(metricValueSchema.safeParse(ok).success).toBe(true)
  })

  test('a series is bounded and every point has a day and a record count', () => {
    const point = { day: '2026-09-01', kind: 'count', value: 2, recordCount: 2 }
    const response = {
      metric: 'sends',
      groupBy: 'channel',
      from: '2026-09-01',
      to: '2026-09-30',
      series: [{ group: 'email', points: [point] }],
      nextCursor: null,
    }
    expect(getSeriesResponseSchema.safeParse(response).success).toBe(true)
    const noCount = { day: '2026-09-01', kind: 'count', value: 2 }
    expect(
      getSeriesResponseSchema.safeParse({
        ...response,
        series: [{ group: null, points: [noCount] }],
      }).success
    ).toBe(false)
    const tooMany = Array.from({ length: 401 }, () => point)
    expect(
      getSeriesResponseSchema.safeParse({ ...response, series: [{ group: null, points: tooMany }] })
        .success
    ).toBe(false)
    const line = { group: 'email', points: [point] }
    const groups = (n: number) => Array.from({ length: n }, () => line)
    expect(getSeriesResponseSchema.safeParse({ ...response, series: groups(21) }).success).toBe(
      false
    )
    expect(
      getSeriesResponseSchema.safeParse({ ...response, series: groups(20), nextCursor: 'abc' })
        .success
    ).toBe(true)
  })

  test('a series query takes a cursor and at most 20 groups a page', () => {
    const base = { metric: 'sends', from: '2026-09-01', to: '2026-09-30' }
    expect(getSeriesQuerySchema.safeParse({ ...base, cursor: 'abc' }).success).toBe(true)
    expect(getSeriesQuerySchema.safeParse({ ...base, limit: '20' }).success).toBe(true)
    expect(getSeriesQuerySchema.safeParse({ ...base, limit: '21' }).success).toBe(false)
    expect(getSeriesQuerySchema.parse(base).limit).toBe(20)
  })
})

describe('table row', () => {
  const count = (value: number) => ({ kind: 'count', value, recordCount: value })
  const few = { kind: 'rate', state: 'not_enough_data', value: null, recordCount: 3 }
  const row = {
    group: 'email',
    sends: count(3),
    replies: count(1),
    positiveReplies: count(0),
    meetings: count(0),
    outcomesWon: count(0),
    outcomesLost: count(0),
    replyRate: few,
    positiveReplyRate: few,
    meetingRate: few,
    winRate: few,
  }

  test('a row has all four ratios, each a rate or not_enough_data', () => {
    expect(tableRowSchema.safeParse(row).success).toBe(true)
    const { meetingRate: _omitted, ...rest } = row
    expect(tableRowSchema.safeParse(rest).success).toBe(false)
    expect(tableRowSchema.safeParse({ ...row, meetingRate: count(1) }).success).toBe(false)
  })
})

describe('Attribution', () => {
  const touch = {
    kind: 'message',
    id: id('tch'),
    messageId: id('msg'),
    prospectId: id('prs'),
    occurredAt: NOW,
    credit: { firstTouch: true, lastTouch: false },
    sources: [moment],
  }

  test('a touch is a Message or a Call and holds no text', () => {
    expect(touchSchema.safeParse(touch).success).toBe(true)
    const { messageId: _omitted, ...rest } = touch
    expect(touchSchema.safeParse({ ...rest, kind: 'call', callId: id('call') }).success).toBe(true)
    expect(touchSchema.safeParse({ ...touch, body: 'hello' }).success).toBe(false)
    expect(touchSchema.safeParse({ ...touch, sources: Array(21).fill(moment) }).success).toBe(false)
  })

  test('a Deal shows first and last touch side by side and only won or lost', () => {
    const attribution = {
      dealRecordId: id('deal'),
      outcome: 'won',
      lookbackDays: 180,
      firstTouchId: id('tch'),
      lastTouchId: id('tch', 2),
      touches: { items: [touch], nextCursor: null },
    }
    expect(dealAttributionSchema.safeParse(attribution).success).toBe(true)
    expect(dealAttributionSchema.safeParse({ ...attribution, outcome: 'open' }).success).toBe(false)
    const tooMany = { items: Array(MAX_PAGE_SIZE + 1).fill(touch), nextCursor: null }
    expect(dealAttributionSchema.safeParse({ ...attribution, touches: tooMany }).success).toBe(
      false
    )
  })
})

describe('source performance', () => {
  const row = (touched: number, won: number, winRate: unknown) => ({
    source: moment,
    dealsTouched: touched,
    dealsWon: won,
    recordCount: touched,
    winRate,
    flag: null,
  })

  test('a win rate needs 20 Deals', () => {
    expect(
      sourcePerformanceSchema.safeParse(row(20, 5, { state: 'ok', value: 0.25 })).success
    ).toBe(true)
    expect(
      sourcePerformanceSchema.safeParse(row(19, 5, { state: 'ok', value: 0.26 })).success
    ).toBe(false)
    expect(
      sourcePerformanceSchema.safeParse(row(19, 5, { state: 'not_enough_data', value: null }))
        .success
    ).toBe(true)
    expect(
      sourcePerformanceSchema.safeParse(row(20, 5, { state: 'not_enough_data', value: null }))
        .success
    ).toBe(false)
  })

  test('won cannot exceed touched and the record count is the Deals touched', () => {
    expect(
      sourcePerformanceSchema.safeParse(row(2, 3, { state: 'not_enough_data', value: null }))
        .success
    ).toBe(false)
    expect(
      sourcePerformanceSchema.safeParse({
        ...row(2, 1, { state: 'not_enough_data', value: null }),
        recordCount: 3,
      }).success
    ).toBe(false)
  })
})

describe('Conversation summary', () => {
  const summary = {
    conversationId: id('cnv'),
    summary: 'Asked about pricing. Booked a demo.',
    outcomeLabel: 'meeting_booked',
    generatedAt: NOW,
  }

  test('is bounded, labelled from a closed list and holds nothing else', () => {
    expect(conversationSummarySchema.safeParse(summary).success).toBe(true)
    expect(
      conversationSummarySchema.safeParse({ ...summary, summary: 'x'.repeat(501) }).success
    ).toBe(false)
    expect(conversationSummarySchema.safeParse({ ...summary, outcomeLabel: 'happy' }).success).toBe(
      false
    )
    expect(conversationSummarySchema.safeParse({ ...summary, body: 'raw' }).success).toBe(false)
  })
})

describe('errors and routes', () => {
  test('codes are in area.reason form and do not repeat a common one', () => {
    for (const entry of Object.values(ANALYTICS_ERRORS)) {
      expect(entry.code).toMatch(/^analytics\.[a-z_]+$/)
      expect(entry.code in ERRORS).toBe(false)
    }
    expect(ANALYTICS_ERRORS['analytics.range_too_large'].status).toBe(422)
  })

  test('every route is a GET with known codes, and range routes name the range code', () => {
    const routes = Object.entries(ANALYTICS_ROUTES)
    expect(routes.length).toBe(6)
    const known = new Set<string>(
      [...Object.values(ANALYTICS_ERRORS), ...Object.values(ERRORS)].map((e) => e.code)
    )
    for (const [, r] of routes) {
      expect(r.method).toBe('GET')
      expect(r.path.startsWith('/v1/')).toBe(true)
      expect(r.description.length).toBeGreaterThan(40)
      for (const code of [...r.errors, ...r.commonErrors]) {
        expect(known.has(code)).toBe(true)
      }
    }
    for (const name of ['getSeries', 'listTable', 'downloadTableCsv'] as const) {
      expect(ANALYTICS_ROUTES[name].errors).toEqual(['analytics.range_too_large'])
      expect(ANALYTICS_ROUTES[name].description).toContain('13 calendar months')
    }
    const keys = routes.map(([, r]) => `${r.method} ${r.path}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  test('descriptions state the role scope, never 403 for not found, and the 1,000 CSV page', () => {
    expect(ANALYTICS_ROUTES.getSeries.description).toContain('a Rep sees only their own')
    expect(ANALYTICS_ROUTES.getSeries.description).toContain('never 403')
    expect(ANALYTICS_ROUTES.downloadTableCsv.description).toContain('x-next-cursor')
    expect(ANALYTICS_ROUTES.getConversationSummary.description).toContain('never a Message body')
    expect(Object.isFrozen(ANALYTICS_ROUTES)).toBe(true)
  })
})
