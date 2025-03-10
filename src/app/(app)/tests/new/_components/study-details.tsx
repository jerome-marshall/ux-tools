'use client'

import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

const projects = [
  { value: 'project1', label: 'Project 1' },
  { value: 'project2', label: 'Project 2' },
  { value: 'project3', label: 'Project 3' }
]

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  project: z.string().min(1, { message: 'Please select a project.' })
})

const StudyDetails = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      project: ''
    }
  })

  const projectSelectRef = React.useRef<HTMLDivElement>(null)
  const [popoverContainer, setPopoverContainer] = React.useState<HTMLElement | null>(null)

  // Set the container element after the component mounts
  React.useEffect(() => {
    if (projectSelectRef.current) {
      setPopoverContainer(projectSelectRef.current)
    }
  }, [])

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data)
    // Handle form submission
  }

  return (
    <Card className=''>
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Enter the details for your new test</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid grid-cols-2 gap-6'
            id='study-details-form'
          >
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
                            ? projects.find(project => project.value === field.value)
                                ?.label
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
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default StudyDetails
