import { testTypes } from '@/zod-schemas/test.schema'
import { boolean, integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { studies } from './project-study'
import { timestamps, uniqueId } from './utils'
import { type SECTION_TYPE } from '@/utils/study-utils'

export const testTypesEnum = pgEnum('test_types', testTypes)

export const tests = pgTable('tests', {
  id: uniqueId,
  name: text('name').notNull(),
  type: testTypesEnum('type').notNull(),
  studyId: text('study_id')
    .notNull()
    .references(() => studies.id, { onDelete: 'cascade' }),
  randomized: boolean('randomized').notNull().default(false),
  ...timestamps
})

export const testResults = pgTable('test_results', {
  id: uniqueId,
  testId: text('test_id')
    .notNull()
    .references(() => tests.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  totalDurationMs: integer('total_duration_ms').notNull(),
  taskDurationMs: integer('task_duration_ms').notNull(),
  ...timestamps
})

export const testInsertSchema = createInsertSchema(tests)
  .omit({
    createdAt: true,
    updatedAt: true
  })
  .extend({
    id: z.string().min(1, { message: 'Test ID is required' }),
    type: z.enum(testTypes),
    studyId: z.string().min(1, { message: 'Study is required' }),
    name: z.string().min(1, { message: 'Name is required' })
  })

export const testResultInsertSchema = createInsertSchema(testResults)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    testId: z.string().min(1, { message: 'Test is required' }),
    userId: z.string().min(1, { message: 'User is required' })
  })

type BaseTest = Omit<typeof tests.$inferSelect, 'type'>
export type Test = BaseTest &
  (
    | {
        type: typeof SECTION_TYPE.TREE_TEST
      }
    | {
        type: typeof SECTION_TYPE.SURVEY
      }
  )
export type Test_TreeTestType = Test & { type: typeof SECTION_TYPE.TREE_TEST }
export type Test_SurveyType = Test & { type: typeof SECTION_TYPE.SURVEY }

export type TestInsert = z.infer<typeof testInsertSchema>
export type TestResult = typeof testResults.$inferSelect
export type TestResultInsert = z.infer<typeof testResultInsertSchema>
