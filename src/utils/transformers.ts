import {
  type SurveyQuestionResult,
  type SurveyQuestion,
  type Test_SurveyType,
  type Test_TreeTestType,
  type TestResult,
  type TreeTest,
  type TreeTestResult
} from '@/server/db/schema'

import {
  type SurveyQuestionWithAnswers,
  type CombinedTestData,
  type EntireTreeTestResult
} from '@/types'
import { correctPathSchema, treeItemSchema } from '@/zod-schemas/tree.schema'
import { z } from 'zod'

export const combineTestWithTreeTest = (
  test: Test_TreeTestType,
  treeTest: TreeTest
): CombinedTestData => {
  const { name, type, ...restTest } = test
  const { treeStructure, taskInstructions, correctPaths, ...restTreeTest } = treeTest

  const trees = z.array(treeItemSchema).safeParse(treeStructure)
  if (!trees.success) {
    console.error('🚀 ~ combineTestWithTreeTest ~ tree:', treeStructure)
    throw new Error('Invalid tree structure')
  }

  const paths = z.array(correctPathSchema).safeParse(correctPaths)
  if (!paths.success) {
    console.error('🚀 ~ combineTestWithTreeTest ~ correctPaths:', correctPaths)
    throw new Error('Invalid correct paths')
  }

  return {
    id: restTreeTest.id,
    testId: restTest.id,
    studyId: restTest.studyId,
    name,
    type,
    randomized: restTest.randomized,
    treeStructure: trees.data,
    taskInstructions,
    correctPaths: paths.data,
    createdAt: restTest.createdAt,
    updatedAt: restTest.updatedAt
  }
}

export const combineTestsWithTreeTests = (
  tests: Test_TreeTestType[],
  treeTests: TreeTest[]
) => {
  return tests.map(test => {
    const treeTest = treeTests.find(treeTest => treeTest.testId === test.id)

    if (!treeTest) {
      return null
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

export const combineTestWithSurveyQuestions = (
  test: Test_SurveyType,
  surveyQuestions: SurveyQuestion[]
): CombinedTestData => {
  // id is same as testId as it doesnt have a separate table
  return {
    id: test.id,
    testId: test.id,
    studyId: test.studyId,
    name: test.name,
    type: test.type,
    randomized: test.randomized,
    questions: surveyQuestions,
    createdAt: test.createdAt,
    updatedAt: test.updatedAt
  }
}

export const combineSurveryQuestionsWithAnswers = (
  surveyResults: SurveyQuestionResult[],
  surveyQuestions: SurveyQuestion[]
): SurveyQuestionWithAnswers[] => {
  const entireTestResults = []

  for (const question of surveyQuestions) {
    const answers = surveyResults.filter(answer => answer.questionId === question.id)

    const result = {
      ...question,
      answers
    }

    entireTestResults.push(result)
  }

  return entireTestResults
}
