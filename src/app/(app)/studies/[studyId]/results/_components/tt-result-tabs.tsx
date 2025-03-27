import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type TreeTest } from '@/server/db/schema'
import { type CategorizedTreeResults, type EntireTreeTestResult } from '@/types'
import { ChartNoAxesColumnIncreasing, Route, UsersRound } from 'lucide-react'
import TreeTestResultTabCommonPaths from './tt-result-tab-common-paths'
import TreeTestResultTabNodeTotals from './tt-result-tab-node-totals'

const TAB_VALUES = {
  TOTALS: 'totals',
  COMMON_PATHS: 'common-paths',
  PATH_DIAGRAM: 'path-diagram'
}

const TreeTestResultTabs = ({
  categorizedResults,
  entireTestResults,
  correctNodeIds,
  treeTestData
}: {
  categorizedResults: CategorizedTreeResults
  entireTestResults: EntireTreeTestResult[]
  correctNodeIds: string[]
  treeTestData: TreeTest
}) => {
  const tabTriggerClasses = 'gap-2 data-[state=inactive]:text-gray-500'

  return (
    <Tabs defaultValue={TAB_VALUES.TOTALS} className=''>
      <TabsList className='mb-2 gap-1'>
        <TabsTrigger value={TAB_VALUES.TOTALS} className={tabTriggerClasses}>
          <ChartNoAxesColumnIncreasing /> <span>Totals</span>
        </TabsTrigger>
        <TabsTrigger value={TAB_VALUES.COMMON_PATHS} className={tabTriggerClasses}>
          <UsersRound /> <span>Common Paths</span>
        </TabsTrigger>
        <TabsTrigger value={TAB_VALUES.PATH_DIAGRAM} className={tabTriggerClasses}>
          <Route /> <span>Path Diagram</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value={TAB_VALUES.TOTALS}>
        <TreeTestResultTabNodeTotals
          treeStructure={treeTestData.treeStructure}
          correctNodeIds={correctNodeIds}
          entireTestResults={entireTestResults}
        />
      </TabsContent>
      <TabsContent value={TAB_VALUES.COMMON_PATHS}>
        <TreeTestResultTabCommonPaths
          treeStructure={treeTestData.treeStructure}
          correctNodeIds={correctNodeIds}
          entireTestResults={entireTestResults}
        />
      </TabsContent>
      <TabsContent value={TAB_VALUES.PATH_DIAGRAM}>Path Diagram</TabsContent>
    </Tabs>
  )
}

export default TreeTestResultTabs
