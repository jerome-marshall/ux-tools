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
import { type Project } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { type ProjectWithStudiesCount } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function ArchiveProjectDialog({
  project,
  isOpen,
  onOpenChange
}: {
  project: Project
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate: archiveProject, isPending } = useMutation(
    trpc.projects.updateArchiveStatus.mutationOptions({
      onSuccess: () => {
        toast.success('Project archived', {
          description: project.name
        })

        void queryClient.invalidateQueries({
          queryKey: trpc.projects.getProjects.queryKey()
        })
        void queryClient.invalidateQueries({
          queryKey: trpc.projects.getRecentProjects.queryKey()
        })
        onOpenChange(false)
      },
      onError: () => {
        toast.error('Failed to archive project')
      }
    })
  )

  const handleArchive = () => {
    archiveProject({ id: project.id, archived: true })
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
          <Button onClick={handleArchive} disabled={isPending}>
            {isPending ? 'Archiving...' : 'Archive'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
