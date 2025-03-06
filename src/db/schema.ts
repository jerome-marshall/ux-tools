import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

const timestamps = {
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
}

export const projects = pgTable('projects', {
  id: serial('id').notNull().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  ...timestamps
})

export type Project = typeof projects.$inferSelect
