import { describe, expect, test } from 'bun:test'
import {
  agentInstructionVersionIdSchema,
  apiKeyIdSchema,
  assessmentIdSchema,
  auditEventIdSchema,
  brandVoiceIdSchema,
  briefIdSchema,
  callIdSchema,
  consentEventIdSchema,
  consentFormIdSchema,
  consentWordingIdSchema,
  contactCheckIdSchema,
  dealImportIdSchema,
  dealRecordIdSchema,
  demoRequestIdSchema,
  documentIdSchema,
  enrichmentRunIdSchema,
  enrichmentRunSetIdSchema,
  enrollmentEventIdSchema,
  eventIdSchema,
  exportJobIdSchema,
  findingIdSchema,
  fitCriterionIdSchema,
  formatId,
  idSchema,
  invitationIdSchema,
  membershipIdSchema,
  organizationIdSchema,
  playIdSchema,
  prospectCompanyIdSchema,
  prospectIdSchema,
  prospectImportIdSchema,
  prospectMergeIdSchema,
  requestIdSchema,
  signalIdSchema,
  suggestionIdSchema,
  suppressionEntryIdSchema,
  suppressionImportIdSchema,
  teamIdSchema,
  touchIdSchema,
  userIdSchema,
} from './ids'

const HEX = '0190a5e0b3c17d2a8f4e5b6c7d8e9f01'

const schemas = [
  ['ains', agentInstructionVersionIdSchema],
  ['aud', auditEventIdSchema],
  ['exp', exportJobIdSchema],
  ['akey', apiKeyIdSchema],
  ['asm', assessmentIdSchema],
  ['fnd', findingIdSchema],
  ['sgs', suggestionIdSchema],
  ['tch', touchIdSchema],
  ['brf', briefIdSchema],
  ['bvo', brandVoiceIdSchema],
  ['sig', signalIdSchema],
  ['erun', enrichmentRunIdSchema],
  ['erset', enrichmentRunSetIdSchema],
  ['fcr', fitCriterionIdSchema],
  ['ply', playIdSchema],
  ['eev', enrollmentEventIdSchema],
  ['org', organizationIdSchema],
  ['usr', userIdSchema],
  ['mem', membershipIdSchema],
  ['team', teamIdSchema],
  ['inv', invitationIdSchema],
  ['prs', prospectIdSchema],
  ['pco', prospectCompanyIdSchema],
  ['pimp', prospectImportIdSchema],
  ['pmrg', prospectMergeIdSchema],
  ['doc', documentIdSchema],
  ['call', callIdSchema],
  ['deal', dealRecordIdSchema],
  ['dimp', dealImportIdSchema],
  ['evt', eventIdSchema],
  ['req', requestIdSchema],
  ['dreq', demoRequestIdSchema],
  ['cev', consentEventIdSchema],
  ['cwd', consentWordingIdSchema],
  ['cfm', consentFormIdSchema],
  ['chk', contactCheckIdSchema],
  ['sup', suppressionEntryIdSchema],
  ['simp', suppressionImportIdSchema],
] as const

describe.each(schemas)('%s id schema', (prefix, schema) => {
  test('accepts its own prefix', () => {
    expect(schema.safeParse(`${prefix}_${HEX}`).success).toBe(true)
  })

  test('rejects every other prefix', () => {
    for (const [other] of schemas) {
      if (other !== prefix) {
        expect(schema.safeParse(`${other}_${HEX}`).success).toBe(false)
      }
    }
  })

  test.each([
    ['uppercase hex', `${prefix}_${HEX.toUpperCase()}`],
    ['31 characters', `${prefix}_${HEX.slice(1)}`],
    ['33 characters', `${prefix}_${HEX}0`],
    ['no prefix', HEX],
    ['a dashed uuid', `${prefix}_0190a5e0-b3c1-7d2a-8f4e-5b6c7d8e9f01`],
    ['non-hex characters', `${prefix}_${HEX.slice(0, 31)}g`],
    ['a trailing newline', `${prefix}_${HEX}\n`],
    ['a leading space', ` ${prefix}_${HEX}`],
  ])('rejects %s', (_name, value) => {
    expect(schema.safeParse(value).success).toBe(false)
  })
})

describe('idSchema', () => {
  test.each(['ab', 'abcde', 'org'])('accepts prefix %s', (prefix) => {
    expect(idSchema(prefix).safeParse(`${prefix}_${HEX}`).success).toBe(true)
  })

  test.each(['', 'a', 'abcdef', 'ORG', 'or1', 'o_g', 'o-g'])('refuses prefix %p', (prefix) => {
    expect(() => idSchema(prefix)).toThrow()
  })
})

describe('formatId', () => {
  test('accepts a dashed uppercase UUID and lowercases it', () => {
    const id: string = formatId('org', '0190A5E0-B3C1-7D2A-8F4E-5B6C7D8E9F01')
    expect(id).toBe(`org_${HEX}`)
  })

  test('accepts an undashed UUID', () => {
    const id: string = formatId('usr', HEX)
    expect(id).toBe(`usr_${HEX}`)
  })

  test('produces a value its own schema accepts', () => {
    expect(organizationIdSchema.safeParse(formatId('org', HEX)).success).toBe(true)
  })

  test.each([
    ['a short one', '0190a5e0-b3c1-7d2a'],
    ['a long one', `${HEX}00`],
    ['non-hex', 'zzzza5e0b3c17d2a8f4e5b6c7d8e9f01'],
    ['empty', ''],
  ])('rejects %s', (_name, uuid) => {
    expect(() => formatId('org', uuid)).toThrow()
  })

  test('rejects a malformed prefix', () => {
    expect(() => formatId('ORG', HEX)).toThrow()
  })
})
