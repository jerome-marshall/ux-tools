import {
  createTreeTest,
  getTreeTestByTestId,
  updateTreeTest
} from '@/data-access/tree-tests'
import { type TreeTestInsert } from '@/server/db/schema'

export const createTreeTestUseCase = async (treeTest: TreeTestInsert) => {
  const result = await createTreeTest(treeTest)
  if (!result) {
    throw new Error('Failed to create tree test')
  }

  return result
}

export const getTreeTestByTestIdUseCase = async (testId: string) => {
  const result = await getTreeTestByTestId(testId)
  if (!result) {
    throw new Error('Failed to get tree test')
  }
  return result
}

export const updateTreeTestUseCase = async (
  id: string,
  treeTest: Partial<TreeTestInsert>
) => {
  const result = await updateTreeTest(id, treeTest)
  if (!result) {
    throw new Error('Failed to update tree test')
  }
  return result
}
