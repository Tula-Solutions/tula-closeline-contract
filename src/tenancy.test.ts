import { describe, expect, test } from 'bun:test'
import {
  INVITABLE_ROLES,
  invitableRoleSchema,
  ORGANIZATION_STATUSES,
  organizationStatusSchema,
  REGIONS,
  ROLES,
  type Role,
  regionSchema,
  roleAtLeast,
  roleSchema,
} from './tenancy'

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

describe('invitableRoleSchema', () => {
  test('is every role except owner', () => {
    expect<string[]>([...INVITABLE_ROLES]).toEqual(ROLES.filter((role) => role !== 'owner'))
    for (const role of INVITABLE_ROLES) {
      expect(invitableRoleSchema.safeParse(role).success).toBe(true)
    }
  })

  test.each(['owner', 'Owner', 'admin ', '', null])('rejects %p', (value) => {
    expect(invitableRoleSchema.safeParse(value).success).toBe(false)
  })
})

describe('organizationStatusSchema', () => {
  test('accepts exactly active, suspended and deleted', () => {
    expect(ORGANIZATION_STATUSES).toEqual(['active', 'suspended', 'deleted'])
    for (const status of ORGANIZATION_STATUSES) {
      expect(organizationStatusSchema.safeParse(status).success).toBe(true)
    }
  })

  test.each(['Active', 'closed', '', undefined])('rejects %p', (value) => {
    expect(organizationStatusSchema.safeParse(value).success).toBe(false)
  })
})
