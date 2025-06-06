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
import { cn, generateId } from '@/lib/utils'
import {
  SURVEY_QUESTION_TYPE,
  SURVEY_QUESTION_TYPE_NAME,
  surveyQuestionTypeOptions
} from '@/utils/study-utils'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { type SurveyQuestionType } from '@/zod-schemas/survey-question.schema'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { type UseFormReturn, useWatch } from 'react-hook-form'

export const SurveyQuestion = ({
  disableFields,
  index,
  onRemoveQuestion,
  form,
  sectionIndex,
  isSortMode,
  isOverlay,
  questionFieldId
}: {
  form: UseFormReturn<StudyWithTestsInsert>
  disableFields: boolean
  index: number
  sectionIndex: number
  onRemoveQuestion: (index: number) => void
  isSortMode: boolean
  questionFieldId: string
  isOverlay?: boolean
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

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: questionFieldId
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const hasChoices =
    question.type === SURVEY_QUESTION_TYPE.SINGLE_SELECT ||
    question.type === SURVEY_QUESTION_TYPE.MULTIPLE_SELECT ||
    question.type === SURVEY_QUESTION_TYPE.RANKING

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'grid gap-6 rounded-md border bg-white p-4',
        isDragging && 'opacity-0',
        isSortMode && 'shadow-md',
        isOverlay && 'shadow-lg'
      )}
    >
      <div className='relative flex items-center justify-between'>
        <p className={titleClassName}>
          {sectionIndex + 1}.{question.position + 1}.{' '}
          {SURVEY_QUESTION_TYPE_NAME[question.type]} question
        </p>
        <div className='absolute -right-2'>
          <Button
            variant='ghost'
            size='icon'
            disabled={isSortMode || disableFields || questions.length === 1}
            onClick={() => onRemoveQuestion(index)}
          >
            <Trash className='size-4' />
          </Button>
        </div>
      </div>

      <div className='grid'>
        <p className={cn(titleClassName, 'mb-2')}>Question</p>
        <div className='flex items-center gap-2'>
          {isSortMode && !disableFields && (
            <GripVertical
              className='text-muted-foreground size-6 cursor-grab active:cursor-grabbing'
              {...listeners}
              {...attributes}
            />
          )}
          <FormField
            control={form.control}
            name={`${questionName}.text`}
            render={({ field }) => (
              <Input
                className='flex-1'
                {...field}
                required={true}
                disabled={isSortMode || disableFields || isOverlay}
              />
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
                    form.setValue(choiceOptionsName, [
                      {
                        id: generateId(),
                        value: ''
                      },
                      {
                        id: generateId(),
                        value: ''
                      }
                    ])

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
                disabled={isSortMode || disableFields || isOverlay}
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
                  disabled={isSortMode || disableFields || isOverlay}
                />
              )}
            />
          )}
        </div>
      </div>

      {hasChoices && !isSortMode && (
        <>
          <div className='grid'>
            <p className={cn(titleClassName, '')}>
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
                    onChange={value => {
                      field.onChange(value)
                    }}
                    name={`${questionName}.multipleChoiceOptions`}
                    disableFields={disableFields}
                  />
                  <Button
                    size='sm'
                    type='button'
                    className='mt-4 ml-8 w-fit'
                    onClick={() =>
                      field.onChange([...field.value, { id: generateId(), value: '' }])
                    }
                    disabled={disableFields}
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
                    disabled={disableFields}
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
                  disabled={disableFields}
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
  onChange: (value: { id: string; value: string }[]) => void
  multipleChoiceOptions: { id: string; value: string }[]
  name: `tests.${number}.questions.${number}.multipleChoiceOptions`
  disableFields: boolean
}) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  if (!multipleChoiceOptions) return null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = multipleChoiceOptions.findIndex(choice => choice.id === active.id)
      const newIndex = multipleChoiceOptions.findIndex(choice => choice.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newChoices = arrayMove(multipleChoiceOptions, oldIndex, newIndex)
        onChange(newChoices)
      }
    }
  }

  return (
    <div className='grid'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement, restrictToVerticalAxis]}
        autoScroll={false}
      >
        <SortableContext
          items={multipleChoiceOptions}
          strategy={verticalListSortingStrategy}
        >
          {multipleChoiceOptions.map((choice, index) => {
            const choiceName = `${name}.${index}` as const

            const onChoiceChange = (value: { id: string; value: string }) => {
              const newChoices = [...multipleChoiceOptions]
              newChoices[index] = value
              onChange(newChoices)
            }

            const onAddChoice = () => {
              const newChoices = [...multipleChoiceOptions]
              const newChoice = { id: generateId(), value: '' }
              newChoices.push(newChoice)
              onChange(newChoices)

              return newChoice.id
            }

            const onRemove = () => {
              if (multipleChoiceOptions.length < 3) {
                return null
              }

              const newChoices = [...multipleChoiceOptions]
              newChoices.splice(index, 1)
              onChange(newChoices)

              return newChoices[newChoices.length - 1].id
            }

            return (
              <Choice
                key={choice.id}
                id={choice.id}
                choice={choice}
                onChange={onChoiceChange}
                name={choiceName}
                removeDisabled={multipleChoiceOptions.length < 3}
                disableFields={disableFields}
                onAddChoice={onAddChoice}
                onRemove={onRemove}
              />
            )
          })}
          <DragOverlay>
            {activeId ? (
              <Choice
                key={activeId}
                id={activeId}
                name={activeId}
                choice={
                  multipleChoiceOptions.find(choice => choice.id === activeId) as {
                    id: string
                    value: string
                  }
                }
                removeDisabled={multipleChoiceOptions.length < 3}
                disableFields={disableFields}
                isOverlay={true}
              />
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </div>
  )
}

const Choice = ({
  id,
  name,
  onChange,
  ref,
  choice,
  removeDisabled,
  disableFields,
  onRemove,
  isOverlay,
  onAddChoice
}: {
  id: string
  name: string
  onChange?: (value: { id: string; value: string }) => void
  ref?: (element: HTMLInputElement) => void
  choice: { id: string; value: string }
  removeDisabled: boolean
  disableFields: boolean
  onRemove?: () => string | null
  isOverlay?: boolean
  onAddChoice?: () => string
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: choice.id
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 bg-white py-2',
        isOverlay && 'border py-2',
        isDragging && 'opacity-0'
      )}
      ref={setNodeRef}
      style={style}
    >
      <GripVertical
        className={cn(
          'text-muted-foreground size-6 cursor-grab active:cursor-grabbing',
          disableFields && 'pointer-events-none cursor-default opacity-50'
        )}
        {...listeners}
        {...attributes}
      />
      <Input
        id={'input-' + id}
        name={name}
        ref={ref}
        className='flex-1'
        value={choice.value}
        onChange={e =>
          onChange?.({
            id: choice.id,
            value: e.target.value
          })
        }
        onKeyDown={e => {
          if (disableFields) return

          if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault()
            e.stopPropagation()

            const newChoiceId = onAddChoice?.()

            if (newChoiceId) {
              // Focus the next input
              setTimeout(() => {
                const nextInput = document.getElementById(
                  'input-' + newChoiceId
                ) as HTMLInputElement
                if (nextInput) {
                  nextInput.focus()
                }
              }, 100)
            }
          }

          if (e.key === 'Backspace') {
            if (choice.value === '') {
              const nextId = onRemove?.()
              if (nextId) {
                setTimeout(() => {
                  const nextInput = document.getElementById(
                    'input-' + nextId
                  ) as HTMLInputElement
                  if (nextInput) {
                    nextInput.focus()
                  }
                }, 100)
              }
            }
          }
        }}
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
