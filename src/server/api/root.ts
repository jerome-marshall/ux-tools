import { projectsRouter } from '@/server/api/routers/projects'
import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc'
import { studiesRouter } from './routers/studies'
import { testsRouter } from './routers/tests'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  projects: projectsRouter,
  studies: studiesRouter,
  tests: testsRouter
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
