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

## Core's API surface (0.5.0)

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
| Shared values | `INVITABLE_ROLES`, `invitableRoleSchema` (never `owner`); `ORGANIZATION_STATUSES`, `organizationStatusSchema`; `INVITATION_STATES`, `invitationStateSchema`; `emailSchema`, `foldAscii` (ASCII-only folding; printable ASCII only, so an internationalised domain must already be in its A-label form: the service converts, the schema does not); `organizationNameSchema`, `teamNameSchema` (trimmed, then 1 to 200 characters), `storedNameSchema` (the response form); `invitationTokenSchema`; `timestampSchema`; `IDEMPOTENCY_KEY_HEADER`, `idempotencyKeySchema` |
| Organization | `organizationSchema`, `renameOrganizationRequestSchema` |
| Members | `memberSchema`, `listMembersQuerySchema`, `listMembersResponseSchema`, `memberParamsSchema`, `changeMemberRoleRequestSchema` |
| Invitations | `invitationSchema`, `createInvitationRequestSchema`, `listInvitationsQuerySchema` (a page plus `state`, default `pending`), `listInvitationsResponseSchema`, `invitationParamsSchema` |
| Teams | `teamSchema`, `createTeamRequestSchema`, `renameTeamRequestSchema`, `listTeamsQuerySchema`, `listTeamsResponseSchema`, `teamParamsSchema`, `addTeamMemberRequestSchema`, `teamMemberSchema`, `teamMemberParamsSchema` |
| Internal (auth to core) | `internalCreateOrganizationRequestSchema` / `…ResponseSchema`, `internalAcceptInvitationRequestSchema` / `…ResponseSchema`, `internalMembershipRequestSchema` / `…ResponseSchema` (`found: true` with Organization id, role and status, or `found: false`), `INTERNAL_CALL_ERRORS`, `InternalCallName` |
| Errors | `CORE_ERRORS` (`organization.*`, `member.*`, `membership.already_member`, `invitation.*`, `team.*`) and `SIGNUP_ERRORS` (`auth.no_organization`, `signup.*`, `membership.unavailable`); a role that is not allowed is the common `auth.forbidden`. `AUTH_ERRORS` (every code the auth service answers with: `auth.invalid_credentials`, `auth.user_banned`, `email.*`, `password.*`, `verification.*`, `flow.*`, `mail.unavailable`, `session.*`, plus `SIGNUP_ERRORS` and `organization.deleted` by reference) |

### Internal calls

Each call that has effects carries an `Idempotency-Key` header, none names a Region (a deployment
serves one) and none takes an Organization from the caller. The domain codes each may return are
exported as `INTERNAL_CALL_ERRORS` (a frozen map from call name to codes) for core's tests:

| Call | Domain codes it may return |
| --- | --- |
| create Organization | `membership.already_member` only. The request has no email: core does not store one. |
| accept Invitation | `invitation.invalid` or `membership.already_member` only, never an Organization status code. Core compares the request's `email`, folded, with the Invitation's and answers `invitation.invalid` on a mismatch. |
| membership lookup | none: a user with no membership is answered `found: false`. |

Common codes (`auth.*`, `request.*`, `server.*`) can come from any call.

Lists use the existing cursor pagination (`pageQuerySchema`, at most 100 per page); the Invitation
list also takes `state` (`pending`, `accepted` or `revoked`, default `pending`). Fold emails and
Team names with `foldAscii`, never `toLowerCase()`.
