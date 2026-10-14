import { ErrorDefinition as ErrorDefinition_8gwh45 } from "..";
/**
* Every `area.reason` code the auth service answers with, beyond the common ones in `ERRORS`:
* sign-in, sign-up verification, passwords and sessions. The sign-up codes and core's
* `organization.deleted` (returned by sign-in and refresh when the user's Organization was deleted)
* are the same entries as in `SIGNUP_ERRORS` and `CORE_ERRORS`, not copies. A missing or
* invalid access token is one of the common `auth.*` token codes in `ERRORS`; a refresh token that
* is not valid is `session.invalid_token`.
*/
declare const AUTH_ERRORS: {
	readonly "organization.deleted": ErrorDefinition_8gwh45<"organization.deleted">;
	readonly "auth.invalid_credentials": ErrorDefinition_8gwh45<"auth.invalid_credentials">;
	readonly "auth.no_organization": ErrorDefinition_8gwh45<"auth.no_organization">;
	readonly "auth.user_banned": ErrorDefinition_8gwh45<"auth.user_banned">;
	readonly "email.invalid": ErrorDefinition_8gwh45<"email.invalid">;
	readonly "flow.invalid_step": ErrorDefinition_8gwh45<"flow.invalid_step">;
	readonly "flow.not_found": ErrorDefinition_8gwh45<"flow.not_found">;
	readonly "mail.unavailable": ErrorDefinition_8gwh45<"mail.unavailable">;
	readonly "membership.unavailable": ErrorDefinition_8gwh45<"membership.unavailable">;
	readonly "password.breached": ErrorDefinition_8gwh45<"password.breached">;
	readonly "password.common": ErrorDefinition_8gwh45<"password.common">;
	readonly "password.contains_user_info": ErrorDefinition_8gwh45<"password.contains_user_info">;
	readonly "password.too_long": ErrorDefinition_8gwh45<"password.too_long">;
	readonly "password.too_short": ErrorDefinition_8gwh45<"password.too_short">;
	readonly "session.expired": ErrorDefinition_8gwh45<"session.expired">;
	readonly "session.invalid_token": ErrorDefinition_8gwh45<"session.invalid_token">;
	readonly "session.reuse_detected": ErrorDefinition_8gwh45<"session.reuse_detected">;
	readonly "session.revoked": ErrorDefinition_8gwh45<"session.revoked">;
	readonly "signup.invitation_invalid": ErrorDefinition_8gwh45<"signup.invitation_invalid">;
	readonly "signup.organization_name_invalid": ErrorDefinition_8gwh45<"signup.organization_name_invalid">;
	readonly "verification.expired": ErrorDefinition_8gwh45<"verification.expired">;
	readonly "verification.invalid_code": ErrorDefinition_8gwh45<"verification.invalid_code">;
	readonly "verification.too_many_attempts": ErrorDefinition_8gwh45<"verification.too_many_attempts">;
};
/** A code from the {@link AUTH_ERRORS} registry. */
type AuthErrorCode = keyof typeof AUTH_ERRORS;
import { ErrorDefinition as ErrorDefinition_8gwh452 } from "..";
/**
* The errors core returns, as `area.reason` codes. None says whether an email address or a user
* exists in another Organization: `invitation.invalid` covers an unknown, used, revoked and expired
* token alike, and `membership.already_member` is only ever about the user making the call. A role
* that is not allowed is the common `auth.forbidden`. `organization.not_abandonable` is the one
* answer when the abandon guard refuses, whichever of its conditions failed. Which internal call
* returns which code is `INTERNAL_CALL_ERRORS`.
*/
declare const CORE_ERRORS: {
	readonly "invitation.already_pending": ErrorDefinition_8gwh452<"invitation.already_pending">;
	readonly "invitation.invalid": ErrorDefinition_8gwh452<"invitation.invalid">;
	readonly "invitation.not_found": ErrorDefinition_8gwh452<"invitation.not_found">;
	readonly "member.last_owner": ErrorDefinition_8gwh452<"member.last_owner">;
	readonly "member.not_found": ErrorDefinition_8gwh452<"member.not_found">;
	readonly "membership.already_member": ErrorDefinition_8gwh452<"membership.already_member">;
	readonly "organization.deleted": ErrorDefinition_8gwh452<"organization.deleted">;
	readonly "organization.not_abandonable": ErrorDefinition_8gwh452<"organization.not_abandonable">;
	readonly "organization.not_found": ErrorDefinition_8gwh452<"organization.not_found">;
	readonly "organization.suspended": ErrorDefinition_8gwh452<"organization.suspended">;
	readonly "team.name_taken": ErrorDefinition_8gwh452<"team.name_taken">;
	readonly "team.not_found": ErrorDefinition_8gwh452<"team.not_found">;
};
/** A code from the {@link CORE_ERRORS} registry. */
type CoreErrorCode = keyof typeof CORE_ERRORS;
/**
* The errors the auth service returns about sign-up and Organization membership. They are named
* for what the person signing up sees; auth turns core's `invitation.invalid` into
* `signup.invitation_invalid` and an unreachable core into `membership.unavailable`.
*/
declare const SIGNUP_ERRORS: {
	readonly "auth.no_organization": ErrorDefinition_8gwh452<"auth.no_organization">;
	readonly "membership.unavailable": ErrorDefinition_8gwh452<"membership.unavailable">;
	readonly "signup.invitation_invalid": ErrorDefinition_8gwh452<"signup.invitation_invalid">;
	readonly "signup.organization_name_invalid": ErrorDefinition_8gwh452<"signup.organization_name_invalid">;
};
/** A code from the {@link SIGNUP_ERRORS} registry. */
type SignupErrorCode = keyof typeof SIGNUP_ERRORS;
import { z } from "zod";
/** The internal calls, by name. */
type InternalCallName = "createOrganization" | "acceptInvitation" | "membership" | "updateMemberProfile" | "abandonOrganization";
/**
* The complete list of domain error codes each internal call may return, for core's tests to
* assert against. Common codes (`auth.*`, `request.*`, `server.*`) can come from any call and are
* not listed. Accepting an Invitation never returns an Organization status code, so a suspended or
* deleted Organization is indistinguishable from an unknown token. The membership lookup returns
* no domain error: it answers `found: false`. A profile change for a user with no membership is
* `member.not_found`, which the caller treats as nothing to do. Abandoning an Organization returns
* only `organization.not_abandonable`, for a live Organization that fails the guard; it has no
* not-found code (see `internalAbandonOrganizationRequestSchema`).
*/
declare const INTERNAL_CALL_ERRORS: Readonly<Record<InternalCallName, readonly CoreErrorCode[]>>;
/**
* Internal: `POST /internal/organizations`, the body of a sign-up that creates an Organization;
* the user becomes its Owner. `email` and `name` are the person's, copied onto the Membership for
* the member list (the auth service holds them; see `memberSchema`): `name` is the display name
* auth composes from the first and last names, or `null` when the person gave neither. Both are
* optional only so a `0.5.0` caller, which sends neither, still parses and core can deploy before
* auth sends them; each becomes required once auth sends them. Core returns only
* `membership.already_member`.
*/
declare const internalCreateOrganizationRequestSchema: z.ZodObject<{
	userId: z.core.$ZodBranded<z.ZodString, "usr", "out">;
	organizationName: z.ZodPipe<z.ZodString, z.ZodString>;
	email: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>>;
	name: z.ZodOptional<z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodString>>>;
}, z.core.$strict>;
/** Internal: the body of a sign-up that creates an Organization. */
type InternalCreateOrganizationRequest = z.infer<typeof internalCreateOrganizationRequestSchema>;
/** Internal: the answer to creating an Organization at sign-up; the role is always `owner`. */
declare const internalCreateOrganizationResponseSchema: z.ZodObject<{
	organizationId: z.core.$ZodBranded<z.ZodString, "org", "out">;
	role: z.ZodLiteral<"owner">;
}, z.core.$strip>;
/** Internal: the answer to creating an Organization at sign-up. */
type InternalCreateOrganizationResponse = z.infer<typeof internalCreateOrganizationResponseSchema>;
/**
* Internal: `POST /internal/invitations/accept`, the body of a sign-up that accepts an Invitation
* with its raw token and the verified address. `name` is the person's display name as auth
* composes it, or `null` when the person gave none; the address is copied onto the Membership
* too. `name` is optional only so a `0.5.0` caller, which sends none, still parses and core can
* deploy before auth sends it; it becomes required once auth sends it. Core compares the address,
* folded, with the Invitation's and answers `invitation.invalid` on a mismatch, like an unknown,
* used, revoked or expired token. Core returns only `invitation.invalid` or
* `membership.already_member`, never an Organization status.
*/
declare const internalAcceptInvitationRequestSchema: z.ZodObject<{
	userId: z.core.$ZodBranded<z.ZodString, "usr", "out">;
	email: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
	name: z.ZodOptional<z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodString>>>;
	invitationToken: z.ZodString;
}, z.core.$strict>;
/** Internal: the body of a sign-up that accepts an Invitation. */
type InternalAcceptInvitationRequest = z.infer<typeof internalAcceptInvitationRequestSchema>;
/** Internal: the answer to accepting an Invitation; the role is the one offered, never `owner`. */
declare const internalAcceptInvitationResponseSchema: z.ZodObject<{
	organizationId: z.core.$ZodBranded<z.ZodString, "org", "out">;
	role: z.ZodEnum<{
		admin: "admin";
		manager: "manager";
		rep: "rep";
	}>;
}, z.core.$strip>;
/** Internal: the answer to accepting an Invitation. */
type InternalAcceptInvitationResponse = z.infer<typeof internalAcceptInvitationResponseSchema>;
/** Internal: the request for the membership of one user, which the token hook makes before issuing a token. */
declare const internalMembershipRequestSchema: z.ZodObject<{
	userId: z.core.$ZodBranded<z.ZodString, "usr", "out">;
}, z.core.$strict>;
/** Internal: the request for the membership of one user. */
type InternalMembershipRequest = z.infer<typeof internalMembershipRequestSchema>;
/**
* Internal: the membership of a user, or `{ found: false }` for a user with none. A user with an
* Organization that is suspended or deleted is found: the token hook decides what to do with the
* status. The lookup returns no domain error.
*/
declare const internalMembershipResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
	found: z.ZodLiteral<true>;
	organizationId: z.core.$ZodBranded<z.ZodString, "org", "out">;
	role: z.ZodEnum<{
		admin: "admin";
		manager: "manager";
		owner: "owner";
		rep: "rep";
	}>;
	organizationStatus: z.ZodEnum<{
		active: "active";
		deleted: "deleted";
		suspended: "suspended";
	}>;
}, z.core.$strip>, z.ZodObject<{
	found: z.ZodLiteral<false>;
}, z.core.$strip>], "found">;
/** Internal: the membership of a user, or none. */
type InternalMembershipResponse = z.infer<typeof internalMembershipResponseSchema>;
/** Internal: the path parameters of a profile change; the user is in the path, not the body. */
declare const internalUpdateMemberProfileParamsSchema: z.ZodObject<{
	userId: z.core.$ZodBranded<z.ZodString, "usr", "out">;
}, z.core.$strict>;
/** Internal: the path parameters of a profile change. */
type InternalUpdateMemberProfileParams = z.infer<typeof internalUpdateMemberProfileParamsSchema>;
/**
* Internal: `PATCH /internal/members/{userId}`, the body of the call auth makes when a person's
* name or email changes, to bring core's copy up to date. Each field is the new value, never a
* delta, so the call is idempotent: a repeat leaves the same state and answers the same. At least
* one field is required. `name: null` clears the name; the address cannot be cleared. It applies
* to the person's Membership in whichever Organization holds it, and answers `member.not_found`
* for a user with none, which the caller treats as nothing to do. It carries an `Idempotency-Key`
* header. The auth service has no route that changes a name or an address yet; the call is
* defined ahead of it.
*/
declare const internalUpdateMemberProfileRequestSchema: z.ZodObject<{
	email: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>>;
	name: z.ZodOptional<z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodString>>>;
}, z.core.$strict>;
/** Internal: the body of a profile change. */
type InternalUpdateMemberProfileRequest = z.infer<typeof internalUpdateMemberProfileRequestSchema>;
/** Internal: the answer to a profile change: the address and name core now holds for the user. */
declare const internalUpdateMemberProfileResponseSchema: z.ZodObject<{
	userId: z.core.$ZodBranded<z.ZodString, "usr", "out">;
	email: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodString>;
	name: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
/** Internal: the answer to a profile change. */
type InternalUpdateMemberProfileResponse = z.infer<typeof internalUpdateMemberProfileResponseSchema>;
/** The hours after creation during which an Organization can be abandoned. */
declare const ABANDON_MAX_AGE_HOURS = 24;
/** Internal: the path parameters of an abandon; the Organization is named in the path. */
declare const internalAbandonOrganizationParamsSchema: z.ZodObject<{
	organizationId: z.core.$ZodBranded<z.ZodString, "org", "out">;
}, z.core.$strict>;
/** Internal: the path parameters of an abandon. */
type InternalAbandonOrganizationParams = z.infer<typeof internalAbandonOrganizationParamsSchema>;
/**
* Internal: `POST /internal/organizations/{organizationId}/abandon`, the body of the call auth
* makes when the account write fails after core created the Organization, and from its sweep of
* abandoned sign-ups. It carries an `Idempotency-Key` header.
*
* The call is defined by its end state. It answers success,
* `{ organizationId, status: 'deleted' }`, whenever no live Organization with that id exists when
* the call returns: abandoned by this call, abandoned or deleted earlier by anyone, or never
* created. A repeat with the same key, a new key or a different `userId` after the Organization
* is gone all answer success, so the caller must not read success as "this call deleted it". Only
* a live Organization that fails the guard answers `organization.not_abandonable`: it has another
* member, its one member is not `userId`, or it was created `ABANDON_MAX_AGE_HOURS` hours ago or
* more. Otherwise core marks the Organization `deleted` and frees the user id.
* Success means no live Organization remains, not that the user id is free yet: an Organization
* deleted earlier may still hold its members until the deletion job empties it, so auth must not
* depend on the id being free immediately.
*
* The holder of the internal token can tell a live Organization id from any other id (409 against
* 200); the single refusal code hides only which guard condition failed. Needing the Organization
* id and the user id together means a guess cannot abandon an Organization, not that an id cannot
* be probed.
*/
declare const internalAbandonOrganizationRequestSchema: z.ZodObject<{
	userId: z.core.$ZodBranded<z.ZodString, "usr", "out">;
}, z.core.$strict>;
/** Internal: the body of an abandon. */
type InternalAbandonOrganizationRequest = z.infer<typeof internalAbandonOrganizationRequestSchema>;
/**
* Internal: the answer to an abandon: always `deleted`, whether this call, an earlier one or
* nobody ever created the Organization. A retry cannot be told from the original.
*/
declare const internalAbandonOrganizationResponseSchema: z.ZodObject<{
	organizationId: z.core.$ZodBranded<z.ZodString, "org", "out">;
	status: z.ZodLiteral<"deleted">;
}, z.core.$strip>;
/** Internal: the answer to an abandon. */
type InternalAbandonOrganizationResponse = z.infer<typeof internalAbandonOrganizationResponseSchema>;
import { z as z2 } from "zod";
/**
* An Invitation as core returns it. The raw token is not here and never will be: it is delivered
* by email only, so a response cannot leak it.
*/
declare const invitationSchema: z2.ZodObject<{
	id: z2.core.$ZodBranded<z2.ZodString, "inv", "out">;
	email: z2.ZodPipe<z2.ZodPipe<z2.ZodString, z2.ZodTransform<string, string>>, z2.ZodString>;
	role: z2.ZodEnum<{
		admin: "admin";
		manager: "manager";
		rep: "rep";
	}>;
	teamId: z2.ZodNullable<z2.core.$ZodBranded<z2.ZodString, "team", "out">>;
	state: z2.ZodEnum<{
		accepted: "accepted";
		pending: "pending";
		revoked: "revoked";
	}>;
	invitedByUserId: z2.core.$ZodBranded<z2.ZodString, "usr", "out">;
	expiresAt: z2.ZodISODateTime;
	createdAt: z2.ZodISODateTime;
}, z2.core.$strip>;
/** An Invitation as core returns it. */
type Invitation = z2.infer<typeof invitationSchema>;
/**
* The body of a request to invite someone: an address and a role that is never `owner`. The call
* accepts an `Idempotency-Key` header (`idempotencyKeySchema`): a replay returns the original
* Invitation instead of `invitation.already_pending`, the same key with a different body is
* `request.idempotency_key_reused`, and the same key while the first request is still running is
* `request.idempotency_in_progress`.
*/
declare const createInvitationRequestSchema: z2.ZodObject<{
	email: z2.ZodPipe<z2.ZodPipe<z2.ZodString, z2.ZodTransform<string, string>>, z2.ZodString>;
	role: z2.ZodEnum<{
		admin: "admin";
		manager: "manager";
		rep: "rep";
	}>;
	teamId: z2.ZodOptional<z2.core.$ZodBranded<z2.ZodString, "team", "out">>;
}, z2.core.$strict>;
/** The body of a request to invite someone. */
type CreateInvitationRequest = z2.infer<typeof createInvitationRequestSchema>;
/**
* The query parameters of a request to list Invitations: a page, and the `state` to list, which
* is `pending` unless asked otherwise. An unknown parameter is rejected.
*/
declare const listInvitationsQuerySchema: z2.ZodObject<{
	cursor: z2.ZodOptional<z2.ZodString>;
	limit: z2.ZodDefault<z2.ZodPipe<z2.ZodPipe<z2.ZodUnion<readonly [z2.ZodNumber, z2.ZodString]>, z2.ZodTransform<number, string | number>>, z2.ZodNumber>>;
	state: z2.ZodDefault<z2.ZodEnum<{
		accepted: "accepted";
		pending: "pending";
		revoked: "revoked";
	}>>;
}, z2.core.$strict>;
/** The query parameters of a request to list Invitations. */
type ListInvitationsQuery = z2.infer<typeof listInvitationsQuerySchema>;
/** One page of Invitations. */
declare const listInvitationsResponseSchema: z2.ZodObject<{
	items: z2.ZodArray<z2.ZodObject<{
		id: z2.core.$ZodBranded<z2.ZodString, "inv", "out">;
		email: z2.ZodPipe<z2.ZodPipe<z2.ZodString, z2.ZodTransform<string, string>>, z2.ZodString>;
		role: z2.ZodEnum<{
			admin: "admin";
			manager: "manager";
			rep: "rep";
		}>;
		teamId: z2.ZodNullable<z2.core.$ZodBranded<z2.ZodString, "team", "out">>;
		state: z2.ZodEnum<{
			accepted: "accepted";
			pending: "pending";
			revoked: "revoked";
		}>;
		invitedByUserId: z2.core.$ZodBranded<z2.ZodString, "usr", "out">;
		expiresAt: z2.ZodISODateTime;
		createdAt: z2.ZodISODateTime;
	}, z2.core.$strip>>;
	nextCursor: z2.ZodNullable<z2.ZodString>;
}, z2.core.$strip>;
/** One page of Invitations. */
type ListInvitationsResponse = z2.infer<typeof listInvitationsResponseSchema>;
/** The path parameters of a request about one Invitation, such as revoking it. */
declare const invitationParamsSchema: z2.ZodObject<{
	invitationId: z2.core.$ZodBranded<z2.ZodString, "inv", "out">;
}, z2.core.$strict>;
/** The path parameters of a request about one Invitation. */
type InvitationParams = z2.infer<typeof invitationParamsSchema>;
import { z as z3 } from "zod";
/**
* A member of the caller's Organization: a user's Membership and the role it holds. `email` and
* `name` are core's copy of what the auth service holds for the person: given at sign-up and kept
* current by the internal profile change. `name` is the display name auth composes from the first
* and last names, and is `null` when the person gave neither at sign-up (both are optional
* there). Neither is a search key or a filter in this version.
*/
declare const memberSchema: z3.ZodObject<{
	id: z3.core.$ZodBranded<z3.ZodString, "mem", "out">;
	userId: z3.core.$ZodBranded<z3.ZodString, "usr", "out">;
	email: z3.ZodPipe<z3.ZodPipe<z3.ZodString, z3.ZodTransform<string, string>>, z3.ZodString>;
	name: z3.ZodNullable<z3.ZodString>;
	role: z3.ZodEnum<{
		admin: "admin";
		manager: "manager";
		owner: "owner";
		rep: "rep";
	}>;
	createdAt: z3.ZodISODateTime;
	updatedAt: z3.ZodISODateTime;
}, z3.core.$strip>;
/** A member of an Organization. */
type Member = z3.infer<typeof memberSchema>;
/** The query parameters of a request to list members: a cursor and a limit of at most the maximum page size. */
declare const listMembersQuerySchema: z3.ZodObject<{
	cursor: z3.ZodOptional<z3.ZodString>;
	limit: z3.ZodDefault<z3.ZodPipe<z3.ZodPipe<z3.ZodUnion<readonly [z3.ZodNumber, z3.ZodString]>, z3.ZodTransform<number, string | number>>, z3.ZodNumber>>;
}, z3.core.$strict>;
/** The query parameters of a request to list members. */
type ListMembersQuery = z3.infer<typeof listMembersQuerySchema>;
/** One page of members. */
declare const listMembersResponseSchema: z3.ZodObject<{
	items: z3.ZodArray<z3.ZodObject<{
		id: z3.core.$ZodBranded<z3.ZodString, "mem", "out">;
		userId: z3.core.$ZodBranded<z3.ZodString, "usr", "out">;
		email: z3.ZodPipe<z3.ZodPipe<z3.ZodString, z3.ZodTransform<string, string>>, z3.ZodString>;
		name: z3.ZodNullable<z3.ZodString>;
		role: z3.ZodEnum<{
			admin: "admin";
			manager: "manager";
			owner: "owner";
			rep: "rep";
		}>;
		createdAt: z3.ZodISODateTime;
		updatedAt: z3.ZodISODateTime;
	}, z3.core.$strip>>;
	nextCursor: z3.ZodNullable<z3.ZodString>;
}, z3.core.$strip>;
/** One page of members. */
type ListMembersResponse = z3.infer<typeof listMembersResponseSchema>;
/** The path parameters of a request about one member. */
declare const memberParamsSchema: z3.ZodObject<{
	membershipId: z3.core.$ZodBranded<z3.ZodString, "mem", "out">;
}, z3.core.$strict>;
/** The path parameters of a request about one member. */
type MemberParams = z3.infer<typeof memberParamsSchema>;
/** The body of a request to change a member's role; promoting to `owner` is how ownership passes. */
declare const changeMemberRoleRequestSchema: z3.ZodObject<{
	role: z3.ZodEnum<{
		admin: "admin";
		manager: "manager";
		owner: "owner";
		rep: "rep";
	}>;
}, z3.core.$strict>;
/** The body of a request to change a member's role. */
type ChangeMemberRoleRequest = z3.infer<typeof changeMemberRoleRequestSchema>;
import { z as z4 } from "zod";
/** An Organization as core returns it, for both reading it and renaming it. */
declare const organizationSchema: z4.ZodObject<{
	id: z4.core.$ZodBranded<z4.ZodString, "org", "out">;
	name: z4.ZodString;
	region: z4.ZodEnum<{
		eu: "eu";
		us: "us";
	}>;
	status: z4.ZodEnum<{
		active: "active";
		deleted: "deleted";
		suspended: "suspended";
	}>;
	createdAt: z4.ZodISODateTime;
	updatedAt: z4.ZodISODateTime;
}, z4.core.$strip>;
/** An Organization as core returns it. */
type Organization = z4.infer<typeof organizationSchema>;
/** The body of a request to rename the caller's Organization. */
declare const renameOrganizationRequestSchema: z4.ZodObject<{
	name: z4.ZodPipe<z4.ZodString, z4.ZodString>;
}, z4.core.$strict>;
/** The body of a request to rename the caller's Organization. */
type RenameOrganizationRequest = z4.infer<typeof renameOrganizationRequestSchema>;
import { z as z5 } from "zod";
/** A Team as core returns it. */
declare const teamSchema: z5.ZodObject<{
	id: z5.core.$ZodBranded<z5.ZodString, "team", "out">;
	name: z5.ZodString;
	createdAt: z5.ZodISODateTime;
	updatedAt: z5.ZodISODateTime;
}, z5.core.$strip>;
/** A Team as core returns it. */
type Team = z5.infer<typeof teamSchema>;
/**
* The body of a request to create a Team. The call accepts an `Idempotency-Key` header
* (`idempotencyKeySchema`): a replay returns the original Team, the same key with a different
* body is `request.idempotency_key_reused`, and the same key while the first request is still
* running is `request.idempotency_in_progress`.
*/
declare const createTeamRequestSchema: z5.ZodObject<{
	name: z5.ZodPipe<z5.ZodString, z5.ZodString>;
}, z5.core.$strict>;
/** The body of a request to create a Team. */
type CreateTeamRequest = z5.infer<typeof createTeamRequestSchema>;
/** The body of a request to rename a Team. */
declare const renameTeamRequestSchema: z5.ZodObject<{
	name: z5.ZodPipe<z5.ZodString, z5.ZodString>;
}, z5.core.$strict>;
/** The body of a request to rename a Team. */
type RenameTeamRequest = z5.infer<typeof renameTeamRequestSchema>;
/** The query parameters of a request to list Teams. */
declare const listTeamsQuerySchema: z5.ZodObject<{
	cursor: z5.ZodOptional<z5.ZodString>;
	limit: z5.ZodDefault<z5.ZodPipe<z5.ZodPipe<z5.ZodUnion<readonly [z5.ZodNumber, z5.ZodString]>, z5.ZodTransform<number, string | number>>, z5.ZodNumber>>;
}, z5.core.$strict>;
/** The query parameters of a request to list Teams. */
type ListTeamsQuery = z5.infer<typeof listTeamsQuerySchema>;
/** One page of Teams. */
declare const listTeamsResponseSchema: z5.ZodObject<{
	items: z5.ZodArray<z5.ZodObject<{
		id: z5.core.$ZodBranded<z5.ZodString, "team", "out">;
		name: z5.ZodString;
		createdAt: z5.ZodISODateTime;
		updatedAt: z5.ZodISODateTime;
	}, z5.core.$strip>>;
	nextCursor: z5.ZodNullable<z5.ZodString>;
}, z5.core.$strip>;
/** One page of Teams. */
type ListTeamsResponse = z5.infer<typeof listTeamsResponseSchema>;
/** The path parameters of a request about one Team, such as renaming or deleting it. */
declare const teamParamsSchema: z5.ZodObject<{
	teamId: z5.core.$ZodBranded<z5.ZodString, "team", "out">;
}, z5.core.$strict>;
/** The path parameters of a request about one Team. */
type TeamParams = z5.infer<typeof teamParamsSchema>;
/** The body of a request to add a member to a Team. */
declare const addTeamMemberRequestSchema: z5.ZodObject<{
	membershipId: z5.core.$ZodBranded<z5.ZodString, "mem", "out">;
}, z5.core.$strict>;
/** The body of a request to add a member to a Team. */
type AddTeamMemberRequest = z5.infer<typeof addTeamMemberRequestSchema>;
/** A member's place in a Team, as core returns it after adding one. */
declare const teamMemberSchema: z5.ZodObject<{
	teamId: z5.core.$ZodBranded<z5.ZodString, "team", "out">;
	membershipId: z5.core.$ZodBranded<z5.ZodString, "mem", "out">;
	createdAt: z5.ZodISODateTime;
}, z5.core.$strip>;
/** A member's place in a Team. */
type TeamMember = z5.infer<typeof teamMemberSchema>;
/** The path parameters of a request to remove a member from a Team. */
declare const teamMemberParamsSchema: z5.ZodObject<{
	teamId: z5.core.$ZodBranded<z5.ZodString, "team", "out">;
	membershipId: z5.core.$ZodBranded<z5.ZodString, "mem", "out">;
}, z5.core.$strict>;
/** The path parameters of a request to remove a member from a Team. */
type TeamMemberParams = z5.infer<typeof teamMemberParamsSchema>;
import { z as z6 } from "zod";
/** The longest Organization or Team name, in characters; the same bound as the database check. */
declare const MAX_NAME_LENGTH = 200;
/**
* An Organization's name in a request: trimmed, then 1 to 200 characters, well-formed UTF-16 (no
* lone surrogate) and no control characters. Zero-width and direction-override characters are
* allowed, so display code must treat a name as untrusted text.
*/
declare const organizationNameSchema: z6.ZodPipe<z6.ZodString, z6.ZodString>;
/**
* A Team's name in a request: trimmed, then 1 to 200 characters, well-formed UTF-16 (no lone
* surrogate) and no control characters. Zero-width and direction-override characters are allowed,
* so display code must treat a name as untrusted text.
*/
declare const teamNameSchema: z6.ZodPipe<z6.ZodString, z6.ZodString>;
/**
* The longest name of a person in a request, in characters: a first and a last name of 100 each
* and the space between. The database column for a member's name must allow at least this many
* characters after trimming, which is more than the 200 of Organization and Team names.
*/
declare const MAX_PERSON_NAME_LENGTH = 201;
/**
* A person's display name in a request, as auth composes it from the first and last names it
* holds (each at most 100 characters, joined by one space): trimmed, then 1 to 201 characters,
* well-formed UTF-16 and no control characters. A person with no name is `null` where the
* request allows it, never an empty string. Zero-width and direction-override characters are
* allowed, so display code must treat a name as untrusted text.
*/
declare const personNameSchema: z6.ZodPipe<z6.ZodString, z6.ZodString>;
/**
* A name as a response carries it: any 1 to 1000 character string. The database bounds the length
* of the name after trimming spaces, so a stored name may carry surrounding spaces and run past
* 200; the response form is loose enough for anything the database allows. Core writes only the
* trimmed output of the request schemas. Display code must treat a name as untrusted text.
*/
declare const storedNameSchema: z6.ZodString;
/** The states an Invitation is in; "expired" is not a state, it is read from `expiresAt`. */
declare const INVITATION_STATES: readonly ["pending", "accepted", "revoked"];
/** The state of an Invitation. */
declare const invitationStateSchema: z6.ZodEnum<{
	accepted: "accepted";
	pending: "pending";
	revoked: "revoked";
}>;
/** The state of an Invitation. */
type InvitationState = z6.infer<typeof invitationStateSchema>;
/** A point in time as an ISO 8601 string with an offset, as every response carries it. */
declare const timestampSchema: z6.ZodISODateTime;
/**
* The raw token of an Invitation: 22 to 256 URL-safe characters (128 bits or more). It exists in
* the email sent to the invitee and in the sign-up call to core, never in a response.
*/
declare const invitationTokenSchema: z6.ZodString;
/**
* The header that carries an idempotency key on a call that has effects. Every public POST accepts
* it too: a replay returns the original result, the same key with a different body is
* `request.idempotency_key_reused`, and the same key while the first request is still running is
* `request.idempotency_in_progress`, answered with `details.retryAfter` in seconds and a
* `Retry-After` header, as a rate-limited call is.
*/
declare const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
/** The value of the {@link IDEMPOTENCY_KEY_HEADER} header: 16 to 128 characters from `A-Za-z0-9_.:-`, such as a UUID. */
declare const idempotencyKeySchema: z6.ZodString;
/** An idempotency key. */
type IdempotencyKey = z6.infer<typeof idempotencyKeySchema>;
import { z as z7 } from "zod";
/** The longest email address stored, in characters; the same bound as the database check. */
declare const MAX_EMAIL_LENGTH = 320;
/**
* Lower-cases the ASCII letters A to Z and nothing else, so the result does not depend on the
* locale. `toLowerCase()` is wrong here: it also folds letters such as `É`, and the database does
* not. Use this wherever an email or a Team name is compared or stored.
*/
declare function foldAscii(text: string): string;
/**
* An email address, folded to lower case (ASCII letters only) and checked with the rule the
* database enforces: 3 to 320 characters, exactly one `@` that is neither first nor last, and
* every character printable ASCII (`!` to `~`), so whitespace, control characters, zero-width and
* no-break spaces, bidirectional overrides and a fullwidth `@` are all refused. An
* internationalised domain is stored in its ASCII (A-label, punycode) form: the service converts
* it before validating, and this schema does not convert. It is a backstop, not an address
* parser; a verified address comes from the auth service.
*/
declare const emailSchema: z7.ZodPipe<z7.ZodPipe<z7.ZodString, z7.ZodTransform<string, string>>, z7.ZodString>;
/** An email address, folded to lower case. */
type Email = z7.output<typeof emailSchema>;
import { z as z8 } from "zod";
/** An error code in `area.reason` form, such as `request.invalid`. */
declare const errorCodeSchema: z8.ZodString;
/** The one body every service returns for a failure. */
declare const errorBodySchema: z8.ZodObject<{
	error: z8.ZodObject<{
		code: z8.ZodString;
		message: z8.ZodString;
		details: z8.ZodOptional<z8.ZodRecord<z8.ZodString, z8.ZodUnknown>>;
	}, z8.core.$strip>;
}, z8.core.$strip>;
/** The body of a failure response, as returned by every service. */
type ErrorBody = z8.infer<typeof errorBodySchema>;
/** What a registry knows about one error: its code, HTTP status and default message. */
type ErrorDefinition<Code extends string = string> = {
	readonly code: Code;
	readonly status: number;
	readonly message: string;
};
declare const common: readonly [ErrorDefinition<"request.invalid">, ErrorDefinition<"request.not_found">, ErrorDefinition<"request.conflict">, ErrorDefinition<"request.idempotency_key_reused">, ErrorDefinition<"request.idempotency_in_progress">, ErrorDefinition<"request.too_large">, ErrorDefinition<"request.method_not_allowed">, ErrorDefinition<"request.unsupported_media_type">, ErrorDefinition<"request.unprocessable">, ErrorDefinition<"auth.unauthenticated">, ErrorDefinition<"auth.forbidden">, ErrorDefinition<"auth.token_expired">, ErrorDefinition<"auth.token_invalid">, ErrorDefinition<"auth.unavailable">, ErrorDefinition<"rate.limited">, ErrorDefinition<"server.internal">, ErrorDefinition<"server.unavailable">, ErrorDefinition<"server.timeout">];
type CommonEntry = (typeof common)[number];
/** The errors common to every service, keyed by code. */
declare const ERRORS: Readonly<{ [E in CommonEntry as E["code"]] : E }>;
/** A code from the {@link ERRORS} registry. */
type CommonErrorCode = keyof typeof ERRORS;
/** What a service supplies for one of its own errors; the code comes from the area and key. */
type ErrorInput = {
	readonly status: number;
	readonly message: string;
};
/** Declares a service's own errors: prefixes each reason with the area and returns a frozen registry. */
declare function defineErrors<
	const Area extends string,
	const Reason extends string
>(area: Area, entries: Readonly<Record<Reason, ErrorInput>>): Readonly<{ [R in Reason as `${Area}.${R}`] : ErrorDefinition<`${Area}.${R}`> }>;
import { z as z9 } from "zod";
/** An event type in `area.event_name` form, such as `team.created`. */
declare const eventTypeSchema: z9.ZodString;
/** An event type. */
type EventType = z9.infer<typeof eventTypeSchema>;
/** The envelope every event shares, wrapping a payload validated by `dataSchema`. */
declare function eventEnvelopeSchema<D extends z9.ZodType>(dataSchema: D): z9.ZodObject<{
	id: z9.core.$ZodBranded<z9.ZodString, "evt", "out">;
	type: z9.ZodString;
	version: z9.ZodNumber;
	occurredAt: z9.ZodISODateTime;
	organizationId: z9.core.$ZodBranded<z9.ZodString, "org", "out">;
	region: z9.ZodEnum<{
		eu: "eu";
		us: "us";
	}>;
	data: D;
}, z9.core.$strip>;
/** Declares one event type at one version; its schema accepts only that type and version. */
declare function defineEvent<
	const T extends string,
	const V extends number,
	D extends z9.ZodType
>(type: T, version: V, dataSchema: D): {
	type: T;
	version: V;
	schema: z9.ZodObject<{
		id: z9.core.$ZodBranded<z9.ZodString, "evt", "out">;
		occurredAt: z9.ZodISODateTime;
		organizationId: z9.core.$ZodBranded<z9.ZodString, "org", "out">;
		region: z9.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z9.ZodLiteral<T>;
		version: z9.ZodLiteral<V>;
		data: D;
	}, z9.core.$strip>;
	/** Parses an envelope of this type and version; throws a ZodError for anything else. */
	parse: (input: unknown) => ({
		id: z9.core.$ZodBranded<z9.ZodString, "evt", "out">;
		occurredAt: z9.ZodISODateTime;
		organizationId: z9.core.$ZodBranded<z9.ZodString, "org", "out">;
		region: z9.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z9.ZodLiteral<T>;
		version: z9.ZodLiteral<V>;
		data: D;
	} extends infer T_2 extends z9.core.$ZodLooseShape ? { -readonly [k in keyof T_2 as {
		id: z9.core.$ZodBranded<z9.ZodString, "evt", "out">;
		occurredAt: z9.ZodISODateTime;
		organizationId: z9.core.$ZodBranded<z9.ZodString, "org", "out">;
		region: z9.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z9.ZodLiteral<T>;
		version: z9.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? never : k] : T_2[k]["_zod"]["output"] } : never) & ({
		id: z9.core.$ZodBranded<z9.ZodString, "evt", "out">;
		occurredAt: z9.ZodISODateTime;
		organizationId: z9.core.$ZodBranded<z9.ZodString, "org", "out">;
		region: z9.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z9.ZodLiteral<T>;
		version: z9.ZodLiteral<V>;
		data: D;
	} extends infer T_3 extends z9.core.$ZodLooseShape ? { -readonly [k in keyof T_3 as {
		id: z9.core.$ZodBranded<z9.ZodString, "evt", "out">;
		occurredAt: z9.ZodISODateTime;
		organizationId: z9.core.$ZodBranded<z9.ZodString, "org", "out">;
		region: z9.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z9.ZodLiteral<T>;
		version: z9.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? k : never]? : T_3[k]["_zod"]["output"] | undefined } : never) extends infer T_1 ? { [K in keyof T_1] : T_1[K] } : never;
	/** Parses without throwing. Queue consumers use this, so a malformed message is a result to handle, not an exception to retry. */
	safeParse: (input: unknown) => z9.ZodSafeParseResult<({
		id: z9.core.$ZodBranded<z9.ZodString, "evt", "out">;
		occurredAt: z9.ZodISODateTime;
		organizationId: z9.core.$ZodBranded<z9.ZodString, "org", "out">;
		region: z9.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z9.ZodLiteral<T>;
		version: z9.ZodLiteral<V>;
		data: D;
	} extends infer T_2 extends z9.core.$ZodLooseShape ? { -readonly [k in keyof T_2 as {
		id: z9.core.$ZodBranded<z9.ZodString, "evt", "out">;
		occurredAt: z9.ZodISODateTime;
		organizationId: z9.core.$ZodBranded<z9.ZodString, "org", "out">;
		region: z9.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z9.ZodLiteral<T>;
		version: z9.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? never : k] : T_2[k]["_zod"]["output"] } : never) & ({
		id: z9.core.$ZodBranded<z9.ZodString, "evt", "out">;
		occurredAt: z9.ZodISODateTime;
		organizationId: z9.core.$ZodBranded<z9.ZodString, "org", "out">;
		region: z9.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z9.ZodLiteral<T>;
		version: z9.ZodLiteral<V>;
		data: D;
	} extends infer T_3 extends z9.core.$ZodLooseShape ? { -readonly [k in keyof T_3 as {
		id: z9.core.$ZodBranded<z9.ZodString, "evt", "out">;
		occurredAt: z9.ZodISODateTime;
		organizationId: z9.core.$ZodBranded<z9.ZodString, "org", "out">;
		region: z9.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z9.ZodLiteral<T>;
		version: z9.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? k : never]? : T_3[k]["_zod"]["output"] | undefined } : never) extends infer T_1 ? { [K in keyof T_1] : T_1[K] } : never>;
};
import { z as z10 } from "zod";
/** An id string branded with its prefix, so ids of different kinds cannot be mixed up. */
type Id<Prefix extends string> = string & z10.core.$brand<Prefix>;
/** An id for one prefix: `<prefix>_<32 lowercase hex characters>`, branded with the prefix. */
declare function idSchema<const Prefix extends string>(prefix: Prefix): PropertyKey extends Prefix ? z10.ZodString : z10.core.$ZodBranded<z10.ZodString, Prefix, "out">;
/** The id of an Organization (`org_…`). */
declare const organizationIdSchema: z10.core.$ZodBranded<z10.ZodString, "org", "out">;
/** The id of a user (`usr_…`). */
declare const userIdSchema: z10.core.$ZodBranded<z10.ZodString, "usr", "out">;
/** The id of a membership of a user in an Organization (`mem_…`). */
declare const membershipIdSchema: z10.core.$ZodBranded<z10.ZodString, "mem", "out">;
/** The id of a Team (`team_…`). */
declare const teamIdSchema: z10.core.$ZodBranded<z10.ZodString, "team", "out">;
/** The id of an Invitation to join an Organization (`inv_…`). */
declare const invitationIdSchema: z10.core.$ZodBranded<z10.ZodString, "inv", "out">;
/** The id of a Prospect (`prs_…`). */
declare const prospectIdSchema: z10.core.$ZodBranded<z10.ZodString, "prs", "out">;
/** The id of a Playbook document (`doc_…`). */
declare const documentIdSchema: z10.core.$ZodBranded<z10.ZodString, "doc", "out">;
/** The opaque id of a Deal record (`deal_…`), used in every URL path; the customer's own deal id never travels in a path. */
declare const dealRecordIdSchema: z10.core.$ZodBranded<z10.ZodString, "deal", "out">;
/** The id of a Call (`call_…`). */
declare const callIdSchema: z10.core.$ZodBranded<z10.ZodString, "call", "out">;
/** The id of a Deal import (`dimp_…`). */
declare const dealImportIdSchema: z10.core.$ZodBranded<z10.ZodString, "dimp", "out">;
/** The id of an event (`evt_…`). */
declare const eventIdSchema: z10.core.$ZodBranded<z10.ZodString, "evt", "out">;
/** The id of a request, for tracing (`req_…`). */
declare const requestIdSchema: z10.core.$ZodBranded<z10.ZodString, "req", "out">;
/** The id of an Organization. */
type OrganizationId = z10.infer<typeof organizationIdSchema>;
/** The id of a user. */
type UserId = z10.infer<typeof userIdSchema>;
/** The id of a membership. */
type MembershipId = z10.infer<typeof membershipIdSchema>;
/** The id of a Team. */
type TeamId = z10.infer<typeof teamIdSchema>;
/** The id of an Invitation. */
type InvitationId = z10.infer<typeof invitationIdSchema>;
/** The id of a Prospect. */
type ProspectId = z10.infer<typeof prospectIdSchema>;
/** The id of a Playbook document. */
type DocumentId = z10.infer<typeof documentIdSchema>;
/** The opaque id of a Deal record. */
type DealRecordId = z10.infer<typeof dealRecordIdSchema>;
/** The id of a Call. */
type CallId = z10.infer<typeof callIdSchema>;
/** The id of a Deal import. */
type DealImportId = z10.infer<typeof dealImportIdSchema>;
/** The id of an event. */
type EventId = z10.infer<typeof eventIdSchema>;
/** The id of a request. */
type RequestId = z10.infer<typeof requestIdSchema>;
/** Turns a UUID (any case; 32 hex characters or the dashed 8-4-4-4-12 form) into an id with the given prefix; throws otherwise. */
declare function formatId<const Prefix extends string>(prefix: Prefix, uuid: string): Id<Prefix>;
import { z as z11 } from "zod";
/** The largest page any list endpoint returns. */
declare const MAX_PAGE_SIZE = 100;
/** The page size used when a request does not ask for one. */
declare const DEFAULT_PAGE_SIZE = 25;
/** The longest cursor accepted or produced; about 380 bytes of JSON. */
declare const MAX_CURSOR_LENGTH = 512;
/** The query parameters of a list request: an optional cursor and a bounded limit (from a number or digit string). */
declare const pageQuerySchema: z11.ZodObject<{
	cursor: z11.ZodOptional<z11.ZodString>;
	limit: z11.ZodDefault<z11.ZodPipe<z11.ZodPipe<z11.ZodUnion<readonly [z11.ZodNumber, z11.ZodString]>, z11.ZodTransform<number, string | number>>, z11.ZodNumber>>;
}, z11.core.$strip>;
/** The parsed query parameters of a list request. */
type PageQuery = z11.infer<typeof pageQuerySchema>;
/** Builds the schema of one page of `itemSchema` items and the cursor for the next page, or null at the end. */
declare function pageSchema<T extends z11.ZodType>(itemSchema: T): z11.ZodObject<{
	items: z11.ZodArray<T>;
	nextCursor: z11.ZodNullable<z11.ZodString>;
}, z11.core.$strip>;
/** One page of items, as returned by a list endpoint. */
type Page<T> = {
	items: T[];
	nextCursor: string | null;
};
/**
* Encodes a JSON-serialisable position as a URL-safe cursor (base64url of its JSON); throws if the
* result would exceed {@link MAX_CURSOR_LENGTH}. A cursor is not signed or encrypted: the client
* can read and forge it, so it must carry only a position. The Organization always comes from the
* verified token, never from a cursor.
*/
declare function encodeCursor(value: unknown): string;
/**
* Decodes a cursor made by {@link encodeCursor}; returns undefined, never throws, for anything
* invalid. The decoded value is client-controlled input: use it as a position only.
*/
declare function decodeCursor<T extends z11.ZodType>(text: string, schema: T): z11.output<T> | undefined;
import { z as z12 } from "zod";
/** Every Region an Organization can be created in. */
declare const REGIONS: readonly ["us", "eu"];
/** A Region: the geography whose boundary an Organization's data never crosses. */
declare const regionSchema: z12.ZodEnum<{
	eu: "eu";
	us: "us";
}>;
/** A Region. */
type Region = z12.infer<typeof regionSchema>;
/** Every role, ordered from most to least privileged. */
declare const ROLES: readonly ["owner", "admin", "manager", "rep"];
/** A member's role in an Organization. */
declare const roleSchema: z12.ZodEnum<{
	admin: "admin";
	manager: "manager";
	owner: "owner";
	rep: "rep";
}>;
/** A role. */
type Role = z12.infer<typeof roleSchema>;
/** Whether `role` is at least as privileged as `minimum`; an unrecognised role is never enough. */
declare function roleAtLeast(role: Role, minimum: Role): boolean;
/** The roles an Invitation can offer; ownership passes by promoting a member, never by Invitation. */
declare const INVITABLE_ROLES: readonly ["admin", "manager", "rep"];
/** A role an Invitation can offer: any role except `owner`. */
declare const invitableRoleSchema: z12.ZodEnum<{
	admin: "admin";
	manager: "manager";
	rep: "rep";
}>;
/** A role an Invitation can offer. */
type InvitableRole = z12.infer<typeof invitableRoleSchema>;
/** Every state an Organization is in; `deleted` keeps the record for the retention window. */
declare const ORGANIZATION_STATUSES: readonly ["active", "suspended", "deleted"];
/** The state of an Organization. */
declare const organizationStatusSchema: z12.ZodEnum<{
	active: "active";
	deleted: "deleted";
	suspended: "suspended";
}>;
/** The state of an Organization. */
type OrganizationStatus = z12.infer<typeof organizationStatusSchema>;
import { ErrorDefinition as ErrorDefinition_8gwh453 } from "..";
/**
* The errors the playbook service returns, as `area.reason` codes. No body carries a file name,
* file content or text taken from a document: every message is fixed. A role that is not allowed
* is the common `auth.forbidden`; a malformed multipart body is the common `request.invalid`.
* There is no page-limit code: the page count is checked in the ingestion job, so a document over
* the limit ends in state `failed` with `failureReason: 'too_many_pages'`. `quota_exceeded` covers
* both the document count and the total size and does not say which, as no domain error in this
* library carries typed details. `document.not_restorable` (410) is a deleted
* document whose purge time has passed but which the purge has not yet removed. There is no
* tombstone: once purged the record is gone and the answer is `document.not_found` (404).
*/
declare const PLAYBOOK_ERRORS: {
	readonly "document.not_found": ErrorDefinition_8gwh453<"document.not_found">;
	readonly "document.not_restorable": ErrorDefinition_8gwh453<"document.not_restorable">;
	readonly "document.quota_exceeded": ErrorDefinition_8gwh453<"document.quota_exceeded">;
	readonly "document.too_large": ErrorDefinition_8gwh453<"document.too_large">;
	readonly "document.unsupported_type": ErrorDefinition_8gwh453<"document.unsupported_type">;
};
/** A code from the {@link PLAYBOOK_ERRORS} registry. */
type PlaybookErrorCode = keyof typeof PLAYBOOK_ERRORS;
/** The roles that may change the Playbook (ADR 0016, choice 4). */
declare const PLAYBOOK_WRITE_ROLES: readonly ["owner", "admin"];
/** The roles that may list and read documents: every role (ADR 0016, choice 4). */
declare const PLAYBOOK_READ_ROLES: readonly ["owner", "admin", "manager", "rep"];
/** The playbook routes, by name. */
type PlaybookRouteName = "uploadDocument" | "listDocuments" | "getDocument" | "deleteDocument" | "restoreDocument" | "removeOrganizationDocuments";
/** What the service needs to describe one route: its method, path, who may call it, what it answers. */
type PlaybookRoute = {
	readonly method: "GET" | "POST" | "DELETE";
	readonly path: string;
	/** True for a route on the internal network only; it takes no role and names the Organization in the path. */
	readonly internal: boolean;
	/** The roles allowed; empty for an internal route. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly PlaybookErrorCode[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The playbook routes: the description a service puts in its OpenAPI document, the roles, the
* success statuses and every error code each route may answer with. Every route may also return
* the common `auth.*`, `rate.limited` and `server.*` codes. A route on another Organization's
* document answers `document.not_found`.
*/
declare const PLAYBOOK_ROUTES: Readonly<Record<PlaybookRouteName, PlaybookRoute>>;
import { z as z13 } from "zod";
import { ErrorDefinition as ErrorDefinition_8gwh454 } from "..";
/**
* The errors the sales-history routes return, as `area.reason` codes. No body carries a file name,
* a deal id, a speaker label or text from a Call: every message is fixed. A role that is not
* allowed is the common `auth.forbidden`.
*
* - A second upload of the same Call under the same Deal is an answer (200, the stored Call), as
*   for a document in ADR 0016, so it has no code; the same content under another Deal id is
*   `call.content_in_other_deal`, and the answer does not say which Deal.
* - A recording longer than `MAX_RECORDING_SECONDS` and a page-less Transcript with no turns are
*   found by the job, so they are failure reasons on the Call, not codes.
* - A CSV row that fails (including an Outcome already decided) is a row result in the import
*   report, never an HTTP error.
* - `call.quota_exceeded` covers the number of Calls, the Recording bytes and the number of Deals,
*   and says deleted Calls count until purged.
* - `call.not_restorable` (410) is for a deleted Call past its purge time that the purge has not
*   yet removed; once purged the answer is `call.not_found` (404).
* - `rights.confirmation_required` (403) carries `details` of {@link rightsRequiredDetailsSchema},
*   so the portal knows which version of the wording to show.
*/
declare const SALES_HISTORY_ERRORS: {
	readonly "call.content_in_other_deal": ErrorDefinition_8gwh454<"call.content_in_other_deal">;
	readonly "call.not_found": ErrorDefinition_8gwh454<"call.not_found">;
	readonly "call.not_restorable": ErrorDefinition_8gwh454<"call.not_restorable">;
	readonly "call.quota_exceeded": ErrorDefinition_8gwh454<"call.quota_exceeded">;
	readonly "call.rep_invalid": ErrorDefinition_8gwh454<"call.rep_invalid">;
	readonly "call.rep_not_changeable": ErrorDefinition_8gwh454<"call.rep_not_changeable">;
	readonly "call.too_large": ErrorDefinition_8gwh454<"call.too_large">;
	readonly "call.unsupported_type": ErrorDefinition_8gwh454<"call.unsupported_type">;
	readonly "deal.not_found": ErrorDefinition_8gwh454<"deal.not_found">;
	readonly "deal_import.header_invalid": ErrorDefinition_8gwh454<"deal_import.header_invalid">;
	readonly "deal_import.not_found": ErrorDefinition_8gwh454<"deal_import.not_found">;
	readonly "deal_import.too_large": ErrorDefinition_8gwh454<"deal_import.too_large">;
	readonly "deal_import.unsupported_type": ErrorDefinition_8gwh454<"deal_import.unsupported_type">;
	readonly "rights.confirmation_required": ErrorDefinition_8gwh454<"rights.confirmation_required">;
	readonly "rights.version_outdated": ErrorDefinition_8gwh454<"rights.version_outdated">;
};
/** A code from the {@link SALES_HISTORY_ERRORS} registry. */
type SalesHistoryErrorCode = keyof typeof SALES_HISTORY_ERRORS;
/** The `details` of a `rights.confirmation_required` body: the version of the wording the portal must show. */
declare const rightsRequiredDetailsSchema: z13.ZodObject<{
	wordingVersion: z13.ZodNumber;
}, z13.core.$strict>;
/** The `details` of a `rights.confirmation_required` body. */
type RightsRequiredDetails = z13.infer<typeof rightsRequiredDetailsSchema>;
/** The roles that may read Calls, Deals, imports and the rights confirmation: Owner and Admin only, the owner's decision of 2026-10-13 (the writers are the same two roles). Managers and Reps get `auth.forbidden`. */
declare const SALES_HISTORY_READ_ROLES: readonly ["owner", "admin"];
/** The sales-history routes, by name. */
type SalesHistoryRouteName = "uploadCall" | "listCalls" | "getCall" | "deleteCall" | "restoreCall" | "setCallRep" | "listDeals" | "getDeal" | "lookupDeal" | "setDealOutcome" | "uploadDealImport" | "listDealImports" | "getDealImport" | "listDealImportRows" | "getRightsConfirmation" | "confirmRights";
/**
* What the service needs to describe one sales-history route. It has the shape of `PlaybookRoute`
* but its own method list (it adds `PUT`) and its own error codes, so the 0.7.0 `PlaybookRoute`
* type is not widened. Use `ALL_PLAYBOOK_ROUTES` for both tables in one map.
*/
type SalesHistoryRoute = {
	readonly method: "GET" | "POST" | "PUT" | "DELETE";
	readonly path: string;
	/** True for a route on the internal network only; none of these is. */
	readonly internal: boolean;
	/** The roles allowed. Any other role is the common `auth.forbidden`. */
	readonly roles: readonly Role[];
	/** The success statuses, the first being the usual one. */
	readonly success: readonly number[];
	/** The domain codes the route may return, beyond the common ones. */
	readonly errors: readonly SalesHistoryErrorCode[];
	/** The common codes the route may return, beyond those every route may. */
	readonly commonErrors: readonly CommonErrorCode[];
	/** The description for the OpenAPI document, role rules included. */
	readonly description: string;
};
/**
* The sales-history routes (ADR 0018), described as `PLAYBOOK_ROUTES` describes the document
* routes: method, path, roles, success statuses, domain error codes and the OpenAPI description.
* Every route may also return the common `auth.*`, `rate.limited` and `server.*` codes. A route on
* another Organization's Call, Deal or import answers the not-found code. No response carries a
* Transcript, audio or a turn. Reads are Owner and Admin only ({@link SALES_HISTORY_READ_ROLES}).
*/
declare const SALES_HISTORY_ROUTES: Readonly<Record<SalesHistoryRouteName, SalesHistoryRoute>>;
import { ErrorDefinition as ErrorDefinition_8gwh455 } from "..";
/** Every Playbook route name: the document routes of 0.7.0 and the sales-history routes. */
type AllPlaybookRouteName = PlaybookRouteName | SalesHistoryRouteName;
/**
* Every Playbook route in one map, for a service that builds one OpenAPI document. `PLAYBOOK_ROUTES`
* and `PLAYBOOK_ERRORS` keep their 0.7.0 types, so code written against them still compiles; use
* this map and `ALL_PLAYBOOK_ERRORS` when you want both areas.
*/
declare const ALL_PLAYBOOK_ROUTES: Readonly<Record<AllPlaybookRouteName, PlaybookRoute | SalesHistoryRoute>>;
/** Every Playbook error code in one registry: the document codes of 0.7.0 and the sales-history codes. */
declare const ALL_PLAYBOOK_ERRORS: Readonly<{
	"call.content_in_other_deal": ErrorDefinition_8gwh455<"call.content_in_other_deal">;
	"call.not_found": ErrorDefinition_8gwh455<"call.not_found">;
	"call.not_restorable": ErrorDefinition_8gwh455<"call.not_restorable">;
	"call.quota_exceeded": ErrorDefinition_8gwh455<"call.quota_exceeded">;
	"call.rep_invalid": ErrorDefinition_8gwh455<"call.rep_invalid">;
	"call.rep_not_changeable": ErrorDefinition_8gwh455<"call.rep_not_changeable">;
	"call.too_large": ErrorDefinition_8gwh455<"call.too_large">;
	"call.unsupported_type": ErrorDefinition_8gwh455<"call.unsupported_type">;
	"deal.not_found": ErrorDefinition_8gwh455<"deal.not_found">;
	"deal_import.header_invalid": ErrorDefinition_8gwh455<"deal_import.header_invalid">;
	"deal_import.not_found": ErrorDefinition_8gwh455<"deal_import.not_found">;
	"deal_import.too_large": ErrorDefinition_8gwh455<"deal_import.too_large">;
	"deal_import.unsupported_type": ErrorDefinition_8gwh455<"deal_import.unsupported_type">;
	"document.not_found": ErrorDefinition_8gwh455<"document.not_found">;
	"document.not_restorable": ErrorDefinition_8gwh455<"document.not_restorable">;
	"document.quota_exceeded": ErrorDefinition_8gwh455<"document.quota_exceeded">;
	"document.too_large": ErrorDefinition_8gwh455<"document.too_large">;
	"document.unsupported_type": ErrorDefinition_8gwh455<"document.unsupported_type">;
	"rights.confirmation_required": ErrorDefinition_8gwh455<"rights.confirmation_required">;
	"rights.version_outdated": ErrorDefinition_8gwh455<"rights.version_outdated">;
}>;
import { z as z15 } from "zod";
import { z as z14 } from "zod";
/**
* The states a Call is in (ADR 0018, with ADR 0016). A Transcript goes `uploaded`, `processing`,
* `ready`; a Recording goes `uploaded`, `transcribing`, then `awaiting_rep` (no Rep chosen yet) or
* `processing`, then `ready`. `processing` is also where a Call goes when its Rep changes and its
* Moments are rebuilt, and where a restored Call goes. `awaiting_rep` is the named wait of choice 9:
* no Moments exist and the Call is not in search. `deleted` is soft-deleted and awaiting purge. A
* Call held back from search because its Deal is not won is `ready`: that is read from the Deal,
* not a state. An upload still streaming has no Call yet, so it has no state.
*/
declare const CALL_STATES: readonly ["uploaded", "transcribing", "awaiting_rep", "processing", "ready", "failed", "deleted"];
/** The state of a Call. */
declare const callStateSchema: z14.ZodEnum<{
	awaiting_rep: "awaiting_rep";
	deleted: "deleted";
	failed: "failed";
	processing: "processing";
	ready: "ready";
	transcribing: "transcribing";
	uploaded: "uploaded";
}>;
/** The state of a Call. */
type CallState = z14.infer<typeof callStateSchema>;
/**
* Why a Call ended in `failed`: a closed list the portal maps to its own wording, never free text.
* `too_long` is found by the job from the audio, not at upload, so it is a reason and not an HTTP
* code. `too_many_speakers` is a Call with more speakers than `MAX_CALL_SPEAKERS`. `rep_label_not_found` and `not_per_side` can be fixed by changing the Rep (see {@link repChangeAllowed}). The list is the
* lead's reading of ADR 0018.
*/
declare const CALL_FAILURE_REASONS: readonly ["no_turns", "too_few_speakers", "too_many_speakers", "rep_label_not_found", "not_per_side", "too_long", "transcription_failed", "transcription_timed_out", "unreadable", "processing_failed"];
/** Why a Call ended in `failed`. */
declare const callFailureReasonSchema: z14.ZodEnum<{
	no_turns: "no_turns";
	not_per_side: "not_per_side";
	processing_failed: "processing_failed";
	rep_label_not_found: "rep_label_not_found";
	too_few_speakers: "too_few_speakers";
	too_long: "too_long";
	too_many_speakers: "too_many_speakers";
	transcription_failed: "transcription_failed";
	transcription_timed_out: "transcription_timed_out";
	unreadable: "unreadable";
}>;
/** Why a Call ended in `failed`. */
type CallFailureReason = z14.infer<typeof callFailureReasonSchema>;
/** What a Call was uploaded as: a written Transcript or an audio Recording. */
declare const CALL_KINDS: readonly ["transcript", "recording"];
/** What a Call was uploaded as. */
declare const callKindSchema: z14.ZodEnum<{
	recording: "recording";
	transcript: "transcript";
}>;
/** What a Call was uploaded as. */
type CallKind = z14.infer<typeof callKindSchema>;
/** The lead's default (ADR 0018, refinements; not the owner's): the Transcript extensions accepted: plain text, WebVTT, SRT and a JSON turn list. */
declare const ACCEPTED_TRANSCRIPT_EXTENSIONS: readonly [".txt", ".vtt", ".srt", ".json"];
/** The lead's default (ADR 0018, refinements; not the owner's): the Recording extensions accepted. */
declare const ACCEPTED_RECORDING_EXTENSIONS: readonly [".mp3", ".m4a", ".wav", ".ogg", ".webm", ".flac"];
/** An accepted Call file extension. */
type AcceptedCallExtension = (typeof ACCEPTED_TRANSCRIPT_EXTENSIONS)[number] | (typeof ACCEPTED_RECORDING_EXTENSIONS)[number];
/** The media type of a stored Call file, as the service detected it from the content. */
declare const CALL_MEDIA_TYPES: readonly ["text/plain", "text/vtt", "application/x-subrip", "application/json", "audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/webm", "audio/flac"];
/** The media type of a stored Call file. */
declare const callMediaTypeSchema: z14.ZodEnum<{
	"application/json": "application/json";
	"application/x-subrip": "application/x-subrip";
	"audio/flac": "audio/flac";
	"audio/mp4": "audio/mp4";
	"audio/mpeg": "audio/mpeg";
	"audio/ogg": "audio/ogg";
	"audio/wav": "audio/wav";
	"audio/webm": "audio/webm";
	"text/plain": "text/plain";
	"text/vtt": "text/vtt";
}>;
/** The media type of a stored Call file. */
type CallMediaType = z14.infer<typeof callMediaTypeSchema>;
/** The media type each accepted Call extension stands for. */
declare const MEDIA_TYPE_BY_CALL_EXTENSION: Readonly<Record<AcceptedCallExtension, CallMediaType>>;
/** The lead's default (ADR 0018, refinements; not the owner's): the largest Transcript accepted, 5 MB counted as 5 * 1024 * 1024 bytes. */
declare const MAX_TRANSCRIPT_BYTES: number;
/** The lead's default (ADR 0018, refinements; not the owner's): the largest Recording accepted, 500 MB counted as 500 * 1024 * 1024 bytes; streamed, never held whole. */
declare const MAX_RECORDING_BYTES: number;
/** The lead's default (ADR 0018, refinements; not the owner's): the longest Recording, 3 hours in seconds; the job checks it, so a longer one ends `failed` with `too_long`. */
declare const MAX_RECORDING_SECONDS: number;
/** The ticket's default (ADR 0018 leaves it open): hours after which the parts of an incomplete streamed upload are discarded. */
declare const INCOMPLETE_UPLOAD_PARTS_TTL_HOURS = 24;
/** The ticket's default (ADR 0018 leaves it open): the most Rep turns stored after a Moment (choice 11). */
declare const MAX_REP_FOLLOWING_TURNS = 5;
/** The ticket's default (ADR 0018 leaves it open): the most characters (Unicode code points) of Rep turns stored after a Moment, so a long turn cannot make it unbounded. */
declare const MAX_REP_FOLLOWING_CHARACTERS = 4e3;
/** The ticket's default (ADR 0018 leaves it open): Calls an Organization may hold, soft-deleted and `awaiting_rep` ones included until purged. */
declare const DEFAULT_MAX_CALLS = 2e3;
/** The ticket's default (ADR 0018 leaves it open): Recording bytes an Organization may hold, 50 GB counted as 50 * 1024^3. */
declare const DEFAULT_MAX_RECORDING_BYTES_TOTAL: number;
/** The ticket's default (ADR 0018 leaves it open): Deals an Organization may hold. */
declare const DEFAULT_MAX_DEALS = 2e4;
/** The ticket's default (ADR 0018 leaves it open): the most speakers a Call may have and list for a Rep pick; a Call with more fails with `too_many_speakers`. */
declare const MAX_CALL_SPEAKERS = 20;
/** The longest speaker label, in Unicode code points, once control and direction characters are stripped. */
declare const MAX_SPEAKER_LABEL_LENGTH = 64;
/** The most UTF-8 bytes a stored speaker label can take: 64 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_SPEAKER_LABEL_BYTES: number;
/** The stored form of a speaker label: control and bidirectional characters removed, then trimmed. Labels read from a file and labels in a request must both pass through this. */
declare function normaliseSpeakerLabel(label: string): string;
/**
* A speaker label, in a request and in a response: at most 1000 raw Unicode code points, then control and
* bidirectional characters are removed and the rest trimmed to 1 to 64 well-formed Unicode code
* points (at most `MAX_SPEAKER_LABEL_BYTES` bytes in UTF-8). It is text taken from a file (`Alice`, or `A` from the transcriber), so display code must
* treat it as untrusted text, and it never appears in an error body. It is compared exactly and
* case-sensitively with the labels in the file.
*/
declare const speakerLabelSchema: z14.ZodPipe<z14.ZodPipe<z14.ZodString, z14.ZodTransform<string, string>>, z14.ZodString>;
/** The channels of a per-side Recording: the left one or the right one. */
declare const CALL_CHANNELS: readonly ["left", "right"];
/** A channel of a per-side Recording. */
declare const callChannelSchema: z14.ZodEnum<{
	left: "left";
	right: "right";
}>;
/**
* Which side of a Call is the Rep: a speaker label (a Transcript, or a Recording that waited in
* `awaiting_rep`) or a channel (a per-side Recording). A Recording whose Rep is not yet known has
* no choice at all (`null` on the Call, an absent `rep` at upload).
*/
declare const repChoiceSchema: z14.ZodDiscriminatedUnion<[z14.ZodObject<{
	by: z14.ZodLiteral<"speaker">;
	label: z14.ZodPipe<z14.ZodPipe<z14.ZodString, z14.ZodTransform<string, string>>, z14.ZodString>;
}, z14.core.$strict>, z14.ZodObject<{
	by: z14.ZodLiteral<"channel">;
	channel: z14.ZodEnum<{
		left: "left";
		right: "right";
	}>;
}, z14.core.$strict>], "by">;
/** Which side of a Call is the Rep. */
type RepChoice = z14.infer<typeof repChoiceSchema>;
/**
* Whether a Rep choice suits a Call of this kind, for the one moment named. At `upload`, a
* Transcript needs a speaker label (ADR 0018, refinements), and a Recording takes a channel (the
* uploader declares it per-side) or nothing (it then waits in `awaiting_rep`); a speaker label for
* a Recording is not known at upload. At `change`, a choice is required: a Transcript takes a
* speaker label and a Recording takes a speaker label (from the detected speakers) or a channel.
* Whether a channel fits the file (exactly two channels) is the service's check, and a mismatch
* ends the Call `failed` with `not_per_side`. A failure here is `call.rep_invalid`.
*/
declare function repChoiceSuits(kind: CallKind, rep: RepChoice | null | undefined, when: "upload" | "change"): boolean;
/** What fixes a failed Call: a different Rep, a re-upload of the same file (the reason may be transient), or deleting the Call and uploading a corrected file. */
type CallFailureFix = "change_rep" | "reupload" | "delete_and_upload";
/**
* What fixes each failure reason. `change_rep`: `rep_label_not_found` and `not_per_side` are fixed
* by choosing a different Rep. `reupload`: `transcription_failed`, `transcription_timed_out` and
* `processing_failed` may be transient, so a same-Deal re-upload of the same content re-queues the
* Call. `delete_and_upload`: `too_many_speakers`, `no_turns`, `too_few_speakers`, `too_long` and
* `unreadable` come from the file itself, so the Call must be deleted and a corrected file uploaded.
*/
declare const CALL_FAILURE_FIXES: Readonly<Record<CallFailureReason, CallFailureFix>>;
/**
* Whether a same-Deal re-upload of identical content re-queues a `failed` Call: only for a reason
* that can be transient (`reupload` in {@link CALL_FAILURE_FIXES}). For any other reason the upload
* answers 200 with the failed Call unchanged, as the same file would fail the same way.
*/
declare function callReuploadRequeues(failureReason: CallFailureReason | null): boolean;
/**
* Whether a Call's Rep may be picked or changed: when it is `ready` or `awaiting_rep`, or `failed`
* with a reason a different Rep can fix (`rep_label_not_found`, `not_per_side`). Any other state
* or reason is `call.rep_not_changeable`.
*/
declare function repChangeAllowed(state: CallState, failureReason: CallFailureReason | null): boolean;
/**
* A Call as the service returns it. It names the file and the Deal but never carries a Transcript,
* audio or any turn. `kind` is what it was uploaded as. `rep` is the chosen Rep and is `null`
* exactly while the state is `awaiting_rep` (and for a Recording not yet transcribed or failed
* before a choice); a `ready` Call always has one. `speakerLabels` are the labels the Call's
* speakers carry (those of the file, or `A`, `B` from the transcriber), at most
* `MAX_CALL_SPEAKERS`, for the portal's Rep pick; they are untrusted text. `failureReason` is set
* exactly when `state` is `failed`; `deletedAt` and `purgeAt` exactly when it is `deleted`. A
* Transcript is never `transcribing` or `awaiting_rep`, has no duration and is within
* `MAX_TRANSCRIPT_BYTES`; `kind` agrees with `mediaType` (text for a Transcript, audio for a
* Recording); the labels are unique; and a `ready` Call's speaker Rep is one of them. A Call with
* more speakers than `MAX_CALL_SPEAKERS` fails with `too_many_speakers`, lists no speaker labels and
* never reaches a response with more than the cap, so a read route cannot throw on it. `durationSeconds` is `null` for a
* Transcript and until a Recording has been read. `dealRecordId` is the Deal's opaque id (the one
* a Deal's path uses) and `dealOutcome` its Outcome; `inSearch` is true only for a `ready` Call of a
* `won` Deal, and may be false for a Call whose Deal has just become won until the re-tag job
* finishes (the database decides, the index may lag). `dealId` is the customer's text and is never
* logged. The service must send the output of
* `callSchema.parse(row)`, never the row.
*/
declare const callSchema: z15.ZodObject<{
	id: z15.core.$ZodBranded<z15.ZodString, "call", "out">;
	dealId: z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>;
	dealRecordId: z15.core.$ZodBranded<z15.ZodString, "deal", "out">;
	dealOutcome: z15.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	inSearch: z15.ZodBoolean;
	kind: z15.ZodEnum<{
		recording: "recording";
		transcript: "transcript";
	}>;
	fileName: z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>;
	mediaType: z15.ZodEnum<{
		"application/json": "application/json";
		"application/x-subrip": "application/x-subrip";
		"audio/flac": "audio/flac";
		"audio/mp4": "audio/mp4";
		"audio/mpeg": "audio/mpeg";
		"audio/ogg": "audio/ogg";
		"audio/wav": "audio/wav";
		"audio/webm": "audio/webm";
		"text/plain": "text/plain";
		"text/vtt": "text/vtt";
	}>;
	sizeBytes: z15.ZodNumber;
	durationSeconds: z15.ZodNullable<z15.ZodNumber>;
	state: z15.ZodEnum<{
		awaiting_rep: "awaiting_rep";
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		transcribing: "transcribing";
		uploaded: "uploaded";
	}>;
	failureReason: z15.ZodNullable<z15.ZodEnum<{
		no_turns: "no_turns";
		not_per_side: "not_per_side";
		processing_failed: "processing_failed";
		rep_label_not_found: "rep_label_not_found";
		too_few_speakers: "too_few_speakers";
		too_long: "too_long";
		too_many_speakers: "too_many_speakers";
		transcription_failed: "transcription_failed";
		transcription_timed_out: "transcription_timed_out";
		unreadable: "unreadable";
	}>>;
	rep: z15.ZodNullable<z15.ZodDiscriminatedUnion<[z15.ZodObject<{
		by: z15.ZodLiteral<"speaker">;
		label: z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>;
	}, z15.core.$strict>, z15.ZodObject<{
		by: z15.ZodLiteral<"channel">;
		channel: z15.ZodEnum<{
			left: "left";
			right: "right";
		}>;
	}, z15.core.$strict>], "by">>;
	speakerLabels: z15.ZodArray<z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>>;
	deletedAt: z15.ZodNullable<z15.ZodISODateTime>;
	purgeAt: z15.ZodNullable<z15.ZodISODateTime>;
	uploadedByUserId: z15.core.$ZodBranded<z15.ZodString, "usr", "out">;
	createdAt: z15.ZodISODateTime;
	updatedAt: z15.ZodISODateTime;
}, z15.core.$strip>;
/** A Call as the service returns it. */
type Call = z15.infer<typeof callSchema>;
/** The most characters the `rep` form field may hold; a longer text is refused without being parsed. */
declare const MAX_REP_FIELD_LENGTH = 512;
/**
* The text fields of the multipart upload of a Call, beside the one file part
* ({@link UPLOAD_FILE_FIELD} `file`, as for a document): `dealId` (a deal id; a Deal that does not
* exist is created `open`) and `rep`, the {@link repChoiceSchema} as JSON text, which is a speaker
* label for a Transcript, a channel for a per-side Recording (the uploader declares it), or absent
* for a Recording that will wait in `awaiting_rep`. The request carries an `Idempotency-Key`
* header. Parse the text of `rep` with {@link parseRepField}.
*/
declare const uploadCallFieldsSchema: z15.ZodObject<{
	dealId: z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>;
	rep: z15.ZodOptional<z15.ZodString>;
}, z15.core.$strict>;
/** The text fields of the multipart upload of a Call. */
type UploadCallFields = z15.infer<typeof uploadCallFieldsSchema>;
/** What {@link parseRepField} answers: a Rep choice, no Rep at all (the field was not sent), or an invalid field. */
type ParseRepFieldResult = {
	readonly ok: true;
	readonly rep: RepChoice | null;
} | {
	readonly ok: false;
	readonly code: "call.rep_invalid";
};
/**
* Reads the `rep` form field. An absent field (`undefined`) is `{ ok: true, rep: null }`, which
* suits a Recording that will wait in `awaiting_rep`; a field that is present but empty, longer
* than {@link MAX_REP_FIELD_LENGTH}, not JSON or not a valid Rep choice is `call.rep_invalid`
* (422), never silently treated as absent. It never throws.
*/
declare function parseRepField(text: string | undefined): ParseRepFieldResult;
/** The path parameters of a request about one Call. */
declare const callParamsSchema: z15.ZodObject<{
	callId: z15.core.$ZodBranded<z15.ZodString, "call", "out">;
}, z15.core.$strict>;
/** The path parameters of a request about one Call. */
type CallParams = z15.infer<typeof callParamsSchema>;
/**
* The query parameters of a request to list Calls: a page, and optionally one `state` and one
* `dealRecordId` (the Deal's opaque id; the customer's deal id never goes in a query string). With no `state`, every Call that is not `deleted` is listed; `state=deleted` lists
* those that can still be restored, and `state=awaiting_rep` the ones waiting for a Rep. An
* unknown parameter is rejected.
*/
declare const listCallsQuerySchema: z15.ZodObject<{
	cursor: z15.ZodOptional<z15.ZodString>;
	limit: z15.ZodDefault<z15.ZodPipe<z15.ZodPipe<z15.ZodUnion<readonly [z15.ZodNumber, z15.ZodString]>, z15.ZodTransform<number, string | number>>, z15.ZodNumber>>;
	state: z15.ZodOptional<z15.ZodEnum<{
		awaiting_rep: "awaiting_rep";
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		transcribing: "transcribing";
		uploaded: "uploaded";
	}>>;
	dealRecordId: z15.ZodOptional<z15.core.$ZodBranded<z15.ZodString, "deal", "out">>;
}, z15.core.$strict>;
/** The query parameters of a request to list Calls. */
type ListCallsQuery = z15.infer<typeof listCallsQuerySchema>;
/** One page of Calls. */
declare const listCallsResponseSchema: z15.ZodObject<{
	items: z15.ZodArray<z15.ZodObject<{
		id: z15.core.$ZodBranded<z15.ZodString, "call", "out">;
		dealId: z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>;
		dealRecordId: z15.core.$ZodBranded<z15.ZodString, "deal", "out">;
		dealOutcome: z15.ZodEnum<{
			lost: "lost";
			open: "open";
			won: "won";
		}>;
		inSearch: z15.ZodBoolean;
		kind: z15.ZodEnum<{
			recording: "recording";
			transcript: "transcript";
		}>;
		fileName: z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>;
		mediaType: z15.ZodEnum<{
			"application/json": "application/json";
			"application/x-subrip": "application/x-subrip";
			"audio/flac": "audio/flac";
			"audio/mp4": "audio/mp4";
			"audio/mpeg": "audio/mpeg";
			"audio/ogg": "audio/ogg";
			"audio/wav": "audio/wav";
			"audio/webm": "audio/webm";
			"text/plain": "text/plain";
			"text/vtt": "text/vtt";
		}>;
		sizeBytes: z15.ZodNumber;
		durationSeconds: z15.ZodNullable<z15.ZodNumber>;
		state: z15.ZodEnum<{
			awaiting_rep: "awaiting_rep";
			deleted: "deleted";
			failed: "failed";
			processing: "processing";
			ready: "ready";
			transcribing: "transcribing";
			uploaded: "uploaded";
		}>;
		failureReason: z15.ZodNullable<z15.ZodEnum<{
			no_turns: "no_turns";
			not_per_side: "not_per_side";
			processing_failed: "processing_failed";
			rep_label_not_found: "rep_label_not_found";
			too_few_speakers: "too_few_speakers";
			too_long: "too_long";
			too_many_speakers: "too_many_speakers";
			transcription_failed: "transcription_failed";
			transcription_timed_out: "transcription_timed_out";
			unreadable: "unreadable";
		}>>;
		rep: z15.ZodNullable<z15.ZodDiscriminatedUnion<[z15.ZodObject<{
			by: z15.ZodLiteral<"speaker">;
			label: z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>;
		}, z15.core.$strict>, z15.ZodObject<{
			by: z15.ZodLiteral<"channel">;
			channel: z15.ZodEnum<{
				left: "left";
				right: "right";
			}>;
		}, z15.core.$strict>], "by">>;
		speakerLabels: z15.ZodArray<z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>>;
		deletedAt: z15.ZodNullable<z15.ZodISODateTime>;
		purgeAt: z15.ZodNullable<z15.ZodISODateTime>;
		uploadedByUserId: z15.core.$ZodBranded<z15.ZodString, "usr", "out">;
		createdAt: z15.ZodISODateTime;
		updatedAt: z15.ZodISODateTime;
	}, z15.core.$strip>>;
	nextCursor: z15.ZodNullable<z15.ZodString>;
}, z15.core.$strip>;
/** One page of Calls. */
type ListCallsResponse = z15.infer<typeof listCallsResponseSchema>;
/**
* The body of the request that picks or changes a Call's Rep: a required choice (`null` is not a
* choice). It is for a Call `awaiting_rep`, `ready` or `failed`, otherwise `call.rep_not_changeable`;
* a choice that does not suit the Call's kind or, for a speaker, is not among its labels is
* `call.rep_invalid`. It is idempotent by end state.
*/
declare const setCallRepRequestSchema: z15.ZodObject<{
	rep: z15.ZodDiscriminatedUnion<[z15.ZodObject<{
		by: z15.ZodLiteral<"speaker">;
		label: z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>;
	}, z15.core.$strict>, z15.ZodObject<{
		by: z15.ZodLiteral<"channel">;
		channel: z15.ZodEnum<{
			left: "left";
			right: "right";
		}>;
	}, z15.core.$strict>], "by">;
}, z15.core.$strict>;
/** The body of the request that picks or changes a Call's Rep. */
type SetCallRepRequest = z15.infer<typeof setCallRepRequestSchema>;
/** What the service reads off the file part of a Call upload, and the kind it was recognised as. */
declare const uploadCallFileSchema: z15.ZodObject<{
	fileName: z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>;
	declaredMediaType: z15.ZodNullable<z15.ZodString>;
	sizeBytes: z15.ZodNumber;
}, z15.core.$strict>;
/** The answer of {@link checkCallFile}: the parsed file and its kind, or the one error code to return. */
type CheckCallFileResult = {
	readonly ok: true;
	readonly kind: CallKind;
	readonly file: z15.infer<typeof uploadCallFileSchema>;
} | {
	readonly ok: false;
	readonly code: "call.too_large" | "call.unsupported_type" | "request.invalid";
};
/**
* The one call that checks the file part of a Call upload, in the style of `checkUploadFile`. It
* runs the size check first against the largest limit (`MAX_RECORDING_BYTES`, `call.too_large`
* 413), then the type on the stored form of the name (`call.unsupported_type` 415: the extension
* is judged after control and bidirectional characters are stripped and the name trimmed), then
* the limit of the recognised kind (a Transcript over `MAX_TRANSCRIPT_BYTES` is `call.too_large`),
* then the shape (`request.invalid`). The kind comes from the extension; the service confirms it
* from the content. Fields are read once, as own properties, into a copy all checks use, and a
* non-finite size, a missing field or an extra own key is `request.invalid`. The Recording's
* duration is not known here: the job checks `MAX_RECORDING_SECONDS`. The result carries no name or
* content, so it is safe to log.
*/
declare function checkCallFile(input: unknown): CheckCallFileResult;
/** The position a Call list continues from: `createdAt`, then the Call's own `id`. It never holds a deal id. */
declare const callCursorSchema: z15.ZodObject<{
	createdAt: z15.ZodISODateTime;
	id: z15.core.$ZodBranded<z15.ZodString, "call", "out">;
}, z15.core.$strict>;
/** The position a Call list continues from. */
type CallCursor = z15.infer<typeof callCursorSchema>;
import { z as z16 } from "zod";
/**
* A Deal as the service returns it. A Deal is named by the Organization's own `dealId` (customer
* text, never logged, never in a URL path) and addressed by its opaque `id` (`deal_…`). It is never
* deleted on its own in phase 1. An `open` Deal may carry a `closedAt`, an expected close date from
* a CRM; an `amount` always comes with a `currency`. `closedAt`, `amount`, `currency` and `name` are `null`
* until given. `callCount` counts Calls that are not deleted. `appearedInImport` is false for a
* Deal created by a Call upload that no CSV has named, so the portal can list likely typos. The
* Outcome sequence the re-tag job uses is not here. The service must send the output of
* `dealSchema.parse(row)`.
*/
declare const dealSchema: z16.ZodObject<{
	id: z16.core.$ZodBranded<z16.ZodString, "deal", "out">;
	dealId: z16.ZodPipe<z16.ZodPipe<z16.ZodString, z16.ZodTransform<string, string>>, z16.ZodString>;
	name: z16.ZodNullable<z16.ZodPipe<z16.ZodString, z16.ZodString>>;
	outcome: z16.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	closedAt: z16.ZodNullable<z16.ZodISODateTime>;
	amount: z16.ZodNullable<z16.ZodString>;
	currency: z16.ZodNullable<z16.ZodString>;
	callCount: z16.ZodNumber;
	appearedInImport: z16.ZodBoolean;
	createdAt: z16.ZodISODateTime;
	updatedAt: z16.ZodISODateTime;
}, z16.core.$strip>;
/** A Deal as the service returns it. */
type Deal = z16.infer<typeof dealSchema>;
/** The path parameters of a request about one Deal: its opaque id, never the customer's deal id. */
declare const dealParamsSchema: z16.ZodObject<{
	dealRecordId: z16.core.$ZodBranded<z16.ZodString, "deal", "out">;
}, z16.core.$strict>;
/** The path parameters of a request about one Deal. */
type DealParams = z16.infer<typeof dealParamsSchema>;
/**
* The query parameters of a request to list Deals: a page, and optionally one `outcome` and
* `appearedInImport` (`true` or `false`). `appearedInImport=false` lists the Deals that have Calls
* but never appeared in a CSV. An unknown parameter is rejected.
*/
declare const listDealsQuerySchema: z16.ZodObject<{
	cursor: z16.ZodOptional<z16.ZodString>;
	limit: z16.ZodDefault<z16.ZodPipe<z16.ZodPipe<z16.ZodUnion<readonly [z16.ZodNumber, z16.ZodString]>, z16.ZodTransform<number, string | number>>, z16.ZodNumber>>;
	outcome: z16.ZodOptional<z16.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>>;
	appearedInImport: z16.ZodOptional<z16.ZodPipe<z16.ZodEnum<{
		false: "false";
		true: "true";
	}>, z16.ZodTransform<boolean, "false" | "true">>>;
}, z16.core.$strict>;
/** The query parameters of a request to list Deals. */
type ListDealsQuery = z16.infer<typeof listDealsQuerySchema>;
/** One page of Deals. */
declare const listDealsResponseSchema: z16.ZodObject<{
	items: z16.ZodArray<z16.ZodObject<{
		id: z16.core.$ZodBranded<z16.ZodString, "deal", "out">;
		dealId: z16.ZodPipe<z16.ZodPipe<z16.ZodString, z16.ZodTransform<string, string>>, z16.ZodString>;
		name: z16.ZodNullable<z16.ZodPipe<z16.ZodString, z16.ZodString>>;
		outcome: z16.ZodEnum<{
			lost: "lost";
			open: "open";
			won: "won";
		}>;
		closedAt: z16.ZodNullable<z16.ZodISODateTime>;
		amount: z16.ZodNullable<z16.ZodString>;
		currency: z16.ZodNullable<z16.ZodString>;
		callCount: z16.ZodNumber;
		appearedInImport: z16.ZodBoolean;
		createdAt: z16.ZodISODateTime;
		updatedAt: z16.ZodISODateTime;
	}, z16.core.$strip>>;
	nextCursor: z16.ZodNullable<z16.ZodString>;
}, z16.core.$strip>;
/** One page of Deals. */
type ListDealsResponse = z16.infer<typeof listDealsResponseSchema>;
/**
* The body of the request that sets or corrects a Deal's Outcome (Owner and Admin, any Deal, even
* a decided one): the `outcome` and an optional `closedAt`, which an `open` Deal may carry too (an
* expected close date), as in the CSV. It is idempotent by end state, and a change queues the
* re-tag of the Deal's Moments.
*/
declare const setDealOutcomeRequestSchema: z16.ZodObject<{
	outcome: z16.ZodEnum<{
		lost: "lost";
		open: "open";
		won: "won";
	}>;
	closedAt: z16.ZodOptional<z16.ZodNullable<z16.ZodISODateTime>>;
}, z16.core.$strict>;
/** The body of the request that sets or corrects a Deal's Outcome. */
type SetDealOutcomeRequest = z16.infer<typeof setDealOutcomeRequestSchema>;
/**
* The body of the request that finds a Deal by the customer's deal id, so the id goes in a POST
* body and never in a URL. The answer is the Deal, or `deal.not_found`. Matching is exact after the
* trim.
*/
declare const lookupDealRequestSchema: z16.ZodObject<{
	dealId: z16.ZodPipe<z16.ZodPipe<z16.ZodString, z16.ZodTransform<string, string>>, z16.ZodString>;
}, z16.core.$strict>;
/** The body of the request that finds a Deal by the customer's deal id. */
type LookupDealRequest = z16.infer<typeof lookupDealRequestSchema>;
/** The position a Deal list continues from: `createdAt`, then the Deal's opaque `id`, never the customer's deal id. */
declare const dealCursorSchema: z16.ZodObject<{
	createdAt: z16.ZodISODateTime;
	id: z16.core.$ZodBranded<z16.ZodString, "deal", "out">;
}, z16.core.$strict>;
/** The position a Deal list continues from. */
type DealCursor = z16.infer<typeof dealCursorSchema>;
/** The position a Deal import list continues from: `createdAt`, then the import's `id`. */
declare const dealImportCursorSchema: z16.ZodObject<{
	createdAt: z16.ZodISODateTime;
	id: z16.core.$ZodBranded<z16.ZodString, "dimp", "out">;
}, z16.core.$strict>;
/** The position a Deal import list continues from. */
type DealImportCursor = z16.infer<typeof dealImportCursorSchema>;
/** The position an import report continues from: the `rowNumber` of the last row returned. */
declare const dealImportRowCursorSchema: z16.ZodObject<{
	rowNumber: z16.ZodNumber;
}, z16.core.$strict>;
/** The position an import report continues from. */
type DealImportRowCursor = z16.infer<typeof dealImportRowCursorSchema>;
/** The fields of the multipart upload of a Deal import: the CSV is the one file part (`file`), with no other part. The request carries an `Idempotency-Key` header. */
declare const DEAL_IMPORT_FILE_FIELD = "file";
/**
* A Deal import as the service returns it. It carries no file name and no cell. The counts are
* `null` until `completed`; `failureReason` is set exactly when `state` is `failed`. The report is
* the paginated rows ({@link listDealImportRowsResponseSchema}).
*/
declare const dealImportSchema: z16.ZodObject<{
	id: z16.core.$ZodBranded<z16.ZodString, "dimp", "out">;
	state: z16.ZodEnum<{
		completed: "completed";
		failed: "failed";
		processing: "processing";
		uploaded: "uploaded";
	}>;
	failureReason: z16.ZodNullable<z16.ZodEnum<{
		processing_failed: "processing_failed";
		too_many_rows: "too_many_rows";
		unreadable: "unreadable";
	}>>;
	rowCount: z16.ZodNullable<z16.ZodNumber>;
	appliedCount: z16.ZodNullable<z16.ZodNumber>;
	rejectedCount: z16.ZodNullable<z16.ZodNumber>;
	uploadedByUserId: z16.core.$ZodBranded<z16.ZodString, "usr", "out">;
	createdAt: z16.ZodISODateTime;
	updatedAt: z16.ZodISODateTime;
}, z16.core.$strip>;
/** A Deal import as the service returns it. */
type DealImport = z16.infer<typeof dealImportSchema>;
/** The path parameters of a request about one Deal import. */
declare const dealImportParamsSchema: z16.ZodObject<{
	importId: z16.core.$ZodBranded<z16.ZodString, "dimp", "out">;
}, z16.core.$strict>;
/** The path parameters of a request about one Deal import. */
type DealImportParams = z16.infer<typeof dealImportParamsSchema>;
/** The query parameters of a request to list Deal imports: a page. An unknown parameter is rejected. */
declare const listDealImportsQuerySchema: z16.ZodObject<{
	cursor: z16.ZodOptional<z16.ZodString>;
	limit: z16.ZodDefault<z16.ZodPipe<z16.ZodPipe<z16.ZodUnion<readonly [z16.ZodNumber, z16.ZodString]>, z16.ZodTransform<number, string | number>>, z16.ZodNumber>>;
}, z16.core.$strict>;
/** The query parameters of a request to list Deal imports. */
type ListDealImportsQuery = z16.infer<typeof listDealImportsQuerySchema>;
/** One page of Deal imports. */
declare const listDealImportsResponseSchema: z16.ZodObject<{
	items: z16.ZodArray<z16.ZodObject<{
		id: z16.core.$ZodBranded<z16.ZodString, "dimp", "out">;
		state: z16.ZodEnum<{
			completed: "completed";
			failed: "failed";
			processing: "processing";
			uploaded: "uploaded";
		}>;
		failureReason: z16.ZodNullable<z16.ZodEnum<{
			processing_failed: "processing_failed";
			too_many_rows: "too_many_rows";
			unreadable: "unreadable";
		}>>;
		rowCount: z16.ZodNullable<z16.ZodNumber>;
		appliedCount: z16.ZodNullable<z16.ZodNumber>;
		rejectedCount: z16.ZodNullable<z16.ZodNumber>;
		uploadedByUserId: z16.core.$ZodBranded<z16.ZodString, "usr", "out">;
		createdAt: z16.ZodISODateTime;
		updatedAt: z16.ZodISODateTime;
	}, z16.core.$strip>>;
	nextCursor: z16.ZodNullable<z16.ZodString>;
}, z16.core.$strip>;
/** One page of Deal imports. */
type ListDealImportsResponse = z16.infer<typeof listDealImportsResponseSchema>;
/**
* One row of an import report: the CSV `rowNumber`, the record number with the header as record 1
* (so the first data row is 2). A quoted cell that spans lines is one record, so `rowNumber` can
* differ from the physical line (see `parseCsv`),
* the `dealId` (the one free-text cell echoed; `null` when the cell was missing or not a valid deal
* id, so a bad cell is never echoed), the `result` and, for a rejected row, the `reason`. `reason`
* is `null` exactly when the result is `applied`. No other cell is ever part of a report.
*/
declare const dealImportRowSchema: z16.ZodObject<{
	rowNumber: z16.ZodNumber;
	dealId: z16.ZodNullable<z16.ZodPipe<z16.ZodPipe<z16.ZodString, z16.ZodTransform<string, string>>, z16.ZodString>>;
	result: z16.ZodEnum<{
		applied: "applied";
		rejected: "rejected";
	}>;
	reason: z16.ZodNullable<z16.ZodEnum<{
		deal_limit_reached: "deal_limit_reached";
		duplicate_in_file: "duplicate_in_file";
		invalid_amount: "invalid_amount";
		invalid_closed_at: "invalid_closed_at";
		invalid_currency: "invalid_currency";
		invalid_deal_id: "invalid_deal_id";
		invalid_name: "invalid_name";
		invalid_outcome: "invalid_outcome";
		outcome_already_decided: "outcome_already_decided";
		wrong_column_count: "wrong_column_count";
	}>>;
}, z16.core.$strip>;
/** One row of an import report. */
type DealImportRow = z16.infer<typeof dealImportRowSchema>;
/** The query parameters of a request to read an import's rows: a page, and optionally only the `rejected` or only the `applied` rows. Rows are in CSV order. An unknown parameter is rejected. */
declare const listDealImportRowsQuerySchema: z16.ZodObject<{
	cursor: z16.ZodOptional<z16.ZodString>;
	limit: z16.ZodDefault<z16.ZodPipe<z16.ZodPipe<z16.ZodUnion<readonly [z16.ZodNumber, z16.ZodString]>, z16.ZodTransform<number, string | number>>, z16.ZodNumber>>;
	result: z16.ZodOptional<z16.ZodEnum<{
		applied: "applied";
		rejected: "rejected";
	}>>;
}, z16.core.$strict>;
/** The query parameters of a request to read an import's rows. */
type ListDealImportRowsQuery = z16.infer<typeof listDealImportRowsQuerySchema>;
/** One page of an import report. */
declare const listDealImportRowsResponseSchema: z16.ZodObject<{
	items: z16.ZodArray<z16.ZodObject<{
		rowNumber: z16.ZodNumber;
		dealId: z16.ZodNullable<z16.ZodPipe<z16.ZodPipe<z16.ZodString, z16.ZodTransform<string, string>>, z16.ZodString>>;
		result: z16.ZodEnum<{
			applied: "applied";
			rejected: "rejected";
		}>;
		reason: z16.ZodNullable<z16.ZodEnum<{
			deal_limit_reached: "deal_limit_reached";
			duplicate_in_file: "duplicate_in_file";
			invalid_amount: "invalid_amount";
			invalid_closed_at: "invalid_closed_at";
			invalid_currency: "invalid_currency";
			invalid_deal_id: "invalid_deal_id";
			invalid_name: "invalid_name";
			invalid_outcome: "invalid_outcome";
			outcome_already_decided: "outcome_already_decided";
			wrong_column_count: "wrong_column_count";
		}>>;
	}, z16.core.$strip>>;
	nextCursor: z16.ZodNullable<z16.ZodString>;
}, z16.core.$strip>;
/** One page of an import report. */
type ListDealImportRowsResponse = z16.infer<typeof listDealImportRowsResponseSchema>;
import { z as z17 } from "zod";
/** The Outcome of a Deal: `won`, `lost` or still `open` (glossary). */
declare const OUTCOMES: readonly ["won", "lost", "open"];
/** The Outcome of a Deal. */
declare const outcomeSchema: z17.ZodEnum<{
	lost: "lost";
	open: "open";
	won: "won";
}>;
/** The Outcome of a Deal. */
type Outcome = z17.infer<typeof outcomeSchema>;
/** The ticket's choice (ADR 0018 leaves it open): the longest deal id, in Unicode code points, after trimming. */
declare const MAX_DEAL_ID_LENGTH = 128;
/** The most UTF-8 bytes a stored deal id can take: 128 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_DEAL_ID_BYTES: number;
/**
* Normalises a deal id: trims surrounding whitespace and changes nothing else. The comparison is
* exact and case-sensitive (`A-1` and `a-1` are two Deals) with no Unicode normalisation, as ADR
* 0018 says, so two ids are the same only if they are the same code points after the trim.
*/
declare function normaliseDealId(dealId: string): string;
/**
* A deal id (the Organization's own identifier for a Deal), in a body, a CSV cell, the upload field,
* a list filter and a response, never in a URL path (a Deal's path id is the opaque `deal_…` id): at
* most 1000 raw Unicode code points, trimmed, then 1 to 128 Unicode code points (at most
* `MAX_DEAL_ID_BYTES` bytes in UTF-8), well-formed, with no control character, bidirectional
* character, Unicode format character (category Cf, so no soft hyphen, zero-width, word joiner or
* tag character), line or paragraph separator or Hangul filler; homoglyphs are accepted and stay
* distinct ids. It is customer-chosen text that may hold a person's or a company's name, so it is
* never logged. Unlike a file name it is rejected, not stripped, because stripping could make two
* ids equal. It is compared exactly and case-sensitively after the trim ({@link normaliseDealId}).
* It is the only free-text cell an import report may echo, and untrusted text for display.
*/
declare const dealIdSchema: z17.ZodPipe<z17.ZodPipe<z17.ZodString, z17.ZodTransform<string, string>>, z17.ZodString>;
/** A deal id. */
type DealId = z17.infer<typeof dealIdSchema>;
/** The longest Deal name, in Unicode code points, once trimmed. */
declare const MAX_DEAL_NAME_LENGTH = 200;
/** The most UTF-8 bytes a stored Deal name can take: 200 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_DEAL_NAME_BYTES: number;
/** A Deal's optional name: trimmed, 1 to 200 well-formed Unicode code points (at most `MAX_DEAL_NAME_BYTES` bytes), no control character. Untrusted text for display, never logged. */
declare const dealNameSchema: z17.ZodPipe<z17.ZodString, z17.ZodString>;
/** A money amount as a decimal string, never a float: not negative, at most 15 integer digits (the maximum is 999999999999999.99) and 2 fraction digits, no leading zero beyond a single `0`. */
declare const dealAmountSchema: z17.ZodString;
/** A currency as an upper-case ISO 4217 code of three letters. */
declare const dealCurrencySchema: z17.ZodString;
/** The lead's default (ADR 0018, refinements; not the owner's): the largest CSV accepted, 10 MB counted as 10 * 1024 * 1024 bytes. */
declare const MAX_DEAL_IMPORT_BYTES: number;
/** The lead's default (ADR 0018, refinements; not the owner's): the most data rows in one CSV. */
declare const MAX_DEAL_IMPORT_ROWS = 5e4;
/** The required columns of the CSV template, in order. */
declare const DEAL_IMPORT_REQUIRED_COLUMNS: readonly ["deal_id", "outcome", "closed_at", "amount", "currency"];
/** The optional column of the CSV template, which may follow the required ones. */
declare const DEAL_IMPORT_OPTIONAL_COLUMN = "name";
/** The longest header, its trimmed cells joined by commas, in characters; a longer one is refused. A valid header is under 50, so this only bounds padding-free garbage. It is about the trimmed content, not how much of the file is read: that is {@link DEAL_IMPORT_HEADER_PREFIX_CHARS}. */
declare const MAX_DEAL_IMPORT_HEADER_LENGTH = 1024;
/**
* How much of the start of the file the upload route passes to {@link checkDealImportHeaderText}:
* 8192 characters, more than the largest header that is valid under the cell limit (six cells of
* 1000 characters, each also quoted, plus separators, a byte order mark and a line break, about
* 6020). A header record that is still not finished at the end of a full prefix cannot be judged, so
* the early check answers `{ ok: true, deferred: true }` (no refusal) and leaves the verdict to the
* job; it never refuses a header it has only seen part of.
*/
declare const DEAL_IMPORT_HEADER_PREFIX_CHARS = 8192;
/** Why a CSV header was refused: a closed list, so the answer never echoes a cell. */
declare const DEAL_IMPORT_HEADER_PROBLEMS: readonly ["empty", "too_long", "missing_column", "unexpected_column", "wrong_order", "malformed_csv"];
/** Why a CSV header was refused. */
type DealImportHeaderProblem = (typeof DEAL_IMPORT_HEADER_PROBLEMS)[number];
/** The answer of {@link checkDealImportHeader}. */
type CheckDealImportHeaderResult = {
	readonly ok: true;
	readonly hasName: boolean;
} | {
	readonly ok: false;
	readonly code: "deal_import.header_invalid";
	readonly problem: DealImportHeaderProblem;
};
/**
* Checks the first record of a CSV against the fixed template: `deal_id,outcome,closed_at,amount,
* currency` in that order, optionally followed by `name`. Column names are lower case and exact;
* each cell is trimmed. It takes the record as {@link parseCsv} or {@link firstCsvRecord} produced
* it, so quoting, a byte order mark and every line ending are already handled and both readers give
* one verdict. A refusal is `deal_import.header_invalid` (422) and names a closed `problem`, never a
* cell. The upload route calls {@link checkDealImportHeaderText} on the start of the file; the job
* re-checks the first record of its full parse with this.
*/
declare function checkDealImportHeader(record: readonly string[]): CheckDealImportHeaderResult;
/** The answer of {@link checkDealImportHeaderText}: the verdict, or `{ ok: true, deferred: true }` when the prefix ended before the header did and the job must decide. */
type CheckDealImportHeaderTextResult = CheckDealImportHeaderResult | {
	readonly ok: true;
	readonly deferred: true;
};
/**
* The early header check of the upload route: reads the first record of the start of the file with
* {@link firstCsvRecord} (the same rules and limits as the full parse) and checks it with
* {@link checkDealImportHeader}. The caller passes the first `DEAL_IMPORT_HEADER_PREFIX_CHARS`
* characters of the file (or all of it if shorter). If that is a full prefix and the header record is
* still unfinished, the answer is `{ ok: true, deferred: true }`, not a refusal. A cell over the limit is
* `too_long` and a quoting error is `malformed_csv`, and the verdict equals the one the job reaches
* from the whole file.
*/
declare function checkDealImportHeaderText(text: string): CheckDealImportHeaderTextResult;
/** The states a Deal import is in: `uploaded`, then `processing`, then `completed` or `failed`. */
declare const DEAL_IMPORT_STATES: readonly ["uploaded", "processing", "completed", "failed"];
/** The state of a Deal import. */
declare const dealImportStateSchema: z17.ZodEnum<{
	completed: "completed";
	failed: "failed";
	processing: "processing";
	uploaded: "uploaded";
}>;
/** The state of a Deal import. */
type DealImportState = z17.infer<typeof dealImportStateSchema>;
/** Why a whole import ended `failed`: a closed list. A bad row is not a failure of the import. */
declare const DEAL_IMPORT_FAILURE_REASONS: readonly ["too_many_rows", "unreadable", "processing_failed"];
/** Why a whole import ended `failed`. */
declare const dealImportFailureReasonSchema: z17.ZodEnum<{
	processing_failed: "processing_failed";
	too_many_rows: "too_many_rows";
	unreadable: "unreadable";
}>;
/** Why a whole import ended `failed`. */
type DealImportFailureReason = z17.infer<typeof dealImportFailureReasonSchema>;
/** The result of one CSV row: `applied`, or `rejected` with a reason. */
declare const DEAL_IMPORT_ROW_RESULTS: readonly ["applied", "rejected"];
/** The result of one CSV row. */
declare const dealImportRowResultSchema: z17.ZodEnum<{
	applied: "applied";
	rejected: "rejected";
}>;
/** The result of one CSV row. */
type DealImportRowResult = z17.infer<typeof dealImportRowResultSchema>;
/**
* Why a row was rejected: a closed list, never a cell. A row is rejected, not silently dropped,
* and never an HTTP error. `outcome_already_decided` is a row for a Deal already `won` or `lost`
* (ADR 0018, choice 5); `duplicate_in_file` is a deal id repeated after its first row.
*/
declare const DEAL_IMPORT_ROW_REASONS: readonly ["wrong_column_count", "invalid_deal_id", "duplicate_in_file", "invalid_outcome", "invalid_closed_at", "invalid_amount", "invalid_currency", "invalid_name", "outcome_already_decided", "deal_limit_reached"];
/** Why a row was rejected. */
declare const dealImportRowReasonSchema: z17.ZodEnum<{
	deal_limit_reached: "deal_limit_reached";
	duplicate_in_file: "duplicate_in_file";
	invalid_amount: "invalid_amount";
	invalid_closed_at: "invalid_closed_at";
	invalid_currency: "invalid_currency";
	invalid_deal_id: "invalid_deal_id";
	invalid_name: "invalid_name";
	invalid_outcome: "invalid_outcome";
	outcome_already_decided: "outcome_already_decided";
	wrong_column_count: "wrong_column_count";
}>;
/** Why a row was rejected. */
type DealImportRowReason = z17.infer<typeof dealImportRowReasonSchema>;
/** The answer of a CSV cell parser: the parsed value, or not valid. */
type CellResult<T> = {
	readonly ok: true;
	readonly value: T;
} | {
	readonly ok: false;
};
/** The earliest year a `closed_at` may have (inclusive), so a typo such as year 0001 or 9999 is caught. */
declare const DEAL_CLOSED_AT_MIN_YEAR = 1970;
/** The latest year a `closed_at` may have (inclusive). */
declare const DEAL_CLOSED_AT_MAX_YEAR = 2100;
/** Reads the `outcome` cell: `won`, `lost` or `open`, compared case-insensitively after trimming. A blank cell is not valid: the column is required. */
declare function parseOutcomeCell(cell: string): CellResult<Outcome>;
/**
* Reads the `closed_at` cell. Blank is none (`null`); `won` and `lost` do not require it, and an
* `open` Deal may carry an expected close date. Otherwise it is a calendar date `YYYY-MM-DD`, read
* as that day at 00:00 UTC, or an ISO 8601 timestamp with an offset (`Z` or `+02:00`). The value is
* always the UTC ISO timestamp with milliseconds. The year, in UTC, must be from
* `DEAL_CLOSED_AT_MIN_YEAR` (1970) to `DEAL_CLOSED_AT_MAX_YEAR` (2100) inclusive, else it is not valid.
*/
declare function parseClosedAtCell(cell: string): CellResult<string | null>;
/** Reads the `amount` cell: blank is none; otherwise a non-negative decimal as {@link dealAmountSchema} describes (at most 999999999999999.99). */
declare function parseAmountCell(cell: string): CellResult<string | null>;
/** Reads the `currency` cell: blank is none; otherwise three letters, folded to upper case. A currency is required when an amount is present, which {@link checkDealImportRow} checks. */
declare function parseCurrencyCell(cell: string): CellResult<string | null>;
/** One CSV data row once its cells are read. */
type ParsedDealImportRow = {
	readonly dealId: string;
	readonly outcome: Outcome;
	readonly closedAt: string | null;
	readonly amount: string | null;
	readonly currency: string | null;
	readonly name: string | null;
};
/** The answer of {@link checkDealImportRow}: the parsed row, or the one reason code of the report. */
type CheckDealImportRowResult = {
	readonly ok: true;
	readonly row: ParsedDealImportRow;
} | {
	readonly ok: false;
	readonly reason: DealImportRowReason;
};
/**
* Reads one CSV record's cells (already split, so a quoted cell with a comma or a line break is one
* cell; see {@link parseCsv}) against the template, so the portal and the service agree. Every cell
* is trimmed; blank optional cells are none. Cell count must be 5, or 6 when the header has `name`
* (`wrong_column_count`). The problems are reported in column order and only the first is returned:
* `invalid_deal_id`, `invalid_outcome`, `invalid_closed_at`, `invalid_amount`, `invalid_currency`
* (including an amount with no currency) and `invalid_name`. Whether the Deal is already decided,
* repeated in the file or over the quota is the service's, as those need its data.
*/
declare function checkDealImportRow(cells: readonly string[], hasName: boolean): CheckDealImportRowResult;
/**
* The longest cell {@link parseCsv} reads, in Unicode code points: 1000, the raw bound the deal id
* and Deal name schemas allow before they trim. It only bounds memory; the row checks do the
* reporting, so a name of 201 characters is a rejected row (`invalid_name`) and a valid name padded
* with spaces still imports. A cell over 1000 characters, like a quoting error, fails the whole file.
*/
declare const MAX_DEAL_IMPORT_CELL_LENGTH = 1e3;
/** Why a CSV could not be read: more records than allowed, a cell over the length limit, a quote that never closes, or a quote where RFC 4180 does not allow one. */
declare const CSV_FAILURES: readonly ["too_many_records", "cell_too_long", "unterminated_quote", "bad_quote"];
/** Why a CSV could not be read. */
type CsvFailure = (typeof CSV_FAILURES)[number];
/** The limits of a CSV read. */
type CsvOptions = {
	/** The most records to read, header and blank records included; default `MAX_DEAL_IMPORT_ROWS + 1`. */
	readonly maxRecords?: number;
	/** The longest cell, in Unicode code points; default `MAX_DEAL_IMPORT_CELL_LENGTH`. */
	readonly maxCellLength?: number;
};
/** The answer of {@link parseCsv}: the records, or the failure and how many records were read before it. */
type CsvResult = {
	readonly ok: true;
	readonly records: string[][];
} | {
	readonly ok: false;
	readonly failure: CsvFailure;
	readonly recordsRead: number;
};
/** The answer of {@link firstCsvRecord}: the first record (`undefined` for empty text) and whether a line break ended it, or the failure. */
type FirstCsvRecordResult = {
	readonly ok: true;
	readonly record: string[] | undefined;
	readonly complete: boolean;
} | {
	readonly ok: false;
	readonly failure: CsvFailure;
	readonly recordsRead: number;
};
/**
* Splits CSV text into records of cells under strict RFC 4180: a cell may be double-quoted, `""` is
* a quote inside one, and a quoted cell may hold commas and line breaks; a line break is `\n`, `\r\n`
* or `\r`, a leading byte order mark is dropped, and one final line break does not add a record. A
* quote inside an unquoted cell, or any text between a closing quote and the next comma or line
* break, fails the whole file as `bad_quote`, and a quote that never closes is `unterminated_quote`;
* there is no leniency.
*
* It stops as soon as a limit is passed, having built at most that much: more than
* `options.maxRecords` records is `too_many_records` and a cell longer than `options.maxCellLength`
* code points is `cell_too_long`, each with `recordsRead`. The caller passes
* `maxRecords: MAX_DEAL_IMPORT_ROWS + 1` (the default): the header is record 1, and blank records
* count toward the limit because they cost memory. It needs the whole text in memory (up to
* `MAX_DEAL_IMPORT_BYTES`), so it belongs in a background job, never on a request path; the upload
* route reads only the header, with {@link checkDealImportHeaderText}.
*
* The first record is the header, so the **record number** is the index plus one, with the header
* as record 1: a report's `rowNumber` is a record number, and a quoted cell spanning lines is one
* record, so it can differ from the physical line. A blank line is a record of one empty cell
* ({@link isBlankCsvRecord}): it is kept, so numbers match what a spreadsheet shows, and the caller
* skips it without reporting it.
*/
declare function parseCsv(text: string, options?: CsvOptions): CsvResult;
/**
* Reads only the first record of CSV text with the same rules and limits as {@link parseCsv}, and
* stops there: a later bad record does not change its answer. `record` is `undefined` for empty text, and `complete` is whether a line break ended it (false when the text ran out first).
*/
declare function firstCsvRecord(text: string, options?: CsvOptions): FirstCsvRecordResult;
/** Whether a CSV record is a blank line: one empty cell. A caller skips it without reporting it, but it still counts in the record number. */
declare function isBlankCsvRecord(record: readonly string[]): boolean;
import { z as z18 } from "zod";
/**
* A Playbook document as the service returns it. It names the file but never carries its content,
* and no text taken from it. The extension of `fileName` and `mediaType` are not checked against each other: that agreement is
* the service's job, as only it knows the declared and the detected type, and the contract does
* not enforce it. `failureReason` is set exactly when `state` is `failed`. `purgeAt` is
* set exactly when `state` is `deleted`: the time the file and record will be purged
* (`DOCUMENT_RETENTION_DAYS` after `deletedAt`); a restore is refused after it. `pageCount` is
* `null` until ingestion has counted the pages. The service must send the output of
* `documentSchema.parse(row)`, never the row.
*/
declare const documentSchema: z18.ZodObject<{
	id: z18.core.$ZodBranded<z18.ZodString, "doc", "out">;
	fileName: z18.ZodPipe<z18.ZodPipe<z18.ZodString, z18.ZodTransform<string, string>>, z18.ZodString>;
	mediaType: z18.ZodEnum<{
		"application/pdf": "application/pdf";
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
		"text/markdown": "text/markdown";
		"text/plain": "text/plain";
	}>;
	sizeBytes: z18.ZodNumber;
	pageCount: z18.ZodNullable<z18.ZodNumber>;
	state: z18.ZodEnum<{
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		uploaded: "uploaded";
	}>;
	failureReason: z18.ZodNullable<z18.ZodEnum<{
		no_text: "no_text";
		password_protected: "password_protected";
		processing_failed: "processing_failed";
		too_many_pages: "too_many_pages";
		unreadable: "unreadable";
	}>>;
	deletedAt: z18.ZodNullable<z18.ZodISODateTime>;
	purgeAt: z18.ZodNullable<z18.ZodISODateTime>;
	uploadedByUserId: z18.core.$ZodBranded<z18.ZodString, "usr", "out">;
	createdAt: z18.ZodISODateTime;
	updatedAt: z18.ZodISODateTime;
}, z18.core.$strip>;
/** A Playbook document as the service returns it. */
type PlaybookDocument = z18.infer<typeof documentSchema>;
/** The name of the multipart form field that carries the file. */
declare const UPLOAD_FILE_FIELD = "file";
/** The content type of an upload request: `multipart/form-data` with one file part named {@link UPLOAD_FILE_FIELD}. */
declare const UPLOAD_CONTENT_TYPE = "multipart/form-data";
/**
* What the service reads off the file part of an upload before it stores anything: the
* `fileName` of the part, the media type the client declared (`declaredMediaType`, advisory only;
* the service inspects the content too, because an upload is untrusted data) and the `sizeBytes`
* counted while reading. The file itself is a multipart part, not a JSON field, and appears in no
* schema. The request has no other part; it carries an `Idempotency-Key` header.
*
* This schema checks only shape (a well-formed name, a non-empty file) and a failure is
* `request.invalid` (400). A service calls {@link checkUploadFile}, which runs it after the size
* and type checks so each gets its own code.
*/
declare const uploadDocumentFileSchema: z18.ZodObject<{
	fileName: z18.ZodPipe<z18.ZodPipe<z18.ZodString, z18.ZodTransform<string, string>>, z18.ZodString>;
	declaredMediaType: z18.ZodNullable<z18.ZodString>;
	sizeBytes: z18.ZodNumber;
}, z18.core.$strict>;
/** What the service reads off the file part of an upload. */
type UploadDocumentFile = z18.infer<typeof uploadDocumentFileSchema>;
/** The path parameters of a request about one document. */
declare const documentParamsSchema: z18.ZodObject<{
	documentId: z18.core.$ZodBranded<z18.ZodString, "doc", "out">;
}, z18.core.$strict>;
/** The path parameters of a request about one document. */
type DocumentParams = z18.infer<typeof documentParamsSchema>;
/**
* The query parameters of a request to list documents: a page, and optionally one `state`. With
* no `state`, every document that is not `deleted` is listed; `state=deleted` lists the documents
* that can still be restored. An unknown parameter is rejected.
*/
declare const listDocumentsQuerySchema: z18.ZodObject<{
	cursor: z18.ZodOptional<z18.ZodString>;
	limit: z18.ZodDefault<z18.ZodPipe<z18.ZodPipe<z18.ZodUnion<readonly [z18.ZodNumber, z18.ZodString]>, z18.ZodTransform<number, string | number>>, z18.ZodNumber>>;
	state: z18.ZodOptional<z18.ZodEnum<{
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		uploaded: "uploaded";
	}>>;
}, z18.core.$strict>;
/** The query parameters of a request to list documents. */
type ListDocumentsQuery = z18.infer<typeof listDocumentsQuerySchema>;
/** One page of documents. */
declare const listDocumentsResponseSchema: z18.ZodObject<{
	items: z18.ZodArray<z18.ZodObject<{
		id: z18.core.$ZodBranded<z18.ZodString, "doc", "out">;
		fileName: z18.ZodPipe<z18.ZodPipe<z18.ZodString, z18.ZodTransform<string, string>>, z18.ZodString>;
		mediaType: z18.ZodEnum<{
			"application/pdf": "application/pdf";
			"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
			"text/markdown": "text/markdown";
			"text/plain": "text/plain";
		}>;
		sizeBytes: z18.ZodNumber;
		pageCount: z18.ZodNullable<z18.ZodNumber>;
		state: z18.ZodEnum<{
			deleted: "deleted";
			failed: "failed";
			processing: "processing";
			ready: "ready";
			uploaded: "uploaded";
		}>;
		failureReason: z18.ZodNullable<z18.ZodEnum<{
			no_text: "no_text";
			password_protected: "password_protected";
			processing_failed: "processing_failed";
			too_many_pages: "too_many_pages";
			unreadable: "unreadable";
		}>>;
		deletedAt: z18.ZodNullable<z18.ZodISODateTime>;
		purgeAt: z18.ZodNullable<z18.ZodISODateTime>;
		uploadedByUserId: z18.core.$ZodBranded<z18.ZodString, "usr", "out">;
		createdAt: z18.ZodISODateTime;
		updatedAt: z18.ZodISODateTime;
	}, z18.core.$strip>>;
	nextCursor: z18.ZodNullable<z18.ZodString>;
}, z18.core.$strip>;
/** One page of documents. */
type ListDocumentsResponse = z18.infer<typeof listDocumentsResponseSchema>;
/**
* Internal: the path parameters of the call that removes everything an Organization has in the
* Playbook. The Organization is named in the path, never taken from the caller's token.
*/
declare const internalRemoveOrganizationDocumentsParamsSchema: z18.ZodObject<{
	organizationId: z18.core.$ZodBranded<z18.ZodString, "org", "out">;
}, z18.core.$strict>;
/** Internal: the path parameters of the remove-everything call. */
type InternalRemoveOrganizationDocumentsParams = z18.infer<typeof internalRemoveOrganizationDocumentsParamsSchema>;
/**
* Internal: `POST /internal/playbook/organizations/{organizationId}/remove-all`, for offboarding
* and erasure; no caller yet. The body is empty. It cancels ingestion in flight and removes every
* file, chunk, vector and record the Organization has, soft-deleted documents included, without
* waiting for retention. It carries an `Idempotency-Key` header and is defined by its end state:
* it answers success whenever nothing remains when it returns, whether this call, an earlier one
* or nobody ever stored anything, so a repeat under any key answers the same and success does not
* mean this call removed anything. It returns no domain error code.
*/
declare const internalRemoveOrganizationDocumentsRequestSchema: z18.ZodObject<{}, z18.core.$strict>;
/** Internal: the body of the remove-everything call. */
type InternalRemoveOrganizationDocumentsRequest = z18.infer<typeof internalRemoveOrganizationDocumentsRequestSchema>;
/** Internal: the answer to the remove-everything call: always `removed`. */
declare const internalRemoveOrganizationDocumentsResponseSchema: z18.ZodObject<{
	organizationId: z18.core.$ZodBranded<z18.ZodString, "org", "out">;
	status: z18.ZodLiteral<"removed">;
}, z18.core.$strip>;
/** Internal: the answer to the remove-everything call. */
type InternalRemoveOrganizationDocumentsResponse = z18.infer<typeof internalRemoveOrganizationDocumentsResponseSchema>;
/** The answer of {@link checkUploadFile}: the parsed file, or the one error code to return. */
type CheckUploadFileResult = {
	readonly ok: true;
	readonly file: UploadDocumentFile;
} | {
	readonly ok: false;
	readonly code: "document.too_large" | "document.unsupported_type" | "request.invalid";
};
/**
* The one call that checks the file part of an upload, so a service cannot skip a step. It runs
* the size check first (`document.too_large`, 413, so an over-size `.exe` is only too large), then
* the type check on the stored form of the name (`document.unsupported_type`, 415: the extension
* is judged after control and bidirectional characters are stripped and the name is trimmed, so
* `report.pdf ` is accepted and stored as `report.pdf`), then the shape
* ({@link uploadDocumentFileSchema}, `request.invalid`, 400). Input that is not an object with a
* string name and a finite numeric size (so `NaN` and the infinities too), or that has an own key
* other than the three, is `request.invalid`. Each field is read once, as an own property, into a
* copy that all three checks use, so a changing getter or an inherited property cannot pass a check
* the parsed value would fail. On success `file` is the parsed form, with
* the stored name. The result carries no name or content, so it is safe to log and to return.
*/
declare function checkUploadFile(input: unknown): CheckUploadFileResult;
import { z as z19 } from "zod";
/** The payload of {@link DOCUMENT_UPLOADED_MESSAGE}: the document to ingest. */
declare const documentUploadedPayloadSchema: z19.ZodObject<{
	documentId: z19.core.$ZodBranded<z19.ZodString, "doc", "out">;
}, z19.core.$strict>;
/** The payload of {@link DOCUMENT_UPLOADED_MESSAGE}. */
type DocumentUploadedPayload = z19.infer<typeof documentUploadedPayloadSchema>;
/**
* The message that starts ingestion of a document: published after an upload is stored, and again
* when a soft-deleted document is restored (it is re-ingested from the kept file). The job is
* idempotent and resumable, keyed on the document.
*/
declare const DOCUMENT_UPLOADED_MESSAGE: {
	readonly type: "playbook.document_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z19.ZodObject<{
		documentId: z19.core.$ZodBranded<z19.ZodString, "doc", "out">;
	}, z19.core.$strict>;
};
/** The largest `deletionSeq`: the db column is a Postgres `integer`, so the message cannot carry more. */
declare const MAX_DELETION_SEQ = 2147483647;
/**
* The payload of {@link DOCUMENT_DELETED_MESSAGE}: the document and its `deletionSeq`, an integer
* from 1 to {@link MAX_DELETION_SEQ} that the service increases in the same write as each delete. The cleanup applies only
* when the document is still `deleted` and its stored sequence equals this one, so a restore, or
* a later delete, makes an older message do nothing. A timestamp is not the guard: Postgres keeps
* microseconds, a JSON timestamp does not, and two deletions can share a clock tick. The sequence
* is not on the public document schema. Only a delete that changes the state bumps it: a repeated
* delete of an already deleted document does not bump the sequence and does not publish again.
*/
declare const documentDeletedPayloadSchema: z19.ZodObject<{
	documentId: z19.core.$ZodBranded<z19.ZodString, "doc", "out">;
	deletionSeq: z19.ZodNumber;
}, z19.core.$strict>;
/** The payload of {@link DOCUMENT_DELETED_MESSAGE}. */
type DocumentDeletedPayload = z19.infer<typeof documentDeletedPayloadSchema>;
/**
* The message that queues the removal of a deleted document's vectors, published by the delete
* request. It is cleanup only: search hides a deleted document by its state, never by this job.
*/
declare const DOCUMENT_DELETED_MESSAGE: {
	readonly type: "playbook.document_deleted";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z19.ZodObject<{
		documentId: z19.core.$ZodBranded<z19.ZodString, "doc", "out">;
		deletionSeq: z19.ZodNumber;
	}, z19.core.$strict>;
};
import { z as z20 } from "zod";
/** The largest wording version number; versions are positive integers, one for each entry of `RIGHTS_WORDINGS`. */
declare const MAX_RIGHTS_WORDING_VERSION = 1e6;
/** The version of the rights-confirmation wording: a positive integer. The text of each version is in `RIGHTS_WORDINGS`. */
declare const rightsWordingVersionSchema: z20.ZodNumber;
/**
* The recorded confirmation (ADR 0018, choice 12): that an Owner or Admin confirmed the
* Organization may share its Recordings and Transcripts, with the `wordingVersion` shown, who
* (`confirmedByUserId`) and when. There is one per Organization; a new one replaces it.
*/
declare const rightsConfirmationSchema: z20.ZodObject<{
	wordingVersion: z20.ZodNumber;
	confirmedByUserId: z20.core.$ZodBranded<z20.ZodString, "usr", "out">;
	confirmedAt: z20.ZodISODateTime;
}, z20.core.$strip>;
/** The recorded confirmation. */
type RightsConfirmation = z20.infer<typeof rightsConfirmationSchema>;
/**
* The answer to reading the confirmation: the `currentWordingVersion` the portal must show,
* the stored `confirmation` (`null` if none) and `confirmed`, true only when the stored version
* is the current one. `currentWording` is the text of the current version, optional so a service
* built before the wording moved into the contract still parses and a consumer reads the text from
* `RIGHTS_WORDINGS` when it is absent. Uploads of Calls are refused with `rights.confirmation_required` unless
* `confirmed`; existing Calls stay and stay searchable.
*/
declare const rightsStatusSchema: z20.ZodObject<{
	currentWordingVersion: z20.ZodNumber;
	confirmation: z20.ZodNullable<z20.ZodObject<{
		wordingVersion: z20.ZodNumber;
		confirmedByUserId: z20.core.$ZodBranded<z20.ZodString, "usr", "out">;
		confirmedAt: z20.ZodISODateTime;
	}, z20.core.$strip>>;
	confirmed: z20.ZodBoolean;
	currentWording: z20.ZodOptional<z20.ZodObject<{
		heading: z20.ZodString;
		paragraphs: z20.ZodArray<z20.ZodString>;
		checkbox: z20.ZodString;
		draft: z20.ZodOptional<z20.ZodLiteral<true>>;
	}, z20.core.$strict>>;
}, z20.core.$strip>;
/** The answer to reading the confirmation. */
type RightsStatus = z20.infer<typeof rightsStatusSchema>;
/**
* The body of the request that records the confirmation: the `wordingVersion` the member was shown,
* which must be the current one (else `rights.version_outdated`). Who and when come from the token
* and the clock, never from the body. Idempotent by end state.
*/
declare const confirmRightsRequestSchema: z20.ZodObject<{
	wordingVersion: z20.ZodNumber;
}, z20.core.$strict>;
/** The body of the request that records the confirmation. */
type ConfirmRightsRequest = z20.infer<typeof confirmRightsRequestSchema>;
import { z as z21 } from "zod";
/** The longest heading of a wording, in Unicode code points. */
declare const MAX_RIGHTS_HEADING_LENGTH = 200;
/** The most paragraphs a wording may have. */
declare const MAX_RIGHTS_PARAGRAPHS = 10;
/** The longest paragraph or confirmation sentence of a wording, in Unicode code points. */
declare const MAX_RIGHTS_TEXT_LENGTH = 2e3;
/**
* The text of one version of the rights confirmation: a `heading`, up to ten `paragraphs` and the
* `checkbox` sentence the member agrees to. It is plain text (no markup) and is shown exactly as
* written, never interpolated with a name or a value. `draft` is true while a lawyer has not
* checked the text; the screen says so.
*/
declare const rightsWordingSchema: z21.ZodObject<{
	heading: z21.ZodString;
	paragraphs: z21.ZodArray<z21.ZodString>;
	checkbox: z21.ZodString;
	draft: z21.ZodOptional<z21.ZodLiteral<true>>;
}, z21.core.$strict>;
/** The text of one version of the rights confirmation. */
type RightsWording = z21.infer<typeof rightsWordingSchema>;
/**
* The text of every version of the rights confirmation (ADR 0018, choice 12), keyed by version,
* frozen. A version is published once and never edited: a change to the text is a new version here
* and therefore a contract release, and the current version below follows from it.
*
* PENDING A LAWYER'S CHECK: version 1 is a draft (the owner decision of 2026-10-14 put the wording
* in the contract; ADR 0018 requires a lawyer to check it before real customers use it). Remove
* `draft` only in a new version, once it has been checked. It is taken verbatim from the portal's
* draft.
*/
declare const RIGHTS_WORDINGS: Readonly<Record<number, RightsWording>>;
/** The current version of the rights wording: the highest key of {@link RIGHTS_WORDINGS}. A service reads it instead of a setting. */
declare const CURRENT_RIGHTS_WORDING_VERSION: number;
/** The text of a version, or undefined when the contract has none; a version without text cannot be confirmed. */
declare function rightsWordingFor(version: number): RightsWording | undefined;
import { z as z22 } from "zod";
/** The largest Outcome or Rep sequence: the db column is a Postgres `integer`, like {@link MAX_DELETION_SEQ}. */
declare const MAX_SEQ = 2147483647;
/** The payload of {@link CALL_UPLOADED_MESSAGE}. */
declare const callUploadedPayloadSchema: z22.ZodObject<{
	callId: z22.core.$ZodBranded<z22.ZodString, "call", "out">;
}, z22.core.$strict>;
/** The payload of {@link CALL_UPLOADED_MESSAGE}. */
type CallUploadedPayload = z22.infer<typeof callUploadedPayloadSchema>;
/** Starts ingestion of a Call: transcription of a Recording, or parsing of a Transcript. Published after the upload is stored and again on restore (the kept Transcript is reused, never transcribed twice). */
declare const CALL_UPLOADED_MESSAGE: {
	readonly type: "playbook.call_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z22.ZodObject<{
		callId: z22.core.$ZodBranded<z22.ZodString, "call", "out">;
	}, z22.core.$strict>;
};
/** The payload of {@link CALL_TRANSCRIBED_MESSAGE}. */
declare const callTranscribedPayloadSchema: z22.ZodObject<{
	callId: z22.core.$ZodBranded<z22.ZodString, "call", "out">;
}, z22.core.$strict>;
/** The payload of {@link CALL_TRANSCRIBED_MESSAGE}. */
type CallTranscribedPayload = z22.infer<typeof callTranscribedPayloadSchema>;
/** Moves a Recording from transcription to building Moments, published when the Transcript is stored and the Rep is known (a per-side Recording, or one whose Rep was picked). A Call with no Rep waits in `awaiting_rep` and publishes `playbook.call_rep_changed` when it is picked. */
declare const CALL_TRANSCRIBED_MESSAGE: {
	readonly type: "playbook.call_transcribed";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z22.ZodObject<{
		callId: z22.core.$ZodBranded<z22.ZodString, "call", "out">;
	}, z22.core.$strict>;
};
/** The payload of {@link CALL_REP_CHANGED_MESSAGE}: the Call and its `repSeq`. */
declare const callRepChangedPayloadSchema: z22.ZodObject<{
	callId: z22.core.$ZodBranded<z22.ZodString, "call", "out">;
	repSeq: z22.ZodNumber;
}, z22.core.$strict>;
/** The payload of {@link CALL_REP_CHANGED_MESSAGE}. */
type CallRepChangedPayload = z22.infer<typeof callRepChangedPayloadSchema>;
/** Rebuilds a Call's Moments after its Rep is picked or changed. The service bumps `repSeq` in the same write as the change; the job applies only when the Call's stored sequence equals this one, and the Call is out of search until it finishes. */
declare const CALL_REP_CHANGED_MESSAGE: {
	readonly type: "playbook.call_rep_changed";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z22.ZodObject<{
		callId: z22.core.$ZodBranded<z22.ZodString, "call", "out">;
		repSeq: z22.ZodNumber;
	}, z22.core.$strict>;
};
/** The payload of {@link CALL_DELETED_MESSAGE}: the Call and its `deletionSeq`. */
declare const callDeletedPayloadSchema: z22.ZodObject<{
	callId: z22.core.$ZodBranded<z22.ZodString, "call", "out">;
	deletionSeq: z22.ZodNumber;
}, z22.core.$strict>;
/** The payload of {@link CALL_DELETED_MESSAGE}. */
type CallDeletedPayload = z22.infer<typeof callDeletedPayloadSchema>;
/** Queues the removal of a deleted Call's Moments and vectors, as `playbook.document_deleted` does for a document: it applies only if the Call is still deleted and its stored `deletionSeq` equals this one. Only a delete that changes the state bumps it or publishes. Search hides a deleted Call by its state, never by this job. */
declare const CALL_DELETED_MESSAGE: {
	readonly type: "playbook.call_deleted";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z22.ZodObject<{
		callId: z22.core.$ZodBranded<z22.ZodString, "call", "out">;
		deletionSeq: z22.ZodNumber;
	}, z22.core.$strict>;
};
/** The payload of {@link DEAL_OUTCOME_CHANGED_MESSAGE}: the Deal's opaque id (never the customer's text) and its `outcomeSeq`. */
declare const dealOutcomeChangedPayloadSchema: z22.ZodObject<{
	dealRecordId: z22.core.$ZodBranded<z22.ZodString, "deal", "out">;
	outcomeSeq: z22.ZodNumber;
}, z22.core.$strict>;
/** The payload of {@link DEAL_OUTCOME_CHANGED_MESSAGE}. */
type DealOutcomeChangedPayload = z22.infer<typeof dealOutcomeChangedPayloadSchema>;
/** Re-tags a Deal's Moments in the index after its Outcome changes. The job reads the current Outcome from the database and applies only when the Deal's stored `outcomeSeq` equals this one, so two changes cannot finish in the wrong order. */
declare const DEAL_OUTCOME_CHANGED_MESSAGE: {
	readonly type: "playbook.deal_outcome_changed";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z22.ZodObject<{
		dealRecordId: z22.core.$ZodBranded<z22.ZodString, "deal", "out">;
		outcomeSeq: z22.ZodNumber;
	}, z22.core.$strict>;
};
/** The payload of {@link DEAL_IMPORT_UPLOADED_MESSAGE}. */
declare const dealImportUploadedPayloadSchema: z22.ZodObject<{
	importId: z22.core.$ZodBranded<z22.ZodString, "dimp", "out">;
}, z22.core.$strict>;
/** The payload of {@link DEAL_IMPORT_UPLOADED_MESSAGE}. */
type DealImportUploadedPayload = z22.infer<typeof dealImportUploadedPayloadSchema>;
/** Starts the processing of an uploaded CSV. The job is idempotent and resumable, keyed on the import. */
declare const DEAL_IMPORT_UPLOADED_MESSAGE: {
	readonly type: "playbook.deal_import_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z22.ZodObject<{
		importId: z22.core.$ZodBranded<z22.ZodString, "dimp", "out">;
	}, z22.core.$strict>;
};
import { z as z23 } from "zod";
/**
* The states a Playbook document is in, in the order a document passes through them (ADR 0016).
* `deleted` means soft-deleted and awaiting purge. The db library builds its column from this
* same list, so the names are the contract between the two.
*/
declare const DOCUMENT_STATES: readonly ["uploaded", "processing", "ready", "failed", "deleted"];
/** The state of a Playbook document. */
declare const documentStateSchema: z23.ZodEnum<{
	deleted: "deleted";
	failed: "failed";
	processing: "processing";
	ready: "ready";
	uploaded: "uploaded";
}>;
/** The state of a Playbook document. */
type DocumentState = z23.infer<typeof documentStateSchema>;
/**
* Why a document ended in `failed`: a closed list the portal maps to its own wording. Never free
* text, so a reason cannot carry the content or name of a file. This list is the lead's reading
* of ADR 0016, which names only the page limit; the owner did not choose the rest.
*/
declare const DOCUMENT_FAILURE_REASONS: readonly ["too_many_pages", "unreadable", "password_protected", "no_text", "processing_failed"];
/** Why a document ended in `failed`. */
declare const documentFailureReasonSchema: z23.ZodEnum<{
	no_text: "no_text";
	password_protected: "password_protected";
	processing_failed: "processing_failed";
	too_many_pages: "too_many_pages";
	unreadable: "unreadable";
}>;
/** Why a document ended in `failed`. */
type DocumentFailureReason = z23.infer<typeof documentFailureReasonSchema>;
/** Owner's choice (ADR 0016, choice 2): the file extensions phase 1 accepts, lower case with the dot. */
declare const ACCEPTED_DOCUMENT_EXTENSIONS: readonly [".pdf", ".docx", ".pptx", ".txt", ".md"];
/** An accepted file extension. */
type AcceptedDocumentExtension = (typeof ACCEPTED_DOCUMENT_EXTENSIONS)[number];
/** Owner's choice (ADR 0016, choice 2): the media types phase 1 accepts, one for each accepted extension. */
declare const ACCEPTED_DOCUMENT_MEDIA_TYPES: readonly ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain", "text/markdown"];
/** The media type of a stored document, as the service detected it from the content. */
declare const documentMediaTypeSchema: z23.ZodEnum<{
	"application/pdf": "application/pdf";
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
	"text/markdown": "text/markdown";
	"text/plain": "text/plain";
}>;
/** The media type of a stored document. */
type DocumentMediaType = z23.infer<typeof documentMediaTypeSchema>;
/** The media type each accepted extension stands for. */
declare const MEDIA_TYPE_BY_EXTENSION: Readonly<Record<AcceptedDocumentExtension, DocumentMediaType>>;
/** Owner's choice (ADR 0016, choice 2): the largest file accepted, 25 MB counted as 25 * 1024 * 1024 bytes. */
declare const MAX_DOCUMENT_BYTES: number;
/** Owner's choice (ADR 0016, choice 2): the most pages a document may have; checked by the ingestion job, not at upload. */
declare const MAX_DOCUMENT_PAGES = 300;
/** The lead's default (ADR 0016), not the owner's: days a soft-deleted document is kept before it is purged. */
declare const DOCUMENT_RETENTION_DAYS = 30;
/** The lead's default (ADR 0016), not the owner's: documents an Organization may hold, soft-deleted ones included until purged. */
declare const DEFAULT_MAX_DOCUMENTS = 500;
/** The lead's default (ADR 0016), not the owner's: bytes an Organization may hold, 2 GB counted as 2 * 1024^3. */
declare const DEFAULT_MAX_DOCUMENT_BYTES_TOTAL: number;
/**
* How lengths are counted in this area: in Unicode code points, as Zod's string `min` and `max`
* count them, so an astral-plane character counts as 1 (not 2 as JavaScript's `.length` has it). A
* database `varchar(n)` or `char_length` check counts code points too, so the column limit is the
* same number; a column must also allow {@link MAX_UTF8_BYTES_PER_CODE_POINT} bytes per code point
* (the most UTF-8 takes), such as `MAX_DOCUMENT_FILE_NAME_BYTES`.
*/
declare const MAX_UTF8_BYTES_PER_CODE_POINT = 4;
/** The longest file name, in Unicode code points, once control and direction characters are stripped. */
declare const MAX_DOCUMENT_FILE_NAME_LENGTH = 255;
/** The most UTF-8 bytes a stored file name can take: 255 code points at 4 bytes each. A column must allow this many bytes. */
declare const MAX_DOCUMENT_FILE_NAME_BYTES: number;
/** The stored form of a file name: control and bidirectional characters removed, then trimmed. */
declare function normaliseFileName(name: string): string;
/** The accepted extension a file name ends with, compared without case, or undefined. */
declare function documentExtension(fileName: string): AcceptedDocumentExtension | undefined;
/**
* A document's file name, in a request and in a response: at most 1000 raw Unicode code points,
* then control and bidirectional characters are removed (not rejected) and the rest is trimmed to
* 1 to 255 well-formed Unicode code points with no `/` or `\` and a visible stem before the last
* dot (`.pdf`, or an invisible character plus `.pdf`, is rejected). It does not check the
* extension: that is {@link documentTypeCheckSchema}, which has its own error code. Parsing a
* stored name yields a safe one. The name is for display only and is never a storage key or a
* path: the service keys storage on the document id. It is stricter than a person's name (which
* keeps direction characters) because a file name is shown beside the person's own text in lists
* and downloads, where a right-to-left override can disguise an extension, and a person's name has
* no extension to disguise. Zero-width characters other than in the stem are allowed, so display
* code must still treat a name as untrusted text. A name is never part of an error body.
*/
declare const documentFileNameSchema: z23.ZodPipe<z23.ZodPipe<z23.ZodString, z23.ZodTransform<string, string>>, z23.ZodString>;
/** The name of an uploaded file. */
type DocumentFileName = z23.infer<typeof documentFileNameSchema>;
/**
* The type check of an upload, on the file name in its stored form (control and bidirectional
* characters stripped, then trimmed): it must end in an accepted extension. A failure is
* `document.unsupported_type` (415). Services call `checkUploadFile`, not this. The service also inspects the content, because the name
* and the declared type are untrusted.
*/
declare const documentTypeCheckSchema: z23.ZodPipe<z23.ZodPipe<z23.ZodString, z23.ZodTransform<string, string>>, z23.ZodString>;
/**
* The size check of an upload, on the byte count: at most {@link MAX_DOCUMENT_BYTES}. A failure
* is `document.too_large` (413). Services call `checkUploadFile`, not this. Emptiness is not checked here: an empty file fails the upload
* schema as `request.invalid`.
*/
declare const documentSizeCheckSchema: z23.ZodNumber;
/** Lower-cases a media type and drops its parameters, so `Text/Plain; charset=utf-8` becomes `text/plain`. */
declare function normaliseMediaType(mediaType: string): string;
/** Whether text holds a control or bidirectional character (the ones a file name has stripped), so an identifier can refuse it. */
declare function hasStrippableCharacter(text: string): boolean;
/** Whether text is well-formed UTF-16: no lone surrogate. */
declare function isWellFormedText(text: string): boolean;
/** This library's package name, so a consumer can report which shared libraries it resolved. */
declare const PACKAGE = "tula-closeline-contract";
export { ABANDON_MAX_AGE_HOURS, ACCEPTED_DOCUMENT_EXTENSIONS, ACCEPTED_DOCUMENT_MEDIA_TYPES, ACCEPTED_RECORDING_EXTENSIONS, ACCEPTED_TRANSCRIPT_EXTENSIONS, ALL_PLAYBOOK_ERRORS, ALL_PLAYBOOK_ROUTES, AUTH_ERRORS, AcceptedCallExtension, AcceptedDocumentExtension, AddTeamMemberRequest, AllPlaybookRouteName, AuthErrorCode, CALL_CHANNELS, CALL_DELETED_MESSAGE, CALL_FAILURE_FIXES, CALL_FAILURE_REASONS, CALL_KINDS, CALL_MEDIA_TYPES, CALL_REP_CHANGED_MESSAGE, CALL_STATES, CALL_TRANSCRIBED_MESSAGE, CALL_UPLOADED_MESSAGE, CORE_ERRORS, CSV_FAILURES, CURRENT_RIGHTS_WORDING_VERSION, Call, CallCursor, CallDeletedPayload, CallFailureFix, CallFailureReason, CallId, CallKind, CallMediaType, CallParams, CallRepChangedPayload, CallState, CallTranscribedPayload, CallUploadedPayload, CellResult, ChangeMemberRoleRequest, CheckCallFileResult, CheckDealImportHeaderResult, CheckDealImportHeaderTextResult, CheckDealImportRowResult, CheckUploadFileResult, CommonErrorCode, ConfirmRightsRequest, CoreErrorCode, CreateInvitationRequest, CreateTeamRequest, CsvFailure, CsvOptions, CsvResult, DEAL_CLOSED_AT_MAX_YEAR, DEAL_CLOSED_AT_MIN_YEAR, DEAL_IMPORT_FAILURE_REASONS, DEAL_IMPORT_FILE_FIELD, DEAL_IMPORT_HEADER_PREFIX_CHARS, DEAL_IMPORT_HEADER_PROBLEMS, DEAL_IMPORT_OPTIONAL_COLUMN, DEAL_IMPORT_REQUIRED_COLUMNS, DEAL_IMPORT_ROW_REASONS, DEAL_IMPORT_ROW_RESULTS, DEAL_IMPORT_STATES, DEAL_IMPORT_UPLOADED_MESSAGE, DEAL_OUTCOME_CHANGED_MESSAGE, DEFAULT_MAX_CALLS, DEFAULT_MAX_DEALS, DEFAULT_MAX_DOCUMENTS, DEFAULT_MAX_DOCUMENT_BYTES_TOTAL, DEFAULT_MAX_RECORDING_BYTES_TOTAL, DEFAULT_PAGE_SIZE, DOCUMENT_DELETED_MESSAGE, DOCUMENT_FAILURE_REASONS, DOCUMENT_RETENTION_DAYS, DOCUMENT_STATES, DOCUMENT_UPLOADED_MESSAGE, Deal, DealCursor, DealId, DealImport, DealImportCursor, DealImportFailureReason, DealImportHeaderProblem, DealImportId, DealImportParams, DealImportRow, DealImportRowCursor, DealImportRowReason, DealImportRowResult, DealImportState, DealImportUploadedPayload, DealOutcomeChangedPayload, DealParams, DealRecordId, DocumentDeletedPayload, DocumentFailureReason, DocumentFileName, DocumentId, DocumentMediaType, DocumentParams, DocumentState, DocumentUploadedPayload, ERRORS, Email, ErrorBody, ErrorDefinition, ErrorInput, EventId, EventType, FirstCsvRecordResult, IDEMPOTENCY_KEY_HEADER, INCOMPLETE_UPLOAD_PARTS_TTL_HOURS, INTERNAL_CALL_ERRORS, INVITABLE_ROLES, INVITATION_STATES, Id, IdempotencyKey, InternalAbandonOrganizationParams, InternalAbandonOrganizationRequest, InternalAbandonOrganizationResponse, InternalAcceptInvitationRequest, InternalAcceptInvitationResponse, InternalCallName, InternalCreateOrganizationRequest, InternalCreateOrganizationResponse, InternalMembershipRequest, InternalMembershipResponse, InternalRemoveOrganizationDocumentsParams, InternalRemoveOrganizationDocumentsRequest, InternalRemoveOrganizationDocumentsResponse, InternalUpdateMemberProfileParams, InternalUpdateMemberProfileRequest, InternalUpdateMemberProfileResponse, InvitableRole, Invitation, InvitationId, InvitationParams, InvitationState, ListCallsQuery, ListCallsResponse, ListDealImportRowsQuery, ListDealImportRowsResponse, ListDealImportsQuery, ListDealImportsResponse, ListDealsQuery, ListDealsResponse, ListDocumentsQuery, ListDocumentsResponse, ListInvitationsQuery, ListInvitationsResponse, ListMembersQuery, ListMembersResponse, ListTeamsQuery, ListTeamsResponse, LookupDealRequest, MAX_CALL_SPEAKERS, MAX_CURSOR_LENGTH, MAX_DEAL_ID_BYTES, MAX_DEAL_ID_LENGTH, MAX_DEAL_IMPORT_BYTES, MAX_DEAL_IMPORT_CELL_LENGTH, MAX_DEAL_IMPORT_HEADER_LENGTH, MAX_DEAL_IMPORT_ROWS, MAX_DEAL_NAME_BYTES, MAX_DEAL_NAME_LENGTH, MAX_DELETION_SEQ, MAX_DOCUMENT_BYTES, MAX_DOCUMENT_FILE_NAME_BYTES, MAX_DOCUMENT_FILE_NAME_LENGTH, MAX_DOCUMENT_PAGES, MAX_EMAIL_LENGTH, MAX_NAME_LENGTH, MAX_PAGE_SIZE, MAX_PERSON_NAME_LENGTH, MAX_RECORDING_BYTES, MAX_RECORDING_SECONDS, MAX_REP_FIELD_LENGTH, MAX_REP_FOLLOWING_CHARACTERS, MAX_REP_FOLLOWING_TURNS, MAX_RIGHTS_HEADING_LENGTH, MAX_RIGHTS_PARAGRAPHS, MAX_RIGHTS_TEXT_LENGTH, MAX_RIGHTS_WORDING_VERSION, MAX_SEQ, MAX_SPEAKER_LABEL_BYTES, MAX_SPEAKER_LABEL_LENGTH, MAX_TRANSCRIPT_BYTES, MAX_UTF8_BYTES_PER_CODE_POINT, MEDIA_TYPE_BY_CALL_EXTENSION, MEDIA_TYPE_BY_EXTENSION, Member, MemberParams, MembershipId, ORGANIZATION_STATUSES, OUTCOMES, Organization, OrganizationId, OrganizationStatus, Outcome, PACKAGE, PLAYBOOK_ERRORS, PLAYBOOK_READ_ROLES, PLAYBOOK_ROUTES, PLAYBOOK_WRITE_ROLES, Page, PageQuery, ParseRepFieldResult, ParsedDealImportRow, PlaybookDocument, PlaybookErrorCode, PlaybookRoute, PlaybookRouteName, ProspectId, REGIONS, RIGHTS_WORDINGS, ROLES, Region, RenameOrganizationRequest, RenameTeamRequest, RepChoice, RequestId, RightsConfirmation, RightsRequiredDetails, RightsStatus, RightsWording, Role, SALES_HISTORY_ERRORS, SALES_HISTORY_READ_ROLES, SALES_HISTORY_ROUTES, SIGNUP_ERRORS, SalesHistoryErrorCode, SalesHistoryRoute, SalesHistoryRouteName, SetCallRepRequest, SetDealOutcomeRequest, SignupErrorCode, Team, TeamId, TeamMember, TeamMemberParams, TeamParams, UPLOAD_CONTENT_TYPE, UPLOAD_FILE_FIELD, UploadCallFields, UploadDocumentFile, UserId, addTeamMemberRequestSchema, callChannelSchema, callCursorSchema, callDeletedPayloadSchema, callFailureReasonSchema, callIdSchema, callKindSchema, callMediaTypeSchema, callParamsSchema, callRepChangedPayloadSchema, callReuploadRequeues, callSchema, callStateSchema, callTranscribedPayloadSchema, callUploadedPayloadSchema, changeMemberRoleRequestSchema, checkCallFile, checkDealImportHeader, checkDealImportHeaderText, checkDealImportRow, checkUploadFile, confirmRightsRequestSchema, createInvitationRequestSchema, createTeamRequestSchema, dealAmountSchema, dealCurrencySchema, dealCursorSchema, dealIdSchema, dealImportCursorSchema, dealImportFailureReasonSchema, dealImportIdSchema, dealImportParamsSchema, dealImportRowCursorSchema, dealImportRowReasonSchema, dealImportRowResultSchema, dealImportRowSchema, dealImportSchema, dealImportStateSchema, dealImportUploadedPayloadSchema, dealNameSchema, dealOutcomeChangedPayloadSchema, dealParamsSchema, dealRecordIdSchema, dealSchema, decodeCursor, defineErrors, defineEvent, documentDeletedPayloadSchema, documentExtension, documentFailureReasonSchema, documentFileNameSchema, documentIdSchema, documentMediaTypeSchema, documentParamsSchema, documentSchema, documentSizeCheckSchema, documentStateSchema, documentTypeCheckSchema, documentUploadedPayloadSchema, emailSchema, encodeCursor, errorBodySchema, errorCodeSchema, eventEnvelopeSchema, eventIdSchema, eventTypeSchema, firstCsvRecord, foldAscii, formatId, hasStrippableCharacter, idSchema, idempotencyKeySchema, internalAbandonOrganizationParamsSchema, internalAbandonOrganizationRequestSchema, internalAbandonOrganizationResponseSchema, internalAcceptInvitationRequestSchema, internalAcceptInvitationResponseSchema, internalCreateOrganizationRequestSchema, internalCreateOrganizationResponseSchema, internalMembershipRequestSchema, internalMembershipResponseSchema, internalRemoveOrganizationDocumentsParamsSchema, internalRemoveOrganizationDocumentsRequestSchema, internalRemoveOrganizationDocumentsResponseSchema, internalUpdateMemberProfileParamsSchema, internalUpdateMemberProfileRequestSchema, internalUpdateMemberProfileResponseSchema, invitableRoleSchema, invitationIdSchema, invitationParamsSchema, invitationSchema, invitationStateSchema, invitationTokenSchema, isBlankCsvRecord, isWellFormedText, listCallsQuerySchema, listCallsResponseSchema, listDealImportRowsQuerySchema, listDealImportRowsResponseSchema, listDealImportsQuerySchema, listDealImportsResponseSchema, listDealsQuerySchema, listDealsResponseSchema, listDocumentsQuerySchema, listDocumentsResponseSchema, listInvitationsQuerySchema, listInvitationsResponseSchema, listMembersQuerySchema, listMembersResponseSchema, listTeamsQuerySchema, listTeamsResponseSchema, lookupDealRequestSchema, memberParamsSchema, memberSchema, membershipIdSchema, normaliseDealId, normaliseFileName, normaliseMediaType, normaliseSpeakerLabel, organizationIdSchema, organizationNameSchema, organizationSchema, organizationStatusSchema, outcomeSchema, pageQuerySchema, pageSchema, parseAmountCell, parseClosedAtCell, parseCsv, parseCurrencyCell, parseOutcomeCell, parseRepField, personNameSchema, prospectIdSchema, regionSchema, renameOrganizationRequestSchema, renameTeamRequestSchema, repChangeAllowed, repChoiceSchema, repChoiceSuits, requestIdSchema, rightsConfirmationSchema, rightsRequiredDetailsSchema, rightsStatusSchema, rightsWordingFor, rightsWordingSchema, rightsWordingVersionSchema, roleAtLeast, roleSchema, setCallRepRequestSchema, setDealOutcomeRequestSchema, speakerLabelSchema, storedNameSchema, teamIdSchema, teamMemberParamsSchema, teamMemberSchema, teamNameSchema, teamParamsSchema, teamSchema, timestampSchema, uploadCallFieldsSchema, uploadCallFileSchema, uploadDocumentFileSchema, userIdSchema };
