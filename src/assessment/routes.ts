import type { AnalyticsErrorCode } from '../analytics/errors'
import { type InboundRoute, inboundRoute } from '../inbound-route'
import type { Role } from '../tenancy'
import type { AssessmentErrorCode } from './errors'

/** The roles that read Assessments: Owner and Admin all, a Manager their Team's, a Rep the Assessment of a Draft they can see. */
export const ASSESSMENT_READ_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The roles that list across the Organization, read the rates and mark findings. */
export const ASSESSMENT_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The Assessment route names. */
export type AssessmentRouteName =
  | 'listAssessments'
  | 'getAssessment'
  | 'giveFindingFeedback'
  | 'getAssessmentRates'

/** One Assessment route. */
export type AssessmentRoute = InboundRoute<AssessmentErrorCode | AnalyticsErrorCode>

const NO_TEXT =
  'A finding holds a category, a severity, a character span and a short explanation, never the text of the Draft or the Call turn.'

/**
 * The Assessment routes (spec M15). Core owns them. An Assessment is made by the system after an
 * Agent turn; there is no route to create, change or delete one.
 */
export const ASSESSMENT_ROUTES: Readonly<Record<AssessmentRouteName, AssessmentRoute>> =
  Object.freeze({
    listAssessments: inboundRoute({
      method: 'GET',
      path: '/v1/assessments',
      roles: ['owner', 'admin', 'manager'],
      success: [200],
      idempotent: false,
      errors: ['analytics.range_too_large'],
      commonErrors: ['request.invalid'],
      description: `Lists Assessments, one cursor-paginated page at a time (at most 100), filtered by verdict, finding category, Agent kind and a date range (from and to together, at most 13 months, else analytics.range_too_large (422)). sort=newest (the default) or worst_first, which puts flagged turns first by severity. Owner and Admin see all; a Manager only those of their Team's Prospects; a Rep none here (auth.forbidden) and reads the Assessment of a Draft they can see with getAssessment. ${NO_TEXT}`,
    }),
    getAssessment: inboundRoute({
      method: 'GET',
      path: '/v1/assessments/{assessmentId}',
      roles: ASSESSMENT_READ_ROLES,
      success: [200],
      idempotent: false,
      errors: ['assessment.not_found'],
      commonErrors: [],
      description: `Reads one Assessment with its findings. The service enforces the view: a Rep may read only the Assessment of a Draft they can see (their own Prospects'), a Manager their Team's. One outside the caller's view, or of another Organization, is assessment.not_found (404), never 403. ${NO_TEXT}`,
    }),
    giveFindingFeedback: inboundRoute({
      method: 'POST',
      path: '/v1/assessments/{assessmentId}/findings/{findingId}/feedback',
      roles: ASSESSMENT_ADMIN_ROLES,
      success: [200],
      idempotent: true,
      errors: ['assessment.not_found'],
      commonErrors: [
        'request.invalid',
        'request.idempotency_key_reused',
        'request.idempotency_in_progress',
      ],
      description:
        'Marks a finding correct or a false alarm, so the checks can be measured. The body is feedback: correct or false_alarm. Setting the same value again changes nothing, and a different value replaces the last. Answers the finding. An unknown finding or Assessment, or one of another Organization, is assessment.not_found (404), never 403. Owner and Admin only. Accepts an Idempotency-Key header.',
    }),
    getAssessmentRates: inboundRoute({
      method: 'GET',
      path: '/v1/assessment-rates',
      roles: ASSESSMENT_ADMIN_ROLES,
      success: [200],
      idempotent: false,
      errors: ['analytics.range_too_large'],
      commonErrors: ['request.invalid'],
      description:
        'Reads the weekly rate of failed Assessments, per ISO week, Agent kind and instruction version, so an Admin sees whether a change helped. Each item carries recordCount, the Assessments judged that week; below 20 the state is not_enough_data with a null value. The range (from, to) spans at most 13 calendar months, else analytics.range_too_large (422). At most 2,000 items. Owner and Admin only.',
    }),
  })
