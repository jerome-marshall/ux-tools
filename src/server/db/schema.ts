import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull()
}

export const projects = pgTable('projects', {
  id: serial('id').notNull().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
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

export type Project = typeof projects.$inferSelect
export type ProjectInsert = z.infer<typeof projectInsertSchema>
