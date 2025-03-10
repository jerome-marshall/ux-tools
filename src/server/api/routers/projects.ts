import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { projectInsertSchema } from '@/server/db/schema'
import {
  createProjectUseCase,
  getProjectByIdUseCase,
  getProjectsUseCase,
  getRecentProjectsUseCase
} from '@/use-cases/projects'
import { z } from 'zod'

export const projectsRouter = createTRPCRouter({
  createProject: publicProcedure
    .input(projectInsertSchema)
    .mutation(async ({ input }) => {
      const newProject = await createProjectUseCase(input)
      return newProject
    }),

  getProjects: publicProcedure
    .input(
      z
        .object({ sort: z.string(), sortDir: z.string() })
        .optional()
        .default({ sort: 'updated', sortDir: 'desc' })
    )
    .query(async ({ input }) => {
      const projects = await getProjectsUseCase({
        sort: input.sort,
        sortDir: input.sortDir
      })
      return projects
    }),

  getRecentProjects: publicProcedure.query(async () => {
    const projects = await getRecentProjectsUseCase()
    return projects
  }),

  getProjectById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const project = await getProjectByIdUseCase(input.id)
      return project
    })
})
