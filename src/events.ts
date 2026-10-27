import { z } from 'zod'
import { timestampSchema } from './core/values'
import { eventIdSchema, organizationIdSchema } from './ids'
import { regionSchema } from './tenancy'

const EVENT_TYPE_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){1,2}$/

/** An event type in `area.event_name` or `area.subject.event_name` form, such as `team.created` or `voice.call.started`. */
export const eventTypeSchema = z.string().max(100).regex(EVENT_TYPE_PATTERN)

/** An event type. */
export type EventType = z.infer<typeof eventTypeSchema>

const versionSchema = z.number().int().positive()

const envelopeShape = {
  id: eventIdSchema,
  type: eventTypeSchema,
  version: versionSchema,
  occurredAt: timestampSchema,
  organizationId: organizationIdSchema,
  region: regionSchema,
}

/** The envelope every event shares, wrapping a payload validated by `dataSchema`. */
export function eventEnvelopeSchema<D extends z.ZodType>(dataSchema: D) {
  return z.object({ ...envelopeShape, data: dataSchema })
}

/** Declares one event type at one version; its schema accepts only that type and version. */
export function defineEvent<const T extends string, const V extends number, D extends z.ZodType>(
  type: T,
  version: V,
  dataSchema: D
) {
  const schema = z.object({
    ...envelopeShape,
    type: z.literal(eventTypeSchema.parse(type) as T),
    version: z.literal(versionSchema.parse(version) as V),
    data: dataSchema,
  })
  return {
    type,
    version,
    schema,
    /** Parses an envelope of this type and version; throws a ZodError for anything else. */
    parse: (input: unknown) => schema.parse(input),
    /** Parses without throwing. Queue consumers use this, so a malformed message is a result to handle, not an exception to retry. */
    safeParse: (input: unknown) => schema.safeParse(input),
  }
}
