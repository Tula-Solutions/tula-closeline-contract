import { describe, expect, test } from 'bun:test'
import { id, NOW } from '../core/fixtures'
import { ERRORS, errorCodeSchema } from '../errors'
import { eventTypeSchema } from '../events'
import { MAX_PAGE_SIZE } from '../pagination'
import {
  ACCEPTED_DOCUMENT_EXTENSIONS,
  ACCEPTED_DOCUMENT_MEDIA_TYPES,
  ALL_PLAYBOOK_ERRORS,
  ALL_PLAYBOOK_ROUTES,
  checkUploadFile,
  DEFAULT_MAX_DOCUMENT_BYTES_TOTAL,
  DEFAULT_MAX_DOCUMENTS,
  DOCUMENT_DELETED_MESSAGE,
  DOCUMENT_FAILURE_REASONS,
  DOCUMENT_RETENTION_DAYS,
  DOCUMENT_STATES,
  DOCUMENT_UPLOADED_MESSAGE,
  documentDeletedPayloadSchema,
  documentFileNameSchema,
  documentParamsSchema,
  documentSchema,
  documentSizeCheckSchema,
  documentTypeCheckSchema,
  documentUploadedPayloadSchema,
  internalRemoveOrganizationDocumentsParamsSchema,
  internalRemoveOrganizationDocumentsRequestSchema,
  internalRemoveOrganizationDocumentsResponseSchema,
  listDocumentsQuerySchema,
  listDocumentsResponseSchema,
  MAX_DELETION_SEQ,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_PAGES,
  MEDIA_TYPE_BY_EXTENSION,
  normaliseMediaType,
  PLAYBOOK_ERRORS,
  PLAYBOOK_ROUTES,
  type PlaybookRoute,
  SALES_HISTORY_ERRORS,
  SALES_HISTORY_ROUTES,
  SUGGESTION_ERRORS,
  SUGGESTION_ROUTES,
  uploadDocumentFileSchema,
} from './index'

const document = {
  id: id('doc'),
  fileName: 'pricing.pdf',
  mediaType: 'application/pdf',
  sizeBytes: 1234,
  pageCount: 12,
  state: 'ready',
  failureReason: null,
  deletedAt: null,
  purgeAt: null,
  uploadedByUserId: id('usr'),
  createdAt: NOW,
  updatedAt: NOW,
}

describe('limits and states', () => {
  test('the states are exactly the ones ADR 0016 proposes', () => {
    expect([...DOCUMENT_STATES]).toEqual(['uploaded', 'processing', 'ready', 'failed', 'deleted'])
  })

  test('the failure reasons are a closed list', () => {
    expect([...DOCUMENT_FAILURE_REASONS]).toEqual([
      'too_many_pages',
      'unreadable',
      'password_protected',
      'no_text',
      'processing_failed',
    ])
  })

  test('the limits are the owner choices and the lead defaults', () => {
    expect(MAX_DOCUMENT_BYTES).toBe(26_214_400)
    expect(MAX_DOCUMENT_PAGES).toBe(300)
    expect(DOCUMENT_RETENTION_DAYS).toBe(30)
    expect(DEFAULT_MAX_DOCUMENTS).toBe(500)
    expect(DEFAULT_MAX_DOCUMENT_BYTES_TOTAL).toBe(2_147_483_648)
    expect([...ACCEPTED_DOCUMENT_EXTENSIONS]).toEqual(['.pdf', '.docx', '.pptx', '.txt', '.md'])
  })

  test('every accepted extension maps to one accepted media type', () => {
    expect(Object.keys(MEDIA_TYPE_BY_EXTENSION).sort()).toEqual(
      [...ACCEPTED_DOCUMENT_EXTENSIONS].sort()
    )
    expect(Object.values(MEDIA_TYPE_BY_EXTENSION).sort()).toEqual(
      [...ACCEPTED_DOCUMENT_MEDIA_TYPES].sort()
    )
  })
})

describe('documentFileNameSchema', () => {
  test('the name schema does not judge the extension: the type check does', () => {
    expect(documentFileNameSchema.safeParse('a.exe').success).toBe(true)
    expect(documentFileNameSchema.safeParse('a').success).toBe(true)
  })

  test('accepts every accepted extension, with any case', () => {
    for (const name of ['a.pdf', 'a.DOCX', 'a b.pptx', 'a.txt', 'Notes.MD', 'é日本.md']) {
      expect(documentFileNameSchema.safeParse(name).success).toBe(true)
    }
  })

  test('strips control and bidirectional characters, then trims', () => {
    expect(documentFileNameSchema.parse('  a\u0000b‮cod.pdf⁦\n')).toBe('abcod.pdf')
    expect(documentFileNameSchema.parse('‏plan.md')).toBe('plan.md')
  })

  test.each([
    ['only an extension', '.pdf'],
    ['invisible characters plus an extension', '\u200b\u202e.pdf'],
    ['spaces plus an extension', '  .md'],
    ['only an extension after stripping', '‮'],
    ['an empty name', ''],
    ['a forward slash', 'a/b.pdf'],
    ['a backslash', 'a\\b.pdf'],
    ['a name over 255 characters', `${'a'.repeat(252)}.pdf`],
    ['over 1000 raw characters', `${'‮'.repeat(1000)}a.pdf`],
    ['a lone surrogate', 'a\ud800.pdf'],
  ])('rejects %s', (_name, value) => {
    expect(documentFileNameSchema.safeParse(value).success).toBe(false)
  })

  test('accepts a name of exactly 255 characters', () => {
    expect(documentFileNameSchema.safeParse(`${'a'.repeat(251)}.pdf`).success).toBe(true)
  })
})

describe('uploadDocumentFileSchema', () => {
  const upload = { fileName: 'a.pdf', declaredMediaType: 'application/pdf', sizeBytes: 10 }

  test('accepts the file part metadata', () => {
    expect(uploadDocumentFileSchema.parse(upload)).toEqual(upload)
    expect(uploadDocumentFileSchema.safeParse({ ...upload, declaredMediaType: null }).success).toBe(
      true
    )
    expect(
      uploadDocumentFileSchema.safeParse({ ...upload, sizeBytes: MAX_DOCUMENT_BYTES }).success
    ).toBe(true)
  })

  test.each([
    ['an empty file', { sizeBytes: 0 }],
    ['a fractional size', { sizeBytes: 1.5 }],
    ['a name with no stem', { fileName: '.pdf' }],
    ['an over-long declared type', { declaredMediaType: 'a'.repeat(256) }],
    ['an unknown key', { content: 'x' }],
  ])('rejects %s', (_name, change) => {
    expect(uploadDocumentFileSchema.safeParse({ ...upload, ...change }).success).toBe(false)
  })

  test('shape only: an over-size file and an unaccepted type pass this schema', () => {
    expect(
      uploadDocumentFileSchema.safeParse({ ...upload, sizeBytes: MAX_DOCUMENT_BYTES + 1 }).success
    ).toBe(true)
    expect(uploadDocumentFileSchema.safeParse({ ...upload, fileName: 'a.exe' }).success).toBe(true)
  })

  test('an over-size file hits the size check, and only that check', () => {
    expect(documentSizeCheckSchema.safeParse(MAX_DOCUMENT_BYTES).success).toBe(true)
    expect(documentSizeCheckSchema.safeParse(MAX_DOCUMENT_BYTES + 1).success).toBe(false)
    expect(documentTypeCheckSchema.safeParse('big.pdf').success).toBe(true)
  })

  test('an .exe hits the type check, and only that check', () => {
    expect(documentTypeCheckSchema.safeParse('a.exe').success).toBe(false)
    expect(documentTypeCheckSchema.safeParse('a').success).toBe(false)
    expect(documentTypeCheckSchema.safeParse('A.PDF').success).toBe(true)
    expect(documentSizeCheckSchema.safeParse(10).success).toBe(true)
  })

  test('has no field that can carry file content', () => {
    expect(Object.keys(uploadDocumentFileSchema.shape).sort()).toEqual([
      'declaredMediaType',
      'fileName',
      'sizeBytes',
    ])
  })
})

describe('documentSchema', () => {
  test('accepts a ready document and strips unknown keys', () => {
    expect(documentSchema.parse({ ...document, text: 'secret' })).toEqual(document as never)
  })

  test('accepts each state in its consistent shape', () => {
    for (const state of ['uploaded', 'processing', 'ready'] as const) {
      expect(documentSchema.safeParse({ ...document, state, pageCount: null }).success).toBe(true)
    }
    expect(
      documentSchema.safeParse({ ...document, state: 'failed', failureReason: 'no_text' }).success
    ).toBe(true)
    expect(
      documentSchema.safeParse({ ...document, state: 'deleted', deletedAt: NOW, purgeAt: NOW })
        .success
    ).toBe(true)
  })

  test.each([
    ['failed without a reason', { state: 'failed' }],
    ['a reason on a ready document', { failureReason: 'no_text' }],
    ['free text as a reason', { state: 'failed', failureReason: 'the file said x' }],
    ['deleted without a purge time', { state: 'deleted', deletedAt: NOW }],
    ['deleted without a deletion time', { state: 'deleted', purgeAt: NOW }],
    ['a purge time on a ready document', { purgeAt: NOW }],
    ['an unknown state', { state: 'purged' }],
    ['an id of the wrong kind', { id: id('org') }],
    ['a media type that is not accepted', { mediaType: 'text/html' }],
    ['more than 300 pages', { pageCount: 301 }],
    ['zero pages', { pageCount: 0 }],
    ['a bad timestamp', { createdAt: 'yesterday' }],
  ])('rejects %s', (_name, change) => {
    expect(documentSchema.safeParse({ ...document, ...change }).success).toBe(false)
  })

  test('the contract does not enforce that the extension agrees with the media type', () => {
    expect(
      documentSchema.safeParse({ ...document, fileName: 'a.exe', mediaType: 'application/pdf' })
        .success
    ).toBe(true)
  })

  test('sanitises a stored name on the way out', () => {
    expect(documentSchema.parse({ ...document, fileName: 'a‮b.pdf' }).fileName).toBe('ab.pdf')
  })
})

describe('list and params', () => {
  test('the query defaults to a page of 25 and any state', () => {
    expect(listDocumentsQuerySchema.parse({})).toEqual({ limit: 25 })
    expect(listDocumentsQuerySchema.parse({ state: 'deleted', limit: '10' })).toEqual({
      state: 'deleted',
      limit: 10,
    })
  })

  test.each([
    ['a page over the maximum', { limit: MAX_PAGE_SIZE + 1 }],
    ['an unknown state', { state: 'purged' }],
    ['an unknown key', { q: 'x' }],
    ['an empty cursor', { cursor: '' }],
  ])('the query rejects %s', (_name, query) => {
    expect(listDocumentsQuerySchema.safeParse(query).success).toBe(false)
  })

  test('a response page is bounded and holds documents', () => {
    expect(
      listDocumentsResponseSchema.parse({ items: [document], nextCursor: null }).items
    ).toHaveLength(1)
    const many = Array.from({ length: MAX_PAGE_SIZE + 1 }, () => document)
    expect(listDocumentsResponseSchema.safeParse({ items: many, nextCursor: null }).success).toBe(
      false
    )
    expect(
      listDocumentsResponseSchema.safeParse({
        items: [{ ...document, state: 'x' }],
        nextCursor: null,
      }).success
    ).toBe(false)
  })

  test('params need a document id and nothing else', () => {
    expect(documentParamsSchema.safeParse({ documentId: id('doc') }).success).toBe(true)
    expect(documentParamsSchema.safeParse({ documentId: id('inv') }).success).toBe(false)
    expect(documentParamsSchema.safeParse({ documentId: id('doc'), x: 1 }).success).toBe(false)
  })
})

describe('internal remove-everything call', () => {
  test('takes the Organization from the path and an empty body', () => {
    expect(
      internalRemoveOrganizationDocumentsParamsSchema.safeParse({ organizationId: id('org') })
        .success
    ).toBe(true)
    expect(
      internalRemoveOrganizationDocumentsParamsSchema.safeParse({ organizationId: id('doc') })
        .success
    ).toBe(false)
    expect(internalRemoveOrganizationDocumentsRequestSchema.safeParse({}).success).toBe(true)
    expect(
      internalRemoveOrganizationDocumentsRequestSchema.safeParse({ organizationId: id('org') })
        .success
    ).toBe(false)
  })

  test('always answers removed', () => {
    const body = { organizationId: id('org'), status: 'removed' }
    expect(internalRemoveOrganizationDocumentsResponseSchema.parse(body)).toEqual(body as never)
    expect(
      internalRemoveOrganizationDocumentsResponseSchema.safeParse({ ...body, status: 'deleted' })
        .success
    ).toBe(false)
  })
})

describe('messages', () => {
  test('the uploaded message has the pieces defineMessage takes', () => {
    expect(DOCUMENT_UPLOADED_MESSAGE.type).toBe('playbook.document_uploaded')
    expect(DOCUMENT_UPLOADED_MESSAGE.version).toBe(1)
    expect(DOCUMENT_UPLOADED_MESSAGE.scope).toBe('organization')
    expect(DOCUMENT_UPLOADED_MESSAGE.payload).toBe(documentUploadedPayloadSchema)
    expect(Object.keys(DOCUMENT_UPLOADED_MESSAGE).sort()).toEqual([
      'payload',
      'scope',
      'type',
      'version',
    ])
  })

  test('message types are area.event_name codes', () => {
    for (const message of [DOCUMENT_UPLOADED_MESSAGE, DOCUMENT_DELETED_MESSAGE]) {
      expect(errorCodeSchema.safeParse(message.type).success).toBe(true)
      expect(eventTypeSchema.safeParse(message.type).success).toBe(true)
      expect(message.scope).toBe('organization')
    }
  })

  test('the uploaded payload is a document id only', () => {
    expect(documentUploadedPayloadSchema.safeParse({ documentId: id('doc') }).success).toBe(true)
    expect(documentUploadedPayloadSchema.safeParse({}).success).toBe(false)
    expect(documentUploadedPayloadSchema.safeParse({ documentId: id('org') }).success).toBe(false)
    expect(
      documentUploadedPayloadSchema.safeParse({ documentId: id('doc'), organizationId: id('org') })
        .success
    ).toBe(false)
    expect(
      documentUploadedPayloadSchema.safeParse({ documentId: id('doc'), fileName: 'a.pdf' }).success
    ).toBe(false)
  })

  test('the deleted payload names the deletion it was queued for by sequence', () => {
    const ok = { documentId: id('doc'), deletionSeq: 1 }
    expect(documentDeletedPayloadSchema.safeParse(ok).success).toBe(true)
    expect(MAX_DELETION_SEQ).toBe(2_147_483_647)
    expect(
      documentDeletedPayloadSchema.safeParse({ ...ok, deletionSeq: MAX_DELETION_SEQ }).success
    ).toBe(true)
    expect(
      documentDeletedPayloadSchema.safeParse({ ...ok, deletionSeq: MAX_DELETION_SEQ + 1 }).success
    ).toBe(false)
    for (const bad of [NOW, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, '1', undefined]) {
      expect(documentDeletedPayloadSchema.safeParse({ ...ok, deletionSeq: bad }).success).toBe(
        false
      )
    }
    expect(documentDeletedPayloadSchema.safeParse({ documentId: id('doc') }).success).toBe(false)
    expect(documentDeletedPayloadSchema.safeParse({ ...ok, deletedAt: NOW }).success).toBe(false)
  })

  test('the sequence is not on the public document', () => {
    expect('deletionSeq' in documentSchema.parse({ ...document, deletionSeq: 3 })).toBe(false)
  })
})

const PLAYBOOK_MESSAGES = {
  'document.not_found': 'The document was not found.',
  'document.unsupported_type': 'This file type is not supported.',
  'document.too_large': 'The file is larger than the upload limit.',
  'document.quota_exceeded':
    'The Organization has reached its limit on the number or total size of documents. Deleted documents count until they are purged.',
  'document.not_restorable':
    'The document was purged after its retention period and cannot be restored.',
} as const

describe('PLAYBOOK_ERRORS', () => {
  test.each([
    ['document.not_found', 404],
    ['document.unsupported_type', 415],
    ['document.too_large', 413],
    ['document.quota_exceeded', 409],
    ['document.not_restorable', 410],
  ] as const)('%s maps to status %d', (code, status) => {
    expect(PLAYBOOK_ERRORS[code].code).toBe(code)
    expect(PLAYBOOK_ERRORS[code].status).toBe(status)
  })

  test('lists exactly the codes and fixed messages under test', () => {
    expect(Object.keys(PLAYBOOK_ERRORS).sort()).toEqual(Object.keys(PLAYBOOK_MESSAGES).sort())
    for (const [code, message] of Object.entries(PLAYBOOK_MESSAGES)) {
      expect(PLAYBOOK_ERRORS[code as keyof typeof PLAYBOOK_MESSAGES].message).toBe(message)
    }
  })

  test('there is no page-limit and no not-deleted code', () => {
    expect('document.too_many_pages' in PLAYBOOK_ERRORS).toBe(false)
    expect('document.not_deleted' in PLAYBOOK_ERRORS).toBe(false)
  })

  test('the quota message covers count and size and says deleted documents count', () => {
    expect(PLAYBOOK_ERRORS['document.quota_exceeded'].message).toMatch(/number or total size/)
    expect(PLAYBOOK_ERRORS['document.quota_exceeded'].message).toMatch(/Deleted documents count/)
  })

  test('not_restorable is for a deleted document past its purge time, not a purged one', () => {
    expect(PLAYBOOK_ROUTES.restoreDocument.description).toContain('purge time has passed')
    expect(PLAYBOOK_ROUTES.restoreDocument.description).toContain('document.not_found (404)')
  })

  test('purged is distinct from not found', () => {
    expect(PLAYBOOK_ERRORS['document.not_restorable'].status).not.toBe(
      PLAYBOOK_ERRORS['document.not_found'].status
    )
  })

  test('no code collides with a common one, and no message has a placeholder for content', () => {
    for (const code of Object.keys(PLAYBOOK_ERRORS)) {
      expect(code in ERRORS).toBe(false)
    }
    for (const entry of Object.values(PLAYBOOK_ERRORS)) {
      expect(entry.message).not.toMatch(/[{}$%]|<|>/)
    }
  })
})

describe('PLAYBOOK_ROUTES', () => {
  const routes = Object.entries(PLAYBOOK_ROUTES)

  test('describes the six routes', () => {
    expect(routes.map(([name]) => name).sort()).toEqual([
      'deleteDocument',
      'getDocument',
      'listDocuments',
      'removeOrganizationDocuments',
      'restoreDocument',
      'uploadDocument',
    ])
  })

  test('method and path pairs are unique', () => {
    const keys = routes.map(([, route]) => `${route.method} ${route.path}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  test('Owner and Admin write, and every role reads', () => {
    for (const name of ['uploadDocument', 'deleteDocument', 'restoreDocument'] as const) {
      expect([...PLAYBOOK_ROUTES[name].roles]).toEqual(['owner', 'admin'])
      expect(PLAYBOOK_ROUTES[name].description).toContain('Owner and Admin only')
    }
    for (const name of ['listDocuments', 'getDocument'] as const) {
      expect([...PLAYBOOK_ROUTES[name].roles]).toEqual(['owner', 'admin', 'manager', 'rep'])
      expect(PLAYBOOK_ROUTES[name].description).toContain('Rep may read')
    }
  })

  test('only the remove-everything route is internal, under /internal, with no role', () => {
    for (const [name, route] of routes) {
      expect(route.internal).toBe(name === 'removeOrganizationDocuments')
      expect(route.path.startsWith('/internal/')).toBe(route.internal)
      if (route.internal) {
        expect(route.roles).toEqual([])
      }
    }
  })

  test('every listed code exists in a registry and every route answers with its error responses', () => {
    for (const [, route] of routes) {
      for (const code of route.errors) {
        expect(PLAYBOOK_ERRORS[code].status).toBeGreaterThanOrEqual(400)
      }
      for (const code of route.commonErrors) {
        expect(ERRORS[code].status).toBeGreaterThanOrEqual(400)
      }
      expect(route.description.length).toBeGreaterThan(40)
    }
  })

  test('every playbook code is returned by some route', () => {
    const used = new Set<string>(routes.flatMap(([, route]) => [...route.errors]))
    expect([...used].sort()).toEqual(Object.keys(PLAYBOOK_ERRORS).sort())
  })

  test('upload answers 201 or 200 for a duplicate and takes an idempotency key', () => {
    const upload = PLAYBOOK_ROUTES.uploadDocument
    expect([...upload.success]).toEqual([201, 200])
    expect(upload.commonErrors).toContain('request.idempotency_key_reused')
    expect(upload.description).toContain('Idempotency-Key')
    expect(upload.description).toContain('multipart/form-data')
  })

  test('restore names the purged case and is idempotent by end state', () => {
    expect(PLAYBOOK_ROUTES.restoreDocument.errors).toEqual([
      'document.not_found',
      'document.not_restorable',
    ])
    expect(PLAYBOOK_ROUTES.restoreDocument.description).toContain('Idempotent by end state')
    expect(PLAYBOOK_ROUTES.deleteDocument.description).toContain('Idempotent by end state')
  })

  test('upload states the duplicate rules, the page-limit signal and the envelope codes', () => {
    const text = PLAYBOOK_ROUTES.uploadDocument.description
    expect(text).toContain('stored fileName')
    expect(text).toContain('a match on a "deleted" document restores it')
    expect(text).toContain('a match on a "failed" document re-queues it')
    expect(text).toContain('failureReason "too_many_pages"')
    expect(text).toContain('request.too_large')
    expect(text).toContain('request.unsupported_media_type')
    expect(PLAYBOOK_ROUTES.uploadDocument.errors).toEqual([
      'document.unsupported_type',
      'document.too_large',
      'document.quota_exceeded',
    ])
  })

  test('the list names its sort key', () => {
    expect(PLAYBOOK_ROUTES.listDocuments.description).toContain('createdAt, then id')
  })

  test('the remove-everything route needs only an idempotency key and has no domain error', () => {
    expect(PLAYBOOK_ROUTES.removeOrganizationDocuments.errors).toEqual([])
    expect(PLAYBOOK_ROUTES.removeOrganizationDocuments.description).toContain(
      'Idempotent by end state'
    )
  })
})

describe('normaliseMediaType', () => {
  test.each([
    ['text/plain; charset=utf-8', 'text/plain'],
    ['Text/Markdown', 'text/markdown'],
    ['  application/pdf ;x=y', 'application/pdf'],
    ['', ''],
  ])('%s becomes %s', (input, output) => {
    expect(normaliseMediaType(input)).toBe(output)
  })
})

describe('checkUploadFile', () => {
  const file = { fileName: 'report.pdf', declaredMediaType: 'application/pdf', sizeBytes: 10 }

  test('returns the parsed file when every check passes', () => {
    expect(checkUploadFile(file)).toEqual({ ok: true, file })
  })

  test('an over-size .exe yields only document.too_large (size runs first)', () => {
    expect(
      checkUploadFile({ ...file, fileName: 'a.exe', sizeBytes: MAX_DOCUMENT_BYTES + 1 })
    ).toEqual({
      ok: false,
      code: 'document.too_large',
    })
  })

  test('a wrong type of an allowed size yields document.unsupported_type', () => {
    expect(checkUploadFile({ ...file, fileName: 'a.exe' })).toEqual({
      ok: false,
      code: 'document.unsupported_type',
    })
    expect(checkUploadFile({ ...file, fileName: 'noextension' })).toEqual({
      ok: false,
      code: 'document.unsupported_type',
    })
  })

  test('a trailing space is accepted and stored trimmed', () => {
    expect(checkUploadFile({ ...file, fileName: 'report.pdf ' })).toEqual({
      ok: true,
      file: { ...file, fileName: 'report.pdf' },
    })
    expect(documentTypeCheckSchema.safeParse('report.pdf ').success).toBe(true)
  })

  test('a bidirectional override is judged on its stripped form', () => {
    expect(checkUploadFile({ ...file, fileName: 'report\u202egnp.exe' })).toEqual({
      ok: false,
      code: 'document.unsupported_type',
    })
    expect(checkUploadFile({ ...file, fileName: 'repo\u202ert.pdf' })).toEqual({
      ok: true,
      file: { ...file, fileName: 'report.pdf' },
    })
    expect(checkUploadFile({ ...file, fileName: 'report.pdf\u2066' })).toEqual({
      ok: true,
      file: { ...file, fileName: 'report.pdf' },
    })
  })

  test.each([
    ['a negative size', { sizeBytes: -1 }],
    ['a fractional size', { sizeBytes: 1.5 }],
    ['an empty file', { sizeBytes: 0 }],
    ['a name with no stem', { fileName: '.pdf' }],
    ['a path separator', { fileName: 'a/b.pdf' }],
    ['an unknown key', { content: 'x' }],
  ])('%s yields request.invalid', (_name, change) => {
    expect(checkUploadFile({ ...file, ...change })).toEqual({ ok: false, code: 'request.invalid' })
  })

  test.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['-Infinity', Number.NEGATIVE_INFINITY],
  ])('a size of %s yields request.invalid, not document.too_large', (_name, sizeBytes) => {
    expect(checkUploadFile({ ...file, sizeBytes })).toEqual({ ok: false, code: 'request.invalid' })
  })

  test.each([
    ['fileName', ['a.pdf', 'a.exe']],
    ['fileName', ['a.exe', 'a.pdf']],
    ['sizeBytes', [10, MAX_DOCUMENT_BYTES + 1]],
    ['sizeBytes', [MAX_DOCUMENT_BYTES + 1, 10]],
  ] as const)(
    'a flipping getter on %s is read once and the checked value is the one used',
    (key, values) => {
      let reads = 0
      const input = { ...file }
      Object.defineProperty(input, key, {
        enumerable: true,
        get: () => values[reads++ === 0 ? 0 : 1],
      })
      const result = checkUploadFile(input)
      expect(reads).toBe(1)
      if (result.ok) {
        expect(result.file[key]).toBe(values[0])
        expect(result.file[key]).toBe(key === 'fileName' ? 'a.pdf' : 10)
      } else {
        expect(['document.too_large', 'document.unsupported_type']).toContain(result.code)
      }
    }
  )

  test('a polluted Object.prototype.sizeBytes does not satisfy a missing size', () => {
    Object.defineProperty(Object.prototype, 'sizeBytes', {
      value: 10,
      configurable: true,
      enumerable: false,
      writable: true,
    })
    try {
      expect(checkUploadFile({ fileName: 'a.pdf', declaredMediaType: null })).toEqual({
        ok: false,
        code: 'request.invalid',
      })
    } finally {
      Reflect.deleteProperty(Object.prototype, 'sizeBytes')
    }
  })

  test('input that is not an object yields request.invalid', () => {
    for (const input of [null, undefined, 'x', 3, {}, { fileName: 3, sizeBytes: 'big' }]) {
      expect(checkUploadFile(input)).toEqual({ ok: false, code: 'request.invalid' })
    }
  })
})

describe('0.7.0 types are not widened (code written against them still compiles)', () => {
  // An exhaustive switch on the 0.7.0 methods: a new method in PlaybookRoute would fail the `never`.
  function verb(method: PlaybookRoute['method']): string {
    switch (method) {
      case 'GET':
        return 'read'
      case 'POST':
        return 'create'
      case 'DELETE':
        return 'delete'
      default: {
        const unreachable: never = method
        return unreachable
      }
    }
  }

  test('PlaybookRoute keeps the three methods and PLAYBOOK_ERRORS can be indexed by a route code', () => {
    for (const route of Object.values(PLAYBOOK_ROUTES)) {
      expect(verb(route.method)).toMatch(/read|create|delete/)
      for (const code of route.errors) {
        expect(PLAYBOOK_ERRORS[code].code).toBe(code)
      }
    }
    expect(Object.keys(PLAYBOOK_ERRORS)).toHaveLength(5)
  })

  test('the merged route map covers every route of both tables, and the merged registry every code', () => {
    expect(Object.keys(ALL_PLAYBOOK_ROUTES).sort()).toEqual(
      [
        ...Object.keys(PLAYBOOK_ROUTES),
        ...Object.keys(SALES_HISTORY_ROUTES),
        'searchMoments',
        'searchDocuments',
        'resolveCitations',
        ...Object.keys(SUGGESTION_ROUTES),
        'getLearningSettings',
        'setLearningSettings',
      ].sort()
    )
    expect(Object.keys(ALL_PLAYBOOK_ERRORS).sort()).toEqual(
      [
        ...Object.keys(PLAYBOOK_ERRORS),
        ...Object.keys(SALES_HISTORY_ERRORS),
        ...Object.keys(SUGGESTION_ERRORS),
      ].sort()
    )
    for (const route of Object.values(ALL_PLAYBOOK_ROUTES)) {
      for (const code of route.errors) {
        expect(ALL_PLAYBOOK_ERRORS[code].status).toBeGreaterThanOrEqual(400)
      }
    }
  })

  test('the merged route paths and methods stay unique', () => {
    const keys = Object.values(ALL_PLAYBOOK_ROUTES).map((route) => `${route.method} ${route.path}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
