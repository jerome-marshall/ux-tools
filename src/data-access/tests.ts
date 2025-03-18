import { db } from '@/server/db'
import { tests, type Test, type TestInsert } from '@/server/db/schema'
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

export const getTestsByStudyId = async (studyId: string) => {
  const result = await db.query.tests.findMany({
    where: (test, { eq }) => eq(test.studyId, studyId)
  })
  return result
}

// Add an update function for tests
export const updateTest = async (id: string, test: Partial<Test>) => {
  const [result] = await db.update(tests).set(test).where(eq(tests.id, id)).returning()
  return result
}
