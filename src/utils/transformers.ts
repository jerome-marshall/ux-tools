import { type TreeTest } from '@/server/db/schema'

import { type Test } from '@/server/db/schema'

export const combineTestWithTreeTest = (test: Test, treeTest: TreeTest) => {
  const { name, type, ...restTest } = test
  const { treeStructure, taskInstructions, correctPaths, ...restTreeTest } = treeTest
  return {
    name,
    type,
    treeStructure,
    taskInstructions,
    correctPaths,
    testData: restTest,
    treeTestData: restTreeTest
  }
}

export const combineTestsWithTreeTests = (tests: Test[], treeTests: TreeTest[]) => {
  if (!tests?.length) return []
  if (!treeTests?.length)
    return tests.map(test => {
      const { name, type, ...restTest } = test
      return {
        name,
        type,
        treeStructure: null,
        taskInstructions: null,
        correctPaths: null,
        testData: restTest,
        treeTestData: null
      }
    })

  return tests.map(test => {
    const treeTest = treeTests.find(treeTest => treeTest.testId === test.id)
    if (!treeTest) {
      // Return consistent shape even when no treeTest is found
      const { name, type, ...restTest } = test
      return {
        name,
        type,
        treeStructure: null,
        taskInstructions: null,
        correctPaths: null,
        testData: restTest,
        treeTestData: null
      }
    }
    return combineTestWithTreeTest(test, treeTest)
  })
}
