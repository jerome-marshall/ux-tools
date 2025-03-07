'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { EllipsisVertical } from 'lucide-react'
import { useState } from 'react'

const ProjectCardOptions = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-40' align='start'>
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuItem>Archive</DropdownMenuItem>
        <DropdownMenuItem variant='destructive'>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProjectCardOptions
