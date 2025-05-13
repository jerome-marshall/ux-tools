import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { type UseFormReturn } from 'react-hook-form'
import StudyFormSectionCard from '../study-form-section-card'
import { CircleHelp } from 'lucide-react'
import { SurveyQuestion } from './survey-question'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export const SurveyCard = ({
  form,
  index,
  onRemoveSection,
  disableFields
}: {
  form: UseFormReturn<StudyWithTestsInsert>
  index: number
  onRemoveSection: (index: number) => void
  disableFields: boolean
}) => {
  return (
    <StudyFormSectionCard
      Icon={CircleHelp}
      form={form}
      index={index}
      disableFields={disableFields}
      onRemoveSection={onRemoveSection}
      content={
        <div className='grid gap-4'>
          <SurveyQuestion disableFields={disableFields} />
          <SurveyQuestion disableFields={disableFields} />
          <div className='flex'>
            <Button size='sm' type='button' className='w-fit'>
              Add another question
            </Button>
            <div className='ml-4 flex items-center gap-2'>
              <Checkbox id='randomize_questions' />
              <Label htmlFor='randomize_questions'>
                Randomize the order of questions
              </Label>
            </div>
          </div>
        </div>
      }
    />
  )
}
