import { sql } from 'drizzle-orm'
import { boolean, pgTable, text } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { timestamps, uniqueId } from './utils'

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
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps
})

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
    createdAt: true,
    updatedAt: true
  })
  .extend({
    id: z.string().min(1, { message: 'Study ID is required' }),
    name: z.string().min(1, { message: 'Name is required' }),
    projectId: z.string().min(1, { message: 'Project is required' })
  })

export type Project = typeof projects.$inferSelect
export type ProjectInsert = z.infer<typeof projectInsertSchema>
export type Study = typeof studies.$inferSelect
export type StudyInsert = z.infer<typeof studyInsertSchema>
