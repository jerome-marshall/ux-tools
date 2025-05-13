import { z } from 'zod'
import {
  studyInsertSchema,
  surveyQuestionInsertSchema,
  testInsertSchema,
  treeTestInsertSchema
} from '@/server/db/schema'
import { testTypes } from './test.schema'
import { SECTION_TYPE } from '@/utils/study-utils'

// Base schema without IDs for creating new studies
export const studyWithTestsInsertSchema = z.object({
  study: studyInsertSchema,
  tests: z
    .array(
      testInsertSchema
        .omit({ id: true })
        .extend({
          type: z.enum(testTypes),
          sectionId: z.string().min(1, { message: 'Section ID is required' })
        })
        .and(
          z.discriminatedUnion('type', [
            treeTestInsertSchema
              .extend({
                type: z.literal(SECTION_TYPE.TREE_TEST)
              })
              .omit({ id: true }),
            z.object({
              type: z.literal('SURVEY'),
              testId: z.string().min(1, { message: 'Test ID is required' }),
              questions: surveyQuestionInsertSchema.array()
            })
          ])
        )
    )
    .min(1, { message: 'At least one test is required' })
})
export type StudyWithTestsInsert = z.infer<typeof studyWithTestsInsertSchema>

export const duplicateStudySchema = z.object({
  name: z.string().min(1, { message: 'Study name is required' }),
  projectId: z.string().min(1, { message: 'Select a project' })
})
export type DuplicateStudy = z.infer<typeof duplicateStudySchema>
