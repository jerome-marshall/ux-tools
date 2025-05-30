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
import { studyEditUrl, studyPreviewUrl } from '@/utils/urls'
import { EllipsisVerticalIcon, ExternalLinkIcon } from 'lucide-react'
import { useState } from 'react'
import Link from '../link'
import { Button } from '../ui/button'
import { DeleteStudyDialog } from '../study/delete-study-dialog'
import { RenameStudyDialog } from '../study/rename-study-dialog'
import { DuplicateStudyDialog } from '../study/duplicate-study-dialog'

enum DIALOG {
  DELETE = 'delete',
  RENAME = 'rename',
  DUPLICATE = 'duplicate'
}

const StudyCardOptions = ({
  study,
  triggerClassName
}: {
  study: Study
  triggerClassName?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [openDialog, setOpenDialog] = useState<DIALOG | null>(null)

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size={'icon'}
            className={cn('text-muted-foreground size-8', triggerClassName, {
              'border border-gray-200 bg-gray-100': isOpen
            })}
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
              onClick={() => setIsOpen(false)}
            >
              <span>Preview</span>
              <ExternalLinkIcon className='size-4' />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className='m-0' />
          <DropdownMenuItem
            onClick={() => {
              setOpenDialog(DIALOG.RENAME)
              setIsOpen(false)
            }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={studyEditUrl(study.id)} onClick={() => setIsOpen(false)}>
              <span>Edit</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpenDialog(DIALOG.DUPLICATE)
              setIsOpen(false)
            }}
          >
            Duplicate
          </DropdownMenuItem>
          {/* <DropdownMenuItem
            onClick={() => {
              // Handle move
            }}
          >
            Move
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              // Handle archive
            }}
          >
            Archive
          </DropdownMenuItem> */}
          <DropdownMenuItem
            variant='destructive'
            onClick={() => {
              setOpenDialog(DIALOG.DELETE)
              setIsOpen(false)
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteStudyDialog
        study={study}
        isOpen={openDialog === DIALOG.DELETE}
        onOpenChange={open => setOpenDialog(open ? DIALOG.DELETE : null)}
      />
      <RenameStudyDialog
        study={study}
        isOpen={openDialog === DIALOG.RENAME}
        onOpenChange={open => setOpenDialog(open ? DIALOG.RENAME : null)}
      />
      <DuplicateStudyDialog
        study={study}
        isOpen={openDialog === DIALOG.DUPLICATE}
        onOpenChange={open => setOpenDialog(open ? DIALOG.DUPLICATE : null)}
      />
    </>
  )
}

export default StudyCardOptions
