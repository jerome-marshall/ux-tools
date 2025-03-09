import { z } from 'zod'
import { baseProcedure, createTRPCRouter } from '../init'
export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string()
      })
    )
    .query(async opts => {
      // simulate a slow query
      await new Promise(resolve => setTimeout(resolve, 3000))
      return {
        greeting: `hello ${opts.input.text}`
      }
    })
})
// export type definition of API
export type AppRouter = typeof appRouter
