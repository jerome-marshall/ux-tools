'use client'

import { useSurveyUser } from '@/hooks/use-survey-user'
import { cn, generateId } from '@/lib/utils'
import { type SurveyQuestionResultInsert } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { type CombinedTestData } from '@/types'
import { SECTION_TYPE, SURVEY_QUESTION_TYPE } from '@/utils/study-utils'
import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../ui/button'
import { TestViewLayout } from '../test-view-layout'
import { MultiSelectCheckboxGroup } from './multi-select'
import { RankingDnDGroup } from './ranking'
import { SingleSelectRadioGroup } from './single-select'
import { TextInput } from './text-input'

export const SurveyView = ({
  testData,
  onNextStep,
  testId,
  isPreview
}: {
  testData: CombinedTestData & { type: typeof SECTION_TYPE.SURVEY }
  onNextStep: () => void
  testId: string
  isPreview: boolean
}) => {
  const { userId } = useSurveyUser({ isPreview })
  const resultId = useRef(generateId())

  const [startTime, setStartTime] = useState(Date.now())
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswerData, setCurrentAnswerData] = useState<{
    answer: string | null
    answers: string[]
  }>({
    answer: null,
    answers: []
  })
  console.log('🚀 ~ currentAnswerData:', currentAnswerData)
  const [answers, setAnswers] = useState<SurveyQuestionResultInsert[]>([])

  const [hasAnswered, setHasAnswered] = useState(false)

  const trpc = useTRPC()
  const { mutate } = useMutation(
    trpc.tests.createTestResult.mutationOptions({
      onSuccess() {
        setAnswers([])
      },
      onError(error, variables) {
        console.error('🚀 ~ onError ~ error:', error, variables)
      }
    })
  )

  const currentQuestion = testData.questions[currentQuestionIndex]
  const hasNextQuestion = currentQuestionIndex < testData.questions.length - 1

  const isDisabled = currentQuestion.required && !hasAnswered

  const handleNextQuestion = () => {
    if (isDisabled) {
      toast.error('Please answer the question')
      return
    }

    const now = Date.now()
    const durationMs = now - startTime

    const skipped = !currentAnswerData.answer && !currentAnswerData.answers.length
    const newAnswers = [
      ...answers,
      {
        answers: currentAnswerData.answers,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        answer: currentAnswerData.answer || null,
        questionId: currentQuestion.id,
        testId,
        testResultId: resultId.current,
        durationMs,
        skipped
      }
    ]

    setAnswers(newAnswers)

    if (hasNextQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      onNextStep()

      const totalDurationMs = newAnswers.reduce((acc, curr) => acc + curr.durationMs, 0)

      if (!isPreview) {
        mutate({
          userId,
          testId,
          taskDurationMs: totalDurationMs,
          totalDurationMs,
          testType: SECTION_TYPE.SURVEY,
          surveyQuestionsResults: newAnswers
        })
      }
    }

    // reset the question state
    setHasAnswered(false)
    setStartTime(now)
    setCurrentAnswerData({
      answer: null,
      answers: []
    })
  }

  return (
    <TestViewLayout
      title={currentQuestion.text}
      wrapperClassName='items-start  justify-center'
      titleClassName='text-left'
      contentClassName='mt-4'
    >
      {(currentQuestion.type === SURVEY_QUESTION_TYPE.SHORT_TEXT ||
        currentQuestion.type === SURVEY_QUESTION_TYPE.LONG_TEXT) && (
        <TextInput
          type={currentQuestion.type}
          value={currentAnswerData.answer ?? ''}
          onChange={value => {
            setCurrentAnswerData({ ...currentAnswerData, answer: value })
            setHasAnswered(value.length > 0)
          }}
        />
      )}
      {currentQuestion.type === SURVEY_QUESTION_TYPE.SINGLE_SELECT && (
        <SingleSelectRadioGroup
          value={currentAnswerData.answer ?? ''}
          onChange={value => {
            setCurrentAnswerData({ ...currentAnswerData, answer: value })
            setHasAnswered(true)
          }}
          options={currentQuestion.multipleChoiceOptions}
          hasOtherOption={currentQuestion.hasOtherOption}
        />
      )}
      {currentQuestion.type === SURVEY_QUESTION_TYPE.MULTIPLE_SELECT && (
        <MultiSelectCheckboxGroup
          values={currentAnswerData.answers}
          onChange={value => {
            setCurrentAnswerData({ ...currentAnswerData, answers: value })
            setHasAnswered(value.length > 0)
          }}
          options={currentQuestion.multipleChoiceOptions}
          hasOtherOption={currentQuestion.hasOtherOption}
        />
      )}
      {currentQuestion.type === SURVEY_QUESTION_TYPE.RANKING && (
        <RankingDnDGroup
          values={
            currentAnswerData.answers.length
              ? currentAnswerData.answers
              : currentQuestion.multipleChoiceOptions.map(option => option.value)
          }
          onChange={value => {
            setCurrentAnswerData({ ...currentAnswerData, answers: value })
            setHasAnswered(true)
          }}
        />
      )}
      <Button
        variant={'teal'}
        size={'lg'}
        className={cn('mt-5', isDisabled && 'opacity-50 hover:bg-teal-600')}
        onClick={handleNextQuestion}
      >
        Continue
      </Button>
    </TestViewLayout>
  )
}
