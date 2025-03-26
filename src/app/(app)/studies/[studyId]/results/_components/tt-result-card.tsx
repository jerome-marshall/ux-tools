'use client'
import StudyFormCard from '@/components/study/study-form-card'
import { Separator } from '@/components/ui/separator'
import {
  type TreeTestResult,
  type Test,
  type TestResult,
  type TreeTest
} from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ListTree, Text } from 'lucide-react'
import TreeTestResultOverview from './tt-result-overview'
import { checkBacktrack, getNodeNameById } from '@/utils/tree-utils'

export type CategorizedResults = Record<
  `${'direct' | 'indirect'}-${'success' | 'failure' | 'pass'}`,
  TreeTestResult[]
>

const TreeTestResultCard = ({
  treeTestData,
  testResults,
  testData
}: {
  treeTestData: TreeTest
  testResults: TestResult[]
  testData: Test
}) => {
  const trpc = useTRPC()

  const testResultIds = testResults.map(result => result.id)
  const { data: treeTestResults } = useSuspenseQuery(
    trpc.tests.getTreeTestResults.queryOptions({ testResultIds })
  )

  const correctPaths = treeTestData.correctPaths
  const correctNodeIds = correctPaths.map(path => path.id)
  const correctNodeNames = correctNodeIds.map(id =>
    getNodeNameById(treeTestData.treeStructure, id)
  )

  const categorizedResults: CategorizedResults = {
    'direct-success': [],
    'indirect-success': [],
    'direct-failure': [],
    'indirect-failure': [],
    'direct-pass': [],
    'indirect-pass': []
  }

  treeTestResults.forEach(result => {
    const hasBacktracked = checkBacktrack(
      result.treeTestClicks,
      treeTestData.treeStructure
    )

    if (result.passed || !result.treeTestClicks || result.treeTestClicks.length === 0) {
      categorizedResults[hasBacktracked ? 'indirect-pass' : 'direct-pass'].push(result)
      return
    }

    const lastClickedNodeId =
      result.treeTestClicks[result.treeTestClicks.length - 1]?.nodeId
    if (!lastClickedNodeId) {
      categorizedResults['direct-failure'].push(result)
      return
    }

    const isCorrect = correctNodeIds.includes(lastClickedNodeId)

    if (isCorrect) {
      categorizedResults[hasBacktracked ? 'indirect-success' : 'direct-success'].push(
        result
      )
      return
    }

    categorizedResults[hasBacktracked ? 'indirect-failure' : 'direct-failure'].push(
      result
    )
  })

  return (
    <StudyFormCard
      icon={<ListTree className='icon' />}
      title={testData.name}
      content={
        <div>
          <div className='flex flex-col gap-5'>
            <div className='flex items-center gap-2'>
              <Text className='size-4 stroke-3 text-gray-400' />
              <span className='font-medium'>Instructions</span>
            </div>
            <p className=''>{treeTestData.taskInstructions}</p>
          </div>

          <Separator className='my-6' />

          <TreeTestResultOverview
            correctNodeNames={correctNodeNames.join(', ')}
            totalResponses={treeTestResults.length}
            categorizedResults={categorizedResults}
          />
        </div>
      }
    />
  )
}

export default TreeTestResultCard
