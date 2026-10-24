import { describe, expect, test } from 'bun:test'
import { ERRORS } from '../errors'
import {
  ALL_PLAYBOOK_ROUTES,
  LEARNING_ROUTES,
  learningSettingsSchema,
  setLearningSettingsRequestSchema,
} from './index'

describe('learning switch', () => {
  test('the setting is one boolean, strictly', () => {
    expect(learningSettingsSchema.parse({ learnFromAgentMoments: true })).toEqual({
      learnFromAgentMoments: true,
    })
    expect(learningSettingsSchema.safeParse({ learnFromAgentMoments: 'yes' }).success).toBe(false)
    expect(learningSettingsSchema.safeParse({}).success).toBe(false)
    expect(
      learningSettingsSchema.safeParse({ learnFromAgentMoments: true, extra: 1 }).success
    ).toBe(false)
  })

  test('a set request needs the boolean and nothing else', () => {
    expect(
      setLearningSettingsRequestSchema.safeParse({ learnFromAgentMoments: false }).success
    ).toBe(true)
    expect(setLearningSettingsRequestSchema.safeParse({}).success).toBe(false)
    expect(
      setLearningSettingsRequestSchema.safeParse({ learnFromAgentMoments: true, x: 1 }).success
    ).toBe(false)
  })

  test('routes are a GET and a PUT, Owner and Admin only, merged into the Playbook table', () => {
    expect(LEARNING_ROUTES.getLearningSettings.method).toBe('GET')
    expect(LEARNING_ROUTES.setLearningSettings.method).toBe('PUT')
    const known = new Set<string>(Object.values(ERRORS).map((e) => e.code))
    for (const [name, r] of Object.entries(LEARNING_ROUTES)) {
      expect(ALL_PLAYBOOK_ROUTES[name as keyof typeof LEARNING_ROUTES]).toBe(r)
      expect(r.path).toBe('/playbook/settings/learning')
      expect(r.roles).toEqual(['owner', 'admin'])
      expect(r.internal).toBe(false)
      expect(r.description).toContain('Owner and Admin only')
      for (const code of r.commonErrors) {
        expect(known.has(code)).toBe(true)
      }
    }
  })
})
