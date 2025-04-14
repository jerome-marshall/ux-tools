'use client'
import StudyFormCard from '@/components/study/study-form-card'
import { Separator } from '@/components/ui/separator'
import { type Test, type TestResult, type TreeTest } from '@/server/db/schema/schema'
import { useTRPC } from '@/trpc/client'
import { type CategorizedTreeResults, type EntireTreeTestResult } from '@/types'
import { combineTestResultsWithTreeTestResults } from '@/utils/transformers'
import {
  checkBacktrack,
  getNodeNameById,
  getNodePathTypeStatus
} from '@/utils/tree-utils'
import { type TreeItem } from '@/zod-schemas/tree.schema'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ChartColumn, ListTree, Text } from 'lucide-react'
import TreeTestResultOverview from './tt-result-overview'
import TreeTestResultTabs from './tt-result-tabs'

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

  const entireTestResults = combineTestResultsWithTreeTestResults(
    testResults,
    treeTestResults
  )

  const correctPaths = treeTestData.correctPaths
  const correctNodeIds = correctPaths.map(path => path.id)
  const correctNodeNames = correctNodeIds.map(id =>
    getNodeNameById(treeTestData.treeStructure, id)
  )

  const categorizedResults = categorizeTreeTestResults(
    entireTestResults,
    treeTestData.treeStructure,
    correctNodeIds
  )
  console.log('🚀 ~ categorizedResults:', categorizedResults)

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

          <div className='flex flex-col gap-5'>
            <div className='flex items-center gap-2'>
              <ChartColumn className='size-4 stroke-3 text-gray-400' />
              <span className='font-medium'>Results</span>
            </div>
            <TreeTestResultOverview
              correctNodeNames={correctNodeNames.join(', ')}
              totalResponses={treeTestResults.length}
              categorizedResults={categorizedResults}
            />
            <TreeTestResultTabs
              categorizedResults={categorizedResults}
              entireTestResults={entireTestResults}
              correctNodeIds={correctNodeIds}
              treeTestData={treeTestData}
            />
          </div>
        </div>
      }
    />
  )
}

export function categorizeTreeTestResults(
  entireTestResults: EntireTreeTestResult[],
  treeStructure: TreeItem[],
  correctNodeIds: string[]
): CategorizedTreeResults {
  const categorizedResults: CategorizedTreeResults = {
    'direct-success': [],
    'indirect-success': [],
    'direct-failure': [],
    'indirect-failure': [],
    'direct-pass': [],
    'indirect-pass': []
  }

  entireTestResults.forEach(result => {
    const pathTypeStatus = getNodePathTypeStatus(
      result.treeTestClicks,
      treeStructure,
      correctNodeIds,
      result.passed
    )

    categorizedResults[pathTypeStatus].push(result)
  })

  return categorizedResults
}

export default TreeTestResultCard
