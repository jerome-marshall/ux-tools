import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { type TreeTest } from '@/server/db/schema'
import {
  insertStudyUseCase,
  getStudiesByProjectIdUseCase,
  updateStudyUseCase,
  getStudyByIdUseCase
} from '@/use-cases/studies'
import { createTestsUseCase, getTestsByStudyIdUseCase } from '@/use-cases/tests'
import { createTreeTestUseCase, getTreeTestByTestIdUseCase } from '@/use-cases/tree-tests'
import { combineTestsWithTreeTests } from '@/utils/transformers'
import { studyWithTestsInsertSchema } from '@/zod-schemas/study.schema'
import { z } from 'zod'

export const studiesRouter = createTRPCRouter({
  createStudy: publicProcedure
    .input(studyWithTestsInsertSchema)
    .mutation(async ({ input: { study, tests } }) => {
      const newStudy = await insertStudyUseCase(study)

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

  getStudyById: publicProcedure
    .input(z.object({ studyId: z.string() }))
    .query(async ({ input }) => {
      const study = await getStudyByIdUseCase(input.studyId)
      const tests = await getTestsByStudyIdUseCase(input.studyId)

      const testsData = (
        await Promise.all(
          tests.map(async test => {
            if (test.type === 'TREE_TEST') {
              const treeTest = await getTreeTestByTestIdUseCase(test.id)
              return treeTest
            }
          })
        )
      ).filter(Boolean) as TreeTest[]

      const combinedTests = combineTestsWithTreeTests(tests, testsData)

      return {
        study,
        tests: combinedTests
      }
    }),

  getStudiesByProjectId: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const studies = await getStudiesByProjectIdUseCase(input.projectId)
      return studies
    })
})
