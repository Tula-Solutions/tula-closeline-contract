# tula-closeline-contract

Closeline API schemas, types and error codes shared by services and the portal

Part of Closeline. The hub repo [`tula-closeline`](https://github.com/Tula-Solutions/tula-closeline)
holds the glossary, decision records, plans, issues and the shared workflow setup.

## Getting started

```bash
gh auth setup-git      # once: lets git fetch the private tula-closeline-* libraries over https
bun install
bun run verify
```

Standards: `AGENTS.md` (this repo) and `.claude/COMMON.md` (shared).

## Core's API surface (0.7.0)

Schemas and inferred types only; routes and handlers live in `tula-closeline-core`.

- **Requests, queries and path parameters are strict**: an unknown key is rejected. A new request
  field therefore needs the server deployed before any client sends it.
- **Responses strip unknown keys** (`z.object`), so a consumer pinned to an older tag still parses a
  response from a newer service: a new response field is safe for older consumers.
- **A service must send the output of `Schema.parse(row)`, never the row.** Stripping removes a
  field only when the response is built from the parse output; a row sent as is would carry a
  column the schema does not name (an Invitation response has no token or token hash).
- **Names are untrusted text.** Name schemas trim, bound the length (1 to 200) and reject control
  characters and a lone surrogate, but allow zero-width and direction-override characters. Display
  code must treat a name as untrusted. Name requests are capped at 1000 raw characters before the trim.
  Response schemas accept any 1 to 1000 character name (`storedNameSchema`): the database bounds
  the name after trimming spaces, so a stored name may carry surrounding spaces, and core writes
  only the trimmed output of the request schemas.
- **Every public POST accepts the `Idempotency-Key` header** (`idempotencyKeySchema`), including
  create Invitation and create Team. A replay returns the original result; the same key with a
  different body returns the common code `request.idempotency_key_reused` (422); the same key while
  the first request is still running returns `request.idempotency_in_progress` (409).

| Group | Exports |
| --- | --- |
| Ids | `invitationIdSchema` (`inv_…`), beside the existing `organizationIdSchema`, `userIdSchema`, `membershipIdSchema`, `teamIdSchema` |
| Shared values | `INVITABLE_ROLES`, `invitableRoleSchema` (never `owner`); `ORGANIZATION_STATUSES`, `organizationStatusSchema`; `INVITATION_STATES`, `invitationStateSchema`; `emailSchema`, `foldAscii` (ASCII-only folding; printable ASCII only, so an internationalised domain must already be in its A-label form: the service converts, the schema does not); `organizationNameSchema`, `teamNameSchema` (trimmed, then 1 to 200 characters), `personNameSchema` (a person's display name in a request, 1 to 201), `storedNameSchema` (the response form); `invitationTokenSchema`; `timestampSchema`; `IDEMPOTENCY_KEY_HEADER`, `idempotencyKeySchema` |
| Organization | `organizationSchema`, `renameOrganizationRequestSchema` |
| Members | `memberSchema` (with `email` and `name`, core's copy of what auth holds; `name` is `null` when the person gave none), `listMembersQuerySchema`, `listMembersResponseSchema`, `memberParamsSchema`, `changeMemberRoleRequestSchema` |
| Invitations | `invitationSchema`, `createInvitationRequestSchema`, `listInvitationsQuerySchema` (a page plus `state`, default `pending`), `listInvitationsResponseSchema`, `invitationParamsSchema` |
| Teams | `teamSchema`, `createTeamRequestSchema`, `renameTeamRequestSchema`, `listTeamsQuerySchema`, `listTeamsResponseSchema`, `teamParamsSchema`, `addTeamMemberRequestSchema`, `teamMemberSchema`, `teamMemberParamsSchema` |
| Internal (auth to core) | `internalCreateOrganizationRequestSchema` / `…ResponseSchema`, `internalAcceptInvitationRequestSchema` / `…ResponseSchema`, `internalMembershipRequestSchema` / `…ResponseSchema` (`found: true` with Organization id, role and status, or `found: false`), `internalUpdateMemberProfileParamsSchema` / `…RequestSchema` / `…ResponseSchema`, `internalAbandonOrganizationParamsSchema` / `…RequestSchema` / `…ResponseSchema`, `ABANDON_MAX_AGE_HOURS`, `INTERNAL_CALL_ERRORS`, `InternalCallName` |
| Errors | `CORE_ERRORS` (`organization.*`, including `organization.not_abandonable`, `member.*`, `membership.already_member`, `invitation.*`, `team.*`) and `SIGNUP_ERRORS` (`auth.no_organization`, `signup.*`, `membership.unavailable`); a role that is not allowed is the common `auth.forbidden` |

### Auth error codes

`AUTH_ERRORS` is every code the auth service answers with beyond the common ones:
`auth.invalid_credentials`, `auth.user_banned`, `email.*`, `password.*`, `verification.*`,
`flow.*`, `mail.unavailable` and `session.*`, plus `SIGNUP_ERRORS` and `organization.deleted` by
reference. The codes in a password failure's `details.errors[].code` are keys of this map.

### Internal calls

Each call that has effects carries an `Idempotency-Key` header, none names a Region (a deployment
serves one) and none takes an Organization from the caller. The domain codes each may return are
exported as `INTERNAL_CALL_ERRORS` (a frozen map from call name to codes) for core's tests:

| Call | Domain codes it may return |
| --- | --- |
| create Organization (`POST /internal/organizations`) | `membership.already_member` only. The request carries the person's `email` and `name`, both optional until auth sends them. |
| accept Invitation (`POST /internal/invitations/accept`) | `invitation.invalid` or `membership.already_member` only, never an Organization status code. Core compares the request's `email`, folded, with the Invitation's and answers `invitation.invalid` on a mismatch. The request's `name` is optional until auth sends it. |
| membership lookup (`POST /internal/membership`) | none: a user with no membership is answered `found: false`. |
| profile change (`PATCH /internal/members/{userId}`) | `member.not_found` only, for a user with no membership. The body is a new `email`, a new `name` (`null` clears it) or both; a repeat gives the same answer. Auth has no route that changes either yet. |
| abandon Organization (`POST /internal/organizations/{organizationId}/abandon`) | `organization.not_abandonable` only, for a live Organization that fails the guard: more than one member, a sole member who is not the `userId` in the body, or `ABANDON_MAX_AGE_HOURS` (24) hours old or more. It answers `{ organizationId, status: 'deleted' }` whenever no live Organization with that id exists when it returns (abandoned by this call or earlier, deleted, or never created), under any key or `userId`, so success does not mean this call deleted it. Success means no live Organization remains, not that the user id is free yet; auth must not depend on that immediately. The holder of the internal token can tell a live id from any other (409 against 200); the single code hides only which guard condition failed. |

Common codes (`auth.*`, `request.*`, `server.*`) can come from any call.

A member's `email` and `name` are core's copy of what the auth service holds for the person. Auth
keeps a first and a last name (both optional) at sign-up, so the `name` it sends is the two joined
by one space, and `null` when the person gave neither; a request `name` is at most 201 characters
(`personNameSchema`). Neither field is a filter or search key on the member list.

Lists use the existing cursor pagination (`pageQuerySchema`, at most 100 per page); the Invitation
list also takes `state` (`pending`, `accepted` or `revoked`, default `pending`). Fold emails and
Team names with `foldAscii`, never `toLowerCase()`.

## Playbook API surface (0.7.0, ADR 0016; sales history 0.8.0, ADR 0018)

Schemas only, as for core. `PLAYBOOK_ROUTES` holds each route's method, path, roles, success
statuses, error codes and OpenAPI description (this library has no OpenAPI generator; the service
builds its document from these).

- **States** (`DOCUMENT_STATES`): `uploaded`, `processing`, `ready`, `failed`, `deleted` (soft-deleted,
  awaiting purge). A `failed` document carries `failureReason` from `DOCUMENT_FAILURE_REASONS`; a
  `deleted` one carries `deletedAt` and `purgeAt`.
- **Upload** is `multipart/form-data` with one part, `file` (`UPLOAD_FILE_FIELD`), and an
  `Idempotency-Key` header. Services call `checkUploadFile(file)` on what they read off the part: it runs the size check (`document.too_large`), then the type check on the stored name (`document.unsupported_type`), then the shape (`request.invalid`) and returns the parsed file or the code. `documentSizeCheckSchema`, `documentTypeCheckSchema` and `uploadDocumentFileSchema` are the steps it uses. The extension and `mediaType` of a document are not checked against each other: that is the service's job. The page limit is not an error: a document over it ends `failed` with `failureReason: too_many_pages`. `normaliseMediaType` lower-cases a media type and drops its parameters.
  A new document answers 201; a duplicate of existing content answers 200 with the stored document (a `deleted` match is restored, a `failed` match is re-queued). Delete and restore are idempotent by end state. `DOCUMENT_DELETED_MESSAGE` carries `deletionSeq` (1 to `MAX_DELETION_SEQ`, a Postgres `integer`), which the service bumps on each state-changing delete (a repeated delete does not bump it or publish again); it is not on the public document.
- **File names** (`documentFileNameSchema`) have control and bidirectional characters stripped, are
  1 to 255 Unicode code points, hold no `/` or `\` and need a visible stem; they are display text, never a storage key.
- **Limits** are exported constants, each saying whether the owner chose it or it is a default.
- **Messages** `DOCUMENT_UPLOADED_MESSAGE` and `DOCUMENT_DELETED_MESSAGE` are `{ type, version, scope,
  payload }`, the pieces of the kit's `defineMessage`.

### Sales history (0.8.0, ADR 0018)

Additive in 0.8.0 (0.11.0 is not: it changes `closedAt`, see below); the 0.7.0 types are unchanged (`PlaybookRoute`, `PLAYBOOK_ROUTES` and `PLAYBOOK_ERRORS` do not gain methods or codes). `SALES_HISTORY_ROUTES` (type `SalesHistoryRoute`) describes the 16 routes; for one OpenAPI document use `ALL_PLAYBOOK_ROUTES` and `ALL_PLAYBOOK_ERRORS`, which merge both areas, `SALES_HISTORY_ERRORS` holds the codes
(`call.*`, `deal.*`, `deal_import.*`, `rights.*`) and the messages are `CALL_UPLOADED_MESSAGE`,
`CALL_TRANSCRIBED_MESSAGE`, `CALL_REP_CHANGED_MESSAGE`, `CALL_DELETED_MESSAGE`,
`DEAL_OUTCOME_CHANGED_MESSAGE` and `DEAL_IMPORT_UPLOADED_MESSAGE`. They carry ids and sequences
(`repSeq`, `deletionSeq`, `outcomeSeq`, each 1 to `MAX_SEQ`) only, never content.

- **Call states** (`CALL_STATES`): `uploaded`, `transcribing`, `awaiting_rep`, `processing`, `ready`,
  `failed`, `deleted`. Failure reasons: `CALL_FAILURE_REASONS`. Import states and row reasons:
  `DEAL_IMPORT_STATES`, `DEAL_IMPORT_ROW_REASONS`. A row result is `applied` or `rejected` in the
  report, never an HTTP error; a report row echoes only the deal id.
- **Rep** is `repChoiceSchema`: `{by:'speaker', label}` or `{by:'channel', channel:'left'|'right'}`, or
  absent for a Recording that will wait in `awaiting_rep`. `repChoiceSuits(kind, rep, when)` says
  which suits. Upload text fields are `uploadCallFieldsSchema`; `rep` is JSON text, read with `parseRepField(text)`, which answers `{ ok: true, rep }` (`rep` is `null` when the field was not sent) or `{ ok: false, code: 'call.rep_invalid' }` for a present field that is empty, too long or invalid. `repChangeAllowed(state, failureReason)` says when a Rep may be changed.
- **Helpers** (call these, not the pieces): `checkCallFile(file)` (size, type, shape; kind from the
  extension), `checkDealImportHeader(firstLine)`, `normaliseDealId`, `normaliseSpeakerLabel`.
- **Deal ids** (`dealIdSchema`) are the customer's text: trimmed, otherwise exact and case-sensitive, 1 to
  128 Unicode code points, rejected (not stripped) if they hold a control, direction or Unicode
  format character (category Cf, so no soft hyphen, zero-width, word joiner or tag character), a line
  or paragraph separator or a Hangul filler; homoglyphs stay accepted. They may hold a name and are
  never logged, and never travel in a URL path: a Deal's path id is the opaque `deal_…` id
  (`dealRecordIdSchema`, field `id`; Calls carry it as `dealRecordId`, and the queue message names it).
  Look a Deal up by the customer's id with `POST /playbook/deals/lookup` (the id in the body, `lookupDealRequestSchema`); no list has a deal id filter, `listCalls` filters by `dealRecordId`, and list cursors (`callCursorSchema`, `dealCursorSchema`, `dealImportCursorSchema`, `dealImportRowCursorSchema`) hold the opaque id or a row number, never a deal id.
- **Lengths** count Unicode code points (Zod's count, the same as a Postgres `varchar(n)`); a column
  must allow `MAX_UTF8_BYTES_PER_CODE_POINT` (4) bytes for each: `MAX_DEAL_ID_BYTES`,
  `MAX_DEAL_NAME_BYTES`, `MAX_SPEAKER_LABEL_BYTES`, `MAX_DOCUMENT_FILE_NAME_BYTES`.
- **CSV**: split the text in a background job with `parseCsv(text, { maxRecords, maxCellLength })`
  (defaults `MAX_DEAL_IMPORT_ROWS + 1` records and `MAX_DEAL_IMPORT_CELL_LENGTH`, 1000 code points, which only bounds memory: a cell over 1000 characters, like a quoting error, fails the whole file, while a longer-than-allowed name or a padded cell up to 1000 is a row result; it stops
  at the first limit with `too_many_records` or `cell_too_long`, and needs the whole text, so never
  on a request path). Quoting is strict RFC 4180: a quote inside an unquoted cell or text after a
  closing quote is `bad_quote`, a quote that never closes is `unterminated_quote`. The header is record
  1 and `rowNumber` is the record number, so a quoted cell spanning lines is one record; a blank line
  (`isBlankCsvRecord`) inside the file is a rejected row with the reason `blank_row` (no deal id; a run of blank lines at the end of the file is dropped by `parseCsv`), so the report has
  no gap, and it counts in the numbers, as in a spreadsheet. The upload route checks the header early with `checkDealImportHeaderText` on the first `DEAL_IMPORT_HEADER_PREFIX_CHARS` (8192) characters of the file (a header unfinished there answers `{ ok: true, deferred: true }` and the job decides),
  which reads the first record with `firstCsvRecord` (same rules and limits); the job re-checks the first
  record of its parse with `checkDealImportHeader(record)`; the two give one verdict. Each record then
  goes through `checkDealImportRow(cells, hasName)`, which uses `parseOutcomeCell` (`won`/`lost`/`open`,
  any case, trimmed), `parseClosedAtCell` (only a plain `YYYY-MM-DD`, a real day, kept as written; a value
  with a time or an offset is `invalid_closed_at`; blank is none; every Outcome accepts it; the year
  must be 1970 to 2100),
  `parseAmountCell` (non-negative decimal, at most 15 integer and 2 fraction digits, up to
  999999999999999.99, no leading zeros beyond one `0`; blank is none) and `parseCurrencyCell` (three
  letters, folded to upper case; required when an amount is present). Example: a record
  `D-1,won,2026-10-12,10,EUR,"Acme` then `renewal"` is one record, row 2.
- **What fixes a failed Call** (`CALL_FAILURE_FIXES`):

  | Failure reason | Fix | A same-Deal re-upload of identical content |
  | --- | --- | --- |
  | `rep_label_not_found`, `not_per_side` | change the Rep | answers 200 with the failed Call unchanged |
  | `transcription_failed`, `transcription_timed_out`, `processing_failed` | re-upload (may be transient) | re-queues the Call (`callReuploadRequeues`) |
  | `too_many_speakers`, `no_turns`, `too_few_speakers`, `too_long`, `unreadable` | delete the Call and upload a corrected file | answers 200 with the failed Call unchanged |

  A `failed` Call with `too_many_speakers` lists no `speakerLabels`.
- **Breaking in 0.11.0: `closedAt` is a date.** A Deal's `closedAt` (the Deal response and the
  Outcome request) changes from a timestamp to a `YYYY-MM-DD` calendar date string
  (`calendarDateSchema`, a real day from 1970 to 2100 as in the CSV: 2026-02-30 is refused), so a consumer that read it as an
  instant must read it as a date; the CSV `closed_at` accepts only that form too.
- **Speaker excerpts (0.11.0)**: a Call may carry `speakers`, `{ label, excerpt }` per speaker (at most
  `MAX_CALL_SPEAKERS`), so the Rep pick shows who said what. Build each excerpt with
  `speakerExcerpt(turns)`: the first turns joined, whitespace collapsed, at most
  `MAX_SPEAKER_EXCERPT_LENGTH` (240) code points, cut at a word boundary with an ellipsis. The field
  is optional (only for a Recording with labels, above all `awaiting_rep`; never empty). It is tenant
  Transcript text: return it only to the owning Organization's Owner and Admin, never log it. Only
  `getCall` returns it: a list item (`callListItemSchema`) is strict and refuses `speakers`.
- **Search flags**: a Call carries `dealOutcome` and `inSearch` (true only when `ready` and the Deal
  is won; it may lag for a Deal that has just become won).
- **Rights**: `rightsStatusSchema`, `confirmRightsRequestSchema`; `rights.confirmation_required` (403)
  carries `rightsRequiredDetailsSchema` in `details` with the wording version to show.
- **Limits and defaults** are exported constants, each saying whether it is the owner's or a default:
  `MAX_TRANSCRIPT_BYTES`, `MAX_RECORDING_BYTES`, `MAX_RECORDING_SECONDS`, `MAX_DEAL_IMPORT_BYTES`,
  `MAX_DEAL_IMPORT_ROWS`, `MAX_QUEUED_DEAL_IMPORTS` (5 imports not yet finished per Organization, then `deal_import.busy`, 429), `MAX_DEAL_ID_LENGTH`, `MAX_REP_FOLLOWING_TURNS`, `MAX_REP_FOLLOWING_CHARACTERS`,
  `INCOMPLETE_UPLOAD_PARTS_TTL_HOURS`, `DEFAULT_MAX_CALLS`, `DEFAULT_MAX_RECORDING_BYTES_TOTAL`, `DEFAULT_MAX_DEALS`.

### Deal import follow-ups (0.10.0)

`blank_row` is a new `DealImportRowReason` (an interior blank line, no deal id), which widens the
list: handle it wherever the reasons are matched exhaustively. `deal_import.busy` (429) and
`MAX_QUEUED_DEAL_IMPORTS` (5) cap imports not yet finished per Organization on the upload route.
The remove-all route now documents `server.unavailable` (503 with `Retry-After`) for a transient
failure; it never answers 200 while data remains.

### Search over won Deals (0.12.0)

`SEARCH_ROUTES.searchMoments` is `POST /playbook/search/moments` (Owner and Admin only, like all sales history; the phase-2 Copilot will call it service-to-service; no
Idempotency-Key, existing error codes only: `request.invalid`, `server.timeout`,
`server.unavailable` with `Retry-After`). `searchMomentsRequestSchema` takes 1 to
`MAX_SEARCH_TURNS` (6) `{ role: 'rep' | 'prospect', text }` turns, at most
`MAX_SEARCH_TEXT_CHARACTERS` (2000) code points in all, and a `limit` of 1 to `MAX_SEARCH_LIMIT`
(20), default `DEFAULT_SEARCH_LIMIT` (5); unknown keys are rejected. `searchMomentsResponseSchema`
is `{ items: momentMatchSchema[], evidence: { moments, deals } }` with snippets of at most
`MAX_MOMENT_SNIPPET_CHARACTERS` (512) and evidence bounded by `MAX_SEARCH_CANDIDATES` (100); there
is no cursor and no customer `dealId`, name or amount. A turn has at least one non-whitespace
character, so a caller drops empty turns before it asks. `momentQueryText(turns)` is the one text
builder (`Rep: ...` or `Prospect: ...` per line, each text trimmed, joined by `\n`) that **both the
indexer and the search must call**, so what is stored and what is asked stay identical. Snippets
are cleaned like speaker excerpts (no control or bidi characters, whitespace collapsed): build them
with `momentSnippet(text)` (built on the exported `excerptText(text, max)`, which
`speakerExcerpt` also uses). The indexer must pass turns that are already cut, or re-trim after a cut:
a turn cut at a cap can end on a space, which `momentQueryText` trims. `evidence` counts only the over-fetched candidate window
(`min(100, limit x 5)` after eligibility), not every won Deal in the Organization. All of it is
tenant conversation text: never log it. The merged map `ALL_PLAYBOOK_ROUTES` includes the route.

### Search over Playbook documents (0.13.0)

`SEARCH_ROUTES.searchDocuments` is `POST /playbook/search/documents` (all four reading roles: Owner,
Admin, Manager and Rep, because the text is the Organization's own sales material; no
Idempotency-Key; the same error codes as the Moments search). `searchDocumentsRequestSchema` is the
Moments request (same turns, limit and bounds). `searchDocumentsResponseSchema` is
`{ items: documentMatchSchema[], evidence: { chunks, documents } }`: one item per chunk, with
`documentId`, `fileName` (the Organization's own file name), `page` (the 1-based page of a
paginated format such as PDF, up to `MAX_DOCUMENT_PAGES`; `null` for TXT, MD, DOCX and anything the
parser reads as one page; the service decides by media type), `score` and a `snippet` made with `momentSnippet` (at most 512 code points). The evidence
counts only the over-fetched candidate window after the staleness check, not every document, and
follows the Moments rules (documents and items within chunks, documents cover the items). There is
no cursor. The query is embedded with `documentQueryText(turns)` (each turn trimmed, joined by `\n`,
no `Rep:`/`Prospect:` labels, because chunks are embedded as plain text), not `momentQueryText`. The
playbook, when it must also shorten the stored snippet (for example to fit an attribute limit),
cuts by code point after `momentSnippet`, so it never leaves a lone surrogate. The request and the snippets are tenant text: never log them.

### Sign in with Google (0.14.0)

`src/auth/oidc.ts`: `googleStartRequestSchema` (`intent` from `googleIntentSchema`, `sign_in` or
`sign_up`, and an optional `returnTo`), `googleStartResponseSchema` (`{ authorizationUrl }`: https,
or http only to a loopback host, no credentials, no surrounding whitespace; a consumer must also
check the host against an allow-list), `googleCompleteRequestSchema` (`attemptId` and exactly one of
`organizationName` or `invitationToken`) and `googleCompleteResponseSchema`, shaped like the auth
service's browser flow response (`{ id, kind, expiresAt, step: { status: 'complete' }, session }`,
with `browserSessionTokensSchema`: the refresh token is in the cookie, never the body).
`returnToSchema` accepts only a same-origin path: it starts with `/` but never `//` or `/\`, has no
backslash, control character, lone surrogate, whitespace, invisible character or `.`/`..` segment,
is at most `MAX_RETURN_TO_LENGTH` (512) UTF-16 code units, and is checked again after
percent-decoding once. The value has already been decoded once by the query or JSON parser: a
consumer must not decode it again.

The callback answers every outcome but `oidc.disabled` (404) with a 302, so its other codes come
back as the `error` query parameter of the redirect (`GOOGLE_ERROR_PATH` `/sign-in`,
`GOOGLE_ERROR_PARAM` `error`, checked by `googleErrorQuerySchema`), listed in
`GOOGLE_ROUTES.callback.redirectErrors`; a new Google user goes to `GOOGLE_SIGN_UP_PATH`
(`/sign-up/google`) with `GOOGLE_SIGN_UP_ATTEMPT_PARAM` (`attempt`; `googleSignUpQuerySchema`). The
attempt cookie's base name is `OIDC_COOKIE_BASE_NAME` (`tula_oidc`); auth adds
`OIDC_COOKIE_SECURE_PREFIX` (`__Secure-`) outside `local` only, because Safari refuses a
`__Secure-` cookie over http even on loopback. The auth service owns the new route
`GET /v1/client/auth-options` (`AUTH_OPTIONS_ROUTE`); `authOptionsResponseSchema` carries
`providers.google` and parses `{}` as Google off. `GOOGLE_ROUTES` (`start`, `callback`, `complete`)
describes the three routes for OpenAPI. The new codes are in `AUTH_ERRORS`: `oidc.disabled` 404,
`oidc.state_invalid` 400, `oidc.email_unverified` 403, `oidc.access_denied` 400 (the person
cancelled at Google; any other `error=` from Google is `oidc.provider_unavailable`),
`oidc.provider_unavailable` 503 (with `Retry-After` where it is a real response) and
`oidc.invitation_mismatch` 403.

### Team members and invite codes (0.15.0, hub issue 46)

- `GET /v1/teams/{teamId}/members`: `teamParamsSchema`, `listTeamMembersQuerySchema` (cursor and
  limit up to `MAX_PAGE_SIZE`), `listTeamMembersResponseSchema` (items are the same `memberSchema`
  as the Members list). Same roles as viewing a Team. Errors: `LIST_TEAM_MEMBERS_ERROR_CODES`.
- `POST /v1/invitations` errors are `CREATE_INVITATION_ERROR_CODES`. New: `invitation.already_member`
  (409, the address already belongs to a member of this Organization; `membership.already_member`
  stays about the caller), `invitation.pending_limit` (409, 1,000 pending) and
  `invitation.daily_limit` (429, 2,000 in 24 hours, `details.retryAfter` and a `Retry-After`
  header). `rate.limited` is only the per-request rate. `teamId` was already accepted.
- `browserSessionTokensSchema` takes an optional `userId` (the signed-in user), so the portal can
  hide changes to its own role. Auth must send it on the browser session of sign-in, refresh and
  Google completion; a payload without it still parses.

### Rights confirmation wording (0.9.0)

The text of each wording version is in the contract: `RIGHTS_WORDINGS` (frozen, keyed by version,
plain text, bounded, shown exactly as written and never interpolated), `CURRENT_RIGHTS_WORDING_VERSION`
(the highest key; a service reads it instead of a setting) and `rightsWordingFor(version)` (undefined
for a version without text, which cannot be confirmed). Version 1 is the portal's draft, **pending a
lawyer's check**; a wording change is a new version and so a contract release. The rights read
response (`rightsStatusSchema`) has an optional `currentWording` with the text of the current version;
a consumer that does not get it reads `RIGHTS_WORDINGS[currentWordingVersion]`.
