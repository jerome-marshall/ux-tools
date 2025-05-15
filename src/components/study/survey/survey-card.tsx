import { CheckboxWithLabel } from '@/components/checkbox-with-label'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form'
import { generateId } from '@/lib/utils'
import { SECTION_TYPE } from '@/utils/study-utils'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { CircleHelp } from 'lucide-react'
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form'
import StudyFormSectionCard from '../study-form-section-card'
import { SurveyQuestion } from './survey-question'

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
        <div className='grid gap-4' id={SECTION_TYPE.SURVEY + `-${index}`}>
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
            <FormField
              control={form.control}
              name={`tests.${index}.randomized`}
              render={({ field }) => (
                <CheckboxWithLabel
                  className='ml-4'
                  id='randomize_questions'
                  label='Randomize the order of questions'
                  checked={!!field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      }
    />
  )
}
