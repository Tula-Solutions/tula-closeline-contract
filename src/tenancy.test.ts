import { describe, expect, test } from 'bun:test'
import { REGIONS, ROLES, type Role, regionSchema, roleAtLeast, roleSchema } from './tenancy'

describe('regionSchema', () => {
  test('accepts exactly us and eu', () => {
    expect(REGIONS).toEqual(['us', 'eu'])
    for (const r of REGIONS) {
      expect(regionSchema.safeParse(r).success).toBe(true)
    }
  })

  test.each(['US', 'ap', '', 'us ', 1])('rejects %p', (value) => {
    expect(regionSchema.safeParse(value).success).toBe(false)
  })
})

describe('roleSchema', () => {
  test('lists roles from most to least privileged', () => {
    expect(ROLES).toEqual(['owner', 'admin', 'manager', 'rep'])
  })

  test.each(['Owner', 'user', 'member', '', null])('rejects %p', (value) => {
    expect(roleSchema.safeParse(value).success).toBe(false)
  })
})

describe('roleAtLeast', () => {
  const expected: Record<Role, Record<Role, boolean>> = {
    owner: { owner: true, admin: true, manager: true, rep: true },
    admin: { owner: false, admin: true, manager: true, rep: true },
    manager: { owner: false, admin: false, manager: true, rep: true },
    rep: { owner: false, admin: false, manager: false, rep: true },
  }
  const pairs = ROLES.flatMap((role) =>
    ROLES.map((minimum) => [role, minimum, expected[role][minimum]] as const)
  )

  test('covers all 16 pairs', () => {
    expect(pairs).toHaveLength(16)
  })

  test.each(pairs)('%s at least %s is %p', (role, minimum, result) => {
    expect(roleAtLeast(role, minimum)).toBe(result)
  })
})

describe('roleAtLeast on untrusted input', () => {
  test('an unknown role is never at least anything', () => {
    const unknown = 'superuser' as unknown as Role
    expect(roleAtLeast(unknown, 'rep')).toBe(false)
    expect(roleAtLeast('owner', unknown)).toBe(false)
  })
})
