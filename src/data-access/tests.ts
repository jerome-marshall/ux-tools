import { db } from '@/server/db'
import { type TestInsert, tests } from '@/server/db/schema'

export const createTest = async (test: TestInsert) => {
  const result = await db.insert(tests).values(test).returning()
  return result[0]
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
