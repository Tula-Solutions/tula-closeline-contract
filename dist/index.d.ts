import { z } from "zod";
/** An error code in `area.reason` form, such as `request.invalid`. */
declare const errorCodeSchema: z.ZodString;
/** The one body every service returns for a failure. */
declare const errorBodySchema: z.ZodObject<{
	error: z.ZodObject<{
		code: z.ZodString;
		message: z.ZodString;
		details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
	}, z.core.$strip>;
}, z.core.$strip>;
/** The body of a failure response, as returned by every service. */
type ErrorBody = z.infer<typeof errorBodySchema>;
/** What a registry knows about one error: its code, HTTP status and default message. */
type ErrorDefinition<Code extends string = string> = {
	readonly code: Code;
	readonly status: number;
	readonly message: string;
};
declare const common: readonly [ErrorDefinition<"request.invalid">, ErrorDefinition<"request.not_found">, ErrorDefinition<"request.conflict">, ErrorDefinition<"request.idempotency_key_reused">, ErrorDefinition<"request.too_large">, ErrorDefinition<"auth.unauthenticated">, ErrorDefinition<"auth.forbidden">, ErrorDefinition<"rate.limited">, ErrorDefinition<"server.internal">, ErrorDefinition<"server.unavailable">, ErrorDefinition<"server.timeout">];
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
import { z as z2 } from "zod";
/** An event type in `area.event_name` form, such as `team.created`. */
declare const eventTypeSchema: z2.ZodString;
/** An event type. */
type EventType = z2.infer<typeof eventTypeSchema>;
/** The envelope every event shares, wrapping a payload validated by `dataSchema`. */
declare function eventEnvelopeSchema<D extends z2.ZodType>(dataSchema: D): z2.ZodObject<{
	id: z2.core.$ZodBranded<z2.ZodString, "evt", "out">;
	type: z2.ZodString;
	version: z2.ZodNumber;
	occurredAt: z2.ZodISODateTime;
	organizationId: z2.core.$ZodBranded<z2.ZodString, "org", "out">;
	region: z2.ZodEnum<{
		eu: "eu";
		us: "us";
	}>;
	data: D;
}, z2.core.$strip>;
/** Declares one event type at one version; its schema accepts only that type and version. */
declare function defineEvent<
	const T extends string,
	const V extends number,
	D extends z2.ZodType
>(type: T, version: V, dataSchema: D): {
	type: T;
	version: V;
	schema: z2.ZodObject<{
		id: z2.core.$ZodBranded<z2.ZodString, "evt", "out">;
		occurredAt: z2.ZodISODateTime;
		organizationId: z2.core.$ZodBranded<z2.ZodString, "org", "out">;
		region: z2.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z2.ZodLiteral<T>;
		version: z2.ZodLiteral<V>;
		data: D;
	}, z2.core.$strip>;
	/** Parses an envelope of this type and version; throws a ZodError for anything else. */
	parse: (input: unknown) => ({
		id: z2.core.$ZodBranded<z2.ZodString, "evt", "out">;
		occurredAt: z2.ZodISODateTime;
		organizationId: z2.core.$ZodBranded<z2.ZodString, "org", "out">;
		region: z2.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z2.ZodLiteral<T>;
		version: z2.ZodLiteral<V>;
		data: D;
	} extends infer T_2 extends z2.core.$ZodLooseShape ? { -readonly [k in keyof T_2 as {
		id: z2.core.$ZodBranded<z2.ZodString, "evt", "out">;
		occurredAt: z2.ZodISODateTime;
		organizationId: z2.core.$ZodBranded<z2.ZodString, "org", "out">;
		region: z2.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z2.ZodLiteral<T>;
		version: z2.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? never : k] : T_2[k]["_zod"]["output"] } : never) & ({
		id: z2.core.$ZodBranded<z2.ZodString, "evt", "out">;
		occurredAt: z2.ZodISODateTime;
		organizationId: z2.core.$ZodBranded<z2.ZodString, "org", "out">;
		region: z2.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z2.ZodLiteral<T>;
		version: z2.ZodLiteral<V>;
		data: D;
	} extends infer T_3 extends z2.core.$ZodLooseShape ? { -readonly [k in keyof T_3 as {
		id: z2.core.$ZodBranded<z2.ZodString, "evt", "out">;
		occurredAt: z2.ZodISODateTime;
		organizationId: z2.core.$ZodBranded<z2.ZodString, "org", "out">;
		region: z2.ZodEnum<{
			eu: "eu";
			us: "us";
		}>;
		type: z2.ZodLiteral<T>;
		version: z2.ZodLiteral<V>;
		data: D;
	}[k] extends {
		_zod: {
			optout: "optional";
		};
	} ? k : never]? : T_3[k]["_zod"]["output"] | undefined } : never) extends infer T_1 ? { [K in keyof T_1] : T_1[K] } : never;
};
import { z as z3 } from "zod";
/** An id string branded with its prefix, so ids of different kinds cannot be mixed up. */
type Id<Prefix extends string> = string & z3.core.$brand<Prefix>;
/** An id for one prefix: `<prefix>_<32 lowercase hex characters>`, branded with the prefix. */
declare function idSchema<const Prefix extends string>(prefix: Prefix): PropertyKey extends Prefix ? z3.ZodString : z3.core.$ZodBranded<z3.ZodString, Prefix, "out">;
/** The id of an Organization (`org_…`). */
declare const organizationIdSchema: z3.core.$ZodBranded<z3.ZodString, "org", "out">;
/** The id of a user (`usr_…`). */
declare const userIdSchema: z3.core.$ZodBranded<z3.ZodString, "usr", "out">;
/** The id of a membership of a user in an Organization (`mem_…`). */
declare const membershipIdSchema: z3.core.$ZodBranded<z3.ZodString, "mem", "out">;
/** The id of a Team (`team_…`). */
declare const teamIdSchema: z3.core.$ZodBranded<z3.ZodString, "team", "out">;
/** The id of a Prospect (`prs_…`). */
declare const prospectIdSchema: z3.core.$ZodBranded<z3.ZodString, "prs", "out">;
/** The id of an event (`evt_…`). */
declare const eventIdSchema: z3.core.$ZodBranded<z3.ZodString, "evt", "out">;
/** The id of a request, for tracing (`req_…`). */
declare const requestIdSchema: z3.core.$ZodBranded<z3.ZodString, "req", "out">;
/** The id of an Organization. */
type OrganizationId = z3.infer<typeof organizationIdSchema>;
/** The id of a user. */
type UserId = z3.infer<typeof userIdSchema>;
/** The id of a membership. */
type MembershipId = z3.infer<typeof membershipIdSchema>;
/** The id of a Team. */
type TeamId = z3.infer<typeof teamIdSchema>;
/** The id of a Prospect. */
type ProspectId = z3.infer<typeof prospectIdSchema>;
/** The id of an event. */
type EventId = z3.infer<typeof eventIdSchema>;
/** The id of a request. */
type RequestId = z3.infer<typeof requestIdSchema>;
/** Turns a UUID (any case, dashes optional) into an id with the given prefix; throws if it is not a UUID. */
declare function formatId<const Prefix extends string>(prefix: Prefix, uuid: string): Id<Prefix>;
import { z as z4 } from "zod";
/** The largest page any list endpoint returns. */
declare const MAX_PAGE_SIZE = 100;
/** The page size used when a request does not ask for one. */
declare const DEFAULT_PAGE_SIZE = 25;
/** The query parameters of a list request: an optional cursor and a bounded limit (from a number or digit string). */
declare const pageQuerySchema: z4.ZodObject<{
	cursor: z4.ZodOptional<z4.ZodString>;
	limit: z4.ZodDefault<z4.ZodPipe<z4.ZodPipe<z4.ZodUnion<readonly [z4.ZodNumber, z4.ZodString]>, z4.ZodTransform<number, string | number>>, z4.ZodNumber>>;
}, z4.core.$strip>;
/** The parsed query parameters of a list request. */
type PageQuery = z4.infer<typeof pageQuerySchema>;
/** Builds the schema of one page of `itemSchema` items and the cursor for the next page, or null at the end. */
declare function pageSchema<T extends z4.ZodType>(itemSchema: T): z4.ZodObject<{
	items: z4.ZodArray<T>;
	nextCursor: z4.ZodNullable<z4.ZodString>;
}, z4.core.$strip>;
/** One page of items, as returned by a list endpoint. */
type Page<T> = {
	items: T[];
	nextCursor: string | null;
};
/** Encodes a JSON-serialisable value as an opaque URL-safe cursor (base64url of its JSON). */
declare function encodeCursor(value: unknown): string;
/** Decodes a cursor made by {@link encodeCursor}; returns undefined, never throws, for anything invalid. */
declare function decodeCursor<T extends z4.ZodType>(text: string, schema: T): z4.output<T> | undefined;
import { z as z5 } from "zod";
/** Every Region an Organization can be created in. */
declare const REGIONS: readonly ["us", "eu"];
/** A Region: the geography whose boundary an Organization's data never crosses. */
declare const regionSchema: z5.ZodEnum<{
	eu: "eu";
	us: "us";
}>;
/** A Region. */
type Region = z5.infer<typeof regionSchema>;
/** Every role, ordered from most to least privileged. */
declare const ROLES: readonly ["owner", "admin", "manager", "rep"];
/** A member's role in an Organization. */
declare const roleSchema: z5.ZodEnum<{
	admin: "admin";
	manager: "manager";
	owner: "owner";
	rep: "rep";
}>;
/** A role. */
type Role = z5.infer<typeof roleSchema>;
/** Whether `role` is at least as privileged as `minimum`; an unrecognised role is never enough. */
declare function roleAtLeast(role: Role, minimum: Role): boolean;
/** This library's package name, so a consumer can report which shared libraries it resolved. */
declare const PACKAGE = "tula-closeline-contract";
export { CommonErrorCode, DEFAULT_PAGE_SIZE, ERRORS, ErrorBody, ErrorDefinition, ErrorInput, EventId, EventType, Id, MAX_PAGE_SIZE, MembershipId, OrganizationId, PACKAGE, Page, PageQuery, ProspectId, REGIONS, ROLES, Region, RequestId, Role, TeamId, UserId, decodeCursor, defineErrors, defineEvent, encodeCursor, errorBodySchema, errorCodeSchema, eventEnvelopeSchema, eventIdSchema, eventTypeSchema, formatId, idSchema, membershipIdSchema, organizationIdSchema, pageQuerySchema, pageSchema, prospectIdSchema, regionSchema, requestIdSchema, roleAtLeast, roleSchema, teamIdSchema, userIdSchema };
