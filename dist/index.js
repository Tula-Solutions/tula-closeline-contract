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

// src/agent/errors.ts
var AGENT_ERRORS = {
  ...defineErrors("agent", {
    paused: { status: 409, message: "The Inbound Agent is paused." },
    consent_required: {
      status: 409,
      message: "There is no Contact Consent for this channel, so the Inbound Agent will not act."
    },
    outside_hours: {
      status: 409,
      message: "It is outside the hours the Inbound Agent may call."
    },
    question_invalid: { status: 422, message: "The Qualification question is not valid." },
    question_not_found: { status: 404, message: "The Qualification question was not found." },
    settings_invalid: { status: 422, message: "The Inbound Agent settings are not valid." },
    not_enough_deals: {
      status: 409,
      message: "There are not enough won Deals to suggest Qualification questions."
    },
    session_not_found: { status: 404, message: "The try-it session was not found." }
  }),
  ...defineErrors("handoff", {
    no_rep_available: { status: 409, message: "No Rep is available to take the Handoff." },
    not_found: { status: 404, message: "The Handoff was not found." },
    not_pending: { status: 409, message: "The Handoff is no longer waiting for an answer." }
  })
};
// src/agent/events.ts
import { z as z20 } from "zod";

// src/consent/values.ts
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

// src/prospect/values.ts
import { z as z5 } from "zod";

// src/core/values.ts
import { z as z3 } from "zod";
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
  return z3.string().max(MAX_RAW_NAME_LENGTH).trim().pipe(z3.string().min(1).max(maxLength).refine(isWellFormed, "Well-formed text only").refine((text) => !hasControlCharacter(text), "No control characters"));
}
var nameSchema = boundedName(MAX_NAME_LENGTH);
var organizationNameSchema = nameSchema;
var teamNameSchema = nameSchema;
var MAX_PERSON_NAME_LENGTH = 201;
var personNameSchema = boundedName(MAX_PERSON_NAME_LENGTH);
var storedNameSchema = z3.string().min(1).max(1000);
var INVITATION_STATES = ["pending", "accepted", "revoked"];
var invitationStateSchema = z3.enum(INVITATION_STATES);
var timestampSchema = z3.iso.datetime({ offset: true }).max(64);
var invitationTokenSchema = z3.string().min(22).max(256).regex(/^[A-Za-z0-9_-]+$/);
var retryAfterDetailsSchema = z3.strictObject({
  retryAfter: z3.number().int().positive()
});
var IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
var idempotencyKeySchema = z3.string().min(16).max(128).regex(/^[A-Za-z0-9_.:-]+$/);

// src/ids.ts
import { z as z4 } from "zod";
var PREFIX_PATTERN = /^[a-z]{2,5}$/;
function idSchema(prefix) {
  if (!PREFIX_PATTERN.test(prefix)) {
    throw new Error(`Invalid id prefix: ${prefix}`);
  }
  return z4.string().regex(new RegExp(`^${prefix}_[0-9a-f]{32}$`)).brand();
}
var organizationIdSchema = idSchema("org");
var userIdSchema = idSchema("usr");
var membershipIdSchema = idSchema("mem");
var teamIdSchema = idSchema("team");
var invitationIdSchema = idSchema("inv");
var prospectIdSchema = idSchema("prs");
var prospectCompanyIdSchema = idSchema("pco");
var prospectImportIdSchema = idSchema("pimp");
var prospectMergeIdSchema = idSchema("pmrg");
var consentEventIdSchema = idSchema("cev");
var consentWordingIdSchema = idSchema("cwd");
var suppressionEntryIdSchema = idSchema("sup");
var consentFormIdSchema = idSchema("cfm");
var contactCheckIdSchema = idSchema("chk");
var suppressionImportIdSchema = idSchema("simp");
var documentIdSchema = idSchema("doc");
var dealRecordIdSchema = idSchema("deal");
var callIdSchema = idSchema("call");
var copilotCardIdSchema = idSchema("ccard");
var lineIdSchema = idSchema("line");
var dealImportIdSchema = idSchema("dimp");
var eventIdSchema = idSchema("evt");
var requestIdSchema = idSchema("req");
var demoRequestIdSchema = idSchema("dreq");
var bookingIdSchema = idSchema("bkg");
var bookingTypeIdSchema = idSchema("bkt");
var routingRuleIdSchema = idSchema("rrl");
var routingDecisionIdSchema = idSchema("rdc");
var inquiryIdSchema = idSchema("inq");
var qualificationQuestionIdSchema = idSchema("qst");
var chatIdSchema = idSchema("cht");
var handoffIdSchema = idSchema("hof");
var trySessionIdSchema = idSchema("try");
var conversationIdSchema = idSchema("cnv");
var messageIdSchema = idSchema("msg");
var draftIdSchema = idSchema("drf");
var decisionIdSchema = idSchema("dcs");
var UUID_PATTERN = /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
function formatId(prefix, uuid) {
  if (typeof uuid !== "string" || !UUID_PATTERN.test(uuid)) {
    throw new Error("Not a UUID: expected 32 hexadecimal characters or the 8-4-4-4-12 form");
  }
  const hex = uuid.replaceAll("-", "").toLowerCase();
  return idSchema(prefix).parse(`${prefix}_${hex}`);
}

// src/prospect/values.ts
var MAX_RAW_LENGTH = 1000;
function hasControlCharacter2(text, allowLineBreaks) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (allowLineBreaks && (code === 10 || code === 9)) {
      continue;
    }
    if (code < 32 || code >= 127 && code <= 159) {
      return true;
    }
  }
  return false;
}
function boundedTextSchema(maxLength) {
  return z5.string().max(Math.max(MAX_RAW_LENGTH, maxLength)).trim().pipe(z5.string().min(1).max(maxLength).refine((text) => !hasControlCharacter2(text, false), "No control characters"));
}
var MAX_PROSPECT_NAME_PART_LENGTH = 100;
var MAX_PROSPECT_JOB_TITLE_LENGTH = 200;
var MAX_PROSPECT_COMPANY_NAME_LENGTH = 200;
var MAX_PROSPECT_NOTES_LENGTH = 5000;
var MAX_PROSPECT_TAG_LENGTH = 50;
var MAX_PROSPECT_TAGS = 20;
var MAX_PROSPECT_SEARCH_LENGTH = 100;
var MAX_PROSPECT_FIELD_VALUE_LENGTH = 320;
var MAX_SOURCE_REF_LENGTH = 200;
var prospectNamePartSchema = boundedTextSchema(MAX_PROSPECT_NAME_PART_LENGTH);
var prospectJobTitleSchema = boundedTextSchema(MAX_PROSPECT_JOB_TITLE_LENGTH);
var prospectCompanyNameSchema = boundedTextSchema(MAX_PROSPECT_COMPANY_NAME_LENGTH);
var prospectNotesSchema = z5.string().max(MAX_PROSPECT_NOTES_LENGTH * 2).trim().pipe(z5.string().min(1).max(MAX_PROSPECT_NOTES_LENGTH).refine((text) => !hasControlCharacter2(text, true), "No control characters"));
var prospectTagsSchema = z5.array(boundedTextSchema(MAX_PROSPECT_TAG_LENGTH)).max(MAX_PROSPECT_TAGS).refine((tags) => new Set(tags).size === tags.length, "No duplicate tags");
var rawPhoneSchema = z5.string().max(MAX_RAW_LENGTH).trim().pipe(z5.string().min(3).max(40).regex(/^\+?[0-9 ().-]+$/));
var e164PhoneSchema = z5.string().regex(/^\+[1-9][0-9]{6,14}$/);
var rawLinkedinUrlSchema = z5.string().max(MAX_RAW_LENGTH).trim().pipe(z5.string().min(1).max(300).refine((text) => /linkedin\.com\//i.test(text), "A linkedin.com address").refine((text) => !hasControlCharacter2(text, false), "No control characters"));
var prospectCompanyDomainSchema = z5.string().max(MAX_RAW_LENGTH).trim().transform(foldAscii).pipe(z5.string().min(3).max(253).regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/));
var PROSPECT_IDENTITY_KINDS = ["email", "phone", "linkedin"];
var prospectIdentityKindSchema = z5.enum(PROSPECT_IDENTITY_KINDS);
var PROSPECT_FIELD_NAMES = [
  "firstName",
  "lastName",
  "jobTitle",
  "email",
  "phone",
  "linkedinUrl"
];
var prospectFieldNameSchema = z5.enum(PROSPECT_FIELD_NAMES);
var PROSPECT_COMPANY_FIELD_NAMES = ["name", "domain"];
var prospectCompanyFieldNameSchema = z5.enum(PROSPECT_COMPANY_FIELD_NAMES);
var MAX_FIELD_HISTORY_ENTRIES = 50;
var FIXED_SOURCE_KINDS = [
  "manual",
  "import",
  "crm:hubspot",
  "crm:salesforce",
  "form"
];
var sourceKindSchema = z5.union([
  z5.enum(FIXED_SOURCE_KINDS),
  z5.string().regex(/^enrichment:[a-z][a-z0-9_]{0,31}$/)
]);
var fieldValueSchema = z5.object({
  value: z5.string().min(1).max(MAX_PROSPECT_FIELD_VALUE_LENGTH),
  source: sourceKindSchema,
  sourceRef: z5.string().min(1).max(MAX_SOURCE_REF_LENGTH).nullable(),
  setAt: timestampSchema,
  setByUserId: userIdSchema.nullable()
});
var FIELD_HISTORY_STATES = ["current", "superseded", "suggested"];
var fieldHistoryStateSchema = z5.enum(FIELD_HISTORY_STATES);
var fieldHistoryEntrySchema = fieldValueSchema.extend({ state: fieldHistoryStateSchema });

// src/consent/values.ts
var CONSENT_CHANNELS = ["phone", "sms", "whatsapp", "email", "linkedin"];
var consentChannelSchema = z6.enum(CONSENT_CHANNELS);
var CONSENT_REQUIRED_CHANNELS = [
  "phone",
  "sms",
  "whatsapp"
];
var CONSENT_GRANT_SOURCES = [
  "hosted_form",
  "verbal_call",
  "import_attestation",
  "crm",
  "manual"
];
var consentGrantSourceSchema = z6.enum(CONSENT_GRANT_SOURCES);
var CONSENT_RECORDABLE_SOURCES = [
  "verbal_call",
  "import_attestation",
  "crm",
  "manual"
];
var CONSENT_WITHDRAWAL_SOURCES = ["unsubscribe", "stop_reply", "manual", "crm"];
var consentWithdrawalSourceSchema = z6.enum(CONSENT_WITHDRAWAL_SOURCES);
var consentSourceSchema = z6.union([
  consentGrantSourceSchema,
  consentWithdrawalSourceSchema
]);
var MAX_EVIDENCE_REF_LENGTH = 200;
var evidenceRefSchema = boundedTextSchema(MAX_EVIDENCE_REF_LENGTH);
var consentTokenSchema = z6.string().min(22).max(256).regex(/^[A-Za-z0-9_-]+$/);
var CONTACT_PURPOSES = ["agent_initiated", "rep_initiated", "reply"];
var contactPurposeSchema = z6.enum(CONTACT_PURPOSES);
var SUPPRESSION_REASONS = [
  "unsubscribe",
  "stop",
  "bounce",
  "complaint",
  "manual",
  "crm",
  "erased"
];
var suppressionReasonSchema = z6.enum(SUPPRESSION_REASONS);
var SUPPRESSION_REMOVABLE_REASONS = ["manual"];
var SUPPRESSION_ADDRESS_KINDS = ["email", "phone", "linkedin"];
var suppressionAddressKindSchema = z6.enum(SUPPRESSION_ADDRESS_KINDS);
var maskedAddressSchema = z6.string().min(1).max(100);
var addressFieldsShape = {
  email: emailSchema.optional(),
  phone: rawPhoneSchema.optional(),
  linkedinUrl: rawLinkedinUrlSchema.optional()
};
var hasExactlyOneAddress = (body) => [body.email, body.phone, body.linkedinUrl].filter((value) => value !== undefined).length === 1;
var ONE_ADDRESS_MESSAGE = "Give exactly one of email, phone or linkedinUrl";

// src/events.ts
import { z as z8 } from "zod";

// src/tenancy.ts
import { z as z7 } from "zod";
var REGIONS = ["us", "eu"];
var regionSchema = z7.enum(REGIONS);
var ROLES = ["owner", "admin", "manager", "rep"];
var roleSchema = z7.enum(ROLES);
function roleAtLeast(role, minimum) {
  const have = ROLES.indexOf(role);
  const need = ROLES.indexOf(minimum);
  return have !== -1 && need !== -1 && have <= need;
}
var INVITABLE_ROLES = ["admin", "manager", "rep"];
var invitableRoleSchema = z7.enum(INVITABLE_ROLES);
var ORGANIZATION_STATUSES = ["active", "suspended", "deleted"];
var organizationStatusSchema = z7.enum(ORGANIZATION_STATUSES);

// src/events.ts
var EVENT_TYPE_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){1,2}$/;
var eventTypeSchema = z8.string().max(100).regex(EVENT_TYPE_PATTERN);
var versionSchema = z8.number().int().positive();
var occurredAtSchema = z8.iso.datetime({ offset: true }).max(64);
var envelopeShape = {
  id: eventIdSchema,
  type: eventTypeSchema,
  version: versionSchema,
  occurredAt: occurredAtSchema,
  organizationId: organizationIdSchema,
  region: regionSchema
};
function eventEnvelopeSchema(dataSchema) {
  return z8.object({ ...envelopeShape, data: dataSchema });
}
function defineEvent(type, version, dataSchema) {
  const schema = z8.object({
    ...envelopeShape,
    type: z8.literal(eventTypeSchema.parse(type)),
    version: z8.literal(versionSchema.parse(version)),
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

// src/voice/values.ts
import { z as z9 } from "zod";
var VOICE_CALL_DIRECTIONS = ["inbound", "outbound"];
var voiceCallDirectionSchema = z9.enum(VOICE_CALL_DIRECTIONS);
var VOICE_CALL_STATES = [
  "ringing",
  "connecting",
  "disclosing",
  "live",
  "ended",
  "failed",
  "missed"
];
var voiceCallStateSchema = z9.enum(VOICE_CALL_STATES);
var VOICE_CALL_FINAL_STATES = [
  "ended",
  "failed",
  "missed"
];
var VOICE_CALL_FAILURE_REASONS = [
  "disclosure_failed",
  "carrier_dropped",
  "carrier_rejected",
  "busy",
  "no_answer",
  "rep_unreachable",
  "provider_error",
  "timeout"
];
var voiceCallFailureReasonSchema = z9.enum(VOICE_CALL_FAILURE_REASONS);
var VOICE_CALL_ENDED_BY = ["rep", "prospect", "system"];
var voiceCallEndedBySchema = z9.enum(VOICE_CALL_ENDED_BY);
var VOICE_RECORDING_STATES = ["none", "storing", "stored", "deleted"];
var voiceRecordingStateSchema = z9.enum(VOICE_RECORDING_STATES);
var VOICE_TRANSCRIPT_STATES = ["pending", "ready", "deleted"];
var voiceTranscriptStateSchema = z9.enum(VOICE_TRANSCRIPT_STATES);
var MAX_WRAP_UP_NOTE_LENGTH = 2000;
var wrapUpNoteSchema = boundedTextSchema(MAX_WRAP_UP_NOTE_LENGTH);
var MAX_LINE_LABEL_LENGTH = 100;
var lineLabelSchema = boundedTextSchema(MAX_LINE_LABEL_LENGTH);
var countryCodeSchema = z9.string().regex(/^[A-Z]{2}$/);
var phoneHashSchema = z9.string().regex(/^[0-9a-f]{64}$/);

// src/agent/handoff.ts
import { z as z19 } from "zod";

// src/inquiry/qualification.ts
import { z as z11 } from "zod";

// src/pagination.ts
import { z as z10 } from "zod";
var MAX_PAGE_SIZE = 100;
var DEFAULT_PAGE_SIZE = 25;
var MAX_CURSOR_LENGTH = 512;
var cursorTextSchema = z10.string().min(1).max(MAX_CURSOR_LENGTH);
var pageQuerySchema = z10.object({
  cursor: cursorTextSchema.optional(),
  limit: z10.union([z10.number(), z10.string().regex(/^\d{1,3}$/)]).transform((value) => Number(value)).pipe(z10.number().int().min(1).max(MAX_PAGE_SIZE)).default(DEFAULT_PAGE_SIZE)
});
function pageSchema(itemSchema) {
  return z10.object({
    items: z10.array(itemSchema).max(MAX_PAGE_SIZE),
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

// src/inquiry/qualification.ts
var QUALIFICATION_QUESTION_KINDS = ["free_text", "choice", "number", "yes_no"];
var qualificationQuestionKindSchema = z11.enum(QUALIFICATION_QUESTION_KINDS);
var MAX_QUALIFICATION_QUESTIONS = 50;
var MAX_QUESTION_PROMPT_LENGTH = 500;
var MAX_ANSWER_LENGTH = 500;
var MIN_QUESTION_CHOICES = 2;
var MAX_QUESTION_CHOICES = 10;
var MAX_SKIP_CONDITIONS = 5;
var MAX_QUESTION_SUGGESTIONS = 10;
var questionPromptSchema = boundedTextSchema(MAX_QUESTION_PROMPT_LENGTH);
var qualificationValueSchema = z11.union([
  boundedTextSchema(MAX_ANSWER_LENGTH),
  z11.number().finite(),
  z11.boolean()
]);
var SKIP_OPERATORS = [
  "equals",
  "not_equals",
  "greater_than",
  "less_than",
  "answered",
  "not_answered"
];
var skipOperatorSchema = z11.enum(SKIP_OPERATORS);
var skipConditionSchema = z11.strictObject({
  questionId: qualificationQuestionIdSchema,
  operator: skipOperatorSchema,
  value: qualificationValueSchema.optional()
}).refine((c) => (c.operator === "answered" || c.operator === "not_answered") === (c.value === undefined), { message: "Only answered and not_answered take no value", path: ["value"] });
var choicesSchema = z11.array(boundedTextSchema(MAX_ANSWER_LENGTH)).min(MIN_QUESTION_CHOICES).max(MAX_QUESTION_CHOICES).refine((choices) => new Set(choices).size === choices.length, "No repeats");
var skipWhenSchema = z11.array(skipConditionSchema).max(MAX_SKIP_CONDITIONS);
var choicesMatchKind = (q) => q.kind === "choice" === (q.choices !== null);
var CHOICES_ISSUE = {
  message: "Only a choice question has choices, and it must",
  path: ["choices"]
};
var qualificationQuestionSchema = z11.strictObject({
  id: qualificationQuestionIdSchema,
  position: z11.number().int().min(1).max(MAX_QUALIFICATION_QUESTIONS),
  prompt: questionPromptSchema,
  kind: qualificationQuestionKindSchema,
  choices: choicesSchema.nullable(),
  required: z11.boolean(),
  skipWhen: skipWhenSchema
}).refine(choicesMatchKind, CHOICES_ISSUE);
var qualificationQuestionParamsSchema = z11.strictObject({
  questionId: qualificationQuestionIdSchema
});
var createQualificationQuestionRequestSchema = z11.strictObject({
  prompt: questionPromptSchema,
  kind: qualificationQuestionKindSchema,
  choices: choicesSchema.nullable().default(null),
  required: z11.boolean().default(false),
  skipWhen: skipWhenSchema.default([]),
  position: z11.number().int().min(1).max(MAX_QUALIFICATION_QUESTIONS).optional()
}).refine(choicesMatchKind, CHOICES_ISSUE);
var updateQualificationQuestionRequestSchema = z11.strictObject({
  prompt: questionPromptSchema,
  kind: qualificationQuestionKindSchema,
  choices: choicesSchema.nullable(),
  required: z11.boolean(),
  skipWhen: skipWhenSchema
}).refine(choicesMatchKind, CHOICES_ISSUE);
var reorderQualificationQuestionsRequestSchema = z11.strictObject({
  questionIds: z11.array(qualificationQuestionIdSchema).min(1).max(MAX_QUALIFICATION_QUESTIONS).refine((ids) => new Set(ids).size === ids.length, "Each question once")
});
var listQualificationQuestionsQuerySchema = pageQuerySchema.strict();
var qualificationQuestionPageSchema = pageSchema(qualificationQuestionSchema);
var suggestedQualificationQuestionSchema = z11.strictObject({
  prompt: questionPromptSchema,
  kind: qualificationQuestionKindSchema,
  choices: choicesSchema.nullable()
}).refine(choicesMatchKind, CHOICES_ISSUE);
var questionSuggestionsSchema = z11.strictObject({
  items: z11.array(suggestedQualificationQuestionSchema).max(MAX_QUESTION_SUGGESTIONS)
});
var qualificationAnswerSchema = z11.strictObject({
  questionId: qualificationQuestionIdSchema,
  value: qualificationValueSchema.nullable(),
  skipped: z11.boolean()
}).refine((a) => !a.skipped || a.value === null, {
  message: "A skipped question has no value",
  path: ["value"]
});
var MAX_QUALIFICATION_SUMMARY_LENGTH = 2000;
var qualificationSchema = z11.strictObject({
  answers: z11.array(qualificationAnswerSchema).max(MAX_QUALIFICATION_QUESTIONS).refine((a) => new Set(a.map((x) => x.questionId)).size === a.length, "Each question once"),
  summary: boundedTextSchema(MAX_QUALIFICATION_SUMMARY_LENGTH).nullable()
});

// src/agent/turn.ts
import { z as z18 } from "zod";

// src/copilot/card.ts
import { z as z16 } from "zod";

// src/playbook/values.ts
import { z as z12 } from "zod";
var DOCUMENT_STATES = ["uploaded", "processing", "ready", "failed", "deleted"];
var documentStateSchema = z12.enum(DOCUMENT_STATES);
var DOCUMENT_FAILURE_REASONS = [
  "too_many_pages",
  "unreadable",
  "password_protected",
  "no_text",
  "processing_failed"
];
var documentFailureReasonSchema = z12.enum(DOCUMENT_FAILURE_REASONS);
var ACCEPTED_DOCUMENT_EXTENSIONS = [".pdf", ".docx", ".pptx", ".txt", ".md"];
var ACCEPTED_DOCUMENT_MEDIA_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown"
];
var documentMediaTypeSchema = z12.enum(ACCEPTED_DOCUMENT_MEDIA_TYPES);
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
var documentFileNameSchema = z12.string().max(MAX_RAW_FILE_NAME_LENGTH).transform(normaliseFileName).pipe(z12.string().min(1).max(MAX_DOCUMENT_FILE_NAME_LENGTH).refine(isWellFormed2, "Well-formed text only").refine((name) => !/[/\\]/.test(name), "No path separators").refine(hasStem, "A name before the extension"));
var documentTypeCheckSchema = z12.string().transform(normaliseFileName).pipe(z12.string().refine((name) => documentExtension(name) !== undefined, "An accepted file type only"));
var documentSizeCheckSchema = z12.number().max(MAX_DOCUMENT_BYTES);
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

// src/copilot/values.ts
import { z as z15 } from "zod";

// src/playbook/search.ts
import { z as z14 } from "zod";

// src/playbook/call-values.ts
import { z as z13 } from "zod";
var CALL_STATES = [
  "uploaded",
  "transcribing",
  "awaiting_rep",
  "processing",
  "ready",
  "failed",
  "deleted"
];
var callStateSchema = z13.enum(CALL_STATES);
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
var callFailureReasonSchema = z13.enum(CALL_FAILURE_REASONS);
var CALL_KINDS = ["transcript", "recording"];
var callKindSchema = z13.enum(CALL_KINDS);
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
var callMediaTypeSchema = z13.enum(CALL_MEDIA_TYPES);
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
var speakerLabelSchema = z13.string().max(1000).transform(normaliseSpeakerLabel).pipe(z13.string().min(1).max(MAX_SPEAKER_LABEL_LENGTH).refine(isWellFormedText, "Well-formed text only").refine((label) => !hasStrippableCharacter(label), "No control characters"));
var MAX_SPEAKER_EXCERPT_LENGTH = 240;
var SPACES = new RegExp(`[\\s${String.fromCharCode(133)}]+`, "g");
var ELLIPSIS = String.fromCodePoint(8230);
function isLoneSurrogate(char) {
  const code = char.codePointAt(0) ?? 0;
  return char.length === 1 && code >= 55296 && code <= 57343;
}
function excerptText(text, max) {
  const collapse = (value) => value.replace(SPACES, " ");
  const clean = collapse(normaliseSpeakerLabel(collapse(text)));
  const chars = Array.from(clean).filter((char) => !isLoneSurrogate(char));
  if (chars.length <= max) {
    return chars.join("");
  }
  const room = max - 1;
  let end = room;
  if (chars[room] !== " ") {
    const space = chars.slice(0, room).lastIndexOf(" ");
    end = space > 0 ? space : room;
  }
  return chars.slice(0, end).join("").trimEnd() + ELLIPSIS;
}
function speakerExcerpt(turns) {
  return excerptText(turns.join(" "), MAX_SPEAKER_EXCERPT_LENGTH);
}
var speakerExcerptSchema = z13.strictObject({
  label: speakerLabelSchema,
  excerpt: z13.string().min(1).max(MAX_SPEAKER_EXCERPT_LENGTH * 2).refine((text) => Array.from(text).length <= MAX_SPEAKER_EXCERPT_LENGTH, "Within the cap").refine(isWellFormedText, "Well-formed text only").refine((text) => !hasStrippableCharacter(text), "No control characters")
});
var CALL_CHANNELS = ["left", "right"];
var callChannelSchema = z13.enum(CALL_CHANNELS);
var repChoiceSchema = z13.discriminatedUnion("by", [
  z13.strictObject({ by: z13.literal("speaker"), label: speakerLabelSchema }),
  z13.strictObject({ by: z13.literal("channel"), channel: callChannelSchema })
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
    description: "Lists the Organization's Calls, newest first (sorted by createdAt, then id, both descending), one cursor-paginated page at a time (at most 100). Owner and Admin only. Deleted Calls are left out unless state=deleted is asked for; state=awaiting_rep lists the Calls waiting for a Rep and dealRecordId (the opaque Deal id) limits the list to one Deal. A list item never carries speakers: only the single-Call read returns speaker excerpts."
  }),
  getCall: route2({
    method: "GET",
    path: "/playbook/calls/{callId}",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Call and its state, with the failure reason when it failed, the speaker labels to pick a Rep from and the purge time when it was deleted. For a Recording with speaker labels, above all one awaiting its Rep, it also returns speakers: a short excerpt per label (the first turns of the speaker, at most 240 characters, cut at a word boundary with an ellipsis; at most 20 speakers) so a person can tell who is the Rep. The excerpts are tenant Transcript text: returned only to the Owner and Admin of the owning Organization and never logged. No other Transcript text or audio is returned. Owner and Admin only."
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
    description: 'Uploads the fixed CSV template (columns deal_id, outcome, closed_at, amount, currency and optionally name; closed_at is a plain YYYY-MM-DD date, kept as written, and a value with a time or an offset is a rejected row with the reason invalid_closed_at; up to 10 MB and 50,000 rows) as multipart/form-data with one file part named "file". Owner and Admin only. The type, size and first row are checked before anything is stored: deal_import.unsupported_type (415), deal_import.too_large (413) and deal_import.header_invalid (422). An Organization with MAX_QUEUED_DEAL_IMPORTS (5) imports not yet finished (state uploaded or processing) is refused with deal_import.busy (429) and nothing is stored; the count is checked before the file is stored, so a refused upload leaves no import. The header is read with checkDealImportHeaderText (the same reader and limits as parseCsv) on the first 8192 characters of the file (a header still unfinished there is deferred to the job, not refused), and the job re-checks the header of its full parse with the same verdict. The rest of the file is parsed in the background job, never on the request path, under strict RFC 4180 quoting: a stray quote fails the file, and a cell over 1000 characters fails the whole file too (a cell up to 1000 characters is checked row by row, and a bad one is a rejected row); blank lines at the end of the file are ignored, and an interior blank line is a rejected row with the reason blank_row, so the report has no gap, and it still counts in the row numbers, and rowNumber is the record number with the header as record 1. Answers 202 with the import in state "uploaded"; it is processed in the background. Imports are not deduplicated by content: each upload is a new import, and only the Idempotency-Key makes a retry of the same request answer with the stored import. Valid rows are applied and bad rows are reported, never dropped: a deal id already won or lost, or repeated within the file, is a rejected row in the report, not an HTTP error. A file with more rows than the limit, a cell over the length limit or a quoting error ends in state "failed" with failureReason "too_many_rows" or "unreadable". Accepts an Idempotency-Key header.'
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

// src/playbook/search.ts
var MAX_SEARCH_LIMIT = 20;
var DEFAULT_SEARCH_LIMIT = 5;
var MAX_SEARCH_TURNS = 6;
var MAX_SEARCH_TEXT_CHARACTERS = 2000;
var MAX_MOMENT_SNIPPET_CHARACTERS = 512;
var MAX_SEARCH_CANDIDATES = 100;
var codePointCount = (text) => Array.from(text).length;
var searchTurnSchema = z14.strictObject({
  role: z14.enum(["rep", "prospect"]),
  text: z14.string().min(1).max(MAX_SEARCH_TEXT_CHARACTERS * 2).refine(isWellFormedText, "Well-formed text only").refine((text) => text.trim().length > 0, "Not only whitespace")
});
var searchMomentsRequestSchema = z14.strictObject({
  turns: z14.array(searchTurnSchema).min(1).max(MAX_SEARCH_TURNS),
  limit: z14.number().int().min(1).max(MAX_SEARCH_LIMIT).default(DEFAULT_SEARCH_LIMIT)
}).superRefine((request, context) => {
  const total = request.turns.reduce((sum, turn) => sum + codePointCount(turn.text), 0);
  if (total > MAX_SEARCH_TEXT_CHARACTERS) {
    context.addIssue({
      code: "custom",
      path: ["turns"],
      message: "The turns together are within the character limit"
    });
  }
});
var momentSnippetSchema = z14.string().max(MAX_MOMENT_SNIPPET_CHARACTERS * 2).refine((text) => codePointCount(text) <= MAX_MOMENT_SNIPPET_CHARACTERS, "Within the snippet cap").refine(isWellFormedText, "Well-formed text only").refine((text) => !hasStrippableCharacter(text), "No control characters");
function momentSnippet(text) {
  return excerptText(text, MAX_MOMENT_SNIPPET_CHARACTERS);
}
var momentMatchSchema = z14.object({
  callId: callIdSchema,
  dealRecordId: dealRecordIdSchema,
  score: z14.number().finite(),
  prospect: momentSnippetSchema,
  repNext: momentSnippetSchema
});
var searchEvidenceSchema = z14.object({
  moments: z14.number().int().min(0).max(MAX_SEARCH_CANDIDATES),
  deals: z14.number().int().min(0).max(MAX_SEARCH_CANDIDATES)
});
var searchMomentsResponseSchema = z14.object({
  items: z14.array(momentMatchSchema).max(MAX_SEARCH_LIMIT),
  evidence: searchEvidenceSchema
}).superRefine((response, context) => {
  const itemDeals = new Set(response.items.map((match) => match.dealRecordId)).size;
  if (response.evidence.deals > response.evidence.moments || response.items.length > response.evidence.moments || response.evidence.deals < itemDeals) {
    context.addIssue({
      code: "custom",
      path: ["evidence"],
      message: "The items and Deals fit within the candidate Moments, and the Deals cover the items"
    });
  }
});
var ROLE_LABELS = { rep: "Rep", prospect: "Prospect" };
function momentQueryText(turns) {
  return turns.map((turn) => `${ROLE_LABELS[turn.role]}: ${turn.text.trim()}`).join(`
`);
}
var route3 = (definition) => Object.freeze(definition);
var searchDocumentsRequestSchema = searchMomentsRequestSchema;
function documentQueryText(turns) {
  return turns.map((turn) => turn.text.trim()).join(`
`);
}
var documentMatchSchema = z14.object({
  documentId: documentIdSchema,
  fileName: documentFileNameSchema,
  page: z14.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
  score: z14.number().finite(),
  snippet: momentSnippetSchema
});
var documentSearchEvidenceSchema = z14.object({
  chunks: z14.number().int().min(0).max(MAX_SEARCH_CANDIDATES),
  documents: z14.number().int().min(0).max(MAX_SEARCH_CANDIDATES)
});
var searchDocumentsResponseSchema = z14.object({
  items: z14.array(documentMatchSchema).max(MAX_SEARCH_LIMIT),
  evidence: documentSearchEvidenceSchema
}).superRefine((response, context) => {
  const itemDocuments = new Set(response.items.map((match) => match.documentId)).size;
  if (response.evidence.documents > response.evidence.chunks || response.items.length > response.evidence.chunks || response.evidence.documents < itemDocuments) {
    context.addIssue({
      code: "custom",
      path: ["evidence"],
      message: "The items and documents fit within the candidate chunks, and the documents cover the items"
    });
  }
});
var SEARCH_ROUTES = Object.freeze({
  searchMoments: route3({
    method: "POST",
    path: "/playbook/search/moments",
    internal: false,
    roles: SALES_HISTORY_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid", "server.timeout", "server.unavailable"],
    description: "Finds Moments in the Organization's won Deals that resemble the conversation so far, so the Copilot can show what worked. The body is the latest turns (1 to 6, each a role of rep or prospect and its text, at most 2000 characters in all) and an optional limit (1 to 20, default 5). It answers the best matches, best first, at most 20, each with the opaque callId and dealRecordId, a score and two snippets of at most 512 characters (what the Prospect said and what the Rep said next), and evidence: the number of candidate Moments and the distinct won Deals among them. The evidence counts only the over-fetched candidate window (the best min(100, limit x 5) Moments by similarity, after the eligibility checks), not every won Deal in the Organization. There is no cursor: the result is a bounded top-k. Only Moments of Calls whose Deal is won and whose Call is in search are returned, and only from the caller's Organization. It never returns the customer's dealId, name or amount. The request and the snippets are tenant conversation text and are never logged. It only reads, so it takes no Idempotency-Key and a repeat is harmless. request.invalid (400) for a body outside the bounds; server.timeout (504) when it takes too long; server.unavailable (503) with a Retry-After header when the embedding model or the vector store cannot answer. Owner and Admin only, as for all sales history (the owner's decision of 2026-10-13); a Manager or a Rep gets auth.forbidden, because a Rep sees only their own conversations. The phase-2 Copilot calls this service-to-service, not with a Rep's token."
  }),
  searchDocuments: route3({
    method: "POST",
    path: "/playbook/search/documents",
    internal: false,
    roles: PLAYBOOK_READ_ROLES,
    success: [200],
    errors: [],
    commonErrors: ["request.invalid", "server.timeout", "server.unavailable"],
    description: "Finds passages in the Organization's Playbook documents that resemble the conversation so far, so a Rep can see what the company's own material says. The body is the same as for the Moments search: the latest turns (1 to 6, each a role of rep or prospect and its text, at most 2000 characters in all) and an optional limit (1 to 20, default 5). It answers the best passages, best first, at most 20, one item per chunk, each with the documentId, the document's fileName (the Organization's own file name), the page (the 1-based page for a paginated format such as PDF, null for a format without pages such as TXT, MD or DOCX and anything else the parser reads as one page; the service decides by media type), a score and a snippet of at most 512 characters, and evidence: the number of candidate chunks that survive the staleness check and the distinct documents among them. The evidence counts only the over-fetched candidate window (the best min(100, limit x 5) chunks by similarity, after the staleness check), not every document in the Organization. The query is embedded with documentQueryText (the turns trimmed and joined by a newline, no role labels), because document chunks are embedded as plain text. There is no cursor: the result is a bounded top-k. Only chunks of documents that are ready and not replaced are returned, and only from the caller's Organization. The request and the snippets are the Organization's own conversation and sales text and are never logged. It only reads, so it takes no Idempotency-Key and a repeat is harmless. request.invalid (400) for a body outside the bounds; server.timeout (504) when it takes too long; server.unavailable (503) with a Retry-After header when the embedding model or the vector store cannot answer. Every role that reads the Playbook (Owner, Admin, Manager and Rep) may call it, because the text is the Organization's own sales material; any other is auth.forbidden."
  })
});

// src/copilot/values.ts
var COPILOT_CARD_KINDS = ["similar_moment", "objection", "next_step", "document"];
var copilotCardKindSchema = z15.enum(COPILOT_CARD_KINDS);
var COPILOT_COMPOSED_KINDS = [
  "objection",
  "next_step"
];
var COPILOT_OBJECTION_TYPES = [
  "price",
  "timing",
  "competitor",
  "authority",
  "need",
  "trust"
];
var copilotObjectionTypeSchema = z15.enum(COPILOT_OBJECTION_TYPES);
var COPILOT_RATINGS = ["useful", "not_useful"];
var copilotRatingSchema = z15.enum(COPILOT_RATINGS);
var MAX_COPILOT_CARDS_PER_CALL = 60;
var MAX_COPILOT_CITED_MOMENTS = 5;
var MAX_COPILOT_CARD_TEXT_LENGTH = 600;
var MAX_COPILOT_QUOTE_LENGTH = 512;
var codePointCount2 = (text) => Array.from(text).length;
function copilotTextSchema(max) {
  return z15.string().max(max * 4).refine((text) => codePointCount2(text) <= max, `At most ${max} characters`).refine(isWellFormedText, "Well-formed text only").refine((text) => !hasStrippableCharacter(text), "No control characters").refine((text) => text.trim().length > 0, "Not only whitespace");
}
var copilotCardTextSchema = copilotTextSchema(MAX_COPILOT_CARD_TEXT_LENGTH);
var copilotQuoteTextSchema = copilotTextSchema(MAX_COPILOT_QUOTE_LENGTH);
var copilotMomentRefSchema = z15.strictObject({
  callId: callIdSchema,
  dealRecordId: dealRecordIdSchema
});
var copilotEvidenceSchema = z15.strictObject({
  moments: z15.number().int().min(1).max(MAX_SEARCH_CANDIDATES),
  deals: z15.number().int().min(1).max(MAX_SEARCH_CANDIDATES)
}).refine((evidence) => evidence.deals <= evidence.moments, {
  path: ["deals"],
  message: "There are no more distinct Deals than Moments"
});
var copilotMomentKey = (ref) => `${ref.callId}|${ref.dealRecordId}`;

// src/copilot/card.ts
var copilotQuoteSchema = z16.strictObject({
  ...copilotMomentRefSchema.shape,
  prospect: copilotQuoteTextSchema,
  repNext: copilotQuoteTextSchema
});
var copilotDocumentSourceSchema = z16.strictObject({
  documentId: documentIdSchema,
  page: z16.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
  passage: copilotQuoteTextSchema
});
var cardBase = {
  id: copilotCardIdSchema,
  callId: callIdSchema,
  sequence: z16.number().int().min(1).max(MAX_COPILOT_CARDS_PER_CALL),
  evidence: copilotEvidenceSchema,
  citedMoments: z16.array(copilotMomentRefSchema).min(1).max(MAX_COPILOT_CITED_MOMENTS),
  quotes: z16.array(copilotQuoteSchema).max(MAX_COPILOT_CITED_MOMENTS),
  shownAt: timestampSchema,
  rating: copilotRatingSchema.nullable(),
  dismissed: z16.boolean(),
  pinned: z16.boolean()
};
var similarMomentCard = z16.strictObject({ ...cardBase, kind: z16.literal("similar_moment") });
var objectionCard = z16.strictObject({
  ...cardBase,
  kind: z16.literal("objection"),
  objectionType: copilotObjectionTypeSchema,
  response: copilotCardTextSchema
});
var nextStepCard = z16.strictObject({
  ...cardBase,
  kind: z16.literal("next_step"),
  nextStep: copilotCardTextSchema
});
var documentCard = z16.strictObject({
  ...cardBase,
  kind: z16.literal("document"),
  source: copilotDocumentSourceSchema
});
var copilotCardSchema = z16.discriminatedUnion("kind", [similarMomentCard, objectionCard, nextStepCard, documentCard]).superRefine((card, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  const cited = new Set(card.citedMoments.map(copilotMomentKey));
  if (cited.size !== card.citedMoments.length) {
    issue("citedMoments", "A Moment is cited once");
  }
  if (card.citedMoments.length > card.evidence.moments) {
    issue("evidence", "The Evidence counts at least the Moments cited");
  }
  if (new Set(card.citedMoments.map((ref) => ref.dealRecordId)).size > card.evidence.deals) {
    issue("evidence", "The Evidence counts at least the Deals cited");
  }
  if (card.quotes.some((quote) => !cited.has(copilotMomentKey(quote)))) {
    issue("quotes", "Every quote is of a cited Moment");
  }
  if (card.kind === "similar_moment" && card.quotes.length === 0) {
    issue("quotes", "A similar-Moment card shows at least one quote");
  }
  if (card.dismissed && card.pinned) {
    issue("pinned", "A card is dismissed or pinned, not both");
  }
});
function isComposedKind(kind) {
  return COPILOT_COMPOSED_KINDS.includes(kind);
}
var copilotCallParamsSchema = z16.strictObject({ callId: callIdSchema });
var copilotCardParamsSchema = z16.strictObject({
  callId: callIdSchema,
  cardId: copilotCardIdSchema
});
var copilotCardCursorSchema = z16.strictObject({
  sequence: z16.number().int().min(1).max(MAX_COPILOT_CARDS_PER_CALL)
});
var listCopilotCardsQuerySchema = pageQuerySchema.extend({ kind: copilotCardKindSchema.optional() }).strict();
var copilotCardPageSchema = pageSchema(copilotCardSchema);
var markCopilotCardRequestSchema = z16.strictObject({
  rating: copilotRatingSchema.nullable().optional(),
  dismissed: z16.boolean().optional(),
  pinned: z16.boolean().optional()
}).refine((body) => body.rating !== undefined || body.dismissed !== undefined || body.pinned !== undefined, { message: "Give a rating, dismissed or pinned" }).refine((body) => !(body.dismissed === true && body.pinned === true), {
  message: "A card is dismissed or pinned, not both"
});

// src/agent/values.ts
import { z as z17 } from "zod";
var AGENT_VOICE_STYLES = ["warm", "neutral", "crisp"];
var agentVoiceStyleSchema = z17.enum(AGENT_VOICE_STYLES);
var AGENT_LANGUAGES = ["en"];
var agentLanguageSchema = z17.enum(AGENT_LANGUAGES);
var MAX_AGENT_CALL_SECONDS = 1800;
var DEFAULT_AGENT_CALL_SECONDS = 600;
var MAX_AGENT_CALL_COST_USD_CENTS = 5000;
var MAX_AGENT_CONCURRENCY = 50;
var MAX_AGENT_GREETING_LENGTH = 500;
var AGENT_CALLING_WINDOW = { startHour: 8, endHour: 21 };
var AGENT_TOOLS = [
  "record_answer",
  "find_slots",
  "book",
  "hand_off",
  "end_call",
  "revoke_consent"
];
var agentToolNameSchema = z17.enum(AGENT_TOOLS);
var MAX_TURN_SOURCES = 10;
var MAX_HANDOFF_CONTEXT_TURNS = 20;
var MAX_TURN_TEXT_LENGTH = 2000;

// src/agent/turn.ts
var agentTurnRoleSchema = z18.enum(["prospect", "agent"]);
var agentTurnSchema = z18.strictObject({
  index: z18.number().int().min(0),
  role: agentTurnRoleSchema,
  text: boundedTextSchema(MAX_TURN_TEXT_LENGTH),
  sources: z18.array(copilotDocumentSourceSchema).max(MAX_TURN_SOURCES),
  deferred: z18.boolean(),
  toolCall: z18.strictObject({ name: agentToolNameSchema }).nullable(),
  at: timestampSchema
});
var agentCallParamsSchema = z18.strictObject({ callId: callIdSchema });
var listAgentTurnsQuerySchema = pageQuerySchema.strict();
var agentTurnPageSchema = pageSchema(agentTurnSchema);
var trySessionParamsSchema = z18.strictObject({ sessionId: trySessionIdSchema });
var sendTryMessageRequestSchema = z18.strictObject({
  text: boundedTextSchema(MAX_TURN_TEXT_LENGTH)
});
var startTrySessionRequestSchema = z18.strictObject({});
var trySessionSchema = z18.strictObject({
  id: trySessionIdSchema,
  opening: agentTurnSchema,
  expiresAt: timestampSchema
});
var tryReplySchema = z18.strictObject({ reply: agentTurnSchema });

// src/agent/handoff.ts
var HANDOFF_CHANNELS = ["call", "chat"];
var handoffChannelSchema = z19.enum(HANDOFF_CHANNELS);
var HANDOFF_STATES = [
  "pending",
  "accepted",
  "completed",
  "declined",
  "timed_out",
  "no_rep"
];
var handoffStateSchema = z19.enum(HANDOFF_STATES);
var HANDOFF_REASONS = [
  "asked_for_rep",
  "qualified",
  "agent_unsure",
  "prospect_frustrated"
];
var handoffReasonSchema = z19.enum(HANDOFF_REASONS);
var HANDOFF_RESULTS = ["bridged", "booking_offered", "abandoned"];
var handoffResultSchema = z19.enum(HANDOFF_RESULTS);
var handoffSchema = z19.strictObject({
  id: handoffIdSchema,
  state: handoffStateSchema,
  channel: handoffChannelSchema,
  callId: callIdSchema.nullable(),
  chatId: chatIdSchema.nullable(),
  repMembershipId: membershipIdSchema.nullable(),
  attempt: z19.number().int().min(1).max(10),
  reason: handoffReasonSchema,
  requestedAt: timestampSchema,
  answeredAt: timestampSchema.nullable(),
  completedAt: timestampSchema.nullable()
}).superRefine((h, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  if (h.channel === "call" && (h.callId === null || h.chatId !== null)) {
    issue("callId", "A call Handoff names its Call and no Chat");
  }
  if (h.channel === "chat" && (h.chatId === null || h.callId !== null)) {
    issue("chatId", "A chat Handoff names its Chat and no Call");
  }
});
var handoffParamsSchema = z19.strictObject({ handoffId: handoffIdSchema });
var listHandoffsQuerySchema = pageQuerySchema.extend({ state: handoffStateSchema.optional() }).strict();
var handoffPageSchema = pageSchema(handoffSchema);
var handoffContextSchema = z19.strictObject({
  handoffId: handoffIdSchema,
  prospectId: prospectIdSchema,
  qualification: qualificationSchema,
  recentTurns: z19.array(agentTurnSchema).max(MAX_HANDOFF_CONTEXT_TURNS)
});
var answerHandoffRequestSchema = z19.strictObject({});

// src/agent/events.ts
var AGENT_CALL_OUTCOMES = [
  "completed",
  "booked",
  "handed_off",
  "prospect_stopped",
  "failed"
];
var agentCallOutcomeSchema = z20.enum(AGENT_CALL_OUTCOMES);
var voiceAgentCallEndedEvent = defineEvent("voice.agent_call.ended", 1, z20.strictObject({
  callId: callIdSchema,
  inquiryId: inquiryIdSchema.nullable(),
  prospectId: prospectIdSchema.nullable(),
  outcome: agentCallOutcomeSchema,
  failureReason: voiceCallFailureReasonSchema.nullable(),
  startedAt: timestampSchema,
  endedAt: timestampSchema,
  durationSeconds: z20.number().int().min(0).max(MAX_AGENT_CALL_SECONDS),
  disclosureWordingVersion: z20.number().int().min(1).nullable()
}).superRefine((d, ctx) => {
  if (d.outcome === "failed" !== (d.failureReason !== null)) {
    ctx.addIssue({
      code: "custom",
      path: ["failureReason"],
      message: "Only a failed Call has a failure reason"
    });
  }
  if (d.outcome !== "failed" && d.disclosureWordingVersion === null) {
    ctx.addIssue({
      code: "custom",
      path: ["disclosureWordingVersion"],
      message: "A Call that connected played the Disclosure"
    });
  }
}));
var voiceHandoffCompletedEvent = defineEvent("voice.handoff.completed", 1, z20.strictObject({
  handoffId: handoffIdSchema,
  channel: handoffChannelSchema,
  callId: callIdSchema.nullable(),
  chatId: chatIdSchema.nullable(),
  inquiryId: inquiryIdSchema.nullable(),
  prospectId: prospectIdSchema,
  repMembershipId: membershipIdSchema.nullable(),
  result: handoffResultSchema,
  attempts: z20.number().int().min(1).max(10),
  requestedAt: timestampSchema,
  answeredAt: timestampSchema.nullable(),
  completedAt: timestampSchema
}));
var CONSENT_REVOKE_TRIGGERS = ["agent_call", "chat", "sms_stop"];
var consentRevokeTriggerSchema = z20.enum(CONSENT_REVOKE_TRIGGERS);
var voiceConsentRevokedEvent = defineEvent("voice.consent.revoked", 1, z20.strictObject({
  prospectId: prospectIdSchema,
  channel: consentChannelSchema,
  trigger: consentRevokeTriggerSchema,
  callId: callIdSchema.nullable(),
  chatId: chatIdSchema.nullable(),
  revokedAt: timestampSchema
}));
var AGENT_EVENTS = {
  "voice.agent_call.ended": voiceAgentCallEndedEvent,
  "voice.handoff.completed": voiceHandoffCompletedEvent,
  "voice.consent.revoked": voiceConsentRevokedEvent
};
// src/inbound-route.ts
var inboundRoute = (definition) => Object.freeze(definition);
var IDEMPOTENT_ERRORS = [
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var PUBLIC_ERRORS = [
  "request.too_large",
  "request.unsupported_media_type",
  "request.invalid",
  "rate.limited",
  "server.internal",
  "server.unavailable",
  "server.timeout"
];

// src/agent/routes.ts
var AGENT_READ_ROLES = ["owner", "admin", "manager"];
var AGENT_ADMIN_ROLES = ["owner", "admin"];
var AGENT_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var HANDOFF_VISIBILITY = "A Rep sees and answers only the Handoffs offered to them; a Manager sees those offered to Reps of their Team; an Owner or Admin sees all. A Handoff outside the caller's view is handoff.not_found (404), never 403.";
var AGENT_ROUTES = Object.freeze({
  getAgentSettings: inboundRoute({
    method: "GET",
    path: "/v1/agent/settings",
    roles: AGENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the Inbound Agent settings: paused, greeting, voice style, hours, the fixed language list and the caps on Call length, cost and concurrency. Owner, Admin and Manager; a Rep gets auth.forbidden."
  }),
  setAgentSettings: inboundRoute({
    method: "PUT",
    path: "/v1/agent/settings",
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ["agent.settings_invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Replaces the Inbound Agent settings, so a repeat changes nothing. Pausing stops callbacks and answers at once. Hours must not be empty and are checked in the Organization's zone (timeZone) against the fixed calling window; the service applies the Prospect-local window separately, so a call is placed only inside both. The body has no field for the Disclosure, the Recording or Contact Consent: they are not settings and an unknown field is request.invalid (ADR 0003). A greeting is spoken after the Disclosure, never in place of it. Owner and Admin only."
  }),
  listQualificationQuestions: inboundRoute({
    method: "GET",
    path: "/v1/agent/questions",
    roles: AGENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Qualification questions in the order the Inbound Agent asks them, one cursor-paginated page at a time (at most 100). Owner, Admin and Manager."
  }),
  createQualificationQuestion: inboundRoute({
    method: "POST",
    path: "/v1/agent/questions",
    roles: AGENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["agent.question_invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Adds a Qualification question (at most 50), last unless a position is given. Skip logic may only look at earlier questions; a reference to an unknown question or a loop is agent.question_invalid (422). An Idempotency-Key header is accepted: a replay answers 200 with the original question. Owner and Admin only."
  }),
  getQualificationQuestion: inboundRoute({
    method: "GET",
    path: "/v1/agent/questions/{questionId}",
    roles: AGENT_READ_ROLES,
    success: [200],
    idempotent: false,
    errors: ["agent.question_not_found"],
    commonErrors: [],
    description: "Reads one Qualification question. Owner, Admin and Manager."
  }),
  updateQualificationQuestion: inboundRoute({
    method: "PATCH",
    path: "/v1/agent/questions/{questionId}",
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["agent.question_not_found", "agent.question_invalid"],
    commonErrors: ["request.invalid"],
    description: "Changes a Qualification question's prompt, kind, choices, required flag or skip logic; the same body again changes nothing. Past answers keep the wording they were given under. Owner and Admin only."
  }),
  deleteQualificationQuestion: inboundRoute({
    method: "DELETE",
    path: "/v1/agent/questions/{questionId}",
    roles: AGENT_ADMIN_ROLES,
    success: [204],
    idempotent: false,
    errors: ["agent.question_not_found", "agent.question_invalid"],
    commonErrors: [],
    description: "Removes a Qualification question. Skip logic in a later question that looks at it is agent.question_invalid (422) until that logic is changed. Answers already given are kept on their Inquiries. Owner and Admin only."
  }),
  reorderQualificationQuestions: inboundRoute({
    method: "PUT",
    path: "/v1/agent/question-order",
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ["agent.question_invalid", "agent.question_not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Sets the order of all Qualification questions by listing every id once, so a repeat changes nothing. A question whose skip logic would then look at a later one is agent.question_invalid (422). Owner and Admin only."
  }),
  suggestQualificationQuestions: inboundRoute({
    method: "POST",
    path: "/v1/agent/questions/suggestions",
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["agent.not_enough_deals"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Suggests up to 10 Qualification questions from what the Organization's won Deals have in common. It changes nothing: an Admin adds the ones they want. Needs enough won Deals, else agent.not_enough_deals (409). Requires an Idempotency-Key header: a replay answers the same suggestions without calling the model again. Owner and Admin only."
  }),
  startTrySession: inboundRoute({
    method: "POST",
    path: "/v1/agent/try-sessions",
    roles: AGENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Starts a text rehearsal of the Inbound Agent on the live settings and Playbook. No call is placed, no Prospect is created and nothing is sent. The first turn states that it is an AI. Requires an Idempotency-Key header: a replay answers the same session. Owner and Admin only."
  }),
  sendTryMessage: inboundRoute({
    method: "POST",
    path: "/v1/agent/try-sessions/{sessionId}/messages",
    roles: AGENT_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["agent.session_not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Says something to the Inbound Agent in a try-it session and answers its reply turn with the Playbook passages it used. Requires an Idempotency-Key header: a replay answers the original reply and does not ask the model again. An unknown or expired session is agent.session_not_found (404). Owner and Admin only."
  }),
  listAgentTurns: inboundRoute({
    method: "GET",
    path: "/v1/calls/{callId}/agent-turns",
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists the turns of an Inbound Agent Call, oldest first, one cursor-paginated page at a time (at most 100), with the Playbook passages each answer used. A Rep sees only Calls handed to them; a Manager those of their Team; an Owner or Admin all. A Call outside the caller's view, or one the Agent did not take, is call.not_found (404)."
  }),
  listHandoffs: inboundRoute({
    method: "GET",
    path: "/v1/handoffs",
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Handoffs, latest first, one cursor-paginated page at a time (at most 100), optionally by state. ${HANDOFF_VISIBILITY}`
  }),
  getHandoff: inboundRoute({
    method: "GET",
    path: "/v1/handoffs/{handoffId}",
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["handoff.not_found"],
    commonErrors: [],
    description: `Reads one Handoff with the context the Rep needs before answering: the Prospect, the Qualification so far and the last 20 turns, without the Prospect's email or number. ${HANDOFF_VISIBILITY}`
  }),
  acceptHandoff: inboundRoute({
    method: "POST",
    path: "/v1/handoffs/{handoffId}/accept",
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["handoff.not_found", "handoff.not_pending"],
    commonErrors: [],
    description: "The Rep the Handoff is offered to takes it and the Prospect is bridged. Repeating it as the same Rep after it was accepted answers 200 with the same Handoff; if another Rep took it, it timed out or it was declined, it is handoff.not_pending (409). When no Rep takes a Handoff, handoff.no_rep_available is what the Agent reports to the Prospect and a Booking is offered. The Rep is the token's: the body names no one."
  }),
  declineHandoff: inboundRoute({
    method: "POST",
    path: "/v1/handoffs/{handoffId}/decline",
    roles: AGENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["handoff.not_found", "handoff.not_pending"],
    commonErrors: [],
    description: "The Rep the Handoff is offered to declines it and it passes to the next Rep. Repeating it as the same Rep after it was declined answers 200 with the same Handoff; if it is no longer pending for any other reason it is handoff.not_pending (409). The Rep is the token's: the body names no one."
  })
});
// src/agent/settings.ts
import { z as z23 } from "zod";

// src/booking/calendar.ts
import { z as z22 } from "zod";

// src/booking/values.ts
import { z as z21 } from "zod";
var CALENDAR_PROVIDERS = ["google"];
var calendarProviderSchema = z21.enum(CALENDAR_PROVIDERS);
var CALENDAR_CONNECTION_STATES = ["healthy", "needs_reconnect"];
var calendarConnectionStateSchema = z21.enum(CALENDAR_CONNECTION_STATES);
var BOOKING_MODES = ["phone", "video"];
var bookingModeSchema = z21.enum(BOOKING_MODES);
var BOOKING_STATES = ["pending", "confirmed", "cancelled"];
var bookingStateSchema = z21.enum(BOOKING_STATES);
var BOOKING_ORIGINS = ["member", "agent", "public"];
var bookingOriginSchema = z21.enum(BOOKING_ORIGINS);
var BOOKING_TYPE_STATES = ["active", "retired"];
var bookingTypeStateSchema = z21.enum(BOOKING_TYPE_STATES);
var MAX_SLOT_RANGE_DAYS = 14;
var MAX_ELIGIBLE_REPS = 20;
var MAX_BOOKING_NAME_LENGTH = 100;
var bookingNameSchema = boundedTextSchema(MAX_BOOKING_NAME_LENGTH);
var timeZoneSchema = z21.string().max(64).regex(/^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+){0,2}$/);
var joinUrlSchema = z21.string().max(2048).regex(/^https:\/\/[^\s]+$/);
var bookingLinkTokenSchema = z21.string().regex(/^[A-Za-z0-9_-]{32,64}$/);

// src/booking/calendar.ts
var startCalendarConnectionRequestSchema = z22.strictObject({
  provider: calendarProviderSchema
});
var startCalendarConnectionResponseSchema = z22.strictObject({
  authorizationUrl: z22.url().max(2048),
  state: z22.string().min(1).max(512)
});
var completeCalendarConnectionRequestSchema = z22.strictObject({
  state: z22.string().min(1).max(512),
  code: z22.string().min(1).max(2048)
});
var calendarConnectionSchema = z22.strictObject({
  membershipId: membershipIdSchema,
  provider: calendarProviderSchema,
  state: calendarConnectionStateSchema,
  connectedAt: timestampSchema,
  lastCheckedAt: timestampSchema.nullable()
});
var WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
var weekdaySchema = z22.enum(WEEKDAYS);
var MAX_WINDOWS_PER_DAY = 4;
var timeOfDaySchema = z22.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/);
var workingWindowSchema = z22.strictObject({ start: timeOfDaySchema, end: timeOfDaySchema }).refine((window) => window.start < window.end, { message: "A window ends after it starts" });
var workingDaySchema = z22.strictObject({
  day: weekdaySchema,
  windows: z22.array(workingWindowSchema).min(1).max(MAX_WINDOWS_PER_DAY)
}).refine((day) => day.windows.every((window, i) => i === 0 || window.start >= (day.windows[i - 1]?.end ?? "")), { message: "Windows are in order and do not overlap", path: ["windows"] });
var MAX_DAILY_BOOKING_CAP = 50;
var MAX_AWAY_DAYS = 365;
var availabilitySchema = z22.strictObject({
  timeZone: timeZoneSchema,
  hours: z22.array(workingDaySchema).max(7).refine((days) => new Set(days.map((d) => d.day)).size === days.length, {
    message: "Each day appears once"
  }),
  dailyCap: z22.number().int().min(1).max(MAX_DAILY_BOOKING_CAP).nullable(),
  awayUntil: timestampSchema.nullable()
});

// src/agent/settings.ts
var minutesOf = (time) => {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
};
var hoursSchema = z23.array(workingDaySchema).min(1).max(7).refine((days) => days.every((d) => d.windows.every((w) => minutesOf(w.start) >= AGENT_CALLING_WINDOW.startHour * 60 && minutesOf(w.end) <= AGENT_CALLING_WINDOW.endHour * 60)), { message: "Hours lie within the fixed calling window" }).refine((days) => new Set(days.map((d) => d.day)).size === days.length, {
  message: "Each day appears once"
});
var setAgentSettingsRequestSchema = z23.strictObject({
  paused: z23.boolean(),
  greeting: boundedTextSchema(MAX_AGENT_GREETING_LENGTH),
  voiceStyle: agentVoiceStyleSchema,
  timeZone: timeZoneSchema,
  hours: hoursSchema,
  maxCallSeconds: z23.number().int().min(30).max(MAX_AGENT_CALL_SECONDS),
  maxCostUsdCents: z23.number().int().min(1).max(MAX_AGENT_CALL_COST_USD_CENTS),
  concurrencyCap: z23.number().int().min(1).max(MAX_AGENT_CONCURRENCY)
});
var agentSettingsSchema = setAgentSettingsRequestSchema.extend({
  languages: z23.array(agentLanguageSchema).min(1).max(1),
  updatedAt: timestampSchema,
  updatedByMembershipId: membershipIdSchema.nullable()
});
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
    },
    already_member: {
      status: 409,
      message: "The invitee is already a member of this Organization."
    },
    pending_limit: {
      status: 409,
      message: "This Organization has too many pending invitations. Revoke some to send more."
    },
    daily_limit: {
      status: 429,
      message: "This Organization has sent too many invitations today. Try again later."
    }
  }),
  ...defineErrors("team", {
    not_found: { status: 404, message: "The Team was not found." },
    name_taken: { status: 409, message: "A Team with that name already exists." }
  })
};
var DAILY_LIMIT_DETAILS_SCHEMA = retryAfterDetailsSchema;
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
  ...defineErrors("oidc", {
    disabled: { status: 404, message: "Sign in with Google is not available." },
    state_invalid: {
      status: 400,
      message: "This sign-in has expired or is not valid. Start again."
    },
    email_unverified: { status: 403, message: "Google has not verified this email address." },
    access_denied: { status: 400, message: "Sign in with Google was cancelled." },
    provider_unavailable: {
      status: 503,
      message: "Google is not available right now. Try again later."
    },
    invitation_mismatch: {
      status: 403,
      message: "Use the Google account that matches the invited email address."
    }
  }),
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
// src/auth/oidc.ts
import { z as z24 } from "zod";
var MAX_RETURN_TO_LENGTH = 512;
var MAX_AUTHORIZATION_URL_LENGTH = 2048;
function hasUnsafeCharacter(text) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code <= 31 || code >= 127 && code <= 159 || code === 1564 || code === 8206 || code === 8207 || code >= 8234 && code <= 8238 || code >= 8294 && code <= 8297) {
      return true;
    }
    if (code >= 55296 && code <= 56319) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 56320 && next <= 57343)) {
        return true;
      }
      index += 1;
    } else if (code >= 56320 && code <= 57343) {
      return true;
    }
  }
  return false;
}
var DOT_SEGMENTS = new Set([".", ".."]);
function isLocalPath(path, raw) {
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\") || path.includes("\\") || hasUnsafeCharacter(path)) {
    return false;
  }
  if (raw && /[\s\p{Cf}]/u.test(path)) {
    return false;
  }
  return !path.split(/[?#]/)[0]?.split("/").some((segment) => DOT_SEGMENTS.has(segment));
}
var returnToSchema = z24.string().refine((path) => path.length <= MAX_RETURN_TO_LENGTH, "Within the length limit").refine((path) => isLocalPath(path, true), "A path on this site").refine((path) => {
  try {
    return isLocalPath(decodeURIComponent(path), false);
  } catch {
    return false;
  }
}, "A path on this site");
var googleIntentSchema = z24.enum(["sign_in", "sign_up"]);
var googleStartRequestSchema = z24.strictObject({
  intent: googleIntentSchema,
  returnTo: returnToSchema.optional()
});
function isLoopbackHost(hostname) {
  if (hostname === "localhost" || hostname === "[::1]") {
    return true;
  }
  const octets = /^127\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  return octets !== null && octets.slice(1).every((octet) => Number(octet) <= 255);
}
function isAuthorizationUrl(text) {
  if (hasUnsafeCharacter(text) || text !== text.trim()) {
    return false;
  }
  let url;
  try {
    url = new URL(text);
  } catch {
    return false;
  }
  if (url.username !== "" || url.password !== "") {
    return false;
  }
  return url.protocol === "https:" || url.protocol === "http:" && isLoopbackHost(url.hostname);
}
var authorizationUrlSchema = z24.string().max(MAX_AUTHORIZATION_URL_LENGTH).refine(isAuthorizationUrl, "An https URL, or http to a loopback host");
var googleStartResponseSchema = z24.strictObject({
  authorizationUrl: authorizationUrlSchema
});
var attemptIdSchema = z24.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
var GOOGLE_SIGN_UP_PATH = "/sign-up/google";
var GOOGLE_SIGN_UP_ATTEMPT_PARAM = "attempt";
var GOOGLE_ERROR_PATH = "/sign-in";
var GOOGLE_ERROR_PARAM = "error";
var OIDC_COOKIE_BASE_NAME = "tula_oidc";
var OIDC_COOKIE_SECURE_PREFIX = "__Secure-";
var googleSignUpQuerySchema = z24.strictObject({
  [GOOGLE_SIGN_UP_ATTEMPT_PARAM]: attemptIdSchema
});
var googleErrorQuerySchema = z24.strictObject({
  [GOOGLE_ERROR_PARAM]: errorCodeSchema
});
var storable = (text) => !text.includes(String.fromCharCode(0)) && !hasUnsafeCharacter(text);
var googleCompleteRequestSchema = z24.strictObject({
  attemptId: attemptIdSchema,
  organizationName: z24.string().trim().min(1).max(120).refine(storable, "Storable text").optional(),
  invitationToken: z24.string().min(1).max(512).refine(storable, "Storable text").optional()
}).refine((body) => body.organizationName === undefined !== (body.invitationToken === undefined), {
  message: "Send exactly one of organizationName and invitationToken.",
  path: ["organizationName"]
});
var browserSessionTokensSchema = z24.strictObject({
  sessionId: z24.string().min(1).max(128),
  accessToken: z24.string().min(1).max(4096),
  accessTokenExpiresAt: timestampSchema,
  organization: z24.strictObject({ id: z24.string().min(1).max(128), role: roleSchema }),
  userId: userIdSchema.optional()
});
var googleCompleteResponseSchema = z24.object({
  id: z24.string().min(1).max(128),
  kind: z24.enum(["sign_in", "sign_up"]),
  expiresAt: timestampSchema,
  step: z24.object({ status: z24.literal("complete") }),
  session: browserSessionTokensSchema
});
var authProvidersSchema = z24.object({ google: z24.boolean().default(false) });
var AUTH_OPTIONS_PATH = "/v1/client/auth-options";
var authOptionsResponseSchema = z24.object({
  providers: authProvidersSchema.default({ google: false })
});
var route4 = (definition) => Object.freeze(definition);
var AUTH_OPTIONS_ROUTE = route4({
  method: "GET",
  path: AUTH_OPTIONS_PATH,
  success: [200],
  errors: [],
  redirectErrors: [],
  commonErrors: ["rate.limited", "server.unavailable"],
  description: "Tells a client which sign-in providers are on, so the portal can hide the Continue with Google button when Google is not set up. The auth service owns this route; it is a new route, not a change to an existing one. It needs no session and returns nothing about any account."
});
var GOOGLE_ROUTES = Object.freeze({
  start: route4({
    method: "POST",
    path: "/v1/client/google/start",
    success: [200],
    errors: ["oidc.disabled", "oidc.provider_unavailable"],
    redirectErrors: [],
    commonErrors: ["request.invalid", "rate.limited", "server.unavailable"],
    description: "Starts a Sign in with Google with an intent (sign_in or sign_up) and an optional same-origin returnTo path. It runs the OpenID Connect authorization-code flow with PKCE (S256), a state and a nonce, keeps them in an attempt that lives 10 minutes, sets a short-lived attempt cookie (named tula_oidc, with the __Secure- prefix outside local only, because Safari refuses a __Secure- cookie over http even on loopback) that holds the attempt secret, and answers the authorizationUrl to send the browser to (https, or http to a loopback host in local development; a consumer also checks its host against an allow-list). It asks for openid, email and profile only, with no offline access. The returnTo is checked against the portal route allow-list and kept in the attempt; it is never read from the callback. oidc.disabled (404) when Google is not set up; oidc.provider_unavailable (503) with a Retry-After header when Google cannot be reached."
  }),
  callback: route4({
    method: "GET",
    path: "/v1/client/google/callback",
    success: [302],
    errors: ["oidc.disabled"],
    redirectErrors: [
      "oidc.state_invalid",
      "oidc.email_unverified",
      "oidc.access_denied",
      "oidc.provider_unavailable",
      "auth.user_banned",
      "auth.no_organization",
      "organization.deleted",
      "membership.unavailable"
    ],
    commonErrors: ["rate.limited", "server.unavailable"],
    description: "Where Google sends the browser back, with a code and a state (or an error). The state must match the attempt cookie and the attempt is single-use; a replayed, expired or mismatched state is oidc.state_invalid. If the person cancels at Google (error=access_denied) the code is oidc.access_denied, and any other error from Google is oidc.provider_unavailable. The code is exchanged once, with the PKCE verifier, and the ID token is verified (RS256 only, issuer, audience, expiry, nonce, a present sub and email, and a verified email). A Google account that is already known, by its sub and never by its email, is signed in with the same checks as a password sign-in, and the answer is a 302 to the portal with the refresh cookie on it. No token appears in a URL. A new Google user is created by nothing here: the 302 goes to /sign-up/google?attempt=<id> and the person finishes with complete. An existing password account with the same email is linked only when Google verified the email, else oidc.email_unverified. It answers every outcome with a 302 except oidc.disabled (404): a failure redirects the browser to /sign-in?error=<code>, so oidc.state_invalid, oidc.email_unverified, oidc.access_denied, oidc.provider_unavailable (whose catalogue status is 503, with a Retry-After header only where it is a real response), auth.user_banned, auth.no_organization, organization.deleted and membership.unavailable come back as the error parameter of that redirect, and the catalogue status of a code is not the HTTP status of this response. Codes, tokens and Authorization headers are never logged."
  }),
  complete: route4({
    method: "POST",
    path: "/v1/client/google/complete",
    success: [200],
    errors: [
      "oidc.disabled",
      "oidc.state_invalid",
      "oidc.invitation_mismatch",
      "oidc.provider_unavailable",
      "signup.invitation_invalid",
      "signup.organization_name_invalid",
      "membership.already_member",
      "auth.no_organization",
      "organization.deleted",
      "membership.unavailable"
    ],
    redirectErrors: [],
    commonErrors: ["request.invalid", "rate.limited", "server.unavailable"],
    description: "Finishes the sign-up of a new Google user: it takes the attempt id (the secret is in the cookie) and exactly one of an organizationName or an invitationToken. It creates the Organization or joins the invited one through the same sign-up path as an email sign-up, with no emailed code because Google verified the email, and stores the user and a google identity with no password. For an invitation the Google email must equal the invited address, else oidc.invitation_mismatch (403); a user who already belongs to an Organization gets membership.already_member (409). An attempt that is missing, used or expired is oidc.state_invalid (400). An attempt is single-use. A repeat is refused with oidc.state_invalid (400) and nothing is created twice. Answers the browser flow response (id, kind, expiresAt, a complete step and the session); the refresh token is in the cookie, never in the body. The attempt secret, tokens and the email are never logged."
  })
});
// src/booking/booking.ts
import { z as z25 } from "zod";
var DAY_MS = 86400000;
var withinRange = (query) => {
  const span = Date.parse(query.to) - Date.parse(query.from);
  return span > 0 && span <= MAX_SLOT_RANGE_DAYS * DAY_MS;
};
var RANGE_MESSAGE = `The range is after its start and at most ${MAX_SLOT_RANGE_DAYS} days`;
var bookingSchema = z25.strictObject({
  id: bookingIdSchema,
  bookingTypeId: bookingTypeIdSchema,
  repMembershipId: membershipIdSchema,
  prospectId: prospectIdSchema,
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  mode: bookingModeSchema,
  state: bookingStateSchema,
  origin: bookingOriginSchema,
  joinUrl: joinUrlSchema.nullable(),
  routingDecisionId: routingDecisionIdSchema.nullable(),
  createdAt: timestampSchema,
  cancelledAt: timestampSchema.nullable()
}).refine((booking) => Date.parse(booking.endsAt) > Date.parse(booking.startsAt), {
  message: "A Booking ends after it starts",
  path: ["endsAt"]
}).refine((booking) => booking.state === "cancelled" === (booking.cancelledAt !== null), {
  message: "Only a cancelled Booking has a cancellation time",
  path: ["cancelledAt"]
}).refine((booking) => booking.mode === "video" || booking.joinUrl === null, {
  message: "Only a video Booking has a join link",
  path: ["joinUrl"]
});
var bookingParamsSchema = z25.strictObject({ bookingId: bookingIdSchema });
var listSlotsQuerySchema = pageQuerySchema.extend({
  bookingTypeId: bookingTypeIdSchema,
  prospectId: prospectIdSchema,
  from: timestampSchema,
  to: timestampSchema
}).strict().refine(withinRange, { message: RANGE_MESSAGE, path: ["to"] });
var slotSchema = z25.strictObject({
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  repMembershipId: membershipIdSchema
});
var slotPageSchema = pageSchema(slotSchema);
var bookHeadersSchema = z25.object({ "idempotency-key": idempotencyKeySchema });
var bookRequestSchema = z25.strictObject({
  bookingTypeId: bookingTypeIdSchema,
  prospectId: prospectIdSchema,
  startsAt: timestampSchema,
  repMembershipId: membershipIdSchema.optional()
});
var rescheduleBookingRequestSchema = z25.strictObject({ startsAt: timestampSchema });
var bookingCursorSchema = z25.strictObject({
  startsAt: timestampSchema,
  id: bookingIdSchema
});
var listBookingsQuerySchema = pageQuerySchema.extend({
  state: bookingStateSchema.optional(),
  repMembershipId: membershipIdSchema.optional(),
  prospectId: prospectIdSchema.optional(),
  from: timestampSchema.optional(),
  to: timestampSchema.optional()
}).strict().refine((q) => q.from === undefined || q.to === undefined || Date.parse(q.to) > Date.parse(q.from), {
  message: "The range ends after it starts",
  path: ["to"]
});
var bookingPageSchema = pageSchema(bookingSchema);
var publicBookingParamsSchema = z25.strictObject({ token: bookingLinkTokenSchema });
var publicListSlotsQuerySchema = pageQuerySchema.extend({ from: timestampSchema, to: timestampSchema }).strict().refine(withinRange, { message: RANGE_MESSAGE, path: ["to"] });
var publicSlotSchema = z25.strictObject({
  startsAt: timestampSchema,
  endsAt: timestampSchema
});
var publicBookingTypeSchema = z25.strictObject({
  name: z25.string().min(1).max(100),
  lengthMinutes: z25.number().int().min(5).max(480),
  mode: bookingModeSchema
});
var publicSlotPageSchema = pageSchema(publicSlotSchema).extend({
  bookingType: publicBookingTypeSchema
});
var MAX_PUBLIC_BOOKING_FIELD_LENGTH = 200;
var publicBookRequestSchema = z25.strictObject({
  name: personNameSchema,
  email: emailSchema,
  startsAt: timestampSchema,
  timeZone: timeZoneSchema,
  website: z25.string().max(MAX_PUBLIC_BOOKING_FIELD_LENGTH).default("")
});
var publicBookingConfirmationSchema = z25.strictObject({
  id: bookingIdSchema,
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  mode: bookingModeSchema,
  joinUrl: joinUrlSchema.nullable()
});
// src/booking/booking-type.ts
import { z as z26 } from "zod";
var MAX_BOOKING_LENGTH_MINUTES = 480;
var MAX_BOOKING_BUFFER_MINUTES = 120;
var MAX_BOOKING_NOTICE_MINUTES = 43200;
var bookingTypeFields = {
  name: bookingNameSchema,
  lengthMinutes: z26.number().int().min(5).max(MAX_BOOKING_LENGTH_MINUTES),
  bufferBeforeMinutes: z26.number().int().min(0).max(MAX_BOOKING_BUFFER_MINUTES),
  bufferAfterMinutes: z26.number().int().min(0).max(MAX_BOOKING_BUFFER_MINUTES),
  minimumNoticeMinutes: z26.number().int().min(0).max(MAX_BOOKING_NOTICE_MINUTES),
  mode: bookingModeSchema
};
var bookingTypeSchema = z26.strictObject({
  id: bookingTypeIdSchema,
  ...bookingTypeFields,
  state: bookingTypeStateSchema,
  publicToken: bookingLinkTokenSchema.nullable(),
  createdAt: timestampSchema
});
var createBookingTypeRequestSchema = z26.strictObject(bookingTypeFields);
var updateBookingTypeRequestSchema = z26.strictObject({
  name: bookingTypeFields.name.optional(),
  lengthMinutes: bookingTypeFields.lengthMinutes.optional(),
  bufferBeforeMinutes: bookingTypeFields.bufferBeforeMinutes.optional(),
  bufferAfterMinutes: bookingTypeFields.bufferAfterMinutes.optional(),
  minimumNoticeMinutes: bookingTypeFields.minimumNoticeMinutes.optional(),
  mode: bookingTypeFields.mode.optional()
}).refine((body) => Object.values(body).some((v) => v !== undefined), {
  message: "Change at least one field"
});
var bookingTypeParamsSchema = z26.strictObject({ bookingTypeId: bookingTypeIdSchema });
var bookingTypeCursorSchema = z26.strictObject({
  createdAt: timestampSchema,
  id: bookingTypeIdSchema
});
var listBookingTypesQuerySchema = pageQuerySchema.extend({ state: bookingTypeStateSchema.optional() }).strict();
// src/booking/errors.ts
var BOOKING_ERRORS = {
  ...defineErrors("booking", {
    slot_taken: { status: 409, message: "That time was just taken. Pick another." },
    calendar_unavailable: {
      status: 503,
      message: "The calendar is not available right now. Try again shortly."
    },
    no_eligible_rep: { status: 409, message: "No Rep is available for this Prospect." },
    slot_invalid: { status: 422, message: "That time cannot be booked." },
    type_invalid: { status: 422, message: "The Booking Type is not valid." },
    type_not_found: { status: 404, message: "The Booking Type was not found." },
    not_found: { status: 404, message: "The Booking was not found." },
    not_active: { status: 409, message: "The Booking was cancelled." }
  }),
  ...defineErrors("routing", {
    rule_invalid: { status: 422, message: "The Routing Rule is not valid." },
    rule_not_found: { status: 404, message: "The Routing Rule was not found." }
  }),
  ...defineErrors("calendar", {
    not_connected: { status: 404, message: "No calendar is connected." },
    authorization_failed: {
      status: 422,
      message: "The calendar could not be connected. Start again."
    },
    hours_invalid: { status: 422, message: "The working hours are not valid." }
  })
};
// src/booking/events.ts
import { z as z27 } from "zod";
var ordered = (data) => Date.parse(data.endsAt) > Date.parse(data.startsAt);
var ORDER_ISSUE = { message: "A Booking ends after it starts", path: ["endsAt"] };
var bookingCreatedEvent = defineEvent("booking.created", 1, z27.strictObject({
  bookingId: bookingIdSchema,
  bookingTypeId: bookingTypeIdSchema,
  repMembershipId: membershipIdSchema,
  prospectId: prospectIdSchema,
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  mode: bookingModeSchema,
  origin: bookingOriginSchema,
  routingDecisionId: routingDecisionIdSchema.nullable()
}).refine(ordered, ORDER_ISSUE));
var BOOKING_CANCELLED_BY = ["member", "prospect", "system"];
var bookingCancelledBySchema = z27.enum(BOOKING_CANCELLED_BY);
var bookingCancelledEvent = defineEvent("booking.cancelled", 1, z27.strictObject({
  bookingId: bookingIdSchema,
  bookingTypeId: bookingTypeIdSchema,
  repMembershipId: membershipIdSchema,
  prospectId: prospectIdSchema,
  startsAt: timestampSchema,
  endsAt: timestampSchema,
  cancelledBy: bookingCancelledBySchema,
  cancelledAt: timestampSchema
}).refine(ordered, ORDER_ISSUE));
var bookingRescheduledEvent = defineEvent("booking.rescheduled", 1, z27.strictObject({
  bookingId: bookingIdSchema,
  bookingTypeId: bookingTypeIdSchema,
  repMembershipId: membershipIdSchema,
  prospectId: prospectIdSchema,
  previousStartsAt: timestampSchema,
  startsAt: timestampSchema,
  endsAt: timestampSchema
}).refine(ordered, ORDER_ISSUE));
var BOOKING_EVENTS = {
  "booking.created": bookingCreatedEvent,
  "booking.cancelled": bookingCancelledEvent,
  "booking.rescheduled": bookingRescheduledEvent
};
// src/booking/routes.ts
var BOOKING_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var BOOKING_ADMIN_ROLES = ["owner", "admin"];
var ROUTING_ROLES = ["owner", "admin", "manager"];
var route5 = (definition) => Object.freeze(definition);
var IDEMPOTENT_ERRORS2 = [
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var PUBLIC_ERRORS2 = [
  "request.too_large",
  "request.unsupported_media_type",
  "request.invalid",
  "rate.limited",
  "server.internal",
  "server.unavailable",
  "server.timeout"
];
var BOOKING_VISIBILITY = "Visibility is decided from the token: a Rep sees the Bookings they take, a Manager those of the Reps on their Team, Owner and Admin every Booking; anything else is booking.not_found (404), as is a Booking of another Organization.";
var RULE_ROLES = "A Manager may change only rules whose target is a Rep or Team they manage, or a pool of such Reps; any other rule is routing.rule_not_found (404). A rule of another Organization is routing.rule_not_found.";
var BOOKING_ROUTES = Object.freeze({
  startCalendarConnection: route5({
    method: "POST",
    path: "/v1/calendar-connection/start",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Starts connecting the caller's own calendar and answers the vendor's consent URL and a one-time state. The redirect address is core's own and never comes from the request. A caller connects only their own calendar; there is no route to connect another member's."
  }),
  completeCalendarConnection: route5({
    method: "POST",
    path: "/v1/calendar-connection/complete",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["calendar.authorization_failed"],
    commonErrors: ["request.invalid"],
    description: "Completes the caller's Calendar Connection with the state and the one-time code the vendor returned. The tokens are stored encrypted and are never returned or logged. A refused grant or a wrong or expired state is calendar.authorization_failed (422). Answers the connection, healthy."
  }),
  getCalendarConnection: route5({
    method: "GET",
    path: "/v1/calendar-connection",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["calendar.not_connected"],
    commonErrors: [],
    description: "Reads the caller's own Calendar Connection: healthy, or needs_reconnect when the grant was revoked. No token is returned. A caller with no connection gets calendar.not_connected (404); no route reads another member's connection."
  }),
  disconnectCalendarConnection: route5({
    method: "DELETE",
    path: "/v1/calendar-connection",
    roles: BOOKING_ALL_ROLES,
    success: [204],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Disconnects the caller's own calendar: the grant is revoked and the stored tokens are deleted. Idempotent by end state: disconnecting a calendar that is not connected answers 204 as well. Future Bookings on the calendar stay."
  }),
  getAvailability: route5({
    method: "GET",
    path: "/v1/availability",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the caller's own availability: time zone, working hours, daily cap and away-until time."
  }),
  setAvailability: route5({
    method: "PUT",
    path: "/v1/availability",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["calendar.hours_invalid"],
    commonErrors: ["request.invalid"],
    description: "Replaces the caller's own availability. An unknown time zone is calendar.hours_invalid (422). Setting what is already set answers 200 unchanged. A caller sets only their own; an Admin cannot set another member's."
  }),
  listBookingTypes: route5({
    method: "GET",
    path: "/v1/booking-types",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Booking Types, one cursor-paginated page at a time (at most 100); optionally one state. Every role may read them. The public token is shown to Owner and Admin only and is null for everyone else."
  }),
  createBookingType: route5({
    method: "POST",
    path: "/v1/booking-types",
    roles: BOOKING_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["booking.type_invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS2],
    description: "Creates a Booking Type: name, length (5 to 480 minutes), buffers, minimum notice and mode (phone or video). Core makes the unguessable public token. A length, buffer or notice core refuses is booking.type_invalid (422). Owner and Admin only. Answers 201, or 200 with the original Booking Type for a replay of the same Idempotency-Key."
  }),
  getBookingType: route5({
    method: "GET",
    path: "/v1/booking-types/{bookingTypeId}",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["booking.type_not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Booking Type. The public token is shown to Owner and Admin only. A Booking Type of another Organization is booking.type_not_found (404)."
  }),
  updateBookingType: route5({
    method: "PATCH",
    path: "/v1/booking-types/{bookingTypeId}",
    roles: BOOKING_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["booking.type_not_found", "booking.type_invalid"],
    commonErrors: ["request.invalid"],
    description: "Changes any of the fields of a Booking Type; at least one. Bookings already made keep their time. Owner and Admin only."
  }),
  retireBookingType: route5({
    method: "POST",
    path: "/v1/booking-types/{bookingTypeId}/retire",
    roles: BOOKING_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["booking.type_not_found"],
    commonErrors: ["request.invalid"],
    description: "Retires a Booking Type: it can no longer be booked and its public link stops answering, but its Bookings stay. Idempotent by end state: retiring a retired Booking Type answers 200 with it. Takes no body. Owner and Admin only."
  }),
  listRoutingRules: route5({
    method: "GET",
    path: "/v1/routing-rules",
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Routing Rules in the order they are tried, one cursor-paginated page at a time (at most 100). Owner, Admin and Manager; a Manager sees every rule but may change only those that target their own Team."
  }),
  createRoutingRule: route5({
    method: "POST",
    path: "/v1/routing-rules",
    roles: ROUTING_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["routing.rule_invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS2],
    description: `Creates a Routing Rule: conditions (country, region, company size band, named-account owner, source, Booking Type), and a target of one Rep, a Team in round-robin or a pool of 2 to 20 Reps. It goes last, before the default rule if there is one. A target, Rep or Booking Type that is not in the Organization, a target that is not a Rep, or a second default rule is routing.rule_invalid (422). ${RULE_ROLES} Answers 201, or 200 with the original rule for a replay of the same Idempotency-Key.`
  }),
  getRoutingRule: route5({
    method: "GET",
    path: "/v1/routing-rules/{ruleId}",
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: ["routing.rule_not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Routing Rule. A rule of another Organization is routing.rule_not_found (404)."
  }),
  updateRoutingRule: route5({
    method: "PUT",
    path: "/v1/routing-rules/{ruleId}",
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: ["routing.rule_not_found", "routing.rule_invalid"],
    commonErrors: ["request.invalid"],
    description: `Replaces a Routing Rule's name, conditions, target and default flag; its place in the order stays. ${RULE_ROLES} A change that makes the rule invalid is routing.rule_invalid (422).`
  }),
  deleteRoutingRule: route5({
    method: "DELETE",
    path: "/v1/routing-rules/{ruleId}",
    roles: ROUTING_ROLES,
    success: [204],
    idempotent: false,
    errors: ["routing.rule_not_found"],
    commonErrors: ["request.invalid"],
    description: `Deletes a Routing Rule; decisions already stored keep naming it. Idempotent by end state for a rule the caller may change: deleting a rule already gone answers 204. ${RULE_ROLES}`
  }),
  reorderRoutingRules: route5({
    method: "POST",
    path: "/v1/routing-rules/reorder",
    roles: BOOKING_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["routing.rule_invalid"],
    commonErrors: ["request.invalid"],
    description: "Sets the order of every Routing Rule from a list of all their ids, once each, first to last. A list that misses a rule, names an unknown one or puts the default rule anywhere but last is routing.rule_invalid (422). Answers 200 with the first page of rules in the new order. Owner and Admin only."
  }),
  testRouting: route5({
    method: "POST",
    path: "/v1/routing-rules/test",
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Tests the Routing Rules with a sample Prospect (its country, region, company size band, account owner and source) and optionally a Booking Type. Answers which rule wins, the candidate Reps in order with a reason each, and the Reps skipped with why. Nothing is stored, no round-robin state advances and nobody is notified; the answer has no decision id."
  }),
  route: route5({
    method: "POST",
    path: "/v1/routing/route",
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Routes a Prospect: reads its attributes and answers the ordered candidate Reps with a reason each, and the Reps skipped (off shift, on leave, at the daily cap, calendar not connected or needing reconnection) with why. The decision is stored and its id answered. Also gives a Handoff its live-transfer candidates in order. A prospectId the caller may not see is prospect.not_found. An empty candidate list is a 200; booking answers booking.no_eligible_rep."
  }),
  listSlots: route5({
    method: "GET",
    path: "/v1/booking-slots",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["booking.type_not_found", "booking.no_eligible_rep", "prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists free times for a Booking Type and a Prospect, earliest first, one cursor-paginated page at a time (at most 100). The range is at most 14 days and at most 20 Reps are considered. Each time names the Rep who would take it. Times are read from stored busy blocks, working hours and Bookings; the live calendar is not called. Routing finding nobody is booking.no_eligible_rep (409). This is also the route the Inbound Agent uses."
  }),
  book: route5({
    method: "POST",
    path: "/v1/bookings",
    roles: BOOKING_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "booking.slot_taken",
      "booking.calendar_unavailable",
      "booking.no_eligible_rep",
      "booking.slot_invalid",
      "booking.type_not_found",
      "prospect.not_found"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS2],
    description: "Books a time for a Prospect. The Idempotency-Key header is required (a request without it is request.invalid): a retry of the same key answers the original Booking and writes the calendar once; the same key with another body is request.idempotency_key_reused. Core locks the Rep's slot, re-checks the live calendar, stores the Booking pending, writes the event and confirms it. A time taken meanwhile is booking.slot_taken (409); a calendar that cannot be read or written in time is booking.calendar_unavailable (503) with the Booking removed and nothing half-written, and a retry with the same key is safe; routing finding nobody is booking.no_eligible_rep (409); a start in the past, inside the minimum notice or past 14 days is booking.slot_invalid (422). Publishes booking.created. Answers 201, or 200 for a replay."
  }),
  listBookings: route5({
    method: "GET",
    path: "/v1/bookings",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Bookings, latest start first, one cursor-paginated page at a time (at most 100). Filters: state, repMembershipId, prospectId and a start range. ${BOOKING_VISIBILITY} A filter can narrow what the caller sees, never widen it.`
  }),
  getBooking: route5({
    method: "GET",
    path: "/v1/bookings/{bookingId}",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["booking.not_found"],
    commonErrors: ["request.invalid"],
    description: `Reads one Booking. ${BOOKING_VISIBILITY}`
  }),
  getBookingRouting: route5({
    method: "GET",
    path: "/v1/bookings/{bookingId}/routing",
    roles: ROUTING_ROLES,
    success: [200],
    idempotent: false,
    errors: ["booking.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads why a Booking went to its Rep: the rule that matched, the candidates and who was skipped and why. Owner and Admin for every Booking, a Manager for their Team's; anything else is booking.not_found (404)."
  }),
  rescheduleBooking: route5({
    method: "POST",
    path: "/v1/bookings/{bookingId}/reschedule",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [
      "booking.not_found",
      "booking.not_active",
      "booking.slot_taken",
      "booking.calendar_unavailable",
      "booking.slot_invalid"
    ],
    commonErrors: ["request.invalid"],
    description: `Moves a Booking to another start time with the same Rep; the length stays. Idempotent by end state: asking for the time it already has answers 200 with it. A cancelled Booking is booking.not_active (409); a taken time is booking.slot_taken (409); the calendar failing is booking.calendar_unavailable (503) and the Booking keeps its old time. Publishes booking.rescheduled. ${BOOKING_VISIBILITY}`
  }),
  cancelBooking: route5({
    method: "POST",
    path: "/v1/bookings/{bookingId}/cancel",
    roles: BOOKING_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["booking.not_found", "booking.calendar_unavailable"],
    commonErrors: ["request.invalid"],
    description: `Cancels a Booking and removes its calendar event. Idempotent by end state: cancelling a cancelled Booking answers 200 with it and publishes nothing. Takes no body. A calendar that cannot be written is booking.calendar_unavailable (503) and the Booking stays confirmed. Publishes booking.cancelled. ${BOOKING_VISIBILITY}`
  }),
  publicListSlots: route5({
    method: "GET",
    path: "/v1/public/booking-types/{token}/slots",
    roles: [],
    public: true,
    success: [200],
    idempotent: false,
    errors: ["booking.type_not_found", "booking.no_eligible_rep"],
    commonErrors: [...PUBLIC_ERRORS2],
    description: "Public: no token, no Organization; the Booking Type's unguessable token in the path stands in for both. Lists free times for that Booking Type, earliest first, one cursor-paginated page at a time (at most 100), over a range of at most 14 days, with the Booking Type's name, length and mode. A time is only a start and an end: never a Rep, an event title, an attendee or a busy block. An unknown, wrong or retired token is booking.type_not_found (404). Rate-limited by client address and by token (rate.limited, 429, with a Retry-After header). The token is a secret: services redact it from logs, traces and error reports."
  }),
  publicBook: route5({
    method: "POST",
    path: "/v1/public/booking-types/{token}/bookings",
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "booking.slot_taken",
      "booking.calendar_unavailable",
      "booking.no_eligible_rep",
      "booking.slot_invalid",
      "booking.type_not_found"
    ],
    commonErrors: [
      ...PUBLIC_ERRORS2,
      "request.idempotency_key_reused",
      "request.idempotency_in_progress"
    ],
    description: "Public: no token, no Organization; the Booking Type's unguessable token stands in for both. A Prospect books a time with their name, work email, the start and their time zone; core upserts the Prospect by email and routes it. Requires an Idempotency-Key header (16 to 128 characters; the client generates one per submission): a replay answers the original confirmation with 200 and writes the calendar once, the same key with another body is request.idempotency_key_reused, and the same key while the first request runs is request.idempotency_in_progress. Answers 201 with the id, the times, the mode and the join link, and no Rep or Prospect id. A time taken meanwhile is booking.slot_taken (409); a calendar that fails is booking.calendar_unavailable (503) with nothing half-written. A filled honeypot is answered exactly as a real request and stores nothing. Rate-limited by client address and by token (rate.limited, 429). The invitation to the Prospect is the calendar's own; Closeline sends no email. Publishes booking.created. The token in the path is a secret: services redact it from logs, traces and error reports. A 429 (rate.limited) carries a Retry-After header."
  })
});
// src/booking/routing.ts
import { z as z28 } from "zod";
var COMPANY_SIZE_BANDS = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1001-5000",
  "5001+"
];
var companySizeBandSchema = z28.enum(COMPANY_SIZE_BANDS);
var MAX_ROUTING_RULES = 200;
var MAX_CONDITION_VALUES = 50;
var MAX_REGION_LENGTH = 100;
var conditionList = (item, max = MAX_CONDITION_VALUES) => z28.array(item).min(1).max(max).refine((values) => new Set(values).size === values.length, "No duplicate values").optional();
var routingConditionsSchema = z28.strictObject({
  countries: conditionList(countryCodeSchema),
  regions: conditionList(boundedTextSchema(MAX_REGION_LENGTH)),
  companySizeBands: conditionList(companySizeBandSchema, COMPANY_SIZE_BANDS.length),
  accountOwnerMembershipIds: conditionList(membershipIdSchema),
  sources: conditionList(sourceKindSchema, 20),
  bookingTypeIds: conditionList(bookingTypeIdSchema, 20)
});
var routingTargetSchema = z28.discriminatedUnion("kind", [
  z28.strictObject({ kind: z28.literal("rep"), membershipId: membershipIdSchema }),
  z28.strictObject({ kind: z28.literal("team"), teamId: teamIdSchema }),
  z28.strictObject({
    kind: z28.literal("pool"),
    membershipIds: z28.array(membershipIdSchema).min(2).max(MAX_ELIGIBLE_REPS).refine((ids) => new Set(ids).size === ids.length, "No duplicate ids")
  })
]);
var hasCondition = (conditions) => Object.values(conditions).some((v) => v !== undefined);
var ruleFields = {
  name: bookingNameSchema,
  conditions: routingConditionsSchema,
  target: routingTargetSchema,
  isDefault: z28.boolean()
};
var defaultMatchesNoConditions = {
  check: (rule) => rule.isDefault === !hasCondition(rule.conditions),
  message: "The default rule has no conditions, and a rule with no conditions is the default"
};
var routingRuleSchema = z28.strictObject({
  id: routingRuleIdSchema,
  ...ruleFields,
  position: z28.number().int().min(1).max(MAX_ROUTING_RULES),
  createdAt: timestampSchema
}).refine(defaultMatchesNoConditions.check, { message: defaultMatchesNoConditions.message });
var createRoutingRuleRequestSchema = z28.strictObject(ruleFields).refine(defaultMatchesNoConditions.check, { message: defaultMatchesNoConditions.message });
var updateRoutingRuleRequestSchema = createRoutingRuleRequestSchema;
var routingRuleParamsSchema = z28.strictObject({ ruleId: routingRuleIdSchema });
var reorderRoutingRulesRequestSchema = z28.strictObject({
  ruleIds: z28.array(routingRuleIdSchema).min(1).max(MAX_ROUTING_RULES).refine((ids) => new Set(ids).size === ids.length, "No duplicate ids")
});
var listRoutingRulesQuerySchema = pageQuerySchema.strict();
var routingAttributesSchema = z28.strictObject({
  country: countryCodeSchema.nullable(),
  region: boundedTextSchema(MAX_REGION_LENGTH).nullable(),
  companySizeBand: companySizeBandSchema.nullable(),
  accountOwnerMembershipId: membershipIdSchema.nullable(),
  source: sourceKindSchema.nullable()
});
var routeRequestSchema = z28.strictObject({
  prospectId: prospectIdSchema,
  bookingTypeId: bookingTypeIdSchema.optional()
});
var testRoutingRequestSchema = z28.strictObject({
  attributes: routingAttributesSchema,
  bookingTypeId: bookingTypeIdSchema.optional()
});
var ROUTING_CANDIDATE_REASONS = [
  "named_rep",
  "round_robin_team",
  "round_robin_pool",
  "default_rule"
];
var routingCandidateReasonSchema = z28.enum(ROUTING_CANDIDATE_REASONS);
var ROUTING_SKIP_REASONS = [
  "off_shift",
  "on_leave",
  "daily_cap_reached",
  "calendar_not_connected",
  "needs_reconnect"
];
var routingSkipReasonSchema = z28.enum(ROUTING_SKIP_REASONS);
var routingResultSchema = z28.strictObject({
  decisionId: routingDecisionIdSchema.nullable(),
  matchedRuleId: routingRuleIdSchema.nullable(),
  candidates: z28.array(z28.strictObject({ membershipId: membershipIdSchema, reason: routingCandidateReasonSchema })).max(MAX_ELIGIBLE_REPS),
  skipped: z28.array(z28.strictObject({ membershipId: membershipIdSchema, reason: routingSkipReasonSchema })).max(MAX_ELIGIBLE_REPS),
  decidedAt: timestampSchema.nullable()
});
// src/chat/chat.ts
import { z as z30 } from "zod";

// src/inquiry/values.ts
import { z as z29 } from "zod";
var INQUIRY_SOURCES = ["form", "chat", "call"];
var inquirySourceSchema = z29.enum(INQUIRY_SOURCES);
var INQUIRY_CALLBACK_STATES = [
  "not_applicable",
  "pending",
  "dialling",
  "connected",
  "no_answer",
  "skipped",
  "failed"
];
var inquiryCallbackStateSchema = z29.enum(INQUIRY_CALLBACK_STATES);
var INQUIRY_SKIP_REASONS = [
  "agent_paused",
  "no_consent",
  "consent_revoked",
  "suppressed",
  "outside_hours",
  "consent_check_unavailable",
  "no_phone_number",
  "concurrency_cap",
  "retries_exhausted"
];
var inquirySkipReasonSchema = z29.enum(INQUIRY_SKIP_REASONS);
var MAX_CALLBACK_ATTEMPTS = 3;
var MAX_ALLOWED_ORIGINS = 20;
var allowedOriginSchema = z29.string().max(255).regex(/^(https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*(:[0-9]{1,5})?|http:\/\/(localhost|127\.0\.0\.1)(:[0-9]{1,5})?)$/);
var inquiryKeySchema = z29.string().regex(/^[A-Za-z0-9_-]{32,64}$/);
var MAX_SOURCE_URL_LENGTH = 2048;
var sourceUrlSchema = z29.string().max(MAX_SOURCE_URL_LENGTH).regex(/^https?:\/\/[^\s]+$/);
var MAX_INQUIRY_MESSAGE_LENGTH = 2000;
var inquiryMessageSchema = boundedTextSchema(MAX_INQUIRY_MESSAGE_LENGTH);
var MAX_HONEYPOT_LENGTH = 200;

// src/chat/chat.ts
var chatTextSchema = boundedTextSchema(MAX_TURN_TEXT_LENGTH);
var chatSessionTokenSchema = z30.string().regex(/^[A-Za-z0-9_-]{32,64}$/);
var CHAT_STATES = ["open", "handed_off", "closed"];
var chatStateSchema = z30.enum(CHAT_STATES);
var publicChatKeyParamsSchema = z30.strictObject({ key: inquiryKeySchema });
var publicChatSessionParamsSchema = z30.strictObject({
  sessionToken: chatSessionTokenSchema
});
var publicChatOriginHeadersSchema = z30.object({ origin: allowedOriginSchema });
var publicChatHeadersSchema = z30.object({
  origin: allowedOriginSchema,
  "idempotency-key": idempotencyKeySchema
});
var publicStartChatRequestSchema = z30.strictObject({
  sourceUrl: sourceUrlSchema,
  website: z30.string().max(MAX_HONEYPOT_LENGTH).default("")
});
var publicChatMessageSchema = z30.strictObject({
  index: z30.number().int().min(0),
  role: agentTurnRoleSchema,
  text: chatTextSchema,
  at: timestampSchema
});
var publicStartChatResponseSchema = z30.strictObject({
  sessionToken: chatSessionTokenSchema,
  expiresAt: timestampSchema,
  messages: z30.array(publicChatMessageSchema).min(1).max(5)
});
var publicSendChatMessageRequestSchema = z30.strictObject({ text: chatTextSchema });
var publicChatReplySchema = z30.strictObject({
  text: chatTextSchema,
  deferred: z30.boolean(),
  handoffOffered: z30.boolean(),
  at: timestampSchema
});
var publicChatMessageReplySchema = z30.strictObject({ reply: publicChatReplySchema });
var publicListChatMessagesQuerySchema = pageQuerySchema.strict();
var publicChatMessagePageSchema = pageSchema(publicChatMessageSchema);
var publicChatConsentRequestSchema = z30.strictObject({
  name: personNameSchema,
  phone: rawPhoneSchema,
  consentWordingId: consentWordingIdSchema,
  consentWordingVersion: z30.number().int().min(1),
  callbackConsent: z30.boolean(),
  sourceUrl: sourceUrlSchema
});
var publicChatConsentReceiptSchema = z30.strictObject({
  received: z30.literal(true),
  receivedAt: timestampSchema
});
var publicChatHandoffRequestSchema = z30.strictObject({});
var publicChatHandoffReplySchema = z30.strictObject({
  requested: z30.literal(true),
  at: timestampSchema
});
var chatParamsSchema = z30.strictObject({ chatId: chatIdSchema });
var chatSchema = z30.strictObject({
  id: chatIdSchema,
  prospectId: prospectIdSchema.nullable(),
  inquiryId: inquiryIdSchema.nullable(),
  state: chatStateSchema,
  sourceUrl: sourceUrlSchema,
  startedAt: timestampSchema,
  lastMessageAt: timestampSchema,
  closedAt: timestampSchema.nullable()
});
var chatMessageSchema = z30.strictObject({
  index: z30.number().int().min(0),
  role: agentTurnRoleSchema,
  text: chatTextSchema,
  sources: z30.array(copilotDocumentSourceSchema).max(MAX_TURN_SOURCES),
  deferred: z30.boolean(),
  at: timestampSchema
});
var listChatsQuerySchema = pageQuerySchema.extend({ state: chatStateSchema.optional() }).strict();
var chatPageSchema = pageSchema(chatSchema);
var listChatMessagesQuerySchema = pageQuerySchema.strict();
var chatMessagePageSchema = pageSchema(chatMessageSchema);
// src/chat/errors.ts
var CHAT_ERRORS = {
  ...defineErrors("chat", {
    origin_not_allowed: { status: 403, message: "This site is not allowed to start a Chat." },
    key_invalid: { status: 404, message: "The Chat was not found." },
    session_not_found: { status: 404, message: "The Chat session was not found." },
    session_closed: { status: 409, message: "This Chat has ended." },
    consent_wording_missing: {
      status: 422,
      message: "The consent wording shown with the Chat is missing or out of date."
    },
    not_found: { status: 404, message: "The Chat was not found." }
  })
};
// src/chat/routes.ts
var CHAT_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var VISIBILITY = "An Owner or Admin sees every Chat; a Manager sees those handed to Reps of their Team; a Rep sees only those handed to them. A Chat outside the caller's view is chat.not_found (404), never 403.";
var PUBLIC_SECRET = "The key or token in the path is a secret: services redact it from logs, traces and error reports. A 429 (rate.limited) carries a Retry-After header.";
var PUBLIC_REPLAY = ["request.idempotency_key_reused", "request.idempotency_in_progress"];
var CHAT_ROUTES = Object.freeze({
  publicStartChat: inboundRoute({
    method: "POST",
    path: "/v1/public/chat/{key}/sessions",
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: ["chat.origin_not_allowed", "chat.key_invalid"],
    commonErrors: [...PUBLIC_ERRORS, ...PUBLIC_REPLAY],
    description: `Public: no token, no Organization; the Organization's publishable key in the path stands in for both. Starts a Chat from the website widget with the page address. The Origin header must be an allowed origin (chat.origin_not_allowed, 403). Requires an Idempotency-Key header (16 to 128 characters; the client generates one per Chat): a replay answers the original session with 200 and starts one Chat. Answers 201 with a secret session token, its expiry and the opening message, which says the visitor is talking to an AI. No Chat, Prospect or Rep id. A visitor-started Chat needs no Contact Consent; only a callback does. A filled honeypot (website) is answered like an accepted start but stores nothing: the session token it returns is an unusable session token, and any later call with it is chat.session_not_found. Rate-limited by client address and by key. ${PUBLIC_SECRET}`
  }),
  publicSendChatMessage: inboundRoute({
    method: "POST",
    path: "/v1/public/chat/sessions/{sessionToken}/messages",
    roles: [],
    public: true,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["chat.origin_not_allowed", "chat.session_not_found", "chat.session_closed"],
    commonErrors: [...PUBLIC_ERRORS, ...PUBLIC_REPLAY],
    description: `Public: no token, no Organization; the session token in the path stands in for both. The visitor says something and gets the Inbound Agent's reply: its text, whether it deferred to a follow-up and whether it offered a Rep. Never a Playbook source, a tool call, or a Rep or internal id. Requires an Idempotency-Key header: a replay answers the original reply and does not ask the model again; the same key with another body is request.idempotency_key_reused. An unknown or expired token is chat.session_not_found (404) and an ended Chat is chat.session_closed (409). The Origin header must match an allowed origin. Rate-limited by client address and by session. ${PUBLIC_SECRET}`
  }),
  publicListChatMessages: inboundRoute({
    method: "GET",
    path: "/v1/public/chat/sessions/{sessionToken}/messages",
    roles: [],
    public: true,
    success: [200],
    idempotent: false,
    errors: ["chat.origin_not_allowed", "chat.session_not_found"],
    commonErrors: [...PUBLIC_ERRORS],
    description: `Public: no token, no Organization; the session token in the path stands in for both. Lists the messages of the visitor's own Chat, oldest first, one cursor-paginated page at a time (at most 100), so a reloaded page can show them again. Each is a role, text and time only. The Origin header must match an allowed origin. Rate-limited by client address and by session. ${PUBLIC_SECRET}`
  }),
  publicChatConsent: inboundRoute({
    method: "POST",
    path: "/v1/public/chat/sessions/{sessionToken}/callback-consent",
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "chat.origin_not_allowed",
      "chat.session_not_found",
      "chat.session_closed",
      "chat.consent_wording_missing"
    ],
    commonErrors: [...PUBLIC_ERRORS, ...PUBLIC_REPLAY],
    description: `Public: no token, no Organization; the session token in the path stands in for both. The visitor asks for a callback from inside the Chat with their name, phone number, the Consent Wording id and version shown, whether they agreed, and the page address. The wording version and page address are required; a version that is not the one shown is chat.consent_wording_missing (422) and nothing is recorded. Core upserts the Prospect, records the Contact Consent for the phone channel from the wording version, the page address and the time, and the Chat becomes an Inquiry; with the box unticked the details are kept and no call is placed. Requires an Idempotency-Key header: a replay answers the original receipt. Answers a receipt with no Inquiry, Prospect or Rep id. Publishes voice.inquiry.received. ${PUBLIC_SECRET}`
  }),
  publicRequestChatHandoff: inboundRoute({
    method: "POST",
    path: "/v1/public/chat/sessions/{sessionToken}/handoff",
    roles: [],
    public: true,
    success: [202, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "chat.origin_not_allowed",
      "chat.session_not_found",
      "chat.session_closed",
      "handoff.no_rep_available"
    ],
    commonErrors: [...PUBLIC_ERRORS, ...PUBLIC_REPLAY],
    description: `Public: no token, no Organization; the session token in the path stands in for both. The visitor asks to talk to a Rep. The Handoff is routed by the Organization's rules and answers 202 that a Rep was asked to join, with no Rep id or name. If no Rep is available it is handoff.no_rep_available (409) and the Inbound Agent offers a Booking in the Chat. Requires an Idempotency-Key header: a replay answers the original result and does not ask a second Rep. ${PUBLIC_SECRET}`
  }),
  listChats: inboundRoute({
    method: "GET",
    path: "/v1/chats",
    roles: CHAT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Chats, latest first, one cursor-paginated page at a time (at most 100), optionally by state (open, handed_off or closed). ${VISIBILITY}`
  }),
  getChat: inboundRoute({
    method: "GET",
    path: "/v1/chats/{chatId}",
    roles: CHAT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["chat.not_found"],
    commonErrors: [],
    description: `Reads one Chat: its state, the page it began on and the Prospect and Inquiry it led to, if any. ${VISIBILITY}`
  }),
  listChatMessages: inboundRoute({
    method: "GET",
    path: "/v1/chats/{chatId}/messages",
    roles: CHAT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["chat.not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists the messages of a Chat, oldest first, one cursor-paginated page at a time (at most 100), with the Playbook passages each Agent answer used. Message text is the visitor's own words and untrusted. ${VISIBILITY}`
  })
});
// src/consent/contact-check.ts
import { z as z31 } from "zod";
var CONTACT_DENIAL_CODES = [
  "consent.missing",
  "consent.withdrawn",
  "consent.suppressed",
  "consent.unavailable"
];
var contactDenialCodeSchema = z31.enum(CONTACT_DENIAL_CODES);
var CONTACT_ALLOW_BASES = [
  "consent_granted",
  "rep_initiated",
  "reply",
  "email_no_suppression"
];
var MAX_CALLER_LENGTH = 32;
var contactCheckRequestSchema = z31.strictObject({
  organizationId: organizationIdSchema,
  prospectId: prospectIdSchema.optional(),
  ...addressFieldsShape,
  channel: consentChannelSchema,
  purpose: contactPurposeSchema,
  caller: z31.string().min(1).max(MAX_CALLER_LENGTH).regex(/^[a-z][a-z0-9_-]*$/)
}).refine((body) => [body.prospectId, body.email, body.phone, body.linkedinUrl].filter((value) => value !== undefined).length === 1, "Give exactly one of prospectId, email, phone or linkedinUrl");
var allowedSchema = z31.strictObject({
  allowed: z31.literal(true),
  checkId: contactCheckIdSchema,
  basis: z31.enum(CONTACT_ALLOW_BASES)
});
var deniedSchema = z31.strictObject({
  allowed: z31.literal(false),
  checkId: contactCheckIdSchema.nullable(),
  code: contactDenialCodeSchema,
  suppressionReason: suppressionReasonSchema.nullable()
}).refine((r) => r.code === "consent.suppressed" === (r.suppressionReason !== null), "Only a suppressed denial carries a Suppression reason").refine((r) => r.code === "consent.unavailable" === (r.checkId === null), "Only an unavailable denial has no logged check");
var contactCheckResultSchema = z31.union([allowedSchema, deniedSchema]);
var contactCheckLogEntrySchema = z31.object({
  id: contactCheckIdSchema,
  prospectId: prospectIdSchema.nullable(),
  channel: consentChannelSchema,
  purpose: contactPurposeSchema,
  caller: z31.string().min(1).max(MAX_CALLER_LENGTH),
  allowed: z31.boolean(),
  code: contactDenialCodeSchema.nullable(),
  basis: z31.enum(CONTACT_ALLOW_BASES).nullable(),
  checkedAt: timestampSchema
});
var listContactChecksQuerySchema = pageQuerySchema.extend({
  channel: consentChannelSchema.optional(),
  purpose: contactPurposeSchema.optional(),
  allowed: z31.enum(["true", "false"]).optional(),
  prospectId: prospectIdSchema.optional(),
  code: contactDenialCodeSchema.optional()
}).strict();
var contactCheckLogPageSchema = pageSchema(contactCheckLogEntrySchema);
// src/consent/errors.ts
var CONSENT_ERRORS = {
  ...defineErrors("consent", {
    not_found: {
      status: 404,
      message: "The requested Consent Wording, form, Suppression entry or import was not found."
    },
    missing: { status: 403, message: "There is no Contact Consent for this contact." },
    withdrawn: { status: 403, message: "The Contact Consent for this contact was withdrawn." },
    suppressed: { status: 403, message: "This contact is on the Suppression list." },
    unavailable: { status: 503, message: "The Contact Check could not be completed." },
    wording_locked: {
      status: 409,
      message: "This Consent Wording is in use and cannot be edited. Write a new version."
    },
    invalid_token: { status: 400, message: "This link is not valid or has expired." },
    entry_not_removable: {
      status: 409,
      message: "Only a manually added Suppression entry can be removed."
    }
  })
};
// src/consent/events.ts
import { z as z32 } from "zod";
var consentGrantedEvent = defineEvent("consent.granted", 1, z32.strictObject({
  consentEventId: consentEventIdSchema,
  prospectId: prospectIdSchema,
  channel: consentChannelSchema,
  source: consentGrantSourceSchema,
  wordingId: consentWordingIdSchema
}));
var consentWithdrawnEvent = defineEvent("consent.withdrawn", 1, z32.strictObject({
  consentEventId: consentEventIdSchema,
  prospectId: prospectIdSchema,
  channel: consentChannelSchema,
  source: consentWithdrawalSourceSchema,
  stopAll: z32.boolean()
}));
var suppressionAddedEvent = defineEvent("suppression.added", 1, z32.strictObject({
  suppressionEntryId: suppressionEntryIdSchema,
  addressKind: suppressionAddressKindSchema,
  reason: suppressionReasonSchema,
  prospectId: prospectIdSchema.nullable()
}));
var suppressionRemovedEvent = defineEvent("suppression.removed", 1, z32.strictObject({
  suppressionEntryId: suppressionEntryIdSchema,
  addressKind: suppressionAddressKindSchema
}));
var CONSENT_EVENTS = {
  "consent.granted": consentGrantedEvent,
  "consent.withdrawn": consentWithdrawnEvent,
  "suppression.added": suppressionAddedEvent,
  "suppression.removed": suppressionRemovedEvent
};
// src/consent/evidence.ts
import { z as z34 } from "zod";

// src/consent/ledger.ts
import { z as z33 } from "zod";
var CONSENT_STATES = ["granted", "withdrawn", "none"];
var consentStateSchema = z33.enum(CONSENT_STATES);
var consentEventSchema = z33.object({
  id: consentEventIdSchema,
  prospectId: prospectIdSchema,
  channel: consentChannelSchema,
  kind: z33.enum(["granted", "withdrawn"]),
  source: consentSourceSchema,
  wordingId: consentWordingIdSchema.nullable(),
  evidenceRef: evidenceRefSchema.nullable(),
  callId: callIdSchema.nullable(),
  formId: consentFormIdSchema.nullable(),
  stopAll: z33.boolean(),
  recordedByUserId: userIdSchema.nullable(),
  occurredAt: timestampSchema,
  recordedAt: timestampSchema
}).superRefine((event, ctx) => {
  const issue = (message) => ctx.addIssue({ code: "custom", message });
  const grant = event.kind === "granted";
  if (grant !== CONSENT_GRANT_SOURCES.includes(event.source)) {
    issue(grant ? "A grant has a grant source" : "A withdrawal has a withdrawal source");
  }
  if (grant && (event.wordingId === null || event.evidenceRef === null)) {
    issue("A grant carries the wording shown and an evidence reference");
  }
  if (grant && event.stopAll) {
    issue("Only a withdrawal can be a STOP-all");
  }
  if (event.source === "verbal_call" !== (event.callId !== null)) {
    issue("A verbal grant links the Call, and only a verbal grant does");
  }
  if (event.source === "hosted_form" !== (event.formId !== null)) {
    issue("A hosted grant links the form, and only a hosted grant does");
  }
});
var channelConsentSchema = z33.object({
  channel: consentChannelSchema,
  state: consentStateSchema,
  since: timestampSchema.nullable(),
  lastEventId: consentEventIdSchema.nullable(),
  wordingId: consentWordingIdSchema.nullable()
}).refine((c) => c.state === "none" === (c.since === null && c.lastEventId === null) && (c.state === "granted" || c.wordingId === null), "A channel with no event has no time or event; only a grant carries wording");
var prospectConsentSchema = z33.object({
  prospectId: prospectIdSchema,
  channels: z33.array(channelConsentSchema).length(CONSENT_CHANNELS.length),
  suppressed: z33.boolean(),
  suppressionReason: suppressionReasonSchema.nullable()
}).refine((c) => new Set(c.channels.map((channel) => channel.channel)).size === CONSENT_CHANNELS.length, "Each channel appears once").refine((c) => c.suppressed === (c.suppressionReason !== null), "A suppressed Prospect has a reason");
var recordConsentRequestSchema = z33.strictObject({
  channel: consentChannelSchema,
  source: z33.enum(CONSENT_RECORDABLE_SOURCES),
  wordingId: consentWordingIdSchema,
  evidenceRef: evidenceRefSchema,
  callId: callIdSchema.optional(),
  occurredAt: timestampSchema.optional()
}).refine((body) => body.source === "verbal_call" === (body.callId !== undefined), "A verbal grant names the Call, and only a verbal grant does");
var withdrawConsentRequestSchema = z33.strictObject({
  channels: z33.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length).refine((channels) => new Set(channels).size === channels.length, "No repeats").optional(),
  all: z33.literal(true).optional(),
  occurredAt: timestampSchema.optional()
}).refine((body) => body.channels === undefined !== (body.all === undefined), "Give channels or all");
var consentProspectParamsSchema = z33.strictObject({ prospectId: prospectIdSchema });
var listConsentEventsQuerySchema = pageQuerySchema.extend({ channel: consentChannelSchema.optional() }).strict();
var consentEventPageSchema = pageSchema(consentEventSchema);
var recordedConsentSchema = z33.object({
  events: z33.array(consentEventSchema).min(1).max(CONSENT_CHANNELS.length),
  consent: prospectConsentSchema
});

// src/consent/evidence.ts
var MAX_IP_LENGTH = 64;
var MAX_USER_AGENT_LENGTH = 512;
var evidenceEventSchema = consentEventSchema.and(z34.object({
  wording: z34.object({
    id: consentWordingIdSchema,
    version: z34.number().int().min(1),
    text: z34.string().min(1).max(1e4)
  }).nullable(),
  submission: z34.object({
    ipAddress: z34.string().min(1).max(MAX_IP_LENGTH),
    userAgent: z34.string().max(MAX_USER_AGENT_LENGTH)
  }).nullable()
})).refine((e) => e.source === "hosted_form" === (e.submission !== null), "A hosted grant carries the submission evidence, and only a hosted grant does");
var listEvidenceQuerySchema = pageQuerySchema.extend({ channel: consentChannelSchema.optional() }).strict();
var evidencePageSchema = pageSchema(evidenceEventSchema);
var EVIDENCE_CSV_COLUMNS = [
  "event_id",
  "prospect_id",
  "channel",
  "kind",
  "source",
  "occurred_at",
  "recorded_at",
  "wording_id",
  "wording_version",
  "wording_text",
  "evidence_ref",
  "ip_address",
  "user_agent"
];
// src/consent/public.ts
import { z as z36 } from "zod";

// src/consent/wording.ts
import { z as z35 } from "zod";
var MAX_CONSENT_WORDING_LENGTH = 5000;
var MAX_CONSENT_FORM_NAME_LENGTH = 100;
var consentWordingTextSchema = z35.string().max(MAX_CONSENT_WORDING_LENGTH * 2).trim().pipe(z35.string().min(1).max(MAX_CONSENT_WORDING_LENGTH).refine((text) => !hasControlCharacter2(text, true), "No control characters"));
var channelsSchema = z35.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length).refine((channels) => new Set(channels).size === channels.length, "No repeats");
var consentWordingSchema = z35.object({
  id: consentWordingIdSchema,
  version: z35.number().int().min(1),
  text: consentWordingTextSchema,
  channels: channelsSchema,
  locked: z35.boolean(),
  supersedesId: consentWordingIdSchema.nullable(),
  createdAt: timestampSchema,
  createdByUserId: userIdSchema
}).refine((w) => w.version === 1 === (w.supersedesId === null), "Only version 1 supersedes nothing");
var consentWordingParamsSchema = z35.strictObject({ wordingId: consentWordingIdSchema });
var createConsentWordingRequestSchema = z35.strictObject({
  text: consentWordingTextSchema,
  channels: channelsSchema
});
var updateConsentWordingRequestSchema = z35.strictObject({ text: consentWordingTextSchema.optional(), channels: channelsSchema.optional() }).refine((body) => body.text !== undefined || body.channels !== undefined, "Change something");
var listConsentWordingsQuerySchema = pageQuerySchema.strict();
var consentWordingPageSchema = pageSchema(consentWordingSchema);
var CONSENT_FORM_STATES = ["draft", "published", "closed"];
var consentFormStateSchema = z35.enum(CONSENT_FORM_STATES);
var consentFormSchema = z35.object({
  id: consentFormIdSchema,
  wordingId: consentWordingIdSchema,
  name: boundedTextSchema(MAX_CONSENT_FORM_NAME_LENGTH),
  channels: channelsSchema,
  state: consentFormStateSchema,
  token: consentTokenSchema.nullable(),
  createdAt: timestampSchema,
  createdByUserId: userIdSchema,
  publishedAt: timestampSchema.nullable(),
  closedAt: timestampSchema.nullable()
}).refine((f) => f.state === "draft" === (f.publishedAt === null) && (f.state !== "draft" || f.token === null), "A form has a publish time exactly once published, and a draft has no token").refine((f) => f.state === "closed" === (f.closedAt !== null), "A form has a close time exactly when closed");
var consentFormParamsSchema = z35.strictObject({ formId: consentFormIdSchema });
var createConsentFormRequestSchema = z35.strictObject({
  wordingId: consentWordingIdSchema,
  name: boundedTextSchema(MAX_CONSENT_FORM_NAME_LENGTH),
  channels: channelsSchema
});
var listConsentFormsQuerySchema = pageQuerySchema.extend({ state: consentFormStateSchema.optional() }).strict();
var consentFormPageSchema = pageSchema(consentFormSchema);

// src/consent/public.ts
var consentTokenParamsSchema = z36.strictObject({ token: consentTokenSchema });
var MAX_NAME_LENGTH2 = 100;
var PHONE_CHANNELS = ["phone", "sms", "whatsapp"];
var choiceSchema = z36.strictObject({
  channel: consentChannelSchema,
  agreed: z36.boolean()
});
var hostedConsentSubmissionSchema = z36.strictObject({
  wordingId: consentWordingIdSchema,
  firstName: boundedTextSchema(MAX_NAME_LENGTH2).optional(),
  lastName: boundedTextSchema(MAX_NAME_LENGTH2).optional(),
  email: addressFieldsShape.email,
  phone: addressFieldsShape.phone,
  choices: z36.array(choiceSchema).min(1).max(CONSENT_CHANNELS.length).refine((choices) => new Set(choices.map((c) => c.channel)).size === choices.length, "No repeats")
}).superRefine((body, ctx) => {
  const agreed = body.choices.filter((choice) => choice.agreed);
  if (agreed.length === 0) {
    ctx.addIssue({ code: "custom", path: ["choices"], message: "Agree to at least one channel" });
  }
  for (const choice of agreed) {
    if (PHONE_CHANNELS.includes(choice.channel) && body.phone === undefined) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "A phone number is needed" });
    }
    if (choice.channel === "email" && body.email === undefined) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "An email address is needed" });
    }
    if (choice.channel === "linkedin") {
      ctx.addIssue({
        code: "custom",
        path: ["choices"],
        message: "LinkedIn is not offered on a hosted form"
      });
    }
  }
});
var hostedConsentFormViewSchema = z36.object({
  organizationName: boundedTextSchema(200),
  wordingId: consentWordingIdSchema,
  wordingVersion: z36.number().int().min(1),
  wordingText: consentWordingTextSchema,
  channels: z36.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length)
});
var hostedConsentReceiptSchema = z36.object({
  channels: z36.array(consentChannelSchema).min(1).max(CONSENT_CHANNELS.length),
  recordedAt: timestampSchema
});
var unsubscribePreviewSchema = z36.object({
  organizationName: boundedTextSchema(200),
  channel: z36.literal("email")
});
var oneClickUnsubscribeRequestSchema = z36.strictObject({
  "List-Unsubscribe": z36.literal("One-Click")
});
var unsubscribeReceiptSchema = z36.object({
  unsubscribed: z36.literal(true),
  recordedAt: timestampSchema
});
// src/consent/routes.ts
var CONSENT_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var CONSENT_ADMIN_ROLES = ["owner", "admin"];
var route6 = (definition) => Object.freeze(definition);
var IDEMPOTENT_ERRORS3 = [
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var CONSENT_ROUTES = Object.freeze({
  getProspectConsent: route6({
    method: "GET",
    path: "/v1/prospects/{prospectId}/consent",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads a Prospect's Contact Consent on each channel, derived from the ledger, and whether the Prospect is suppressed. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization."
  }),
  listProspectConsentEvents: route6({
    method: "GET",
    path: "/v1/prospects/{prospectId}/consent-events",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists a Prospect's consent ledger events, newest first, one cursor-paginated page at a time (at most 100); optionally one channel. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization."
  }),
  recordConsent: route6({
    method: "POST",
    path: "/v1/prospects/{prospectId}/consents",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.not_found", "consent.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Records a granted Contact Consent on one channel with the Consent Wording shown, the source and an evidence reference; without them it is refused (request.invalid). The source is never hosted_form. A verbal_call grant names the Call. Appends to the ledger and publishes consent.granted; answers 201, or 200 for a replay of the same Idempotency-Key. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization."
  }),
  withdrawConsent: route6({
    method: "POST",
    path: "/v1/prospects/{prospectId}/consent-withdrawals",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Records a withdrawal of Contact Consent on the named channels, or on every channel with all: true. Appends to the ledger and publishes consent.withdrawn once per channel; the source is manual. A withdrawal never needs a reason and is always allowed. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization."
  }),
  getProspectConsentEvidence: route6({
    method: "GET",
    path: "/v1/prospects/{prospectId}/consent-evidence",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Exports a Prospect's consent evidence as JSON, newest first, one cursor-paginated page at a time (at most 100): each ledger event with the wording text shown and, for a hosted form, the IP address and user agent. Owner and Admin only. Send Accept: text/csv for the same events as CSV, with the columns in EVIDENCE_CSV_COLUMNS."
  }),
  listConsentWordings: route6({
    method: "GET",
    path: "/v1/consent-wordings",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Consent Wordings, newest first, one cursor-paginated page at a time (at most 100)."
  }),
  getConsentWording: route6({
    method: "GET",
    path: "/v1/consent-wordings/{wordingId}",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Consent Wording with its version and whether it is locked."
  }),
  createConsentWording: route6({
    method: "POST",
    path: "/v1/consent-wordings",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Writes a new Consent Wording (version 1) for the channels it covers. The text is the Organization's own, reviewed by its own counsel; Closeline ships none. Owner and Admin only. Answers 201, or 200 for a replay of the same Idempotency-Key."
  }),
  updateConsentWording: route6({
    method: "PATCH",
    path: "/v1/consent-wordings/{wordingId}",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found", "consent.wording_locked"],
    commonErrors: ["request.invalid"],
    description: "Edits a Consent Wording that nothing references yet. Once a consent event or a published form uses it, it is consent.wording_locked (409) and the change is a new version. Owner and Admin only."
  }),
  createConsentWordingVersion: route6({
    method: "POST",
    path: "/v1/consent-wordings/{wordingId}/versions",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["consent.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Writes the next version of a Consent Wording; the old version stays as it was and keeps its evidence. Owner and Admin only. Answers 201, or 200 for a replay of the same Idempotency-Key."
  }),
  listConsentForms: route6({
    method: "GET",
    path: "/v1/consent-forms",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's hosted consent forms, newest first, one cursor-paginated page at a time (at most 100); optionally one state."
  }),
  getConsentForm: route6({
    method: "GET",
    path: "/v1/consent-forms/{formId}",
    access: "user",
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one hosted consent form. The public link token is shown to Owner and Admin only."
  }),
  createConsentForm: route6({
    method: "POST",
    path: "/v1/consent-forms",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["consent.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Creates a draft hosted consent form from a Consent Wording and the channels to offer, each its own unticked choice. A wording that does not exist is consent.not_found. Owner and Admin only. Answers 201, or 200 for a replay of the same Idempotency-Key."
  }),
  publishConsentForm: route6({
    method: "POST",
    path: "/v1/consent-forms/{formId}/publication",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found", "request.conflict"],
    commonErrors: ["request.invalid"],
    description: "Publishes a draft form: it gets its public link token and its wording becomes locked. Publishing a form that is not a draft is request.conflict. Owner and Admin only."
  }),
  closeConsentForm: route6({
    method: "POST",
    path: "/v1/consent-forms/{formId}/closure",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found", "request.conflict"],
    commonErrors: ["request.invalid"],
    description: "Closes a published form: its link answers consent.invalid_token afterwards, and the consent already recorded stays. Closing a form that is not published is request.conflict. Owner and Admin only."
  }),
  addSuppression: route6({
    method: "POST",
    path: "/v1/suppression-entries",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Adds one email, phone or LinkedIn address to the Suppression list with the reason manual. Adding an address already suppressed answers 200 with the existing entry. The address is never returned. Owner and Admin only. Publishes suppression.added."
  }),
  listSuppressionEntries: route6({
    method: "GET",
    path: "/v1/suppression-entries",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists Suppression entries, newest first, one cursor-paginated page at a time (at most 100); filters: reason, addressKind, state (active by default). Entries show a masked address, never the address or its hash. Owner and Admin only."
  }),
  lookupSuppression: route6({
    method: "POST",
    path: "/v1/suppression-entries/lookups",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Looks up one exact email, phone or LinkedIn address on the Suppression list, in the body so it never reaches an access log. Answers the active entries for it (a masked address, never the address or its hash), none if it is not suppressed. Owner and Admin only."
  }),
  getSuppressionEntry: route6({
    method: "GET",
    path: "/v1/suppression-entries/{entryId}",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Suppression entry with a masked address. Owner and Admin only."
  }),
  removeSuppression: route6({
    method: "POST",
    path: "/v1/suppression-entries/{entryId}/removal",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found", "consent.entry_not_removable"],
    commonErrors: ["request.invalid"],
    description: "Removes a manual Suppression entry, with a recorded reason. Any other reason is consent.entry_not_removable (409): an unsubscribe, STOP, bounce, complaint, CRM or erased entry is lifted only by a new granted consent with new evidence. Owner and Admin only. Publishes suppression.removed."
  }),
  uploadSuppressionImport: route6({
    method: "POST",
    path: "/v1/suppression-imports",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [202, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Uploads a CSV of up to 50,000 addresses (one column, address; at most 10 MB) as multipart form data in the part named file. It is queued and answers 202 with the import; a replay of the same Idempotency-Key answers 200. Every address is added with the reason manual. A file that cannot be read is request.invalid; a larger one is request.too_large. Owner and Admin only."
  }),
  listSuppressionImports: route6({
    method: "GET",
    path: "/v1/suppression-imports",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists Suppression imports, newest first, one cursor-paginated page at a time (at most 100). Owner and Admin only."
  }),
  getSuppressionImport: route6({
    method: "GET",
    path: "/v1/suppression-imports/{importId}",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Suppression import with its state and counts. Owner and Admin only."
  }),
  listSuppressionImportRows: route6({
    method: "GET",
    path: "/v1/suppression-imports/{importId}/rows",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["consent.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists the per-row report of a Suppression import in file order, one cursor-paginated page at a time (at most 100); optionally one result. No cell of the file is returned. Owner and Admin only."
  }),
  listContactChecks: route6({
    method: "GET",
    path: "/v1/contact-checks",
    access: "user",
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists logged Contact Checks, newest first, one cursor-paginated page at a time (at most 100); filters: channel, purpose, allowed, prospectId and code. Owner and Admin only."
  }),
  getHostedConsentForm: route6({
    method: "GET",
    path: "/v1/public/consent-forms/{token}",
    access: "public",
    roles: [],
    success: [200],
    idempotent: false,
    errors: ["consent.invalid_token"],
    commonErrors: ["rate.limited"],
    description: "Reads what the hosted consent page shows: the Organization's name, the exact Consent Wording and the channels offered. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address."
  }),
  submitHostedConsentForm: route6({
    method: "POST",
    path: "/v1/public/consent-forms/{token}/submissions",
    access: "public",
    roles: [],
    success: [201, 200],
    idempotent: true,
    errors: ["consent.invalid_token"],
    commonErrors: [...IDEMPOTENT_ERRORS3, "rate.limited"],
    description: "Submits a hosted consent form: an explicit choice per channel and the address each needs. Core finds or creates the Prospect, reads the IP address and user agent from the request as evidence, appends the ledger and publishes consent.granted. Answers 201, or 200 for a replay of the same Idempotency-Key. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address."
  }),
  previewUnsubscribe: route6({
    method: "GET",
    path: "/v1/public/unsubscribe/{token}",
    access: "public",
    roles: [],
    success: [200],
    idempotent: false,
    errors: ["consent.invalid_token"],
    commonErrors: ["rate.limited"],
    description: "Reads what the unsubscribe page shows: the Organization's name and the channel. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address."
  }),
  oneClickUnsubscribe: route6({
    method: "POST",
    path: "/v1/public/unsubscribe/{token}",
    access: "public",
    roles: [],
    success: [200],
    idempotent: false,
    errors: ["consent.invalid_token"],
    commonErrors: ["rate.limited"],
    description: "Unsubscribes the address behind the link (RFC 8058 List-Unsubscribe-Post): it adds a Suppression entry with the reason unsubscribe, withdraws the email consent and publishes the events. Replaying a link answers the same. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address."
  }),
  contactCheck: route6({
    method: "POST",
    path: "/internal/v1/contact-checks",
    access: "internal",
    roles: [],
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Answers whether a contact may be made, from the ledger and the Suppression list. Answers 200 with a result: an allowance, or a denial with a consent.* code in the body; a denial is never an HTTP error. Every answered check is logged. Internal: called by another service with the shared secret (ADR 0013), no user token; the Organization is named in the body."
  }),
  recordWithdrawal: route6({
    method: "POST",
    path: "/internal/v1/consent-withdrawals",
    access: "internal",
    roles: [],
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Records a STOP the channel received: a withdrawal on the channel (or every channel), a Suppression entry with the reason stop, and the events. Idempotent on the message reference. Internal: called by another service with the shared secret (ADR 0013), no user token; the Organization is named in the body."
  }),
  recordDeliveryFailure: route6({
    method: "POST",
    path: "/internal/v1/delivery-failures",
    access: "internal",
    roles: [],
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS3],
    description: "Records a bounce or complaint on an email address: a Suppression entry with that reason and the event. Idempotent on the message reference. Internal: called by another service with the shared secret (ADR 0013), no user token; the Organization is named in the body."
  })
});
// src/consent/suppression.ts
import { z as z37 } from "zod";
var MAX_SUPPRESSION_NOTE_LENGTH = 500;
var isRemovableReason = (reason) => SUPPRESSION_REMOVABLE_REASONS.includes(reason);
var suppressionEntrySchema = z37.object({
  id: suppressionEntryIdSchema,
  addressKind: suppressionAddressKindSchema,
  maskedAddress: maskedAddressSchema.nullable(),
  reason: suppressionReasonSchema,
  channel: consentChannelSchema.nullable(),
  sourceRef: z37.string().min(1).max(MAX_SOURCE_REF_LENGTH).nullable(),
  addedByUserId: userIdSchema.nullable(),
  removable: z37.boolean(),
  createdAt: timestampSchema,
  removedAt: timestampSchema.nullable(),
  removedByUserId: userIdSchema.nullable(),
  removalReason: boundedTextSchema(MAX_SUPPRESSION_NOTE_LENGTH).nullable()
}).refine((e) => e.removable === isRemovableReason(e.reason), "Only a manual entry is removable").refine((e) => e.reason === "erased" === (e.maskedAddress === null), "An erased entry keeps no address").refine((e) => e.removedAt === null === (e.removedByUserId === null) && e.removedAt === null === (e.removalReason === null), "A removed entry says when, by whom and why");
var suppressionEntryParamsSchema = z37.strictObject({ entryId: suppressionEntryIdSchema });
var addSuppressionRequestSchema = z37.strictObject({
  ...addressFieldsShape,
  note: boundedTextSchema(MAX_SUPPRESSION_NOTE_LENGTH).optional()
}).refine(hasExactlyOneAddress, ONE_ADDRESS_MESSAGE);
var removeSuppressionRequestSchema = z37.strictObject({
  reason: boundedTextSchema(MAX_SUPPRESSION_NOTE_LENGTH)
});
var suppressionListStateSchema = z37.enum(["active", "removed"]);
var listSuppressionEntriesQuerySchema = pageQuerySchema.extend({
  reason: suppressionReasonSchema.optional(),
  addressKind: suppressionAddressKindSchema.optional(),
  state: suppressionListStateSchema.optional()
}).strict();
var lookupSuppressionRequestSchema = z37.strictObject(addressFieldsShape).refine(hasExactlyOneAddress, ONE_ADDRESS_MESSAGE);
var suppressionEntryPageSchema = pageSchema(suppressionEntrySchema);
var recordWithdrawalRequestSchema = z37.strictObject({
  organizationId: organizationIdSchema,
  channel: consentChannelSchema,
  ...addressFieldsShape,
  stopAll: z37.boolean().default(false),
  sourceRef: z37.string().min(1).max(MAX_SOURCE_REF_LENGTH)
}).refine(hasExactlyOneAddress, ONE_ADDRESS_MESSAGE);
var DELIVERY_FAILURE_REASONS = ["bounce", "complaint"];
var recordDeliveryFailureRequestSchema = z37.strictObject({
  organizationId: organizationIdSchema,
  email: addressFieldsShape.email.unwrap(),
  reason: z37.enum(DELIVERY_FAILURE_REASONS),
  sourceRef: z37.string().min(1).max(MAX_SOURCE_REF_LENGTH)
});
var recordedSuppressionSchema = z37.object({
  entryId: suppressionEntryIdSchema,
  prospectId: prospectIdSchema.nullable()
});
var MAX_SUPPRESSION_IMPORT_BYTES = 10 * 1024 * 1024;
var MAX_SUPPRESSION_IMPORT_ROWS = 50000;
var SUPPRESSION_IMPORT_FILE_FIELD = "file";
var SUPPRESSION_IMPORT_COLUMNS = ["address"];
var SUPPRESSION_IMPORT_STATES = ["uploaded", "processing", "completed", "failed"];
var suppressionImportStateSchema = z37.enum(SUPPRESSION_IMPORT_STATES);
var SUPPRESSION_IMPORT_FAILURE_REASONS = ["too_many_rows", "unreadable"];
var suppressionImportSchema = z37.object({
  id: suppressionImportIdSchema,
  state: suppressionImportStateSchema,
  failureReason: z37.enum(SUPPRESSION_IMPORT_FAILURE_REASONS).nullable(),
  totalRows: z37.number().int().min(0).max(MAX_SUPPRESSION_IMPORT_ROWS).nullable(),
  addedRows: z37.number().int().min(0).nullable(),
  alreadySuppressedRows: z37.number().int().min(0).nullable(),
  invalidRows: z37.number().int().min(0).nullable(),
  createdAt: timestampSchema,
  completedAt: timestampSchema.nullable(),
  createdByUserId: userIdSchema
}).refine((i) => i.failureReason !== null === (i.state === "failed"), "A failed import has a reason").refine((i) => i.completedAt !== null === (i.state === "completed" || i.state === "failed"), "A final import has a completion time").refine((i) => {
  if (i.state !== "completed") {
    return i.totalRows === null && i.addedRows === null && i.alreadySuppressedRows === null && i.invalidRows === null;
  }
  return i.totalRows !== null && i.addedRows !== null && i.alreadySuppressedRows !== null && i.invalidRows !== null && i.addedRows + i.alreadySuppressedRows + i.invalidRows === i.totalRows;
}, "The counts are set exactly when completed and add up");
var suppressionImportParamsSchema = z37.strictObject({ importId: suppressionImportIdSchema });
var listSuppressionImportsQuerySchema = pageQuerySchema.strict();
var suppressionImportPageSchema = pageSchema(suppressionImportSchema);
var SUPPRESSION_IMPORT_ROW_RESULTS = ["added", "already_suppressed", "invalid"];
var suppressionImportRowSchema = z37.object({
  rowNumber: z37.number().int().min(1).max(MAX_SUPPRESSION_IMPORT_ROWS + 1),
  result: z37.enum(SUPPRESSION_IMPORT_ROW_RESULTS),
  reason: z37.enum(["unreadable_address", "unsupported_address"]).nullable()
});
var listSuppressionImportRowsQuerySchema = pageQuerySchema.extend({ result: z37.enum(SUPPRESSION_IMPORT_ROW_RESULTS).optional() }).strict();
var suppressionImportRowPageSchema = pageSchema(suppressionImportRowSchema);
// src/copilot/errors.ts
var COPILOT_ERRORS = {
  ...defineErrors("copilot", {
    disabled: { status: 409, message: "The Copilot is off for this Call." },
    not_started: { status: 409, message: "The Copilot has not started on this Call yet." },
    min_evidence_invalid: {
      status: 422,
      message: "The minimum evidence is not valid."
    }
  }),
  ...defineErrors("card", {
    not_found: { status: 404, message: "The card was not found." }
  })
};
// src/copilot/events.ts
import { z as z38 } from "zod";
var voiceCopilotCardShownEvent = defineEvent("voice.copilot.card_shown", 1, z38.strictObject({
  callId: callIdSchema,
  cardId: copilotCardIdSchema,
  repMembershipId: membershipIdSchema,
  kind: copilotCardKindSchema,
  objectionType: copilotObjectionTypeSchema.nullable(),
  evidence: copilotEvidenceSchema,
  citedMoments: z38.array(copilotMomentRefSchema).min(1).max(MAX_COPILOT_CITED_MOMENTS),
  shownAt: timestampSchema
}).refine((data) => data.kind === "objection" === (data.objectionType !== null), {
  path: ["objectionType"],
  message: "Only an objection card names an objection type"
}));
var voiceCopilotCardRatedEvent = defineEvent("voice.copilot.card_rated", 1, z38.strictObject({
  callId: callIdSchema,
  cardId: copilotCardIdSchema,
  repMembershipId: membershipIdSchema,
  kind: copilotCardKindSchema,
  rating: copilotRatingSchema.nullable(),
  dismissed: z38.boolean(),
  pinned: z38.boolean(),
  ratedAt: timestampSchema
}).refine((data) => !(data.dismissed && data.pinned), {
  path: ["pinned"],
  message: "A card is dismissed or pinned, not both"
}));
var COPILOT_EVENTS = {
  "voice.copilot.card_shown": voiceCopilotCardShownEvent,
  "voice.copilot.card_rated": voiceCopilotCardRatedEvent
};
// src/voice/routes.ts
var VOICE_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var VOICE_ADMIN_ROLES = ["owner", "admin"];
var route7 = (definition) => Object.freeze(definition);
var IDEMPOTENT_ERRORS4 = [
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var CALL_VISIBILITY = "Visibility is decided from the token: a Rep sees the Calls they took, a Manager those of the Reps on their Team, Owner and Admin every Call; anything else is call.not_found (404), as is a Call of another Organization.";
var VOICE_ROUTES = Object.freeze({
  listLines: route7({
    method: "GET",
    path: "/v1/lines",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization's Lines, newest first, one cursor-paginated page at a time (at most 100); optionally one state. Every role may read them, to choose a caller identity."
  }),
  addLine: route7({
    method: "POST",
    path: "/v1/lines",
    roles: VOICE_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["line.number_unavailable"],
    commonErrors: [...IDEMPOTENT_ERRORS4],
    description: "Adds a Line by buying a new number (country, optional area code) or porting one the Organization owns (the Line is porting until the carrier completes). A number that cannot be had is line.number_unavailable (409). Owner and Admin only. Answers 201, or 200 with the original Line for a replay of the same Idempotency-Key."
  }),
  getLine: route7({
    method: "GET",
    path: "/v1/lines/{lineId}",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["line.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Line. A Line of another Organization is line.not_found (404)."
  }),
  assignLine: route7({
    method: "PUT",
    path: "/v1/lines/{lineId}/assignment",
    roles: VOICE_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["line.not_found", "line.released", "line.assignment_invalid"],
    commonErrors: ["request.invalid"],
    description: "Sets who inbound Calls on a Line ring: a Team, one Rep, or nobody. Setting the assignment it already has answers 200 with the Line unchanged. A released Line is line.released (409); a Team or Rep that is not in the Organization, or is not a Rep, is line.assignment_invalid (422). Owner and Admin only."
  }),
  releaseLine: route7({
    method: "POST",
    path: "/v1/lines/{lineId}/release",
    roles: VOICE_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["line.not_found"],
    commonErrors: ["request.invalid"],
    description: "Gives a Line up: its number goes back to the carrier and its assignment is cleared. Calls already made on it stay. Idempotent by end state: releasing a released Line answers 200 with it. Takes no body. Owner and Admin only."
  }),
  placeCall: route7({
    method: "POST",
    path: "/v1/calls",
    roles: VOICE_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "call.number_invalid",
      "call.line_unavailable",
      "call.limit_reached",
      "call.disclosure_failed",
      "line.not_found",
      "prospect.not_found"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS4],
    description: "Places a Call from the caller's browser to a number. The Idempotency-Key header is required (a request without it is request.invalid): a retry of the same key answers the original Call and dials once; the same key with another body is request.idempotency_key_reused. The number is normalised to E.164 (call.number_invalid, 422, when it cannot be). The Call is recorded and a Disclosure plays before the two sides are bridged; a Call whose Disclosure fails ends failed and never goes live (call.disclosure_failed, 502, with the Call id in details). A Rep may call any Prospect (ADR 0003): the Contact Check on the number is a warning in the answer, never a refusal. A Line the caller may not use is line.not_found; a prospectId the caller may not see is prospect.not_found. At the Organization's cap of concurrent Calls it is call.limit_reached (429). Answers 201, or 200 for a replay."
  }),
  listCalls: route7({
    method: "GET",
    path: "/v1/calls",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Calls, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100). Filters: direction, state, repMembershipId, lineId, prospectId, and from and to on createdAt. ${CALL_VISIBILITY} A filter can narrow what the caller sees, never widen it.`
  }),
  getCall: route7({
    method: "GET",
    path: "/v1/calls/{callId}",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: `Reads one Call with its state, times, the wording version and time of its Disclosure, and the state of its Recording and Transcript. ${CALL_VISIBILITY}`
  }),
  getCallTranscript: route7({
    method: "GET",
    path: "/v1/calls/{callId}/transcript",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: `Reads the Transcript of a Call in time order, one cursor-paginated page of turns at a time (at most 100), each attributed to the Rep or the Prospect. The state says whether it is pending, ready or deleted; turns exist only when ready. The text is never logged. ${CALL_VISIBILITY}`
  }),
  getCallRecording: route7({
    method: "GET",
    path: "/v1/calls/{callId}/recording",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found", "recording.not_found", "recording.not_ready"],
    commonErrors: ["request.invalid"],
    description: `Answers a short-lived signed URL to play the two-channel Recording of a Call. A Call with no Recording, or whose Recording was deleted, is recording.not_found (404); one still being stored is recording.not_ready (409). The URL is a credential and is never logged. ${CALL_VISIBILITY}`
  }),
  deleteCallRecording: route7({
    method: "DELETE",
    path: "/v1/calls/{callId}/recording",
    roles: VOICE_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found", "call.not_ended"],
    commonErrors: ["request.invalid"],
    description: "Deletes the Recording of a Call and its Transcript, to honour a deletion request; the Call record stays with both states deleted. Idempotent by end state: a Call whose Recording is already deleted, or never existed, answers 200 with the Call. A Call that has not ended is call.not_ended (409). Owner and Admin only."
  }),
  wrapUpCall: route7({
    method: "PUT",
    path: "/v1/calls/{callId}/wrap-up",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found", "call.not_ended"],
    commonErrors: ["request.invalid"],
    description: "Sets the wrap-up of an ended Call: the Deal identifier that joins it to a Deal in the Playbook, and a note. A field left out is left alone and null clears it. A Call that has not ended is call.not_ended (409). Only the Rep who took the Call, Owner and Admin may wrap it up; for any other caller the Call is call.not_found (404), a Manager of that Rep included."
  }),
  mintSoftphoneToken: route7({
    method: "POST",
    path: "/v1/softphone/token",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Mints a short-lived token (at most an hour) for the caller's browser to register the Softphone with the telephony provider. Each call mints a new one. The token is a credential for the caller alone and is never logged. If the provider cannot be reached it is server.unavailable. Takes no body."
  })
});

// src/copilot/routes.ts
var route8 = (definition) => Object.freeze(definition);
var CARD_VISIBILITY = "Visibility is decided from the token: a Rep sees the cards of the Calls they took, a Manager those of the Reps on their Team, Owner and Admin every Call; anything else is call.not_found (404), as is a Call of another Organization. Cards come only from the Organization's own Playbook.";
var UNTRUSTED = "Quotes, passages and the composed text of a card, and the Transcript turns of the stream, are tenant text or model output and so untrusted data: bounded, shown as plain text, never as markup or instructions, never spoken into the Call, never logged.";
var COPILOT_ROUTES = Object.freeze({
  streamCopilot: route8({
    method: "GET",
    path: "/v1/calls/{callId}/copilot/stream",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    stream: true,
    errors: ["call.not_found", "copilot.disabled", "copilot.not_started"],
    commonErrors: ["request.invalid"],
    description: `Streams the live Transcript and the Copilot Cards of a Call to the Rep's browser as Server-Sent Events (text/event-stream), with the same token as every other route. Messages are copilot.status, transcript.turn, transcript.unavailable, copilot.card and copilot.card_updated, each with an id. The stream opens once the Call is disclosing and says waiting_for_disclosure until the Disclosure has played; before that, while the Call is ringing or connecting, it is copilot.not_started (409). A Call with the Copilot off is copilot.disabled (409). The Last-Event-ID header resumes after that message, replaying from what is stored, so a reconnect misses nothing. If speech-to-text fails, transcript.unavailable is sent and the Call goes on. ${UNTRUSTED} ${CARD_VISIBILITY}`
  }),
  listCopilotCards: route8({
    method: "GET",
    path: "/v1/calls/{callId}/copilot/cards",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists the Copilot Cards shown on a Call, oldest first, one cursor-paginated page at a time (at most 100); optionally one kind. Each card carries its kind, the Evidence (similar Moments and distinct won Deals), the Moments it cites and its quotes, and the Rep's rating, dismissal and pin. A Call that never had the Copilot has no cards: an empty page, not an error. ${UNTRUSTED} ${CARD_VISIBILITY}`
  }),
  markCopilotCard: route8({
    method: "PATCH",
    path: "/v1/calls/{callId}/copilot/cards/{cardId}",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["call.not_found", "card.not_found"],
    commonErrors: ["request.invalid"],
    description: "Marks a card: rates it useful or not useful (null clears the rating), dismisses it or pins it. The body names the end state wanted, so the route is idempotent by end state: a repeat of the same body answers 200 with the card unchanged and publishes no second voice.copilot.card_rated event. Dismissing a card clears its pin and pinning it clears its dismissal; asking for both is request.invalid. Only the Rep who took the Call may mark its cards; for any other caller, a Manager, Admin or Owner included, the Call is call.not_found (404), so their view of the cards stays read-only. A card that is not on the Call is card.not_found (404). Takes no Idempotency-Key header."
  }),
  getCopilotSettings: route8({
    method: "GET",
    path: "/v1/copilot/settings",
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the Organization's Copilot settings: whether the Copilot is on and the minimum Evidence (similar Moments and distinct won Deals) a card needs. Every role may read them, because the Softphone needs to know whether to offer the Copilot before dialing; an Organization that never set them has the Copilot off with the defaults of 3 Moments and 2 Deals. There is no setting that changes the Disclosure."
  }),
  setCopilotSettings: route8({
    method: "PUT",
    path: "/v1/copilot/settings",
    roles: VOICE_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["copilot.min_evidence_invalid"],
    commonErrors: ["request.invalid"],
    description: "Sets the Copilot settings: on or off for the Organization, and the minimum Evidence a card needs (1 to 20 Moments, and 1 to 20 distinct Deals that are no more than the Moments). The body replaces the settings, so it is idempotent by end state: the same body again answers 200 with the same settings. A minimum outside 1 to 20 or more Deals than Moments is copilot.min_evidence_invalid (422); a malformed body is request.invalid. Turning the Copilot off stops new Copilot Calls from being offered and leaves the cards already shown. Owner and Admin only."
  })
});
// src/copilot/settings.ts
import { z as z39 } from "zod";
var MIN_COPILOT_MIN_EVIDENCE = 1;
var MAX_COPILOT_MIN_EVIDENCE = 20;
var DEFAULT_COPILOT_MIN_MOMENTS = 3;
var DEFAULT_COPILOT_MIN_DEALS = 2;
var minEvidenceSchema = z39.number().int().min(MIN_COPILOT_MIN_EVIDENCE).max(MAX_COPILOT_MIN_EVIDENCE);
var copilotSettingsSchema = z39.strictObject({
  enabled: z39.boolean(),
  minMoments: minEvidenceSchema,
  minDeals: minEvidenceSchema,
  updatedAt: timestampSchema.nullable(),
  updatedBy: membershipIdSchema.nullable()
}).refine((settings) => settings.minDeals <= settings.minMoments, {
  path: ["minDeals"],
  message: "The minimum Deals are no more than the minimum Moments"
});
var setCopilotSettingsRequestSchema = z39.strictObject({
  enabled: z39.boolean(),
  minMoments: minEvidenceSchema,
  minDeals: minEvidenceSchema
}).refine((settings) => settings.minDeals <= settings.minMoments, {
  path: ["minDeals"],
  message: "The minimum Deals are no more than the minimum Moments"
});
// src/copilot/stream.ts
import { z as z42 } from "zod";

// src/voice/call.ts
import { z as z41 } from "zod";

// src/playbook/deal-values.ts
import { z as z40 } from "zod";
var OUTCOMES = ["won", "lost", "open"];
var outcomeSchema = z40.enum(OUTCOMES);
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
var dealIdSchema = z40.string().max(MAX_RAW_DEAL_ID_LENGTH).transform(normaliseDealId).pipe(z40.string().min(1).max(MAX_DEAL_ID_LENGTH).refine(isWellFormedText, "Well-formed text only").refine((id) => !hasStrippableCharacter(id), "No control or direction characters").refine((id) => !hasInvisibleCharacter(id), "No invisible characters"));
var MAX_DEAL_NAME_LENGTH = 200;
var MAX_DEAL_NAME_BYTES = MAX_DEAL_NAME_LENGTH * MAX_UTF8_BYTES_PER_CODE_POINT;
var dealNameSchema = z40.string().max(1000).trim().pipe(z40.string().min(1).max(MAX_DEAL_NAME_LENGTH).refine(isWellFormedText, "Well-formed text only").refine((name) => !hasStrippableCharacter(name), "No control or direction characters"));
var dealAmountSchema = z40.string().regex(/^(0|[1-9]\d{0,14})(\.\d{1,2})?$/);
var dealCurrencySchema = z40.string().regex(/^[A-Z]{3}$/);
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
var dealImportStateSchema = z40.enum(DEAL_IMPORT_STATES);
var DEAL_IMPORT_FAILURE_REASONS = [
  "too_many_rows",
  "unreadable",
  "processing_failed"
];
var dealImportFailureReasonSchema = z40.enum(DEAL_IMPORT_FAILURE_REASONS);
var DEAL_IMPORT_ROW_RESULTS = ["applied", "rejected"];
var dealImportRowResultSchema = z40.enum(DEAL_IMPORT_ROW_RESULTS);
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
var dealImportRowReasonSchema = z40.enum(DEAL_IMPORT_ROW_REASONS);
var INVALID_CELL = { ok: false };
var DEAL_CLOSED_AT_MIN_YEAR = 1970;
var DEAL_CLOSED_AT_MAX_YEAR = 2100;
function parseOutcomeCell(cell) {
  const result = outcomeSchema.safeParse(cell.trim().toLowerCase());
  return result.success ? { ok: true, value: result.data } : INVALID_CELL;
}
function isCalendarDate(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) {
    return false;
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}
function isDealCalendarDate(text) {
  const year = Number(text.slice(0, 4));
  return isCalendarDate(text) && year >= DEAL_CLOSED_AT_MIN_YEAR && year <= DEAL_CLOSED_AT_MAX_YEAR;
}
var calendarDateSchema = z40.iso.date().refine(isDealCalendarDate, "A real calendar date from 1970 to 2100");
function parseClosedAtCell(cell) {
  const text = cell.trim();
  if (text === "") {
    return { ok: true, value: null };
  }
  return isDealCalendarDate(text) ? { ok: true, value: text } : INVALID_CELL;
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
  if (!result.ok) {
    return result;
  }
  const records = result.records;
  let end = records.length;
  while (end > 1 && isBlankCsvRecord(records[end - 1] ?? [])) {
    end--;
  }
  return { ok: true, records: end === records.length ? records : records.slice(0, end) };
}
function firstCsvRecord(text, options) {
  const result = readCsv(text, options, true);
  return result.ok ? { ok: true, record: result.records[0], complete: result.complete === true } : { ok: false, failure: result.failure, recordsRead: result.recordsRead };
}
function isBlankCsvRecord(record) {
  return record.length === 1 && record[0] === "";
}

// src/voice/call.ts
var MAX_CALL_DURATION_SECONDS = 43200;
var callDisclosureSchema = z41.strictObject({
  wordingVersion: z41.number().int().min(1).nullable(),
  playedAt: timestampSchema.nullable(),
  aiAssisted: z41.boolean()
}).refine((d) => d.wordingVersion === null === (d.playedAt === null), {
  message: "The wording version and the time are both set once the Disclosure has played"
});
var voiceCallSchema = z41.object({
  id: callIdSchema,
  direction: voiceCallDirectionSchema,
  state: voiceCallStateSchema,
  lineId: lineIdSchema,
  repMembershipId: membershipIdSchema.nullable(),
  prospectId: prospectIdSchema.nullable(),
  prospectNumber: e164PhoneSchema,
  disclosure: callDisclosureSchema,
  createdAt: timestampSchema,
  answeredAt: timestampSchema.nullable(),
  endedAt: timestampSchema.nullable(),
  durationSeconds: z41.number().int().min(0).max(MAX_CALL_DURATION_SECONDS).nullable(),
  endedBy: voiceCallEndedBySchema.nullable(),
  failureReason: voiceCallFailureReasonSchema.nullable(),
  dealId: dealIdSchema.nullable(),
  note: wrapUpNoteSchema.nullable(),
  recordingState: voiceRecordingStateSchema,
  transcriptState: voiceTranscriptStateSchema
}).superRefine((call, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  const played = call.disclosure.playedAt !== null;
  const final = call.state === "ended" || call.state === "failed" || call.state === "missed";
  if ((call.state === "live" || call.state === "ended") && !played) {
    issue("disclosure", "A live or ended Call has played its Disclosure");
  }
  if (call.state === "failed" !== (call.failureReason !== null)) {
    issue("failureReason", "Only a failed Call has a failure reason");
  }
  if (call.failureReason === "disclosure_failed" && played) {
    issue("failureReason", "A Call whose Disclosure played did not fail on it");
  }
  if (final !== (call.endedAt !== null)) {
    issue("endedAt", "Only a Call in a final state has an end time");
  }
  if ((call.state === "live" || call.state === "ended") !== (call.answeredAt !== null)) {
    issue("answeredAt", "A Call is answered once it is live or ended, and not before");
  }
  if (call.state === "ended" !== (call.durationSeconds !== null)) {
    issue("durationSeconds", "Only an ended Call has a duration");
  }
  if (call.endedBy !== null && !final) {
    issue("endedBy", "Only a Call in a final state says who ended it");
  }
  if (call.state !== "ended" && (call.dealId !== null || call.note !== null)) {
    issue("dealId", "Only an ended Call has a wrap-up");
  }
  if (call.recordingState !== "none" && !played) {
    issue("recordingState", "A Recording starts after the Disclosure has played");
  }
  if (call.transcriptState === "ready" && call.recordingState !== "stored") {
    issue("transcriptState", "A ready Transcript comes from a stored Recording");
  }
});
var voiceCallParamsSchema = z41.strictObject({ callId: callIdSchema });
var voiceCallCursorSchema = z41.strictObject({
  createdAt: timestampSchema,
  id: callIdSchema
});
var placeCallRequestSchema = z41.strictObject({
  to: rawPhoneSchema,
  lineId: lineIdSchema.optional(),
  prospectId: prospectIdSchema.optional()
});
var placeCallHeadersSchema = z41.object({ "idempotency-key": idempotencyKeySchema });
var contactWarningSchema = z41.strictObject({
  code: contactDenialCodeSchema,
  suppressionReason: suppressionReasonSchema.nullable()
});
var placedCallSchema = z41.strictObject({
  call: voiceCallSchema,
  warnings: z41.array(contactWarningSchema).max(4)
});
var MAX_FILTER_TIME_LENGTH = 64;
var listVoiceCallsQuerySchema = pageQuerySchema.extend({
  direction: voiceCallDirectionSchema.optional(),
  state: voiceCallStateSchema.optional(),
  repMembershipId: membershipIdSchema.optional(),
  lineId: lineIdSchema.optional(),
  prospectId: prospectIdSchema.optional(),
  from: timestampSchema.max(MAX_FILTER_TIME_LENGTH).optional(),
  to: timestampSchema.max(MAX_FILTER_TIME_LENGTH).optional()
}).strict().refine((q) => q.from === undefined || q.to === undefined || Date.parse(q.from) < Date.parse(q.to), {
  message: "from is before to"
});
var voiceCallPageSchema = pageSchema(voiceCallSchema);
var transcriptSpeakerSchema = z41.enum(["rep", "prospect"]);
var MAX_TRANSCRIPT_TURN_LENGTH = 4000;
var transcriptTurnSchema = z41.strictObject({
  speaker: transcriptSpeakerSchema,
  startMs: z41.number().int().min(0).max(MAX_CALL_DURATION_SECONDS * 1000),
  endMs: z41.number().int().min(0).max(MAX_CALL_DURATION_SECONDS * 1000),
  text: z41.string().min(1).max(MAX_TRANSCRIPT_TURN_LENGTH)
}).refine((turn) => turn.endMs >= turn.startMs, { message: "A turn ends after it starts" });
var transcriptCursorSchema = z41.strictObject({ index: z41.number().int().min(0) });
var getTranscriptQuerySchema = pageQuerySchema.strict();
var transcriptPageSchema = pageSchema(transcriptTurnSchema).extend({ callId: callIdSchema, state: voiceTranscriptStateSchema }).refine((page) => page.state === "ready" || page.items.length === 0, {
  message: "Only a ready Transcript has turns"
});
var RECORDING_MEDIA_TYPES = ["audio/mpeg", "audio/wav", "audio/ogg"];
var MAX_PLAYBACK_URL_LENGTH = 2048;
var recordingPlaybackSchema = z41.strictObject({
  callId: callIdSchema,
  url: z41.url({ protocol: /^https$/ }).max(MAX_PLAYBACK_URL_LENGTH),
  expiresAt: timestampSchema,
  mediaType: z41.enum(RECORDING_MEDIA_TYPES),
  channels: z41.literal(2),
  durationSeconds: z41.number().int().min(0).max(MAX_CALL_DURATION_SECONDS)
});
var wrapUpRequestSchema = z41.strictObject({
  dealId: dealIdSchema.nullable().optional(),
  note: wrapUpNoteSchema.nullable().optional()
}).refine((body) => body.dealId !== undefined || body.note !== undefined, {
  message: "Give a dealId or a note"
});
var deletedRecordingSchema = voiceCallSchema;

// src/copilot/stream.ts
var MAX_COPILOT_STREAM_ID_LENGTH = 64;
var copilotStreamIdSchema = z42.string().min(1).max(MAX_COPILOT_STREAM_ID_LENGTH).regex(/^[A-Za-z0-9_.:-]+$/);
var copilotStreamHeadersSchema = z42.object({
  "last-event-id": copilotStreamIdSchema.optional()
});
var COPILOT_STREAM_STATES = ["waiting_for_disclosure", "live", "ended"];
var copilotStreamStateSchema = z42.enum(COPILOT_STREAM_STATES);
var COPILOT_QUIET_REASONS = [
  "not_enough_won_moments",
  "playbook_unavailable",
  "transcript_unavailable"
];
var copilotQuietReasonSchema = z42.enum(COPILOT_QUIET_REASONS);
var COPILOT_TRANSCRIPT_UNAVAILABLE_REASONS = [
  "speech_to_text_failed",
  "stream_dropped"
];
var copilotStatusDataSchema = z42.strictObject({
  callId: callIdSchema,
  state: copilotStreamStateSchema,
  quietReason: copilotQuietReasonSchema.nullable()
});
var copilotTurnDataSchema = z42.strictObject({
  callId: callIdSchema,
  sequence: z42.number().int().min(1),
  turn: transcriptTurnSchema
});
var copilotTranscriptUnavailableDataSchema = z42.strictObject({
  callId: callIdSchema,
  reason: z42.enum(COPILOT_TRANSCRIPT_UNAVAILABLE_REASONS)
});
var copilotCardDataSchema = z42.strictObject({ card: copilotCardSchema });
var COPILOT_STREAM_EVENTS = [
  "copilot.status",
  "transcript.turn",
  "transcript.unavailable",
  "copilot.card",
  "copilot.card_updated"
];
var message = (event, data) => z42.strictObject({ id: copilotStreamIdSchema, event: z42.literal(event), data });
var copilotStreamMessageSchema = z42.discriminatedUnion("event", [
  message("copilot.status", copilotStatusDataSchema),
  message("transcript.turn", copilotTurnDataSchema),
  message("transcript.unavailable", copilotTranscriptUnavailableDataSchema),
  message("copilot.card", copilotCardDataSchema),
  message("copilot.card_updated", copilotCardDataSchema)
]);
function formatCopilotStreamFrame(input) {
  const parsed = copilotStreamMessageSchema.parse(input);
  return `id: ${parsed.id}
event: ${parsed.event}
data: ${JSON.stringify(parsed.data)}

`;
}
// src/core/internal.ts
import { z as z43 } from "zod";
var INTERNAL_CALL_ERRORS = Object.freeze({
  createOrganization: Object.freeze(["membership.already_member"]),
  acceptInvitation: Object.freeze(["invitation.invalid", "membership.already_member"]),
  membership: Object.freeze([]),
  updateMemberProfile: Object.freeze(["member.not_found"]),
  abandonOrganization: Object.freeze(["organization.not_abandonable"])
});
var internalCreateOrganizationRequestSchema = z43.strictObject({
  userId: userIdSchema,
  organizationName: organizationNameSchema,
  email: emailSchema.optional(),
  name: personNameSchema.nullable().optional()
});
var internalCreateOrganizationResponseSchema = z43.object({
  organizationId: organizationIdSchema,
  role: z43.literal("owner")
});
var internalAcceptInvitationRequestSchema = z43.strictObject({
  userId: userIdSchema,
  email: emailSchema,
  name: personNameSchema.nullable().optional(),
  invitationToken: invitationTokenSchema
});
var internalAcceptInvitationResponseSchema = z43.object({
  organizationId: organizationIdSchema,
  role: invitableRoleSchema
});
var internalMembershipRequestSchema = z43.strictObject({
  userId: userIdSchema
});
var internalMembershipResponseSchema = z43.discriminatedUnion("found", [
  z43.object({
    found: z43.literal(true),
    organizationId: organizationIdSchema,
    role: roleSchema,
    organizationStatus: organizationStatusSchema
  }),
  z43.object({ found: z43.literal(false) })
]);
var internalUpdateMemberProfileParamsSchema = z43.strictObject({
  userId: userIdSchema
});
var internalUpdateMemberProfileRequestSchema = z43.strictObject({
  email: emailSchema.optional(),
  name: personNameSchema.nullable().optional()
}).refine((body) => body.email !== undefined || body.name !== undefined, {
  message: "Send an email, a name or both"
});
var internalUpdateMemberProfileResponseSchema = z43.object({
  userId: userIdSchema,
  email: emailSchema,
  name: storedNameSchema.nullable()
});
var ABANDON_MAX_AGE_HOURS = 24;
var internalAbandonOrganizationParamsSchema = z43.strictObject({
  organizationId: organizationIdSchema
});
var internalAbandonOrganizationRequestSchema = z43.strictObject({
  userId: userIdSchema
});
var internalAbandonOrganizationResponseSchema = z43.object({
  organizationId: organizationIdSchema,
  status: z43.literal("deleted")
});
// src/core/invitation.ts
import { z as z44 } from "zod";
var invitationSchema = z44.object({
  id: invitationIdSchema,
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.nullable(),
  state: invitationStateSchema,
  invitedByUserId: userIdSchema,
  expiresAt: timestampSchema,
  createdAt: timestampSchema
});
var createInvitationRequestSchema = z44.strictObject({
  email: emailSchema,
  role: invitableRoleSchema,
  teamId: teamIdSchema.optional()
});
var CREATE_INVITATION_ERROR_CODES = [
  "invitation.already_pending",
  "invitation.already_member",
  "invitation.pending_limit",
  "invitation.daily_limit",
  "team.not_found",
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress",
  "auth.unauthenticated",
  "auth.token_expired",
  "auth.token_invalid",
  "auth.forbidden",
  "auth.unavailable",
  "organization.suspended",
  "organization.deleted",
  "rate.limited"
];
var listInvitationsQuerySchema = pageQuerySchema.extend({ state: invitationStateSchema.default("pending") }).strict();
var listInvitationsResponseSchema = pageSchema(invitationSchema);
var invitationParamsSchema = z44.strictObject({
  invitationId: invitationIdSchema
});
// src/core/member.ts
import { z as z45 } from "zod";
var memberSchema = z45.object({
  id: membershipIdSchema,
  userId: userIdSchema,
  email: emailSchema,
  name: storedNameSchema.nullable(),
  role: roleSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var LIST_MEMBERS_MIN_ROLE = "manager";
var listMembersQuerySchema = pageQuerySchema.strict();
var listMembersResponseSchema = pageSchema(memberSchema);
var memberParamsSchema = z45.strictObject({
  membershipId: membershipIdSchema
});
var changeMemberRoleRequestSchema = z45.strictObject({
  role: roleSchema
});
// src/core/organization.ts
import { z as z46 } from "zod";
var organizationSchema = z46.object({
  id: organizationIdSchema,
  name: storedNameSchema,
  region: regionSchema,
  status: organizationStatusSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var renameOrganizationRequestSchema = z46.strictObject({
  name: organizationNameSchema
});
// src/core/team.ts
import { z as z47 } from "zod";
var teamSchema = z47.object({
  id: teamIdSchema,
  name: storedNameSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var createTeamRequestSchema = z47.strictObject({
  name: teamNameSchema
});
var renameTeamRequestSchema = z47.strictObject({
  name: teamNameSchema
});
var listTeamsQuerySchema = pageQuerySchema.strict();
var listTeamsResponseSchema = pageSchema(teamSchema);
var teamParamsSchema = z47.strictObject({
  teamId: teamIdSchema
});
var addTeamMemberRequestSchema = z47.strictObject({
  membershipId: membershipIdSchema
});
var teamMemberSchema = z47.object({
  teamId: teamIdSchema,
  membershipId: membershipIdSchema,
  createdAt: timestampSchema
});
var teamMemberParamsSchema = z47.strictObject({
  teamId: teamIdSchema,
  membershipId: membershipIdSchema
});
var listTeamMembersQuerySchema = pageQuerySchema.strict();
var listTeamMembersResponseSchema = pageSchema(memberSchema);
var LIST_TEAM_MEMBERS_MIN_ROLE = LIST_MEMBERS_MIN_ROLE;
var LIST_TEAM_MEMBERS_ERROR_CODES = [
  "team.not_found",
  "request.invalid",
  "auth.unauthenticated",
  "auth.token_expired",
  "auth.token_invalid",
  "auth.forbidden",
  "auth.unavailable",
  "organization.suspended",
  "organization.deleted",
  "rate.limited"
];
// src/inbox/conversation.ts
import { z as z49 } from "zod";

// src/inbox/values.ts
import { z as z48 } from "zod";
var INBOX_CHANNELS = ["email", "linkedin", "chat"];
var inboxChannelSchema = z48.enum(INBOX_CHANNELS);
var CONVERSATION_CONTROLLERS = ["agent", "rep"];
var conversationControllerSchema = z48.enum(CONVERSATION_CONTROLLERS);
var CONVERSATION_STATES = [
  "agent",
  "awaiting_approval",
  "rep",
  "escalated",
  "closed"
];
var conversationStateSchema = z48.enum(CONVERSATION_STATES);
var MESSAGE_DIRECTIONS = ["inbound", "outbound"];
var messageDirectionSchema = z48.enum(MESSAGE_DIRECTIONS);
var MESSAGE_AUTHOR_KINDS = ["prospect", "agent", "rep"];
var messageAuthorKindSchema = z48.enum(MESSAGE_AUTHOR_KINDS);
var REPLY_LABELS = [
  "positive",
  "question",
  "objection",
  "not_now",
  "wrong_person",
  "unsubscribe",
  "out_of_office",
  "bounce",
  "negative",
  "other"
];
var replyLabelSchema = z48.enum(REPLY_LABELS);
function toReplyLabel(value) {
  const parsed = replyLabelSchema.safeParse(value);
  return parsed.success ? parsed.data : "other";
}
var STOP_SENDING_LABELS = ["unsubscribe"];
var PAUSE_SEQUENCE_LABELS = [
  "bounce",
  "wrong_person"
];
var confidenceSchema = z48.number().min(0).max(1);
var MAX_MESSAGE_BODY_LENGTH = 20000;
var messageBodySchema = z48.string().min(1).max(MAX_MESSAGE_BODY_LENGTH).refine((text) => text.trim().length > 0, "The body is not blank").refine((text) => !hasControlCharacter2(text, true), "No control characters");
var providerMessageIdSchema = z48.string().regex(/^[\x21-\x7e]{1,255}$/);
var MAX_DECISION_NOTE_LENGTH = 500;
var decisionNoteSchema = z48.string().min(1).max(MAX_DECISION_NOTE_LENGTH).refine((text) => text.trim().length > 0, "The note is not blank").refine((text) => !hasControlCharacter2(text, true), "No control characters");
var MAX_STRATEGY_LENGTH = 300;
var MAX_DRAFT_SOURCES = 10;
var DRAFT_SOURCE_KINDS = ["moment", "document_chunk"];
var draftSourceKindSchema = z48.enum(DRAFT_SOURCE_KINDS);
var sourceRefSchema = z48.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/);
var MAX_SOURCE_PASSAGE_LENGTH = 4000;
var DRAFT_HOLD_REASONS = [
  "policy",
  "ungrounded",
  "check_failed",
  "escalated",
  "first_message"
];
var draftHoldReasonSchema = z48.enum(DRAFT_HOLD_REASONS);
var ALWAYS_HELD_REASONS = [
  "ungrounded",
  "check_failed",
  "escalated",
  "first_message"
];
var DRAFT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "sent",
  "superseded",
  "void"
];
var draftStatusSchema = z48.enum(DRAFT_STATUSES);
var DRAFT_AUTHORS = ["agent", "rep"];
var draftAuthorSchema = z48.enum(DRAFT_AUTHORS);
var MESSAGE_FAILURE_REASONS = [
  "provider_rejected",
  "recipient_invalid",
  "suppressed",
  "channel_unavailable",
  "timeout",
  "unknown"
];
var messageFailureReasonSchema = z48.enum(MESSAGE_FAILURE_REASONS);

// src/inbox/conversation.ts
var issueAt = (ctx) => (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
var classificationSchema = z49.strictObject({
  label: replyLabelSchema,
  confidence: confidenceSchema,
  decidedBy: z49.enum(["model", "rep"]),
  correctedByMembershipId: membershipIdSchema.nullable(),
  classifiedAt: timestampSchema
}).superRefine((c, ctx) => {
  if (c.decidedBy === "rep" !== (c.correctedByMembershipId !== null)) {
    issueAt(ctx)("correctedByMembershipId", "Only a correction names who made it");
  }
});
var conversationSchema = z49.strictObject({
  id: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  controller: conversationControllerSchema,
  controllerMembershipId: membershipIdSchema.nullable(),
  state: conversationStateSchema,
  ownerMembershipId: membershipIdSchema.nullable(),
  latestLabel: replyLabelSchema.nullable(),
  pendingDraftCount: z49.number().int().min(0).max(1000),
  lastMessageAt: timestampSchema,
  createdAt: timestampSchema
}).superRefine((c, ctx) => {
  const issue = issueAt(ctx);
  if (c.controller === "rep" !== (c.controllerMembershipId !== null)) {
    issue("controllerMembershipId", "Exactly a Rep-controlled Conversation names its Rep");
  }
  if (c.state === "rep" && c.controller !== "rep") {
    issue("controller", "A Conversation in the rep state is controlled by a Rep");
  }
  if (c.controller === "rep" && c.state !== "rep" && c.state !== "closed") {
    issue("state", "A Rep-controlled Conversation is in the rep or closed state");
  }
});
var messageSchema2 = z49.strictObject({
  id: messageIdSchema,
  conversationId: conversationIdSchema,
  direction: messageDirectionSchema,
  authorKind: messageAuthorKindSchema,
  authorMembershipId: membershipIdSchema.nullable(),
  providerMessageId: providerMessageIdSchema,
  draftId: draftIdSchema.nullable(),
  body: messageBodySchema,
  sentAt: timestampSchema,
  classification: classificationSchema.nullable()
}).superRefine((m, ctx) => {
  const issue = issueAt(ctx);
  if (m.direction === "inbound" !== (m.authorKind === "prospect")) {
    issue("authorKind", "An inbound Message is the Prospect’s and an outbound one is not");
  }
  if (m.authorKind === "rep" !== (m.authorMembershipId !== null)) {
    issue("authorMembershipId", "Exactly a Rep’s Message names the Rep");
  }
  if (m.direction === "inbound" && m.draftId !== null) {
    issue("draftId", "An inbound Message has no Draft");
  }
  if (m.authorKind === "rep" && m.draftId === null) {
    issue("draftId", "A Rep’s Message comes from a Draft; only an Agent’s sequence Message has none");
  }
  if (m.direction === "outbound" && m.classification !== null) {
    issue("classification", "Only an inbound Message has a classification");
  }
});
var sourceSchema = z49.strictObject({
  kind: draftSourceKindSchema,
  sourceRef: sourceRefSchema,
  dealRecordId: dealRecordIdSchema.nullable(),
  documentId: documentIdSchema.nullable(),
  outcome: outcomeSchema.nullable(),
  evidenceCount: z49.number().int().min(1).max(1e5)
}).superRefine((s, ctx) => {
  const issue = issueAt(ctx);
  if (s.kind === "moment") {
    if (s.dealRecordId === null) {
      issue("dealRecordId", "A Moment names its Deal");
    }
    if (s.documentId !== null) {
      issue("documentId", "A Moment has no document");
    }
    if (s.outcome === null) {
      issue("outcome", "A Moment carries its Deal’s Outcome");
    }
  } else {
    if (s.documentId === null) {
      issue("documentId", "A document chunk names its document");
    }
    if (s.dealRecordId !== null) {
      issue("dealRecordId", "A document chunk has no Deal");
    }
    if (s.outcome !== null) {
      issue("outcome", "A document chunk has no Outcome");
    }
  }
});
var sourcePassageSchema = z49.strictObject({
  source: sourceSchema,
  passage: z49.string().min(1).max(MAX_SOURCE_PASSAGE_LENGTH)
});
var draftReasonSchema = z49.strictObject({
  triggerMessageId: messageIdSchema,
  label: replyLabelSchema,
  strategy: z49.string().min(1).max(MAX_STRATEGY_LENGTH)
});
var draftCheckSchema = z49.strictObject({
  name: z49.string().regex(/^[a-z][a-z0-9_]{0,49}$/),
  passed: z49.boolean()
});
var draftSchema = z49.strictObject({
  id: draftIdSchema,
  conversationId: conversationIdSchema,
  author: draftAuthorSchema,
  authorMembershipId: membershipIdSchema.nullable(),
  body: messageBodySchema,
  reason: draftReasonSchema.nullable(),
  sources: z49.array(sourceSchema).max(MAX_DRAFT_SOURCES),
  confidence: confidenceSchema.nullable(),
  ungrounded: z49.boolean(),
  checks: z49.array(draftCheckSchema).max(20),
  hold: draftHoldReasonSchema.nullable(),
  status: draftStatusSchema,
  createdAt: timestampSchema,
  decidedAt: timestampSchema.nullable()
}).superRefine((d, ctx) => {
  const issue = issueAt(ctx);
  const agent = d.author === "agent";
  if (agent !== (d.reason !== null)) {
    issue("reason", "Exactly an Agent Draft has a reason");
  }
  if (agent !== (d.confidence !== null)) {
    issue("confidence", "Exactly an Agent Draft has a confidence");
  }
  if (agent === (d.authorMembershipId !== null)) {
    issue("authorMembershipId", "Exactly a Rep’s Draft names its author");
  }
  if (!agent && (d.sources.length > 0 || d.ungrounded || d.hold !== null)) {
    issue("sources", "A Rep’s Draft has no Sources, is not ungrounded and is not held");
  }
  if (agent && d.ungrounded !== (d.sources.length === 0)) {
    issue("ungrounded", "A Draft is ungrounded exactly when it cites no Source");
  }
  if (new Set(d.sources.map((s) => `${s.kind}:${s.sourceRef}`)).size !== d.sources.length) {
    issue("sources", "A Source is cited once");
  }
  const failedCheck = d.checks.some((c) => !c.passed);
  if ((d.ungrounded || failedCheck) && d.hold === null) {
    issue("hold", "An ungrounded Draft or one that failed a check is always held");
  }
  if (d.ungrounded && d.hold !== null && d.hold !== "ungrounded") {
    issue("hold", "An ungrounded Draft is held as ungrounded, whatever else holds it");
  }
  if (!d.ungrounded && failedCheck && d.hold !== null && d.hold !== "check_failed") {
    issue("hold", "A Draft that failed a check is held as check_failed");
  }
  if (d.hold === "ungrounded" && !d.ungrounded) {
    issue("hold", "Only an ungrounded Draft is held as ungrounded");
  }
  if (d.hold === "check_failed" && !failedCheck) {
    issue("hold", "Only a Draft that failed a check is held as check_failed");
  }
  if (d.status === "pending" && d.hold === null) {
    issue("hold", "A pending Draft waits because it is held");
  }
  if (d.status === "pending" && d.decidedAt !== null) {
    issue("decidedAt", "A pending Draft has no decision time");
  }
});
var DECISION_KINDS = [
  "approve",
  "edit_approve",
  "reject",
  "auto_release",
  "takeover",
  "hand_back"
];
var decisionKindSchema = z49.enum(DECISION_KINDS);
var decisionSchema = z49.strictObject({
  id: decisionIdSchema,
  conversationId: conversationIdSchema,
  draftId: draftIdSchema.nullable(),
  kind: decisionKindSchema,
  decidedByMembershipId: membershipIdSchema.nullable(),
  note: decisionNoteSchema.nullable(),
  acknowledgedUngrounded: z49.boolean(),
  decidedAt: timestampSchema
}).superRefine((d, ctx) => {
  const issue = issueAt(ctx);
  const aboutConversation = d.kind === "takeover" || d.kind === "hand_back";
  if (aboutConversation !== (d.draftId === null)) {
    issue("draftId", "A Draft decision names its Draft and a takeover or hand-back does not");
  }
  if (d.kind === "auto_release" !== (d.decidedByMembershipId === null)) {
    issue("decidedByMembershipId", "Only an automatic release has no member");
  }
  if (d.acknowledgedUngrounded && d.kind !== "approve" && d.kind !== "edit_approve") {
    issue("acknowledgedUngrounded", "Only an approval can acknowledge an ungrounded Draft");
  }
  if (d.note !== null && d.kind !== "reject") {
    issue("note", "Only a rejection carries a note");
  }
});
var APPROVAL_MODES = ["always", "below_confidence", "except"];
var MAX_EXCEPT_LABELS = 10;
var approvalRuleSchema = z49.discriminatedUnion("mode", [
  z49.strictObject({ mode: z49.literal("always") }),
  z49.strictObject({
    mode: z49.literal("below_confidence"),
    threshold: z49.number().gt(0).max(1)
  }),
  z49.strictObject({
    mode: z49.literal("except"),
    labels: z49.array(replyLabelSchema).min(1).max(MAX_EXCEPT_LABELS).refine((labels) => new Set(labels).size === labels.length, "No repeats")
  })
]);
var approvalPolicySchema = z49.strictObject({
  channel: inboxChannelSchema,
  rule: approvalRuleSchema,
  updatedAt: timestampSchema.nullable(),
  updatedByMembershipId: membershipIdSchema.nullable()
});
function holdReasonFor(rule, facts) {
  if (facts.ungrounded) {
    return "ungrounded";
  }
  if (facts.failedCheck) {
    return "check_failed";
  }
  if (facts.escalated) {
    return "escalated";
  }
  if (facts.firstMessage) {
    return "first_message";
  }
  switch (rule.mode) {
    case "always":
      return "policy";
    case "below_confidence":
      return facts.confidence < rule.threshold ? "policy" : null;
    case "except":
      return rule.labels.includes(facts.label) ? null : "policy";
  }
}
var conversationParamsSchema = z49.strictObject({ conversationId: conversationIdSchema });
var conversationMessageParamsSchema = z49.strictObject({
  conversationId: conversationIdSchema,
  messageId: messageIdSchema
});
var draftParamsSchema = z49.strictObject({ draftId: draftIdSchema });
var channelParamsSchema = z49.strictObject({ channel: inboxChannelSchema });
var inboxKeyedHeadersSchema = z49.object({ "idempotency-key": idempotencyKeySchema });
var conversationCursorSchema = z49.strictObject({
  lastMessageAt: timestampSchema,
  id: conversationIdSchema
});
var listConversationsQuerySchema = pageQuerySchema.extend({
  channel: inboxChannelSchema.optional(),
  state: conversationStateSchema.optional(),
  controller: conversationControllerSchema.optional(),
  label: replyLabelSchema.optional(),
  prospectId: prospectIdSchema.optional()
}).strict();
var conversationPageSchema = pageSchema(conversationSchema);
var messageCursorSchema = z49.strictObject({
  sentAt: timestampSchema,
  id: messageIdSchema
});
var listMessagesQuerySchema = pageQuerySchema.strict();
var messagePageSchema = pageSchema(messageSchema2);
var correctClassificationRequestSchema = z49.strictObject({ label: replyLabelSchema });
var conversationActionRequestSchema = z49.strictObject({});
var replyRequestSchema = z49.strictObject({ body: messageBodySchema });
var approveDraftRequestSchema = z49.strictObject({
  body: messageBodySchema.optional(),
  acknowledgeUngrounded: z49.boolean().default(false)
});
var rejectDraftRequestSchema = z49.strictObject({ note: decisionNoteSchema.optional() });
var draftSourcesSchema = z49.strictObject({
  items: z49.array(sourcePassageSchema).max(MAX_DRAFT_SOURCES)
});
var approvalQueueItemSchema = z49.strictObject({
  draft: draftSchema,
  channel: inboxChannelSchema,
  prospectId: prospectIdSchema,
  ownerMembershipId: membershipIdSchema.nullable(),
  canApprove: z49.boolean()
});
var approvalQueueCursorSchema = z49.strictObject({
  createdAt: timestampSchema,
  id: draftIdSchema
});
var listApprovalQueueQuerySchema = pageQuerySchema.extend({
  channel: inboxChannelSchema.optional(),
  conversationId: conversationIdSchema.optional()
}).strict();
var approvalQueuePageSchema = pageSchema(approvalQueueItemSchema);
var decisionCursorSchema = z49.strictObject({
  decidedAt: timestampSchema,
  id: decisionIdSchema
});
var listDecisionsQuerySchema = pageQuerySchema.extend({
  conversationId: conversationIdSchema.optional(),
  draftId: draftIdSchema.optional(),
  kind: decisionKindSchema.optional(),
  from: timestampSchema.optional(),
  to: timestampSchema.optional()
}).strict().refine((q) => q.from === undefined || q.to === undefined || Date.parse(q.to) > Date.parse(q.from), { message: "The range ends after it starts", path: ["to"] });
var decisionPageSchema = pageSchema(decisionSchema);
var approvalPoliciesSchema = z49.strictObject({
  items: z49.array(approvalPolicySchema).max(3)
});
var setApprovalPolicyRequestSchema = z49.strictObject({ rule: approvalRuleSchema });
var ingestBodySchema = z49.string().max(MAX_MESSAGE_BODY_LENGTH).transform((text) => text.replace(/\r\n?/g, `
`).split("").filter((ch) => !hasControlCharacter2(ch, true)).join("")).pipe(messageBodySchema);
var ingestMessageRequestSchema = z49.strictObject({
  channel: inboxChannelSchema,
  providerMessageId: providerMessageIdSchema,
  prospectId: prospectIdSchema,
  direction: messageDirectionSchema,
  body: ingestBodySchema,
  draftId: draftIdSchema.optional(),
  sentAt: timestampSchema
}).superRefine((m, ctx) => {
  if (m.direction === "inbound" && m.draftId !== undefined) {
    issueAt(ctx)("draftId", "An inbound Message has no Draft");
  }
});
var ingestMessageResultSchema = z49.strictObject({
  message: messageSchema2,
  created: z49.boolean()
});
var draftReleaseSchema = z49.strictObject({
  draftId: draftIdSchema,
  conversationId: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  body: messageBodySchema
});
// src/inbox/errors.ts
var INBOX_ERRORS = {
  ...defineErrors("inbox", {
    conversation_not_found: { status: 404, message: "The Conversation was not found." },
    message_not_found: { status: 404, message: "The Message was not found." },
    draft_not_found: { status: 404, message: "The Draft was not found." },
    draft_not_pending: { status: 409, message: "The Draft is no longer waiting for a decision." },
    not_conversation_owner: {
      status: 403,
      message: "This Conversation is not yours to act on."
    },
    draft_ungrounded: {
      status: 422,
      message: "The Draft cites no Playbook source. Confirm it before it is approved."
    },
    already_controlled: {
      status: 409,
      message: "Another Rep has already taken over this Conversation."
    },
    takeover_required: { status: 409, message: "Take over the Conversation before replying." },
    not_taken_over: { status: 409, message: "The Conversation is not taken over." },
    conversation_closed: { status: 409, message: "The Conversation is closed." },
    message_not_inbound: { status: 409, message: "Only a reply from a Prospect has a label." },
    prospect_not_found: { status: 404, message: "The Prospect was not found." },
    prospect_suppressed: {
      status: 409,
      message: "The Prospect asked not to be contacted on this channel."
    }
  })
};
// src/inbox/events.ts
import { z as z50 } from "zod";
var messageApprovedEvent = defineEvent("message.approved", 1, z50.strictObject({
  draftId: draftIdSchema,
  conversationId: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  approvedByMembershipId: membershipIdSchema.nullable(),
  edited: z50.boolean(),
  acknowledgedUngrounded: z50.boolean(),
  approvedAt: timestampSchema
}));
var messageSentEvent = defineEvent("message.sent", 1, z50.strictObject({
  draftId: draftIdSchema,
  conversationId: conversationIdSchema,
  messageId: messageIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  sentAt: timestampSchema
}));
var messageFailedEvent = defineEvent("message.failed", 1, z50.strictObject({
  draftId: draftIdSchema,
  conversationId: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  reason: messageFailureReasonSchema,
  retryable: z50.boolean(),
  failedAt: timestampSchema
}));
var replyClassifiedEvent = defineEvent("reply.classified", 1, z50.strictObject({
  conversationId: conversationIdSchema,
  messageId: messageIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  label: replyLabelSchema,
  confidence: confidenceSchema,
  classifiedAt: timestampSchema
}));
var conversationTakenOverEvent = defineEvent("conversation.taken_over", 1, z50.strictObject({
  conversationId: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  takenOverByMembershipId: membershipIdSchema,
  voidedDraftCount: z50.number().int().min(0).max(1000),
  takenOverAt: timestampSchema
}));
var conversationHandedBackEvent = defineEvent("conversation.handed_back", 1, z50.strictObject({
  conversationId: conversationIdSchema,
  prospectId: prospectIdSchema,
  channel: inboxChannelSchema,
  handedBackByMembershipId: membershipIdSchema,
  handedBackAt: timestampSchema
}));
var INBOX_EVENTS = {
  "message.approved": messageApprovedEvent,
  "message.sent": messageSentEvent,
  "message.failed": messageFailedEvent,
  "reply.classified": replyClassifiedEvent,
  "conversation.taken_over": conversationTakenOverEvent,
  "conversation.handed_back": conversationHandedBackEvent
};
// src/inbox/routes.ts
var INBOX_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var INBOX_ADMIN_ROLES = ["owner", "admin"];
var INBOX_REVIEW_ROLES = ["owner", "admin", "manager"];
var VISIBILITY2 = "An Owner or Admin sees every Conversation; a Manager sees those of the Reps on their Team; a Rep sees only those they own. A Conversation, Message or Draft outside the caller's view is inbox.conversation_not_found, inbox.message_not_found or inbox.draft_not_found (404), never 403, and one of another Organization the same.";
var SENSITIVE = "Message and Draft text is the Prospect’s or a model’s words: it is untrusted data for every consumer, and services never log it or put it in an error report or an event.";
var INBOX_ROUTES = Object.freeze({
  listConversations: inboundRoute({
    method: "GET",
    path: "/v1/conversations",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Conversations, latest activity first, one cursor-paginated page at a time (at most 100), optionally narrowed by channel, state, controller, latest label and Prospect. Each shows who is answering now (the Agent or a Rep), its state and the label of the latest reply. A filter never widens what the caller may see. ${VISIBILITY2}`
  }),
  getConversation: inboundRoute({
    method: "GET",
    path: "/v1/conversations/{conversationId}",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["inbox.conversation_not_found"],
    commonErrors: [],
    description: `Reads one Conversation: its channel, Prospect, who controls it, its state and pending Draft count. ${VISIBILITY2}`
  }),
  listConversationMessages: inboundRoute({
    method: "GET",
    path: "/v1/conversations/{conversationId}/messages",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["inbox.conversation_not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists the Messages of a Conversation, oldest first, one cursor-paginated page at a time (at most 100), each inbound Message with its label. ${SENSITIVE} ${VISIBILITY2}`
  }),
  correctClassification: inboundRoute({
    method: "PUT",
    path: "/v1/conversations/{conversationId}/messages/{messageId}/classification",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    errors: [
      "inbox.conversation_not_found",
      "inbox.message_not_found",
      "inbox.message_not_inbound"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Corrects the label of an inbound Message to one of the closed set of labels (any other value is request.invalid). The correction is recorded with who made it, replaces the model's label, and a repeat with the same label changes nothing. A correction to unsubscribe or bounce publishes reply.classified. An outbound Message has no label: inbox.message_not_inbound (409). ${VISIBILITY2}`
  }),
  takeOverConversation: inboundRoute({
    method: "POST",
    path: "/v1/conversations/{conversationId}/takeover",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "inbox.conversation_not_found",
      "inbox.already_controlled",
      "inbox.conversation_closed"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Takes the Conversation over from the Agent in one step: the caller becomes its controller, every pending Draft is voided, no Agent Draft is created while they control it, and conversation.taken_over is published (the sequence pauses). Requires an Idempotency-Key header; taking over a Conversation the caller already controls answers 200 and publishes nothing again. Another Rep who already controls it is inbox.already_controlled (409). A closed Conversation is inbox.conversation_closed (409). A Rep can take over only what they own; a Manager, Admin or Owner may step in on any they can see. The full history, labels and cited Sources stay readable. ${VISIBILITY2}`
  }),
  handBackConversation: inboundRoute({
    method: "POST",
    path: "/v1/conversations/{conversationId}/handback",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "inbox.conversation_not_found",
      "inbox.not_conversation_owner",
      "inbox.not_taken_over"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Hands the Conversation back to the Agent: new replies are classified and drafted again, and conversation.handed_back is published. Requires an Idempotency-Key header; a replay answers the same result and publishes once. Only the Rep who took it over, or an Admin or Owner, may hand it back; any other caller who can see it gets inbox.not_conversation_owner (403). A Conversation no Rep controls is inbox.not_taken_over (409). ${VISIBILITY2}`
  }),
  replyToConversation: inboundRoute({
    method: "POST",
    path: "/v1/conversations/{conversationId}/replies",
    roles: INBOX_ALL_ROLES,
    success: [202],
    idempotent: true,
    keyRequired: true,
    errors: [
      "inbox.conversation_not_found",
      "inbox.not_conversation_owner",
      "inbox.takeover_required",
      "inbox.conversation_closed",
      "inbox.prospect_suppressed"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `A Rep replies from the inbox, and the text is sent through the Conversation's channel: core records an approved Draft authored by the Rep and publishes message.approved; the channel service sends it. Answers 202 with that Draft; the Message exists once the channel confirms with message.sent. Requires an Idempotency-Key header: a replay answers the same Draft and sends once. Only the Rep who controls the Conversation may reply (inbox.not_conversation_owner, 403); one the Agent still controls is inbox.takeover_required (409); a closed one is inbox.conversation_closed (409); a Prospect who asked to stop on the channel is inbox.prospect_suppressed (409) and nothing is sent. ${SENSITIVE} ${VISIBILITY2}`
  }),
  listApprovalQueue: inboundRoute({
    method: "GET",
    path: "/v1/approvals",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists the Drafts waiting for a person, oldest first, one cursor-paginated page at a time (at most 100), optionally narrowed by channel or Conversation. Each entry says whether the caller may decide it (canApprove) and which Rep owns the Conversation. ${VISIBILITY2}`
  }),
  getDraft: inboundRoute({
    method: "GET",
    path: "/v1/drafts/{draftId}",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["inbox.draft_not_found"],
    commonErrors: [],
    description: `Reads one Draft with its reason (the reply it answers, its label and the strategy), its confidence, its checks, why it is held, and its cited Sources with their Outcome and evidence count. ${SENSITIVE} ${VISIBILITY2}`
  }),
  getDraftSources: inboundRoute({
    method: "GET",
    path: "/v1/drafts/{draftId}/sources",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["inbox.draft_not_found"],
    commonErrors: ["server.unavailable", "server.timeout"],
    description: `Reads the passage of each Source a Draft cites (a Moment or a Playbook document passage) with its Deal Outcome and evidence count, resolved from the Playbook for display only. The passages are the Organization's own content treated as untrusted text. If the Playbook cannot answer in time the route answers server.unavailable or server.timeout; the Draft is still readable. ${VISIBILITY2}`
  }),
  approveDraft: inboundRoute({
    method: "POST",
    path: "/v1/drafts/{draftId}/approve",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "inbox.draft_not_found",
      "inbox.draft_not_pending",
      "inbox.not_conversation_owner",
      "inbox.draft_ungrounded",
      "inbox.prospect_suppressed",
      "inbox.conversation_closed"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Approves a pending Draft, optionally with edited text (the edited text is what is sent; the Decision is recorded as edit_approve with who and when), and publishes exactly one message.approved. The Decision and the event both record acknowledgedUngrounded. Requires an Idempotency-Key header: a replay answers the same result and publishes once. A Draft already decided, sent, superseded or voided is inbox.draft_not_pending (409). A Draft with no Source is inbox.draft_ungrounded (422) unless the body sets acknowledgeUngrounded to true. Only the Rep who owns the Conversation, a Manager for their Team's, or an Admin or Owner may approve; another caller who can see it gets inbox.not_conversation_owner (403). A Prospect who asked to stop on the channel is inbox.prospect_suppressed (409). ${SENSITIVE} ${VISIBILITY2}`
  }),
  rejectDraft: inboundRoute({
    method: "POST",
    path: "/v1/drafts/{draftId}/reject",
    roles: INBOX_ALL_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: ["inbox.draft_not_found", "inbox.draft_not_pending", "inbox.not_conversation_owner"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: `Rejects a pending Draft with an optional short note, which is recorded with who and when. Nothing is sent. Requires an Idempotency-Key header: a replay answers the same result. Who may reject is who may approve (inbox.not_conversation_owner, 403 for the rest). A Draft no longer pending is inbox.draft_not_pending (409). ${VISIBILITY2}`
  }),
  listDecisions: inboundRoute({
    method: "GET",
    path: "/v1/decisions",
    roles: INBOX_REVIEW_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists the record of approvals, edits, rejections, automatic releases, takeovers and hand-backs, latest first, one cursor-paginated page at a time (at most 100), optionally narrowed by Conversation, Draft, kind and time range. Each entry says who decided and when. Owner and Admin see all; a Manager sees those of Conversations of their Team's Reps; a Rep is auth.forbidden.`
  }),
  listApprovalPolicies: inboundRoute({
    method: "GET",
    path: "/v1/approval-policies",
    roles: INBOX_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the approval rule of every channel (always, below a confidence, or except for named labels), the default being that every Draft waits for a person. Owner and Admin only; any other role is auth.forbidden."
  }),
  setApprovalPolicy: inboundRoute({
    method: "PUT",
    path: "/v1/approval-policies/{channel}",
    roles: INBOX_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Replaces the approval rule of one channel; a repeat with the same body changes nothing, so a retry is safe. The rule never releases an ungrounded Draft, one that failed a check, one from an escalated Conversation, or the first message to a Prospect: those always wait for a person and there is no setting for it. A rule that is not one of the three shapes is request.invalid. Owner and Admin only."
  }),
  ingestMessage: inboundRoute({
    method: "POST",
    path: "/internal/messages",
    roles: [],
    internal: true,
    success: [201, 200],
    idempotent: true,
    errors: ["inbox.prospect_not_found"],
    commonErrors: ["request.invalid", "auth.unauthenticated", "server.unavailable"],
    description: `Internal: a channel service posts every inbound and outbound Message with the shared secret (ADR 0013); no user token. The service derives the Organization from the Prospect id (never taken from the body); a Prospect id it does not know is inbox.prospect_not_found (404) and nothing is stored. The body is at most 20,000 characters; line endings are normalised and other control characters dropped. Idempotent on channel plus provider message id: the first post stores the Message and answers 201, any repeat answers 200 with the same Message and stores nothing. Core finds or creates the Conversation for the Prospect and channel, queues classification of an inbound Message, and never calls a vendor. ${SENSITIVE}`
  }),
  getDraftRelease: inboundRoute({
    method: "GET",
    path: "/internal/drafts/{draftId}/release",
    roles: [],
    internal: true,
    success: [200],
    idempotent: false,
    errors: ["inbox.draft_not_found", "inbox.draft_not_pending"],
    commonErrors: ["auth.unauthenticated", "server.unavailable"],
    description: `Internal: after message.approved, the channel service reads the text to send with the Draft id (also its idempotency key) and the shared secret (ADR 0013); events carry no text. A Draft that is not approved (rejected, voided because a Rep took over, superseded) is inbox.draft_not_pending (409) and must not be sent. ${SENSITIVE}`
  })
});
// src/inquiry/errors.ts
var INQUIRY_ERRORS = {
  ...defineErrors("inquiry", {
    origin_not_allowed: { status: 403, message: "This site is not allowed to send Inquiries." },
    key_invalid: { status: 404, message: "The form was not found." },
    consent_wording_missing: {
      status: 422,
      message: "The consent wording shown with the form is missing or out of date."
    },
    embed_invalid: { status: 422, message: "The embed settings are not valid." },
    not_found: { status: 404, message: "The Inquiry was not found." },
    retries_exhausted: {
      status: 409,
      message: "The callback has used all its attempts."
    }
  })
};
// src/inquiry/events.ts
import { z as z51 } from "zod";
var voiceInquiryReceivedEvent = defineEvent("voice.inquiry.received", 1, z51.strictObject({
  inquiryId: inquiryIdSchema,
  source: inquirySourceSchema,
  prospectId: prospectIdSchema,
  chatId: chatIdSchema.nullable(),
  callId: callIdSchema.nullable(),
  receivedAt: timestampSchema
}));
var INQUIRY_EVENTS = {
  "voice.inquiry.received": voiceInquiryReceivedEvent
};
// src/inquiry/inquiry.ts
import { z as z52 } from "zod";
var inquiryCallbackSchema = z52.strictObject({
  state: inquiryCallbackStateSchema,
  skipReason: inquirySkipReasonSchema.nullable(),
  attempts: z52.number().int().min(0).max(MAX_CALLBACK_ATTEMPTS),
  nextAttemptAt: timestampSchema.nullable(),
  lastAttemptAt: timestampSchema.nullable()
}).superRefine((cb, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  if (cb.state === "skipped" !== (cb.skipReason !== null)) {
    issue("skipReason", "Only a skipped callback has a reason");
  }
  if (cb.state !== "no_answer" && cb.nextAttemptAt !== null) {
    issue("nextAttemptAt", "Only a callback waiting for a retry has a next attempt");
  }
  if (cb.state === "not_applicable" && cb.attempts !== 0) {
    issue("attempts", "A callback that does not apply was never dialled");
  }
});
var inquiryConsentSchema = z52.strictObject({
  wordingId: consentWordingIdSchema,
  wordingVersion: z52.number().int().min(1),
  sourceUrl: sourceUrlSchema,
  phoneGranted: z52.boolean()
});
var inquirySchema = z52.strictObject({
  id: inquiryIdSchema,
  source: inquirySourceSchema,
  prospectId: prospectIdSchema,
  assignedToMembershipId: membershipIdSchema.nullable(),
  chatId: chatIdSchema.nullable(),
  callId: callIdSchema.nullable(),
  consent: inquiryConsentSchema.nullable(),
  callback: inquiryCallbackSchema,
  qualification: qualificationSchema,
  receivedAt: timestampSchema
}).superRefine((inq, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  if (inq.source === "form" && inq.consent === null) {
    issue("consent", "A form Inquiry carries its consent evidence");
  }
  if (inq.source === "chat" && inq.chatId === null) {
    issue("chatId", "A Chat Inquiry names its Chat");
  }
  if (inq.source !== "chat" && inq.chatId !== null) {
    issue("chatId", "Only a Chat Inquiry names a Chat");
  }
  if (inq.source === "call" && inq.callId === null) {
    issue("callId", "A Call Inquiry names its Call");
  }
  if (inq.source !== "form" && inq.callback.state !== "not_applicable" && inq.consent === null) {
    issue("callback", "A callback needs the consent evidence it was based on");
  }
  const dialled = !["not_applicable", "skipped"].includes(inq.callback.state);
  if (dialled && inq.consent?.phoneGranted !== true) {
    issue("callback", "A callback is placed only with phone consent (ADR 0003)");
  }
  if (inq.source === "call" && inq.callback.state !== "not_applicable") {
    issue("callback", "A Call Inquiry is not called back");
  }
});
var inquiryParamsSchema = z52.strictObject({ inquiryId: inquiryIdSchema });
var inquiryCursorSchema = z52.strictObject({
  receivedAt: timestampSchema,
  id: inquiryIdSchema
});
var listInquiriesQuerySchema = pageQuerySchema.extend({
  source: inquirySourceSchema.optional(),
  callbackState: z52.enum(INQUIRY_CALLBACK_STATES).optional(),
  prospectId: prospectIdSchema.optional(),
  from: timestampSchema.optional(),
  to: timestampSchema.optional()
}).strict().refine((q) => q.from === undefined || q.to === undefined || Date.parse(q.to) > Date.parse(q.from), { message: "The range ends after it starts", path: ["to"] });
var inquiryPageSchema = pageSchema(inquirySchema);
var inquiryKeyedHeadersSchema = z52.object({ "idempotency-key": idempotencyKeySchema });
var inquiryEmbedSchema = z52.strictObject({
  publishableKey: inquiryKeySchema,
  allowedOrigins: z52.array(allowedOriginSchema).max(MAX_ALLOWED_ORIGINS),
  consentWordingId: consentWordingIdSchema.nullable(),
  updatedAt: timestampSchema.nullable()
});
var setInquiryEmbedRequestSchema = z52.strictObject({
  allowedOrigins: z52.array(allowedOriginSchema).max(MAX_ALLOWED_ORIGINS).refine((o) => new Set(o).size === o.length, "No repeats"),
  consentWordingId: consentWordingIdSchema
});
var publicInquiryParamsSchema = z52.strictObject({ key: inquiryKeySchema });
var publicOriginHeadersSchema = z52.object({ origin: allowedOriginSchema });
var publicInquiryHeadersSchema = z52.object({
  origin: allowedOriginSchema,
  "idempotency-key": idempotencyKeySchema
});
var publicNameSchema = boundedTextSchema(200);
var publicInquiryFormViewSchema = z52.strictObject({
  organizationName: publicNameSchema,
  wordingId: consentWordingIdSchema,
  wordingVersion: z52.number().int().min(1),
  wordingText: boundedTextSchema(5000),
  aiNotice: boundedTextSchema(500)
});
var publicInquiryRequestSchema = z52.strictObject({
  name: personNameSchema,
  phone: rawPhoneSchema,
  email: emailSchema.optional(),
  message: inquiryMessageSchema.optional(),
  consentWordingId: consentWordingIdSchema,
  consentWordingVersion: z52.number().int().min(1),
  callbackConsent: z52.boolean(),
  sourceUrl: sourceUrlSchema,
  website: z52.string().max(MAX_HONEYPOT_LENGTH).default("")
});
var publicInquiryReceiptSchema = z52.strictObject({
  received: z52.literal(true),
  receivedAt: timestampSchema
});
// src/inquiry/routes.ts
var INQUIRY_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var INQUIRY_ADMIN_ROLES = ["owner", "admin"];
var INQUIRY_MANAGER_ROLES = [
  "owner",
  "admin",
  "manager"
];
var VISIBILITY3 = "An Owner or Admin sees every Inquiry; a Manager sees those assigned to Reps of their Team; a Rep sees only those assigned to them. An Inquiry outside the caller's view is inquiry.not_found (404), never 403.";
var INQUIRY_ROUTES = Object.freeze({
  publicGetInquiryForm: inboundRoute({
    method: "GET",
    path: "/v1/public/inquiry/{key}/form",
    roles: [],
    public: true,
    success: [200],
    idempotent: false,
    errors: ["inquiry.origin_not_allowed", "inquiry.key_invalid"],
    commonErrors: [...PUBLIC_ERRORS],
    description: "Public: no token, no Organization; the Organization's publishable key in the path stands in for both. Returns what the embedded Inquiry form displays: the Organization's name, the exact Consent Wording to show beside the callback box with its id and version (the form sends them back), and the notice that an AI will make the call. Nothing about any Prospect, Rep or internal id. The Origin header must be one of the Organization's allowed origins (inquiry.origin_not_allowed, 403); an unknown, rotated or not-yet-live key is inquiry.key_invalid (404). Rate-limited by client address and by key (rate.limited, 429, with a Retry-After header). The key is a secret-like identifier: services redact it from logs, traces and error reports."
  }),
  publicSubmitInquiry: inboundRoute({
    method: "POST",
    path: "/v1/public/inquiry/{key}/inquiries",
    roles: [],
    public: true,
    success: [201, 200],
    idempotent: true,
    keyRequired: true,
    errors: [
      "inquiry.origin_not_allowed",
      "inquiry.key_invalid",
      "inquiry.consent_wording_missing"
    ],
    commonErrors: [
      ...PUBLIC_ERRORS,
      "request.idempotency_key_reused",
      "request.idempotency_in_progress"
    ],
    description: "Public: no token, no Organization; the Organization's publishable key in the path stands in for both. A Prospect sends an Inquiry from the embedded form with their name, phone number, optional work email and message, the Consent Wording id and version the form displayed, whether they agreed to the callback, and the page address the form was on. The wording version and the page address are required: without them the body is request.invalid, and a version that is not the one the form displays is inquiry.consent_wording_missing (422), with nothing stored. The Origin header must be an allowed origin (inquiry.origin_not_allowed, 403). Requires an Idempotency-Key header (16 to 128 characters; the client generates one per submission): a replay answers the original receipt with 200 and stores one Inquiry and places one callback, the same key with another body is request.idempotency_key_reused, and the same key while the first request runs is request.idempotency_in_progress. Answers 201 with a receipt that says only that it arrived and whether a call is coming: no Inquiry, Prospect or Rep id. Core upserts the Prospect and records the Contact Consent for the phone channel from the wording version, the page address and the time; with the box unticked the Inquiry is stored and no call is placed. A filled honeypot (website) is answered exactly as a real request and stores nothing. Rate-limited by client address and by key (rate.limited, 429, with a Retry-After header). Publishes voice.inquiry.received. The key in the path is a secret-like identifier: services redact it from logs, traces and error reports."
  }),
  getInquiryEmbed: inboundRoute({
    method: "GET",
    path: "/v1/inquiry-embed",
    roles: INQUIRY_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description: "Reads the Organization's Inquiry form and Chat settings: the publishable key, the allowed origins and the Consent Wording the form displays. Owner and Admin only; any other role is auth.forbidden. The key is not a credential for anything but these public routes, and services redact it from logs."
  }),
  setInquiryEmbed: inboundRoute({
    method: "PUT",
    path: "/v1/inquiry-embed",
    roles: INQUIRY_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    errors: ["inquiry.embed_invalid"],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Replaces the allowed origins (at most 20 exact web origins: https, or http on localhost; no path and no wildcard) and the Consent Wording the form displays; a repeat with the same body changes nothing, so a retry is safe. A wording that does not exist or does not cover the phone channel is inquiry.embed_invalid (422). Owner and Admin only."
  }),
  rotateInquiryEmbedKey: inboundRoute({
    method: "POST",
    path: "/v1/inquiry-embed/rotate-key",
    roles: INQUIRY_ADMIN_ROLES,
    success: [200],
    idempotent: true,
    keyRequired: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Issues a new publishable key; the old one stops working at once (inquiry.key_invalid on the public routes), so every embed must be updated. Requires an Idempotency-Key header: a replay answers the same new key and rotates once. Owner and Admin only."
  }),
  listInquiries: inboundRoute({
    method: "GET",
    path: "/v1/inquiries",
    roles: INQUIRY_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Inquiries, latest first, one cursor-paginated page at a time (at most 100), optionally narrowed by source (form, chat or call), callback state, Prospect and a time range. A filter never widens what the caller may see. Each Inquiry shows its callback state and, when no callback happened, the reason. ${VISIBILITY3}`
  }),
  getInquiry: inboundRoute({
    method: "GET",
    path: "/v1/inquiries/{inquiryId}",
    roles: INQUIRY_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["inquiry.not_found"],
    commonErrors: [],
    description: `Reads one Inquiry with its Qualification answers, callback state, and the Contact Consent evidence it was based on. ${VISIBILITY3}`
  }),
  retryInquiryCallback: inboundRoute({
    method: "POST",
    path: "/v1/inquiries/{inquiryId}/callback",
    roles: INQUIRY_MANAGER_ROLES,
    success: [202],
    idempotent: true,
    keyRequired: true,
    errors: [
      "inquiry.not_found",
      "inquiry.retries_exhausted",
      "agent.paused",
      "agent.consent_required",
      "agent.outside_hours"
    ],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description: "Asks the Inbound Agent to place a callback again for an Inquiry whose callback was skipped or did not connect. It is queued, not dialled in the request, and every gate is checked again at dial time: a paused Agent is agent.paused (409), no Contact Consent for the phone channel (or one revoked) is agent.consent_required (409), and a time outside the calling hours is agent.outside_hours (409). Nothing can override those checks (ADR 0003). A callback that already has the maximum number of attempts (including after retries_exhausted) is inquiry.retries_exhausted (409) and nothing is queued, so a retry never pushes attempts past the maximum. Requires an Idempotency-Key header: a replay answers 202 without queueing a second callback. Owner, Admin, and a Manager for Inquiries assigned to Reps of their Team."
  })
});
// src/marketing/demo-request.ts
import { z as z53 } from "zod";
var MAX_DEMO_REQUEST_MESSAGE_LENGTH = 2000;
var MAX_DEMO_REQUEST_FIELD_LENGTH = 200;
function hasForbiddenControlCharacter(text) {
  for (let index = 0;index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    const allowedWhitespace = code === 10 || code === 13 || code === 9;
    if (code < 32 && !allowedWhitespace || code >= 127 && code <= 159) {
      return true;
    }
  }
  return false;
}
var demoRequestMessageSchema = z53.string().max(MAX_DEMO_REQUEST_MESSAGE_LENGTH).refine((text) => !hasForbiddenControlCharacter(text), "No control characters").transform((text) => text.trim());
var demoRequestSourcePageSchema = z53.string().max(MAX_DEMO_REQUEST_FIELD_LENGTH).regex(/^\/[\x21-\x7e]*$/, "An absolute path");
var createDemoRequestRequestSchema = z53.strictObject({
  name: personNameSchema,
  workEmail: emailSchema,
  companyName: organizationNameSchema,
  message: demoRequestMessageSchema.optional(),
  sourcePage: demoRequestSourcePageSchema,
  website: z53.string().max(MAX_DEMO_REQUEST_FIELD_LENGTH).default("")
});
var createDemoRequestResponseSchema = z53.object({
  id: demoRequestIdSchema
});
var createDemoRequest = Object.freeze({
  method: "POST",
  path: "/v1/marketing/demo-requests",
  public: true,
  idempotencyKey: "required",
  success: [201, 200],
  errors: ["marketing.invalid_request", "marketing.rate_limited"],
  commonErrors: [
    "request.too_large",
    "request.unsupported_media_type",
    "request.idempotency_key_reused",
    "request.idempotency_in_progress",
    "server.internal",
    "server.unavailable",
    "server.timeout"
  ],
  description: "Public: no token, no Organization. A Visitor submits a Demo Request: name, work email, company name, an optional message of at most 2,000 characters, the page it came from and a hidden honeypot field. Requires an Idempotency-Key header (16 to 128 characters; the client generates one per form submission): a replay returns the original acknowledgement with 200 instead of storing a second Demo Request, the same key with a different body is request.idempotency_key_reused, and the same key while the first request is running is request.idempotency_in_progress. Answers 201 with only the id of the new Demo Request. A filled honeypot is answered exactly as a real request (201 with an id) and stores nothing. A body that fails validation, has an unknown key, or a missing or malformed Idempotency-Key header is marketing.invalid_request (400). The limit per client address is marketing.rate_limited (429) with details.retryAfter in seconds and a Retry-After header. A body over the size limit is request.too_large."
});
var MARKETING_ROUTES = Object.freeze({ createDemoRequest });
var CREATE_DEMO_REQUEST_ERROR_CODES = [
  ...createDemoRequest.errors,
  ...createDemoRequest.commonErrors
];
// src/marketing/errors.ts
var MARKETING_ERRORS = {
  ...defineErrors("marketing", {
    invalid_request: { status: 400, message: "The request is not valid." },
    rate_limited: {
      status: 429,
      message: "Too many requests from this address. Try again later."
    }
  })
};
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

// src/playbook/sales-history-errors.ts
import { z as z56 } from "zod";

// src/playbook/rights.ts
import { z as z55 } from "zod";

// src/playbook/rights-wording.ts
import { z as z54 } from "zod";
var MAX_RIGHTS_HEADING_LENGTH = 200;
var MAX_RIGHTS_PARAGRAPHS = 10;
var MAX_RIGHTS_TEXT_LENGTH = 2000;
var textSchema = (max) => z54.string().min(1).max(max).refine(isWellFormedText, "Well-formed text only").refine((text) => !hasStrippableCharacter(text), "No control or direction characters").refine((text) => text.trim() === text, "No surrounding spaces");
var rightsWordingSchema = z54.strictObject({
  heading: textSchema(MAX_RIGHTS_HEADING_LENGTH),
  paragraphs: z54.array(textSchema(MAX_RIGHTS_TEXT_LENGTH)).min(1).max(MAX_RIGHTS_PARAGRAPHS),
  checkbox: textSchema(MAX_RIGHTS_TEXT_LENGTH),
  draft: z54.literal(true).optional()
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
var rightsWordingVersionSchema = z55.number().int().min(1).max(MAX_RIGHTS_WORDING_VERSION);
var rightsConfirmationSchema = z55.object({
  wordingVersion: rightsWordingVersionSchema,
  confirmedByUserId: userIdSchema,
  confirmedAt: timestampSchema
});
var rightsStatusSchema = z55.object({
  currentWordingVersion: rightsWordingVersionSchema,
  confirmation: rightsConfirmationSchema.nullable(),
  confirmed: z55.boolean(),
  currentWording: rightsWordingSchema.optional()
}).refine((status) => status.confirmed === (status.confirmation !== null && status.confirmation.wordingVersion === status.currentWordingVersion), { message: "Confirmed exactly when the stored version is the current one", path: ["confirmed"] });
var confirmRightsRequestSchema = z55.strictObject({
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
var rightsRequiredDetailsSchema = z56.strictObject({
  wordingVersion: z56.number().int().min(1).max(MAX_RIGHTS_WORDING_VERSION)
});

// src/playbook/all.ts
var ALL_PLAYBOOK_ROUTES = Object.freeze({ ...PLAYBOOK_ROUTES, ...SALES_HISTORY_ROUTES, ...SEARCH_ROUTES });
var ALL_PLAYBOOK_ERRORS = Object.freeze({ ...PLAYBOOK_ERRORS, ...SALES_HISTORY_ERRORS });
// src/playbook/call.ts
import { z as z57 } from "zod";
var callShape = z57.object({
  id: callIdSchema,
  dealId: dealIdSchema,
  dealRecordId: dealRecordIdSchema,
  dealOutcome: outcomeSchema,
  inSearch: z57.boolean(),
  kind: callKindSchema,
  fileName: documentFileNameSchema,
  mediaType: callMediaTypeSchema,
  sizeBytes: z57.number().int().min(1).max(MAX_RECORDING_BYTES),
  durationSeconds: z57.number().int().min(1).max(MAX_RECORDING_SECONDS).nullable(),
  state: callStateSchema,
  failureReason: callFailureReasonSchema.nullable(),
  rep: repChoiceSchema.nullable(),
  speakerLabels: z57.array(speakerLabelSchema).max(MAX_CALL_SPEAKERS),
  speakers: z57.array(speakerExcerptSchema).max(MAX_CALL_SPEAKERS).optional(),
  deletedAt: timestampSchema.nullable(),
  purgeAt: timestampSchema.nullable(),
  uploadedByUserId: userIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
function refineCall(call, context) {
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
  if (call.speakers !== undefined) {
    const labels = call.speakers.map((speaker) => speaker.label);
    if (call.kind !== "recording" || labels.length === 0) {
      issue("speakers", "Speaker excerpts are for a Recording and are absent when there are none");
    }
    if (new Set(labels).size !== labels.length) {
      issue("speakers", "Speaker excerpt labels are unique");
    }
    if (!labels.every((label) => call.speakerLabels.includes(label))) {
      issue("speakers", "Every excerpt belongs to one of the Call speakers");
    }
  }
  if (call.inSearch && (call.state !== "ready" || call.dealOutcome !== "won")) {
    issue("inSearch", "A Call is in search only when it is ready and its Deal is won");
  }
  if (call.state === "ready" && call.rep?.by === "speaker" && !call.speakerLabels.includes(call.rep.label)) {
    issue("rep", "A ready Call's Rep label is among its speakers");
  }
}
var callSchema = callShape.superRefine(refineCall);
var MAX_REP_FIELD_LENGTH = 512;
var uploadCallFieldsSchema = z57.strictObject({
  dealId: dealIdSchema,
  rep: z57.string().max(MAX_REP_FIELD_LENGTH).optional()
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
var callParamsSchema = z57.strictObject({ callId: callIdSchema });
var listCallsQuerySchema = pageQuerySchema.extend({ state: callStateSchema.optional(), dealRecordId: dealRecordIdSchema.optional() }).strict();
var callListItemSchema = callShape.omit({ speakers: true }).strict().superRefine(refineCall);
var listCallsResponseSchema = pageSchema(callListItemSchema);
var setCallRepRequestSchema = z57.strictObject({ rep: repChoiceSchema });
var CALL_FILE_KEYS = ["fileName", "declaredMediaType", "sizeBytes"];
var uploadCallFileSchema = z57.strictObject({
  fileName: documentFileNameSchema,
  declaredMediaType: z57.string().max(255).nullable(),
  sizeBytes: z57.number().int().min(1)
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
var callCursorSchema = z57.strictObject({ createdAt: timestampSchema, id: callIdSchema });
// src/playbook/deal.ts
import { z as z58 } from "zod";
var dealSchema = z58.object({
  id: dealRecordIdSchema,
  dealId: dealIdSchema,
  name: dealNameSchema.nullable(),
  outcome: outcomeSchema,
  closedAt: calendarDateSchema.nullable(),
  amount: dealAmountSchema.nullable(),
  currency: dealCurrencySchema.nullable(),
  callCount: z58.number().int().min(0),
  appearedInImport: z58.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
}).refine((deal) => deal.amount === null || deal.currency !== null, {
  message: "An amount comes with a currency",
  path: ["currency"]
});
var dealParamsSchema = z58.strictObject({ dealRecordId: dealRecordIdSchema });
var listDealsQuerySchema = pageQuerySchema.extend({
  outcome: outcomeSchema.optional(),
  appearedInImport: z58.enum(["true", "false"]).transform((value) => value === "true").optional()
}).strict();
var listDealsResponseSchema = pageSchema(dealSchema);
var setDealOutcomeRequestSchema = z58.strictObject({
  outcome: outcomeSchema,
  closedAt: calendarDateSchema.nullable().optional()
});
var lookupDealRequestSchema = z58.strictObject({ dealId: dealIdSchema });
var dealCursorSchema = z58.strictObject({
  createdAt: timestampSchema,
  id: dealRecordIdSchema
});
var dealImportCursorSchema = z58.strictObject({
  createdAt: timestampSchema,
  id: dealImportIdSchema
});
var dealImportRowCursorSchema = z58.strictObject({ rowNumber: z58.number().int().min(2) });
var DEAL_IMPORT_FILE_FIELD = "file";
var dealImportSchema = z58.object({
  id: dealImportIdSchema,
  state: dealImportStateSchema,
  failureReason: dealImportFailureReasonSchema.nullable(),
  rowCount: z58.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
  appliedCount: z58.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
  rejectedCount: z58.number().int().min(0).max(MAX_DEAL_IMPORT_ROWS).nullable(),
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
var dealImportParamsSchema = z58.strictObject({ importId: dealImportIdSchema });
var listDealImportsQuerySchema = pageQuerySchema.strict();
var listDealImportsResponseSchema = pageSchema(dealImportSchema);
var dealImportRowSchema = z58.object({
  rowNumber: z58.number().int().min(2).max(MAX_DEAL_IMPORT_ROWS + 1),
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
import { z as z59 } from "zod";
var documentSchema = z59.object({
  id: documentIdSchema,
  fileName: documentFileNameSchema,
  mediaType: documentMediaTypeSchema,
  sizeBytes: z59.number().int().min(1).max(MAX_DOCUMENT_BYTES),
  pageCount: z59.number().int().min(1).max(MAX_DOCUMENT_PAGES).nullable(),
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
var uploadDocumentFileSchema = z59.strictObject({
  fileName: documentFileNameSchema,
  declaredMediaType: z59.string().max(255).nullable(),
  sizeBytes: z59.number().int().min(1)
});
var documentParamsSchema = z59.strictObject({
  documentId: documentIdSchema
});
var listDocumentsQuerySchema = pageQuerySchema.extend({ state: documentStateSchema.optional() }).strict();
var listDocumentsResponseSchema = pageSchema(documentSchema);
var internalRemoveOrganizationDocumentsParamsSchema = z59.strictObject({
  organizationId: organizationIdSchema
});
var internalRemoveOrganizationDocumentsRequestSchema = z59.strictObject({});
var internalRemoveOrganizationDocumentsResponseSchema = z59.object({
  organizationId: organizationIdSchema,
  status: z59.literal("removed")
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
import { z as z60 } from "zod";
var documentUploadedPayloadSchema = z60.strictObject({
  documentId: documentIdSchema
});
var DOCUMENT_UPLOADED_MESSAGE = {
  type: "playbook.document_uploaded",
  version: 1,
  scope: "organization",
  payload: documentUploadedPayloadSchema
};
var MAX_DELETION_SEQ = 2147483647;
var documentDeletedPayloadSchema = z60.strictObject({
  documentId: documentIdSchema,
  deletionSeq: z60.number().int().min(1).max(MAX_DELETION_SEQ)
});
var DOCUMENT_DELETED_MESSAGE = {
  type: "playbook.document_deleted",
  version: 1,
  scope: "organization",
  payload: documentDeletedPayloadSchema
};
// src/playbook/sales-history-messages.ts
import { z as z61 } from "zod";
var MAX_SEQ = MAX_DELETION_SEQ;
var seqSchema = z61.number().int().min(1).max(MAX_SEQ);
var callUploadedPayloadSchema = z61.strictObject({ callId: callIdSchema });
var CALL_UPLOADED_MESSAGE = {
  type: "playbook.call_uploaded",
  version: 1,
  scope: "organization",
  payload: callUploadedPayloadSchema
};
var callTranscribedPayloadSchema = z61.strictObject({ callId: callIdSchema });
var CALL_TRANSCRIBED_MESSAGE = {
  type: "playbook.call_transcribed",
  version: 1,
  scope: "organization",
  payload: callTranscribedPayloadSchema
};
var callRepChangedPayloadSchema = z61.strictObject({
  callId: callIdSchema,
  repSeq: seqSchema
});
var CALL_REP_CHANGED_MESSAGE = {
  type: "playbook.call_rep_changed",
  version: 1,
  scope: "organization",
  payload: callRepChangedPayloadSchema
};
var callDeletedPayloadSchema = z61.strictObject({
  callId: callIdSchema,
  deletionSeq: seqSchema
});
var CALL_DELETED_MESSAGE = {
  type: "playbook.call_deleted",
  version: 1,
  scope: "organization",
  payload: callDeletedPayloadSchema
};
var dealOutcomeChangedPayloadSchema = z61.strictObject({
  dealRecordId: dealRecordIdSchema,
  outcomeSeq: seqSchema
});
var DEAL_OUTCOME_CHANGED_MESSAGE = {
  type: "playbook.deal_outcome_changed",
  version: 1,
  scope: "organization",
  payload: dealOutcomeChangedPayloadSchema
};
var dealImportUploadedPayloadSchema = z61.strictObject({ importId: dealImportIdSchema });
var DEAL_IMPORT_UPLOADED_MESSAGE = {
  type: "playbook.deal_import_uploaded",
  version: 1,
  scope: "organization",
  payload: dealImportUploadedPayloadSchema
};
// src/prospect/errors.ts
import { z as z62 } from "zod";
var PROSPECT_ERRORS = {
  ...defineErrors("prospect", {
    not_found: {
      status: 404,
      message: "The requested Prospect, Prospect Company, import or merge was not found."
    },
    duplicate_identity: {
      status: 409,
      message: "Another Prospect already has this email, phone or LinkedIn address."
    },
    import_invalid: { status: 422, message: "The import file cannot be accepted." },
    merge_conflict: {
      status: 409,
      message: "These Prospects cannot be merged, or this merge cannot be undone."
    },
    forbidden_owner: { status: 403, message: "This member cannot own the Prospect." }
  })
};
var prospectNotFoundDetailsSchema = z62.strictObject({
  resource: z62.enum(["prospect", "company", "import", "merge"])
});
var duplicateIdentityDetailsSchema = z62.strictObject({
  identityKind: prospectIdentityKindSchema,
  prospectId: prospectIdSchema.optional()
});
// src/prospect/events.ts
import { z as z64 } from "zod";

// src/prospect/merge.ts
import { z as z63 } from "zod";
var PROSPECT_MERGE_UNDO_DAYS = 30;
var MAX_MERGED_PROSPECTS = 5;
var prospectMergeParamsSchema = z63.strictObject({ mergeId: prospectMergeIdSchema });
var mergeProspectsRequestSchema = z63.strictObject({
  mergedProspectIds: z63.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS).refine((ids) => new Set(ids).size === ids.length, "No duplicate ids"),
  fieldChoices: z63.partialRecord(prospectFieldNameSchema, prospectIdSchema).default({})
});
var PROSPECT_MERGE_STATES = ["merged", "undone"];
var prospectMergeSchema = z63.object({
  id: prospectMergeIdSchema,
  survivorProspectId: prospectIdSchema,
  mergedProspectIds: z63.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS),
  fieldChoices: z63.partialRecord(prospectFieldNameSchema, prospectIdSchema),
  state: z63.enum(PROSPECT_MERGE_STATES),
  mergedByUserId: userIdSchema,
  createdAt: timestampSchema,
  undoableUntil: timestampSchema,
  undoneAt: timestampSchema.nullable()
}).refine((merge) => merge.state === "undone" === (merge.undoneAt !== null), {
  path: ["undoneAt"],
  message: "undoneAt is set exactly when the state is undone"
});
var listProspectDuplicatesQuerySchema = pageQuerySchema.extend({ prospectId: prospectIdSchema.optional() }).strict();
var prospectDuplicateSchema = z63.object({
  prospectIds: z63.tuple([prospectIdSchema, prospectIdSchema]),
  matchedOn: z63.array(prospectIdentityKindSchema).min(1).max(3)
});
var listProspectDuplicatesResponseSchema = pageSchema(prospectDuplicateSchema);
var prospectDuplicateCursorSchema = z63.strictObject({
  first: prospectIdSchema,
  second: prospectIdSchema
});

// src/prospect/events.ts
var prospectCreatedEvent = defineEvent("prospect.created", 1, z64.strictObject({
  prospectId: prospectIdSchema,
  companyId: prospectCompanyIdSchema.nullable(),
  ownerMembershipId: membershipIdSchema.nullable(),
  source: sourceKindSchema
}));
var prospectUpdatedEvent = defineEvent("prospect.updated", 1, z64.strictObject({
  prospectId: prospectIdSchema,
  changedFields: z64.array(prospectFieldNameSchema).max(6),
  ownerChanged: z64.boolean(),
  companyChanged: z64.boolean(),
  statusChanged: z64.boolean(),
  source: sourceKindSchema
}));
var prospectMergedEvent = defineEvent("prospect.merged", 1, z64.strictObject({
  mergeId: prospectMergeIdSchema,
  survivorProspectId: prospectIdSchema,
  mergedProspectIds: z64.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS)
}));
var prospectMergeUndoneEvent = defineEvent("prospect.merge_undone", 1, z64.strictObject({
  mergeId: prospectMergeIdSchema,
  survivorProspectId: prospectIdSchema,
  restoredProspectIds: z64.array(prospectIdSchema).min(1).max(MAX_MERGED_PROSPECTS)
}));
var prospectErasedEvent = defineEvent("prospect.erased", 1, z64.strictObject({ prospectId: prospectIdSchema }));
var PROSPECT_EVENTS = {
  "prospect.created": prospectCreatedEvent,
  "prospect.updated": prospectUpdatedEvent,
  "prospect.merged": prospectMergedEvent,
  "prospect.merge_undone": prospectMergeUndoneEvent,
  "prospect.erased": prospectErasedEvent
};
// src/prospect/import.ts
import { z as z65 } from "zod";
var MAX_PROSPECT_IMPORT_BYTES = 10 * 1024 * 1024;
var MAX_PROSPECT_IMPORT_ROWS = 50000;
var PROSPECT_IMPORT_FILE_FIELD = "file";
var PROSPECT_IMPORT_COLUMNS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "linkedin_url",
  "job_title",
  "company_name",
  "company_domain",
  "owner_email",
  "tags"
];
var PROSPECT_IMPORT_STATES = ["uploaded", "processing", "completed", "failed"];
var prospectImportStateSchema = z65.enum(PROSPECT_IMPORT_STATES);
var PROSPECT_IMPORT_FAILURE_REASONS = ["too_many_rows", "unreadable"];
var prospectImportFailureReasonSchema = z65.enum(PROSPECT_IMPORT_FAILURE_REASONS);
var PROSPECT_IMPORT_ROW_RESULTS = ["created", "updated", "skipped", "rejected"];
var prospectImportRowResultSchema = z65.enum(PROSPECT_IMPORT_ROW_RESULTS);
var PROSPECT_IMPORT_SKIP_REASONS = ["no_change", "manual_values_kept"];
var PROSPECT_IMPORT_REJECT_REASONS = [
  "wrong_column_count",
  "blank_row",
  "missing_identity",
  "invalid_email",
  "invalid_phone",
  "invalid_linkedin_url",
  "invalid_name",
  "invalid_job_title",
  "invalid_company",
  "invalid_tags",
  "owner_not_found",
  "owner_not_allowed",
  "duplicate_in_file",
  "identity_conflict"
];
var prospectImportRowReasonSchema = z65.enum([
  ...PROSPECT_IMPORT_SKIP_REASONS,
  ...PROSPECT_IMPORT_REJECT_REASONS
]);
var countSchema = z65.number().int().min(0).max(MAX_PROSPECT_IMPORT_ROWS);
var prospectImportSchema = z65.object({
  id: prospectImportIdSchema,
  state: prospectImportStateSchema,
  failureReason: prospectImportFailureReasonSchema.nullable(),
  rowCount: countSchema.nullable(),
  createdCount: countSchema.nullable(),
  updatedCount: countSchema.nullable(),
  skippedCount: countSchema.nullable(),
  rejectedCount: countSchema.nullable(),
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
  const counts = [
    item.rowCount,
    item.createdCount,
    item.updatedCount,
    item.skippedCount,
    item.rejectedCount
  ];
  const allSet = counts.every((count) => count !== null);
  const noneSet = counts.every((count) => count === null);
  if (item.state === "completed" ? !allSet : !noneSet) {
    context.addIssue({
      code: "custom",
      path: ["rowCount"],
      message: "The counts are set exactly when the import is completed"
    });
  }
  if (allSet && item.rowCount !== (item.createdCount ?? 0) + (item.updatedCount ?? 0) + (item.skippedCount ?? 0) + (item.rejectedCount ?? 0)) {
    context.addIssue({
      code: "custom",
      path: ["rowCount"],
      message: "The row count is the four result counts together"
    });
  }
});
var prospectImportParamsSchema = z65.strictObject({ importId: prospectImportIdSchema });
var listProspectImportsQuerySchema = pageQuerySchema.strict();
var listProspectImportsResponseSchema = pageSchema(prospectImportSchema);
var prospectImportCursorSchema = z65.strictObject({
  createdAt: timestampSchema,
  id: prospectImportIdSchema
});
var prospectImportRowSchema = z65.object({
  rowNumber: z65.number().int().min(2).max(MAX_PROSPECT_IMPORT_ROWS + 1),
  result: prospectImportRowResultSchema,
  reason: prospectImportRowReasonSchema.nullable(),
  prospectId: prospectIdSchema.nullable()
}).superRefine((row, context) => {
  const wantsReason = row.result === "skipped" || row.result === "rejected";
  if (wantsReason !== (row.reason !== null)) {
    context.addIssue({
      code: "custom",
      path: ["reason"],
      message: "A reason is set exactly when the row is skipped or rejected"
    });
  }
  const isSkipReason = PROSPECT_IMPORT_SKIP_REASONS.includes(row.reason ?? "");
  if (row.reason !== null && row.result === "skipped" !== isSkipReason) {
    context.addIssue({
      code: "custom",
      path: ["reason"],
      message: "A skip reason belongs to a skipped row and a reject reason to a rejected row"
    });
  }
  if (row.result === "rejected" && row.prospectId !== null) {
    context.addIssue({
      code: "custom",
      path: ["prospectId"],
      message: "A rejected row has no Prospect"
    });
  }
  if ((row.result === "created" || row.result === "updated") && row.prospectId === null) {
    context.addIssue({
      code: "custom",
      path: ["prospectId"],
      message: "A created or updated row names its Prospect"
    });
  }
});
var listProspectImportRowsQuerySchema = pageQuerySchema.extend({ result: prospectImportRowResultSchema.optional() }).strict();
var listProspectImportRowsResponseSchema = pageSchema(prospectImportRowSchema);
var prospectImportRowCursorSchema = z65.strictObject({
  rowNumber: z65.number().int().min(2)
});
var PROSPECT_IMPORT_REPORT_COLUMNS = [
  "row_number",
  "result",
  "reason",
  "prospect_id"
];
var PROSPECT_IMPORT_INVALID_REASONS = [
  "unsupported_type",
  "too_large",
  "header_invalid",
  "too_many_rows"
];
var prospectImportInvalidDetailsSchema = z65.strictObject({
  reason: z65.enum(PROSPECT_IMPORT_INVALID_REASONS)
});
// src/prospect/prospect.ts
import { z as z66 } from "zod";
var PROSPECT_STATUSES = ["active", "archived"];
var prospectStatusSchema = z66.enum(PROSPECT_STATUSES);
var prospectSchema = z66.object({
  id: prospectIdSchema,
  companyId: prospectCompanyIdSchema.nullable(),
  ownerMembershipId: membershipIdSchema.nullable(),
  status: prospectStatusSchema,
  source: sourceKindSchema,
  tags: prospectTagsSchema,
  notes: z66.string().min(1).max(5000).nullable(),
  fields: z66.partialRecord(prospectFieldNameSchema, fieldValueSchema),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var prospectParamsSchema = z66.strictObject({ prospectId: prospectIdSchema });
var hasPersonalField = (body) => body.firstName !== undefined || body.lastName !== undefined || body.email !== undefined || body.phone !== undefined || body.linkedinUrl !== undefined;
var createProspectRequestSchema = z66.strictObject({
  firstName: prospectNamePartSchema.optional(),
  lastName: prospectNamePartSchema.optional(),
  jobTitle: prospectJobTitleSchema.optional(),
  email: emailSchema.optional(),
  phone: rawPhoneSchema.optional(),
  linkedinUrl: rawLinkedinUrlSchema.optional(),
  companyId: prospectCompanyIdSchema.optional(),
  ownerMembershipId: membershipIdSchema.optional(),
  tags: prospectTagsSchema.optional(),
  notes: prospectNotesSchema.optional()
}).refine(hasPersonalField, "Give at least a name, an email, a phone or a LinkedIn address");
var updateProspectRequestSchema = z66.strictObject({
  firstName: prospectNamePartSchema.nullable().optional(),
  lastName: prospectNamePartSchema.nullable().optional(),
  jobTitle: prospectJobTitleSchema.nullable().optional(),
  email: emailSchema.nullable().optional(),
  phone: rawPhoneSchema.nullable().optional(),
  linkedinUrl: rawLinkedinUrlSchema.nullable().optional(),
  companyId: prospectCompanyIdSchema.nullable().optional(),
  status: prospectStatusSchema.optional(),
  tags: prospectTagsSchema.optional(),
  notes: prospectNotesSchema.nullable().optional()
}).refine((body) => Object.values(body).some((value) => value !== undefined), "Send a change");
var prospectSearchSchema = boundedTextSchema(MAX_PROSPECT_SEARCH_LENGTH);
var listProspectsQuerySchema = pageQuerySchema.extend({
  ownerMembershipId: membershipIdSchema.optional(),
  source: sourceKindSchema.optional(),
  companyId: prospectCompanyIdSchema.optional(),
  status: prospectStatusSchema.optional(),
  q: prospectSearchSchema.optional()
}).strict();
var listProspectsResponseSchema = pageSchema(prospectSchema);
var prospectCursorSchema = z66.strictObject({
  createdAt: timestampSchema,
  id: prospectIdSchema
});
var prospectFieldParamsSchema = z66.strictObject({
  prospectId: prospectIdSchema,
  field: prospectFieldNameSchema
});
var listFieldHistoryQuerySchema = pageQuerySchema.strict();
var listFieldHistoryResponseSchema = pageSchema(fieldHistoryEntrySchema);
var fieldHistoryCursorSchema = z66.strictObject({
  setAt: timestampSchema,
  seq: z66.number().int().min(0)
});
var setProspectOwnerRequestSchema = z66.strictObject({
  ownerMembershipId: membershipIdSchema
});
var MAX_BULK_ASSIGN_PROSPECTS = 5000;
var BULK_ASSIGN_SYNC_LIMIT = 500;
var bulkAssignProspectsRequestSchema = z66.strictObject({
  prospectIds: z66.array(prospectIdSchema).min(1).max(MAX_BULK_ASSIGN_PROSPECTS).refine((ids) => new Set(ids).size === ids.length, "No duplicate ids"),
  ownerMembershipId: membershipIdSchema
});
var bulkAssignProspectsResponseSchema = z66.object({
  state: z66.enum(["applied", "queued"]),
  requested: z66.number().int().min(1).max(MAX_BULK_ASSIGN_PROSPECTS),
  assigned: z66.number().int().min(0).max(MAX_BULK_ASSIGN_PROSPECTS).nullable(),
  skipped: z66.number().int().min(0).max(MAX_BULK_ASSIGN_PROSPECTS).nullable()
}).refine((body) => body.state === "applied" ? body.assigned !== null && body.skipped !== null : body.assigned === null && body.skipped === null, "The counts are set exactly when the assignment was applied");
var eraseProspectResponseSchema = z66.object({
  prospectId: prospectIdSchema,
  state: z66.literal("queued")
});
var prospectCompanySchema = z66.object({
  id: prospectCompanyIdSchema,
  fields: z66.object({
    name: fieldValueSchema,
    domain: fieldValueSchema.optional()
  }),
  createdAt: timestampSchema,
  updatedAt: timestampSchema
});
var prospectCompanyParamsSchema = z66.strictObject({ companyId: prospectCompanyIdSchema });
var prospectCompanyFieldParamsSchema = z66.strictObject({
  companyId: prospectCompanyIdSchema,
  field: prospectCompanyFieldNameSchema
});
var createProspectCompanyRequestSchema = z66.strictObject({
  name: prospectCompanyNameSchema,
  domain: prospectCompanyDomainSchema.optional()
});
var updateProspectCompanyRequestSchema = z66.strictObject({
  name: prospectCompanyNameSchema.optional(),
  domain: prospectCompanyDomainSchema.nullable().optional()
}).refine((body) => body.name !== undefined || body.domain !== undefined, "Send a change");
var listProspectCompaniesQuerySchema = pageQuerySchema.extend({ q: prospectSearchSchema.optional() }).strict();
var listProspectCompaniesResponseSchema = pageSchema(prospectCompanySchema);
var prospectCompanyCursorSchema = z66.strictObject({
  createdAt: timestampSchema,
  id: prospectCompanyIdSchema
});
// src/prospect/routes.ts
var PROSPECT_ADMIN_ROLES = ["owner", "admin"];
var PROSPECT_ALL_ROLES = [
  "owner",
  "admin",
  "manager",
  "rep"
];
var route9 = (definition) => Object.freeze(definition);
var IDEMPOTENT_ERRORS5 = [
  "request.invalid",
  "request.idempotency_key_reused",
  "request.idempotency_in_progress"
];
var VISIBILITY4 = "Visibility is decided from the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a record of another Organization.";
var PROSPECT_ROUTES = Object.freeze({
  createProspect: route9({
    method: "POST",
    path: "/v1/prospects",
    roles: PROSPECT_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.duplicate_identity", "prospect.forbidden_owner", "prospect.not_found"],
    commonErrors: [...IDEMPOTENT_ERRORS5],
    description: "Creates a Prospect by hand with the Source manual. Every role may; a Rep becomes its owner and only Owner and Admin may name another owner (else prospect.forbidden_owner). An email, phone or LinkedIn address another Prospect already has is prospect.duplicate_identity; the answer names that Prospect only if the caller may see it. A Prospect Company that does not exist is prospect.not_found. Answers 201, or 200 with the original Prospect for a replay of the same Idempotency-Key."
  }),
  listProspects: route9({
    method: "GET",
    path: "/v1/prospects",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: `Lists Prospects, newest first (by createdAt, then id), one cursor-paginated page at a time (at most 100). Filters: ownerMembershipId, source, companyId, status and q (a search on name, email and company). ${VISIBILITY4} A filter can narrow what the caller sees, never widen it.`
  }),
  getProspect: route9({
    method: "GET",
    path: "/v1/prospects/{prospectId}",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: `Reads one Prospect with every current field and its Source, time and actor. ${VISIBILITY4}`
  }),
  updateProspect: route9({
    method: "PATCH",
    path: "/v1/prospects/{prospectId}",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found", "prospect.duplicate_identity"],
    commonErrors: ["request.invalid"],
    description: `Edits a Prospect; each field sent is written with the Source manual, which beats every other Source (ADR 0020). null clears a field. Changing an identity to one another Prospect has is prospect.duplicate_identity. Owner is changed by setProspectOwner. Publishes prospect.updated once per change. ${VISIBILITY4}`
  }),
  setProspectOwner: route9({
    method: "PUT",
    path: "/v1/prospects/{prospectId}/owner",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found", "prospect.forbidden_owner"],
    commonErrors: ["request.invalid"],
    description: "Assigns or reassigns the owner Rep. Owner and Admin only. The new owner must be a Rep or Manager of the same Organization, else prospect.forbidden_owner. Idempotent by end state. Publishes prospect.updated."
  }),
  bulkAssignProspects: route9({
    method: "POST",
    path: "/v1/prospects/assign",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200, 202],
    idempotent: true,
    errors: ["prospect.forbidden_owner"],
    commonErrors: [...IDEMPOTENT_ERRORS5],
    description: "Assigns up to 5,000 Prospects to one owner. Owner and Admin only. Up to 500 are applied at once (200); more are queued (202) and finish in the background. The owner rules of setProspectOwner apply (prospect.forbidden_owner). Prospects that do not exist are counted as skipped, not named. A retry with the same Idempotency-Key changes nothing twice."
  }),
  eraseProspect: route9({
    method: "DELETE",
    path: "/v1/prospects/{prospectId}",
    roles: PROSPECT_ADMIN_ROLES,
    success: [202],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Erases a Prospect on request: a queued job deletes its fields, identities and notes, writes a salted-hash suppression entry and publishes prospect.erased, which carries no personal data. Owner and Admin only; a Rep or Manager gets auth.forbidden. Answers 202 at once; the Prospect is then prospect.not_found, and a retry after acceptance that gets prospect.not_found means the erasure was accepted."
  }),
  listProspectFieldHistory: route9({
    method: "GET",
    path: "/v1/prospects/{prospectId}/fields/{field}/history",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: `Lists one field's history, newest first, cursor-paginated (at most 100): the current value, earlier values and enrichment values kept as suggestions, each with Source, time and actor. At most 50 entries are kept per field. ${VISIBILITY4}`
  }),
  createProspectCompany: route9({
    method: "POST",
    path: "/v1/prospect-companies",
    roles: PROSPECT_ALL_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS5],
    description: "Creates a Prospect Company with the Source manual. Every role may. Answers 201, or 200 with the original record for a replay of the same Idempotency-Key."
  }),
  listProspectCompanies: route9({
    method: "GET",
    path: "/v1/prospect-companies",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization’s Prospect Companies, newest first, cursor-paginated (at most 100), with an optional q search on name and domain. Every role sees every Prospect Company; a Company carries no Prospect."
  }),
  getProspectCompany: route9({
    method: "GET",
    path: "/v1/prospect-companies/{companyId}",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one Prospect Company with its fields and their Sources."
  }),
  updateProspectCompany: route9({
    method: "PATCH",
    path: "/v1/prospect-companies/{companyId}",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Edits a Prospect Company; each field sent is written with the Source manual (ADR 0020). null clears the domain."
  }),
  listProspectCompanyFieldHistory: route9({
    method: "GET",
    path: "/v1/prospect-companies/{companyId}/fields/{field}/history",
    roles: PROSPECT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists one Prospect Company field’s history, newest first, cursor-paginated (at most 100), with Source, time and actor."
  }),
  listProspectDuplicates: route9({
    method: "GET",
    path: "/v1/prospect-duplicates",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Lists suspected duplicate pairs: Prospects that share a normalised email, phone or LinkedIn address, found from the indexed identities and bounded per request (at most 100 per page, cursor-paginated). Optionally for one prospectId. Owner and Admin only."
  }),
  mergeProspects: route9({
    method: "POST",
    path: "/v1/prospects/{prospectId}/merges",
    roles: PROSPECT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ["prospect.not_found", "prospect.merge_conflict"],
    commonErrors: [...IDEMPOTENT_ERRORS5],
    description: "Merges up to 5 Prospects into the survivor in the path, with a value chosen per field; both histories are kept and links move to the survivor. Owner and Admin only. A Prospect already merged or named twice is prospect.merge_conflict. Publishes prospect.merged. Undo is possible for 30 days."
  }),
  getProspectMerge: route9({
    method: "GET",
    path: "/v1/prospect-merges/{mergeId}",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one merge record, including until when it can be undone. Owner and Admin only."
  }),
  undoProspectMerge: route9({
    method: "POST",
    path: "/v1/prospect-merges/{mergeId}/undo",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found", "prospect.merge_conflict"],
    commonErrors: ["request.invalid"],
    description: "Reverses a merge, restoring both records exactly as the snapshot holds them. Owner and Admin only. After the 30-day window, or when a record has been merged again, it is prospect.merge_conflict. Undoing an undone merge answers 200 with the record as it is. Publishes prospect.merge_undone. Takes no body."
  }),
  uploadProspectImport: route9({
    method: "POST",
    path: "/v1/prospect-imports",
    roles: PROSPECT_ADMIN_ROLES,
    success: [202],
    idempotent: true,
    errors: ["prospect.import_invalid"],
    commonErrors: ["request.too_large", "request.unsupported_media_type", ...IDEMPOTENT_ERRORS5],
    description: 'Uploads the CSV template (PROSPECT_IMPORT_COLUMNS; up to 10 MB and 50,000 rows) as multipart/form-data with one file part named "file". Owner and Admin only. The type, size and header are checked before anything is stored; a refusal is prospect.import_invalid with details.reason. The rows are processed in a queued, resumable job that matches a row to an existing Prospect on any normalised identity (email, phone or LinkedIn address), writes the Source import and never replaces a manual value. Bad rows are reported, never dropped. Answers 202 with the import; the same Idempotency-Key creates nothing new.'
  }),
  listProspectImports: route9({
    method: "GET",
    path: "/v1/prospect-imports",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ["request.invalid"],
    description: "Lists the Organization’s imports, newest first, cursor-paginated (at most 100). Owner and Admin only."
  }),
  getProspectImport: route9({
    method: "GET",
    path: "/v1/prospect-imports/{importId}",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads one import: its state, failure reason and counts, so a page opened mid-job shows live status. Owner and Admin only."
  }),
  listProspectImportRows: route9({
    method: "GET",
    path: "/v1/prospect-imports/{importId}/rows",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Reads the report in CSV order, cursor-paginated (at most 100), optionally only one result. Each row has its number, result, reason and Prospect id; no cell of the file is returned. Owner and Admin only."
  }),
  downloadProspectImportReport: route9({
    method: "GET",
    path: "/v1/prospect-imports/{importId}/report.csv",
    roles: PROSPECT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ["prospect.not_found"],
    commonErrors: ["request.invalid"],
    description: "Downloads the report as text/csv with the columns PROSPECT_IMPORT_REPORT_COLUMNS, streamed in pages and never held whole. Owner and Admin only. Contains no cell of the uploaded file."
  })
});
// src/voice/errors.ts
var VOICE_ERRORS = {
  ...defineErrors("call", {
    number_invalid: { status: 422, message: "The number is not valid for a Call." },
    disclosure_failed: {
      status: 502,
      message: "The Disclosure could not be played, so the Call did not connect."
    },
    line_unavailable: {
      status: 409,
      message: "There is no active Line to place this Call from."
    },
    limit_reached: {
      status: 429,
      message: "The Organization has reached its limit of concurrent Calls."
    },
    not_ended: { status: 409, message: "The Call has not ended yet." }
  }),
  ...defineErrors("line", {
    not_found: { status: 404, message: "The Line was not found." },
    number_unavailable: { status: 409, message: "This number is not available." },
    released: { status: 409, message: "The Line was released and cannot be changed." },
    assignment_invalid: {
      status: 422,
      message: "The Team or Rep named for this Line is not valid."
    }
  }),
  ...defineErrors("recording", {
    not_found: { status: 404, message: "The Call has no Recording." },
    not_ready: { status: 409, message: "The Recording is still being stored. Try again shortly." }
  })
};
// src/voice/events.ts
import { z as z67 } from "zod";
var MAX_RECORDING_KEY_LENGTH = 512;
var recordingKeySchema = z67.string().min(1).max(MAX_RECORDING_KEY_LENGTH).regex(/^[A-Za-z0-9][A-Za-z0-9/_.-]*$/);
var voiceCallStartedEvent = defineEvent("voice.call.started", 1, z67.strictObject({
  callId: callIdSchema,
  direction: voiceCallDirectionSchema,
  lineId: lineIdSchema,
  repMembershipId: membershipIdSchema.nullable(),
  prospectId: prospectIdSchema.nullable(),
  prospectPhoneHash: phoneHashSchema,
  startedAt: timestampSchema
}));
var VOICE_CALL_OUTCOMES = ["completed", "failed", "missed"];
var voiceCallOutcomeSchema = z67.enum(VOICE_CALL_OUTCOMES);
var voiceCallEndedEvent = defineEvent("voice.call.ended", 1, z67.strictObject({
  callId: callIdSchema,
  direction: voiceCallDirectionSchema,
  lineId: lineIdSchema,
  repMembershipId: membershipIdSchema.nullable(),
  prospectId: prospectIdSchema.nullable(),
  prospectPhoneHash: phoneHashSchema,
  outcome: voiceCallOutcomeSchema,
  failureReason: voiceCallFailureReasonSchema.nullable(),
  startedAt: timestampSchema,
  answeredAt: timestampSchema.nullable(),
  endedAt: timestampSchema,
  durationSeconds: z67.number().int().min(0).max(MAX_CALL_DURATION_SECONDS).nullable(),
  disclosureWordingVersion: z67.number().int().min(1).nullable(),
  recordingKey: recordingKeySchema.nullable(),
  dealId: dealIdSchema.nullable()
}).superRefine((data, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
  if (data.outcome === "failed" !== (data.failureReason !== null)) {
    issue("failureReason", "Only a failed Call has a failure reason");
  }
  if (data.outcome === "completed" !== (data.durationSeconds !== null)) {
    issue("durationSeconds", "Only a completed Call has a duration");
  }
  if (data.failureReason === "disclosure_failed" && data.disclosureWordingVersion !== null) {
    issue("failureReason", "A Call whose Disclosure played did not fail on it");
  }
  if (data.outcome === "completed" && data.disclosureWordingVersion === null) {
    issue("disclosureWordingVersion", "A completed Call played its Disclosure");
  }
  if (data.recordingKey !== null && data.disclosureWordingVersion === null) {
    issue("recordingKey", "A Recording exists only after the Disclosure");
  }
  if (data.outcome !== "completed" && data.dealId !== null) {
    issue("dealId", "Only a completed Call has a Deal identifier");
  }
}));
var VOICE_EVENTS = {
  "voice.call.started": voiceCallStartedEvent,
  "voice.call.ended": voiceCallEndedEvent
};
// src/voice/line.ts
import { z as z68 } from "zod";
var LINE_STATES = ["porting", "active", "released"];
var lineStateSchema = z68.enum(LINE_STATES);
var lineAssignmentSchema = z68.discriminatedUnion("kind", [
  z68.strictObject({ kind: z68.literal("unassigned") }),
  z68.strictObject({ kind: z68.literal("team"), teamId: teamIdSchema }),
  z68.strictObject({ kind: z68.literal("rep"), membershipId: membershipIdSchema })
]);
var lineSchema = z68.object({
  id: lineIdSchema,
  number: e164PhoneSchema,
  country: countryCodeSchema,
  label: lineLabelSchema.nullable(),
  state: lineStateSchema,
  assignment: lineAssignmentSchema,
  createdAt: timestampSchema,
  releasedAt: timestampSchema.nullable()
}).refine((line) => line.state === "released" === (line.releasedAt !== null), {
  message: "Only a released Line has a release time"
}).refine((line) => line.state !== "released" || line.assignment.kind === "unassigned", {
  message: "A released Line is unassigned"
});
var lineParamsSchema = z68.strictObject({ lineId: lineIdSchema });
var lineCursorSchema = z68.strictObject({ createdAt: timestampSchema, id: lineIdSchema });
var listLinesQuerySchema = pageQuerySchema.extend({ state: lineStateSchema.optional() }).strict();
var linePageSchema = pageSchema(lineSchema);
var addLineRequestSchema = z68.discriminatedUnion("method", [
  z68.strictObject({
    method: z68.literal("buy"),
    country: countryCodeSchema,
    areaCode: z68.string().regex(/^[0-9]{2,6}$/).optional(),
    label: lineLabelSchema.optional()
  }),
  z68.strictObject({
    method: z68.literal("port"),
    number: rawPhoneSchema,
    label: lineLabelSchema.optional()
  })
]);
var assignLineRequestSchema = lineAssignmentSchema;
// src/voice/softphone.ts
import { z as z69 } from "zod";
var MIN_SOFTPHONE_TOKEN_TTL_SECONDS = 60;
var MAX_SOFTPHONE_TOKEN_TTL_SECONDS = 3600;
var MAX_SOFTPHONE_TOKEN_LENGTH = 4096;
var softphoneTokenSchema = z69.strictObject({
  token: z69.string().min(1).max(MAX_SOFTPHONE_TOKEN_LENGTH),
  identity: membershipIdSchema,
  ttlSeconds: z69.number().int().min(MIN_SOFTPHONE_TOKEN_TTL_SECONDS).max(MAX_SOFTPHONE_TOKEN_TTL_SECONDS),
  expiresAt: timestampSchema
});
// src/index.ts
var PACKAGE = "tula-closeline-contract";
export {
  ABANDON_MAX_AGE_HOURS,
  ACCEPTED_DOCUMENT_EXTENSIONS,
  ACCEPTED_DOCUMENT_MEDIA_TYPES,
  ACCEPTED_RECORDING_EXTENSIONS,
  ACCEPTED_TRANSCRIPT_EXTENSIONS,
  AGENT_ADMIN_ROLES,
  AGENT_ALL_ROLES,
  AGENT_CALLING_WINDOW,
  AGENT_CALL_OUTCOMES,
  AGENT_ERRORS,
  AGENT_EVENTS,
  AGENT_LANGUAGES,
  AGENT_READ_ROLES,
  AGENT_ROUTES,
  AGENT_TOOLS,
  AGENT_VOICE_STYLES,
  ALL_PLAYBOOK_ERRORS,
  ALL_PLAYBOOK_ROUTES,
  ALWAYS_HELD_REASONS,
  APPROVAL_MODES,
  AUTH_ERRORS,
  AUTH_OPTIONS_PATH,
  AUTH_OPTIONS_ROUTE,
  BOOKING_ADMIN_ROLES,
  BOOKING_ALL_ROLES,
  BOOKING_CANCELLED_BY,
  BOOKING_ERRORS,
  BOOKING_EVENTS,
  BOOKING_MODES,
  BOOKING_ORIGINS,
  BOOKING_ROUTES,
  BOOKING_STATES,
  BOOKING_TYPE_STATES,
  BULK_ASSIGN_SYNC_LIMIT,
  CALENDAR_CONNECTION_STATES,
  CALENDAR_PROVIDERS,
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
  CHAT_ALL_ROLES,
  CHAT_ERRORS,
  CHAT_ROUTES,
  CHAT_STATES,
  COMPANY_SIZE_BANDS,
  CONSENT_ADMIN_ROLES,
  CONSENT_ALL_ROLES,
  CONSENT_CHANNELS,
  CONSENT_ERRORS,
  CONSENT_EVENTS,
  CONSENT_FORM_STATES,
  CONSENT_GRANT_SOURCES,
  CONSENT_RECORDABLE_SOURCES,
  CONSENT_REQUIRED_CHANNELS,
  CONSENT_REVOKE_TRIGGERS,
  CONSENT_ROUTES,
  CONSENT_STATES,
  CONSENT_WITHDRAWAL_SOURCES,
  CONTACT_ALLOW_BASES,
  CONTACT_DENIAL_CODES,
  CONTACT_PURPOSES,
  CONVERSATION_CONTROLLERS,
  CONVERSATION_STATES,
  COPILOT_CARD_KINDS,
  COPILOT_COMPOSED_KINDS,
  COPILOT_ERRORS,
  COPILOT_EVENTS,
  COPILOT_OBJECTION_TYPES,
  COPILOT_QUIET_REASONS,
  COPILOT_RATINGS,
  COPILOT_ROUTES,
  COPILOT_STREAM_EVENTS,
  COPILOT_STREAM_STATES,
  COPILOT_TRANSCRIPT_UNAVAILABLE_REASONS,
  CORE_ERRORS,
  CREATE_DEMO_REQUEST_ERROR_CODES,
  CREATE_INVITATION_ERROR_CODES,
  CSV_FAILURES,
  CURRENT_RIGHTS_WORDING_VERSION,
  DAILY_LIMIT_DETAILS_SCHEMA,
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
  DECISION_KINDS,
  DEFAULT_AGENT_CALL_SECONDS,
  DEFAULT_COPILOT_MIN_DEALS,
  DEFAULT_COPILOT_MIN_MOMENTS,
  DEFAULT_MAX_CALLS,
  DEFAULT_MAX_DEALS,
  DEFAULT_MAX_DOCUMENTS,
  DEFAULT_MAX_DOCUMENT_BYTES_TOTAL,
  DEFAULT_MAX_RECORDING_BYTES_TOTAL,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SEARCH_LIMIT,
  DELIVERY_FAILURE_REASONS,
  DOCUMENT_DELETED_MESSAGE,
  DOCUMENT_FAILURE_REASONS,
  DOCUMENT_RETENTION_DAYS,
  DOCUMENT_STATES,
  DOCUMENT_UPLOADED_MESSAGE,
  DRAFT_AUTHORS,
  DRAFT_HOLD_REASONS,
  DRAFT_SOURCE_KINDS,
  DRAFT_STATUSES,
  ERRORS,
  EVIDENCE_CSV_COLUMNS,
  FIELD_HISTORY_STATES,
  FIXED_SOURCE_KINDS,
  GOOGLE_ERROR_PARAM,
  GOOGLE_ERROR_PATH,
  GOOGLE_ROUTES,
  GOOGLE_SIGN_UP_ATTEMPT_PARAM,
  GOOGLE_SIGN_UP_PATH,
  HANDOFF_CHANNELS,
  HANDOFF_REASONS,
  HANDOFF_RESULTS,
  HANDOFF_STATES,
  IDEMPOTENCY_KEY_HEADER,
  INBOX_ADMIN_ROLES,
  INBOX_ALL_ROLES,
  INBOX_CHANNELS,
  INBOX_ERRORS,
  INBOX_EVENTS,
  INBOX_REVIEW_ROLES,
  INBOX_ROUTES,
  INCOMPLETE_UPLOAD_PARTS_TTL_HOURS,
  INQUIRY_ADMIN_ROLES,
  INQUIRY_ALL_ROLES,
  INQUIRY_CALLBACK_STATES,
  INQUIRY_ERRORS,
  INQUIRY_EVENTS,
  INQUIRY_MANAGER_ROLES,
  INQUIRY_ROUTES,
  INQUIRY_SKIP_REASONS,
  INQUIRY_SOURCES,
  INTERNAL_CALL_ERRORS,
  INVITABLE_ROLES,
  INVITATION_STATES,
  LINE_STATES,
  LIST_MEMBERS_MIN_ROLE,
  LIST_TEAM_MEMBERS_ERROR_CODES,
  LIST_TEAM_MEMBERS_MIN_ROLE,
  MARKETING_ERRORS,
  MARKETING_ROUTES,
  MAX_AGENT_CALL_COST_USD_CENTS,
  MAX_AGENT_CALL_SECONDS,
  MAX_AGENT_CONCURRENCY,
  MAX_AGENT_GREETING_LENGTH,
  MAX_ALLOWED_ORIGINS,
  MAX_ANSWER_LENGTH,
  MAX_AUTHORIZATION_URL_LENGTH,
  MAX_AWAY_DAYS,
  MAX_BOOKING_BUFFER_MINUTES,
  MAX_BOOKING_LENGTH_MINUTES,
  MAX_BOOKING_NAME_LENGTH,
  MAX_BOOKING_NOTICE_MINUTES,
  MAX_BULK_ASSIGN_PROSPECTS,
  MAX_CALLBACK_ATTEMPTS,
  MAX_CALL_DURATION_SECONDS,
  MAX_CALL_SPEAKERS,
  MAX_CONDITION_VALUES,
  MAX_CONSENT_FORM_NAME_LENGTH,
  MAX_CONSENT_WORDING_LENGTH,
  MAX_COPILOT_CARDS_PER_CALL,
  MAX_COPILOT_CARD_TEXT_LENGTH,
  MAX_COPILOT_CITED_MOMENTS,
  MAX_COPILOT_MIN_EVIDENCE,
  MAX_COPILOT_QUOTE_LENGTH,
  MAX_COPILOT_STREAM_ID_LENGTH,
  MAX_CURSOR_LENGTH,
  MAX_DAILY_BOOKING_CAP,
  MAX_DEAL_ID_BYTES,
  MAX_DEAL_ID_LENGTH,
  MAX_DEAL_IMPORT_BYTES,
  MAX_DEAL_IMPORT_CELL_LENGTH,
  MAX_DEAL_IMPORT_HEADER_LENGTH,
  MAX_DEAL_IMPORT_ROWS,
  MAX_DEAL_NAME_BYTES,
  MAX_DEAL_NAME_LENGTH,
  MAX_DECISION_NOTE_LENGTH,
  MAX_DELETION_SEQ,
  MAX_DEMO_REQUEST_FIELD_LENGTH,
  MAX_DEMO_REQUEST_MESSAGE_LENGTH,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_FILE_NAME_BYTES,
  MAX_DOCUMENT_FILE_NAME_LENGTH,
  MAX_DOCUMENT_PAGES,
  MAX_DRAFT_SOURCES,
  MAX_ELIGIBLE_REPS,
  MAX_EMAIL_LENGTH,
  MAX_EVIDENCE_REF_LENGTH,
  MAX_EXCEPT_LABELS,
  MAX_FIELD_HISTORY_ENTRIES,
  MAX_HANDOFF_CONTEXT_TURNS,
  MAX_HONEYPOT_LENGTH,
  MAX_INQUIRY_MESSAGE_LENGTH,
  MAX_LINE_LABEL_LENGTH,
  MAX_MERGED_PROSPECTS,
  MAX_MESSAGE_BODY_LENGTH,
  MAX_MOMENT_SNIPPET_CHARACTERS,
  MAX_NAME_LENGTH,
  MAX_PAGE_SIZE,
  MAX_PERSON_NAME_LENGTH,
  MAX_PLAYBACK_URL_LENGTH,
  MAX_PROSPECT_COMPANY_NAME_LENGTH,
  MAX_PROSPECT_FIELD_VALUE_LENGTH,
  MAX_PROSPECT_IMPORT_BYTES,
  MAX_PROSPECT_IMPORT_ROWS,
  MAX_PROSPECT_JOB_TITLE_LENGTH,
  MAX_PROSPECT_NAME_PART_LENGTH,
  MAX_PROSPECT_NOTES_LENGTH,
  MAX_PROSPECT_SEARCH_LENGTH,
  MAX_PROSPECT_TAGS,
  MAX_PROSPECT_TAG_LENGTH,
  MAX_PUBLIC_BOOKING_FIELD_LENGTH,
  MAX_QUALIFICATION_QUESTIONS,
  MAX_QUALIFICATION_SUMMARY_LENGTH,
  MAX_QUESTION_CHOICES,
  MAX_QUESTION_PROMPT_LENGTH,
  MAX_QUESTION_SUGGESTIONS,
  MAX_QUEUED_DEAL_IMPORTS,
  MAX_RECORDING_BYTES,
  MAX_RECORDING_KEY_LENGTH,
  MAX_RECORDING_SECONDS,
  MAX_REGION_LENGTH,
  MAX_REP_FIELD_LENGTH,
  MAX_REP_FOLLOWING_CHARACTERS,
  MAX_REP_FOLLOWING_TURNS,
  MAX_RETURN_TO_LENGTH,
  MAX_RIGHTS_HEADING_LENGTH,
  MAX_RIGHTS_PARAGRAPHS,
  MAX_RIGHTS_TEXT_LENGTH,
  MAX_RIGHTS_WORDING_VERSION,
  MAX_ROUTING_RULES,
  MAX_SEARCH_CANDIDATES,
  MAX_SEARCH_LIMIT,
  MAX_SEARCH_TEXT_CHARACTERS,
  MAX_SEARCH_TURNS,
  MAX_SEQ,
  MAX_SKIP_CONDITIONS,
  MAX_SLOT_RANGE_DAYS,
  MAX_SOFTPHONE_TOKEN_LENGTH,
  MAX_SOFTPHONE_TOKEN_TTL_SECONDS,
  MAX_SOURCE_PASSAGE_LENGTH,
  MAX_SOURCE_REF_LENGTH,
  MAX_SOURCE_URL_LENGTH,
  MAX_SPEAKER_EXCERPT_LENGTH,
  MAX_SPEAKER_LABEL_BYTES,
  MAX_SPEAKER_LABEL_LENGTH,
  MAX_STRATEGY_LENGTH,
  MAX_SUPPRESSION_IMPORT_BYTES,
  MAX_SUPPRESSION_IMPORT_ROWS,
  MAX_SUPPRESSION_NOTE_LENGTH,
  MAX_TRANSCRIPT_BYTES,
  MAX_TRANSCRIPT_TURN_LENGTH,
  MAX_TURN_SOURCES,
  MAX_TURN_TEXT_LENGTH,
  MAX_UTF8_BYTES_PER_CODE_POINT,
  MAX_WINDOWS_PER_DAY,
  MAX_WRAP_UP_NOTE_LENGTH,
  MEDIA_TYPE_BY_CALL_EXTENSION,
  MEDIA_TYPE_BY_EXTENSION,
  MESSAGE_AUTHOR_KINDS,
  MESSAGE_DIRECTIONS,
  MESSAGE_FAILURE_REASONS,
  MIN_COPILOT_MIN_EVIDENCE,
  MIN_QUESTION_CHOICES,
  MIN_SOFTPHONE_TOKEN_TTL_SECONDS,
  OIDC_COOKIE_BASE_NAME,
  OIDC_COOKIE_SECURE_PREFIX,
  ONE_ADDRESS_MESSAGE,
  ORGANIZATION_STATUSES,
  OUTCOMES,
  PACKAGE,
  PAUSE_SEQUENCE_LABELS,
  PLAYBOOK_ERRORS,
  PLAYBOOK_READ_ROLES,
  PLAYBOOK_ROUTES,
  PLAYBOOK_WRITE_ROLES,
  PROSPECT_ADMIN_ROLES,
  PROSPECT_ALL_ROLES,
  PROSPECT_COMPANY_FIELD_NAMES,
  PROSPECT_ERRORS,
  PROSPECT_EVENTS,
  PROSPECT_FIELD_NAMES,
  PROSPECT_IDENTITY_KINDS,
  PROSPECT_IMPORT_COLUMNS,
  PROSPECT_IMPORT_FAILURE_REASONS,
  PROSPECT_IMPORT_FILE_FIELD,
  PROSPECT_IMPORT_INVALID_REASONS,
  PROSPECT_IMPORT_REJECT_REASONS,
  PROSPECT_IMPORT_REPORT_COLUMNS,
  PROSPECT_IMPORT_ROW_RESULTS,
  PROSPECT_IMPORT_SKIP_REASONS,
  PROSPECT_IMPORT_STATES,
  PROSPECT_MERGE_STATES,
  PROSPECT_MERGE_UNDO_DAYS,
  PROSPECT_ROUTES,
  PROSPECT_STATUSES,
  QUALIFICATION_QUESTION_KINDS,
  RECORDING_MEDIA_TYPES,
  REGIONS,
  REPLY_LABELS,
  RIGHTS_WORDINGS,
  ROLES,
  ROUTING_CANDIDATE_REASONS,
  ROUTING_ROLES,
  ROUTING_SKIP_REASONS,
  SALES_HISTORY_ERRORS,
  SALES_HISTORY_READ_ROLES,
  SALES_HISTORY_ROUTES,
  SEARCH_ROUTES,
  SIGNUP_ERRORS,
  SKIP_OPERATORS,
  STOP_SENDING_LABELS,
  SUPPRESSION_ADDRESS_KINDS,
  SUPPRESSION_IMPORT_COLUMNS,
  SUPPRESSION_IMPORT_FAILURE_REASONS,
  SUPPRESSION_IMPORT_FILE_FIELD,
  SUPPRESSION_IMPORT_ROW_RESULTS,
  SUPPRESSION_IMPORT_STATES,
  SUPPRESSION_REASONS,
  SUPPRESSION_REMOVABLE_REASONS,
  UPLOAD_CONTENT_TYPE,
  UPLOAD_FILE_FIELD,
  VOICE_ADMIN_ROLES,
  VOICE_ALL_ROLES,
  VOICE_CALL_DIRECTIONS,
  VOICE_CALL_ENDED_BY,
  VOICE_CALL_FAILURE_REASONS,
  VOICE_CALL_FINAL_STATES,
  VOICE_CALL_OUTCOMES,
  VOICE_CALL_STATES,
  VOICE_ERRORS,
  VOICE_EVENTS,
  VOICE_RECORDING_STATES,
  VOICE_ROUTES,
  VOICE_TRANSCRIPT_STATES,
  WEEKDAYS,
  addLineRequestSchema,
  addSuppressionRequestSchema,
  addTeamMemberRequestSchema,
  addressFieldsShape,
  agentCallOutcomeSchema,
  agentCallParamsSchema,
  agentLanguageSchema,
  agentSettingsSchema,
  agentToolNameSchema,
  agentTurnPageSchema,
  agentTurnRoleSchema,
  agentTurnSchema,
  agentVoiceStyleSchema,
  allowedOriginSchema,
  answerHandoffRequestSchema,
  approvalPoliciesSchema,
  approvalPolicySchema,
  approvalQueueCursorSchema,
  approvalQueueItemSchema,
  approvalQueuePageSchema,
  approvalRuleSchema,
  approveDraftRequestSchema,
  assignLineRequestSchema,
  attemptIdSchema,
  authOptionsResponseSchema,
  authProvidersSchema,
  authorizationUrlSchema,
  availabilitySchema,
  bookHeadersSchema,
  bookRequestSchema,
  bookingCancelledBySchema,
  bookingCancelledEvent,
  bookingCreatedEvent,
  bookingCursorSchema,
  bookingIdSchema,
  bookingLinkTokenSchema,
  bookingModeSchema,
  bookingNameSchema,
  bookingOriginSchema,
  bookingPageSchema,
  bookingParamsSchema,
  bookingRescheduledEvent,
  bookingSchema,
  bookingStateSchema,
  bookingTypeCursorSchema,
  bookingTypeIdSchema,
  bookingTypeParamsSchema,
  bookingTypeSchema,
  bookingTypeStateSchema,
  boundedTextSchema,
  browserSessionTokensSchema,
  bulkAssignProspectsRequestSchema,
  bulkAssignProspectsResponseSchema,
  calendarConnectionSchema,
  calendarConnectionStateSchema,
  calendarDateSchema,
  calendarProviderSchema,
  callChannelSchema,
  callCursorSchema,
  callDeletedPayloadSchema,
  callDisclosureSchema,
  callFailureReasonSchema,
  callIdSchema,
  callKindSchema,
  callListItemSchema,
  callMediaTypeSchema,
  callParamsSchema,
  callRepChangedPayloadSchema,
  callReuploadRequeues,
  callSchema,
  callStateSchema,
  callTranscribedPayloadSchema,
  callUploadedPayloadSchema,
  changeMemberRoleRequestSchema,
  channelConsentSchema,
  channelParamsSchema,
  chatIdSchema,
  chatMessagePageSchema,
  chatMessageSchema,
  chatPageSchema,
  chatParamsSchema,
  chatSchema,
  chatSessionTokenSchema,
  chatStateSchema,
  chatTextSchema,
  checkCallFile,
  checkDealImportHeader,
  checkDealImportHeaderText,
  checkDealImportRow,
  checkUploadFile,
  classificationSchema,
  companySizeBandSchema,
  completeCalendarConnectionRequestSchema,
  confidenceSchema,
  confirmRightsRequestSchema,
  consentChannelSchema,
  consentEventIdSchema,
  consentEventPageSchema,
  consentEventSchema,
  consentFormIdSchema,
  consentFormPageSchema,
  consentFormParamsSchema,
  consentFormSchema,
  consentFormStateSchema,
  consentGrantSourceSchema,
  consentGrantedEvent,
  consentProspectParamsSchema,
  consentRevokeTriggerSchema,
  consentSourceSchema,
  consentStateSchema,
  consentTokenParamsSchema,
  consentTokenSchema,
  consentWithdrawalSourceSchema,
  consentWithdrawnEvent,
  consentWordingIdSchema,
  consentWordingPageSchema,
  consentWordingParamsSchema,
  consentWordingSchema,
  consentWordingTextSchema,
  contactCheckIdSchema,
  contactCheckLogEntrySchema,
  contactCheckLogPageSchema,
  contactCheckRequestSchema,
  contactCheckResultSchema,
  contactDenialCodeSchema,
  contactPurposeSchema,
  contactWarningSchema,
  conversationActionRequestSchema,
  conversationControllerSchema,
  conversationCursorSchema,
  conversationHandedBackEvent,
  conversationIdSchema,
  conversationMessageParamsSchema,
  conversationPageSchema,
  conversationParamsSchema,
  conversationSchema,
  conversationStateSchema,
  conversationTakenOverEvent,
  copilotCallParamsSchema,
  copilotCardCursorSchema,
  copilotCardDataSchema,
  copilotCardIdSchema,
  copilotCardKindSchema,
  copilotCardPageSchema,
  copilotCardParamsSchema,
  copilotCardSchema,
  copilotCardTextSchema,
  copilotDocumentSourceSchema,
  copilotEvidenceSchema,
  copilotMomentKey,
  copilotMomentRefSchema,
  copilotObjectionTypeSchema,
  copilotQuietReasonSchema,
  copilotQuoteSchema,
  copilotQuoteTextSchema,
  copilotRatingSchema,
  copilotSettingsSchema,
  copilotStatusDataSchema,
  copilotStreamHeadersSchema,
  copilotStreamIdSchema,
  copilotStreamMessageSchema,
  copilotStreamStateSchema,
  copilotTextSchema,
  copilotTranscriptUnavailableDataSchema,
  copilotTurnDataSchema,
  correctClassificationRequestSchema,
  countryCodeSchema,
  createBookingTypeRequestSchema,
  createConsentFormRequestSchema,
  createConsentWordingRequestSchema,
  createDemoRequestRequestSchema,
  createDemoRequestResponseSchema,
  createInvitationRequestSchema,
  createProspectCompanyRequestSchema,
  createProspectRequestSchema,
  createQualificationQuestionRequestSchema,
  createRoutingRuleRequestSchema,
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
  decisionCursorSchema,
  decisionIdSchema,
  decisionKindSchema,
  decisionNoteSchema,
  decisionPageSchema,
  decisionSchema,
  decodeCursor,
  defineErrors,
  defineEvent,
  deletedRecordingSchema,
  demoRequestIdSchema,
  demoRequestMessageSchema,
  demoRequestSourcePageSchema,
  documentDeletedPayloadSchema,
  documentExtension,
  documentFailureReasonSchema,
  documentFileNameSchema,
  documentIdSchema,
  documentMatchSchema,
  documentMediaTypeSchema,
  documentParamsSchema,
  documentQueryText,
  documentSchema,
  documentSearchEvidenceSchema,
  documentSizeCheckSchema,
  documentStateSchema,
  documentTypeCheckSchema,
  documentUploadedPayloadSchema,
  draftAuthorSchema,
  draftCheckSchema,
  draftHoldReasonSchema,
  draftIdSchema,
  draftParamsSchema,
  draftReasonSchema,
  draftReleaseSchema,
  draftSchema,
  draftSourceKindSchema,
  draftSourcesSchema,
  draftStatusSchema,
  duplicateIdentityDetailsSchema,
  e164PhoneSchema,
  emailSchema,
  encodeCursor,
  eraseProspectResponseSchema,
  errorBodySchema,
  errorCodeSchema,
  eventEnvelopeSchema,
  eventIdSchema,
  eventTypeSchema,
  evidenceEventSchema,
  evidencePageSchema,
  evidenceRefSchema,
  excerptText,
  fieldHistoryCursorSchema,
  fieldHistoryEntrySchema,
  fieldHistoryStateSchema,
  fieldValueSchema,
  firstCsvRecord,
  foldAscii,
  formatCopilotStreamFrame,
  formatId,
  getTranscriptQuerySchema,
  googleCompleteRequestSchema,
  googleCompleteResponseSchema,
  googleErrorQuerySchema,
  googleIntentSchema,
  googleSignUpQuerySchema,
  googleStartRequestSchema,
  googleStartResponseSchema,
  handoffChannelSchema,
  handoffContextSchema,
  handoffIdSchema,
  handoffPageSchema,
  handoffParamsSchema,
  handoffReasonSchema,
  handoffResultSchema,
  handoffSchema,
  handoffStateSchema,
  hasControlCharacter2 as hasControlCharacter,
  hasExactlyOneAddress,
  hasStrippableCharacter,
  holdReasonFor,
  hostedConsentFormViewSchema,
  hostedConsentReceiptSchema,
  hostedConsentSubmissionSchema,
  idSchema,
  idempotencyKeySchema,
  inboxChannelSchema,
  inboxKeyedHeadersSchema,
  ingestMessageRequestSchema,
  ingestMessageResultSchema,
  inquiryCallbackSchema,
  inquiryCallbackStateSchema,
  inquiryConsentSchema,
  inquiryCursorSchema,
  inquiryEmbedSchema,
  inquiryIdSchema,
  inquiryKeySchema,
  inquiryKeyedHeadersSchema,
  inquiryMessageSchema,
  inquiryPageSchema,
  inquiryParamsSchema,
  inquirySchema,
  inquirySkipReasonSchema,
  inquirySourceSchema,
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
  isComposedKind,
  isWellFormedText,
  joinUrlSchema,
  lineAssignmentSchema,
  lineCursorSchema,
  lineIdSchema,
  lineLabelSchema,
  linePageSchema,
  lineParamsSchema,
  lineSchema,
  lineStateSchema,
  listAgentTurnsQuerySchema,
  listApprovalQueueQuerySchema,
  listBookingTypesQuerySchema,
  listBookingsQuerySchema,
  listCallsQuerySchema,
  listCallsResponseSchema,
  listChatMessagesQuerySchema,
  listChatsQuerySchema,
  listConsentEventsQuerySchema,
  listConsentFormsQuerySchema,
  listConsentWordingsQuerySchema,
  listContactChecksQuerySchema,
  listConversationsQuerySchema,
  listCopilotCardsQuerySchema,
  listDealImportRowsQuerySchema,
  listDealImportRowsResponseSchema,
  listDealImportsQuerySchema,
  listDealImportsResponseSchema,
  listDealsQuerySchema,
  listDealsResponseSchema,
  listDecisionsQuerySchema,
  listDocumentsQuerySchema,
  listDocumentsResponseSchema,
  listEvidenceQuerySchema,
  listFieldHistoryQuerySchema,
  listFieldHistoryResponseSchema,
  listHandoffsQuerySchema,
  listInquiriesQuerySchema,
  listInvitationsQuerySchema,
  listInvitationsResponseSchema,
  listLinesQuerySchema,
  listMembersQuerySchema,
  listMembersResponseSchema,
  listMessagesQuerySchema,
  listProspectCompaniesQuerySchema,
  listProspectCompaniesResponseSchema,
  listProspectDuplicatesQuerySchema,
  listProspectDuplicatesResponseSchema,
  listProspectImportRowsQuerySchema,
  listProspectImportRowsResponseSchema,
  listProspectImportsQuerySchema,
  listProspectImportsResponseSchema,
  listProspectsQuerySchema,
  listProspectsResponseSchema,
  listQualificationQuestionsQuerySchema,
  listRoutingRulesQuerySchema,
  listSlotsQuerySchema,
  listSuppressionEntriesQuerySchema,
  listSuppressionImportRowsQuerySchema,
  listSuppressionImportsQuerySchema,
  listTeamMembersQuerySchema,
  listTeamMembersResponseSchema,
  listTeamsQuerySchema,
  listTeamsResponseSchema,
  listVoiceCallsQuerySchema,
  lookupDealRequestSchema,
  lookupSuppressionRequestSchema,
  markCopilotCardRequestSchema,
  maskedAddressSchema,
  memberParamsSchema,
  memberSchema,
  membershipIdSchema,
  mergeProspectsRequestSchema,
  messageApprovedEvent,
  messageAuthorKindSchema,
  messageBodySchema,
  messageCursorSchema,
  messageDirectionSchema,
  messageFailedEvent,
  messageFailureReasonSchema,
  messageIdSchema,
  messagePageSchema,
  messageSchema2 as messageSchema,
  messageSentEvent,
  momentMatchSchema,
  momentQueryText,
  momentSnippet,
  momentSnippetSchema,
  normaliseDealId,
  normaliseFileName,
  normaliseMediaType,
  normaliseSpeakerLabel,
  oneClickUnsubscribeRequestSchema,
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
  phoneHashSchema,
  placeCallHeadersSchema,
  placeCallRequestSchema,
  placedCallSchema,
  prospectCompanyCursorSchema,
  prospectCompanyDomainSchema,
  prospectCompanyFieldNameSchema,
  prospectCompanyFieldParamsSchema,
  prospectCompanyIdSchema,
  prospectCompanyNameSchema,
  prospectCompanyParamsSchema,
  prospectCompanySchema,
  prospectConsentSchema,
  prospectCreatedEvent,
  prospectCursorSchema,
  prospectDuplicateCursorSchema,
  prospectDuplicateSchema,
  prospectErasedEvent,
  prospectFieldNameSchema,
  prospectFieldParamsSchema,
  prospectIdSchema,
  prospectIdentityKindSchema,
  prospectImportCursorSchema,
  prospectImportFailureReasonSchema,
  prospectImportIdSchema,
  prospectImportInvalidDetailsSchema,
  prospectImportParamsSchema,
  prospectImportRowCursorSchema,
  prospectImportRowReasonSchema,
  prospectImportRowResultSchema,
  prospectImportRowSchema,
  prospectImportSchema,
  prospectImportStateSchema,
  prospectJobTitleSchema,
  prospectMergeIdSchema,
  prospectMergeParamsSchema,
  prospectMergeSchema,
  prospectMergeUndoneEvent,
  prospectMergedEvent,
  prospectNamePartSchema,
  prospectNotFoundDetailsSchema,
  prospectNotesSchema,
  prospectParamsSchema,
  prospectSchema,
  prospectSearchSchema,
  prospectStatusSchema,
  prospectTagsSchema,
  prospectUpdatedEvent,
  providerMessageIdSchema,
  publicBookRequestSchema,
  publicBookingConfirmationSchema,
  publicBookingParamsSchema,
  publicBookingTypeSchema,
  publicChatConsentReceiptSchema,
  publicChatConsentRequestSchema,
  publicChatHandoffReplySchema,
  publicChatHandoffRequestSchema,
  publicChatHeadersSchema,
  publicChatKeyParamsSchema,
  publicChatMessagePageSchema,
  publicChatMessageReplySchema,
  publicChatMessageSchema,
  publicChatOriginHeadersSchema,
  publicChatReplySchema,
  publicChatSessionParamsSchema,
  publicInquiryFormViewSchema,
  publicInquiryHeadersSchema,
  publicInquiryParamsSchema,
  publicInquiryReceiptSchema,
  publicInquiryRequestSchema,
  publicListChatMessagesQuerySchema,
  publicListSlotsQuerySchema,
  publicOriginHeadersSchema,
  publicSendChatMessageRequestSchema,
  publicSlotPageSchema,
  publicSlotSchema,
  publicStartChatRequestSchema,
  publicStartChatResponseSchema,
  qualificationAnswerSchema,
  qualificationQuestionIdSchema,
  qualificationQuestionKindSchema,
  qualificationQuestionPageSchema,
  qualificationQuestionParamsSchema,
  qualificationQuestionSchema,
  qualificationSchema,
  qualificationValueSchema,
  questionPromptSchema,
  questionSuggestionsSchema,
  rawLinkedinUrlSchema,
  rawPhoneSchema,
  recordConsentRequestSchema,
  recordDeliveryFailureRequestSchema,
  recordWithdrawalRequestSchema,
  recordedConsentSchema,
  recordedSuppressionSchema,
  recordingKeySchema,
  recordingPlaybackSchema,
  regionSchema,
  rejectDraftRequestSchema,
  removeSuppressionRequestSchema,
  renameOrganizationRequestSchema,
  renameTeamRequestSchema,
  reorderQualificationQuestionsRequestSchema,
  reorderRoutingRulesRequestSchema,
  repChangeAllowed,
  repChoiceSchema,
  repChoiceSuits,
  replyClassifiedEvent,
  replyLabelSchema,
  replyRequestSchema,
  requestIdSchema,
  rescheduleBookingRequestSchema,
  retryAfterDetailsSchema,
  returnToSchema,
  rightsConfirmationSchema,
  rightsRequiredDetailsSchema,
  rightsStatusSchema,
  rightsWordingFor,
  rightsWordingSchema,
  rightsWordingVersionSchema,
  roleAtLeast,
  roleSchema,
  routeRequestSchema,
  routingAttributesSchema,
  routingCandidateReasonSchema,
  routingConditionsSchema,
  routingDecisionIdSchema,
  routingResultSchema,
  routingRuleIdSchema,
  routingRuleParamsSchema,
  routingRuleSchema,
  routingSkipReasonSchema,
  routingTargetSchema,
  searchDocumentsRequestSchema,
  searchDocumentsResponseSchema,
  searchEvidenceSchema,
  searchMomentsRequestSchema,
  searchMomentsResponseSchema,
  searchTurnSchema,
  sendTryMessageRequestSchema,
  setAgentSettingsRequestSchema,
  setApprovalPolicyRequestSchema,
  setCallRepRequestSchema,
  setCopilotSettingsRequestSchema,
  setDealOutcomeRequestSchema,
  setInquiryEmbedRequestSchema,
  setProspectOwnerRequestSchema,
  skipConditionSchema,
  skipOperatorSchema,
  slotPageSchema,
  slotSchema,
  softphoneTokenSchema,
  sourceKindSchema,
  sourcePassageSchema,
  sourceRefSchema,
  sourceSchema,
  sourceUrlSchema,
  speakerExcerpt,
  speakerExcerptSchema,
  speakerLabelSchema,
  startCalendarConnectionRequestSchema,
  startCalendarConnectionResponseSchema,
  startTrySessionRequestSchema,
  storedNameSchema,
  suggestedQualificationQuestionSchema,
  suppressionAddedEvent,
  suppressionAddressKindSchema,
  suppressionEntryIdSchema,
  suppressionEntryPageSchema,
  suppressionEntryParamsSchema,
  suppressionEntrySchema,
  suppressionImportIdSchema,
  suppressionImportPageSchema,
  suppressionImportParamsSchema,
  suppressionImportRowPageSchema,
  suppressionImportRowSchema,
  suppressionImportSchema,
  suppressionImportStateSchema,
  suppressionListStateSchema,
  suppressionReasonSchema,
  suppressionRemovedEvent,
  teamIdSchema,
  teamMemberParamsSchema,
  teamMemberSchema,
  teamNameSchema,
  teamParamsSchema,
  teamSchema,
  testRoutingRequestSchema,
  timeOfDaySchema,
  timeZoneSchema,
  timestampSchema,
  toReplyLabel,
  transcriptCursorSchema,
  transcriptPageSchema,
  transcriptSpeakerSchema,
  transcriptTurnSchema,
  tryReplySchema,
  trySessionIdSchema,
  trySessionParamsSchema,
  trySessionSchema,
  unsubscribePreviewSchema,
  unsubscribeReceiptSchema,
  updateBookingTypeRequestSchema,
  updateConsentWordingRequestSchema,
  updateProspectCompanyRequestSchema,
  updateProspectRequestSchema,
  updateQualificationQuestionRequestSchema,
  updateRoutingRuleRequestSchema,
  uploadCallFieldsSchema,
  uploadCallFileSchema,
  uploadDocumentFileSchema,
  userIdSchema,
  voiceAgentCallEndedEvent,
  voiceCallCursorSchema,
  voiceCallDirectionSchema,
  voiceCallEndedBySchema,
  voiceCallEndedEvent,
  voiceCallFailureReasonSchema,
  voiceCallOutcomeSchema,
  voiceCallPageSchema,
  voiceCallParamsSchema,
  voiceCallSchema,
  voiceCallStartedEvent,
  voiceCallStateSchema,
  voiceConsentRevokedEvent,
  voiceCopilotCardRatedEvent,
  voiceCopilotCardShownEvent,
  voiceHandoffCompletedEvent,
  voiceInquiryReceivedEvent,
  voiceRecordingStateSchema,
  voiceTranscriptStateSchema,
  weekdaySchema,
  withdrawConsentRequestSchema,
  workingDaySchema,
  workingWindowSchema,
  wrapUpNoteSchema,
  wrapUpRequestSchema
};
