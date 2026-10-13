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
/**
* A Playbook document as the service returns it. It names the file but never carries its content,
* and no text taken from it. `failureReason` is set exactly when `state` is `failed`. `purgeAt` is
* set exactly when `state` is `deleted`: the time the file and record will be purged
* (`DOCUMENT_RETENTION_DAYS` after `deletedAt`); a restore is refused after it. `pageCount` is
* `null` until ingestion has counted the pages. The service must send the output of
* `documentSchema.parse(row)`, never the row.
*/
declare const documentSchema: z12.ZodObject<{
	id: z12.core.$ZodBranded<z12.ZodString, "doc", "out">;
	fileName: z12.ZodPipe<z12.ZodPipe<z12.ZodString, z12.ZodTransform<string, string>>, z12.ZodString>;
	mediaType: z12.ZodEnum<{
		"application/pdf": "application/pdf";
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
		"text/markdown": "text/markdown";
		"text/plain": "text/plain";
	}>;
	sizeBytes: z12.ZodNumber;
	pageCount: z12.ZodNullable<z12.ZodNumber>;
	state: z12.ZodEnum<{
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		uploaded: "uploaded";
	}>;
	failureReason: z12.ZodNullable<z12.ZodEnum<{
		no_text: "no_text";
		password_protected: "password_protected";
		processing_failed: "processing_failed";
		too_many_pages: "too_many_pages";
		unreadable: "unreadable";
	}>>;
	deletedAt: z12.ZodNullable<z12.ZodISODateTime>;
	purgeAt: z12.ZodNullable<z12.ZodISODateTime>;
	uploadedByUserId: z12.core.$ZodBranded<z12.ZodString, "usr", "out">;
	createdAt: z12.ZodISODateTime;
	updatedAt: z12.ZodISODateTime;
}, z12.core.$strip>;
/** A Playbook document as the service returns it. */
type PlaybookDocument = z12.infer<typeof documentSchema>;
/** The name of the multipart form field that carries the file. */
declare const UPLOAD_FILE_FIELD = "file";
/** The content type of an upload request: `multipart/form-data` with one file part named {@link UPLOAD_FILE_FIELD}. */
declare const UPLOAD_CONTENT_TYPE = "multipart/form-data";
/**
* What the service reads off the file part of an upload before it stores anything, validated here
* so the checks are the same everywhere: the `fileName` of the part, the media type the client
* declared (`declaredMediaType`) (advisory only; the service inspects the content too, because an upload is
* untrusted data) and the `sizeBytes` counted while reading. The file itself is a multipart part,
* not a JSON field, and appears in no schema. The request has no other part; it carries an
* `Idempotency-Key` header (`idempotencyKeySchema`).
*/
declare const uploadDocumentFileSchema: z12.ZodObject<{
	fileName: z12.ZodPipe<z12.ZodPipe<z12.ZodString, z12.ZodTransform<string, string>>, z12.ZodString>;
	declaredMediaType: z12.ZodNullable<z12.ZodString>;
	sizeBytes: z12.ZodNumber;
}, z12.core.$strict>;
/** What the service reads off the file part of an upload. */
type UploadDocumentFile = z12.infer<typeof uploadDocumentFileSchema>;
/** The path parameters of a request about one document. */
declare const documentParamsSchema: z12.ZodObject<{
	documentId: z12.core.$ZodBranded<z12.ZodString, "doc", "out">;
}, z12.core.$strict>;
/** The path parameters of a request about one document. */
type DocumentParams = z12.infer<typeof documentParamsSchema>;
/**
* The query parameters of a request to list documents: a page, and optionally one `state`. With
* no `state`, every document that is not `deleted` is listed; `state=deleted` lists the documents
* that can still be restored. An unknown parameter is rejected.
*/
declare const listDocumentsQuerySchema: z12.ZodObject<{
	cursor: z12.ZodOptional<z12.ZodString>;
	limit: z12.ZodDefault<z12.ZodPipe<z12.ZodPipe<z12.ZodUnion<readonly [z12.ZodNumber, z12.ZodString]>, z12.ZodTransform<number, string | number>>, z12.ZodNumber>>;
	state: z12.ZodOptional<z12.ZodEnum<{
		deleted: "deleted";
		failed: "failed";
		processing: "processing";
		ready: "ready";
		uploaded: "uploaded";
	}>>;
}, z12.core.$strict>;
/** The query parameters of a request to list documents. */
type ListDocumentsQuery = z12.infer<typeof listDocumentsQuerySchema>;
/** One page of documents. */
declare const listDocumentsResponseSchema: z12.ZodObject<{
	items: z12.ZodArray<z12.ZodObject<{
		id: z12.core.$ZodBranded<z12.ZodString, "doc", "out">;
		fileName: z12.ZodPipe<z12.ZodPipe<z12.ZodString, z12.ZodTransform<string, string>>, z12.ZodString>;
		mediaType: z12.ZodEnum<{
			"application/pdf": "application/pdf";
			"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
			"text/markdown": "text/markdown";
			"text/plain": "text/plain";
		}>;
		sizeBytes: z12.ZodNumber;
		pageCount: z12.ZodNullable<z12.ZodNumber>;
		state: z12.ZodEnum<{
			deleted: "deleted";
			failed: "failed";
			processing: "processing";
			ready: "ready";
			uploaded: "uploaded";
		}>;
		failureReason: z12.ZodNullable<z12.ZodEnum<{
			no_text: "no_text";
			password_protected: "password_protected";
			processing_failed: "processing_failed";
			too_many_pages: "too_many_pages";
			unreadable: "unreadable";
		}>>;
		deletedAt: z12.ZodNullable<z12.ZodISODateTime>;
		purgeAt: z12.ZodNullable<z12.ZodISODateTime>;
		uploadedByUserId: z12.core.$ZodBranded<z12.ZodString, "usr", "out">;
		createdAt: z12.ZodISODateTime;
		updatedAt: z12.ZodISODateTime;
	}, z12.core.$strip>>;
	nextCursor: z12.ZodNullable<z12.ZodString>;
}, z12.core.$strip>;
/** One page of documents. */
type ListDocumentsResponse = z12.infer<typeof listDocumentsResponseSchema>;
/**
* Internal: the path parameters of the call that removes everything an Organization has in the
* Playbook. The Organization is named in the path, never taken from the caller's token.
*/
declare const internalRemoveOrganizationDocumentsParamsSchema: z12.ZodObject<{
	organizationId: z12.core.$ZodBranded<z12.ZodString, "org", "out">;
}, z12.core.$strict>;
/** Internal: the path parameters of the remove-everything call. */
type InternalRemoveOrganizationDocumentsParams = z12.infer<typeof internalRemoveOrganizationDocumentsParamsSchema>;
/**
* Internal: `POST /internal/playbook/organizations/{organizationId}/remove-all`, for offboarding
* and erasure; no caller yet. The body is empty. It cancels ingestion in flight and removes every
* file, chunk, vector and record the Organization has, soft-deleted documents included, without
* waiting for retention. It carries an `Idempotency-Key` header and is defined by its end state:
* it answers success whenever nothing remains when it returns, whether this call, an earlier one
* or nobody ever stored anything, so a repeat under any key answers the same and success does not
* mean this call removed anything. It returns no domain error code.
*/
declare const internalRemoveOrganizationDocumentsRequestSchema: z12.ZodObject<{}, z12.core.$strict>;
/** Internal: the body of the remove-everything call. */
type InternalRemoveOrganizationDocumentsRequest = z12.infer<typeof internalRemoveOrganizationDocumentsRequestSchema>;
/** Internal: the answer to the remove-everything call: always `removed`. */
declare const internalRemoveOrganizationDocumentsResponseSchema: z12.ZodObject<{
	organizationId: z12.core.$ZodBranded<z12.ZodString, "org", "out">;
	status: z12.ZodLiteral<"removed">;
}, z12.core.$strip>;
/** Internal: the answer to the remove-everything call. */
type InternalRemoveOrganizationDocumentsResponse = z12.infer<typeof internalRemoveOrganizationDocumentsResponseSchema>;
import { ErrorDefinition as ErrorDefinition_8gwh453 } from "..";
/**
* The errors the playbook service returns, as `area.reason` codes. No body carries a file name,
* file content or text taken from a document: every message is fixed. A role that is not allowed
* is the common `auth.forbidden`; a malformed multipart body is the common `request.invalid`.
* `document.too_many_pages` is also a failure reason (`too_many_pages`): the page count is checked
* in the ingestion job, so a client sees it as a failed document, not as an upload response; the
* code exists for a service that checks earlier. `document.not_restorable` (410) is a document
* whose retention ended and whose file is gone, and is never `document.not_found`.
*/
declare const PLAYBOOK_ERRORS: {
	readonly "document.not_deleted": ErrorDefinition_8gwh453<"document.not_deleted">;
	readonly "document.not_found": ErrorDefinition_8gwh453<"document.not_found">;
	readonly "document.not_restorable": ErrorDefinition_8gwh453<"document.not_restorable">;
	readonly "document.quota_exceeded": ErrorDefinition_8gwh453<"document.quota_exceeded">;
	readonly "document.too_large": ErrorDefinition_8gwh453<"document.too_large">;
	readonly "document.too_many_pages": ErrorDefinition_8gwh453<"document.too_many_pages">;
	readonly "document.unsupported_type": ErrorDefinition_8gwh453<"document.unsupported_type">;
};
/** A code from the {@link PLAYBOOK_ERRORS} registry. */
type PlaybookErrorCode = keyof typeof PLAYBOOK_ERRORS;
import { z as z13 } from "zod";
/** The payload of {@link DOCUMENT_UPLOADED_MESSAGE}: the document to ingest. */
declare const documentUploadedPayloadSchema: z13.ZodObject<{
	documentId: z13.core.$ZodBranded<z13.ZodString, "doc", "out">;
}, z13.core.$strict>;
/** The payload of {@link DOCUMENT_UPLOADED_MESSAGE}. */
type DocumentUploadedPayload = z13.infer<typeof documentUploadedPayloadSchema>;
/**
* The message that starts ingestion of a document: published after an upload is stored, and again
* when a soft-deleted document is restored (it is re-ingested from the kept file). The job is
* idempotent and resumable, keyed on the document.
*/
declare const DOCUMENT_UPLOADED_MESSAGE: {
	readonly type: "playbook.document_uploaded";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z13.ZodObject<{
		documentId: z13.core.$ZodBranded<z13.ZodString, "doc", "out">;
	}, z13.core.$strict>;
};
/**
* The payload of {@link DOCUMENT_DELETED_MESSAGE}: the document and the time of the deletion this
* cleanup was queued for, so the job does nothing if the document was restored (or deleted again
* later) since.
*/
declare const documentDeletedPayloadSchema: z13.ZodObject<{
	documentId: z13.core.$ZodBranded<z13.ZodString, "doc", "out">;
	deletedAt: z13.ZodISODateTime;
}, z13.core.$strict>;
/** The payload of {@link DOCUMENT_DELETED_MESSAGE}. */
type DocumentDeletedPayload = z13.infer<typeof documentDeletedPayloadSchema>;
/**
* The message that queues the removal of a deleted document's vectors, published by the delete
* request. It is cleanup only: search hides a deleted document by its state, never by this job.
*/
declare const DOCUMENT_DELETED_MESSAGE: {
	readonly type: "playbook.document_deleted";
	readonly version: 1;
	readonly scope: "organization";
	readonly payload: z13.ZodObject<{
		documentId: z13.core.$ZodBranded<z13.ZodString, "doc", "out">;
		deletedAt: z13.ZodISODateTime;
	}, z13.core.$strict>;
};
import { z as z14 } from "zod";
/** Every Region an Organization can be created in. */
declare const REGIONS: readonly ["us", "eu"];
/** A Region: the geography whose boundary an Organization's data never crosses. */
declare const regionSchema: z14.ZodEnum<{
	eu: "eu";
	us: "us";
}>;
/** A Region. */
type Region = z14.infer<typeof regionSchema>;
/** Every role, ordered from most to least privileged. */
declare const ROLES: readonly ["owner", "admin", "manager", "rep"];
/** A member's role in an Organization. */
declare const roleSchema: z14.ZodEnum<{
	admin: "admin";
	manager: "manager";
	owner: "owner";
	rep: "rep";
}>;
/** A role. */
type Role = z14.infer<typeof roleSchema>;
/** Whether `role` is at least as privileged as `minimum`; an unrecognised role is never enough. */
declare function roleAtLeast(role: Role, minimum: Role): boolean;
/** The roles an Invitation can offer; ownership passes by promoting a member, never by Invitation. */
declare const INVITABLE_ROLES: readonly ["admin", "manager", "rep"];
/** A role an Invitation can offer: any role except `owner`. */
declare const invitableRoleSchema: z14.ZodEnum<{
	admin: "admin";
	manager: "manager";
	rep: "rep";
}>;
/** A role an Invitation can offer. */
type InvitableRole = z14.infer<typeof invitableRoleSchema>;
/** Every state an Organization is in; `deleted` keeps the record for the retention window. */
declare const ORGANIZATION_STATUSES: readonly ["active", "suspended", "deleted"];
/** The state of an Organization. */
declare const organizationStatusSchema: z14.ZodEnum<{
	active: "active";
	deleted: "deleted";
	suspended: "suspended";
}>;
/** The state of an Organization. */
type OrganizationStatus = z14.infer<typeof organizationStatusSchema>;
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
import { z as z15 } from "zod";
/**
* The states a Playbook document is in, in the order a document passes through them (ADR 0016).
* `deleted` means soft-deleted and awaiting purge. The db library builds its column from this
* same list, so the names are the contract between the two.
*/
declare const DOCUMENT_STATES: readonly ["uploaded", "processing", "ready", "failed", "deleted"];
/** The state of a Playbook document. */
declare const documentStateSchema: z15.ZodEnum<{
	deleted: "deleted";
	failed: "failed";
	processing: "processing";
	ready: "ready";
	uploaded: "uploaded";
}>;
/** The state of a Playbook document. */
type DocumentState = z15.infer<typeof documentStateSchema>;
/**
* Why a document ended in `failed`: a closed list the portal maps to its own wording. Never free
* text, so a reason cannot carry the content or name of a file. This list is the lead's reading
* of ADR 0016, which names only the page limit; the owner did not choose the rest.
*/
declare const DOCUMENT_FAILURE_REASONS: readonly ["too_many_pages", "unreadable", "password_protected", "no_text", "processing_failed"];
/** Why a document ended in `failed`. */
declare const documentFailureReasonSchema: z15.ZodEnum<{
	no_text: "no_text";
	password_protected: "password_protected";
	processing_failed: "processing_failed";
	too_many_pages: "too_many_pages";
	unreadable: "unreadable";
}>;
/** Why a document ended in `failed`. */
type DocumentFailureReason = z15.infer<typeof documentFailureReasonSchema>;
/** Owner's choice (ADR 0016, choice 2): the file extensions phase 1 accepts, lower case with the dot. */
declare const ACCEPTED_DOCUMENT_EXTENSIONS: readonly [".pdf", ".docx", ".pptx", ".txt", ".md"];
/** An accepted file extension. */
type AcceptedDocumentExtension = (typeof ACCEPTED_DOCUMENT_EXTENSIONS)[number];
/** Owner's choice (ADR 0016, choice 2): the media types phase 1 accepts, one for each accepted extension. */
declare const ACCEPTED_DOCUMENT_MEDIA_TYPES: readonly ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain", "text/markdown"];
/** The media type of a stored document, as the service detected it from the content. */
declare const documentMediaTypeSchema: z15.ZodEnum<{
	"application/pdf": "application/pdf";
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": "application/vnd.openxmlformats-officedocument.presentationml.presentation";
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
	"text/markdown": "text/markdown";
	"text/plain": "text/plain";
}>;
/** The media type of a stored document. */
type DocumentMediaType = z15.infer<typeof documentMediaTypeSchema>;
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
/** The longest file name, in characters, once control and direction characters are stripped. */
declare const MAX_DOCUMENT_FILE_NAME_LENGTH = 255;
/** The accepted extension a file name ends with, compared without case, or undefined. */
declare function documentExtension(fileName: string): AcceptedDocumentExtension | undefined;
/**
* A document's file name, in a request and in a response: at most 1000 raw characters, then
* control and bidirectional characters are removed (not rejected) and the rest is trimmed to 1 to
* 255 well-formed characters with no `/` or `\`, ending in an accepted extension. Parsing a stored
* name therefore yields a safe one. Zero-width characters are allowed, so display code must still
* treat a name as untrusted text. A name is never part of an error body.
*/
declare const documentFileNameSchema: z15.ZodPipe<z15.ZodPipe<z15.ZodString, z15.ZodTransform<string, string>>, z15.ZodString>;
/** The name of an uploaded file. */
type DocumentFileName = z15.infer<typeof documentFileNameSchema>;
/** This library's package name, so a consumer can report which shared libraries it resolved. */
declare const PACKAGE = "tula-closeline-contract";
export { ABANDON_MAX_AGE_HOURS, ACCEPTED_DOCUMENT_EXTENSIONS, ACCEPTED_DOCUMENT_MEDIA_TYPES, AUTH_ERRORS, AcceptedDocumentExtension, AddTeamMemberRequest, AuthErrorCode, CORE_ERRORS, ChangeMemberRoleRequest, CommonErrorCode, CoreErrorCode, CreateInvitationRequest, CreateTeamRequest, DEFAULT_MAX_DOCUMENTS, DEFAULT_MAX_DOCUMENT_BYTES_TOTAL, DEFAULT_PAGE_SIZE, DOCUMENT_DELETED_MESSAGE, DOCUMENT_FAILURE_REASONS, DOCUMENT_RETENTION_DAYS, DOCUMENT_STATES, DOCUMENT_UPLOADED_MESSAGE, DocumentDeletedPayload, DocumentFailureReason, DocumentFileName, DocumentId, DocumentMediaType, DocumentParams, DocumentState, DocumentUploadedPayload, ERRORS, Email, ErrorBody, ErrorDefinition, ErrorInput, EventId, EventType, IDEMPOTENCY_KEY_HEADER, INTERNAL_CALL_ERRORS, INVITABLE_ROLES, INVITATION_STATES, Id, IdempotencyKey, InternalAbandonOrganizationParams, InternalAbandonOrganizationRequest, InternalAbandonOrganizationResponse, InternalAcceptInvitationRequest, InternalAcceptInvitationResponse, InternalCallName, InternalCreateOrganizationRequest, InternalCreateOrganizationResponse, InternalMembershipRequest, InternalMembershipResponse, InternalRemoveOrganizationDocumentsParams, InternalRemoveOrganizationDocumentsRequest, InternalRemoveOrganizationDocumentsResponse, InternalUpdateMemberProfileParams, InternalUpdateMemberProfileRequest, InternalUpdateMemberProfileResponse, InvitableRole, Invitation, InvitationId, InvitationParams, InvitationState, ListDocumentsQuery, ListDocumentsResponse, ListInvitationsQuery, ListInvitationsResponse, ListMembersQuery, ListMembersResponse, ListTeamsQuery, ListTeamsResponse, MAX_CURSOR_LENGTH, MAX_DOCUMENT_BYTES, MAX_DOCUMENT_FILE_NAME_LENGTH, MAX_DOCUMENT_PAGES, MAX_EMAIL_LENGTH, MAX_NAME_LENGTH, MAX_PAGE_SIZE, MAX_PERSON_NAME_LENGTH, MEDIA_TYPE_BY_EXTENSION, Member, MemberParams, MembershipId, ORGANIZATION_STATUSES, Organization, OrganizationId, OrganizationStatus, PACKAGE, PLAYBOOK_ERRORS, PLAYBOOK_READ_ROLES, PLAYBOOK_ROUTES, PLAYBOOK_WRITE_ROLES, Page, PageQuery, PlaybookDocument, PlaybookErrorCode, PlaybookRoute, PlaybookRouteName, ProspectId, REGIONS, ROLES, Region, RenameOrganizationRequest, RenameTeamRequest, RequestId, Role, SIGNUP_ERRORS, SignupErrorCode, Team, TeamId, TeamMember, TeamMemberParams, TeamParams, UPLOAD_CONTENT_TYPE, UPLOAD_FILE_FIELD, UploadDocumentFile, UserId, addTeamMemberRequestSchema, changeMemberRoleRequestSchema, createInvitationRequestSchema, createTeamRequestSchema, decodeCursor, defineErrors, defineEvent, documentDeletedPayloadSchema, documentExtension, documentFailureReasonSchema, documentFileNameSchema, documentIdSchema, documentMediaTypeSchema, documentParamsSchema, documentSchema, documentStateSchema, documentUploadedPayloadSchema, emailSchema, encodeCursor, errorBodySchema, errorCodeSchema, eventEnvelopeSchema, eventIdSchema, eventTypeSchema, foldAscii, formatId, idSchema, idempotencyKeySchema, internalAbandonOrganizationParamsSchema, internalAbandonOrganizationRequestSchema, internalAbandonOrganizationResponseSchema, internalAcceptInvitationRequestSchema, internalAcceptInvitationResponseSchema, internalCreateOrganizationRequestSchema, internalCreateOrganizationResponseSchema, internalMembershipRequestSchema, internalMembershipResponseSchema, internalRemoveOrganizationDocumentsParamsSchema, internalRemoveOrganizationDocumentsRequestSchema, internalRemoveOrganizationDocumentsResponseSchema, internalUpdateMemberProfileParamsSchema, internalUpdateMemberProfileRequestSchema, internalUpdateMemberProfileResponseSchema, invitableRoleSchema, invitationIdSchema, invitationParamsSchema, invitationSchema, invitationStateSchema, invitationTokenSchema, listDocumentsQuerySchema, listDocumentsResponseSchema, listInvitationsQuerySchema, listInvitationsResponseSchema, listMembersQuerySchema, listMembersResponseSchema, listTeamsQuerySchema, listTeamsResponseSchema, memberParamsSchema, memberSchema, membershipIdSchema, organizationIdSchema, organizationNameSchema, organizationSchema, organizationStatusSchema, pageQuerySchema, pageSchema, personNameSchema, prospectIdSchema, regionSchema, renameOrganizationRequestSchema, renameTeamRequestSchema, requestIdSchema, roleAtLeast, roleSchema, storedNameSchema, teamIdSchema, teamMemberParamsSchema, teamMemberSchema, teamNameSchema, teamParamsSchema, teamSchema, timestampSchema, uploadDocumentFileSchema, userIdSchema };
