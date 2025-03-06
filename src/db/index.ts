// Make sure to install the 'pg' package
import { env } from '@/env'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '@/db/schema'

// You can specify any property from the node-postgres connection options
const db = drizzle({
  schema,
  connection: {
    connectionString: env.DATABASE_URL
  }
})

export default db
