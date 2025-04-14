import { createTransaction } from '@/data-access/utils'
import { generateId } from '@/lib/utils'
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { type TestType, type TreeTest } from '@/server/db/schema/schema'
import {
  getStudiesByProjectIdUseCase,
  getStudyByIdUseCase,
  insertStudyUseCase,
  updateStudyUseCase
} from '@/use-cases/studies'
import {
  createTestsUseCase,
  createTestUseCase,
  deleteTestByIdUseCase,
  getTestsByStudyIdUseCase,
  updateTestUseCase
} from '@/use-cases/tests'
import {
  createTreeTestUseCase,
  getTreeTestByTestIdUseCase,
  updateTreeTestUseCase,
  deleteTreeTestByTestIdUseCase
} from '@/use-cases/tree-tests'
import { combineTestsWithTreeTests } from '@/utils/transformers'
import { studyWithTestsInsertSchema } from '@/zod-schemas/study.schema'
import { z } from 'zod'

export const studiesRouter = createTRPCRouter({
  createStudy: publicProcedure
    .input(studyWithTestsInsertSchema)
    .mutation(async ({ input: { study, tests } }) => {
      const newStudy = await createTransaction(async trx => {
        const insertedStudy = await insertStudyUseCase(study, trx)

        // Process each test based on its type
        const testRecords = tests.map(testData => {
          const baseTest = {
            id: testData.testId,
            type: testData.type,
            studyId: insertedStudy.id,
            name: testData.name
          }

          return baseTest
        })

        const newTests = await createTestsUseCase(testRecords, trx)
        const testsOrder = newTests.map(test => test.id)

        await updateStudyUseCase(insertedStudy.id, { testsOrder }, trx)

        await Promise.all(
          tests.map((testData, index) => {
            if (testData.type === 'TREE_TEST') {
              return createTreeTestUseCase(
                {
                  id: testData.sectionId,
                  testId: newTests[index].id,
                  treeStructure: testData.treeStructure,
                  taskInstructions: testData.taskInstructions,
                  correctPaths: testData.correctPaths
                },
                trx
              )
            }
            return Promise.resolve()
          })
        )

        return insertedStudy
      })

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

      const finalUpdatedStudy = await createTransaction(async trx => {
        // 2. Update the main study information
        const updatedStudy = await updateStudyUseCase(
          studyId,
          {
            name: study.name,
            projectId: study.projectId
          },
          trx
        )

        // Delete tests that are no longer in the incoming tests
        const incomingTestIds = new Set(tests.map(test => test.testId))
        const testsToDelete = existingTests.filter(test => !incomingTestIds.has(test.id))
        const deletePromises = testsToDelete.map(async test => {
          // For tree tests, explicitly delete the tree test record first
          if (test.type === 'TREE_TEST') {
            await deleteTreeTestByTestIdUseCase(test.id, trx)
          }
          return deleteTestByIdUseCase(test.id, trx)
        })
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises)
        }

        const updatePromises = tests.map(async (testData, index) => {
          // Use the existing test ID if available, or create a new test
          const existingTest = existingTestMap.get(testData.testId)

          if (existingTest) {
            // Update existing test
            const baseTest = {
              type: testData.type,
              name: testData.name
            }

            await updateTestUseCase(existingTest.id, baseTest, trx)

            // Update related test type data
            if (testData.type === 'TREE_TEST') {
              const treeTest = await getTreeTestByTestIdUseCase(existingTest.id)

              if (treeTest) {
                // Update existing tree test
                await updateTreeTestUseCase(
                  treeTest.id,
                  {
                    treeStructure: testData.treeStructure,
                    taskInstructions: testData.taskInstructions,
                    correctPaths: testData.correctPaths
                  },
                  trx
                )
              } else {
                // If tree test doesn't exist but should, create it
                await createTreeTestUseCase(
                  {
                    ...testData,
                    testId: existingTest.id,
                    id: testData.sectionId
                  },
                  trx
                )
              }
            }

            return existingTest.id
          } else {
            // Create new test (this branch would be executed if tests were added)
            // Similar to the createStudy logic
            const newTest = await createTestUseCase(
              {
                id: testData.testId,
                type: testData.type,
                studyId: studyId,
                name: testData.name
              },
              trx
            )

            if (testData.type === 'TREE_TEST') {
              await createTreeTestUseCase(
                {
                  ...testData,
                  testId: newTest.id,
                  id: testData.sectionId
                },
                trx
              )
            }

            return newTest.id
          }
        })

        // 4. Update the testsOrder array with the latest order
        const testIds = await Promise.all(updatePromises)
        await updateStudyUseCase(studyId, { testsOrder: testIds }, trx)

        return updatedStudy
      })

      return finalUpdatedStudy
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
            // Handle other test types here when implemented
            return null
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
    }),

  duplicateStudy: publicProcedure
    .input(
      z.object({ studyId: z.string(), newStudyName: z.string(), projectId: z.string() })
    )
    .mutation(async ({ input }) => {
      // Fetch original study and tests
      const study = await getStudyByIdUseCase(input.studyId)
      const tests = await getTestsByStudyIdUseCase(input.studyId)

      // Create the new study
      const newStudy = await insertStudyUseCase({
        id: generateId(),
        name: input.newStudyName,
        projectId: input.projectId,
        testsOrder: [] // We'll update this after creating tests
      })

      const testIdMap = new Map<string, string>()
      const newTestRecords = tests.map(test => {
        const newId = generateId()
        testIdMap.set(test.id, newId)

        return {
          id: newId,
          type: test.type,
          studyId: newStudy.id,
          name: test.name
        }
      })

      const newTestsOrder = study.testsOrder
        .map(oldId => testIdMap.get(oldId) ?? '')
        .filter(id => id !== '')
      await updateStudyUseCase(newStudy.id, { testsOrder: newTestsOrder })

      const newTests = await createTestsUseCase(newTestRecords)

      const testsByType = new Map<TestType, Array<{ ogId: string; newId: string }>>()
      tests.forEach((test, index) => {
        if (!testsByType.has(test.type)) {
          testsByType.set(test.type, [])
        }
        testsByType.get(test.type)!.push({ ogId: test.id, newId: newTests[index].id })
      })

      const treeTestPromises =
        testsByType
          .get('TREE_TEST')
          ?.map(async ({ ogId, newId }) => {
            const treeTest = await getTreeTestByTestIdUseCase(ogId)
            if (treeTest) {
              return createTreeTestUseCase({
                ...treeTest,
                id: generateId(),
                testId: newId
              })
            }
          })
          .filter(Boolean) ?? []
      await Promise.all(treeTestPromises)

      return newStudy
    })
})
