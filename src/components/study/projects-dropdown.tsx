'use client'

import { ChevronsUpDown } from 'lucide-react'
import React from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'

interface ProjectsDropdownProps {
  form: UseFormReturn<StudyWithTestsInsert>
}

const ProjectsDropdown = ({ form }: ProjectsDropdownProps) => {
  const projectSelectRef = React.useRef<HTMLDivElement>(null)
  const [popoverContainer, setPopoverContainer] = React.useState<HTMLElement | null>(null)
  const [open, setOpen] = React.useState(false)

  const trpc = useTRPC()
  const { data: projects, isPending } = useQuery(trpc.projects.getProjects.queryOptions())

  const projectOptions = projects?.map(project => ({
    value: project.id.toString(),
    label: project.name
  }))

  React.useEffect(() => {
    if (projectSelectRef.current) {
      setPopoverContainer(projectSelectRef.current)
    }
  }, [])

  return (
    <FormField
      control={form.control}
      name='study.projectId'
      render={({ field }) => (
        <FormItem className='items-start gap-0'>
          <FormLabel className='mb-2'>Project</FormLabel>
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  className='h-10 w-full justify-between'
                  ref={field.ref}
                  disabled={isPending}
                >
                  {isPending ? (
                    <span>Loading...</span>
                  ) : field.value ? (
                    projectOptions?.find(project => project.value === field.value)?.label
                  ) : (
                    'Select project...'
                  )}
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
                        {projectOptions?.map(project => {
                          const isSelected = field.value === project.value
                          return (
                            <CommandItem
                              key={project.value}
                              value={project.value}
                              onSelect={value => {
                                form.setValue('study.projectId', value)
                                void form.trigger('study.projectId')
                                setOpen(false)
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
          <FormMessage className='mt-2' />
        </FormItem>
      )}
    />
  )
}

export default ProjectsDropdown
