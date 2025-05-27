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
import { useUpdateArchiveStatus } from '@/hooks/project/use-update-archive-status'
import { type Project } from '@/server/db/schema'

export function ArchiveProjectDialog({
  project,
  isOpen,
  onOpenChange
}: {
  project: Project
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { updateArchiveStatus, isArchiveStatusPending } = useUpdateArchiveStatus({
    onSuccess: () => {
      onOpenChange(false)
    }
  })

  const handleArchive = () => {
    updateArchiveStatus({ id: project.id, archived: true })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Archive this project?</DialogTitle>
          <DialogDescription className='mt-1 text-base'>
            This will cancel any active orders and disable the recruitment link of any
            tests it contains. It will also be hidden by default on your Dashboard and
            Projects page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='mt-2'>
          <Button type='button' variant='ghost' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleArchive} disabled={isArchiveStatusPending}>
            {isArchiveStatusPending ? 'Archiving...' : 'Archive'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
