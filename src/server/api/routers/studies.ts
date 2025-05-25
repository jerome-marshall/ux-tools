import { createTransaction } from '@/data-access/utils'
import { generateId } from '@/lib/utils'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { getProjectsUseCase } from '@/use-cases/projects'
import {
  getAllStudiesUseCase,
  getPublicStudyByIdUseCase,
  getStudiesByProjectIdUseCase,
  getStudyByIdUseCase,
  insertStudyUseCase,
  updateStudyUseCase
} from '@/use-cases/studies'
import {
  deleteSurveyQuestionsByIdsUseCase,
  deleteSurveyQuestionsByTestIdUseCase,
  getSurveyQuestionsByTestIdUseCase,
  insertSurveyQuestionsUseCase,
  insertSurveyQuestionUseCase,
  updateSurveyQuestionByIdUseCase
} from '@/use-cases/survey-questions'
import {
  createTestsUseCase,
  createTestUseCase,
  deleteTestByIdUseCase,
  getPublicTestsByStudyIdUseCase,
  getTestsByStudyIdUseCase,
  updateTestUseCase
} from '@/use-cases/tests'
import {
  createTreeTestUseCase,
  deleteTreeTestByTestIdUseCase,
  getTreeTestByTestIdUseCase,
  getTreeTestsByTestIdsUseCase,
  updateTreeTestUseCase
} from '@/use-cases/tree-tests'
import { SECTION_TYPE } from '@/utils/study-utils'
import {
  combineTestsWithTreeTests,
  combineTestWithSurveyQuestions
} from '@/utils/transformers'
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
            name: testData.name,
            randomized: testData.randomized
          }

          return baseTest
        })

        const newTests = await createTestsUseCase(testRecords, trx)
        const testsOrder = newTests.map(test => test.id)

        await updateStudyUseCase(userId, insertedStudy.id, { testsOrder }, trx)

        await Promise.all(
          tests.map((testData, index) => {
            const newTestId = newTests[index].id

            if (testData.type === SECTION_TYPE.TREE_TEST) {
              return createTreeTestUseCase(
                {
                  id: testData.sectionId,
                  testId: newTestId,
                  treeStructure: testData.treeStructure,
                  taskInstructions: testData.taskInstructions,
                  correctPaths: testData.correctPaths
                },
                trx
              )
            }
            if (testData.type === SECTION_TYPE.SURVEY) {
              return insertSurveyQuestionsUseCase(
                testData.questions.map(question => ({
                  ...question,
                  testId: newTestId
                })),
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
          if (test.type === SECTION_TYPE.TREE_TEST) {
            await deleteTreeTestByTestIdUseCase(test.id, trx)
          }
          if (test.type === SECTION_TYPE.SURVEY) {
            await deleteSurveyQuestionsByTestIdUseCase(test.id, trx)
          }
          return deleteTestByIdUseCase(test.id, trx)
        })
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises)
        }

        // map through tests and update or create them and return the test ids
        const updatePromises = tests.map(async testData => {
          // Use the existing test ID if available, or create a new test
          const existingTest = existingTestMap.get(testData.testId)

          if (existingTest) {
            // Update existing test
            const baseTest = {
              type: testData.type,
              name: testData.name,
              randomized: testData.randomized
            }

            const updatedTest = await updateTestUseCase(existingTest.id, baseTest, trx)

            // Update related test type data
            if (testData.type === SECTION_TYPE.TREE_TEST) {
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
                    testId: existingTest.id,
                    id: testData.sectionId,
                    correctPaths: testData.correctPaths,
                    taskInstructions: testData.taskInstructions,
                    treeStructure: testData.treeStructure
                  },
                  trx
                )
              }
            }

            if (testData.type === SECTION_TYPE.SURVEY && testData.questions.length > 0) {
              const surveyQuestions = await getSurveyQuestionsByTestIdUseCase(
                existingTest.id
              )

              // delete questions that are no longer in the incoming questions
              const incomingQuestionIds = new Set(
                testData.questions.map(question => question.id)
              )
              const questionsToDelete = surveyQuestions.filter(
                question => !incomingQuestionIds.has(question.id)
              )
              if (questionsToDelete.length > 0) {
                await deleteSurveyQuestionsByIdsUseCase(
                  questionsToDelete.map(question => question.id),
                  trx
                )
              }

              const surveyQuestionsMap = new Map(
                surveyQuestions.map(question => [question.id, question])
              )

              const surveyQuestionsToUpdate = testData.questions.map(question => {
                const existingQuestion = surveyQuestionsMap.get(question.id)

                if (existingQuestion) {
                  return updateSurveyQuestionByIdUseCase(
                    question.id,
                    {
                      ...existingQuestion,
                      ...question
                    },
                    trx
                  )
                }

                return insertSurveyQuestionUseCase(question, trx)
              })

              await Promise.all(surveyQuestionsToUpdate)
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
                name: testData.name,
                randomized: testData.randomized
              },
              trx
            )

            if (testData.type === SECTION_TYPE.TREE_TEST) {
              await createTreeTestUseCase(
                {
                  ...testData,
                  testId: newTest.id,
                  id: testData.sectionId
                },
                trx
              )
            }

            if (testData.type === SECTION_TYPE.SURVEY) {
              await insertSurveyQuestionsUseCase(
                testData.questions.map(question => ({
                  ...question,
                  testId: newTest.id
                })),
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

      const treeTests = tests.filter(test => test.type === SECTION_TYPE.TREE_TEST)
      const surveyTests = tests.filter(test => test.type === SECTION_TYPE.SURVEY)

      const treeTestsData = await getTreeTestsByTestIdsUseCase(
        treeTests.map(test => test.id)
      )
      const combinedTests = combineTestsWithTreeTests(treeTests, treeTestsData).filter(
        Boolean
      )

      const combinedSurveyTests = await Promise.all(
        surveyTests.map(async test => {
          const surveyQuestions = await getSurveyQuestionsByTestIdUseCase(test.id)
          return combineTestWithSurveyQuestions(test, surveyQuestions)
        })
      )

      return {
        study,
        tests: [...combinedTests, ...combinedSurveyTests]
      }
    }),

  getPublicStudyById: publicProcedure
    .input(z.object({ studyId: z.string() }))
    .query(async ({ input }) => {
      const study = await getPublicStudyByIdUseCase(input.studyId)
      const tests = await getPublicTestsByStudyIdUseCase(input.studyId)

      const treeTests = tests.filter(test => test.type === SECTION_TYPE.TREE_TEST)
      const surveyTests = tests.filter(test => test.type === SECTION_TYPE.SURVEY)

      const treeTestsData = await getTreeTestsByTestIdsUseCase(
        treeTests.map(test => test.id)
      )
      const combinedTests = combineTestsWithTreeTests(treeTests, treeTestsData).filter(
        Boolean
      )

      const combinedSurveyTests = await Promise.all(
        surveyTests.map(async test => {
          const surveyQuestions = await getSurveyQuestionsByTestIdUseCase(test.id)
          return combineTestWithSurveyQuestions(test, surveyQuestions)
        })
      )

      return {
        study,
        tests: [...combinedTests, ...combinedSurveyTests]
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
          .get(SECTION_TYPE.TREE_TEST)
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
