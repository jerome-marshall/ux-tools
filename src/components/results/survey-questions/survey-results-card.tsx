'use client'
import StudySectionCard from '@/components/study/study-form-card'
import { type SurveyQuestion, type Test, type TestResult } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { getIcon, SECTION_TYPE, SURVEY_QUESTION_TYPE } from '@/utils/study-utils'
import { combineSurveryQuestionsWithAnswers } from '@/utils/transformers'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ChartColumn } from 'lucide-react'
import { SubHeading } from '../sub-heading'
import { SurveyResultText } from './survey-result-text'

const SurveyResultsCard = ({
  testData,
  testResults,
  questions,
  sectionIndex
}: {
  testData: Test
  testResults: TestResult[]
  questions: SurveyQuestion[]
  sectionIndex: number
}) => {
  const testResultIds = testResults.map(result => result.id)

  const trpc = useTRPC()
  const { data: surveyResults } = useSuspenseQuery(
    trpc.tests.getSurveyResults.queryOptions({ testResultIds })
  )

  const questionsWithAnswers = combineSurveryQuestionsWithAnswers(
    surveyResults,
    questions
  )

  const Icon = getIcon(SECTION_TYPE.SURVEY)

  return (
    <StudySectionCard
      icon={<Icon className='icon' />}
      title={testData.name}
      content={
        <div className='grid gap-5'>
          <SubHeading heading='Results' Icon={ChartColumn} />
          {questionsWithAnswers.map((questionData, questionIndex) => {
            if (
              questionData.type === SURVEY_QUESTION_TYPE.SHORT_TEXT ||
              questionData.type === SURVEY_QUESTION_TYPE.LONG_TEXT
            ) {
              return (
                <SurveyResultText
                  key={questionData.id}
                  resultData={questionData}
                  sectionIndex={sectionIndex}
                  questionIndex={questionIndex}
                />
              )
            }
          })}
        </div>
      }
    />
  )
}

export default SurveyResultsCard
