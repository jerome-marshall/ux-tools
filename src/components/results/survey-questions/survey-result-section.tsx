import { type SurveyQuestion } from '@/server/db/schema'
import { getSurveyQuestionIcon, SURVEY_QUESTION_TYPE_NAME } from '@/utils/study-utils'

export const SurveyResultSection = ({
  question,
  content,
  sectionIndex,
  questionIndex
}: {
  question: SurveyQuestion
  content: React.ReactNode
  sectionIndex: number
  questionIndex: number
}) => {
  const Icon = getSurveyQuestionIcon(question.type)
  const questionTypeName = SURVEY_QUESTION_TYPE_NAME[question.type]

  return (
    <div className='grid gap-5 rounded-md border p-5'>
      <div className='flex items-center gap-2'>
        <Icon className='size-4 text-gray-800' />
        <p className='text-muted-foreground text-sm'>
          {sectionIndex + 1}.{questionIndex + 1} {questionTypeName} question
        </p>
      </div>
      <p className='text-base'>{question.text}</p>
      <div className=''>{content}</div>
    </div>
  )
}
