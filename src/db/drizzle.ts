// Make sure to install the 'pg' package
import { env } from '@/env'
import { drizzle } from 'drizzle-orm/node-postgres'

// You can specify any property from the node-postgres connection options
const db = drizzle({
  connection: {
    connectionString: env.DATABASE_URL,
    ssl: true
  }
})

export default db
