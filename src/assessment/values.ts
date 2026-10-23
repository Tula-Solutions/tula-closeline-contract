import { z } from 'zod'
import { agentKindSchema } from '../agent/instruction'
import { analyticsRangeShape, checkAnalyticsRange, rateValueSchema } from '../analytics/values'
import { timestampSchema } from '../core/values'
import {
  assessmentIdSchema,
  callIdSchema,
  draftIdSchema,
  findingIdSchema,
  prospectIdSchema,
} from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { calendarDateSchema } from '../playbook/deal-values'

/** What an Assessment decided about a turn. A closed list. */
export const ASSESSMENT_VERDICTS = ['pass', 'warn', 'fail'] as const

/** What an Assessment decided about a turn. */
export const assessmentVerdictSchema = z.enum(ASSESSMENT_VERDICTS)

/** What an Assessment decided about a turn. */
export type AssessmentVerdict = z.infer<typeof assessmentVerdictSchema>

/** What a finding is about. A closed list. */
export const FINDING_CATEGORIES = [
  'unsupported_claim',
  'policy_deviation',
  'missing_disclosure',
  'tone',
] as const

/** What a finding is about. */
export const findingCategorySchema = z.enum(FINDING_CATEGORIES)

/** What a finding is about. */
export type FindingCategory = z.infer<typeof findingCategorySchema>

/** How serious a finding is. A closed list, worst last. */
export const FINDING_SEVERITIES = ['low', 'medium', 'high'] as const

/** How serious a finding is. */
export const findingSeveritySchema = z.enum(FINDING_SEVERITIES)

/** How serious a finding is. */
export type FindingSeverity = z.infer<typeof findingSeveritySchema>

/** What an Assessment judged. A closed list. */
export const ASSESSMENT_SUBJECT_KINDS = ['draft', 'call_turn'] as const

/** What an Admin says about a finding. A closed list. */
export const FINDING_FEEDBACKS = ['correct', 'false_alarm'] as const

/** What an Admin says about a finding. */
export const findingFeedbackSchema = z.enum(FINDING_FEEDBACKS)

/** The most findings one Assessment holds. */
export const MAX_FINDINGS = 50

/** The longest explanation of a finding, in characters. */
export const MAX_FINDING_EXPLANATION_LENGTH = 500

/** The largest offset a span may reach, in characters: a Draft or a turn is far shorter. */
export const MAX_FINDING_SPAN_OFFSET = 20_000

/** The most categories an Assessment event lists. */
export const MAX_FINDING_CATEGORIES = FINDING_CATEGORIES.length

/** How the Assessment list is ordered: newest first, or flagged turns first by severity. */
export const ASSESSMENT_SORTS = ['newest', 'worst_first'] as const

/**
 * The offending part of a turn, as character offsets (start included, end excluded). The finding
 * holds the span and a short explanation, never the text itself.
 */
export const findingSpanSchema = z
  .strictObject({
    start: z.number().int().min(0).max(MAX_FINDING_SPAN_OFFSET),
    end: z.number().int().min(1).max(MAX_FINDING_SPAN_OFFSET),
  })
  .refine((span) => span.end > span.start, {
    message: 'A span ends after it starts',
    path: ['end'],
  })

/**
 * One finding: category, severity, the span and a short explanation. There is no body or text
 * field: the offending sentence is read from the Draft or Call by the span. The explanation is
 * model output, untrusted data.
 */
export const findingSchema = z.strictObject({
  id: findingIdSchema,
  category: findingCategorySchema,
  severity: findingSeveritySchema,
  span: findingSpanSchema,
  explanation: z.string().trim().min(1).max(MAX_FINDING_EXPLANATION_LENGTH),
  feedback: findingFeedbackSchema.nullable(),
})

/** One finding. */
export type Finding = z.infer<typeof findingSchema>

/** What was judged: a Draft before release, or one turn of a Call after it. */
export const assessmentSubjectSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('draft'), draftId: draftIdSchema }),
  z.strictObject({
    kind: z.literal('call_turn'),
    callId: callIdSchema,
    turnIndex: z.number().int().min(0).max(100_000),
  }),
])

/** What was judged. */
export type AssessmentSubject = z.infer<typeof assessmentSubjectSchema>

/** Who judged: the model or the fixed rules (disclosure, consent). */
export const assessmentJudgeSourceSchema = z.enum(['model', 'rules'])

/**
 * One Assessment. A `pass` has no findings and a `fail` has at least one; a `warn` may have any
 * number. Findings carry spans and explanations, never the text of the turn.
 */
export const assessmentSchema = z
  .strictObject({
    id: assessmentIdSchema,
    subject: assessmentSubjectSchema,
    prospectId: prospectIdSchema.nullable(),
    agentKind: agentKindSchema,
    instructionVersion: z.number().int().min(1).nullable(),
    verdict: assessmentVerdictSchema,
    findings: z.array(findingSchema).max(MAX_FINDINGS),
    judgeSource: assessmentJudgeSourceSchema.optional(),
    createdAt: timestampSchema,
  })
  .superRefine((assessment, ctx) => {
    if (assessment.verdict === 'pass' && assessment.findings.length > 0) {
      ctx.addIssue({ code: 'custom', path: ['findings'], message: 'A pass has no findings' })
    }
    if (assessment.verdict === 'fail' && assessment.findings.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['findings'], message: 'A fail has a finding' })
    }
  })

/** One Assessment. */
export type Assessment = z.infer<typeof assessmentSchema>

/** The request to mark a finding correct or a false alarm. Repeating it with the same value changes nothing. */
export const giveFindingFeedbackRequestSchema = z.strictObject({ feedback: findingFeedbackSchema })

/** The request to mark a finding. */
export type GiveFindingFeedbackRequest = z.infer<typeof giveFindingFeedbackRequestSchema>

/** The query of the Assessment list: a cursor page, filters, and an optional date range (both days or neither). */
export const listAssessmentsQuerySchema = pageQuerySchema
  .extend({
    verdict: assessmentVerdictSchema.optional(),
    category: findingCategorySchema.optional(),
    agentKind: agentKindSchema.optional(),
    from: analyticsRangeShape.from.optional(),
    to: analyticsRangeShape.to.optional(),
    sort: z.enum(ASSESSMENT_SORTS).default('newest'),
  })
  .superRefine((query, ctx) => {
    if ((query.from === undefined) !== (query.to === undefined)) {
      ctx.addIssue({ code: 'custom', path: ['to'], message: 'Give both from and to, or neither' })
    }
    checkAnalyticsRange(query, ctx)
  })

/** The query of the Assessment list. */
export type ListAssessmentsQuery = z.infer<typeof listAssessmentsQuerySchema>

/** One page of Assessments. */
export const listAssessmentsResponseSchema = pageSchema(assessmentSchema)

/** The query of the weekly failed rate: a required date range of at most 13 months, an optional Agent kind, and a cursor and limit (at most 100). */
export const getAssessmentRatesQuerySchema = z
  .object({ ...analyticsRangeShape, agentKind: agentKindSchema.optional() })
  .extend(pageQuerySchema.shape)
  .superRefine((query, ctx) => checkAnalyticsRange(query, ctx))

/** The query of the weekly failed rate. */
export type GetAssessmentRatesQuery = z.infer<typeof getAssessmentRatesQuerySchema>

/** An ISO week as `YYYY-Www`, such as `2026-W43`. */
export const isoWeekSchema = z.string().regex(/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/)

const rateItem = {
  week: isoWeekSchema,
  weekStart: calendarDateSchema,
  agentKind: agentKindSchema,
  instructionVersion: z.number().int().min(1).nullable(),
} as const

/** The share of Assessments that failed in one ISO week, for one Agent kind and instruction version. `recordCount` is the Assessments judged; below 20 the state is `not_enough_data`. */
export const assessmentRateItemSchema = z.union([
  rateValueSchema.options[0].extend(rateItem),
  rateValueSchema.options[1].extend(rateItem),
])

/** One weekly rate. */
export type AssessmentRateItem = z.infer<typeof assessmentRateItemSchema>

/** The answer to a weekly-rate read: one cursor-paginated page of at most 100 items, oldest week first. */
export const getAssessmentRatesResponseSchema = z.strictObject({
  ...analyticsRangeShape,
  ...pageSchema(assessmentRateItemSchema).shape,
})

/** The answer to a weekly-rate read. */
export type GetAssessmentRatesResponse = z.infer<typeof getAssessmentRatesResponseSchema>
