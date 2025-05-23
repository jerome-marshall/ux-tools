import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type SurveyQuestionResult } from '@/server/db/schema'
import { type SurveyQuestionWithAnswers } from '@/types'
import { BarChart, ListIcon } from 'lucide-react'
import { useState } from 'react'
import { NodeTotals } from '@/components/results/node-totals'
import { SurveyResultSection } from './survey-result-section'

const TAB_VALUES = {
  TOTALS: 'totals',
  ANSWERS: 'answers'
}
const SKIPPED = 'Skipped'

export const SurveyResultSelect = ({
  resultData,
  sectionIndex,
  questionIndex,
  answersData,
  isMultipleSelect
}: {
  resultData: SurveyQuestionWithAnswers
  sectionIndex: number
  questionIndex: number
  answersData: SurveyQuestionResult[]
  isMultipleSelect: boolean
}) => {
  const tabTriggerClasses = 'gap-2 data-[state=inactive]:text-gray-500'

  const [currentTab, setCurrentTab] = useState(TAB_VALUES.TOTALS)

  const answersCount = answersData.filter(data => !data.skipped).length
  const answersCountMap: Record<string, number> = {}
  let totalAnswers = 0

  answersData.forEach(data => {
    if (isMultipleSelect) {
      if (data.skipped) {
        answersCountMap[SKIPPED] = (answersCountMap[SKIPPED] ?? 0) + 1
        totalAnswers++
      } else {
        data.answers.forEach(answer => {
          answersCountMap[answer] = (answersCountMap[answer] ?? 0) + 1
          totalAnswers++
        })
      }
    } else {
      if (data.skipped) {
        answersCountMap[SKIPPED] = (answersCountMap[SKIPPED] ?? 0) + 1
      } else if (data.answer) {
        answersCountMap[data.answer] = (answersCountMap[data.answer] ?? 0) + 1
      }
      totalAnswers++
    }
  })

  const answersCountArray = Object.entries(answersCountMap).sort((a, b) => b[1] - a[1])

  return (
    <SurveyResultSection
      sectionIndex={sectionIndex}
      questionIndex={questionIndex}
      question={resultData}
      content={
        <Tabs
          defaultValue={TAB_VALUES.TOTALS}
          className='h-full'
          value={currentTab}
          onValueChange={value => setCurrentTab(value)}
        >
          <TabsList className='mb-2 gap-1'>
            <TabsTrigger value={TAB_VALUES.TOTALS} className={tabTriggerClasses}>
              <BarChart /> <span>Totals</span>
            </TabsTrigger>
            <TabsTrigger value={TAB_VALUES.ANSWERS} className={tabTriggerClasses}>
              <ListIcon /> <span>Answers ({answersCount})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={TAB_VALUES.TOTALS}>
            <div className='grid gap-3'>
              {answersCountArray.map(([answer, count]) => {
                const percentage =
                  totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0
                return (
                  <NodeTotals
                    key={answer}
                    percentage={percentage}
                    nodeName={answer}
                    correct={false}
                    muted={answer === SKIPPED}
                    numUsers={count}
                  />
                )
              })}
            </div>
          </TabsContent>
          <TabsContent value={TAB_VALUES.ANSWERS}>
            <Answers
              answersData={answersData.filter(data => !data.skipped)}
              isMultipleSelect={isMultipleSelect}
            />
          </TabsContent>
        </Tabs>
      }
    />
  )
}

const Answers = ({
  answersData,
  isMultipleSelect
}: {
  answersData: SurveyQuestionResult[]
  isMultipleSelect: boolean
}) => {
  const answers = answersData
    .map(answer => {
      if (isMultipleSelect) {
        return answer.answers.join(', ')
      }
      return answer.answer
    })
    .filter(Boolean)

  return (
    <ScrollArea className='h-[320px] rounded-md border p-4'>
      <div className='grid gap-3'>
        {answers.map((answer, index) => (
          <div key={`${index}-${answer}`} className='rounded-md border px-3 py-2'>
            <p>{answer}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
