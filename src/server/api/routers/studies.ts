import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { type TreeTest } from '@/server/db/schema'
import {
  insertStudyUseCase,
  getStudiesByProjectIdUseCase,
  updateStudyUseCase,
  getStudyByIdUseCase
} from '@/use-cases/studies'
import {
  createTestsUseCase,
  createTestUseCase,
  getTestsByStudyIdUseCase,
  updateTestUseCase
} from '@/use-cases/tests'
import {
  createTreeTestUseCase,
  getTreeTestByTestIdUseCase,
  updateTreeTestUseCase
} from '@/use-cases/tree-tests'
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
          id: testData.testId,
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
            id: testData.sectionId,
            testId: newTests[index].id
          }

          testCreationPromises.push(createTreeTestUseCase(treeTestRecord))
        }
      })

      await Promise.all(testCreationPromises)

      return newStudy
    }),

  // Improved mutation for updating studies
  updateStudy: publicProcedure
    .input(
      z.object({
        studyId: z.string(),
        data: studyWithTestsInsertSchema
      })
    )
    .mutation(async ({ input: { studyId, data } }) => {
      const { study, tests } = data

      // 1. Get existing tests for this study
      const existingTests = await getTestsByStudyIdUseCase(studyId)
      const existingTestMap = new Map(existingTests.map(test => [test.id, test]))

      // 2. Update the main study information
      const updatedStudy = await updateStudyUseCase(studyId, {
        name: study.name,
        projectId: study.projectId
      })

      // 3. Process tests - this is a simplified implementation for now
      // In a real app, you'd need to detect new tests, deleted tests, and updated tests

      // For now, we're assuming all tests are being updated (not added/removed)
      // In a complete implementation, you'd handle test creation/deletion as well
      const updatePromises = tests.map(async (testData, index) => {
        // Use the existing test ID if available, or create a new test
        const existingTest = existingTestMap.get(testData.testId)

        if (existingTest) {
          // Update existing test
          const baseTest = {
            type: testData.type,
            name: testData.name
          }

          await updateTestUseCase(existingTest.id, baseTest)

          // Update related test type data
          if (testData.type === 'TREE_TEST') {
            const treeTest = await getTreeTestByTestIdUseCase(existingTest.id)

            if (treeTest) {
              // Update existing tree test
              await updateTreeTestUseCase(treeTest.id, {
                treeStructure: testData.treeStructure,
                taskInstructions: testData.taskInstructions,
                correctPaths: testData.correctPaths
              })
            }
          }

          return existingTest.id
        } else {
          // Create new test (this branch would be executed if tests were added)
          // Similar to the createStudy logic
          const newTest = await createTestUseCase({
            id: testData.testId,
            type: testData.type,
            studyId: studyId,
            name: testData.name
          })

          if (testData.type === 'TREE_TEST') {
            await createTreeTestUseCase({
              ...testData,
              testId: newTest.id,
              id: testData.sectionId
            })
          }

          return newTest.id
        }
      })

      // 4. Update the testsOrder array with the latest order
      const testIds = await Promise.all(updatePromises)
      await updateStudyUseCase(studyId, { testsOrder: testIds })

      return updatedStudy
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
