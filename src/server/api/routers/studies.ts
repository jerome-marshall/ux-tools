import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import {
  createStudyUseCase,
  getStudiesByProjectIdUseCase,
  updateStudyUseCase
} from '@/use-cases/studies'
import { createTestsUseCase } from '@/use-cases/tests'
import { createTreeTestUseCase } from '@/use-cases/tree-tests'
import { studyWithTestsInsertSchema } from '@/zod-schemas'
import { z } from 'zod'

export const studiesRouter = createTRPCRouter({
  createStudy: publicProcedure
    .input(studyWithTestsInsertSchema)
    .mutation(async ({ input: { study, tests } }) => {
      const newStudy = await createStudyUseCase(study)

      // Process each test based on its type
      const testRecords = tests.map(testData => {
        const baseTest = {
          type: testData.type,
          studyId: newStudy.id,
          name: testData.name
        }

        return baseTest
      })

      const newTests = await createTestsUseCase(testRecords)
      const testsOrder = newTests.map(test => test.id)

      await updateStudyUseCase(newStudy.id, { testsOrder })

      const testCreationPromises: Promise<unknown>[] = []

      // Process specific test types
      tests.forEach((testData, index) => {
        if (testData.type === 'TREE_TEST') {
          const treeTestData = testData
          const treeTestRecord = {
            ...treeTestData,
            testId: newTests[index].id
          }

          testCreationPromises.push(createTreeTestUseCase(treeTestRecord))
        }
      })

      await Promise.all(testCreationPromises)

      return newStudy
    }),

  getStudiesByProjectId: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const studies = await getStudiesByProjectIdUseCase(input.projectId)
      return studies
    })
})
