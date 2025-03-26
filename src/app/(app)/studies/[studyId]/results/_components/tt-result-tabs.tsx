import React from 'react'
import { type CategorizedResults } from './tt-result-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartNoAxesColumnIncreasing, Route, UserRound, UsersRound } from 'lucide-react'

const TAB_VALUES = {
  TOTALS: 'totals',
  COMMON_PATHS: 'common-paths',
  INDIVIDUAL_PATHS: 'individual-paths',
  PATH_DIAGRAM: 'path-diagram'
}

const TreeTestResultTabs = ({
  categorizedResults
}: {
  categorizedResults: CategorizedResults
}) => {
  const tabTriggerClasses = 'gap-2 data-[state=inactive]:text-gray-500'

  return (
    <Tabs defaultValue={TAB_VALUES.TOTALS} className=''>
      <TabsList className='gap-1'>
        <TabsTrigger value={TAB_VALUES.TOTALS} className={tabTriggerClasses}>
          <ChartNoAxesColumnIncreasing /> <span>Totals</span>
        </TabsTrigger>
        <TabsTrigger value={TAB_VALUES.COMMON_PATHS} className={tabTriggerClasses}>
          <UsersRound /> <span>Common Paths</span>
        </TabsTrigger>
        <TabsTrigger value={TAB_VALUES.INDIVIDUAL_PATHS} className={tabTriggerClasses}>
          <UserRound /> <span>Individual Paths</span>
        </TabsTrigger>
        <TabsTrigger value={TAB_VALUES.PATH_DIAGRAM} className={tabTriggerClasses}>
          <Route /> <span>Path Diagram</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value={TAB_VALUES.TOTALS}>Totals</TabsContent>
      <TabsContent value={TAB_VALUES.COMMON_PATHS}>Common Paths</TabsContent>
      <TabsContent value={TAB_VALUES.INDIVIDUAL_PATHS}>Individual Paths</TabsContent>
      <TabsContent value={TAB_VALUES.PATH_DIAGRAM}>Path Diagram</TabsContent>
    </Tabs>
  )
}

export default TreeTestResultTabs
