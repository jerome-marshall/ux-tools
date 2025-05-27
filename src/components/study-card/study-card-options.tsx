'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { type Study } from '@/server/db/schema'
import { studyPreviewUrl } from '@/utils/urls'
import { EllipsisVerticalIcon, ExternalLinkIcon } from 'lucide-react'
import { useState } from 'react'
import Link from '../link'
import { Button } from '../ui/button'

const StudyCardOptions = ({ study }: { study: Study }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size={'icon'}
          className={cn('text-muted-foreground size-8', {
            'border border-gray-200 bg-gray-100': isOpen
          })}
          onClick={e => {
            e.stopPropagation()
          }}
        >
          <EllipsisVerticalIcon className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className=''>
        <DropdownMenuItem asChild key={'preview'}>
          <Link
            href={studyPreviewUrl(study.id)}
            target='_blank'
            className='flex cursor-pointer items-center justify-between gap-2'
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <span>Preview</span>
            <ExternalLinkIcon className='size-4' />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className='m-0' />
        <DropdownMenuItem
          onClick={e => {
            e.stopPropagation()
            // Handle rename
          }}
        >
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={e => {
            e.stopPropagation()
            // Handle edit
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={e => {
            e.stopPropagation()
            // Handle duplicate
          }}
        >
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={e => {
            e.stopPropagation()
            // Handle move
          }}
        >
          Move
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={e => {
            e.stopPropagation()
            // Handle archive
          }}
        >
          Archive
        </DropdownMenuItem>
        <DropdownMenuItem
          variant='destructive'
          onClick={e => {
            e.stopPropagation()
            // Handle delete
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default StudyCardOptions
