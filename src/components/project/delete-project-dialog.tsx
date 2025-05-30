'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useDeleteProject } from '@/hooks/project/use-delete-project'
import { type Project } from '@/server/db/schema'
import { Trash2Icon } from 'lucide-react'

export function DeleteProjectDialog({
  project,
  isOpen,
  onOpenChange,
  onDeleteSuccess
}: {
  project: Project
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDeleteSuccess?: (project: Project) => void
}) {
  const { deleteProject, isDeletePending } = useDeleteProject({
    projectId: project.id,
    onSuccess: deletedProject => {
      onOpenChange(false)
      onDeleteSuccess?.(deletedProject)
    }
  })

  const handleDelete = () => {
    deleteProject({ id: project.id })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Delete this project?</DialogTitle>
          <DialogDescription className='mt-1 text-base'>
            Are you sure you want to permanently delete your project and all studies? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className='my-4'>
          <div className='flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4'>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-red-100'>
              <Trash2Icon className='size-4 text-red-500' />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-medium text-red-900'>Project to be deleted:</p>
              <p className='text-base font-semibold text-red-800'>{project.name}</p>
            </div>
          </div>
        </div>
        <DialogFooter className='mt-2'>
          <Button
            type='button'
            variant='ghost'
            onClick={e => {
              e.stopPropagation()
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={e => {
              e.stopPropagation()
              handleDelete()
            }}
            disabled={isDeletePending}
          >
            {isDeletePending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
