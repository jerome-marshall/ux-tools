'use client'
import StudySectionCard from '@/components/study/study-form-card'
import { type SurveyQuestion, type Test, type TestResult } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { getIcon, SECTION_TYPE, SURVEY_QUESTION_TYPE } from '@/utils/study-utils'
import { combineSurveryQuestionsWithAnswers } from '@/utils/transformers'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ChartColumn } from 'lucide-react'
import { SubHeading } from '../sub-heading'
import { SurveyResultSelect } from './survey-result-select'
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
        questionsWithAnswers.length > 0 ? (
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

              if (
                questionData.type === SURVEY_QUESTION_TYPE.SINGLE_SELECT ||
                questionData.type === SURVEY_QUESTION_TYPE.MULTIPLE_SELECT
              ) {
                return (
                  <SurveyResultSelect
                    key={questionData.id}
                    resultData={questionData}
                    sectionIndex={sectionIndex}
                    questionIndex={questionIndex}
                    answersData={surveyResults
                      .filter(result => result.questionId === questionData.id)
                      .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())}
                    isMultipleSelect={
                      questionData.type === SURVEY_QUESTION_TYPE.MULTIPLE_SELECT
                    }
                  />
                )
              }
            })}
          </div>
        ) : (
          <div className='flex items-center justify-center rounded-md p-8'>
            <div className='text-center'>
              <p className='text-muted-foreground text-sm'>No responses yet</p>
              <p className='text-muted-foreground mt-1 text-xs'>
                This section hasn't received any responses from participants
              </p>
            </div>
          </div>
        )
      }
    />
  )
}

export default SurveyResultsCard
