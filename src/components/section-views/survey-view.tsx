'use client'

import { type CombinedTestData } from '@/types'
import { SURVEY_QUESTION_TYPE, type SECTION_TYPE } from '@/utils/study-utils'
import { useState } from 'react'
import { TestViewLayout } from './test-view-layout'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { GripVertical } from 'lucide-react'

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isAnswered, setIsAnswered] = useState(false)

  const currentQuestion = testData.questions[currentQuestionIndex]
  const hasNextQuestion = currentQuestionIndex < testData.questions.length - 1

  const handleNextQuestion = () => {
    if (hasNextQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setIsAnswered(false)
    } else {
      onNextStep()
    }
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
        />
      )}
      {currentQuestion.type === SURVEY_QUESTION_TYPE.LONG_TEXT && (
        <Textarea
          placeholder='Enter your answer'
          variant='teal'
          className='h-24 bg-white !text-base'
        />
      )}
      {currentQuestion.type === SURVEY_QUESTION_TYPE.SINGLE_SELECT && (
        <SingleSelectRadioGroup />
      )}
      {currentQuestion.type === SURVEY_QUESTION_TYPE.MULTIPLE_SELECT && (
        <MultiSelectCheckboxGroup />
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
      <Button variant={'teal'} size={'lg'} className='mt-5' onClick={handleNextQuestion}>
        Continue
      </Button>
    </TestViewLayout>
  )
}

const SingleSelectRadioGroup = () => {
  return (
    <RadioGroup defaultValue='comfortable'>
      <RadioItem value='default' label='Default' />
      <RadioItem value='comfortable' label='Comfortable' />
      <RadioItem value='compact' label='Compact' />
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

const MultiSelectCheckboxGroup = () => {
  return (
    <div className='grid gap-3'>
      <CheckboxItem id='default' label='Default' />
      <CheckboxItem id='comfortable' label='Comfortable' />
      <CheckboxItem id='compact' label='Compact' />
    </div>
  )
}

const CheckboxItem = ({ id, label }: { id: string; label: string }) => {
  return (
    <div className='relative flex items-center space-x-2'>
      <Checkbox
        id={id}
        className='peer absolute ml-3 data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 [&_svg]:transition-all [&_svg]:duration-100'
      />
      <Label
        htmlFor={id}
        className='w-full cursor-pointer rounded-md border bg-white p-3 transition-all duration-100 peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-500/10 peer-data-[state=checked]:text-teal-800'
      >
        <p className='pl-8 text-base font-medium'>{label}</p>
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
