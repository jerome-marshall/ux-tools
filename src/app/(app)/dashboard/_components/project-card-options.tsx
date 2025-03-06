'use client'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { EllipsisVertical } from 'lucide-react'
import { useState } from 'react'
const btnClasses = 'justify-start rounded-none p-3'

const ProjectCardOptions = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={cn(
            'absolute top-3 right-2 size-8',
            isOpen && 'border border-gray-200 bg-gray-100'
          )}
        >
          <EllipsisVertical className='text-muted-foreground size-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-40 p-0' align='start'>
        <div className='grid'>
          <Button variant='ghost' size='lg' className={cn(btnClasses, '')}>
            <p>Rename</p>
          </Button>
          <Button variant='ghost' size='lg' className={cn(btnClasses, '')}>
            <p>Archive</p>
          </Button>
          <Button
            variant='ghost'
            size='lg'
            className={cn(
              btnClasses,
              'text-destructive-foreground hover:text-destructive'
            )}
          >
            <p>Delete</p>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ProjectCardOptions
