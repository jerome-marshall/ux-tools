import { CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { Pencil, Trash, type LucideIcon } from 'lucide-react'
import { type UseFormReturn } from 'react-hook-form'
import { FormField } from '../ui/form'
import StudyFormCard from './study-form-card'
import { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const StudyFormSectionCard = ({
  Icon,
  form,
  index,
  disableFields,
  onRemoveSection,
  content,
  actionElements
}: {
  Icon: LucideIcon
  form: UseFormReturn<StudyWithTestsInsert>
  index: number
  disableFields: boolean
  onRemoveSection: (index: number) => void
  content: React.ReactNode
  actionElements?: React.ReactNode
}) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false)
  const [isHoveringTitle, setIsHoveringTitle] = useState<boolean>(false)

  const handleNameBlur = () => {
    setIsEditingName(false)
  }

  // Clear hover state when mouse leaves the component
  const handleMouseLeave = () => {
    if (!disableFields) {
      setIsHoveringTitle(false)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingName(false)
    } else if (e.key === 'Escape') {
      setIsEditingName(false)
    }
  }

  return (
    <StudyFormCard
      CustomHeader={
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Icon className='icon' />
            <FormField
              control={form.control}
              name={`tests.${index}.name`}
              render={({ field: formField }) => (
                <div
                  className='relative flex items-center gap-2'
                  onMouseEnter={() => {
                    if (!disableFields) {
                      setIsHoveringTitle(true)
                    }
                  }}
                  onMouseLeave={handleMouseLeave}
                >
                  {isEditingName ? (
                    <Input
                      {...formField}
                      onBlur={() => {
                        formField.onBlur()
                        handleNameBlur()
                      }}
                      onKeyDown={handleNameKeyDown}
                      autoFocus
                      className='h-8 py-0 text-lg font-semibold'
                    />
                  ) : (
                    <CardTitle
                      onClick={() => {
                        if (!disableFields) {
                          setIsEditingName(true)
                        }
                      }}
                      className={cn(
                        'cursor-pointer',
                        disableFields && 'pointer-events-none cursor-default'
                      )}
                    >
                      {index + 1}. {formField.value}
                    </CardTitle>
                  )}
                  {isHoveringTitle && !isEditingName && !disableFields && (
                    <Pencil
                      size={16}
                      className={cn(
                        'text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
                      )}
                      onClick={() => {
                        if (!disableFields) {
                          setIsEditingName(true)
                        }
                      }}
                    />
                  )}
                </div>
              )}
            />
          </div>
          <div className='flex items-center gap-2'>
            {actionElements}
            <Button
              variant='destructive'
              size='icon'
              onClick={() => onRemoveSection(index)}
              disabled={disableFields}
            >
              <Trash className='size-4' />
            </Button>
          </div>
        </div>
      }
      content={content}
    />
  )
}

export default StudyFormSectionCard
