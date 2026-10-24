import { z } from 'zod'
import { PLAYBOOK_WRITE_ROLES, type PlaybookRoute } from './routes'

/**
 * The learning switch of an Organization's Playbook: whether Moments written by an Agent
 * (origin `agent`) feed Suggestions. On by default; an Organization that never set it has it on.
 */
export const learningSettingsSchema = z.strictObject({
  learnFromAgentMoments: z.boolean(),
})

/** The learning switch of an Organization's Playbook. */
export type LearningSettings = z.infer<typeof learningSettingsSchema>

/** The body of a request to set the learning switch; it replaces the setting, so a repeat changes nothing. */
export const setLearningSettingsRequestSchema = z.strictObject({
  learnFromAgentMoments: z.boolean(),
})

/** The body of a request to set the learning switch. */
export type SetLearningSettingsRequest = z.infer<typeof setLearningSettingsRequestSchema>

/** The learning route names. */
export type LearningRouteName = 'getLearningSettings' | 'setLearningSettings'

/** One learning route: the shape of a Playbook route, with a PUT beside the GET. */
export type LearningRoute = Omit<PlaybookRoute, 'method'> & { readonly method: 'GET' | 'PUT' }

const route = (definition: LearningRoute): LearningRoute => Object.freeze(definition)

/** The learning switch routes. Owner and Admin only, for reading and setting. */
export const LEARNING_ROUTES: Readonly<Record<LearningRouteName, LearningRoute>> = Object.freeze({
  getLearningSettings: route({
    method: 'GET',
    path: '/playbook/settings/learning',
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: [],
    commonErrors: [],
    description:
      'Reads the learning switch: learnFromAgentMoments, whether Moments written by an Agent feed Suggestions. An Organization that never set it has it on (true). Owner and Admin only.',
  }),
  setLearningSettings: route({
    method: 'PUT',
    path: '/playbook/settings/learning',
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      'Sets the learning switch. The body {"learnFromAgentMoments"} replaces the setting, so it is idempotent by end state: the same body again answers 200 with the same setting. A malformed body is request.invalid. Turning it off stops new Suggestions from using Agent-origin Moments and removes nothing already learned. Owner and Admin only.',
  }),
})
