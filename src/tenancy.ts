import { z } from 'zod'

/** Every Region an Organization can be created in. */
export const REGIONS = ['us', 'eu'] as const

/** A Region: the geography whose boundary an Organization's data never crosses. */
export const regionSchema = z.enum(REGIONS)

/** A Region. */
export type Region = z.infer<typeof regionSchema>

/** Every role, ordered from most to least privileged. */
export const ROLES = ['owner', 'admin', 'manager', 'rep'] as const

/** A member's role in an Organization. */
export const roleSchema = z.enum(ROLES)

/** A role. */
export type Role = z.infer<typeof roleSchema>

/** Whether `role` is at least as privileged as `minimum`; an unrecognised role is never enough. */
export function roleAtLeast(role: Role, minimum: Role): boolean {
  const have = ROLES.indexOf(role)
  const need = ROLES.indexOf(minimum)
  return have !== -1 && need !== -1 && have <= need
}

/** The roles an Invitation can offer; ownership passes by promoting a member, never by Invitation. */
export const INVITABLE_ROLES = ['admin', 'manager', 'rep'] as const

/** A role an Invitation can offer: any role except `owner`. */
export const invitableRoleSchema = z.enum(INVITABLE_ROLES)

/** A role an Invitation can offer. */
export type InvitableRole = z.infer<typeof invitableRoleSchema>

/** Every state an Organization is in; `deleted` keeps the record for the retention window. */
export const ORGANIZATION_STATUSES = ['active', 'suspended', 'deleted'] as const

/** The state of an Organization. */
export const organizationStatusSchema = z.enum(ORGANIZATION_STATUSES)

/** The state of an Organization. */
export type OrganizationStatus = z.infer<typeof organizationStatusSchema>
