import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type SurveyQuestionWithAnswers } from '@/types'
import { Cloud, ListIcon } from 'lucide-react'
import { SurveyResultSection } from './survey-result-section'

const TAB_VALUES = {
  ANSWERS: 'answers',
  WORD_CLOUD: 'word-cloud'
}

export const SurveyResultText = ({
  resultData,
  sectionIndex,
  questionIndex
}: {
  resultData: SurveyQuestionWithAnswers
  sectionIndex: number
  questionIndex: number
}) => {
  const tabTriggerClasses = 'gap-2 data-[state=inactive]:text-gray-500'

  return (
    <SurveyResultSection
      sectionIndex={sectionIndex}
      questionIndex={questionIndex}
      question={resultData}
      content={
        <Tabs defaultValue={TAB_VALUES.ANSWERS} className=''>
          <TabsList className='mb-2 gap-1'>
            <TabsTrigger value={TAB_VALUES.ANSWERS} className={tabTriggerClasses}>
              <ListIcon /> <span>Answers</span>
            </TabsTrigger>
            <TabsTrigger value={TAB_VALUES.WORD_CLOUD} className={tabTriggerClasses}>
              <Cloud /> <span>Word Cloud</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value={TAB_VALUES.ANSWERS}>
            <div className='grid gap-3'>
              {resultData.answers.map(answer => (
                <p key={answer.id} className='rounded-md border px-3 py-2'>
                  {answer.answer}
                </p>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      }
    />
  )
}
