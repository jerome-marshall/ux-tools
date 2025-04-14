import { db } from '@/server/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg'
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [nextCookies()],
  advanced: {
    database: {
      generateId: false
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 10 * 60 // Cache duration in seconds
    }
  }
})
