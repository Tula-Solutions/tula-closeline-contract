import { z } from 'zod'
import { emailSchema } from '../email'
import { membershipIdSchema, userIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { type Role, roleSchema } from '../tenancy'
import { storedNameSchema, timestampSchema } from './values'

/**
 * A member of the caller's Organization: a user's Membership and the role it holds. `email` and
 * `name` are core's copy of what the auth service holds for the person: given at sign-up and kept
 * current by the internal profile change. `name` is the display name auth composes from the first
 * and last names, and is `null` when the person gave neither at sign-up (both are optional
 * there). Neither is a search key or a filter in this version.
 */
export const memberSchema = z.object({
  id: membershipIdSchema,
  userId: userIdSchema,
  email: emailSchema,
  name: storedNameSchema.nullable(),
  role: roleSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

/** A member of an Organization. */
export type Member = z.infer<typeof memberSchema>

/**
 * The least privileged role that may list the Organization's members (`GET /v1/members`): Owner,
 * Admin and Manager (see `roleAtLeast`). Anyone who sees member emails needs at least this role.
 */
export const LIST_MEMBERS_MIN_ROLE = 'manager' as const satisfies Role

/** The query parameters of a request to list members: a cursor and a limit of at most the maximum page size. */
export const listMembersQuerySchema = pageQuerySchema.strict()

/** The query parameters of a request to list members. */
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>

/** One page of members. */
export const listMembersResponseSchema = pageSchema(memberSchema)

/** One page of members. */
export type ListMembersResponse = z.infer<typeof listMembersResponseSchema>

/** The path parameters of a request about one member. */
export const memberParamsSchema = z.strictObject({
  membershipId: membershipIdSchema,
})

/** The path parameters of a request about one member. */
export type MemberParams = z.infer<typeof memberParamsSchema>

/** The body of a request to change a member's role; promoting to `owner` is how ownership passes. */
export const changeMemberRoleRequestSchema = z.strictObject({
  role: roleSchema,
})

/** The body of a request to change a member's role. */
export type ChangeMemberRoleRequest = z.infer<typeof changeMemberRoleRequestSchema>
