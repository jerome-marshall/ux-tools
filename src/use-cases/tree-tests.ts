import {
  createTreeTest,
  createTreeTestResult,
  deleteTreeTestByTestId,
  getTreeTestByTestId,
  getTreeTestResultsByTestResultIds,
  getTreeTestsByTestIds,
  updateTreeTest
} from '@/data-access/tree-tests'
import { type Db } from '@/server/db'
import { type TreeTestResultInsert, type TreeTestInsert } from '@/server/db/schema'

export const createTreeTestUseCase = async (treeTest: TreeTestInsert, trx?: Db) => {
  const result = await createTreeTest(treeTest, trx)
  if (!result) {
    throw new Error('Failed to create tree test')
  }

  return result
}

export const getTreeTestByTestIdUseCase = async (testId: string, trx?: Db) => {
  const result = await getTreeTestByTestId(testId, trx)
  if (!result) {
    throw new Error('Failed to get tree test')
  }
  return result
}

export const getTreeTestsByTestIdsUseCase = async (testIds: string[]) => {
  const result = await getTreeTestsByTestIds(testIds)
  if (!result) {
    throw new Error('Failed to get tree tests')
  }
  return result
}

export const updateTreeTestUseCase = async (
  id: string,
  treeTest: Partial<TreeTestInsert>,
  trx?: Db
) => {
  const result = await updateTreeTest(id, treeTest, trx)
  if (!result) {
    throw new Error('Failed to update tree test')
  }
  return result
}

export const createTreeTestResultUseCase = async (
  treeTestResult: TreeTestResultInsert
) => {
  const result = await createTreeTestResult(treeTestResult)
  if (!result) {
    throw new Error('Failed to create tree test result')
  }
  return result
}

export const getTreeTestResultsByTestResultIdsUseCase = async (
  testResultIds: string[]
) => {
  const result = await getTreeTestResultsByTestResultIds(testResultIds)
  if (!result) {
    throw new Error('Failed to get tree test results')
  }
  return result
}

export const deleteTreeTestByTestIdUseCase = async (testId: string, trx?: Db) => {
  const result = await deleteTreeTestByTestId(testId, trx)
  return result
}
