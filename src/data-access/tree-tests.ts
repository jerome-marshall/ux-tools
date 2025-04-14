import { db } from '@/server/db'
import {
  treeTestResults,
  treeTests,
  type TreeTestInsert,
  type TreeTestResultInsert
} from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export const createTreeTest = async (treeTest: TreeTestInsert, trx = db) => {
  const [result] = await trx.insert(treeTests).values(treeTest).returning()
  return result
}

export const getTreeTestByTestId = async (testId: string) => {
  const result = await db.query.treeTests.findFirst({
    where: (fields, { eq }) => eq(fields.testId, testId)
  })
  return result
}

export const getTreeTestsByTestIds = async (testIds: string[]) => {
  const result = await db.query.treeTests.findMany({
    where: (fields, { inArray }) => inArray(fields.testId, testIds)
  })
  return result
}

// Add an update function for tree tests
export const updateTreeTest = async (
  id: string,
  treeTest: Partial<TreeTestInsert>,
  trx = db
) => {
  const [result] = await trx
    .update(treeTests)
    .set(treeTest)
    .where(eq(treeTests.id, id))
    .returning()
  return result
}

export const deleteTreeTestByTestId = async (testId: string, trx = db) => {
  const [result] = await trx
    .delete(treeTests)
    .where(eq(treeTests.testId, testId))
    .returning()
  return result
}

export const createTreeTestResult = async (treeTestResult: TreeTestResultInsert) => {
  const [result] = await db.insert(treeTestResults).values(treeTestResult).returning()
  return result
}

export const getTreeTestResultsByTestResultIds = async (testResultIds: string[]) => {
  const result = await db.query.treeTestResults.findMany({
    where: (fields, { inArray }) => inArray(fields.testResultId, testResultIds)
  })
  return result
}
