'use client'

import { ChevronsUpDown } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { type RefCallBack } from 'react-hook-form'

const ProjectsDropdown = ({
  ref,
  disabled,
  onSelectChange,
  initialValue,
  error
}: {
  ref?: RefCallBack
  disabled?: boolean
  onSelectChange: (value: string) => void
  initialValue?: string | null
  error?: boolean
}) => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState<string | null>(initialValue ?? null)

  const projectSelectRef = React.useRef<HTMLDivElement>(null)
  const [popoverContainer, setPopoverContainer] = React.useState<HTMLElement | null>(null)

  const trpc = useTRPC()
  const { data: projects, isPending } = useQuery(
    trpc.projects.getProjects.queryOptions({ getAll: true })
  )

  const projectOptions = projects?.map(project => ({
    value: project.id.toString(),
    label: project.name,
    archived: project.archived
  }))

  // Update value when initialValue changes
  React.useEffect(() => {
    if (initialValue !== undefined) {
      setValue(initialValue)
    }
  }, [initialValue])

  React.useEffect(() => {
    if (projectSelectRef.current) {
      setPopoverContainer(projectSelectRef.current)
    }

    // Cleanup function
    return () => {
      setPopoverContainer(null)
    }
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          className={cn(
            'h-10 w-full justify-between',
            error &&
              'border-red-500 focus-visible:border-red-500 focus-visible:ring-[3px] focus-visible:ring-red-500/20'
          )}
          ref={ref}
          disabled={isPending || disabled}
        >
          {isPending ? (
            <span>Fetching projects...</span>
          ) : value ? (
            projectOptions?.find(project => project.value === value)?.label
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
                  const isSelected = value === project.value
                  return (
                    <CommandItem
                      key={project.value}
                      value={project.value}
                      onSelect={value => {
                        onSelectChange(value)
                        setValue(value)
                        setOpen(false)
                      }}
                      className={cn(
                        'flex items-center justify-between gap-2',
                        isSelected && 'bg-gray-200'
                      )}
                    >
                      {project.label}
                      {project.archived && (
                        <span className='rounded-full bg-gray-200 px-2 py-0.5 text-xs'>
                          Archived
                        </span>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </div>
    </Popover>
  )
}

export default ProjectsDropdown
