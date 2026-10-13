import { z } from 'zod'
import { organizationIdSchema } from '../ids'
import { organizationStatusSchema, regionSchema } from '../tenancy'
import { organizationNameSchema, timestampSchema } from './values'

/** An Organization as core returns it, for both reading it and renaming it. */
export const organizationSchema = z.strictObject({
  id: organizationIdSchema,
  name: organizationNameSchema,
  region: regionSchema,
  status: organizationStatusSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
})

/** An Organization as core returns it. */
export type Organization = z.infer<typeof organizationSchema>

/** The body of a request to rename the caller's Organization. */
export const renameOrganizationRequestSchema = z.strictObject({
  name: organizationNameSchema,
})

/** The body of a request to rename the caller's Organization. */
export type RenameOrganizationRequest = z.infer<typeof renameOrganizationRequestSchema>
