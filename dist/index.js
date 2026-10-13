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
// src/playbook/document.ts
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
var MAX_DOCUMENT_FILE_NAME_LENGTH = 255;
var MAX_RAW_FILE_NAME_LENGTH = 1000;
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

// src/playbook/document.ts
var documentSchema = z14.object({
  id: documentIdSchema,
  fileName: documentFileNameSchema,
  mediaType: documentMediaTypeSchema,
  sizeBytes: z14.number().int().min(1).max(MAX_DOCUMENT_BYTES),
  pageCount: z14.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
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
var uploadDocumentFileSchema = z14.strictObject({
  fileName: documentFileNameSchema,
  declaredMediaType: z14.string().max(255).nullable(),
  sizeBytes: z14.number().int().min(1)
});
var documentParamsSchema = z14.strictObject({
  documentId: documentIdSchema
});
var listDocumentsQuerySchema = pageQuerySchema.extend({ state: documentStateSchema.optional() }).strict();
var listDocumentsResponseSchema = pageSchema(documentSchema);
var internalRemoveOrganizationDocumentsParamsSchema = z14.strictObject({
  organizationId: organizationIdSchema
});
var internalRemoveOrganizationDocumentsRequestSchema = z14.strictObject({});
var internalRemoveOrganizationDocumentsResponseSchema = z14.object({
  organizationId: organizationIdSchema,
  status: z14.literal("removed")
});
function checkUploadFile(input) {
  const invalid = { ok: false, code: "request.invalid" };
  if (typeof input !== "object" || input === null) {
    return invalid;
  }
  const { fileName, sizeBytes } = input;
  if (typeof fileName !== "string" || typeof sizeBytes !== "number") {
    return invalid;
  }
  if (!documentSizeCheckSchema.safeParse(sizeBytes).success) {
    return { ok: false, code: "document.too_large" };
  }
  if (!documentTypeCheckSchema.safeParse(fileName).success) {
    return { ok: false, code: "document.unsupported_type" };
  }
  const parsed = uploadDocumentFileSchema.safeParse(input);
  return parsed.success ? { ok: true, file: parsed.data } : invalid;
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
// src/playbook/messages.ts
import { z as z15 } from "zod";
var documentUploadedPayloadSchema = z15.strictObject({
  documentId: documentIdSchema
});
var DOCUMENT_UPLOADED_MESSAGE = {
  type: "playbook.document_uploaded",
  version: 1,
  scope: "organization",
  payload: documentUploadedPayloadSchema
};
var MAX_DELETION_SEQ = 2147483647;
var documentDeletedPayloadSchema = z15.strictObject({
  documentId: documentIdSchema,
  deletionSeq: z15.number().int().min(1).max(MAX_DELETION_SEQ)
});
var DOCUMENT_DELETED_MESSAGE = {
  type: "playbook.document_deleted",
  version: 1,
  scope: "organization",
  payload: documentDeletedPayloadSchema
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
      "request.idempotency_in_progress"
    ],
    description: "Internal, for offboarding and erasure; no caller yet. Removes every document, file, chunk and vector an Organization has, soft-deleted ones included, without waiting for retention. Idempotent by end state: it answers 200 whenever nothing remains. Served on the internal network only; takes the Organization from the path."
  })
});
// src/index.ts
var PACKAGE = "tula-closeline-contract";
export {
  ABANDON_MAX_AGE_HOURS,
  ACCEPTED_DOCUMENT_EXTENSIONS,
  ACCEPTED_DOCUMENT_MEDIA_TYPES,
  AUTH_ERRORS,
  CORE_ERRORS,
  DEFAULT_MAX_DOCUMENTS,
  DEFAULT_MAX_DOCUMENT_BYTES_TOTAL,
  DEFAULT_PAGE_SIZE,
  DOCUMENT_DELETED_MESSAGE,
  DOCUMENT_FAILURE_REASONS,
  DOCUMENT_RETENTION_DAYS,
  DOCUMENT_STATES,
  DOCUMENT_UPLOADED_MESSAGE,
  ERRORS,
  IDEMPOTENCY_KEY_HEADER,
  INTERNAL_CALL_ERRORS,
  INVITABLE_ROLES,
  INVITATION_STATES,
  MAX_CURSOR_LENGTH,
  MAX_DELETION_SEQ,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_FILE_NAME_LENGTH,
  MAX_DOCUMENT_PAGES,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PAGE_SIZE,
  MAX_PERSON_NAME_LENGTH,
  MEDIA_TYPE_BY_EXTENSION,
  ORGANIZATION_STATUSES,
  PACKAGE,
  PLAYBOOK_ERRORS,
  PLAYBOOK_READ_ROLES,
  PLAYBOOK_ROUTES,
  PLAYBOOK_WRITE_ROLES,
  REGIONS,
  ROLES,
  SIGNUP_ERRORS,
  UPLOAD_CONTENT_TYPE,
  UPLOAD_FILE_FIELD,
  addTeamMemberRequestSchema,
  changeMemberRoleRequestSchema,
  checkUploadFile,
  createInvitationRequestSchema,
  createTeamRequestSchema,
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
  foldAscii,
  formatId,
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
  listDocumentsQuerySchema,
  listDocumentsResponseSchema,
  listInvitationsQuerySchema,
  listInvitationsResponseSchema,
  listMembersQuerySchema,
  listMembersResponseSchema,
  listTeamsQuerySchema,
  listTeamsResponseSchema,
  memberParamsSchema,
  memberSchema,
  membershipIdSchema,
  normaliseFileName,
  normaliseMediaType,
  organizationIdSchema,
  organizationNameSchema,
  organizationSchema,
  organizationStatusSchema,
  pageQuerySchema,
  pageSchema,
  personNameSchema,
  prospectIdSchema,
  regionSchema,
  renameOrganizationRequestSchema,
  renameTeamRequestSchema,
  requestIdSchema,
  roleAtLeast,
  roleSchema,
  storedNameSchema,
  teamIdSchema,
  teamMemberParamsSchema,
  teamMemberSchema,
  teamNameSchema,
  teamParamsSchema,
  teamSchema,
  timestampSchema,
  uploadDocumentFileSchema,
  userIdSchema
};
