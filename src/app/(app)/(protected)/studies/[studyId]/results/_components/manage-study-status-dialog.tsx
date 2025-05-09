import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { type Project, type Study } from '@/server/db/schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import { toast } from 'sonner'
import { useUpdateArchiveStatus } from '@/hooks/use-update-archive-status'

const ManageStudyStatusDialog = ({
  isOpen,
  onOpenChange,
  study,
  project
}: {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  study: Study
  project: Project
}) => {
  const queryClient = useQueryClient()
  const trpc = useTRPC()
  const { mutate: updateStudyStatus, isPending } = useMutation(
    trpc.studies.updateStudyStatus.mutationOptions({
      onSuccess: data => {
        toast.success('Study status updated', {
          description: data.isActive ? 'Active' : 'Inactive'
        })
        onOpenChange(false)

        void queryClient.invalidateQueries({
          queryKey: trpc.studies.getStudyById.queryKey({ studyId: study.id })
        })
        void queryClient.invalidateQueries({
          queryKey: trpc.studies.getStudiesByProjectId.queryKey({
            projectId: study.projectId
          })
        })
      },
      onError: error => {
        toast.error('Failed to update study status', {
          description: error.message
        })
      }
    })
  )

  const { updateArchiveStatus, isArchiveStatusPending } = useUpdateArchiveStatus({
    projectId: project.id,
    projectName: project.name,
    onSuccess: () => {
      onOpenChange(false)
    }
  })

  const isActionPending = isPending || isArchiveStatusPending

  const isActive = study.isActive
  const isProjectActive = !project.archived

  let buttonText = ''

  if (isProjectActive) {
    if (isActive) {
      buttonText = isPending ? 'Pausing...' : 'Pause'
    } else {
      buttonText = isPending ? 'Resuming...' : 'Resume'
    }
  } else {
    buttonText = isArchiveStatusPending ? 'Unarchiving...' : 'Unarchive Project'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Study status</DialogTitle>
          <DialogDescription className='text-base'>
            {isProjectActive ? (
              isActive ? (
                'This study is currently active and collecting responses.'
              ) : (
                'This study is currently paused and not collecting responses.'
              )
            ) : (
              <span>
                This study is currently paused because the project{' '}
                <span className='font-semibold text-gray-800'>{project.name}</span> is
                archived.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='mt-2'>
          <Button type='button' variant='ghost' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (isProjectActive) {
                updateStudyStatus({ studyId: study.id, isActive: !isActive })
              } else {
                updateArchiveStatus({ id: project.id, archived: false })
              }
            }}
            disabled={isActionPending}
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ManageStudyStatusDialog
