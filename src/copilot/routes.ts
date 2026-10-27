import type { InboundRoute } from '../inbound-route'
import type { SalesHistoryErrorCode } from '../playbook/sales-history-errors'
import { VOICE_ADMIN_ROLES, VOICE_ALL_ROLES } from '../voice/routes'
import type { CopilotErrorCode } from './errors'

/** The Copilot routes, by name. */
export type CopilotRouteName =
  | 'streamCopilot'
  | 'listCopilotCards'
  | 'markCopilotCard'
  | 'getCopilotSettings'
  | 'setCopilotSettings'

/** What the service needs to describe one route: method, path, who may call it, what it answers. */
export type CopilotRoute = Omit<
  InboundRoute<CopilotErrorCode | Extract<SalesHistoryErrorCode, 'call.not_found'>>,
  | 'public'
  | 'internal'
  | 'serviceToken'
  | 'etag'
  | 'publicApi'
  | 'keyRequired'
  | 'method'
  | 'idempotent'
> & {
  readonly method: 'GET' | 'PUT' | 'PATCH'
  /** Always false: no Copilot route takes the `Idempotency-Key` header, each is idempotent by end state. */
  readonly idempotent: false
  /** True for a Server-Sent Events route, answered as `text/event-stream` and not JSON. */
  readonly stream?: true
}

const route = (definition: CopilotRoute): CopilotRoute => Object.freeze(definition)

const CARD_VISIBILITY =
  "Visibility is decided from the token: a Rep sees the cards of the Calls they took, a Manager those of the Reps on their Team, Owner and Admin every Call; anything else is call.not_found (404), as is a Call of another Organization. Cards come only from the Organization's own Playbook."

const UNTRUSTED =
  'Quotes, passages and the composed text of a card, and the Transcript turns of the stream, are tenant text or model output and so untrusted data: bounded, shown as plain text, never as markup or instructions, never spoken into the Call, never logged.'

/**
 * The Copilot routes (spec M13). Every route may also return the common `auth.*`, `rate.limited`
 * and `server.*` codes. Every list is cursor-paginated with at most 100 items per page. A record of
 * another Organization is always not found. No route takes the `Idempotency-Key` header: marking a
 * card and setting the settings each name an end state, so a repeat is harmless by itself. No route
 * or body can start the Copilot before the Disclosure has played or change what the Disclosure
 * says; a Copilot Call always tells the Prospect it is recorded and that AI is assisting (ADR 0003).
 */
export const COPILOT_ROUTES: Readonly<Record<CopilotRouteName, CopilotRoute>> = Object.freeze({
  streamCopilot: route({
    method: 'GET',
    path: '/v1/calls/{callId}/copilot/stream',
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    stream: true,
    errors: ['call.not_found', 'copilot.disabled', 'copilot.not_started'],
    commonErrors: ['request.invalid'],
    description: `Streams the live Transcript and the Copilot Cards of a Call to the Rep's browser as Server-Sent Events (text/event-stream), with the same token as every other route. Messages are copilot.status, transcript.turn, transcript.unavailable, copilot.card and copilot.card_updated, each with an id. The stream opens once the Call is disclosing and says waiting_for_disclosure until the Disclosure has played; before that, while the Call is ringing or connecting, it is copilot.not_started (409). A Call with the Copilot off is copilot.disabled (409). The Last-Event-ID header resumes after that message, replaying from what is stored, so a reconnect misses nothing. If speech-to-text fails, transcript.unavailable is sent and the Call goes on. ${UNTRUSTED} ${CARD_VISIBILITY}`,
  }),
  listCopilotCards: route({
    method: 'GET',
    path: '/v1/calls/{callId}/copilot/cards',
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['call.not_found'],
    commonErrors: ['request.invalid'],
    description: `Lists the Copilot Cards shown on a Call, oldest first, one cursor-paginated page at a time (at most 100); optionally one kind. Each card carries its kind, the Evidence (similar Moments and distinct won Deals), the Moments it cites and its quotes, and the Rep's rating, dismissal and pin. A Call that never had the Copilot has no cards: an empty page, not an error. ${UNTRUSTED} ${CARD_VISIBILITY}`,
  }),
  markCopilotCard: route({
    method: 'PATCH',
    path: '/v1/calls/{callId}/copilot/cards/{cardId}',
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: ['call.not_found', 'card.not_found'],
    commonErrors: ['request.invalid'],
    description:
      'Marks a card: rates it useful or not useful (null clears the rating), dismisses it or pins it. The body names the end state wanted, so the route is idempotent by end state: a repeat of the same body answers 200 with the card unchanged and publishes no second voice.copilot.card_rated event. Dismissing a card clears its pin and pinning it clears its dismissal; asking for both is request.invalid. Only the Rep who took the Call may mark its cards; for any other caller, a Manager, Admin or Owner included, the Call is call.not_found (404), so their view of the cards stays read-only. A card that is not on the Call is card.not_found (404). Takes no Idempotency-Key header.',
  }),
  getCopilotSettings: route({
    method: 'GET',
    path: '/v1/copilot/settings',
    roles: VOICE_ALL_ROLES,
    success: [200],
    idempotent: false,
    errors: [],
    commonErrors: [],
    description:
      "Reads the Organization's Copilot settings: whether the Copilot is on and the minimum Evidence (similar Moments and distinct won Deals) a card needs. Every role may read them, because the Softphone needs to know whether to offer the Copilot before dialing; an Organization that never set them has the Copilot off with the defaults of 3 Moments and 2 Deals. There is no setting that changes the Disclosure.",
  }),
  setCopilotSettings: route({
    method: 'PUT',
    path: '/v1/copilot/settings',
    roles: VOICE_ADMIN_ROLES,
    success: [200],
    idempotent: false,
    errors: ['copilot.min_evidence_invalid'],
    commonErrors: ['request.invalid'],
    description:
      'Sets the Copilot settings: on or off for the Organization, and the minimum Evidence a card needs (1 to 20 Moments, and 1 to 20 distinct Deals that are no more than the Moments). The body replaces the settings, so it is idempotent by end state: the same body again answers 200 with the same settings. A minimum outside 1 to 20 or more Deals than Moments is copilot.min_evidence_invalid (422); a malformed body is request.invalid. Turning the Copilot off stops new Copilot Calls from being offered and leaves the cards already shown. Owner and Admin only.',
  }),
})
