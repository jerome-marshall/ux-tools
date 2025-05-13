import { createTransaction } from '@/data-access/utils'
import { generateId } from '@/lib/utils'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { type TreeTest } from '@/server/db/schema'
import { getProjectsUseCase } from '@/use-cases/projects'
import {
  getStudiesByProjectIdUseCase,
  getStudyByIdUseCase,
  getPublicStudyByIdUseCase,
  insertStudyUseCase,
  updateStudyUseCase,
  getAllStudiesUseCase
} from '@/use-cases/studies'
import {
  createTestsUseCase,
  createTestUseCase,
  deleteTestByIdUseCase,
  getTestsByStudyIdUseCase,
  getPublicTestsByStudyIdUseCase,
  updateTestUseCase
} from '@/use-cases/tests'
import {
  createTreeTestUseCase,
  deleteTreeTestByTestIdUseCase,
  getTreeTestByTestIdUseCase,
  updateTreeTestUseCase
} from '@/use-cases/tree-tests'
import { combineTestsWithTreeTests } from '@/utils/transformers'
import { studyWithTestsInsertSchema } from '@/zod-schemas/study.schema'
import { type TestType } from '@/zod-schemas/test.schema'
import { z } from 'zod'

export const studiesRouter = createTRPCRouter({
  createStudy: protectedProcedure
    .input(studyWithTestsInsertSchema)
    .mutation(async ({ input: { study, tests }, ctx: { userId } }) => {
      const newStudy = await createTransaction(async trx => {
        const insertedStudy = await insertStudyUseCase(userId, study, trx)

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

        await updateStudyUseCase(userId, insertedStudy.id, { testsOrder }, trx)

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

  updateStudy: protectedProcedure
    .input(
      z.object({
        studyId: z.string(),
        data: studyWithTestsInsertSchema
      })
    )
    .mutation(async ({ input: { studyId, data }, ctx: { userId } }) => {
      const { study, tests } = data

      // 1. Get existing tests for this study
      const existingTests = await getTestsByStudyIdUseCase(userId, studyId)
      const existingTestMap = new Map(existingTests.map(test => [test.id, test]))

      const finalUpdatedStudy = await createTransaction(async trx => {
        // 2. Update the main study information
        const updatedStudy = await updateStudyUseCase(
          userId,
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

        const updatePromises = tests.map(async testData => {
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
        await updateStudyUseCase(userId, studyId, { testsOrder: testIds }, trx)

        return updatedStudy
      })

      return finalUpdatedStudy
    }),

  getStudyById: protectedProcedure
    .input(z.object({ studyId: z.string() }))
    .query(async ({ input, ctx: { userId } }) => {
      const study = await getStudyByIdUseCase(userId, input.studyId)
      const tests = await getTestsByStudyIdUseCase(userId, input.studyId)

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

  getPublicStudyById: publicProcedure
    .input(z.object({ studyId: z.string() }))
    .query(async ({ input }) => {
      const study = await getPublicStudyByIdUseCase(input.studyId)
      const tests = await getPublicTestsByStudyIdUseCase(input.studyId)

      const testsData = (
        await Promise.all(
          tests.map(async (test: { id: string; type: TestType }) => {
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

  getStudiesByProjectId: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx: { userId } }) => {
      const studies = await getStudiesByProjectIdUseCase(userId, input.projectId)
      return studies
    }),

  duplicateStudy: protectedProcedure
    .input(
      z.object({ studyId: z.string(), newStudyName: z.string(), projectId: z.string() })
    )
    .mutation(async ({ input, ctx: { userId } }) => {
      // Fetch original study and tests
      const study = await getStudyByIdUseCase(userId, input.studyId)
      const tests = await getTestsByStudyIdUseCase(userId, input.studyId)

      // Create the new study
      const newStudy = await insertStudyUseCase(userId, {
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
      await updateStudyUseCase(userId, newStudy.id, { testsOrder: newTestsOrder })

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
    }),

  updateStudyStatus: protectedProcedure
    .input(z.object({ studyId: z.string(), isActive: z.boolean() }))
    .mutation(async ({ input, ctx: { userId } }) => {
      const { studyId, isActive } = input
      const updatedStudy = await updateStudyUseCase(userId, studyId, { isActive })
      return updatedStudy
    }),

  updateSharedStatus: protectedProcedure
    .input(z.object({ studyId: z.string(), isShared: z.boolean() }))
    .mutation(async ({ input, ctx: { userId } }) => {
      const { studyId, isShared } = input
      const updatedStudy = await updateStudyUseCase(userId, studyId, { isShared })
      return updatedStudy
    }),

  getAllStudiesWithProject: protectedProcedure
    .input(
      z.object({
        onlyActiveProjects: z.boolean().optional().default(true),
        getAllProjects: z.boolean().optional().default(false)
      })
    )
    .query(async ({ input, ctx: { userId } }) => {
      const projects = await getProjectsUseCase(userId, {
        active: input.onlyActiveProjects,
        getAll: input.getAllProjects
      })

      const projectsMap = new Map(projects.map(project => [project.id, project]))
      const projectIds = new Set(projects.map(project => project.id))

      const studies = await getAllStudiesUseCase(userId)
      const studiesWithProject = studies
        .filter(study => projectIds.has(study.projectId))
        .map(study => ({
          ...study,
          project: projectsMap.get(study.projectId)!
        }))

      return studiesWithProject
    })
})
