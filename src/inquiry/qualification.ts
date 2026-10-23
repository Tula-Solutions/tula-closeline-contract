import { z } from 'zod'
import { qualificationQuestionIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { boundedTextSchema } from '../prospect/values'

/** The kinds of Qualification question: free text, one choice from a list, a number, or yes or no. */
export const QUALIFICATION_QUESTION_KINDS = ['free_text', 'choice', 'number', 'yes_no'] as const

/** The kind of a Qualification question. */
export const qualificationQuestionKindSchema = z.enum(QUALIFICATION_QUESTION_KINDS)

/** The kind of a Qualification question. */
export type QualificationQuestionKind = z.infer<typeof qualificationQuestionKindSchema>

/** The most Qualification questions an Organization may keep. */
export const MAX_QUALIFICATION_QUESTIONS = 50

/** The longest prompt of a Qualification question, in characters. */
export const MAX_QUESTION_PROMPT_LENGTH = 500

/** The longest choice or text answer, in characters. */
export const MAX_ANSWER_LENGTH = 500

/** The fewest and most choices a `choice` question offers. */
export const MIN_QUESTION_CHOICES = 2
/** The most choices a `choice` question offers. */
export const MAX_QUESTION_CHOICES = 10

/** The most skip conditions one question may carry. */
export const MAX_SKIP_CONDITIONS = 5

/** The most suggestions one request for suggested questions returns. */
export const MAX_QUESTION_SUGGESTIONS = 10

/** The wording of a Qualification question: bounded text with no control character. */
export const questionPromptSchema = boundedTextSchema(MAX_QUESTION_PROMPT_LENGTH)

/** The value of a Qualification answer or a skip comparison: text, a number or a yes or no. */
export const qualificationValueSchema = z.union([
  boundedTextSchema(MAX_ANSWER_LENGTH),
  z.number().finite(),
  z.boolean(),
])

/** The value of a Qualification answer or a skip comparison. */
export type QualificationValue = z.infer<typeof qualificationValueSchema>

/** The tests a skip condition makes of an earlier answer. */
export const SKIP_OPERATORS = [
  'equals',
  'not_equals',
  'greater_than',
  'less_than',
  'answered',
  'not_answered',
] as const

/** A test a skip condition makes of an earlier answer. */
export const skipOperatorSchema = z.enum(SKIP_OPERATORS)

/**
 * One condition of the skip logic: a test of the answer to an earlier question. `answered` and
 * `not_answered` take no value; every other operator needs one. The service refuses a condition
 * that names an unknown question, the question itself, or a later question (a cycle) as
 * `agent.question_invalid`.
 */
export const skipConditionSchema = z
  .strictObject({
    questionId: qualificationQuestionIdSchema,
    operator: skipOperatorSchema,
    value: qualificationValueSchema.optional(),
  })
  .refine(
    (c) => (c.operator === 'answered' || c.operator === 'not_answered') === (c.value === undefined),
    { message: 'Only answered and not_answered take no value', path: ['value'] }
  )

/** One condition of the skip logic. */
export type SkipCondition = z.infer<typeof skipConditionSchema>

const choicesSchema = z
  .array(boundedTextSchema(MAX_ANSWER_LENGTH))
  .min(MIN_QUESTION_CHOICES)
  .max(MAX_QUESTION_CHOICES)
  .refine((choices) => new Set(choices).size === choices.length, 'No repeats')

const skipWhenSchema = z.array(skipConditionSchema).max(MAX_SKIP_CONDITIONS)

type QuestionShape = { kind: QualificationQuestionKind; choices: string[] | null }

const choicesMatchKind = (q: QuestionShape) => (q.kind === 'choice') === (q.choices !== null)
const CHOICES_ISSUE = {
  message: 'Only a choice question has choices, and it must',
  path: ['choices'],
}

/**
 * A Qualification question an Admin wrote for the Inbound Agent to ask. `position` orders the
 * questions from 1. The question is skipped when every condition of `skipWhen` holds (an empty list
 * never skips). The questions feed routing as Prospect attributes; a question's wording is
 * tenant data and untrusted for display.
 */
export const qualificationQuestionSchema = z
  .strictObject({
    id: qualificationQuestionIdSchema,
    position: z.number().int().min(1).max(MAX_QUALIFICATION_QUESTIONS),
    prompt: questionPromptSchema,
    kind: qualificationQuestionKindSchema,
    choices: choicesSchema.nullable(),
    required: z.boolean(),
    skipWhen: skipWhenSchema,
  })
  .refine(choicesMatchKind, CHOICES_ISSUE)

/** A Qualification question. */
export type QualificationQuestion = z.infer<typeof qualificationQuestionSchema>

/** The path parameters of a request about one Qualification question. */
export const qualificationQuestionParamsSchema = z.strictObject({
  questionId: qualificationQuestionIdSchema,
})

/** The body of a request to write a Qualification question; it goes last unless `position` says otherwise. */
export const createQualificationQuestionRequestSchema = z
  .strictObject({
    prompt: questionPromptSchema,
    kind: qualificationQuestionKindSchema,
    choices: choicesSchema.nullable().default(null),
    required: z.boolean().default(false),
    skipWhen: skipWhenSchema.default([]),
    position: z.number().int().min(1).max(MAX_QUALIFICATION_QUESTIONS).optional(),
  })
  .refine(choicesMatchKind, CHOICES_ISSUE)

/** The body of a request to write a Qualification question. */
export type CreateQualificationQuestionRequest = z.infer<
  typeof createQualificationQuestionRequestSchema
>

/** The body of a request to replace a Qualification question's content; the position changes by reorder. */
export const updateQualificationQuestionRequestSchema = z
  .strictObject({
    prompt: questionPromptSchema,
    kind: qualificationQuestionKindSchema,
    choices: choicesSchema.nullable(),
    required: z.boolean(),
    skipWhen: skipWhenSchema,
  })
  .refine(choicesMatchKind, CHOICES_ISSUE)

/** The body of a request to replace a Qualification question. */
export type UpdateQualificationQuestionRequest = z.infer<
  typeof updateQualificationQuestionRequestSchema
>

/** The body of a request to reorder the questions: every id once, in the new order. */
export const reorderQualificationQuestionsRequestSchema = z.strictObject({
  questionIds: z
    .array(qualificationQuestionIdSchema)
    .min(1)
    .max(MAX_QUALIFICATION_QUESTIONS)
    .refine((ids) => new Set(ids).size === ids.length, 'Each question once'),
})

/** The query parameters of a request to list questions, in order of position. */
export const listQualificationQuestionsQuerySchema = pageQuerySchema.strict()

/** One page of Qualification questions. */
export const qualificationQuestionPageSchema = pageSchema(qualificationQuestionSchema)

/** A suggested question, drawn from the Organization's won Deals; an Admin approves it by creating it. It has no id and is not stored. */
export const suggestedQualificationQuestionSchema = z
  .strictObject({
    prompt: questionPromptSchema,
    kind: qualificationQuestionKindSchema,
    choices: choicesSchema.nullable(),
  })
  .refine(choicesMatchKind, CHOICES_ISSUE)

/** A suggested question. */
export type SuggestedQualificationQuestion = z.infer<typeof suggestedQualificationQuestionSchema>

/** The answer to a request for suggestions: at most ten, not stored. */
export const questionSuggestionsSchema = z.strictObject({
  items: z.array(suggestedQualificationQuestionSchema).max(MAX_QUESTION_SUGGESTIONS),
})

/**
 * One answer of a Qualification. `value` is null when the question was skipped by its skip logic or
 * the Prospect declined; `skipped` says which of the two cases a null is.
 */
export const qualificationAnswerSchema = z
  .strictObject({
    questionId: qualificationQuestionIdSchema,
    value: qualificationValueSchema.nullable(),
    skipped: z.boolean(),
  })
  .refine((a) => !a.skipped || a.value === null, {
    message: 'A skipped question has no value',
    path: ['value'],
  })

/** One answer of a Qualification. */
export type QualificationAnswer = z.infer<typeof qualificationAnswerSchema>

/** The longest Qualification summary, in characters. */
export const MAX_QUALIFICATION_SUMMARY_LENGTH = 2000

/**
 * The Qualification of an Inquiry: the answers so far and a short summary (null until the Agent
 * writes one). It is tenant data about a Prospect, and untrusted text: it came from the Prospect.
 */
export const qualificationSchema = z.strictObject({
  answers: z
    .array(qualificationAnswerSchema)
    .max(MAX_QUALIFICATION_QUESTIONS)
    .refine((a) => new Set(a.map((x) => x.questionId)).size === a.length, 'Each question once'),
  summary: boundedTextSchema(MAX_QUALIFICATION_SUMMARY_LENGTH).nullable(),
})

/** The Qualification of an Inquiry. */
export type Qualification = z.infer<typeof qualificationSchema>
