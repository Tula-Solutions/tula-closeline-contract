import { describe, expect, test } from 'bun:test'
import { id, NOW } from './fixtures'
import { organizationSchema, renameOrganizationRequestSchema } from './organization'

const organization = {
  id: id('org'),
  name: 'Acme',
  region: 'eu',
  status: 'active',
  createdAt: NOW,
  updatedAt: NOW,
}

describe('organizationSchema', () => {
  test('accepts an Organization', () => {
    expect(organizationSchema.parse(organization)).toEqual(organization as never)
  })

  test.each([
    ['a Team id as its id', { ...organization, id: id('team') }],
    ['an unknown status', { ...organization, status: 'closed' }],
    ['an unknown Region', { ...organization, region: 'ap' }],
    ['an over-long name', { ...organization, name: 'a'.repeat(201) }],
    ['no name', { ...organization, name: undefined }],
  ])('rejects %s', (_name, body) => {
    expect(organizationSchema.safeParse(body).success).toBe(false)
  })
})

describe('renameOrganizationRequestSchema', () => {
  test('accepts a new name', () => {
    expect(renameOrganizationRequestSchema.parse({ name: ' New name ' })).toEqual({
      name: 'New name',
    })
  })

  test.each([
    ['an empty name', { name: '' }],
    ['an over-long name', { name: 'a'.repeat(201) }],
    ['an unknown key', { name: 'x', status: 'deleted' }],
    ['a Region', { name: 'x', region: 'us' }],
    ['no body', {}],
  ])('rejects %s', (_name, body) => {
    expect(renameOrganizationRequestSchema.safeParse(body).success).toBe(false)
  })
})

describe('a stored name never fails a response parse', () => {
  test('an Organization named with a tab still parses', () => {
    const stored = { ...organization, name: 'Acme\tSales' }
    expect(organizationSchema.parse(stored).name).toBe('Acme\tSales')
  })
})
