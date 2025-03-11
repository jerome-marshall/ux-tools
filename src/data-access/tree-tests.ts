import { db } from '@/server/db'
import { type TreeTestInsert, treeTests } from '@/server/db/schema'

export const createTreeTest = async (treeTest: TreeTestInsert) => {
  const result = await db.insert(treeTests).values(treeTest).returning()
  return result[0]
}
