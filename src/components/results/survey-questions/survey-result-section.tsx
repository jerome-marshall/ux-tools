import { type SurveyQuestionWithAnswers } from '@/types'
import { getSurveyQuestionIcon, SURVEY_QUESTION_TYPE_NAME } from '@/utils/study-utils'

export const SurveyResultSection = ({
  question,
  content,
  sectionIndex,
  questionIndex
}: {
  question: SurveyQuestionWithAnswers
  content: React.ReactNode
  sectionIndex: number
  questionIndex: number
}) => {
  const Icon = getSurveyQuestionIcon(question.type)
  const questionTypeName = SURVEY_QUESTION_TYPE_NAME[question.type]

  const hasAnswers = question.answers.length > 0

  return (
    <div className='grid gap-5 rounded-md border p-5'>
      <div className='flex items-center gap-2'>
        <Icon className='size-4 text-gray-800' />
        <p className='text-muted-foreground text-sm'>
          {sectionIndex + 1}.{questionIndex + 1} {questionTypeName} question
        </p>
      </div>
      <p className='text-base'>{question.text}</p>
      <div className=''>{hasAnswers ? content : <SurveyQuestionNoAnswers />}</div>
    </div>
  )
}

export const SurveyQuestionNoAnswers = () => {
  return (
    <div className='flex items-center justify-center rounded-md border border-dashed p-8'>
      <div className='text-center'>
        <p className='text-muted-foreground text-sm'>No responses yet</p>
        <p className='text-muted-foreground mt-1 text-xs'>
          This question hasn't received any responses from participants
        </p>
      </div>
    </div>
  )
}
