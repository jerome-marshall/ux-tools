import {
  type TestResult,
  type TreeTestResult,
  type TreeTest
} from '@/server/db/schema/schema'

import { type Test } from '@/server/db/schema/schema'
import { type EntireTreeTestResult } from '@/types'
import { correctPathSchema, treeItemSchema } from '@/zod-schemas/tree.schema'
import { z } from 'zod'
export const combineTestWithTreeTest = (test: Test, treeTest: TreeTest) => {
  const { name, type, ...restTest } = test
  const { treeStructure, taskInstructions, correctPaths, ...restTreeTest } = treeTest

  const trees = z.array(treeItemSchema).safeParse(treeStructure)
  if (!trees.success) {
    console.log('🚀 ~ combineTestWithTreeTest ~ tree:', treeStructure)
    throw new Error('Invalid tree structure')
  }

  const paths = z.array(correctPathSchema).safeParse(correctPaths)
  if (!paths.success) {
    console.log('🚀 ~ combineTestWithTreeTest ~ correctPaths:', correctPaths)
    throw new Error('Invalid correct paths')
  }

  return {
    name,
    type,
    treeStructure: trees.data,
    taskInstructions,
    correctPaths: paths.data,
    sectionData: {
      sectionId: restTreeTest.id,
      testId: restTest.id,
      studyId: restTest.studyId,
      createdAt: restTest.createdAt,
      updatedAt: restTest.updatedAt
    }
  }
}

export const combineTestsWithTreeTests = (tests: Test[], treeTests: TreeTest[]) => {
  return tests.map(test => {
    const treeTest = treeTests.find(treeTest => treeTest.testId === test.id)

    if (!treeTest) {
      throw new Error('Tree test not found')
    }

    return combineTestWithTreeTest(test, treeTest)
  })
}

export const combineTestResultsWithTreeTestResults = (
  testResults: TestResult[],
  treeTestResults: TreeTestResult[]
): EntireTreeTestResult[] => {
  const entireTestResults = []
  for (const result of treeTestResults) {
    const testResult = testResults.find(
      testResult => testResult.id === result.testResultId
    )

    if (!testResult) continue

    const entireTestResult = {
      ...result,
      testData: testResult
    }

    entireTestResults.push(entireTestResult)
  }

  return entireTestResults
}
