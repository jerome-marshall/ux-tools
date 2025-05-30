import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useInvalidateProject } from './use-invalidate-project'

/**
 * Hook for updating a project's archive status
 */
export const useUpdateArchiveStatus = ({
  onSuccess
}: { onSuccess?: (isArchived: boolean) => void } = {}) => {
  const trpc = useTRPC()
  const invalidateProject = useInvalidateProject()

  const { mutate, isPending } = useMutation(
    trpc.projects.updateArchiveStatus.mutationOptions({
      onSuccess: data => {
        const isArchivedStatus = data.archived

        toast.success(isArchivedStatus ? 'Project archived' : 'Project unarchived', {
          description: data.name
        })

        invalidateProject({ id: data.id })

        // Call custom onSuccess if provided
        onSuccess?.(isArchivedStatus)
      }
    })
  )

  return {
    updateArchiveStatus: mutate,
    isArchiveStatusPending: isPending
  }
}
