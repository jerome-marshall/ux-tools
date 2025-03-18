import { db } from '@/server/db'
import { treeTests, type TreeTest, type TreeTestInsert } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export const createTreeTest = async (treeTest: TreeTestInsert) => {
  const [result] = await db.insert(treeTests).values(treeTest).returning()
  return result
}

export const getTreeTestByTestId = async (testId: string) => {
  const result = await db.query.treeTests.findFirst({
    where: (fields, { eq }) => eq(fields.testId, testId)
  })
  return result
}

// Add an update function for tree tests
export const updateTreeTest = async (id: string, treeTest: Partial<TreeTestInsert>) => {
  const [result] = await db
    .update(treeTests)
    .set(treeTest)
    .where(eq(treeTests.id, id))
    .returning()
  return result
}
