'use client'

import { ChevronsUpDown, Text } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import React from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { type z } from 'zod'
import { type FormSchema } from './study-form'

const projects = [
  { value: 'project1', label: 'Project 1' },
  { value: 'project2', label: 'Project 2' },
  { value: 'project3', label: 'Project 3' }
]

const StudyDetails = ({ form }: { form: UseFormReturn<z.infer<typeof FormSchema>> }) => {
  const projectSelectRef = React.useRef<HTMLDivElement>(null)
  const [popoverContainer, setPopoverContainer] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    if (projectSelectRef.current) {
      setPopoverContainer(projectSelectRef.current)
    }
  }, [])

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

          <FormField
            control={form.control}
            name='project'
            render={({ field }) => (
              <FormItem className='items-start gap-0'>
                <FormLabel className='mb-2'>Project</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        role='combobox'
                        className='h-10 w-full justify-between'
                        ref={field.ref}
                      >
                        {field.value
                          ? projects.find(project => project.value === field.value)?.label
                          : 'Select project...'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <div ref={projectSelectRef} className='relative w-full'>
                      <PopoverContent
                        className='p-0'
                        container={popoverContainer}
                        align='start'
                        sideOffset={4}
                        avoidCollisions={false}
                        style={{ minWidth: 'var(--radix-popover-trigger-width)' }}
                      >
                        <Command className='w-full'>
                          <CommandInput placeholder='Search project...' />
                          <CommandList>
                            <CommandEmpty>No project found.</CommandEmpty>
                            <CommandGroup>
                              {projects.map(project => {
                                const isSelected = field.value === project.value
                                return (
                                  <CommandItem
                                    key={project.value}
                                    value={project.value}
                                    onSelect={value => {
                                      form.setValue('project', value)
                                      void form.trigger('project')
                                    }}
                                    className={cn(
                                      'flex items-center gap-2',
                                      isSelected && 'bg-gray-200'
                                    )}
                                  >
                                    {project.label}
                                  </CommandItem>
                                )
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </div>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default StudyDetails
