import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { studyInsertSchema } from '@/server/db/schema'
import { createStudyUseCase } from '@/use-cases/studies'

export const studiesRouter = createTRPCRouter({
  createStudy: publicProcedure.input(studyInsertSchema).mutation(async ({ input }) => {
    const newStudy = await createStudyUseCase(input)
    return newStudy
  })
})
