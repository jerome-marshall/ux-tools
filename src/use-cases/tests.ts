import { type TestResultInsert, type Test, type TestInsert } from '@/server/db/schema'
import {
  createTest,
  createTestResult,
  createTests,
  getTestById,
  getTestResultsByTestId,
  getTestsByStudyId,
  getTestsByTestIds,
  updateTest
} from '@/data-access/tests'

export const createTestUseCase = async (test: TestInsert) => {
  const result = await createTest(test)
  if (!result) {
    throw new Error('Failed to create test')
  }
  return result
}

export const createTestsUseCase = async (tests: TestInsert[]) => {
  const result = await createTests(tests)
  if (!result) {
    throw new Error('Failed to create tests')
  }
  return result
}

export const getTestByIdUseCase = async (id: string) => {
  const result = await getTestById(id)
  if (!result) {
    throw new Error('Failed to get test')
  }
  return result
}

export const getTestsByTestIdsUseCase = async (testIds: string[]) => {
  const result = await getTestsByTestIds(testIds)
  if (!result) {
    throw new Error('Failed to get tests')
  }
  return result
}

export const getTestsByStudyIdUseCase = async (studyId: string) => {
  const result = await getTestsByStudyId(studyId)
  return result
}

export const updateTestUseCase = async (id: string, test: Partial<Test>) => {
  const result = await updateTest(id, test)
  if (!result) {
    throw new Error('Failed to update test')
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

export const getTestResultsByStudyIdUseCase = async (studyId: string) => {
  const tests = await getTestsByStudyId(studyId)
  const testResults = await Promise.all(
    tests.map(async test => {
      const result = await getTestResultsByTestId(test.id)
      return result
    })
  )
  return testResults
}
