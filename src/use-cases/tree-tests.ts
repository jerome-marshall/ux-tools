import { createTreeTest } from '@/data-access/tree-tests'
import { type TreeTestInsert } from '@/server/db/schema'

export const createTreeTestUseCase = async (treeTest: TreeTestInsert) => {
  const result = await createTreeTest(treeTest)
  if (!result) {
    throw new Error('Failed to create tree test')
  }

  return result
}
