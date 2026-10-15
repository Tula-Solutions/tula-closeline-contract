import { z } from 'zod'
import type { CommonErrorCode } from '../errors'
import { membershipIdSchema, teamIdSchema } from '../ids'
import { pageQuerySchema, pageSchema } from '../pagination'
import type { CoreErrorCode } from './errors'
import { LIST_MEMBERS_MIN_ROLE, memberSchema } from './member'
import { storedNameSchema, teamNameSchema, timestampSchema } from './values'

/** A Team as core returns it. */
export const teamSchema = z.object({
  id: teamIdSchema,
  name: storedNameSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

/** A Team as core returns it. */
export type Team = z.infer<typeof teamSchema>

/**
 * The body of a request to create a Team. The call accepts an `Idempotency-Key` header
 * (`idempotencyKeySchema`): a replay returns the original Team, the same key with a different
 * body is `request.idempotency_key_reused`, and the same key while the first request is still
 * running is `request.idempotency_in_progress`.
 */
export const createTeamRequestSchema = z.strictObject({
  name: teamNameSchema,
})

/** The body of a request to create a Team. */
export type CreateTeamRequest = z.infer<typeof createTeamRequestSchema>

/** The body of a request to rename a Team. */
export const renameTeamRequestSchema = z.strictObject({
  name: teamNameSchema,
})

/** The body of a request to rename a Team. */
export type RenameTeamRequest = z.infer<typeof renameTeamRequestSchema>

/** The query parameters of a request to list Teams. */
export const listTeamsQuerySchema = pageQuerySchema.strict()

/** The query parameters of a request to list Teams. */
export type ListTeamsQuery = z.infer<typeof listTeamsQuerySchema>

/** One page of Teams. */
export const listTeamsResponseSchema = pageSchema(teamSchema)

/** One page of Teams. */
export type ListTeamsResponse = z.infer<typeof listTeamsResponseSchema>

/** The path parameters of a request about one Team, such as renaming or deleting it. */
export const teamParamsSchema = z.strictObject({
  teamId: teamIdSchema,
})

/** The path parameters of a request about one Team. */
export type TeamParams = z.infer<typeof teamParamsSchema>

/** The body of a request to add a member to a Team. */
export const addTeamMemberRequestSchema = z.strictObject({
  membershipId: membershipIdSchema,
})

/** The body of a request to add a member to a Team. */
export type AddTeamMemberRequest = z.infer<typeof addTeamMemberRequestSchema>

/** A member's place in a Team, as core returns it after adding one. */
export const teamMemberSchema = z.object({
  teamId: teamIdSchema,
  membershipId: membershipIdSchema,
  createdAt: timestampSchema,
})

/** A member's place in a Team. */
export type TeamMember = z.infer<typeof teamMemberSchema>

/** The path parameters of a request to remove a member from a Team. */
export const teamMemberParamsSchema = z.strictObject({
  teamId: teamIdSchema,
  membershipId: membershipIdSchema,
})

/** The path parameters of a request to remove a member from a Team. */
export type TeamMemberParams = z.infer<typeof teamMemberParamsSchema>

/** The query parameters of a request to list a Team's members: a cursor and a limit of at most the maximum page size. */
export const listTeamMembersQuerySchema = pageQuerySchema.strict()

/** The query parameters of a request to list a Team's members. */
export type ListTeamMembersQuery = z.infer<typeof listTeamMembersQuerySchema>

/**
 * One page of a Team's members, for `GET /v1/teams/{teamId}/members` (path parameters
 * `teamParamsSchema`). Each item is a member exactly as the Organization's members list returns it.
 */
export const listTeamMembersResponseSchema = pageSchema(memberSchema)

/** One page of a Team's members. */
export type ListTeamMembersResponse = z.infer<typeof listTeamMembersResponseSchema>

/**
 * The least privileged role that may list a Team's members: exactly `LIST_MEMBERS_MIN_ROLE`, the
 * role that lists the Organization's members, because each item carries the member's email and
 * name. It is not loosened to the roles that may only view a Team.
 */
export const LIST_TEAM_MEMBERS_MIN_ROLE = LIST_MEMBERS_MIN_ROLE

/**
 * Every error code `GET /v1/teams/{teamId}/members` may answer with. Who may call it is
 * `LIST_TEAM_MEMBERS_MIN_ROLE`; a role that is not allowed is `auth.forbidden`. A Team in another
 * Organization is `team.not_found`.
 */
export const LIST_TEAM_MEMBERS_ERROR_CODES = [
  'team.not_found',
  'request.invalid',
  'auth.unauthenticated',
  'auth.token_expired',
  'auth.token_invalid',
  'auth.forbidden',
  'auth.unavailable',
  'organization.suspended',
  'organization.deleted',
  'rate.limited',
] as const satisfies readonly (CoreErrorCode | CommonErrorCode)[]
