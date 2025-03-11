import { relations } from 'drizzle-orm'
import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'

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
  .$defaultFn(() => uuid())

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
    .references(() => projects.id),
  ...timestamps
})

export const testTypes = ['TREE_TEST', 'CARD_SORT', 'USABILITY_TEST'] as const
export type TestType = (typeof testTypes)[number]

export const tests = pgTable('tests', {
  id: uniqueId,
  name: text('name').notNull(),
  type: text('type').$type<TestType>().notNull(),
  studyId: text('study_id')
    .notNull()
    .references(() => studies.id),
  ...timestamps
})

export const treeTests = pgTable('tree_tests', {
  id: uniqueId,
  testId: text('test_id')
    .notNull()
    .references(() => tests.id),
  treeStructure: jsonb('tree_structure').notNull(),
  taskInstructions: text('task_instructions').notNull(),
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
export const testRelations = relations(tests, ({ one }) => ({
  study: one(studies, {
    fields: [tests.studyId],
    references: [studies.id]
  }),
  treeTest: one(treeTests, {
    fields: [tests.id],
    references: [treeTests.testId]
  })
}))
export const treeTestRelations = relations(treeTests, ({ one }) => ({
  test: one(tests, {
    fields: [treeTests.testId],
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
    name: z.string().min(1, { message: 'Name is required' }),
    type: z.enum(testTypes),
    studyId: z.string().min(1, { message: 'Study is required' })
  })
export const treeTestInsertSchema = createInsertSchema(treeTests)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    testId: z.string().min(1, { message: 'Test is required' }),
    treeStructure: z.string().min(1, { message: 'Tree structure is required' }),
    tasks: z.string().min(1, { message: 'Tasks are required' })
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
