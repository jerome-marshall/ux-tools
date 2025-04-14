import { ListTree, type LucideIcon } from 'lucide-react'
import StudyFormCard from './study-form-card'
import { type TestType } from '@/server/db/schema'
import { type UseFormReturn } from 'react-hook-form'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { FormField, FormMessage } from '../ui/form'
import { cn } from '@/lib/utils'

const StudyAddSection = ({
  onAddSection,
  form,
  disableFields
}: {
  onAddSection: (testType: TestType) => void
  form: UseFormReturn<StudyWithTestsInsert>
  disableFields: boolean
}) => {
  const errors = form.formState.errors
  return (
    <FormField
      control={form.control}
      name='tests'
      render={({ field }) => (
        <StudyFormCard
          title='Add a section'
          icon={<ListTree className='icon' />}
          content={
            <div className='relative' ref={field.ref}>
              <FormMessage className='absolute -top-13 left-12' />

              <div
                className='grid grid-cols-2 gap-6 focus:outline'
                id='study-details-form'
              >
                {studySections.map(section => (
                  <StudySection
                    key={section.id}
                    section={section}
                    onAddSection={onAddSection}
                    disabled={disableFields}
                  />
                ))}
              </div>
            </div>
          }
        />
      )}
    />
  )
}

const studySections: {
  id: TestType
  name: string
  description: string
  icon: LucideIcon
}[] = [
  {
    id: 'TREE_TEST',
    name: 'Tree test',
    description:
      'Validate your information architecture by asking participants to locate specific items in a tree structure',
    icon: ListTree
  }
]

const StudySection = ({
  section,
  onAddSection,
  disabled
}: {
  section: (typeof studySections)[number]
  onAddSection: (testType: TestType) => void
  disabled: boolean
}) => {
  const Icon = section.icon

  return (
    <div
      className={cn(
        'flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors duration-100 hover:bg-gray-100',
        disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
      )}
      onClick={() => {
        if (!disabled) {
          onAddSection(section.id)
        }
      }}
    >
      <Icon className='icon' />
      <div className='flex flex-1 flex-col'>
        <p className='text-base font-medium'>{section.name}</p>
        <p className='text-muted-foreground text-sm'>{section.description}</p>
      </div>
    </div>
  )
}

export default StudyAddSection
