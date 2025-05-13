import { CheckboxWithLabel } from '@/components/checkbox-with-label'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  SURVEY_QUESTION_TYPE,
  SURVEY_QUESTION_TYPE_NAME,
  surveyQuestionTypeOptions
} from '@/utils/study-utils'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { GripVertical, Trash, Trash2 } from 'lucide-react'
import { type UseFormReturn, useWatch } from 'react-hook-form'

export const SurveyQuestion = ({
  disableFields,
  index,
  onRemoveQuestion,
  form,
  sectionIndex
}: {
  form: UseFormReturn<StudyWithTestsInsert>
  disableFields: boolean
  index: number
  sectionIndex: number
  onRemoveQuestion: (index: number) => void
}) => {
  const titleClassName = 'text-sm text-gray-700'

  const questions = useWatch({
    control: form.control,
    name: `tests.${sectionIndex}.questions`
  })

  const question = useWatch({
    control: form.control,
    name: `tests.${sectionIndex}.questions.${index}`
  })

  const hasChoices =
    question.type === SURVEY_QUESTION_TYPE.SINGLE_SELECT ||
    question.type === SURVEY_QUESTION_TYPE.MULTIPLE_SELECT ||
    question.type === SURVEY_QUESTION_TYPE.RANKING

  return (
    <div className='grid gap-6 rounded-md border p-4'>
      <div className='relative flex items-center justify-between'>
        <p className={titleClassName}>
          {sectionIndex + 1}.{question.position + 1}.{' '}
          {SURVEY_QUESTION_TYPE_NAME[question.type]} question
        </p>
        <div className='absolute -right-2'>
          <Button
            variant='ghost'
            size='icon'
            disabled={disableFields || questions.length === 1}
            onClick={() => onRemoveQuestion(index)}
          >
            <Trash className='size-4' />
          </Button>
        </div>
      </div>

      <div className='grid'>
        <p className={cn(titleClassName, 'mb-2')}>Question</p>
        <div className='flex items-center gap-2'>
          <GripVertical className='text-muted-foreground size-6' />
          <FormField
            control={form.control}
            name={`tests.${sectionIndex}.questions.${index}.text`}
            render={({ field }) => <Input className='flex-1' {...field} />}
          />
          <FormField
            control={form.control}
            name={`tests.${sectionIndex}.questions.${index}.type`}
            render={({ field }) => (
              <Select
                defaultValue={SURVEY_QUESTION_TYPE.SINGLE_SELECT}
                onValueChange={value => field.onChange(value)}
                value={field.value}
              >
                <SelectTrigger className='w-[160px]'>
                  <SelectValue placeholder='Select a question type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {surveyQuestionTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {question.type !== SURVEY_QUESTION_TYPE.RANKING && (
            <FormField
              control={form.control}
              name={`tests.${sectionIndex}.questions.${index}.required`}
              render={({ field }) => (
                <CheckboxWithLabel
                  label='Required'
                  id='required'
                  checked={!!field.value}
                  onChange={value => field.onChange(value)}
                  className='ml-2'
                />
              )}
            />
          )}
        </div>
      </div>

      {hasChoices && (
        <>
          <div className='grid'>
            <p className={cn(titleClassName, 'mb-2')}>
              Choices (Press ⏎ for new line or paste a list)
            </p>
            <div className='grid gap-4'>
              <Choice />
              <Choice />
              <Choice />
            </div>
            <Button size='sm' type='button' className='mt-4 ml-8 w-fit'>
              Add another choice
            </Button>
          </div>

          <div className='ml-8 grid gap-3'>
            {question.type !== SURVEY_QUESTION_TYPE.RANKING && (
              <FormField
                control={form.control}
                name={`tests.${sectionIndex}.questions.${index}.hasOtherOption`}
                render={({ field }) => (
                  <CheckboxWithLabel
                    label='Show “Other” option'
                    id='hasOtherOption'
                    checked={!!field.value}
                    onChange={value => field.onChange(value)}
                    className=''
                  />
                )}
              />
            )}
            <FormField
              control={form.control}
              name={`tests.${sectionIndex}.questions.${index}.randomized`}
              render={({ field }) => (
                <CheckboxWithLabel
                  label='Randomize the order of choices'
                  id='randomize'
                  checked={!!field.value}
                  onChange={value => field.onChange(value)}
                  className=''
                />
              )}
            />
          </div>
        </>
      )}
    </div>
  )
}

const Choice = () => {
  return (
    <div className='flex items-center gap-2'>
      <GripVertical className='text-muted-foreground size-6' />
      <Input className='flex-1' />
      <Button variant='ghost' type='button' size='icon'>
        <Trash2 className='size-4' />
      </Button>
    </div>
  )
}
