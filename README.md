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

## Playbook API surface (0.7.0, ADR 0016)

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
  1 to 255 UTF-16 code units, hold no `/` or `\` and need a visible stem; they are display text, never a storage key.
- **Limits** are exported constants, each saying whether the owner chose it or it is a default.
- **Messages** `DOCUMENT_UPLOADED_MESSAGE` and `DOCUMENT_DELETED_MESSAGE` are `{ type, version, scope,
  payload }`, the pieces of the kit's `defineMessage`.
