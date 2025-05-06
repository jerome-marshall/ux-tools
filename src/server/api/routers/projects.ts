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

  getProjects: protectedProcedure
    .input(
      z.object({
        active: z.boolean().optional().default(true),
        getAll: z.boolean().optional().default(false)
      })
    )
    .query(async ({ input, ctx: { userId } }) => {
      const projects = await getProjectsUseCase(userId, {
        active: input.active,
        getAll: input.getAll
      })
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
    }),

  updateArchiveStatus: protectedProcedure
    .input(z.object({ id: z.string(), archived: z.boolean() }))
    .mutation(async ({ input, ctx: { userId } }) => {
      const updatedProject = await updateProjectUseCase(userId, input.id, {
        archived: input.archived
      })
      return updatedProject
    })
})
