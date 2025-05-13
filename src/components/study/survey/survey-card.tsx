import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form'
import StudyFormSectionCard from '../study-form-section-card'
import { CircleHelp } from 'lucide-react'
import { SurveyQuestion } from './survey-question'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { generateId } from '@/lib/utils'

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
  const test = useWatch({
    control: form.control,
    name: `tests.${index}`
  })

  const questionsFieldArray = useFieldArray({
    control: form.control,
    name: `tests.${index}.questions`
  })

  const onAddQuestion = () => {
    questionsFieldArray.append({
      type: 'short_text',
      testId: test.testId,
      id: generateId(),
      text: '',
      position: questionsFieldArray.fields.length
    })
  }

  const onRemoveQuestion = (questionIndex: number) => {
    questionsFieldArray.remove(questionIndex)

    // Get the updated fields after removal
    const updatedFields = form.getValues(`tests.${index}.questions`) || []

    // Update positions for remaining questions
    updatedFields.forEach((_, idx) => {
      form.setValue(`tests.${index}.questions.${idx}.position`, idx)
    })
  }

  return (
    <StudyFormSectionCard
      Icon={CircleHelp}
      form={form}
      index={index}
      disableFields={disableFields}
      onRemoveSection={onRemoveSection}
      content={
        <div className='grid gap-4'>
          {questionsFieldArray.fields.map((field, questionIndex) => (
            <SurveyQuestion
              key={field.id}
              form={form}
              disableFields={disableFields}
              sectionIndex={index}
              index={questionIndex}
              onRemoveQuestion={onRemoveQuestion}
            />
          ))}
          <div className='flex'>
            <Button size='sm' type='button' className='w-fit' onClick={onAddQuestion}>
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
