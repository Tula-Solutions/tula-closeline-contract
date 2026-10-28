import { CITATION_ROUTES, type CitationRouteName } from './citation'
import { PLAYBOOK_ERRORS } from './errors'
import { LEARNING_ROUTES, type LearningRoute, type LearningRouteName } from './learning'
import { LIVE_CALL_ROUTES, type LiveCallRouteName } from './live-call'
import { PLAYBOOK_ROUTES, type PlaybookRoute, type PlaybookRouteName } from './routes'
import { SALES_HISTORY_ERRORS } from './sales-history-errors'
import {
  SALES_HISTORY_ROUTES,
  type SalesHistoryRoute,
  type SalesHistoryRouteName,
} from './sales-history-routes'
import { SEARCH_ROUTES, type SearchRouteName } from './search'
import {
  SUGGESTION_ERRORS,
  SUGGESTION_ROUTES,
  type SuggestionRoute,
  type SuggestionRouteName,
} from './suggestion'

/** Every Playbook route name: the document routes of 0.7.0, the sales-history routes, the search routes and the citation route. */
export type AllPlaybookRouteName =
  | PlaybookRouteName
  | SalesHistoryRouteName
  | SearchRouteName
  | CitationRouteName
  | SuggestionRouteName
  | LearningRouteName
  | LiveCallRouteName

/**
 * Every Playbook route in one map, for a service that builds one OpenAPI document. `PLAYBOOK_ROUTES`
 * and `PLAYBOOK_ERRORS` keep their 0.7.0 types, so code written against them still compiles; use
 * this map and `ALL_PLAYBOOK_ERRORS` when you want both areas.
 */
export const ALL_PLAYBOOK_ROUTES: Readonly<
  Record<AllPlaybookRouteName, PlaybookRoute | SalesHistoryRoute | SuggestionRoute | LearningRoute>
> = Object.freeze({
  ...PLAYBOOK_ROUTES,
  ...SALES_HISTORY_ROUTES,
  ...SEARCH_ROUTES,
  ...CITATION_ROUTES,
  ...SUGGESTION_ROUTES,
  ...LEARNING_ROUTES,
  ...LIVE_CALL_ROUTES,
})

/** Every Playbook error code in one registry: the document codes of 0.7.0, the sales-history codes and the Suggestion codes. */
export const ALL_PLAYBOOK_ERRORS = Object.freeze({
  ...PLAYBOOK_ERRORS,
  ...SALES_HISTORY_ERRORS,
  ...SUGGESTION_ERRORS,
})
