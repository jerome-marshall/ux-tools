'use client'
import StudySectionCard from '@/components/study/study-form-card'
import { Separator } from '@/components/ui/separator'
import { type Test, type TestResult, type TreeTest } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { type CategorizedTreeResults, type EntireTreeTestResult } from '@/types'
import { getIcon, SECTION_TYPE } from '@/utils/study-utils'
import { combineTestResultsWithTreeTestResults } from '@/utils/transformers'
import { getNodeNameById, getNodePathTypeStatus } from '@/utils/tree-utils'
import { type TreeItem } from '@/zod-schemas/tree.schema'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ChartColumn, Text } from 'lucide-react'
import { SubHeading } from '../sub-heading'
import TreeTestResultOverview from './tt-result-overview'
import TreeTestResultTabs from './tt-result-tabs'

const TreeTestResultCard = ({
  treeTestData,
  testResults,
  testData,
  sectionIndex
}: {
  treeTestData: TreeTest
  testResults: TestResult[]
  testData: Test
  sectionIndex: number
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

  const Icon = getIcon(SECTION_TYPE.TREE_TEST)

  return (
    <StudySectionCard
      icon={<Icon className='icon' />}
      title={testData.name}
      content={
        <div>
          <div className='flex flex-col gap-5'>
            <SubHeading heading='Instructions' Icon={Text} />
            <p className=''>{treeTestData.taskInstructions}</p>
          </div>

          <Separator className='my-6' />

          <div className='flex flex-col gap-5'>
            <SubHeading heading='Results' Icon={ChartColumn} />
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
