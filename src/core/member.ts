import { z } from 'zod'
import { emailSchema } from '../email'
import { membershipIdSchema, userIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import { boundedTextSchema } from '../prospect/values'
import { type Role, roleSchema } from '../tenancy'
import { storedNameSchema, timestampSchema } from './values'

/**
 * A member of the caller's Organization: a user's Membership and the role it holds. `email` and
 * `name` are core's copy of what the auth service holds for the person: given at sign-up and kept
 * current by the internal profile change. `name` is the display name auth composes from the first
 * and last names, and is `null` when the person gave neither at sign-up (both are optional
 * there). `name` is matched by the `q` filter of a members list; `email` is not a search key or a filter.
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

/** The longest `q` name filter of a members list. */
export const MAX_MEMBER_QUERY_LENGTH = 100

/** The most member ids one members list request may name in `ids`. */
export const MAX_MEMBER_IDS = 100

/** A comma-separated list of 1 to {@link MAX_MEMBER_IDS} member ids in a query string, parsed to an array. */
const memberIdsParamSchema = z
  .string()
  .max(MAX_MEMBER_IDS * 64)
  .transform((value) => value.split(','))
  .pipe(z.array(membershipIdSchema).min(1).max(MAX_MEMBER_IDS))

/** The query parameters of a request to list members: a cursor, a limit of at most the maximum page size, and optionally `q` (a case-insensitive filter on name), `role` (members holding that role) and `ids` (a comma-separated list of at most 100 member ids, to resolve specific members in one call). An unknown parameter is refused. */
export const listMembersQuerySchema = pageQuerySchema
  .extend({
    q: boundedTextSchema(MAX_MEMBER_QUERY_LENGTH).optional(),
    role: roleSchema.optional(),
    ids: memberIdsParamSchema.optional(),
  })
  .strict()

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
