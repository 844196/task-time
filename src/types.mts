import { z } from 'zod'

export const timeWithOffsetSchema = z
  .string()
  .regex(/^(\d{2}):(\d{2})(Z|(\+|-)\d{2}:\d{2})$/, 'Time must be in format HH:mm[+|-]HH:mm or HH:mmZ')

export type TimeWithOffset = z.infer<typeof timeWithOffsetSchema>
