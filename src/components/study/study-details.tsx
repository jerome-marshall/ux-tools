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
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import ProjectsDropdown from './projects-dropdown'
import { SECTION_ID } from './study-form'
import StudyFormCard from './study-form-card'

const StudyDetails = ({
  form,
  disableFields
}: {
  form: UseFormReturn<StudyWithTestsInsert>
  disableFields: boolean
}) => {
  return (
    <StudyFormCard
      title='Study details'
      icon={<Text className='icon' />}
      content={
        <div className='grid grid-cols-2 gap-6' id={SECTION_ID.STUDY_DETAILS}>
          <FormField
            control={form.control}
            name='study.name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter test name'
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
