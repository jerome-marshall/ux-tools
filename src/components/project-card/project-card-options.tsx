'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useUpdateArchiveStatus } from '@/hooks/project/use-update-archive-status'
import { cn } from '@/lib/utils'
import { type Project } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { EllipsisVertical, Loader2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArchiveProjectDialog } from '../project/archive-project-dialog'
import { DeleteProjectDialog } from '../project/delete-project-dialog'
import { RenameProjectDialog } from '../project/rename-project-dialog'

const ProjectCardOptions = ({
  project,
  triggerClassName,
  triggerVariant = 'ghost',
  triggerOpenClassName,
  onDeleteSuccess,
  onArchiveSuccess,
  deleteRedirectUrl
}: {
  project: Project
  triggerClassName?: string
  triggerOpenClassName?: string
  triggerVariant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'muted'
  deleteRedirectUrl?: string
  onDeleteSuccess?: (project: Project) => void
  onArchiveSuccess?: (isArchived: boolean) => void
}) => {
  const trpc = useTRPC()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: projectData, isLoading } = useQuery({
    ...trpc.projects.getProjectById.queryOptions({
      id: project.id
    }),
    initialData: project
  })

  const isArchived = projectData?.archived

  const { updateArchiveStatus, isArchiveStatusPending } = useUpdateArchiveStatus({
    onSuccess: isArchived => {
      onArchiveSuccess?.(isArchived)
    }
  })

  const isActionPending = isArchiveStatusPending || isLoading

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={triggerVariant}
            size='icon'
            className={cn(
              isOpen && 'border border-gray-200 bg-gray-100',
              triggerClassName,
              isOpen && triggerOpenClassName
            )}
            disabled={isActionPending}
          >
            {isActionPending ? (
              <Loader2Icon className='size-4 animate-spin' />
            ) : (
              <EllipsisVertical className='size-4' />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-40' align='start'>
          <DropdownMenuItem
            onClick={() => {
              setIsRenameDialogOpen(true)
              setIsOpen(false)
            }}
          >
            Rename
          </DropdownMenuItem>
          {isArchived ? (
            <DropdownMenuItem
              onClick={() =>
                updateArchiveStatus({ id: projectData?.id, archived: false })
              }
              disabled={isArchiveStatusPending}
            >
              Unarchive
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => {
                setIsArchiveDialogOpen(true)
                setIsOpen(false)
              }}
            >
              Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant='destructive'
            onClick={() => {
              setIsDeleteDialogOpen(true)
              setIsOpen(false)
            }}
          >
            Delete
          </DropdownMenuItem>
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
      <DeleteProjectDialog
        project={project}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleteSuccess={deletedProject => {
          onDeleteSuccess?.(deletedProject)
          if (deleteRedirectUrl) {
            router.push(deleteRedirectUrl)
          }
        }}
      />
    </>
  )
}

export default ProjectCardOptions
