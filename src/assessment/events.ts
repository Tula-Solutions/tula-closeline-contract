import { z } from 'zod'
import { agentKindSchema } from '../agent/instruction'
import { timestampSchema } from '../core/values'
import { defineEvent } from '../events'
import { assessmentIdSchema, prospectIdSchema } from '../ids'
import {
  assessmentSubjectSchema,
  assessmentVerdictSchema,
  findingCategorySchema,
  MAX_FINDING_CATEGORIES,
  MAX_FINDINGS,
} from './values'

/**
 * `assessment.completed` (version 1): an Assessment of one Draft or Call turn finished. Ids and
 * labels only: the subject, the verdict, how many findings and which categories. No text of the
 * turn and no explanation.
 */
export const assessmentCompletedEvent = defineEvent(
  'assessment.completed',
  1,
  z
    .strictObject({
      assessmentId: assessmentIdSchema,
      subject: assessmentSubjectSchema,
      prospectId: prospectIdSchema.nullable(),
      agentKind: agentKindSchema,
      instructionVersion: z.number().int().min(1).nullable(),
      verdict: assessmentVerdictSchema,
      findingCount: z.number().int().min(0).max(MAX_FINDINGS),
      categories: z.array(findingCategorySchema).max(MAX_FINDING_CATEGORIES),
      completedAt: timestampSchema,
    })
    .superRefine((data, ctx) => {
      if (new Set(data.categories).size !== data.categories.length) {
        ctx.addIssue({ code: 'custom', path: ['categories'], message: 'Categories are unique' })
      }
      if ((data.findingCount === 0) !== (data.categories.length === 0)) {
        ctx.addIssue({
          code: 'custom',
          path: ['categories'],
          message: 'Categories are listed exactly when there are findings',
        })
      }
      if (data.verdict === 'pass' && data.findingCount > 0) {
        ctx.addIssue({ code: 'custom', path: ['findingCount'], message: 'A pass has no findings' })
      }
      if (data.verdict === 'fail' && data.findingCount === 0) {
        ctx.addIssue({ code: 'custom', path: ['findingCount'], message: 'A fail has a finding' })
      }
    })
)

/** Every Assessment event, by type. */
export const ASSESSMENT_EVENTS = {
  'assessment.completed': assessmentCompletedEvent,
} as const

/** The type of an Assessment event. */
export type AssessmentEventType = keyof typeof ASSESSMENT_EVENTS
