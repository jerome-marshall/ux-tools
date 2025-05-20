import { cn } from '@/lib/utils'
import { getIcon, SECTION_TYPE } from '@/utils/study-utils'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { type TestType } from '@/zod-schemas/test.schema'
import { BadgePlus, type LucideIcon } from 'lucide-react'
import { type UseFormReturn } from 'react-hook-form'
import { FormField, FormMessage } from '../ui/form'
import StudySectionCard from './study-form-card'

const StudyAddSection = ({
  onAddSection,
  form,
  disableFields
}: {
  onAddSection: (testType: TestType) => void
  form: UseFormReturn<StudyWithTestsInsert>
  disableFields: boolean
}) => {
  return (
    <FormField
      control={form.control}
      name='tests'
      render={({ field }) => (
        <StudySectionCard
          title='Add a section'
          icon={<BadgePlus className='icon' />}
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
    id: SECTION_TYPE.TREE_TEST,
    name: 'Tree test',
    description:
      'Validate your information architecture by asking participants to locate specific items in a tree structure',
    icon: getIcon(SECTION_TYPE.TREE_TEST)
  },
  {
    id: SECTION_TYPE.SURVEY,
    name: 'Survey',
    description:
      'Ask survey questions, including open text, multiple choice, linear scale, and ranking',
    icon: getIcon(SECTION_TYPE.SURVEY)
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
