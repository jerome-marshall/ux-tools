import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WordCloud } from '@/components/word-cloud'
import { type SurveyQuestionWithAnswers } from '@/types'
import { Cloud, ListIcon, Search, X } from 'lucide-react'
import { SurveyResultSection } from './survey-result-section'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useFuzzySearchList, Highlight } from '@nozbe/microfuzz/react'

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

  const [currentTab, setCurrentTab] = useState(TAB_VALUES.ANSWERS)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAnswers = useFuzzySearchList({
    list: resultData.answers,
    queryText: searchQuery,
    getText: item => [item.answer ?? ''],
    mapResultItem: ({ item, matches }) => ({
      ...item,
      highlightRanges: matches[0]
    })
  })

  return (
    <SurveyResultSection
      sectionIndex={sectionIndex}
      questionIndex={questionIndex}
      question={resultData}
      content={
        <Tabs
          defaultValue={TAB_VALUES.ANSWERS}
          className='h-full'
          onValueChange={value => setCurrentTab(value)}
        >
          <div className='flex items-center justify-between'>
            <TabsList className='mb-2 gap-1'>
              <TabsTrigger value={TAB_VALUES.ANSWERS} className={tabTriggerClasses}>
                <ListIcon /> <span>Answers ({resultData.answers.length})</span>
              </TabsTrigger>
              <TabsTrigger value={TAB_VALUES.WORD_CLOUD} className={tabTriggerClasses}>
                <Cloud /> <span>Word Cloud</span>
              </TabsTrigger>
            </TabsList>
            {currentTab === TAB_VALUES.ANSWERS && (
              <div className='relative bg-white'>
                <Search className='absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-500' />
                {searchQuery && (
                  <button
                    type='button'
                    onClick={() => setSearchQuery('')}
                    className='absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'
                    aria-label='Clear search'
                  >
                    <X className='h-full w-full' />
                  </button>
                )}
                <Input
                  className='h-9 w-[260px] pr-8 pl-8'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Search answers...'
                />
              </div>
            )}
          </div>
          <TabsContent value={TAB_VALUES.ANSWERS}>
            <ScrollArea className='h-[320px] rounded-md border p-4'>
              <div className='grid gap-3'>
                {filteredAnswers.length > 0 ? (
                  filteredAnswers.map(answer => (
                    <p key={answer.id} className='rounded-md border px-3 py-2'>
                      {searchQuery ? (
                        <Highlight
                          text={answer.answer ?? ''}
                          ranges={answer.highlightRanges}
                        />
                      ) : (
                        answer.answer
                      )}
                    </p>
                  ))
                ) : (
                  <p className='py-4 text-center text-gray-500'>
                    No matching answers found
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value={TAB_VALUES.WORD_CLOUD}>
            <WordCloud
              text={resultData.answers.map(answer => answer?.answer ?? '').join(' ')}
            />
          </TabsContent>
        </Tabs>
      }
    />
  )
}
