'use client'

import { Text } from 'lucide-react'
import { type UseFormReturn } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SECTION_TYPE } from '@/utils/study-utils'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import ProjectsDropdown from './projects-dropdown'
import StudySectionCard from './study-form-card'

const StudyDetails = ({
  form,
  disableFields
}: {
  form: UseFormReturn<StudyWithTestsInsert>
  disableFields: boolean
}) => {
  return (
    <StudySectionCard
      title='Study details'
      icon={<Text className='icon' />}
      content={
        <div className='grid grid-cols-2 gap-6' id={SECTION_TYPE.STUDY_DETAILS}>
          <FormField
            control={form.control}
            name='study.name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Study name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter study name'
                    {...field}
                    disabled={disableFields}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='study.projectId'
            render={({ field }) => (
              <FormItem className='items-start gap-0'>
                <FormLabel className='mb-2'>Project</FormLabel>
                <FormControl>
                  <ProjectsDropdown
                    ref={field.ref}
                    disabled={disableFields}
                    onSelectChange={field.onChange}
                    initialValue={field.value}
                    error={!!form.formState.errors.study?.projectId}
                  />
                </FormControl>
                <FormMessage className='mt-2' />
              </FormItem>
            )}
          />
        </div>
      }
    />
  )
}

export default StudyDetails
