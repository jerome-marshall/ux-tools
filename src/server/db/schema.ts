import { relations, sql } from 'drizzle-orm'
import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { generateId } from '@/lib/utils'
import {
  correctPathSchema,
  treeItemSchema,
  treeTestClickSchema,
  type TreeTestClick
} from '@/zod-schemas/tree.schema'

const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull()
}

const uniqueId = text('id')
  .primaryKey()
  .notNull()
  .$defaultFn(() => generateId())

export const projects = pgTable('projects', {
  id: uniqueId,
  name: text('name').notNull(),
  description: text('description'),
  ...timestamps
})

export const studies = pgTable('studies', {
  id: uniqueId,
  name: text('name').notNull(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  testsOrder: text('tests_order')
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  ...timestamps
})

export const testTypes = ['TREE_TEST'] as const
export type TestType = (typeof testTypes)[number]

export const tests = pgTable('tests', {
  id: uniqueId,
  name: text('name').notNull(),
  type: text('type').$type<TestType>().notNull(),
  studyId: text('study_id')
    .notNull()
    .references(() => studies.id, { onDelete: 'cascade' }),
  ...timestamps
})

export const treeTests = pgTable('tree_tests', {
  id: uniqueId,
  testId: text('test_id')
    .notNull()
    .references(() => tests.id, { onDelete: 'cascade' }),
  treeStructure: jsonb('tree_structure').notNull(),
  taskInstructions: text('task_instructions').notNull(),
  correctPaths: jsonb('correct_paths').notNull(),
  ...timestamps
})

export const treeTestResults = pgTable('tree_test_results', {
  id: uniqueId,
  testId: text('test_id')
    .notNull()
    .references(() => tests.id, { onDelete: 'cascade' }),
  totalDurationMs: integer('total_duration_ms').notNull(),
  taskDurationMs: integer('task_duration_ms').notNull(),
  treeTestClicks: jsonb('tree_test_clicks').$type<TreeTestClick[]>().notNull(),
  passed: boolean('passed').notNull(),
  ...timestamps
})

/*Relations */
export const projectRelations = relations(projects, ({ many }) => ({
  studies: many(studies)
}))
export const studyRelations = relations(studies, ({ one, many }) => ({
  project: one(projects, {
    fields: [studies.projectId],
    references: [projects.id]
  }),
  tests: many(tests)
}))
export const testRelations = relations(tests, ({ one, many }) => ({
  study: one(studies, {
    fields: [tests.studyId],
    references: [studies.id]
  }),
  treeTest: one(treeTests, {
    fields: [tests.id],
    references: [treeTests.testId]
  }),
  treeTestResults: many(treeTestResults)
}))
export const treeTestRelations = relations(treeTests, ({ one }) => ({
  test: one(tests, {
    fields: [treeTests.testId],
    references: [tests.id]
  })
}))
export const treeTestResultRelations = relations(treeTestResults, ({ one }) => ({
  test: one(tests, {
    fields: [treeTestResults.testId],
    references: [tests.id]
  })
}))

/* Schemas */
export const projectInsertSchema = createInsertSchema(projects)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    name: z.string().min(1, { message: 'Name is required' })
  })
export const studyInsertSchema = createInsertSchema(studies)
  .omit({
    id: true,
    testsOrder: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    name: z.string().min(1, { message: 'Name is required' }),
    projectId: z.string().min(1, { message: 'Project is required' })
  })
export const testInsertSchema = createInsertSchema(tests)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    type: z.enum(testTypes),
    studyId: z.string().min(1, { message: 'Study is required' }),
    name: z.string().min(1, { message: 'Name is required' })
  })
export const treeTestInsertSchema = createInsertSchema(treeTests)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    testId: z.string().min(1, { message: 'Test is required' }),
    treeStructure: z.array(treeItemSchema),
    taskInstructions: z.string().min(1, { message: 'Task instructions are required' }),
    correctPaths: z.array(correctPathSchema)
  })

export const treeTestResultInsertSchema = createInsertSchema(treeTestResults)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    testId: z.string().min(1, { message: 'Test is required' }),
    totalDurationMs: z.number().int().positive(),
    taskDurationMs: z.number().int().positive(),
    treeTestClicks: z.array(treeTestClickSchema),
    passed: z.boolean()
  })

/* Types */
export type Project = typeof projects.$inferSelect
export type ProjectInsert = z.infer<typeof projectInsertSchema>
export type Study = typeof studies.$inferSelect
export type StudyInsert = z.infer<typeof studyInsertSchema>
export type Test = typeof tests.$inferSelect
export type TestInsert = z.infer<typeof testInsertSchema>
export type TreeTest = typeof treeTests.$inferSelect
export type TreeTestInsert = z.infer<typeof treeTestInsertSchema>
export type TreeTestResult = typeof treeTestResults.$inferSelect
export type TreeTestResultInsert = z.infer<typeof treeTestResultInsertSchema>
