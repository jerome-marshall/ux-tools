import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useUpdateArchiveStatus } from '@/hooks/use-update-archive-status'
import { useUpdateStudyStatus } from '@/hooks/use-update-study-status'
import { type Project, type Study } from '@/server/db/schema'

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
  const { updateStudyStatus, isStudyStatusPending } = useUpdateStudyStatus({
    onSuccess: () => {
      onOpenChange(false)
    }
  })

  const { updateArchiveStatus, isArchiveStatusPending } = useUpdateArchiveStatus({
    onSuccess: () => {
      onOpenChange(false)
    }
  })

  const isActionPending = isStudyStatusPending || isArchiveStatusPending

  const isActive = study.isActive
  const isProjectActive = !project.archived

  let buttonText = ''

  if (isProjectActive) {
    if (isActive) {
      buttonText = isStudyStatusPending ? 'Pausing...' : 'Pause'
    } else {
      buttonText = isStudyStatusPending ? 'Resuming...' : 'Resume'
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
