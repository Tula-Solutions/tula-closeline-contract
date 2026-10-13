import { z } from 'zod'
import { membershipIdSchema, userIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { roleSchema } from '../tenancy'
import { timestampSchema } from './values'

/** A member of the caller's Organization: a user's Membership and the role it holds. */
export const memberSchema = z.strictObject({
  id: membershipIdSchema,
  userId: userIdSchema,
  role: roleSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

/** A member of an Organization. */
export type Member = z.infer<typeof memberSchema>

/** The query parameters of a request to list members: a cursor and a limit of at most the maximum page size. */
export const listMembersQuerySchema = pageQuerySchema

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
