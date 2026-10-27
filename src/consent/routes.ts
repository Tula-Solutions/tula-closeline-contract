import type { CommonErrorCode } from '../errors'
import { IDEMPOTENT_ERRORS, type InboundRoute } from '../inbound-route'
import type { ProspectErrorCode } from '../prospect/errors'
import type { Role } from '../tenancy'
import type { ConsentErrorCode } from './errors'

/** The roles that may read and record consent for the Prospects they can see. */
export const CONSENT_ALL_ROLES = [
  'owner',
  'admin',
  'manager',
  'rep',
] as const satisfies readonly Role[]

/** The roles that manage wordings, forms, the Suppression list, evidence and the check log. */
export const CONSENT_ADMIN_ROLES = ['owner', 'admin'] as const satisfies readonly Role[]

/** The consent routes, by name. */
export type ConsentRouteName =
  | 'getProspectConsent'
  | 'listProspectConsentEvents'
  | 'recordConsent'
  | 'withdrawConsent'
  | 'getProspectConsentEvidence'
  | 'listConsentWordings'
  | 'getConsentWording'
  | 'createConsentWording'
  | 'updateConsentWording'
  | 'createConsentWordingVersion'
  | 'listConsentForms'
  | 'getConsentForm'
  | 'createConsentForm'
  | 'publishConsentForm'
  | 'closeConsentForm'
  | 'addSuppression'
  | 'listSuppressionEntries'
  | 'lookupSuppression'
  | 'getSuppressionEntry'
  | 'removeSuppression'
  | 'uploadSuppressionImport'
  | 'listSuppressionImports'
  | 'getSuppressionImport'
  | 'listSuppressionImportRows'
  | 'listContactChecks'
  | 'getHostedConsentForm'
  | 'submitHostedConsentForm'
  | 'previewUnsubscribe'
  | 'oneClickUnsubscribe'
  | 'contactCheck'
  | 'recordWithdrawal'
  | 'recordDeliveryFailure'

/** Who calls a route: a signed-in member, anyone holding a signed link, or another service. */
export type ConsentRouteAccess = 'user' | 'public' | 'internal'

/** What the service needs to describe one route: method, path, who may call it, what it answers. */
export type ConsentRoute = Omit<
  InboundRoute<ConsentErrorCode | ProspectErrorCode | CommonErrorCode>,
  'public' | 'internal' | 'serviceToken' | 'etag' | 'keyRequired'
> & {
  /** `public` routes take a signed token in the path; `internal` ones the shared secret (ADR 0013). */
  readonly access: ConsentRouteAccess
}

const route = (definition: ConsentRoute): ConsentRoute => Object.freeze(definition)

/**
 * The consent routes (spec M3). Every user route may also return the common `auth.*`, `rate.limited`
 * and `server.*` codes. Every list is cursor-paginated with at most 100 items per page. A record
 * of another Organization is always not found. A Contact Check denial is a result in a 200 body,
 * never an error of a route. No route or body can switch off Contact Consent or the AI and
 * recording disclosure (ADR 0003).
 */
export const CONSENT_ROUTES: Readonly<Record<ConsentRouteName, ConsentRoute>> = Object.freeze({
  getProspectConsent: route({
    method: 'GET',
    path: '/v1/prospects/{prospectId}/consent',
    access: 'user',
    roles: CONSENT_ALL_ROLES,
    publicApi: { scope: 'consent:read' },
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      "Reads a Prospect's Contact Consent on each channel, derived from the ledger, and whether the Prospect is suppressed. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization.",
  }),
  listProspectConsentEvents: route({
    method: 'GET',
    path: '/v1/prospects/{prospectId}/consent-events',
    access: 'user',
    roles: CONSENT_ALL_ROLES,
    publicApi: { scope: 'consent:read' },
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      "Lists a Prospect's consent ledger events, newest first, one cursor-paginated page at a time (at most 100); optionally one channel. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization.",
  }),
  recordConsent: route({
    method: 'POST',
    path: '/v1/prospects/{prospectId}/consents',
    access: 'user',
    roles: CONSENT_ALL_ROLES,
    publicApi: { scope: 'consent:write' },
    success: [201, 200],
    idempotent: true,
    errors: ['prospect.not_found', 'consent.not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Records a granted Contact Consent on one channel with the Consent Wording shown, the source and an evidence reference; without them it is refused (request.invalid). The source is never hosted_form. A verbal_call grant names the Call. Appends to the ledger and publishes consent.granted; answers 201, or 200 for a replay of the same Idempotency-Key. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization.',
  }),
  withdrawConsent: route({
    method: 'POST',
    path: '/v1/prospects/{prospectId}/consent-withdrawals',
    access: 'user',
    roles: CONSENT_ALL_ROLES,
    publicApi: { scope: 'consent:write' },
    success: [201, 200],
    idempotent: true,
    errors: ['prospect.not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Records a withdrawal of Contact Consent on the named channels, or on every channel with all: true. Appends to the ledger and publishes consent.withdrawn once per channel; the source is manual. A withdrawal never needs a reason and is always allowed. Prospect visibility follows the token: Owner and Admin see every Prospect, a Manager those owned by Reps on their Team, a Rep those they own; anything else is prospect.not_found (404), as is a Prospect of another Organization.',
  }),
  getProspectConsentEvidence: route({
    method: 'GET',
    path: '/v1/prospects/{prospectId}/consent-evidence',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['prospect.not_found'],
    commonErrors: ['request.invalid'],
    description:
      "Exports a Prospect's consent evidence as JSON, newest first, one cursor-paginated page at a time (at most 100): each ledger event with the wording text shown and, for a hosted form, the IP address and user agent. Owner and Admin only. Send Accept: text/csv for the same events as CSV, with the columns in EVIDENCE_CSV_COLUMNS.",
  }),
  listConsentWordings: route({
    method: 'GET',
    path: '/v1/consent-wordings',
    access: 'user',
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      "Lists the Organization's Consent Wordings, newest first, one cursor-paginated page at a time (at most 100).",
  }),
  getConsentWording: route({
    method: 'GET',
    path: '/v1/consent-wordings/{wordingId}',
    access: 'user',
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['consent.not_found'],
    commonErrors: ['request.invalid'],
    description: 'Reads one Consent Wording with its version and whether it is locked.',
  }),
  createConsentWording: route({
    method: 'POST',
    path: '/v1/consent-wordings',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      "Writes a new Consent Wording (version 1) for the channels it covers. The text is the Organization's own, reviewed by its own counsel; Closeline ships none. Owner and Admin only. Answers 201, or 200 for a replay of the same Idempotency-Key.",
  }),
  updateConsentWording: route({
    method: 'PATCH',
    path: '/v1/consent-wordings/{wordingId}',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['consent.not_found', 'consent.wording_locked'],
    commonErrors: ['request.invalid'],
    description:
      'Edits a Consent Wording that nothing references yet. Once a consent event or a published form uses it, it is consent.wording_locked (409) and the change is a new version. Owner and Admin only.',
  }),
  createConsentWordingVersion: route({
    method: 'POST',
    path: '/v1/consent-wordings/{wordingId}/versions',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ['consent.not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Writes the next version of a Consent Wording; the old version stays as it was and keeps its evidence. Owner and Admin only. Answers 201, or 200 for a replay of the same Idempotency-Key.',
  }),
  listConsentForms: route({
    method: 'GET',
    path: '/v1/consent-forms',
    access: 'user',
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      "Lists the Organization's hosted consent forms, newest first, one cursor-paginated page at a time (at most 100); optionally one state.",
  }),
  getConsentForm: route({
    method: 'GET',
    path: '/v1/consent-forms/{formId}',
    access: 'user',
    roles: CONSENT_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['consent.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Reads one hosted consent form. The public link token is shown to Owner and Admin only.',
  }),
  createConsentForm: route({
    method: 'POST',
    path: '/v1/consent-forms',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: ['consent.not_found'],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Creates a draft hosted consent form from a Consent Wording and the channels to offer, each its own unticked choice. A wording that does not exist is consent.not_found. Owner and Admin only. Answers 201, or 200 for a replay of the same Idempotency-Key.',
  }),
  publishConsentForm: route({
    method: 'POST',
    path: '/v1/consent-forms/{formId}/publication',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['consent.not_found', 'request.conflict'],
    commonErrors: ['request.invalid'],
    description:
      'Publishes a draft form: it gets its public link token and its wording becomes locked. Publishing a form that is not a draft is request.conflict. Owner and Admin only.',
  }),
  closeConsentForm: route({
    method: 'POST',
    path: '/v1/consent-forms/{formId}/closure',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['consent.not_found', 'request.conflict'],
    commonErrors: ['request.invalid'],
    description:
      'Closes a published form: its link answers consent.invalid_token afterwards, and the consent already recorded stays. Closing a form that is not published is request.conflict. Owner and Admin only.',
  }),
  addSuppression: route({
    method: 'POST',
    path: '/v1/suppression-entries',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [201, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Adds one email, phone or LinkedIn address to the Suppression list with the reason manual. Adding an address already suppressed answers 200 with the existing entry. The address is never returned. Owner and Admin only. Publishes suppression.added.',
  }),
  listSuppressionEntries: route({
    method: 'GET',
    path: '/v1/suppression-entries',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      'Lists Suppression entries, newest first, one cursor-paginated page at a time (at most 100); filters: reason, addressKind, state (active by default). Entries show a masked address, never the address or its hash. Owner and Admin only.',
  }),
  lookupSuppression: route({
    method: 'POST',
    path: '/v1/suppression-entries/lookups',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      'Looks up one exact email, phone or LinkedIn address on the Suppression list, in the body so it never reaches an access log. Answers the active entries for it (a masked address, never the address or its hash), none if it is not suppressed. Owner and Admin only.',
  }),
  getSuppressionEntry: route({
    method: 'GET',
    path: '/v1/suppression-entries/{entryId}',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['consent.not_found'],
    commonErrors: ['request.invalid'],
    description: 'Reads one Suppression entry with a masked address. Owner and Admin only.',
  }),
  removeSuppression: route({
    method: 'POST',
    path: '/v1/suppression-entries/{entryId}/removal',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['consent.not_found', 'consent.entry_not_removable'],
    commonErrors: ['request.invalid'],
    description:
      'Removes a manual Suppression entry, with a recorded reason. Any other reason is consent.entry_not_removable (409): an unsubscribe, STOP, bounce, complaint, CRM or erased entry is lifted only by a new granted consent with new evidence. Owner and Admin only. Publishes suppression.removed.',
  }),
  uploadSuppressionImport: route({
    method: 'POST',
    path: '/v1/suppression-imports',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [202, 200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Uploads a CSV of up to 50,000 addresses (one column, address; at most 10 MB) as multipart form data in the part named file. It is queued and answers 202 with the import; a replay of the same Idempotency-Key answers 200. Every address is added with the reason manual. A file that cannot be read is request.invalid; a larger one is request.too_large. Owner and Admin only.',
  }),
  listSuppressionImports: route({
    method: 'GET',
    path: '/v1/suppression-imports',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      'Lists Suppression imports, newest first, one cursor-paginated page at a time (at most 100). Owner and Admin only.',
  }),
  getSuppressionImport: route({
    method: 'GET',
    path: '/v1/suppression-imports/{importId}',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['consent.not_found'],
    commonErrors: ['request.invalid'],
    description: 'Reads one Suppression import with its state and counts. Owner and Admin only.',
  }),
  listSuppressionImportRows: route({
    method: 'GET',
    path: '/v1/suppression-imports/{importId}/rows',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['consent.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Lists the per-row report of a Suppression import in file order, one cursor-paginated page at a time (at most 100); optionally one result. No cell of the file is returned. Owner and Admin only.',
  }),
  listContactChecks: route({
    method: 'GET',
    path: '/v1/contact-checks',
    access: 'user',
    roles: CONSENT_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      'Lists logged Contact Checks, newest first, one cursor-paginated page at a time (at most 100); filters: channel, purpose, allowed, prospectId and code. Owner and Admin only.',
  }),
  getHostedConsentForm: route({
    method: 'GET',
    path: '/v1/public/consent-forms/{token}',
    access: 'public',
    roles: [],
    success: [200],
    idempotent: false,
    errors: ['consent.invalid_token'],
    commonErrors: ['rate.limited'],
    description:
      "Reads what the hosted consent page shows: the Organization's name, the exact Consent Wording and the channels offered. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address.",
  }),
  submitHostedConsentForm: route({
    method: 'POST',
    path: '/v1/public/consent-forms/{token}/submissions',
    access: 'public',
    roles: [],
    success: [201, 200],
    idempotent: true,
    errors: ['consent.invalid_token'],
    commonErrors: [...IDEMPOTENT_ERRORS, 'rate.limited'],
    description:
      'Submits a hosted consent form: an explicit choice per channel and the address each needs. Core finds or creates the Prospect, reads the IP address and user agent from the request as evidence, appends the ledger and publishes consent.granted. Answers 201, or 200 for a replay of the same Idempotency-Key. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address.',
  }),
  previewUnsubscribe: route({
    method: 'GET',
    path: '/v1/public/unsubscribe/{token}',
    access: 'public',
    roles: [],
    success: [200],
    idempotent: false,
    errors: ['consent.invalid_token'],
    commonErrors: ['rate.limited'],
    description:
      "Reads what the unsubscribe page shows: the Organization's name and the channel. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address.",
  }),
  oneClickUnsubscribe: route({
    method: 'POST',
    path: '/v1/public/unsubscribe/{token}',
    access: 'public',
    roles: [],
    success: [200],
    idempotent: false,
    errors: ['consent.invalid_token'],
    commonErrors: ['rate.limited'],
    description:
      'Unsubscribes the address behind the link (RFC 8058 List-Unsubscribe-Post): it adds a Suppression entry with the reason unsubscribe, withdraws the email consent and publishes the events. Replaying a link answers the same. Public: no token or role; the signed token in the path is the only credential, and it is rate limited. An unknown, tampered, expired or closed link is consent.invalid_token. It never echoes an address.',
  }),
  contactCheck: route({
    method: 'POST',
    path: '/internal/v1/contact-checks',
    access: 'internal',
    roles: [],
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: ['request.invalid'],
    description:
      'Answers whether a contact may be made, from the ledger and the Suppression list. Answers 200 with a result: an allowance, or a denial with a consent.* code in the body; a denial is never an HTTP error. Every answered check is logged. Internal: called by another service with the shared secret (ADR 0013), no user token; the Organization is named in the body.',
  }),
  recordWithdrawal: route({
    method: 'POST',
    path: '/internal/v1/consent-withdrawals',
    access: 'internal',
    roles: [],
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Records a STOP the channel received: a withdrawal on the channel (or every channel), a Suppression entry with the reason stop, and the events. Idempotent on the message reference. Internal: called by another service with the shared secret (ADR 0013), no user token; the Organization is named in the body.',
  }),
  recordDeliveryFailure: route({
    method: 'POST',
    path: '/internal/v1/delivery-failures',
    access: 'internal',
    roles: [],
    success: [200],
    idempotent: true,
    errors: [],
    commonErrors: [...IDEMPOTENT_ERRORS],
    description:
      'Records a bounce or complaint on an email address: a Suppression entry with that reason and the event. Idempotent on the message reference. Internal: called by another service with the shared secret (ADR 0013), no user token; the Organization is named in the body.',
  }),
})
