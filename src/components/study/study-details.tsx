'use client'

import { Text } from 'lucide-react'
import { type UseFormReturn } from 'react-hook-form'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const StudyDetails = ({ form }: { form: UseFormReturn<StudyInsert> }) => {
  return (
    <Card className=''>
      <CardHeader>
        <div className='flex items-center gap-4'>
          <Text className='icon' />
          <CardTitle>Study details</CardTitle>
        </div>
        {/* <CardDescription>Enter the details for your new test</CardDescription> */}
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}

export default StudyDetails
