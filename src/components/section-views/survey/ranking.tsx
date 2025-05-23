import { cn } from '@/lib/utils'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
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
import { useState } from 'react'

interface RankingProps {
  values: string[]
  onChange: (values: string[]) => void
}

export const RankingDnDGroup = ({ values, onChange }: RankingProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragMove(event: DragMoveEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = values.findIndex(choice => choice === active.id)
      const newIndex = values.findIndex(choice => choice === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        const newChoices = arrayMove(values, oldIndex, newIndex)
        onChange(newChoices)
      }
    }
  }

  function handleDragEnd(_event: DragEndEvent) {
    setActiveId(null)
  }

  return (
    <div className='grid gap-3'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragMove}
        modifiers={[restrictToParentElement, restrictToVerticalAxis]}
        autoScroll={false}
      >
        <SortableContext items={values} strategy={verticalListSortingStrategy}>
          {values.map((choice, idx) => (
            <RankingDnDItem key={choice} id={choice} label={choice} index={idx} />
          ))}
          <DragOverlay>
            {activeId ? (
              <RankingDnDItem
                id={activeId}
                label={activeId}
                isOverlay
                index={values.findIndex(v => v === activeId)}
              />
            ) : null}
          </DragOverlay>
        </SortableContext>
      </DndContext>
    </div>
  )
}

const RankingDnDItem = ({
  id,
  label,
  index,
  isOverlay
}: {
  id: string
  label: string
  index: number
  isOverlay?: boolean
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id
    })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }
  return (
    <div
      className={cn(
        'flex w-full cursor-grab items-center gap-3 rounded-md border bg-white p-3',
        isOverlay && 'cursor-grabbing shadow-md',
        isDragging && 'opacity-0'
      )}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <span className='flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-700'>
        {index + 1}
      </span>
      <p className='text-base font-medium'>{label}</p>
    </div>
  )
}
