// src/errors.ts
import { z } from "zod";
var CODE_PATTERN = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;
var AREA_PATTERN = /^[a-z][a-z0-9_]*$/;
var errorCodeSchema = z.string().max(100).regex(CODE_PATTERN);
var errorBodySchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string().min(1).max(2000),
    details: z.record(z.string(), z.unknown()).optional()
  })
});
var freezeEntry = (code, status, message) => Object.freeze({ code, status, message });
var common = [
  freezeEntry("request.invalid", 400, "The request is not valid."),
  freezeEntry("request.not_found", 404, "The resource was not found."),
  freezeEntry("request.conflict", 409, "The request conflicts with the current state."),
  freezeEntry("request.idempotency_key_reused", 422, "The idempotency key was already used with a different request."),
  freezeEntry("request.idempotency_in_progress", 409, "A request with this idempotency key is still in progress. Try again shortly."),
  freezeEntry("request.too_large", 413, "The request body is too large."),
  freezeEntry("request.method_not_allowed", 405, "This method is not allowed for this route."),
  freezeEntry("request.unsupported_media_type", 415, "The request content type is not supported."),
  freezeEntry("request.unprocessable", 422, "The request cannot be processed."),
  freezeEntry("auth.unauthenticated", 401, "Authentication is required."),
  freezeEntry("auth.forbidden", 403, "You are not allowed to do this."),
  freezeEntry("auth.token_expired", 401, "The access token has expired. Refresh it and try again."),
  freezeEntry("auth.token_invalid", 401, "The access token is not valid."),
  freezeEntry("auth.unavailable", 503, "Tokens cannot be verified right now. Try again later."),
  freezeEntry("rate.limited", 429, "Too many requests. Try again later."),
  freezeEntry("server.internal", 500, "Something went wrong on our side."),
  freezeEntry("server.unavailable", 503, "The service is temporarily unavailable."),
  freezeEntry("server.timeout", 504, "The request took too long to complete.")
];
var ERRORS = Object.freeze(Object.fromEntries(common.map((entry) => [entry.code, entry])));
var statusSchema = z.number().int().min(400).max(599);
var messageSchema = z.string().min(1).max(2000);
function defineErrors(area, entries) {
  if (!AREA_PATTERN.test(area)) {
    throw new Error(`Invalid error area: ${area}`);
  }
  const registry = {};
  for (const [reason, input] of Object.entries(entries)) {
    const code = errorCodeSchema.parse(`${area}.${reason}`);
    if (code in ERRORS || code in registry) {
      throw new Error(`Duplicate error code: ${code}`);
    }
    registry[code] = Object.freeze({
      code,
      status: statusSchema.parse(input.status),
      message: messageSchema.parse(input.message)
    });
  }
  return Object.freeze(registry);
}

// src/core/errors.ts
var CORE_ERRORS = {
  ...defineErrors("organization", {
    not_found: { status: 404, message: "The Organization was not found." },
    suspended: { status: 403, message: "This Organization is suspended." },
    deleted: { status: 410, message: "This Organization has been deleted." },
    not_abandonable: { status: 409, message: "This Organization cannot be abandoned." }
  }),
  ...defineErrors("member", {
    not_found: { status: 404, message: "The member was not found." },
    last_owner: {
      status: 409,
      message: "The last Owner cannot be removed or demoted. Promote a different member to Owner first."
    }
  }),
  ...defineErrors("membership", {
    already_member: { status: 409, message: "You already belong to an Organization." }
  }),
  ...defineErrors("invitation", {
    invalid: { status: 422, message: "The invitation is not valid." },
    not_found: { status: 404, message: "The invitation was not found." },
    already_pending: {
      status: 409,
      message: "A matching invitation is already pending. Revoke it to send a new one."
    }
  }),
  ...defineErrors("team", {
    not_found: { status: 404, message: "The Team was not found." },
    name_taken: { status: 409, message: "A Team with that name already exists." }
  })
};
var SIGNUP_ERRORS = {
  ...defineErrors("auth", {
    no_organization: {
      status: 403,
      message: "You do not belong to an Organization, so you cannot sign in."
    }
  }),
  ...defineErrors("signup", {
    invitation_invalid: { status: 422, message: "The invitation is not valid." },
    organization_name_invalid: { status: 422, message: "Enter a valid Organization name." }
  }),
  ...defineErrors("membership", {
    unavailable: {
      status: 503,
      message: "Organization membership is unavailable right now. Try again shortly."
    }
  })
};

// src/auth/errors.ts
var AUTH_ERRORS = {
  ...defineErrors("auth", {
    invalid_credentials: { status: 401, message: "The email address or password is not right." },
    user_banned: { status: 403, message: "This account cannot sign in." }
  }),
  ...defineErrors("email", {
    invalid: { status: 422, message: "Enter a valid email address." }
  }),
  ...defineErrors("password", {
    too_short: { status: 422, message: "The password is too short." },
    too_long: { status: 422, message: "The password is too long." },
    contains_user_info: { status: 422, message: "The password contains your name or email." },
    common: { status: 422, message: "The password is too common." },
    breached: {
      status: 422,
      message: "The password appeared in a data breach. Choose a different one."
    }
  }),
  ...defineErrors("verification", {
    invalid_code: { status: 422, message: "The code is not right." },
    expired: { status: 422, message: "The code has expired. Ask for a new one." },
    too_many_attempts: { status: 429, message: "Too many wrong codes. Ask for a new one." }
  }),
  ...defineErrors("flow", {
    not_found: { status: 404, message: "This sign-in or sign-up was not found or has ended." },
    invalid_step: { status: 409, message: "This step is not available now. Start again." }
  }),
  ...SIGNUP_ERRORS,
  "organization.deleted": CORE_ERRORS["organization.deleted"],
  ...defineErrors("mail", {
    unavailable: { status: 503, message: "The email could not be sent right now. Try again." }
  }),
  ...defineErrors("session", {
    invalid_token: { status: 401, message: "The refresh token is not valid." },
    revoked: { status: 401, message: "This session has ended." },
    expired: { status: 401, message: "This session has expired. Sign in again." },
    reuse_detected: {
      status: 401,
      message: "A refresh token was used twice, so the session was ended. Sign in again."
    }
  })
};
// src/core/internal.ts
import { z as z6 } from "zod";

// src/email.ts
import { z as z2 } from "zod";
var MAX_EMAIL_LENGTH = 320;
function foldAscii(text) {
  return text.replace(/[A-Z]/g, (letter) => String.fromCharCode(letter.charCodeAt(0) + 32));
}
function isPrintableAscii(text) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code < 33 || code > 126) {
      return false;
    }
  }
  return true;
}
function hasOneInteriorAt(text) {
  const first = text.indexOf("@");
  return first > 0 && first < text.length - 1 && text.indexOf("@", first + 1) === -1;
}
var emailSchema = z2.string().max(MAX_EMAIL_LENGTH).transform(foldAscii).pipe(z2.string().min(3).refine(hasOneInteriorAt, "Exactly one @, neither first nor last").refine(isPrintableAscii, "Printable ASCII only"));

// src/ids.ts
import { z as z3 } from "zod";
var PREFIX_PATTERN = /^[a-z]{2,5}$/;
function idSchema(prefix) {
  if (!PREFIX_PATTERN.test(prefix)) {
    throw new Error(`Invalid id prefix: ${prefix}`);
  }
  return z3.string().regex(new RegExp(`^${prefix}_[0-9a-f]{32}$`)).brand();
}
var organizationIdSchema = idSchema("org");
var userIdSchema = idSchema("usr");
var membershipIdSchema = idSchema("mem");
var teamIdSchema = idSchema("team");
var invitationIdSchema = idSchema("inv");
var prospectIdSchema = idSchema("prs");
var documentIdSchema = idSchema("doc");
var dealRecordIdSchema = idSchema("deal");
var callIdSchema = idSchema("call");
var dealImportIdSchema = idSchema("dimp");
var eventIdSchema = idSchema("evt");
var requestIdSchema = idSchema("req");
var UUID_PATTERN = /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
function formatId(prefix, uuid) {
  if (typeof uuid !== "string" || !UUID_PATTERN.test(uuid)) {
    throw new Error("Not a UUID: expected 32 hexadecimal characters or the 8-4-4-4-12 form");
  }
  const hex = uuid.replaceAll("-", "").toLowerCase();
  return idSchema(prefix).parse(`${prefix}_${hex}`);
}

// src/tenancy.ts
import { z as z4 } from "zod";
var REGIONS = ["us", "eu"];
var regionSchema = z4.enum(REGIONS);
var ROLES = ["owner", "admin", "manager", "rep"];
var roleSchema = z4.enum(ROLES);
function roleAtLeast(role, minimum) {
  const have = ROLES.indexOf(role);
  const need = ROLES.indexOf(minimum);
  return have !== -1 && need !== -1 && have <= need;
}
var INVITABLE_ROLES = ["admin", "manager", "rep"];
var invitableRoleSchema = z4.enum(INVITABLE_ROLES);
var ORGANIZATION_STATUSES = ["active", "suspended", "deleted"];
var organizationStatusSchema = z4.enum(ORGANIZATION_STATUSES);

// src/core/values.ts
import { z as z5 } from "zod";
var MAX_NAME_LENGTH = 200;
function hasControlCharacter(text) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code < 32 || code >= 127 && code <= 159) {
      return true;
    }
  }
  return false;
}
function isWellFormed(text) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code >= 55296 && code <= 56319) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 56320 && next <= 57343)) {
        return false;
      }
      index += 1;
    } else if (code >= 56320 && code <= 57343) {
      return false;
    }
  }
  return true;
}
var MAX_RAW_NAME_LENGTH = 1000;
function boundedName(maxLength) {
  return z5.string().max(MAX_RAW_NAME_LENGTH).trim().pipe(z5.string().min(1).max(maxLength).refine(isWellFormed, "Well-formed text only").refine((text) => !hasControlCharacter(text), "No control characters"));
}
var nameSchema = boundedName(MAX_NAME_LENGTH);
var organizationNameSchema = nameSchema;
var teamNameSchema = nameSchema;
var MAX_PERSON_NAME_LENGTH = 201;
var personNameSchema = boundedName(MAX_PERSON_NAME_LENGTH);
var storedNameSchema = z5.string().min(1).max(1000);
var INVITATION_STATES = ["pending", "accepted", "revoked"];
var invitationStateSchema = z5.enum(INVITATION_STATES);
var timestampSchema = z5.iso.datetime({ offset: true }).max(64);
var invitationTokenSchema = z5.string().min(22).max(256).regex(/^[A-Za-z0-9_-]+$/);
var IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
var idempotencyKeySchema = z5.string().min(16).max(128).regex(/^[A-Za-z0-9_.:-]+$/);

// src/core/internal.ts
var INTERNAL_CALL_ERRORS = Object.freeze({
  createOrganization: Object.freeze(["membership.already_member"]),
  acceptInvitation: Object.freeze(["invitation.invalid", "membership.already_member"]),
  membership: Object.freeze([]),
  updateMemberProfile: Object.freeze(["member.not_found"]),
  abandonOrganization: Object.freeze(["organization.not_abandonable"])
});
var internalCreateOrganizationRequestSchema = z6.strictObject({
  userId: userIdSchema,
  organizationName: organizationNameSchema,
  email: emailSchema.optional(),
  name: personNameSchema.nullable().optional()
});
var internalCreateOrganizationResponseSchema = z6.object({
  organizationId: organizationIdSchema,
  role: z6.literal("owner")
});
var internalAcceptInvitationRequestSchema = z6.strictObject({
  userId: userIdSchema,
  email: emailSchema,
  name: personNameSchema.nullable().optional(),
  invitationToken: invitationTokenSchema
});
var internalAcceptInvitationResponseSchema = z6.object({
  organizationId: organizationIdSchema,
  role: invitableRoleSchema
});
var internalMembershipRequestSchema = z6.strictObject({
  userId: userIdSchema
});
var internalMembershipResponseSchema = z6.discriminatedUnion("found", [
  z6.object({
    found: z6.literal(true),
    organizationId: organizationIdSchema,
    role: roleSchema,
    organizationStatus: organizationStatusSchema
  }),
  z6.object({ found: z6.literal(false) })
]);
var internalUpdateMemberProfileParamsSchema = z6.strictObject({
  userId: userIdSchema
});
var internalUpdateMemberProfileRequestSchema = z6.strictObject({
  email: emailSchema.optional(),
  name: personNameSchema.nullable().optional()
}).refine((body) => body.email !== undefined || body.name !== undefined, {
  message: "Send an email, a name or both"
});
var internalUpdateMemberProfileResponseSchema = z6.object({
  userId: userIdSchema,
  email: emailSchema,
  name: storedNameSchema.nullable()
});
var ABANDON_MAX_AGE_HOURS = 24;
var internalAbandonOrganizationParamsSchema = z6.strictObject({
  organizationId: organizationIdSchema
});
var internalAbandonOrganizationRequestSchema = z6.strictObject({
  userId: userIdSchema
});
var internalAbandonOrganizationResponseSchema = z6.object({
  organizationId: organizationIdSchema,
  status: z6.literal("deleted")
});
// src/core/invitation.ts
import { z as z8 } from "zod";

// src/pagination.ts
import { z as z7 } from "zod";
var MAX_PAGE_SIZE = 100;
var DEFAULT_PAGE_SIZE = 25;
var MAX_CURSOR_LENGTH = 512;
var cursorTextSchema = z7.string().min(1).max(MAX_CURSOR_LENGTH);
var pageQuerySchema = z7.object({
  cursor: cursorTextSchema.optional(),
  limit: z7.union([z7.number(), z7.string().regex(/^\d{1,3}$/)]).transform((value) => Number(value)).pipe(z7.number().int().min(1).max(MAX_PAGE_SIZE)).default(DEFAULT_PAGE_SIZE)
});
function pageSchema(itemSchema) {
  return z7.object({
    items: z7.array(itemSchema).max(MAX_PAGE_SIZE),
    nextCursor: cursorTextSchema.nullable()
  });
}
function encodeCursor(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const cursor = btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  if (cursor.length > MAX_CURSOR_LENGTH) {
    throw new Error(`Cursor is ${cursor.length} characters; the limit is ${MAX_CURSOR_LENGTH}. Put less in the position.`);
  }
  return cursor;
}
function decodeCursor(text, schema) {
  if (typeof text !== "string" || text.length > MAX_CURSOR_LENGTH || !/^[A-Za-z0-9_-]+$/.test(text)) {
    return;
  }
  try {
    const padded = text.replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const result = schema.safeParse(JSON.parse(json));
    return result.success ? result.data : undefined;
  } catch {
    return;
  }
}

// src/core/invitation.ts
var invitationSchema = z8.object({
  id: invitationIdSchema,
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.nullable(),
  state: invitationStateSchema,
  invitedByUserId: userIdSchema,
  expiresAt: timestampSchema,
  createdAt: timestampSchema
});
var createInvitationRequestSchema = z8.strictObject({
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.optional()
});
var listInvitationsQuerySchema = pageQuerySchema.extend({ state: invitationStateSchema.default("pending") }).strict();
var listInvitationsResponseSchema = pageSchema(invitationSchema);
var invitationParamsSchema = z8.strictObject({
  invitationId: invitationIdSchema
});
// src/core/member.ts
import { z as z9 } from "zod";
var memberSchema = z9.object({
  id: membershipIdSchema,
  userId: userIdSchema,
  email: emailSchema,
  name: storedNameSchema.nullable(),
  role: roleSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var listMembersQuerySchema = pageQuerySchema.strict();
var listMembersResponseSchema = pageSchema(memberSchema);
var memberParamsSchema = z9.strictObject({
  membershipId: membershipIdSchema
});
var changeMemberRoleRequestSchema = z9.strictObject({
  role: roleSchema
});
// src/core/organization.ts
import { z as z10 } from "zod";
var organizationSchema = z10.object({
  id: organizationIdSchema,
  name: storedNameSchema,
  region: regionSchema,
  status: organizationStatusSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var renameOrganizationRequestSchema = z10.strictObject({
  name: organizationNameSchema
});
// src/core/team.ts
import { z as z11 } from "zod";
var teamSchema = z11.object({
  id: teamIdSchema,
  name: storedNameSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var createTeamRequestSchema = z11.strictObject({
  name: teamNameSchema
});
var renameTeamRequestSchema = z11.strictObject({
  name: teamNameSchema
});
var listTeamsQuerySchema = pageQuerySchema.strict();
var listTeamsResponseSchema = pageSchema(teamSchema);
var teamParamsSchema = z11.strictObject({
  teamId: teamIdSchema
});
var addTeamMemberRequestSchema = z11.strictObject({
  membershipId: membershipIdSchema
});
var teamMemberSchema = z11.object({
  teamId: teamIdSchema,
  membershipId: membershipIdSchema,
  createdAt: timestampSchema
});
var teamMemberParamsSchema = z11.strictObject({
  teamId: teamIdSchema,
  membershipId: membershipIdSchema
});
// src/events.ts
import { z as z12 } from "zod";
var eventTypeSchema = errorCodeSchema;
var versionSchema = z12.number().int().positive();
var occurredAtSchema = z12.iso.datetime({ offset: true }).max(64);
var envelopeShape = {
  id: eventIdSchema,
  type: eventTypeSchema,
  version: versionSchema,
  occurredAt: occurredAtSchema,
  organizationId: organizationIdSchema,
  region: regionSchema
};
function eventEnvelopeSchema(dataSchema) {
  return z12.object({ ...envelopeShape, data: dataSchema });
}
function defineEvent(type, version, dataSchema) {
  const schema = z12.object({
    ...envelopeShape,
    type: z12.literal(eventTypeSchema.parse(type)),
    version: z12.literal(versionSchema.parse(version)),
    data: dataSchema
  });
  return {
    type,
    version,
    schema,
    parse: (input) => schema.parse(input),
    safeParse: (input) => schema.safeParse(input)
  };
}
// src/playbook/errors.ts
var PLAYBOOK_ERRORS = {
  ...defineErrors("document", {
    not_found: { status: 404, message: "The document was not found." },
    unsupported_type: { status: 415, message: "This file type is not supported." },
    too_large: { status: 413, message: "The file is larger than the upload limit." },
    quota_exceeded: {
      status: 409,
      message: "The Organization has reached its limit on the number or total size of documents. Deleted documents count until they are purged."
    },
    not_restorable: {
      status: 410,
      message: "The document was purged after its retention period and cannot be restored."
    }
  })
};

// src/playbook/routes.ts
var PLAYBOOK_WRITE_ROLES = ["owner", "admin"];
var PLAYBOOK_READ_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var route = (definition) => Object.freeze(definition);
var PLAYBOOK_ROUTES = Object.freeze({
  uploadDocument: route({
    method: "POST",
    path: "/playbook/documents",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [201, 200],
    errors: ["document.unsupported_type", "document.too_large", "document.quota_exceeded"],
    commonErrors: [
      "request.invalid",
      "request.too_large",
      "request.unsupported_media_type",
      "request.idempotency_key_reused",
      "request.idempotency_in_progress"
    ],
    description: `Uploads one file (multipart/form-data, one part named "file") to the Organization's Playbook. Owner and Admin only; Managers and Reps get auth.forbidden. The type and size of the file part are checked before anything is stored: document.unsupported_type (415) and document.too_large (413); a malformed name or an empty file is request.invalid. The common request.too_large and request.unsupported_media_type apply to the whole request instead: a body over the envelope limit, or a body that is not multipart. Answers 201 with the new document in state "uploaded". If the content matches a document the Organization already has, answers 200 with that stored document, with its stored fileName (not the new upload's name), so a duplicate is an answer, not an error: a match on a "deleted" document restores it (state "processing"), and a match on a "failed" document re-queues it for processing and answers with state "uploaded". The page limit is not checked here: a document over it ends in state "failed" with failureReason "too_many_pages". Accepts an Idempotency-Key header.`
  }),
  listDocuments: route({
    method: "GET",
    path: "/playbook/documents",
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's documents, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner, Admin, Manager and Rep may read. Soft-deleted documents are left out unless state=deleted is asked for."
  }),
  getDocument: route({
    method: "GET",
    path: "/playbook/documents/{documentId}",
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: ["document.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one document and its state, with the failure reason when it failed and the purge time when it was deleted. Owner, Admin, Manager and Rep may read."
  }),
  deleteDocument: route({
    method: "DELETE",
    path: "/playbook/documents/{documentId}",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["document.not_found"],
    commonErrors: ["request.invalid"],
    description: 'Soft-deletes a document: it is hidden at once and purged after the retention period, and can be restored until then. Owner and Admin only. Idempotent by end state: answers 200 with the document in state "deleted" and its purge time, and deleting an already deleted document answers the same. Takes no body.'
  }),
  restoreDocument: route({
    method: "POST",
    path: "/playbook/documents/{documentId}/restore",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["document.not_found", "document.not_restorable"],
    commonErrors: ["request.invalid"],
    description: 'Restores a soft-deleted document within the retention period; it is re-ingested from the kept file and shows as "processing". Owner and Admin only. Idempotent by end state: a document that is no longer deleted (restored by an earlier call, or never deleted) answers 200 with the document as it is. A deleted document whose purge time has passed but which the purge has not yet removed is document.not_restorable (410); once purged the record is gone and the answer is document.not_found (404). Takes no body.'
  }),
  removeOrganizationDocuments: route({
    method: "POST",
    path: "/internal/playbook/organizations/{organizationId}/remove-all",
    internal: true,
    roles: [],
    success: [200],
    errors: [],
    commonErrors: [
      "request.invalid",
      "request.idempotency_key_reused",
      "request.idempotency_in_progress",
      "server.unavailable"
    ],
    description: "Internal, for offboarding and erasure; no caller yet. Removes every document, file, chunk and vector an Organization has, and, since ADR 0018, its Calls, Recordings, Transcripts, Moments, Deals and Deal imports (and the copy the transcription vendor holds of a Recording), soft-deleted ones included, without waiting for retention. Idempotent by end state: it answers 200 whenever nothing remains, and never answers 200 while data remains. A transient failure (the store, the vector index or the vendor is briefly unreachable) answers 503 server.unavailable with a Retry-After header, and a repeat with the same Idempotency-Key or without reaches 200 once the removal finishes; a failure that will not go away stays an error. Served on the internal network only; takes the Organization from the path."
  })
});

// src/playbook/sales-history-errors.ts
import { z as z16 } from "zod";

// src/playbook/rights.ts
import { z as z15 } from "zod";

// src/playbook/rights-wording.ts
import { z as z14 } from "zod";

// src/playbook/values.ts
import { z as z13 } from "zod";
var DOCUMENT_STATES = ["uploaded", "processing", "ready", "failed", "deleted"];
var documentStateSchema = z13.enum(DOCUMENT_STATES);
var DOCUMENT_FAILURE_REASONS = [
  "too_many_pages",
  "unreadable",
  "password_protected",
  "no_text",
  "processing_failed"
];
var documentFailureReasonSchema = z13.enum(DOCUMENT_FAILURE_REASONS);
var ACCEPTED_DOCUMENT_EXTENSIONS = [".pdf", ".docx", ".pptx", ".txt", ".md"];
var ACCEPTED_DOCUMENT_MEDIA_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown"
];
var documentMediaTypeSchema = z13.enum(ACCEPTED_DOCUMENT_MEDIA_TYPES);
var MEDIA_TYPE_BY_EXTENSION = Object.freeze({
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain",
  ".md": "text/markdown"
});
var MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
var MAX_DOCUMENT_PAGES = 300;
var DOCUMENT_RETENTION_DAYS = 30;
var DEFAULT_MAX_DOCUMENTS = 500;
var DEFAULT_MAX_DOCUMENT_BYTES_TOTAL = 2 * 1024 * 1024 * 1024;
var MAX_UTF8_BYTES_PER_CODE_POINT = 4;
var MAX_DOCUMENT_FILE_NAME_LENGTH = 255;
var MAX_RAW_FILE_NAME_LENGTH = 1000;
var MAX_DOCUMENT_FILE_NAME_BYTES = MAX_DOCUMENT_FILE_NAME_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT;
function isStripped(code) {
  return code <= 31 || code >= 127 && code <= 159 || code === 1564 || code === 8206 || code === 8207 || code >= 8234 && code <= 8238 || code >= 8294 && code <= 8297;
}
function normaliseFileName(name) {
  return stripUnsafe(name).trim();
}
function stripUnsafe(text) {
  let out = "";
  for (let index = 0;index < text.length; index += 1) {
    if (!isStripped(text.charCodeAt(index))) {
      out += text[index];
    }
  }
  return out;
}
function isWellFormed2(text) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code >= 55296 && code <= 56319) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 56320 && next <= 57343)) {
        return false;
      }
      index += 1;
    } else if (code >= 56320 && code <= 57343) {
      return false;
    }
  }
  return true;
}
function documentExtension(fileName) {
  const lower = fileName.toLowerCase();
  return ACCEPTED_DOCUMENT_EXTENSIONS.find((extension) => lower.endsWith(extension));
}
var INVISIBLE_STEM = /^[\s\u200b-\u200d\u2060\ufeff]*$/;
function hasStem(name) {
  const dot = name.lastIndexOf(".");
  const stem = dot === -1 ? name : name.slice(0, dot);
  return !INVISIBLE_STEM.test(stem);
}
var documentFileNameSchema = z13.string().max(MAX_RAW_FILE_NAME_LENGTH).transform(normaliseFileName).pipe(z13.string().min(1).max(MAX_DOCUMENT_FILE_NAME_LENGTH).refine(isWellFormed2, "Well-formed text only").refine((name) => !/[/\\]/.test(name), "No path separators").refine(hasStem, "A name before the extension"));
var documentTypeCheckSchema = z13.string().transform(normaliseFileName).pipe(z13.string().refine((name) => documentExtension(name) !== undefined, "An accepted file type only"));
var documentSizeCheckSchema = z13.number().max(MAX_DOCUMENT_BYTES);
function normaliseMediaType(mediaType) {
  return (mediaType.split(";")[0] ?? "").trim().toLowerCase();
}
function hasStrippableCharacter(text) {
  for (let index = 0;index < text.length; index += 1) {
    if (isStripped(text.charCodeAt(index))) {
      return true;
    }
  }
  return false;
}
function isWellFormedText(text) {
  return isWellFormed2(text);
}

// src/playbook/rights-wording.ts
var MAX_RIGHTS_HEADING_LENGTH = 200;
var MAX_RIGHTS_PARAGRAPHS = 10;
var MAX_RIGHTS_TEXT_LENGTH = 2000;
var textSchema = (max) => z14.string().min(1).max(max).refine(isWellFormedText, "Well-formed text only").refine((text) => !hasStrippableCharacter(text), "No control or direction characters").refine((text) => text.trim() === text, "No surrounding spaces");
var rightsWordingSchema = z14.strictObject({
  heading: textSchema(MAX_RIGHTS_HEADING_LENGTH),
  paragraphs: z14.array(textSchema(MAX_RIGHTS_TEXT_LENGTH)).min(1).max(MAX_RIGHTS_PARAGRAPHS),
  checkbox: textSchema(MAX_RIGHTS_TEXT_LENGTH),
  draft: z14.literal(true).optional()
});
function freeze(wording) {
  return Object.freeze({
    ...wording,
    paragraphs: Object.freeze([...wording.paragraphs])
  });
}
var RIGHTS_WORDINGS = Object.freeze({
  1: freeze({
    draft: true,
    heading: "Confirm your right to share Calls",
    paragraphs: [
      "Before you upload Transcripts or Recordings of past Calls, Closeline records that your Organization has the right to share them.",
      "The Calls you upload hold the words, and in a Recording the voices, of your Reps and of your Prospects. Closeline stores them for your Organization and uses them to find similar Moments from won Deals. It does not share them with other Organizations."
    ],
    checkbox: "I confirm that I am authorised to act for my Organization, that my Organization has the right to share the Transcripts and Recordings it uploads to Closeline, and that any notice to the people on those Calls and any consent the law requires have been given or obtained. I understand that this confirmation is recorded with my name and the time."
  })
});
var CURRENT_RIGHTS_WORDING_VERSION = Math.max(...Object.keys(RIGHTS_WORDINGS).map(Number));
function rightsWordingFor(version) {
  return Object.hasOwn(RIGHTS_WORDINGS, version) ? RIGHTS_WORDINGS[version] : undefined;
}

// src/playbook/rights.ts
var MAX_RIGHTS_WORDING_VERSION = 1e6;
var rightsWordingVersionSchema = z15.number().int().min(1).max(MAX_RIGHTS_WORDING_VERSION);
var rightsConfirmationSchema = z15.object({
  wordingVersion: rightsWordingVersionSchema,
  confirmedByUserId: userIdSchema,
  confirmedAt: timestampSchema
});
var rightsStatusSchema = z15.object({
  currentWordingVersion: rightsWordingVersionSchema,
  confirmation: rightsConfirmationSchema.nullable(),
  confirmed: z15.boolean(),
  currentWording: rightsWordingSchema.optional()
}).refine((status) => status.confirmed === (status.confirmation !== null && status.confirmation.wordingVersion === status.currentWordingVersion), { message: "Confirmed exactly when the stored version is the current one", path: ["confirmed"] });
var confirmRightsRequestSchema = z15.strictObject({
  wordingVersion: rightsWordingVersionSchema
});

// src/playbook/sales-history-errors.ts
var SALES_HISTORY_ERRORS = {
  ...defineErrors("call", {
    not_found: { status: 404, message: "The Call was not found." },
    unsupported_type: { status: 415, message: "This file type is not supported." },
    too_large: { status: 413, message: "The file is larger than the upload limit." },
    quota_exceeded: {
      status: 409,
      message: "The Organization has reached its limit on Calls, Recordings or Deals. Deleted Calls count until they are purged."
    },
    content_in_other_deal: {
      status: 409,
      message: "This Call was already uploaded for a different Deal."
    },
    rep_invalid: { status: 422, message: "The Rep choice is not valid for this Call." },
    rep_not_changeable: {
      status: 409,
      message: "The Rep of this Call cannot be changed in its current state."
    },
    not_restorable: {
      status: 410,
      message: "The Call was purged after its retention period and cannot be restored."
    }
  }),
  ...defineErrors("deal", {
    not_found: { status: 404, message: "The Deal was not found." }
  }),
  ...defineErrors("deal_import", {
    not_found: { status: 404, message: "The import was not found." },
    unsupported_type: { status: 415, message: "This file type is not supported." },
    too_large: { status: 413, message: "The file is larger than the upload limit." },
    header_invalid: {
      status: 422,
      message: "The first row does not match the template."
    },
    busy: {
      status: 429,
      message: "Too many imports are waiting. Try again when some have finished."
    }
  }),
  ...defineErrors("rights", {
    confirmation_required: {
      status: 403,
      message: "Confirm that your Organization may share these Calls before uploading them."
    },
    version_outdated: {
      status: 409,
      message: "The confirmation wording has changed. Reload and confirm the current version."
    }
  })
};
var rightsRequiredDetailsSchema = z16.strictObject({
  wordingVersion: z16.number().int().min(1).max(MAX_RIGHTS_WORDING_VERSION)
});

// src/playbook/sales-history-routes.ts
var SALES_HISTORY_READ_ROLES = PLAYBOOK_WRITE_ROLES;
var route2 = (definition) => Object.freeze(definition);
var ENVELOPE_ERRORS = [
  "request.invalid",
  "request.too_large",
  "request.unsupported_media_type",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var SALES_HISTORY_ROUTES = Object.freeze({
  uploadCall: route2({
    method: "POST",
    path: "/playbook/calls",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [201, 200],
    errors: [
      "rights.confirmation_required",
      "call.unsupported_type",
      "call.too_large",
      "call.quota_exceeded",
      "call.rep_invalid",
      "call.content_in_other_deal"
    ],
    commonErrors: [...ENVELOPE_ERRORS],
    description: 'Uploads one Call as a Transcript (txt, vtt, srt or json, up to 5 MB) or a Recording (mp3, m4a, wav, ogg, webm or flac, up to 500 MB, streamed to storage and never held whole), as multipart/form-data with one file part named "file" and the text fields "dealId" and "rep". Owner and Admin only; Managers and Reps get auth.forbidden. A Transcript needs "rep", the JSON {"by":"speaker","label":...}; a per-side Recording takes {"by":"channel","channel":"left"|"right"}; a Recording with no "rep" waits in state "awaiting_rep" after transcription until an Owner or Admin picks one. A Deal that does not exist yet is created "open". Refused with rights.confirmation_required (403, its details name the wording version to show) until the Organization has a current rights confirmation. The type and size of the file part are checked before anything is stored: call.unsupported_type (415) and call.too_large (413); a malformed name, an empty file or a bad field is request.invalid, and a Rep choice that does not suit the kind is call.rep_invalid. The common request.too_large and request.unsupported_media_type apply to the whole request instead. Answers 201 with the new Call in state "uploaded". If the content matches a Call the Organization already has under the same Deal, answers 200 with that stored Call: a match on a "deleted" Call restores it (state "processing") and a match on a "failed" Call under the same Deal whose failureReason is transcription_failed, transcription_timed_out or processing_failed (reasons that can be transient) re-queues it for processing (state "uploaded"); a match on a failed Call with any other reason answers 200 with the failed Call unchanged, because the same file would fail the same way: rep_label_not_found and not_per_side are fixed by changing the Rep, and too_many_speakers, no_turns, too_few_speakers, too_long and unreadable by choosing to delete the Call and upload a corrected file; any other match returns the Call as it is. The same content under another deal id is call.content_in_other_deal. A recording over 3 hours, a Transcript with no turns or fewer than two speakers, or a Rep label not in the file is not checked here: the Call ends in state "failed" with a failureReason. Accepts an Idempotency-Key header.'
  }),
  listCalls: route2({
    method: "GET",
    path: "/playbook/calls",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Calls, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only. Deleted Calls are left out unless state=deleted is asked for; state=awaiting_rep lists the Calls waiting for a Rep and dealRecordId (the opaque Deal id) limits the list to one Deal."
  }),
  getCall: route2({
    method: "GET",
    path: "/playbook/calls/{callId}",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Call and its state, with the failure reason when it failed, the speaker labels to pick a Rep from and the purge time when it was deleted. No Transcript text or audio is returned. Owner and Admin only."
  }),
  deleteCall: route2({
    method: "DELETE",
    path: "/playbook/calls/{callId}",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: 'Soft-deletes a Call: it and its Moments are hidden from search at once and purged after 30 days, and it can be restored until then. Owner and Admin only. Idempotent by end state: answers 200 with the Call in state "deleted" and its purge time, and deleting an already deleted Call answers the same. Takes no body.'
  }),
  restoreCall: route2({
    method: "POST",
    path: "/playbook/calls/{callId}/restore",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["call.not_found", "call.not_restorable"],
    commonErrors: ["request.invalid"],
    description: 'Restores a soft-deleted Call within the retention period; it is processed again from the kept Transcript (a Recording is never transcribed twice) and shows as "processing". Owner and Admin only. Idempotent by end state: a Call that is no longer deleted answers 200 with the Call as it is. A deleted Call whose purge time has passed but which the purge has not yet removed is call.not_restorable (410); once purged the record is gone and the answer is call.not_found (404). Takes no body.'
  }),
  setCallRep: route2({
    method: "PUT",
    path: "/playbook/calls/{callId}/rep",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["call.not_found", "call.rep_invalid", "call.rep_not_changeable"],
    commonErrors: ["request.invalid"],
    description: 'Picks the Rep of a Call waiting in "awaiting_rep", or changes the Rep of a "ready" Call or a "failed" Call whose failureReason is rep_label_not_found or not_per_side, with {"rep":{"by":"speaker","label":...}} or {"rep":{"by":"channel","channel":...}}. Owner and Admin only, and any of them may pick, not only the uploader. A choice that does not suit the Call, or a label that is not among its speakers, is call.rep_invalid; a Call in any other state or with any other failure reason is call.rep_not_changeable. A different Rep answers 200 with the Call in state "processing": its Moments are rebuilt by a queued job and the Call is out of search until it finishes. Idempotent by end state: choosing the Rep the Call already has changes nothing and answers 200 with the Call as it is.'
  }),
  listDeals: route2({
    method: "GET",
    path: "/playbook/deals",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Deals, newest first (sorted by createdAt, then id, the opaque Deal id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only. outcome limits the list to one Outcome and appearedInImport=false lists the Deals that have Calls but never appeared in a CSV, so a mistyped deal id is visible."
  }),
  getDeal: route2({
    method: "GET",
    path: "/playbook/deals/{dealRecordId}",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["deal.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Deal by its opaque id (the deal_ id from a list or a lookup, never the customer deal id, which is found with the lookup route). Owner and Admin only. A Deal cannot be deleted on its own."
  }),
  lookupDeal: route2({
    method: "POST",
    path: "/playbook/deals/lookup",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["deal.not_found"],
    commonErrors: ["request.invalid"],
    description: 'Finds a Deal by the customer deal id, sent in the JSON body {"dealId":...} so it never appears in a URL, a query string or a cursor (trimmed, otherwise exact and case-sensitive). Answers 200 with the Deal, whose opaque id is then used in every path, or deal.not_found. Owner and Admin only. It changes nothing.'
  }),
  setDealOutcome: route2({
    method: "PUT",
    path: "/playbook/deals/{dealRecordId}/outcome",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["deal.not_found"],
    commonErrors: ["request.invalid"],
    description: "Sets or corrects a Deal's Outcome (won, lost or open), even a decided one. Owner and Admin only. Idempotent by end state. A change bumps the Deal's Outcome sequence and queues the re-tag of its Moments; search follows the database at once for a lost Deal and may lag for a Deal that has just become won."
  }),
  uploadDealImport: route2({
    method: "POST",
    path: "/playbook/deal-imports",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [202],
    errors: [
      "deal_import.unsupported_type",
      "deal_import.too_large",
      "deal_import.header_invalid",
      "deal_import.busy"
    ],
    commonErrors: [...ENVELOPE_ERRORS],
    description: 'Uploads the fixed CSV template (columns deal_id, outcome, closed_at, amount, currency and optionally name; up to 10 MB and 50,000 rows) as multipart/form-data with one file part named "file". Owner and Admin only. The type, size and first row are checked before anything is stored: deal_import.unsupported_type (415), deal_import.too_large (413) and deal_import.header_invalid (422). An Organization with MAX_QUEUED_DEAL_IMPORTS (5) imports not yet finished (state uploaded or processing) is refused with deal_import.busy (429) and nothing is stored; the count is checked before the file is stored, so a refused upload leaves no import. The header is read with checkDealImportHeaderText (the same reader and limits as parseCsv) on the first 8192 characters of the file (a header still unfinished there is deferred to the job, not refused), and the job re-checks the header of its full parse with the same verdict. The rest of the file is parsed in the background job, never on the request path, under strict RFC 4180 quoting: a stray quote fails the file, and a cell over 1000 characters fails the whole file too (a cell up to 1000 characters is checked row by row, and a bad one is a rejected row); an interior blank line is a rejected row with the reason blank_row, so the report has no gap, and it still counts in the row numbers, and rowNumber is the record number with the header as record 1. Answers 202 with the import in state "uploaded"; it is processed in the background. Imports are not deduplicated by content: each upload is a new import, and only the Idempotency-Key makes a retry of the same request answer with the stored import. Valid rows are applied and bad rows are reported, never dropped: a deal id already won or lost, or repeated within the file, is a rejected row in the report, not an HTTP error. A file with more rows than the limit, a cell over the length limit or a quoting error ends in state "failed" with failureReason "too_many_rows" or "unreadable". Accepts an Idempotency-Key header.'
  }),
  listDealImports: route2({
    method: "GET",
    path: "/playbook/deal-imports",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Deal imports, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only."
  }),
  getDealImport: route2({
    method: "GET",
    path: "/playbook/deal-imports/{importId}",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["deal_import.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one import: its state, failure reason and the counts of rows, applied rows and rejected rows. Owner and Admin only."
  }),
  listDealImportRows: route2({
    method: "GET",
    path: "/playbook/deal-imports/{importId}/rows",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["deal_import.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads the report of an import, in CSV order, one cursor-paginated page at a time (at most 100); result=rejected lists only the rows that need fixing. Each row has its row number (the header is row 1), the deal id when it was valid, the result and a reason code. No other cell is returned. Owner and Admin only."
  }),
  getRightsConfirmation: route2({
    method: "GET",
    path: "/playbook/rights-confirmation",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: [],
    description: "Reads the Organization's recorded confirmation that it may share Recordings and Transcripts, with who confirmed and when, the version of the wording they saw, the current wording version, optionally the text of that version (also in RIGHTS_WORDINGS) and whether the stored one is current. Owner and Admin only. Without a current confirmation, uploads of Calls are refused; existing Calls are kept and stay searchable."
  }),
  confirmRights: route2({
    method: "PUT",
    path: "/playbook/rights-confirmation",
    internal: false,
    roles: PLAYBOOK_WRITE_ROLES,
    success: [200],
    errors: ["rights.version_outdated"],
    commonErrors: ["request.invalid"],
    description: "Records the confirmation, with the wording version the member was shown, which must be the current one (else rights.version_outdated, 409). Owner and Admin only. Who confirmed and when come from the token and the clock, never from the body. Idempotent by end state: confirming the current version again changes nothing. A lawyer is to check the wording before real customers use it."
  })
});

// src/playbook/all.ts
var ALL_PLAYBOOK_ROUTES = Object.freeze({ ...PLAYBOOK_ROUTES, ...SALES_HISTORY_ROUTES });
var ALL_PLAYBOOK_ERRORS = Object.freeze({ ...PLAYBOOK_ERRORS, ...SALES_HISTORY_ERRORS });
// src/playbook/call.ts
import { z as z19 } from "zod";

// src/playbook/call-values.ts
import { z as z17 } from "zod";
var CALL_STATES = [
  "uploaded",
  "transcribing",
  "awaiting_rep",
  "processing",
  "ready",
  "failed",
  "deleted"
];
var callStateSchema = z17.enum(CALL_STATES);
var CALL_FAILURE_REASONS = [
  "no_turns",
  "too_few_speakers",
  "too_many_speakers",
  "rep_label_not_found",
  "not_per_side",
  "too_long",
  "transcription_failed",
  "transcription_timed_out",
  "unreadable",
  "processing_failed"
];
var callFailureReasonSchema = z17.enum(CALL_FAILURE_REASONS);
var CALL_KINDS = ["transcript", "recording"];
var callKindSchema = z17.enum(CALL_KINDS);
var ACCEPTED_TRANSCRIPT_EXTENSIONS = [".txt", ".vtt", ".srt", ".json"];
var ACCEPTED_RECORDING_EXTENSIONS = [
  ".mp3",
  ".m4a",
  ".wav",
  ".ogg",
  ".webm",
  ".flac"
];
var CALL_MEDIA_TYPES = [
  "text/plain",
  "text/vtt",
  "application/x-subrip",
  "application/json",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/flac"
];
var callMediaTypeSchema = z17.enum(CALL_MEDIA_TYPES);
var MEDIA_TYPE_BY_CALL_EXTENSION = Object.freeze({
  ".txt": "text/plain",
  ".vtt": "text/vtt",
  ".srt": "application/x-subrip",
  ".json": "application/json",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".webm": "audio/webm",
  ".flac": "audio/flac"
});
var MAX_TRANSCRIPT_BYTES = 5 * 1024 * 1024;
var MAX_RECORDING_BYTES = 500 * 1024 * 1024;
var MAX_RECORDING_SECONDS = 3 * 60 * 60;
var INCOMPLETE_UPLOAD_PARTS_TTL_HOURS = 24;
var MAX_REP_FOLLOWING_TURNS = 5;
var MAX_REP_FOLLOWING_CHARACTERS = 4000;
var DEFAULT_MAX_CALLS = 2000;
var DEFAULT_MAX_RECORDING_BYTES_TOTAL = 50 * 1024 * 1024 * 1024;
var DEFAULT_MAX_DEALS = 20000;
var MAX_CALL_SPEAKERS = 20;
var MAX_SPEAKER_LABEL_LENGTH = 64;
var MAX_SPEAKER_LABEL_BYTES = MAX_SPEAKER_LABEL_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT;
function normaliseSpeakerLabel(label) {
  return normaliseFileName(label);
}
var speakerLabelSchema = z17.string().max(1000).transform(normaliseSpeakerLabel).pipe(z17.string().min(1).max(MAX_SPEAKER_LABEL_LENGTH).refine(isWellFormedText, "Well-formed text only").refine((label) => !hasStrippableCharacter(label), "No control characters"));
var CALL_CHANNELS = ["left", "right"];
var callChannelSchema = z17.enum(CALL_CHANNELS);
var repChoiceSchema = z17.discriminatedUnion("by", [
  z17.strictObject({ by: z17.literal("speaker"), label: speakerLabelSchema }),
  z17.strictObject({ by: z17.literal("channel"), channel: callChannelSchema })
]);
function repChoiceSuits(kind, rep, when) {
  if (rep === null || rep === undefined) {
    return when === "upload" && kind === "recording";
  }
  if (kind === "transcript") {
    return rep.by === "speaker";
  }
  return when === "change" || rep.by === "channel";
}
var CALL_FAILURE_FIXES = Object.freeze({
  rep_label_not_found: "change_rep",
  not_per_side: "change_rep",
  transcription_failed: "reupload",
  transcription_timed_out: "reupload",
  processing_failed: "reupload",
  too_many_speakers: "delete_and_upload",
  no_turns: "delete_and_upload",
  too_few_speakers: "delete_and_upload",
  too_long: "delete_and_upload",
  unreadable: "delete_and_upload"
});
function callReuploadRequeues(failureReason) {
  return failureReason !== null && CALL_FAILURE_FIXES[failureReason] === "reupload";
}
function repChangeAllowed(state, failureReason) {
  if (state === "ready" || state === "awaiting_rep") {
    return true;
  }
  return state === "failed" && (failureReason === "rep_label_not_found" || failureReason === "not_per_side");
}

// src/playbook/deal-values.ts
import { z as z18 } from "zod";
var OUTCOMES = ["won", "lost", "open"];
var outcomeSchema = z18.enum(OUTCOMES);
var MAX_DEAL_ID_LENGTH = 128;
var MAX_RAW_DEAL_ID_LENGTH = 1000;
var MAX_DEAL_ID_BYTES = MAX_DEAL_ID_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT;
function isHangulFiller(codePoint) {
  return codePoint === 4447 || codePoint === 4448 || codePoint === 12644 || codePoint === 65440;
}
function hasInvisibleCharacter(text) {
  if (/\p{Cf}/u.test(text)) {
    return true;
  }
  for (const character of text) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint === 8232 || codePoint === 8233 || isHangulFiller(codePoint)) {
      return true;
    }
  }
  return false;
}
function normaliseDealId(dealId) {
  return dealId.trim();
}
var dealIdSchema = z18.string().max(MAX_RAW_DEAL_ID_LENGTH).transform(normaliseDealId).pipe(z18.string().min(1).max(MAX_DEAL_ID_LENGTH).refine(isWellFormedText, "Well-formed text only").refine((id) => !hasStrippableCharacter(id), "No control or direction characters").refine((id) => !hasInvisibleCharacter(id), "No invisible characters"));
var MAX_DEAL_NAME_LENGTH = 200;
var MAX_DEAL_NAME_BYTES = MAX_DEAL_NAME_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT;
var dealNameSchema = z18.string().max(1000).trim().pipe(z18.string().min(1).max(MAX_DEAL_NAME_LENGTH).refine(isWellFormedText, "Well-formed text only").refine((name) => !hasStrippableCharacter(name), "No control or direction characters"));
var dealAmountSchema = z18.string().regex(/^(0|[1-9]\d{0,14})(\.\d{1,2})?$/);
var dealCurrencySchema = z18.string().regex(/^[A-Z]{3}$/);
var MAX_DEAL_IMPORT_BYTES = 10 * 1024 * 1024;
var MAX_DEAL_IMPORT_ROWS = 50000;
var MAX_QUEUED_DEAL_IMPORTS = 5;
var DEAL_IMPORT_REQUIRED_COLUMNS = [
  "deal_id",
  "outcome",
  "closed_at",
  "amount",
  "currency"
];
var DEAL_IMPORT_OPTIONAL_COLUMN = "name";
var MAX_DEAL_IMPORT_HEADER_LENGTH = 1024;
var DEAL_IMPORT_HEADER_PREFIX_CHARS = 8192;
var DEAL_IMPORT_HEADER_PROBLEMS = [
  "empty",
  "too_long",
  "missing_column",
  "unexpected_column",
  "wrong_order",
  "malformed_csv"
];
function checkDealImportHeader(record) {
  const refuse = (problem) => ({ ok: false, code: "deal_import.header_invalid", problem });
  const cells = record.map((cell) => cell.trim());
  if (cells.length === 0 || cells.length === 1 && cells[0] === "") {
    return refuse("empty");
  }
  if (cells.join(",").length > MAX_DEAL_IMPORT_HEADER_LENGTH) {
    return refuse("too_long");
  }
  const known = [...DEAL_IMPORT_REQUIRED_COLUMNS, DEAL_IMPORT_OPTIONAL_COLUMN];
  if (cells.some((cell) => !known.includes(cell))) {
    return refuse("unexpected_column");
  }
  if (new Set(cells).size !== cells.length) {
    return refuse("unexpected_column");
  }
  if (DEAL_IMPORT_REQUIRED_COLUMNS.some((column) => !cells.includes(column))) {
    return refuse("missing_column");
  }
  const expected = [...DEAL_IMPORT_REQUIRED_COLUMNS, DEAL_IMPORT_OPTIONAL_COLUMN].slice(0, cells.length);
  if (cells.some((cell, index) => cell !== expected[index])) {
    return refuse("wrong_order");
  }
  return { ok: true, hasName: cells.length === DEAL_IMPORT_REQUIRED_COLUMNS.length + 1 };
}
function checkDealImportHeaderText(text) {
  const cut = text.length >= DEAL_IMPORT_HEADER_PREFIX_CHARS;
  const first = firstCsvRecord(text);
  if (!first.ok) {
    if (cut && first.failure === "unterminated_quote") {
      return { ok: true, deferred: true };
    }
    return {
      ok: false,
      code: "deal_import.header_invalid",
      problem: first.failure === "cell_too_long" ? "too_long" : "malformed_csv"
    };
  }
  if (cut && !first.complete) {
    return { ok: true, deferred: true };
  }
  return checkDealImportHeader(first.record ?? []);
}
var DEAL_IMPORT_STATES = ["uploaded", "processing", "completed", "failed"];
var dealImportStateSchema = z18.enum(DEAL_IMPORT_STATES);
var DEAL_IMPORT_FAILURE_REASONS = [
  "too_many_rows",
  "unreadable",
  "processing_failed"
];
var dealImportFailureReasonSchema = z18.enum(DEAL_IMPORT_FAILURE_REASONS);
var DEAL_IMPORT_ROW_RESULTS = ["applied", "rejected"];
var dealImportRowResultSchema = z18.enum(DEAL_IMPORT_ROW_RESULTS);
var DEAL_IMPORT_ROW_REASONS = [
  "wrong_column_count",
  "invalid_deal_id",
  "duplicate_in_file",
  "invalid_outcome",
  "invalid_closed_at",
  "invalid_amount",
  "invalid_currency",
  "invalid_name",
  "outcome_already_decided",
  "deal_limit_reached",
  "blank_row"
];
var dealImportRowReasonSchema = z18.enum(DEAL_IMPORT_ROW_REASONS);
var INVALID_CELL = { ok: false };
var DEAL_CLOSED_AT_MIN_YEAR = 1970;
var DEAL_CLOSED_AT_MAX_YEAR = 2100;
function parseOutcomeCell(cell) {
  const result = outcomeSchema.safeParse(cell.trim().toLowerCase());
  return result.success ? { ok: true, value: result.data } : INVALID_CELL;
}
function parseClosedAtCell(cell) {
  const text = cell.trim();
  if (text === "") {
    return { ok: true, value: null };
  }
  const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (date) {
    const [year, month, day] = [Number(date[1]), Number(date[2]), Number(date[3])];
    const parsed = new Date(Date.UTC(year, month - 1, day));
    const real = parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
    return real && year >= DEAL_CLOSED_AT_MIN_YEAR && year <= DEAL_CLOSED_AT_MAX_YEAR ? { ok: true, value: `${text}T00:00:00.000Z` } : INVALID_CELL;
  }
  if (!z18.iso.datetime({ offset: true }).max(64).safeParse(text).success) {
    return INVALID_CELL;
  }
  const time = new Date(text);
  const year = time.getUTCFullYear();
  return Number.isNaN(time.getTime()) || year < DEAL_CLOSED_AT_MIN_YEAR || year > DEAL_CLOSED_AT_MAX_YEAR ? INVALID_CELL : { ok: true, value: time.toISOString() };
}
function parseAmountCell(cell) {
  const text = cell.trim();
  if (text === "") {
    return { ok: true, value: null };
  }
  return dealAmountSchema.safeParse(text).success ? { ok: true, value: text } : INVALID_CELL;
}
function parseCurrencyCell(cell) {
  const text = cell.trim();
  if (text === "") {
    return { ok: true, value: null };
  }
  const result = dealCurrencySchema.safeParse(text.toUpperCase());
  return result.success && /^[A-Za-z]{3}$/.test(text) ? { ok: true, value: result.data } : INVALID_CELL;
}
function checkDealImportRow(cells, hasName) {
  const reject = (reason) => ({ ok: false, reason });
  if (cells.length !== DEAL_IMPORT_REQUIRED_COLUMNS.length + (hasName ? 1 : 0)) {
    return reject("wrong_column_count");
  }
  const [dealCell = "", outcomeCell = "", closedCell = "", amountCell = "", currencyCell = ""] = cells;
  const dealId = dealIdSchema.safeParse(dealCell);
  if (!dealId.success) {
    return reject("invalid_deal_id");
  }
  const outcome = parseOutcomeCell(outcomeCell);
  if (!outcome.ok) {
    return reject("invalid_outcome");
  }
  const closedAt = parseClosedAtCell(closedCell);
  if (!closedAt.ok) {
    return reject("invalid_closed_at");
  }
  const amount = parseAmountCell(amountCell);
  if (!amount.ok) {
    return reject("invalid_amount");
  }
  const currency = parseCurrencyCell(currencyCell);
  if (!currency.ok || amount.value !== null && currency.value === null) {
    return reject("invalid_currency");
  }
  let name = null;
  const nameCell = (cells[DEAL_IMPORT_REQUIRED_COLUMNS.length] ?? "").trim();
  if (hasName && nameCell !== "") {
    const parsed = dealNameSchema.safeParse(nameCell);
    if (!parsed.success) {
      return reject("invalid_name");
    }
    name = parsed.data;
  }
  return {
    ok: true,
    row: {
      dealId: dealId.data,
      outcome: outcome.value,
      closedAt: closedAt.value,
      amount: amount.value,
      currency: currency.value,
      name
    }
  };
}
var MAX_DEAL_IMPORT_CELL_LENGTH = 1000;
var CSV_FAILURES = [
  "too_many_records",
  "cell_too_long",
  "unterminated_quote",
  "bad_quote"
];
var NEWLINE = 10;
var RETURN = 13;
var COMMA = 44;
var QUOTE = 34;
function readCsv(text, options, firstOnly) {
  const maxRecords = options?.maxRecords ?? MAX_DEAL_IMPORT_ROWS + 1;
  const maxCell = options?.maxCellLength ?? MAX_DEAL_IMPORT_CELL_LENGTH;
  const length = text.length;
  const records = [];
  let index = text.charCodeAt(0) === 65279 ? 1 : 0;
  const fail = (failure) => ({ ok: false, failure, recordsRead: records.length });
  while (index < length) {
    if (records.length >= maxRecords) {
      return fail("too_many_records");
    }
    const record = [];
    let ended = false;
    while (!ended) {
      let cell;
      let count = 0;
      if (text.charCodeAt(index) === QUOTE) {
        index += 1;
        let segment = index;
        let joined = "";
        for (;; ) {
          if (index >= length) {
            return fail("unterminated_quote");
          }
          const code = text.charCodeAt(index);
          if (code === QUOTE) {
            if (text.charCodeAt(index + 1) === QUOTE) {
              joined += text.slice(segment, index + 1);
              count += 1;
              index += 2;
              segment = index;
              if (count > maxCell) {
                return fail("cell_too_long");
              }
              continue;
            }
            cell = joined === "" ? text.slice(segment, index) : joined + text.slice(segment, index);
            index += 1;
            break;
          }
          if (code < 56320 || code > 57343) {
            count += 1;
            if (count > maxCell) {
              return fail("cell_too_long");
            }
          }
          index += 1;
        }
        const next = text.charCodeAt(index);
        if (index < length && next !== COMMA && next !== NEWLINE && next !== RETURN) {
          return fail("bad_quote");
        }
      } else {
        const start = index;
        while (index < length) {
          const code = text.charCodeAt(index);
          if (code === COMMA || code === NEWLINE || code === RETURN) {
            break;
          }
          if (code === QUOTE) {
            return fail("bad_quote");
          }
          if (code < 56320 || code > 57343) {
            count += 1;
            if (count > maxCell) {
              return fail("cell_too_long");
            }
          }
          index += 1;
        }
        cell = text.slice(start, index);
      }
      record.push(cell);
      const code = index < length ? text.charCodeAt(index) : -1;
      if (code === COMMA) {
        index += 1;
        continue;
      }
      ended = true;
      if (code === RETURN && text.charCodeAt(index + 1) === NEWLINE) {
        index += 2;
      } else if (code !== -1) {
        index += 1;
      }
      records.push(record);
      if (firstOnly) {
        return { ok: true, records, complete: code !== -1 };
      }
    }
  }
  return { ok: true, records, complete: false };
}
function parseCsv(text, options) {
  const result = readCsv(text, options, false);
  return result.ok ? { ok: true, records: result.records } : result;
}
function firstCsvRecord(text, options) {
  const result = readCsv(text, options, true);
  return result.ok ? { ok: true, record: result.records[0], complete: result.complete === true } : { ok: false, failure: result.failure, recordsRead: result.recordsRead };
}
function isBlankCsvRecord(record) {
  return record.length === 1 && record[0] === "";
}

// src/playbook/call.ts
var callSchema = z19.object({
  id: callIdSchema,
  dealId: dealIdSchema,
  dealRecordId: dealRecordIdSchema,
  dealOutcome: outcomeSchema,
  inSearch: z19.boolean(),
  kind: callKindSchema,
  fileName: documentFileNameSchema,
  mediaType: callMediaTypeSchema,
  sizeBytes: z19.number().int().min(1).max(MAX_RECORDING_BYTES),
  durationSeconds: z19.number().int().min(1).max(MAX_RECORDING_SECONDS).nullable(),
  state: callStateSchema,
  failureReason: callFailureReasonSchema.nullable(),
  rep: repChoiceSchema.nullable(),
  speakerLabels: z19.array(speakerLabelSchema).max(MAX_CALL_SPEAKERS),
  deletedAt: timestampSchema.nullable(),
  purgeAt: timestampSchema.nullable(),
  uploadedByUserId: userIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).superRefine((call, context) => {
  const issue = (path, message) => context.addIssue({ code: "custom", path: [path], message });
  if (call.state === "failed" !== (call.failureReason !== null)) {
    issue("failureReason", "A failure reason is set exactly when the state is failed");
  }
  const deleted = call.state === "deleted";
  if (deleted !== (call.deletedAt !== null) || deleted !== (call.purgeAt !== null)) {
    issue("purgeAt", "A deletion time and a purge time are set exactly when the state is deleted");
  }
  if (call.state === "awaiting_rep" && call.rep !== null) {
    issue("rep", "A Call awaiting its Rep has none");
  }
  if (call.state === "ready" && call.rep === null) {
    issue("rep", "A ready Call has a Rep");
  }
  if (call.kind === "transcript" && (call.state === "transcribing" || call.state === "awaiting_rep")) {
    issue("state", "A Transcript is not transcribed and has its Rep at upload");
  }
  if (call.kind === "transcript" && call.durationSeconds !== null) {
    issue("durationSeconds", "A Transcript has no duration");
  }
  if (call.kind === "transcript" && call.sizeBytes > MAX_TRANSCRIPT_BYTES) {
    issue("sizeBytes", "A Transcript is within the Transcript size limit");
  }
  if (call.kind === "recording" ? !call.mediaType.startsWith("audio/") : call.mediaType.startsWith("audio/")) {
    issue("mediaType", "The kind agrees with the media type");
  }
  if (call.failureReason === "too_many_speakers" && call.speakerLabels.length > 0) {
    issue("speakerLabels", "A Call with too many speakers lists none");
  }
  if (new Set(call.speakerLabels).size !== call.speakerLabels.length) {
    issue("speakerLabels", "Speaker labels are unique");
  }
  if (call.inSearch && (call.state !== "ready" || call.dealOutcome !== "won")) {
    issue("inSearch", "A Call is in search only when it is ready and its Deal is won");
  }
  if (call.state === "ready" && call.rep?.by === "speaker" && !call.speakerLabels.includes(call.rep.label)) {
    issue("rep", "A ready Call's Rep label is among its speakers");
  }
});
var MAX_REP_FIELD_LENGTH = 512;
var uploadCallFieldsSchema = z19.strictObject({
  dealId: dealIdSchema,
  rep: z19.string().max(MAX_REP_FIELD_LENGTH).optional()
});
function parseRepField(text) {
  if (text === undefined) {
    return { ok: true, rep: null };
  }
  const invalid = { ok: false, code: "call.rep_invalid" };
  if (text.length === 0 || text.length > MAX_REP_FIELD_LENGTH) {
    return invalid;
  }
  try {
    const result = repChoiceSchema.safeParse(JSON.parse(text));
    return result.success ? { ok: true, rep: result.data } : invalid;
  } catch {
    return invalid;
  }
}
var callParamsSchema = z19.strictObject({ callId: callIdSchema });
var listCallsQuerySchema = pageQuerySchema.extend({ state: callStateSchema.optional(), dealRecordId: dealRecordIdSchema.optional() }).strict();
var listCallsResponseSchema = pageSchema(callSchema);
var setCallRepRequestSchema = z19.strictObject({ rep: repChoiceSchema });
var CALL_FILE_KEYS = ["fileName", "declaredMediaType", "sizeBytes"];
var uploadCallFileSchema = z19.strictObject({
  fileName: documentFileNameSchema,
  declaredMediaType: z19.string().max(255).nullable(),
  sizeBytes: z19.number().int().min(1)
});
function callKindOf(fileName) {
  const lower = fileName.toLowerCase();
  if (ACCEPTED_TRANSCRIPT_EXTENSIONS.some((extension) => lower.endsWith(extension))) {
    return "transcript";
  }
  if (ACCEPTED_RECORDING_EXTENSIONS.some((extension) => lower.endsWith(extension))) {
    return "recording";
  }
  return;
}
function checkCallFile(input) {
  const invalid = { ok: false, code: "request.invalid" };
  if (typeof input !== "object" || input === null) {
    return invalid;
  }
  if (Object.keys(input).some((key) => !CALL_FILE_KEYS.includes(key))) {
    return invalid;
  }
  const copy = Object.create(null);
  for (const key of CALL_FILE_KEYS) {
    if (Object.hasOwn(input, key)) {
      copy[key] = input[key];
    }
  }
  const { fileName, sizeBytes } = copy;
  if (typeof fileName !== "string" || typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes)) {
    return invalid;
  }
  if (sizeBytes > MAX_RECORDING_BYTES) {
    return { ok: false, code: "call.too_large" };
  }
  const kind = callKindOf(normaliseFileName(fileName));
  if (kind === undefined) {
    return { ok: false, code: "call.unsupported_type" };
  }
  if (kind === "transcript" && sizeBytes > MAX_TRANSCRIPT_BYTES) {
    return { ok: false, code: "call.too_large" };
  }
  const parsed = uploadCallFileSchema.safeParse(copy);
  return parsed.success ? { ok: true, kind, file: parsed.data } : invalid;
}
var callCursorSchema = z19.strictObject({ createdAt: timestampSchema, id: callIdSchema });
// src/playbook/deal.ts
import { z as z20 } from "zod";
var dealSchema = z20.object({
  id: dealRecordIdSchema,
  dealId: dealIdSchema,
  name: dealNameSchema.nullable(),
  outcome: outcomeSchema,
  closedAt: timestampSchema.nullable(),
  amount: dealAmountSchema.nullable(),
  currency: dealCurrencySchema.nullable(),
  callCount: z20.number().int().min(0),
  appearedInImport: z20.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).refine((deal) => deal.amount === null || deal.currency !== null, {
  message: "An amount comes with a currency",
  path: ["currency"]
});
var dealParamsSchema = z20.strictObject({ dealRecordId: dealRecordIdSchema });
var listDealsQuerySchema = pageQuerySchema.extend({
  outcome: outcomeSchema.optional(),
  appearedInImport: z20.enum(["true", "false"]).transform((value) => value === "true").optional()
}).strict();
var listDealsResponseSchema = pageSchema(dealSchema);
var setDealOutcomeRequestSchema = z20.strictObject({
  outcome: outcomeSchema,
  closedAt: timestampSchema.nullable().optional()
});
var lookupDealRequestSchema = z20.strictObject({ dealId: dealIdSchema });
var dealCursorSchema = z20.strictObject({
  createdAt: timestampSchema,
  id: dealRecordIdSchema
});
var dealImportCursorSchema = z20.strictObject({
  createdAt: timestampSchema,
  id: dealImportIdSchema
});
var dealImportRowCursorSchema = z20.strictObject({ rowNumber: z20.number().int().min(2) });
var DEAL_IMPORT_FILE_FIELD = "file";
var dealImportSchema = z20.object({
  id: dealImportIdSchema,
  state: dealImportStateSchema,
  failureReason: dealImportFailureReasonSchema.nullable(),
  rowCount: z20.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
  appliedCount: z20.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
  rejectedCount: z20.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
  uploadedByUserId: userIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).superRefine((item, context) => {
  if (item.state === "failed" !== (item.failureReason !== null)) {
    context.addIssue({
      code: "custom",
      path: ["failureReason"],
      message: "A failure reason is set exactly when the state is failed"
    });
  }
  const counted = item.rowCount !== null && item.appliedCount !== null && item.rejectedCount !== null;
  const none = item.rowCount === null && item.appliedCount === null && item.rejectedCount === null;
  if (item.state === "completed" ? !counted : !none) {
    context.addIssue({
      code: "custom",
      path: ["rowCount"],
      message: "The counts are set exactly when the import is completed"
    });
  }
  if (counted && item.appliedCount !== null && item.rejectedCount !== null && item.rowCount !== item.appliedCount + item.rejectedCount) {
    context.addIssue({
      code: "custom",
      path: ["rowCount"],
      message: "The row count is the applied and rejected rows together"
    });
  }
});
var dealImportParamsSchema = z20.strictObject({ importId: dealImportIdSchema });
var listDealImportsQuerySchema = pageQuerySchema.strict();
var listDealImportsResponseSchema = pageSchema(dealImportSchema);
var dealImportRowSchema = z20.object({
  rowNumber: z20.number().int().min(2).max(MAX_DEAL_IMPORT_ROWS + 1),
  dealId: dealIdSchema.nullable(),
  result: dealImportRowResultSchema,
  reason: dealImportRowReasonSchema.nullable()
}).superRefine((row, context) => {
  if (row.reason === "blank_row" && row.dealId !== null) {
    context.addIssue({
      code: "custom",
      path: ["dealId"],
      message: "A blank row has no deal id"
    });
  }
  if (row.result === "rejected" !== (row.reason !== null)) {
    context.addIssue({
      code: "custom",
      path: ["reason"],
      message: "A reason is set exactly when the row is rejected"
    });
  }
  if (row.dealId === null && row.reason !== "invalid_deal_id" && row.reason !== "wrong_column_count" && row.reason !== "blank_row") {
    context.addIssue({
      code: "custom",
      path: ["dealId"],
      message: "Only a row with no usable deal id has none"
    });
  }
});
var listDealImportRowsQuerySchema = pageQuerySchema.extend({ result: dealImportRowResultSchema.optional() }).strict();
var listDealImportRowsResponseSchema = pageSchema(dealImportRowSchema);
// src/playbook/document.ts
import { z as z21 } from "zod";
var documentSchema = z21.object({
  id: documentIdSchema,
  fileName: documentFileNameSchema,
  mediaType: documentMediaTypeSchema,
  sizeBytes: z21.number().int().min(1).max(MAX_DOCUMENT_BYTES),
  pageCount: z21.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
  state: documentStateSchema,
  failureReason: documentFailureReasonSchema.nullable(),
  deletedAt: timestampSchema.nullable(),
  purgeAt: timestampSchema.nullable(),
  uploadedByUserId: userIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).superRefine((document, context) => {
  if (document.state === "failed" !== (document.failureReason !== null)) {
    context.addIssue({
      code: "custom",
      path: ["failureReason"],
      message: "A failure reason is set exactly when the state is failed"
    });
  }
  const deleted = document.state === "deleted";
  if (deleted !== (document.deletedAt !== null) || deleted !== (document.purgeAt !== null)) {
    context.addIssue({
      code: "custom",
      path: ["purgeAt"],
      message: "A deletion time and a purge time are set exactly when the state is deleted"
    });
  }
});
var UPLOAD_FILE_FIELD = "file";
var UPLOAD_CONTENT_TYPE = "multipart/form-data";
var uploadDocumentFileSchema = z21.strictObject({
  fileName: documentFileNameSchema,
  declaredMediaType: z21.string().max(255).nullable(),
  sizeBytes: z21.number().int().min(1)
});
var documentParamsSchema = z21.strictObject({
  documentId: documentIdSchema
});
var listDocumentsQuerySchema = pageQuerySchema.extend({ state: documentStateSchema.optional() }).strict();
var listDocumentsResponseSchema = pageSchema(documentSchema);
var internalRemoveOrganizationDocumentsParamsSchema = z21.strictObject({
  organizationId: organizationIdSchema
});
var internalRemoveOrganizationDocumentsRequestSchema = z21.strictObject({});
var internalRemoveOrganizationDocumentsResponseSchema = z21.object({
  organizationId: organizationIdSchema,
  status: z21.literal("removed")
});
var UPLOAD_FILE_KEYS = ["fileName", "declaredMediaType", "sizeBytes"];
function checkUploadFile(input) {
  const invalid = { ok: false, code: "request.invalid" };
  if (typeof input !== "object" || input === null) {
    return invalid;
  }
  const keys = Object.keys(input);
  if (keys.some((key) => !UPLOAD_FILE_KEYS.includes(key))) {
    return invalid;
  }
  const copy = Object.create(null);
  for (const key of UPLOAD_FILE_KEYS) {
    if (Object.hasOwn(input, key)) {
      copy[key] = input[key];
    }
  }
  const { fileName, sizeBytes } = copy;
  if (typeof fileName !== "string" || typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes)) {
    return invalid;
  }
  if (!documentSizeCheckSchema.safeParse(sizeBytes).success) {
    return { ok: false, code: "document.too_large" };
  }
  if (!documentTypeCheckSchema.safeParse(fileName).success) {
    return { ok: false, code: "document.unsupported_type" };
  }
  const parsed = uploadDocumentFileSchema.safeParse(copy);
  return parsed.success ? { ok: true, file: parsed.data } : invalid;
}
// src/playbook/messages.ts
import { z as z22 } from "zod";
var documentUploadedPayloadSchema = z22.strictObject({
  documentId: documentIdSchema
});
var DOCUMENT_UPLOADED_MESSAGE = {
  type: "playbook.document_uploaded",
  version: 1,
  scope: "organization",
  payload: documentUploadedPayloadSchema
};
var MAX_DELETION_SEQ = 2147483647;
var documentDeletedPayloadSchema = z22.strictObject({
  documentId: documentIdSchema,
  deletionSeq: z22.number().int().min(1).max(MAX_DELETION_SEQ)
});
var DOCUMENT_DELETED_MESSAGE = {
  type: "playbook.document_deleted",
  version: 1,
  scope: "organization",
  payload: documentDeletedPayloadSchema
};
// src/playbook/sales-history-messages.ts
import { z as z23 } from "zod";
var MAX_SEQ = MAX_DELETION_SEQ;
var seqSchema = z23.number().int().min(1).max(MAX_SEQ);
var callUploadedPayloadSchema = z23.strictObject({ callId: callIdSchema });
var CALL_UPLOADED_MESSAGE = {
  type: "playbook.call_uploaded",
  version: 1,
  scope: "organization",
  payload: callUploadedPayloadSchema
};
var callTranscribedPayloadSchema = z23.strictObject({ callId: callIdSchema });
var CALL_TRANSCRIBED_MESSAGE = {
  type: "playbook.call_transcribed",
  version: 1,
  scope: "organization",
  payload: callTranscribedPayloadSchema
};
var callRepChangedPayloadSchema = z23.strictObject({
  callId: callIdSchema,
  repSeq: seqSchema
});
var CALL_REP_CHANGED_MESSAGE = {
  type: "playbook.call_rep_changed",
  version: 1,
  scope: "organization",
  payload: callRepChangedPayloadSchema
};
var callDeletedPayloadSchema = z23.strictObject({
  callId: callIdSchema,
  deletionSeq: seqSchema
});
var CALL_DELETED_MESSAGE = {
  type: "playbook.call_deleted",
  version: 1,
  scope: "organization",
  payload: callDeletedPayloadSchema
};
var dealOutcomeChangedPayloadSchema = z23.strictObject({
  dealRecordId: dealRecordIdSchema,
  outcomeSeq: seqSchema
});
var DEAL_OUTCOME_CHANGED_MESSAGE = {
  type: "playbook.deal_outcome_changed",
  version: 1,
  scope: "organization",
  payload: dealOutcomeChangedPayloadSchema
};
var dealImportUploadedPayloadSchema = z23.strictObject({ importId: dealImportIdSchema });
var DEAL_IMPORT_UPLOADED_MESSAGE = {
  type: "playbook.deal_import_uploaded",
  version: 1,
  scope: "organization",
  payload: dealImportUploadedPayloadSchema
};
// src/index.ts
var PACKAGE = "tula-closeline-contract";
export {
  ABANDON_MAX_AGE_HOURS,
  ACCEPTED_DOCUMENT_EXTENSIONS,
  ACCEPTED_DOCUMENT_MEDIA_TYPES,
  ACCEPTED_RECORDING_EXTENSIONS,
  ACCEPTED_TRANSCRIPT_EXTENSIONS,
  ALL_PLAYBOOK_ERRORS,
  ALL_PLAYBOOK_ROUTES,
  AUTH_ERRORS,
  CALL_CHANNELS,
  CALL_DELETED_MESSAGE,
  CALL_FAILURE_FIXES,
  CALL_FAILURE_REASONS,
  CALL_KINDS,
  CALL_MEDIA_TYPES,
  CALL_REP_CHANGED_MESSAGE,
  CALL_STATES,
  CALL_TRANSCRIBED_MESSAGE,
  CALL_UPLOADED_MESSAGE,
  CORE_ERRORS,
  CSV_FAILURES,
  CURRENT_RIGHTS_WORDING_VERSION,
  DEAL_CLOSED_AT_MAX_YEAR,
  DEAL_CLOSED_AT_MIN_YEAR,
  DEAL_IMPORT_FAILURE_REASONS,
  DEAL_IMPORT_FILE_FIELD,
  DEAL_IMPORT_HEADER_PREFIX_CHARS,
  DEAL_IMPORT_HEADER_PROBLEMS,
  DEAL_IMPORT_OPTIONAL_COLUMN,
  DEAL_IMPORT_REQUIRED_COLUMNS,
  DEAL_IMPORT_ROW_REASONS,
  DEAL_IMPORT_ROW_RESULTS,
  DEAL_IMPORT_STATES,
  DEAL_IMPORT_UPLOADED_MESSAGE,
  DEAL_OUTCOME_CHANGED_MESSAGE,
  DEFAULT_MAX_CALLS,
  DEFAULT_MAX_DEALS,
  DEFAULT_MAX_DOCUMENTS,
  DEFAULT_MAX_DOCUMENT_BYTES_TOTAL,
  DEFAULT_MAX_RECORDING_BYTES_TOTAL,
  DEFAULT_PAGE_SIZE,
  DOCUMENT_DELETED_MESSAGE,
  DOCUMENT_FAILURE_REASONS,
  DOCUMENT_RETENTION_DAYS,
  DOCUMENT_STATES,
  DOCUMENT_UPLOADED_MESSAGE,
  ERRORS,
  IDEMPOTENCY_KEY_HEADER,
  INCOMPLETE_UPLOAD_PARTS_TTL_HOURS,
  INTERNAL_CALL_ERRORS,
  INVITABLE_ROLES,
  INVITATION_STATES,
  MAX_CALL_SPEAKERS,
  MAX_CURSOR_LENGTH,
  MAX_DEAL_ID_BYTES,
  MAX_DEAL_ID_LENGTH,
  MAX_DEAL_IMPORT_BYTES,
  MAX_DEAL_IMPORT_CELL_LENGTH,
  MAX_DEAL_IMPORT_HEADER_LENGTH,
  MAX_DEAL_IMPORT_ROWS,
  MAX_DEAL_NAME_BYTES,
  MAX_DEAL_NAME_LENGTH,
  MAX_DELETION_SEQ,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_FILE_NAME_BYTES,
  MAX_DOCUMENT_FILE_NAME_LENGTH,
  MAX_DOCUMENT_PAGES,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PAGE_SIZE,
  MAX_PERSON_NAME_LENGTH,
  MAX_QUEUED_DEAL_IMPORTS,
  MAX_RECORDING_BYTES,
  MAX_RECORDING_SECONDS,
  MAX_REP_FIELD_LENGTH,
  MAX_REP_FOLLOWING_CHARACTERS,
  MAX_REP_FOLLOWING_TURNS,
  MAX_RIGHTS_HEADING_LENGTH,
  MAX_RIGHTS_PARAGRAPHS,
  MAX_RIGHTS_TEXT_LENGTH,
  MAX_RIGHTS_WORDING_VERSION,
  MAX_SEQ,
  MAX_SPEAKER_LABEL_BYTES,
  MAX_SPEAKER_LABEL_LENGTH,
  MAX_TRANSCRIPT_BYTES,
  MAX_UTF8_BYTES_PER_CODE_POINT,
  MEDIA_TYPE_BY_CALL_EXTENSION,
  MEDIA_TYPE_BY_EXTENSION,
  ORGANIZATION_STATUSES,
  OUTCOMES,
  PACKAGE,
  PLAYBOOK_ERRORS,
  PLAYBOOK_READ_ROLES,
  PLAYBOOK_ROUTES,
  PLAYBOOK_WRITE_ROLES,
  REGIONS,
  RIGHTS_WORDINGS,
  ROLES,
  SALES_HISTORY_ERRORS,
  SALES_HISTORY_READ_ROLES,
  SALES_HISTORY_ROUTES,
  SIGNUP_ERRORS,
  UPLOAD_CONTENT_TYPE,
  UPLOAD_FILE_FIELD,
  addTeamMemberRequestSchema,
  callChannelSchema,
  callCursorSchema,
  callDeletedPayloadSchema,
  callFailureReasonSchema,
  callIdSchema,
  callKindSchema,
  callMediaTypeSchema,
  callParamsSchema,
  callRepChangedPayloadSchema,
  callReuploadRequeues,
  callSchema,
  callStateSchema,
  callTranscribedPayloadSchema,
  callUploadedPayloadSchema,
  changeMemberRoleRequestSchema,
  checkCallFile,
  checkDealImportHeader,
  checkDealImportHeaderText,
  checkDealImportRow,
  checkUploadFile,
  confirmRightsRequestSchema,
  createInvitationRequestSchema,
  createTeamRequestSchema,
  dealAmountSchema,
  dealCurrencySchema,
  dealCursorSchema,
  dealIdSchema,
  dealImportCursorSchema,
  dealImportFailureReasonSchema,
  dealImportIdSchema,
  dealImportParamsSchema,
  dealImportRowCursorSchema,
  dealImportRowReasonSchema,
  dealImportRowResultSchema,
  dealImportRowSchema,
  dealImportSchema,
  dealImportStateSchema,
  dealImportUploadedPayloadSchema,
  dealNameSchema,
  dealOutcomeChangedPayloadSchema,
  dealParamsSchema,
  dealRecordIdSchema,
  dealSchema,
  decodeCursor,
  defineErrors,
  defineEvent,
  documentDeletedPayloadSchema,
  documentExtension,
  documentFailureReasonSchema,
  documentFileNameSchema,
  documentIdSchema,
  documentMediaTypeSchema,
  documentParamsSchema,
  documentSchema,
  documentSizeCheckSchema,
  documentStateSchema,
  documentTypeCheckSchema,
  documentUploadedPayloadSchema,
  emailSchema,
  encodeCursor,
  errorBodySchema,
  errorCodeSchema,
  eventEnvelopeSchema,
  eventIdSchema,
  eventTypeSchema,
  firstCsvRecord,
  foldAscii,
  formatId,
  hasStrippableCharacter,
  idSchema,
  idempotencyKeySchema,
  internalAbandonOrganizationParamsSchema,
  internalAbandonOrganizationRequestSchema,
  internalAbandonOrganizationResponseSchema,
  internalAcceptInvitationRequestSchema,
  internalAcceptInvitationResponseSchema,
  internalCreateOrganizationRequestSchema,
  internalCreateOrganizationResponseSchema,
  internalMembershipRequestSchema,
  internalMembershipResponseSchema,
  internalRemoveOrganizationDocumentsParamsSchema,
  internalRemoveOrganizationDocumentsRequestSchema,
  internalRemoveOrganizationDocumentsResponseSchema,
  internalUpdateMemberProfileParamsSchema,
  internalUpdateMemberProfileRequestSchema,
  internalUpdateMemberProfileResponseSchema,
  invitableRoleSchema,
  invitationIdSchema,
  invitationParamsSchema,
  invitationSchema,
  invitationStateSchema,
  invitationTokenSchema,
  isBlankCsvRecord,
  isWellFormedText,
  listCallsQuerySchema,
  listCallsResponseSchema,
  listDealImportRowsQuerySchema,
  listDealImportRowsResponseSchema,
  listDealImportsQuerySchema,
  listDealImportsResponseSchema,
  listDealsQuerySchema,
  listDealsResponseSchema,
  listDocumentsQuerySchema,
  listDocumentsResponseSchema,
  listInvitationsQuerySchema,
  listInvitationsResponseSchema,
  listMembersQuerySchema,
  listMembersResponseSchema,
  listTeamsQuerySchema,
  listTeamsResponseSchema,
  lookupDealRequestSchema,
  memberParamsSchema,
  memberSchema,
  membershipIdSchema,
  normaliseDealId,
  normaliseFileName,
  normaliseMediaType,
  normaliseSpeakerLabel,
  organizationIdSchema,
  organizationNameSchema,
  organizationSchema,
  organizationStatusSchema,
  outcomeSchema,
  pageQuerySchema,
  pageSchema,
  parseAmountCell,
  parseClosedAtCell,
  parseCsv,
  parseCurrencyCell,
  parseOutcomeCell,
  parseRepField,
  personNameSchema,
  prospectIdSchema,
  regionSchema,
  renameOrganizationRequestSchema,
  renameTeamRequestSchema,
  repChangeAllowed,
  repChoiceSchema,
  repChoiceSuits,
  requestIdSchema,
  rightsConfirmationSchema,
  rightsRequiredDetailsSchema,
  rightsStatusSchema,
  rightsWordingFor,
  rightsWordingSchema,
  rightsWordingVersionSchema,
  roleAtLeast,
  roleSchema,
  setCallRepRequestSchema,
  setDealOutcomeRequestSchema,
  speakerLabelSchema,
  storedNameSchema,
  teamIdSchema,
  teamMemberParamsSchema,
  teamMemberSchema,
  teamNameSchema,
  teamParamsSchema,
  teamSchema,
  timestampSchema,
  uploadCallFieldsSchema,
  uploadCallFileSchema,
  uploadDocumentFileSchema,
  userIdSchema
};
