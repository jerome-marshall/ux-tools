import { db } from '@/server/db'
import { type TreeTestInsert, treeTests } from '@/server/db/schema'

export const createTreeTest = async (treeTest: TreeTestInsert) => {
  const result = await db.insert(treeTests).values(treeTest).returning()
  return result[0]
}

export const getTreeTestByTestId = async (testId: string) => {
  const result = await db.query.treeTests.findFirst({
    where: (fields, { eq }) => eq(fields.testId, testId)
  })
  return result
}
