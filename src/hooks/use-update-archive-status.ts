import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Hook for updating a project's archive status
 */
export const useUpdateArchiveStatus = ({
  onSuccess
}: { onSuccess?: (isArchived: boolean) => void } = {}) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation(
    trpc.projects.updateArchiveStatus.mutationOptions({
      onSuccess: data => {
        const isArchivedStatus = data.archived

        toast.success(isArchivedStatus ? 'Project archived' : 'Project unarchived', {
          description: data.name
        })

        // Invalidate projects queries
        void queryClient.invalidateQueries({
          queryKey: trpc.projects.getProjects.queryKey()
        })

        void queryClient.invalidateQueries({
          queryKey: trpc.projects.getRecentProjects.queryKey()
        })

        if (data.id) {
          void queryClient.invalidateQueries({
            queryKey: trpc.projects.getProjectById.queryKey({ id: data.id })
          })
        }

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
