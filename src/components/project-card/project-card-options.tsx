'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { EllipsisVertical, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { RenameProjectDialog } from '../project/rename-project-dialog'
import { type ProjectWithStudiesCount } from '@/types'
import { ArchiveProjectDialog } from '../project/archive-project-dialog'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const ProjectCardOptions = ({ project }: { project: ProjectWithStudiesCount }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)

  const isArchived = project.archived

  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mutate: updateArchiveStatus, isPending } = useMutation(
    trpc.projects.updateArchiveStatus.mutationOptions({
      onSuccess: data => {
        const isArchivedStatus = data.archived

        toast.success(isArchivedStatus ? 'Project archived' : 'Project unarchived', {
          description: project.name
        })

        void queryClient.invalidateQueries({
          queryKey: trpc.projects.getProjects.queryKey()
        })
        void queryClient.invalidateQueries({
          queryKey: trpc.projects.getRecentProjects.queryKey()
        })
      }
    })
  )

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
            disabled={isPending}
          >
            {isPending ? (
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
              disabled={isPending}
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
