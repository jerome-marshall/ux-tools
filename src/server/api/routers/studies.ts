import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { studyInsertSchema } from '@/server/db/schema'
import { createStudyUseCase, getStudiesByProjectIdUseCase } from '@/use-cases/studies'
import { z } from 'zod'

export const studiesRouter = createTRPCRouter({
  createStudy: publicProcedure.input(studyInsertSchema).mutation(async ({ input }) => {
    const newStudy = await createStudyUseCase(input)
    return newStudy
  }),

  getStudiesByProjectId: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const studies = await getStudiesByProjectIdUseCase(input.projectId)
      return studies
    })
})
