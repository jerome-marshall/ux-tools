import {
  type TestResultInsert,
  type Test,
  type TestInsert,
  type TreeTest
} from '@/server/db/schema'
import {
  createTest,
  createTestResult,
  createTests,
  deleteTestById,
  getTestById,
  getTestResultsByTestId,
  getTestsByStudyId,
  getTestsByTestIds,
  updateTest
} from '@/data-access/tests'
import { getStudyByIdUseCase, getPublicStudyByIdUseCase } from './studies'
import { getTreeTestByTestIdUseCase } from './tree-tests'
import { type Db } from '@/server/db'
import { NotFoundError } from '@/utils/error-utils'
import { SECTION_TYPE } from '@/utils/study-utils'

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

      let testData: TreeTest | null = null
      if (test.type === SECTION_TYPE.TREE_TEST) {
        testData = await getTreeTestByTestIdUseCase(test.id)
      } else {
        throw new Error('Test type not supported')
      }

      return {
        test: {
          ...test,
          data: testData
        },
        results
      }
    })
  )
  return { study, resultsData: testResults }
}
