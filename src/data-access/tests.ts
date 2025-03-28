import { db } from '@/server/db'
import {
  testResults,
  tests,
  type Test,
  type TestInsert,
  type TestResultInsert
} from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export const createTest = async (test: TestInsert) => {
  const [result] = await db.insert(tests).values(test).returning()
  return result
}

export const createTests = async (testsData: TestInsert[]) => {
  const result = await db.insert(tests).values(testsData).returning()
  return result
}

export const getTestById = async (id: string) => {
  const result = await db.query.tests.findFirst({
    where: (test, { eq }) => eq(test.id, id)
  })
  return result
}

export const getTestsByTestIds = async (testIds: string[]) => {
  const result = await db.query.tests.findMany({
    where: (test, { inArray }) => inArray(test.id, testIds)
  })
  return result
}

export const getTestsByStudyId = async (studyId: string) => {
  const result = await db.query.tests.findMany({
    where: (test, { eq }) => eq(test.studyId, studyId)
  })
  return result
}

export const updateTest = async (id: string, test: Partial<Test>) => {
  const [result] = await db.update(tests).set(test).where(eq(tests.id, id)).returning()
  return result
}

export const createTestResult = async (testResult: TestResultInsert) => {
  const [result] = await db.insert(testResults).values(testResult).returning()
  return result
}

export const getTestResultsByTestId = async (testId: string) => {
  const result = await db.query.testResults.findMany({
    where: (testResult, { eq }) => eq(testResult.testId, testId)
  })
  return result
}
