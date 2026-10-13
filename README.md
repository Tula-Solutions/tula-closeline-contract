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

## Core's API surface (0.4.0)

Schemas and inferred types only; routes and handlers live in `tula-closeline-core`. Every object
schema is strict: an unknown key is rejected, so a response schema cannot carry a field it does not
name (an Invitation response has no token).

| Group | Exports |
| --- | --- |
| Ids | `invitationIdSchema` (`inv_…`), beside the existing `organizationIdSchema`, `userIdSchema`, `membershipIdSchema`, `teamIdSchema` |
| Shared values | `INVITABLE_ROLES`, `invitableRoleSchema` (never `owner`); `ORGANIZATION_STATUSES`, `organizationStatusSchema`; `INVITATION_STATES`, `invitationStateSchema`; `emailSchema`, `foldAscii` (ASCII-only folding; printable ASCII only, so an internationalised domain must already be in its A-label form: the service converts, the schema does not); `organizationNameSchema`, `teamNameSchema` (1 to 200 characters once trimmed); `invitationTokenSchema`; `timestampSchema`; `IDEMPOTENCY_KEY_HEADER`, `idempotencyKeySchema` |
| Organization | `organizationSchema`, `renameOrganizationRequestSchema` |
| Members | `memberSchema`, `listMembersQuerySchema`, `listMembersResponseSchema`, `memberParamsSchema`, `changeMemberRoleRequestSchema` |
| Invitations | `invitationSchema`, `createInvitationRequestSchema`, `listInvitationsQuerySchema`, `listInvitationsResponseSchema`, `invitationParamsSchema` |
| Teams | `teamSchema`, `createTeamRequestSchema`, `renameTeamRequestSchema`, `listTeamsQuerySchema`, `listTeamsResponseSchema`, `teamParamsSchema`, `addTeamMemberRequestSchema`, `teamMemberSchema`, `teamMemberParamsSchema` |
| Internal (auth to core) | `internalCreateOrganizationRequestSchema` / `…ResponseSchema`, `internalAcceptInvitationRequestSchema` / `…ResponseSchema`, `internalMembershipRequestSchema` / `…ResponseSchema` (`found: true` with Organization id, role and status, or `found: false`) |
| Errors | `CORE_ERRORS` (`organization.*`, `member.*`, `membership.already_member`, `invitation.*`, `team.*`, `role.not_permitted`) and `SIGNUP_ERRORS` (`auth.no_organization`, `signup.*`, `membership.unavailable`) |

Lists use the existing cursor pagination (`pageQuerySchema`, at most 100 per page). Internal calls
never name a Region (a deployment serves one) and carry an `Idempotency-Key` header. Fold emails
and Team names with `foldAscii`, never `toLowerCase()`.
