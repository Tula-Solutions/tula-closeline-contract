import { z } from 'zod'

/**
 * The states a Playbook document is in, in the order a document passes through them (ADR 0016).
 * `deleted` means soft-deleted and awaiting purge. The db library builds its column from this
 * same list, so the names are the contract between the two.
 */
export const DOCUMENT_STATES = ['uploaded', 'processing', 'ready', 'failed', 'deleted'] as const

/** The state of a Playbook document. */
export const documentStateSchema = z.enum(DOCUMENT_STATES)

/** The state of a Playbook document. */
export type DocumentState = z.infer<typeof documentStateSchema>

/**
 * Why a document ended in `failed`: a closed list the portal maps to its own wording. Never free
 * text, so a reason cannot carry the content or name of a file. This list is the lead's reading
 * of ADR 0016, which names only the page limit; the owner did not choose the rest.
 */
export const DOCUMENT_FAILURE_REASONS = [
  'too_many_pages',
  'unreadable',
  'password_protected',
  'no_text',
  'processing_failed',
] as const

/** Why a document ended in `failed`. */
export const documentFailureReasonSchema = z.enum(DOCUMENT_FAILURE_REASONS)

/** Why a document ended in `failed`. */
export type DocumentFailureReason = z.infer<typeof documentFailureReasonSchema>

/** Owner's choice (ADR 0016, choice 2): the file extensions phase 1 accepts, lower case with the dot. */
export const ACCEPTED_DOCUMENT_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.txt', '.md'] as const

/** An accepted file extension. */
export type AcceptedDocumentExtension = (typeof ACCEPTED_DOCUMENT_EXTENSIONS)[number]

/** Owner's choice (ADR 0016, choice 2): the media types phase 1 accepts, one for each accepted extension. */
export const ACCEPTED_DOCUMENT_MEDIA_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
] as const

/** The media type of a stored document, as the service detected it from the content. */
export const documentMediaTypeSchema = z.enum(ACCEPTED_DOCUMENT_MEDIA_TYPES)

/** The media type of a stored document. */
export type DocumentMediaType = z.infer<typeof documentMediaTypeSchema>

/** The media type each accepted extension stands for. */
export const MEDIA_TYPE_BY_EXTENSION: Readonly<
  Record<AcceptedDocumentExtension, DocumentMediaType>
> = Object.freeze({
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
})

/** Owner's choice (ADR 0016, choice 2): the largest file accepted, 25 MB counted as 25 * 1024 * 1024 bytes. */
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024

/** Owner's choice (ADR 0016, choice 2): the most pages a document may have; checked by the ingestion job, not at upload. */
export const MAX_DOCUMENT_PAGES = 300

/** The lead's default (ADR 0016), not the owner's: days a soft-deleted document is kept before it is purged. */
export const DOCUMENT_RETENTION_DAYS = 30

/** The lead's default (ADR 0016), not the owner's: documents an Organization may hold, soft-deleted ones included until purged. */
export const DEFAULT_MAX_DOCUMENTS = 500

/** The lead's default (ADR 0016), not the owner's: bytes an Organization may hold, 2 GB counted as 2 * 1024^3. */
export const DEFAULT_MAX_DOCUMENT_BYTES_TOTAL = 2 * 1024 * 1024 * 1024

/** The longest file name, in characters, once control and direction characters are stripped. */
export const MAX_DOCUMENT_FILE_NAME_LENGTH = 255

/** The most raw characters a file name may carry before stripping and trimming. */
const MAX_RAW_FILE_NAME_LENGTH = 1000

/** Whether a code unit is a control character (C0, DEL, C1) or a bidirectional mark, embedding, override or isolate. */
function isStripped(code: number): boolean {
  return (
    code <= 0x1f ||
    (code >= 0x7f && code <= 0x9f) ||
    code === 0x61c ||
    code === 0x200e ||
    code === 0x200f ||
    (code >= 0x202a && code <= 0x202e) ||
    (code >= 0x2066 && code <= 0x2069)
  )
}

function stripUnsafe(text: string): string {
  let out = ''
  for (let index = 0; index < text.length; index += 1) {
    if (!isStripped(text.charCodeAt(index))) {
      out += text[index]
    }
  }
  return out
}

function isWellFormed(text: string): boolean {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        return false
      }
      index += 1
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return false
    }
  }
  return true
}

/** The accepted extension a file name ends with, compared without case, or undefined. */
export function documentExtension(fileName: string): AcceptedDocumentExtension | undefined {
  const lower = fileName.toLowerCase()
  return ACCEPTED_DOCUMENT_EXTENSIONS.find((extension) => lower.endsWith(extension))
}

/** Zero-width characters that make a stem look empty without being empty. */
const INVISIBLE_STEM = /^[\s\u200b-\u200d\u2060\ufeff]*$/

/** Whether a name has a stem: some visible text before its last dot (or no dot at all). */
function hasStem(name: string): boolean {
  const dot = name.lastIndexOf('.')
  const stem = dot === -1 ? name : name.slice(0, dot)
  return !INVISIBLE_STEM.test(stem)
}

/**
 * A document's file name, in a request and in a response: at most 1000 raw UTF-16 code units,
 * then control and bidirectional characters are removed (not rejected) and the rest is trimmed to
 * 1 to 255 well-formed UTF-16 code units with no `/` or `\` and a visible stem before the last
 * dot (`.pdf`, or an invisible character plus `.pdf`, is rejected). It does not check the
 * extension: that is {@link documentTypeCheckSchema}, which has its own error code. Parsing a
 * stored name yields a safe one. The name is for display only and is never a storage key or a
 * path: the service keys storage on the document id. It is stricter than a person's name (which
 * keeps direction characters) because a file name is shown beside the person's own text in lists
 * and downloads, where a right-to-left override can disguise an extension, and a person's name has
 * no extension to disguise. Zero-width characters other than in the stem are allowed, so display
 * code must still treat a name as untrusted text. A name is never part of an error body.
 */
export const documentFileNameSchema = z
  .string()
  .max(MAX_RAW_FILE_NAME_LENGTH)
  .transform((name) => stripUnsafe(name).trim())
  .pipe(
    z
      .string()
      .min(1)
      .max(MAX_DOCUMENT_FILE_NAME_LENGTH)
      .refine(isWellFormed, 'Well-formed text only')
      .refine((name) => !/[/\\]/.test(name), 'No path separators')
      .refine(hasStem, 'A name before the extension')
  )

/** The name of an uploaded file. */
export type DocumentFileName = z.infer<typeof documentFileNameSchema>

/**
 * The type check of an upload, on the file name: it must end in an accepted extension. A failure
 * is `document.unsupported_type` (415). The service also inspects the content, because the name
 * and the declared type are untrusted.
 */
export const documentTypeCheckSchema = z
  .string()
  .refine((name) => documentExtension(name) !== undefined, 'An accepted file type only')

/**
 * The size check of an upload, on the byte count: at most {@link MAX_DOCUMENT_BYTES}. A failure
 * is `document.too_large` (413). Emptiness is not checked here: an empty file fails the upload
 * schema as `request.invalid`.
 */
export const documentSizeCheckSchema = z.number().max(MAX_DOCUMENT_BYTES)

/** Lower-cases a media type and drops its parameters, so `Text/Plain; charset=utf-8` becomes `text/plain`. */
export function normaliseMediaType(mediaType: string): string {
  return (mediaType.split(';')[0] ?? '').trim().toLowerCase()
}
