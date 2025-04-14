import { generateId } from '@/lib/utils'
import { text, timestamp } from 'drizzle-orm/pg-core'

export const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull()
}

export const uniqueId = text('id')
  .primaryKey()
  .notNull()
  .$defaultFn(() => generateId())
