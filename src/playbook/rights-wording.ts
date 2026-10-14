import { z } from 'zod'
import { hasStrippableCharacter, isWellFormedText } from './values'

/** The longest heading of a wording, in Unicode code points. */
export const MAX_RIGHTS_HEADING_LENGTH = 200

/** The most paragraphs a wording may have. */
export const MAX_RIGHTS_PARAGRAPHS = 10

/** The longest paragraph or confirmation sentence of a wording, in Unicode code points. */
export const MAX_RIGHTS_TEXT_LENGTH = 2000

const textSchema = (max: number) =>
  z
    .string()
    .min(1)
    .max(max)
    .refine(isWellFormedText, 'Well-formed text only')
    .refine((text) => !hasStrippableCharacter(text), 'No control or direction characters')
    .refine((text) => text.trim() === text, 'No surrounding spaces')

/**
 * The text of one version of the rights confirmation: a `heading`, up to ten `paragraphs` and the
 * `checkbox` sentence the member agrees to. It is plain text (no markup) and is shown exactly as
 * written, never interpolated with a name or a value. `draft` is true while a lawyer has not
 * checked the text; the screen says so.
 */
export const rightsWordingSchema = z.strictObject({
  heading: textSchema(MAX_RIGHTS_HEADING_LENGTH),
  paragraphs: z.array(textSchema(MAX_RIGHTS_TEXT_LENGTH)).min(1).max(MAX_RIGHTS_PARAGRAPHS),
  checkbox: textSchema(MAX_RIGHTS_TEXT_LENGTH),
  draft: z.literal(true).optional(),
})

/** The text of one version of the rights confirmation. */
export type RightsWording = z.infer<typeof rightsWordingSchema>

function freeze(wording: {
  heading: string
  paragraphs: readonly string[]
  checkbox: string
  draft?: true
}): RightsWording {
  return Object.freeze({
    ...wording,
    paragraphs: Object.freeze([...wording.paragraphs]),
  }) as RightsWording
}

/**
 * The text of every version of the rights confirmation (ADR 0018, choice 12), keyed by version,
 * frozen. A version is published once and never edited: a change to the text is a new version here
 * and therefore a contract release, and the current version below follows from it.
 *
 * PENDING A LAWYER'S CHECK: version 1 is a draft (the owner decision of 2026-10-14 put the wording
 * in the contract; ADR 0018 requires a lawyer to check it before real customers use it). Remove
 * `draft` only in a new version, once it has been checked. It is taken verbatim from the portal's
 * draft.
 */
export const RIGHTS_WORDINGS: Readonly<Record<number, RightsWording>> = Object.freeze({
  1: freeze({
    draft: true,
    heading: 'Confirm your right to share Calls',
    paragraphs: [
      'Before you upload Transcripts or Recordings of past Calls, Closeline records that your Organization has the right to share them.',
      'The Calls you upload hold the words, and in a Recording the voices, of your Reps and of your Prospects. Closeline stores them for your Organization and uses them to find similar Moments from won Deals. It does not share them with other Organizations.',
    ],
    checkbox:
      'I confirm that I am authorised to act for my Organization, that my Organization has the right to share the Transcripts and Recordings it uploads to Closeline, and that any notice to the people on those Calls and any consent the law requires have been given or obtained. I understand that this confirmation is recorded with my name and the time.',
  }),
})

/** The current version of the rights wording: the highest key of {@link RIGHTS_WORDINGS}. A service reads it instead of a setting. */
export const CURRENT_RIGHTS_WORDING_VERSION: number = Math.max(
  ...Object.keys(RIGHTS_WORDINGS).map(Number)
)

/** The text of a version, or undefined when the contract has none; a version without text cannot be confirmed. */
export function rightsWordingFor(version: number): RightsWording | undefined {
  return Object.hasOwn(RIGHTS_WORDINGS, version) ? RIGHTS_WORDINGS[version] : undefined
}
