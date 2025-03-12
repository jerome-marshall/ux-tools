import { z } from 'zod'
import {
  studyInsertSchema,
  testInsertSchema,
  testTypes,
  treeTestInsertSchema
} from '@/server/db/schema'

export const studyWithTestsInsertSchema = z.object({
  study: studyInsertSchema,
  tests: z
    .array(
      testInsertSchema
        .omit({ studyId: true })
        .extend({
          type: z.enum(testTypes)
        })
        .and(
          z.discriminatedUnion('type', [
            treeTestInsertSchema
              .omit({
                testId: true
              })
              .extend({
                type: z.literal('TREE_TEST')
              })
          ])
        )
    )
    .min(1, { message: 'At least one test is required' })
})
export type StudyWithTestsInsert = z.infer<typeof studyWithTestsInsertSchema>
