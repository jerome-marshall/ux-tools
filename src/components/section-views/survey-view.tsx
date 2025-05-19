'use client'

import { type CombinedTestData } from '@/types'
import { SURVEY_QUESTION_TYPE, SECTION_TYPE } from '@/utils/study-utils'
import { useRef, useState } from 'react'
import { TestViewLayout } from './test-view-layout'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { GripVertical } from 'lucide-react'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useSurveyUser } from '@/hooks/use-survey-user'
import { type SurveyQuestionResultInsert } from '@/server/db/schema'
import { cn, generateId } from '@/lib/utils'
import { toast } from 'sonner'

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
  const [answers, setAnswers] = useState<SurveyQuestionResultInsert[]>([])

  const [hasAnswered, setHasAnswered] = useState(false)

  const trpc = useTRPC()
  const { mutate } = useMutation(
    trpc.tests.createTestResult.mutationOptions({
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

    setAnswers(prev => {
      const skipped = !currentAnswerData.answer && !currentAnswerData.answers.length

      return [
        ...prev,
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
    })

    if (hasNextQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      onNextStep()

      const totalDurationMs = answers.reduce((acc, curr) => acc + curr.durationMs, 0)

      if (!isPreview) {
        mutate({
          userId,
          testId,
          taskDurationMs: totalDurationMs,
          totalDurationMs,
          testType: SECTION_TYPE.SURVEY,
          surveyQuestionsResults: answers
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
      {currentQuestion.type === SURVEY_QUESTION_TYPE.SHORT_TEXT && (
        <Input
          placeholder='Enter your answer'
          variant='teal'
          className='bg-white !text-base'
          value={currentAnswerData.answer ?? ''}
          onChange={e => {
            setCurrentAnswerData({ ...currentAnswerData, answer: e.target.value })
            setHasAnswered(e.target.value.length > 0)
          }}
        />
      )}
      {currentQuestion.type === SURVEY_QUESTION_TYPE.LONG_TEXT && (
        <Textarea
          placeholder='Enter your answer'
          variant='teal'
          className='h-24 bg-white !text-base'
          value={currentAnswerData.answer ?? ''}
          onChange={e => {
            setCurrentAnswerData({ ...currentAnswerData, answer: e.target.value })
            setHasAnswered(e.target.value.length > 0)
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
        />
      )}
      {currentQuestion.type === SURVEY_QUESTION_TYPE.MULTIPLE_SELECT && (
        <MultiSelectCheckboxGroup
          value={currentAnswerData.answers}
          onChange={value => {
            setCurrentAnswerData({ ...currentAnswerData, answers: value })
            setHasAnswered(value.length > 0)
          }}
          options={currentQuestion.multipleChoiceOptions}
        />
      )}
      {currentQuestion.type === SURVEY_QUESTION_TYPE.RANKING && <RankingGroup />}
      {/* <Button
        variant={'teal'}
        size={'lg'}
        className='mt-5'
        onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
      >
        Prev
      </Button> */}
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

const SingleSelectRadioGroup = ({
  value,
  onChange,
  options
}: {
  value: string | null
  onChange: (value: string) => void
  options: string[]
}) => {
  return (
    <RadioGroup onValueChange={onChange} value={value ?? ''}>
      {options.map(option => (
        <RadioItem key={option} value={option} label={option} />
      ))}
    </RadioGroup>
  )
}

const RadioItem = ({ value, label }: { value: string; label: string }) => {
  return (
    <div className='relative flex items-center space-x-2'>
      <RadioGroupItem
        value={value}
        id={value}
        className='peer absolute ml-3 data-[state=checked]:bg-teal-600 data-[state=checked]:text-teal-600 [&_svg]:fill-white [&_svg]:transition-all [&_svg]:duration-100'
      />
      <Label
        htmlFor={value}
        className='w-full cursor-pointer rounded-md border bg-white p-3 transition-all duration-100 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-500/10 peer-data-[state=checked]:text-teal-800'
      >
        <p className='pl-8 text-base font-medium'>{label}</p>
      </Label>
    </div>
  )
}

const MultiSelectCheckboxGroup = ({
  value,
  onChange,
  options
}: {
  value: string[]
  onChange: (value: string[]) => void
  options: string[]
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(value)

  const handleSelect = (option: string) => {
    const hasOption = selectedOptions.includes(option)
    const newSelectedOptions = hasOption
      ? selectedOptions.filter(o => o !== option)
      : [...selectedOptions, option]

    setSelectedOptions(newSelectedOptions)
    onChange(newSelectedOptions)
  }

  return (
    <div className='grid gap-3'>
      {options.map(option => (
        <CheckboxItem
          key={option}
          option={option}
          onSelect={handleSelect}
          isSelected={selectedOptions.includes(option)}
        />
      ))}
    </div>
  )
}

const CheckboxItem = ({
  option,
  onSelect,
  isSelected
}: {
  option: string
  onSelect: (value: string) => void
  isSelected: boolean
}) => {
  return (
    <div className='relative flex items-center space-x-2'>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelect(option)}
        id={option}
        className='peer absolute ml-3 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 [&_svg]:transition-all [&_svg]:duration-100'
      />
      <Label
        htmlFor={option}
        className='w-full cursor-pointer rounded-md border bg-white p-3 transition-all duration-100 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-500/10 peer-data-[state=checked]:text-teal-800'
      >
        <p className='pl-8 text-base font-medium'>{option}</p>
      </Label>
    </div>
  )
}

const RankingGroup = () => {
  return (
    <div className='grid gap-3'>
      <RankingItem id='default' label='Default' />
      <RankingItem id='comfortable' label='Comfortable' />
      <RankingItem id='compact' label='Compact' />
    </div>
  )
}

const RankingItem = ({ id, label }: { id: string; label: string }) => {
  return (
    <div className='flex w-full cursor-pointer items-center gap-3 rounded-md border bg-white p-3 transition-all duration-100 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-500/10 peer-data-[state=checked]:text-teal-800'>
      <GripVertical className='text-muted-foreground size-5' />
      <p className='text-base font-medium'>{label}</p>
    </div>
  )
}
