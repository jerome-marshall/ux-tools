import { CheckboxWithLabel } from '@/components/checkbox-with-label'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form'
import { generateId } from '@/lib/utils'
import { SECTION_TYPE } from '@/utils/study-utils'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { ArrowUpDown, CircleHelp, SortAsc, SortDesc } from 'lucide-react'
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form'
import StudyFormSectionCard from '../study-form-section-card'
import { SurveyQuestion } from './survey-question'
import {
  closestCenter,
  closestCorners,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor
} from '@dnd-kit/core'
import { PointerSensor } from '@dnd-kit/core'
import { useSensors } from '@dnd-kit/core'
import { useState } from 'react'
import { useSensor } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { restrictToParentElement } from '@dnd-kit/modifiers'

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
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isSortmode, setIsSortmode] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

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
      position: questionsFieldArray.fields.length,
      multipleChoiceOptions: []
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

    form.setValue(`tests.${index}.questions`, updatedFields, {
      shouldDirty: true
    })
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = questionsFieldArray.fields.findIndex(
        field => field.id === active.id
      )
      const newIndex = questionsFieldArray.fields.findIndex(field => field.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        questionsFieldArray.move(oldIndex, newIndex)

        // Update positions for remaining questions
        const updatedFields = form.getValues(`tests.${index}.questions`) || []
        updatedFields.forEach((_, idx) => {
          form.setValue(`tests.${index}.questions.${idx}.position`, idx)
        })

        form.setValue(`tests.${index}.questions`, updatedFields, {
          shouldDirty: true
        })
      }
    }
  }

  return (
    <StudyFormSectionCard
      Icon={CircleHelp}
      form={form}
      index={index}
      disableFields={disableFields}
      onRemoveSection={onRemoveSection}
      actionElements={
        <Button
          size='icon'
          type='button'
          variant={isSortmode ? 'default' : 'secondary'}
          className=''
          onClick={() => setIsSortmode(!isSortmode)}
        >
          <ArrowUpDown className='h-4 w-4' />
        </Button>
      }
      content={
        <div className='grid gap-4' id={SECTION_TYPE.SURVEY + `-${index}`}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToParentElement, restrictToVerticalAxis]}
            autoScroll={true}
          >
            <SortableContext
              items={questionsFieldArray.fields.map(field => field.id)}
              strategy={verticalListSortingStrategy}
            >
              {questionsFieldArray.fields.map((field, questionIndex) => (
                <SurveyQuestion
                  key={field.id}
                  id={field.id}
                  form={form}
                  disableFields={disableFields}
                  sectionIndex={index}
                  index={questionIndex}
                  onRemoveQuestion={onRemoveQuestion}
                  isSortMode={isSortmode}
                />
              ))}
              <DragOverlay>
                {activeId && (
                  <SurveyQuestion
                    key={activeId}
                    id={activeId}
                    form={form}
                    disableFields={disableFields}
                    sectionIndex={index}
                    index={questionsFieldArray.fields.findIndex(
                      field => field.id === activeId
                    )}
                    onRemoveQuestion={onRemoveQuestion}
                    isSortMode={isSortmode}
                    isOverlay={true}
                  />
                )}
              </DragOverlay>
            </SortableContext>
          </DndContext>
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
                  name={field.name}
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
