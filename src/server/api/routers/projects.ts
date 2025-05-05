import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { projectInsertSchema } from '@/server/db/schema'
import {
  createProjectUseCase,
  getProjectByIdUseCase,
  getProjectsUseCase,
  getRecentProjectsUseCase,
  updateProjectUseCase
} from '@/use-cases/projects'
import { z } from 'zod'

export const projectsRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(projectInsertSchema)
    .mutation(async ({ input, ctx: { userId } }) => {
      const newProject = await createProjectUseCase(userId, input)
      return newProject
    }),

  getProjects: protectedProcedure.query(async ({ ctx: { userId } }) => {
    const projects = await getProjectsUseCase(userId)
    return projects
  }),

  getRecentProjects: protectedProcedure.query(async ({ ctx: { userId } }) => {
    const projects = await getRecentProjectsUseCase(userId)
    return projects
  }),

  getProjectById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx: { userId } }) => {
      const project = await getProjectByIdUseCase(userId, input.id)
      return project
    }),

  renameProject: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx: { userId } }) => {
      const updatedProject = await updateProjectUseCase(userId, input.id, {
        name: input.name
      })
      return updatedProject
    })
})
