import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { projectInsertSchema } from '@/server/db/schema'
import { createProjectUseCase } from '@/use-cases/projects'

export const testsRouter = createTRPCRouter({
  createProject: publicProcedure
    .input(projectInsertSchema)
    .mutation(async ({ input }) => {
      const newProject = await createProjectUseCase(input)
      return newProject
    })
})
