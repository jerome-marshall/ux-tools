import {
  createTest,
  createTestResult,
  createTests,
  deleteTestById,
  deleteTestResultsByIds,
  getTestById,
  getTestResultsByTestId,
  getTestsByStudyId,
  getTestsByTestIds,
  updateTest
} from '@/data-access/tests'
import { type Db } from '@/server/db'
import { type Test, type TestInsert, type TestResultInsert } from '@/server/db/schema'
import { NotFoundError } from '@/utils/error-utils'
import { SECTION_TYPE } from '@/utils/study-utils'
import { getPublicStudyByIdUseCase, getStudyByIdUseCase } from './studies'
import { getSurveyQuestionsByTestIdUseCase } from './survey-questions'
import { getTreeTestByTestIdUseCase } from './tree-tests'

export const createTestUseCase = async (test: TestInsert, trx?: Db) => {
  const result = await createTest(test, trx)
  if (!result) {
    throw new Error('Failed to create test')
  }
  return result
}

export const createTestsUseCase = async (tests: TestInsert[], trx?: Db) => {
  const result = await createTests(tests, trx)
  if (!result) {
    throw new Error('Failed to create tests')
  }
  return result
}

export const getTestByIdUseCase = async (id: string) => {
  const result = await getTestById(id)
  if (!result) {
    throw new NotFoundError('Failed to get test')
  }
  return result
}

export const getTestsByTestIdsUseCase = async (testIds: string[]) => {
  const result = await getTestsByTestIds(testIds)
  if (!result) {
    throw new NotFoundError('Failed to get tests')
  }
  return result
}

export const getTestsByStudyIdUseCase = async (userId: string, studyId: string) => {
  const study = await getStudyByIdUseCase(userId, studyId)
  const result = await getTestsByStudyId(study.id)
  return result
}

export const getPublicTestsByStudyIdUseCase = async (studyId: string) => {
  const study = await getPublicStudyByIdUseCase(studyId)
  const result = await getTestsByStudyId(study.id)
  return result
}

export const updateTestUseCase = async (id: string, test: Partial<Test>, trx?: Db) => {
  const result = await updateTest(id, test, trx)
  if (!result) {
    throw new Error('Failed to update test')
  }
  return result
}

export const deleteTestByIdUseCase = async (id: string, trx?: Db) => {
  const result = await deleteTestById(id, trx)
  if (!result) {
    throw new Error('Failed to delete test')
  }
  return result
}

export const createTestResultUseCase = async (testResult: TestResultInsert) => {
  const result = await createTestResult(testResult)
  if (!result) {
    throw new Error('Failed to create test result')
  }
  return result
}

export const getTestResultsByStudyIdUseCase = async (userId: string, studyId: string) => {
  const study = await getStudyByIdUseCase(userId, studyId)
  const tests = await getTestsByStudyIdUseCase(userId, studyId)
  const testResults = await Promise.all(
    tests.map(async test => {
      const results = await getTestResultsByTestId(test.id)

      if (test.type === SECTION_TYPE.TREE_TEST) {
        const treeTestData = await getTreeTestByTestIdUseCase(test.id)
        return {
          test: {
            ...test,
            data: treeTestData
          },
          results
        }
      } else if (test.type === SECTION_TYPE.SURVEY) {
        const surveyQuestionsData = await getSurveyQuestionsByTestIdUseCase(test.id)
        return {
          test: {
            ...test,
            data: {
              questions: surveyQuestionsData
            }
          },
          results
        }
      } else {
        throw new Error('Test type not supported')
      }
    })
  )
  return { study, resultsData: testResults }
}

export const deleteTestResultsByIdsUseCase = async (ids: string[], trx?: Db) => {
  const result = await deleteTestResultsByIds(ids, trx)
  if (result.length === 0) {
    throw new Error('No test results were deleted - IDs may not exist')
  }
  return result
}
