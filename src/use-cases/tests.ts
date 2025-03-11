import { type TestInsert } from '@/server/db/schema'
import {
  createTest,
  createTests,
  getTestById,
  getTestsByStudyId
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
    throw new Error('Test not found')
  }
  return result
}

export const getTestsByStudyIdUseCase = async (studyId: string) => {
  const result = await getTestsByStudyId(studyId)
  if (!result) {
    throw new Error('Tests not found')
  }
  return result
}
