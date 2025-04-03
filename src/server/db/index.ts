// Make sure to install the 'pg' package
import { env } from '@/env'
import * as schema from '@/server/db/schema'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: env.DATABASE_URL
})

// You can specify any property from the node-postgres connection options
const db = drizzle({
  client: pool,
  schema
})

export type Db = typeof db

export { db }
