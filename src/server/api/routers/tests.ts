import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
import { testTypes, treeTestResultInsertSchema } from '@/server/db/schema'
import {
  createTestResultUseCase,
  getTestResultsByStudyIdUseCase
} from '@/use-cases/tests'
import { createTreeTestResultUseCase } from '@/use-cases/tree-tests'
import { z } from 'zod'

export const testsRouter = createTRPCRouter({
  createTestResult: publicProcedure
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
              testType: z.literal('TREE_TEST'),
              treeTestResult: treeTestResultInsertSchema.omit({ testResultId: true })
            })
          ])
        )
    )
    .mutation(async ({ input }) => {
      const newTestResult = await createTestResultUseCase({
        testId: input.testId,
        userId: input.userId,
        totalDurationMs: input.totalDurationMs,
        taskDurationMs: input.taskDurationMs
      })

      const newTreeTestResult = await createTreeTestResultUseCase({
        passed: input.treeTestResult.passed,
        testId: input.treeTestResult.testId,
        testResultId: newTestResult.id,
        treeTestClicks: input.treeTestResult.treeTestClicks
      })
      return {
        testResult: newTestResult,
        treeTestResult: newTreeTestResult
      }
    }),

  getTestResults: publicProcedure
    .input(z.object({ studyId: z.string() }))
    .query(async ({ input }) => {
      const tests = await getTestResultsByStudyIdUseCase(input.studyId)
      return tests
    })
})
