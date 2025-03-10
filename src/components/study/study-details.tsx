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
import { type StudyInsert } from '@/server/db/schema'
import ProjectsDropdown from './projects-dropdown'
import StudyFormCard from './study-form-card'

const StudyDetails = ({ form }: { form: UseFormReturn<StudyInsert> }) => {
  return (
    <StudyFormCard
      title='Study details'
      icon={<Text className='icon' />}
      content={
        <div className='grid grid-cols-2 gap-6' id='study-details-form'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter test name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ProjectsDropdown form={form} />
        </div>
      }
    />
  )
}

export default StudyDetails
