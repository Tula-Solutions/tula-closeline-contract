import { z } from 'zod'
import { callIdSchema, dealImportIdSchema } from '../ids'
import { dealIdSchema } from './deal-values'
import { MAX_DELETION_SEQ } from './messages'

/*
 * Queue messages of sales-history ingestion, in the same form as `DOCUMENT_UPLOADED_MESSAGE`:
 * `{ type, version, scope, payload }`, the pieces of the kit's `defineMessage`. The Organization id
 * is in the envelope. A payload holds ids and sequences only: never a Transcript, audio, a file
 * name, a speaker label or a cell. Each job reads the current state from the database, is
 * idempotent, and does nothing when its sequence is older than the stored one.
 */

/** The largest Outcome or Rep sequence: the db column is a Postgres `integer`, like {@link MAX_DELETION_SEQ}. */
export const MAX_SEQ = MAX_DELETION_SEQ

const seqSchema = z.number().int().min(1).max(MAX_SEQ)

/** The payload of {@link CALL_UPLOADED_MESSAGE}. */
export const callUploadedPayloadSchema = z.strictObject({ callId: callIdSchema })

/** The payload of {@link CALL_UPLOADED_MESSAGE}. */
export type CallUploadedPayload = z.infer<typeof callUploadedPayloadSchema>

/** Starts ingestion of a Call: transcription of a Recording, or parsing of a Transcript. Published after the upload is stored and again on restore (the kept Transcript is reused, never transcribed twice). */
export const CALL_UPLOADED_MESSAGE = {
  type: 'playbook.call_uploaded',
  version: 1,
  scope: 'organization',
  payload: callUploadedPayloadSchema,
} as const

/** The payload of {@link CALL_TRANSCRIBED_MESSAGE}. */
export const callTranscribedPayloadSchema = z.strictObject({ callId: callIdSchema })

/** The payload of {@link CALL_TRANSCRIBED_MESSAGE}. */
export type CallTranscribedPayload = z.infer<typeof callTranscribedPayloadSchema>

/** Moves a Recording from transcription to building Moments, published when the Transcript is stored and the Rep is known (a per-side Recording, or one whose Rep was picked). A Call with no Rep waits in `awaiting_rep` and publishes `playbook.call_rep_changed` when it is picked. */
export const CALL_TRANSCRIBED_MESSAGE = {
  type: 'playbook.call_transcribed',
  version: 1,
  scope: 'organization',
  payload: callTranscribedPayloadSchema,
} as const

/** The payload of {@link CALL_REP_CHANGED_MESSAGE}: the Call and its `repSeq`. */
export const callRepChangedPayloadSchema = z.strictObject({
  callId: callIdSchema,
  repSeq: seqSchema,
})

/** The payload of {@link CALL_REP_CHANGED_MESSAGE}. */
export type CallRepChangedPayload = z.infer<typeof callRepChangedPayloadSchema>

/** Rebuilds a Call's Moments after its Rep is picked or changed. The service bumps `repSeq` in the same write as the change; the job applies only when the Call's stored sequence equals this one, and the Call is out of search until it finishes. */
export const CALL_REP_CHANGED_MESSAGE = {
  type: 'playbook.call_rep_changed',
  version: 1,
  scope: 'organization',
  payload: callRepChangedPayloadSchema,
} as const

/** The payload of {@link CALL_DELETED_MESSAGE}: the Call and its `deletionSeq`. */
export const callDeletedPayloadSchema = z.strictObject({
  callId: callIdSchema,
  deletionSeq: seqSchema,
})

/** The payload of {@link CALL_DELETED_MESSAGE}. */
export type CallDeletedPayload = z.infer<typeof callDeletedPayloadSchema>

/** Queues the removal of a deleted Call's Moments and vectors, as `playbook.document_deleted` does for a document: it applies only if the Call is still deleted and its stored `deletionSeq` equals this one. Only a delete that changes the state bumps it or publishes. Search hides a deleted Call by its state, never by this job. */
export const CALL_DELETED_MESSAGE = {
  type: 'playbook.call_deleted',
  version: 1,
  scope: 'organization',
  payload: callDeletedPayloadSchema,
} as const

/** The payload of {@link DEAL_OUTCOME_CHANGED_MESSAGE}: the Deal's own id and its `outcomeSeq`. */
export const dealOutcomeChangedPayloadSchema = z.strictObject({
  dealId: dealIdSchema,
  outcomeSeq: seqSchema,
})

/** The payload of {@link DEAL_OUTCOME_CHANGED_MESSAGE}. */
export type DealOutcomeChangedPayload = z.infer<typeof dealOutcomeChangedPayloadSchema>

/** Re-tags a Deal's Moments in the index after its Outcome changes. The job reads the current Outcome from the database and applies only when the Deal's stored `outcomeSeq` equals this one, so two changes cannot finish in the wrong order. */
export const DEAL_OUTCOME_CHANGED_MESSAGE = {
  type: 'playbook.deal_outcome_changed',
  version: 1,
  scope: 'organization',
  payload: dealOutcomeChangedPayloadSchema,
} as const

/** The payload of {@link DEAL_IMPORT_UPLOADED_MESSAGE}. */
export const dealImportUploadedPayloadSchema = z.strictObject({ importId: dealImportIdSchema })

/** The payload of {@link DEAL_IMPORT_UPLOADED_MESSAGE}. */
export type DealImportUploadedPayload = z.infer<typeof dealImportUploadedPayloadSchema>

/** Starts the processing of an uploaded CSV. The job is idempotent and resumable, keyed on the import. */
export const DEAL_IMPORT_UPLOADED_MESSAGE = {
  type: 'playbook.deal_import_uploaded',
  version: 1,
  scope: 'organization',
  payload: dealImportUploadedPayloadSchema,
} as const
