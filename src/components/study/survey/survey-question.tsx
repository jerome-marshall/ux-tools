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
import { type SurveyQuestionType } from '@/zod-schemas/survey-question.schema'
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

  const questionsName = `tests.${sectionIndex}.questions` as const
  const questions = useWatch({
    control: form.control,
    name: questionsName
  })

  const questionName = `${questionsName}.${index}` as const
  const question = useWatch({
    control: form.control,
    name: questionName
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
            name={`${questionName}.text`}
            render={({ field }) => (
              <Input className='flex-1' {...field} required={true} />
            )}
          />
          <FormField
            control={form.control}
            name={`${questionName}.type`}
            render={({ field }) => (
              <Select
                defaultValue={SURVEY_QUESTION_TYPE.SINGLE_SELECT}
                onValueChange={(value: SurveyQuestionType) => {
                  field.onChange(value)

                  const choiceOptionsName =
                    `${questionName}.multipleChoiceOptions` as const
                  if (
                    value === SURVEY_QUESTION_TYPE.SINGLE_SELECT ||
                    value === SURVEY_QUESTION_TYPE.MULTIPLE_SELECT ||
                    value === SURVEY_QUESTION_TYPE.RANKING
                  ) {
                    form.setValue(choiceOptionsName, ['', ''])

                    // Set randomized to true if the question type is ranking
                    form.setValue(
                      `${questionName}.randomized`,
                      value === SURVEY_QUESTION_TYPE.RANKING
                    )
                  } else {
                    form.setValue(choiceOptionsName, [])
                  }
                }}
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
              name={`${questionName}.required`}
              render={({ field }) => (
                <CheckboxWithLabel
                  label='Required'
                  name={field.name}
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
            <FormField
              control={form.control}
              name={`${questionName}.multipleChoiceOptions`}
              render={({ field }) => (
                <>
                  <ChoicesList
                    form={form}
                    multipleChoiceOptions={field.value}
                    onChange={value => field.onChange(value)}
                    name={`${questionName}.multipleChoiceOptions`}
                    disableFields={disableFields}
                  />
                  <Button
                    size='sm'
                    type='button'
                    className='mt-4 ml-8 w-fit'
                    onClick={() => field.onChange([...field.value, ''])}
                  >
                    Add another choice
                  </Button>
                </>
              )}
            />
          </div>

          <div className='ml-8 grid gap-3'>
            {question.type !== SURVEY_QUESTION_TYPE.RANKING && (
              <FormField
                control={form.control}
                name={`${questionName}.hasOtherOption`}
                render={({ field }) => (
                  <CheckboxWithLabel
                    label='Show "Other" option'
                    name={field.name}
                    checked={!!field.value}
                    onChange={value => field.onChange(value)}
                    className=''
                  />
                )}
              />
            )}
            <FormField
              control={form.control}
              name={`${questionName}.randomized`}
              render={({ field }) => (
                <CheckboxWithLabel
                  label='Randomize the order of choices'
                  checked={!!field.value}
                  onChange={value => field.onChange(value)}
                  className=''
                  name={field.name}
                />
              )}
            />
          </div>
        </>
      )}
    </div>
  )
}

const ChoicesList = ({
  form,
  onChange,
  multipleChoiceOptions,
  name,
  disableFields
}: {
  form: UseFormReturn<StudyWithTestsInsert>
  onChange: (value: string[]) => void
  multipleChoiceOptions: string[]
  name: `tests.${number}.questions.${number}.multipleChoiceOptions`
  disableFields: boolean
}) => {
  if (!multipleChoiceOptions) return null

  return (
    <div className='grid gap-4'>
      {multipleChoiceOptions.map((choice, index) => {
        const choiceName = `${name}.${index}` as const

        const onChoiceChange = (value: string) => {
          const newChoices = [...multipleChoiceOptions]
          newChoices[index] = value
          onChange(newChoices)
        }

        const onRemove = () => {
          const newChoices = [...multipleChoiceOptions]
          newChoices.splice(index, 1)
          onChange(newChoices)
        }

        return (
          <Choice
            key={index}
            value={choice}
            onChange={onChoiceChange}
            name={choiceName}
            removeDisabled={multipleChoiceOptions.length < 3}
            disableFields={disableFields}
            onRemove={onRemove}
          />
        )
      })}
    </div>
  )
}

const Choice = ({
  name,
  onChange,
  ref,
  value,
  removeDisabled,
  disableFields,
  onRemove
}: {
  name: string
  onChange: (value: string) => void
  ref?: (element: HTMLInputElement) => void
  value: string
  removeDisabled: boolean
  disableFields: boolean
  onRemove: () => void
}) => {
  return (
    <div className='flex items-center gap-2'>
      <GripVertical className='text-muted-foreground size-6' />
      <Input
        name={name}
        ref={ref}
        className='flex-1'
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disableFields}
        required={true}
      />
      <Button
        variant='ghost'
        type='button'
        size='icon'
        onClick={onRemove}
        disabled={disableFields || removeDisabled}
      >
        <Trash2 className='size-4' />
      </Button>
    </div>
  )
}
