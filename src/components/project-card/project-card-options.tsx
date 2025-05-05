'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useUpdateArchiveStatus } from '@/hooks/use-update-archive-status'
import { cn } from '@/lib/utils'
import { type ProjectWithStudiesCount } from '@/types'
import { EllipsisVertical, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { ArchiveProjectDialog } from '../project/archive-project-dialog'
import { RenameProjectDialog } from '../project/rename-project-dialog'

const ProjectCardOptions = ({ project }: { project: ProjectWithStudiesCount }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)

  const isArchived = project.archived

  const { updateArchiveStatus, isArchiveStatusPending } = useUpdateArchiveStatus({
    projectName: project.name
  })

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className={cn(
              'absolute top-3 right-2 size-8',
              isOpen && 'border border-gray-200 bg-gray-100'
            )}
            disabled={isArchiveStatusPending}
          >
            {isArchiveStatusPending ? (
              <Loader2Icon className='text-muted-foreground size-4 animate-spin' />
            ) : (
              <EllipsisVertical className='text-muted-foreground size-4' />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-40' align='start'>
          <DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)}>
            Rename
          </DropdownMenuItem>
          {isArchived ? (
            <DropdownMenuItem
              onClick={() => updateArchiveStatus({ id: project.id, archived: false })}
              disabled={isArchiveStatusPending}
            >
              Unarchive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setIsArchiveDialogOpen(true)}>
              Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuItem variant='destructive'>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <RenameProjectDialog
        project={project}
        isOpen={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
      />
      <ArchiveProjectDialog
        project={project}
        isOpen={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
      />
    </>
  )
}

export default ProjectCardOptions
