import {
  correctPathSchema,
  treeItemSchema,
  treeTestClickSchema,
  type CorrectPath,
  type TreeItem,
  type TreeTestClick
} from '@/zod-schemas/tree.schema'
import { boolean, jsonb, pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps, uniqueId } from './utils'
import { testResults, tests } from './test'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const treeTests = pgTable('tree_tests', {
  id: uniqueId,
  testId: text('test_id')
    .notNull()
    .references(() => tests.id, { onDelete: 'cascade' }),
  treeStructure: jsonb('tree_structure').$type<TreeItem[]>().notNull(),
  taskInstructions: text('task_instructions').notNull(),
  correctPaths: jsonb('correct_paths').$type<CorrectPath[]>().notNull(),
  ...timestamps
})

export const treeTestResults = pgTable('tree_test_results', {
  id: uniqueId,
  testResultId: text('test_result_id')
    .notNull()
    .references(() => testResults.id, { onDelete: 'cascade' }),
  treeTestClicks: jsonb('tree_test_clicks').$type<TreeTestClick[]>().notNull(),
  passed: boolean('passed').notNull(),
  ...timestamps
})

export const treeTestInsertSchema = z.object({
  id: z.string().min(1, { message: 'Tree test ID is required' }),
  testId: z.string().min(1, { message: 'Test is required' }),
  treeStructure: z
    .array(treeItemSchema)
    .min(1, { message: 'At least one tree structure is required' }),
  taskInstructions: z.string().min(1, { message: 'Task instructions are required' }),
  correctPaths: z
    .array(correctPathSchema)
    .min(1, { message: 'At least one correct path is required' })
})

export const treeTestResultInsertSchema = createInsertSchema(treeTestResults)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    testId: z.string().min(1, { message: 'Test is required' }),
    treeTestClicks: z.array(treeTestClickSchema),
    passed: z.boolean()
  })

export type TreeTest = typeof treeTests.$inferSelect
export type TreeTestInsert = z.infer<typeof treeTestInsertSchema>
export type TreeTestResult = typeof treeTestResults.$inferSelect
export type TreeTestResultInsert = z.infer<typeof treeTestResultInsertSchema>
