import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import {
  type SurveyQuestionResult,
  surveyQuestionResultInsertSchema,
  type TreeTestResult,
  treeTestResultInsertSchema
} from '@/server/db/schema'
import { updateStudyUseCase } from '@/use-cases/studies'
import {
  insertSurveyQuestionResultsUseCase,
  insertSurveyQuestionResultUseCase
} from '@/use-cases/survey-questions'
import {
  createTestResultUseCase,
  getTestByIdUseCase,
  getTestResultsByStudyIdUseCase
} from '@/use-cases/tests'
import {
  createTreeTestResultUseCase,
  getTreeTestResultsByTestResultIdsUseCase
} from '@/use-cases/tree-tests'
import { SECTION_TYPE } from '@/utils/study-utils'
import { testTypes } from '@/zod-schemas/test.schema'
import { z } from 'zod'

export const testsRouter = createTRPCRouter({
  createTestResult: protectedProcedure
    .input(
      z
        .object({
          testType: z.enum(testTypes),
          testId: z.string(),
          userId: z.string(),
          totalDurationMs: z.number(),
          taskDurationMs: z.number()
        })
        .and(
          z.discriminatedUnion('testType', [
            z.object({
              testType: z.literal(SECTION_TYPE.TREE_TEST),
              treeTestResult: treeTestResultInsertSchema.omit({ testResultId: true })
            }),
            z.object({
              testType: z.literal(SECTION_TYPE.SURVEY),
              surveyQuestionsResults: surveyQuestionResultInsertSchema
                .omit({
                  testResultId: true
                })
                .array()
            })
          ])
        )
    )
    .mutation(async ({ input, ctx: { userId } }) => {
      const newTestResult = await createTestResultUseCase({
        testId: input.testId,
        userId: input.userId,
        totalDurationMs: input.totalDurationMs,
        taskDurationMs: input.taskDurationMs
      })

      const test = await getTestByIdUseCase(input.testId)
      await updateStudyUseCase(userId, test.studyId, {
        hasTestResults: true
      })

      if (input.testType === SECTION_TYPE.TREE_TEST) {
        const newTreeTestResult = await createTreeTestResultUseCase({
          passed: input.treeTestResult.passed,
          testId: input.treeTestResult.testId,
          testResultId: newTestResult.id,
          treeTestClicks: input.treeTestResult.treeTestClicks
        })

        return {
          testType: input.testType,
          testResult: newTestResult,
          treeTestResult: newTreeTestResult
        }
      } else if (input.testType === SECTION_TYPE.SURVEY) {
        const newSurveyQuestionsResults = await insertSurveyQuestionResultsUseCase(
          input.surveyQuestionsResults.map(result => ({
            ...result,
            testResultId: newTestResult.id
          }))
        )

        return {
          testType: input.testType,
          testResult: newTestResult,
          surveyQuestionsResults: newSurveyQuestionsResults
        }
      }
    }),

  getTestResults: protectedProcedure
    .input(z.object({ studyId: z.string() }))
    .query(async ({ input, ctx: { userId } }) => {
      const tests = await getTestResultsByStudyIdUseCase(userId, input.studyId)
      return tests
    }),

  getTreeTestResults: protectedProcedure
    .input(z.object({ testResultIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      const treeTestResults = await getTreeTestResultsByTestResultIdsUseCase(
        input.testResultIds
      )
      return treeTestResults
    })
})
