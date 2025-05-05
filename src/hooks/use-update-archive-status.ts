import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type UseUpdateArchiveStatusOptions = {
  onSuccess?: (isArchived: boolean) => void
  projectName?: string
  projectId?: string
}

/**
 * Hook for updating a project's archive status
 */
export const useUpdateArchiveStatus = ({
  onSuccess,
  projectName = 'Project',
  projectId
}: UseUpdateArchiveStatusOptions = {}) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation(
    trpc.projects.updateArchiveStatus.mutationOptions({
      onSuccess: data => {
        const isArchivedStatus = data.archived

        toast.success(isArchivedStatus ? 'Project archived' : 'Project unarchived', {
          description: projectName
        })

        // Invalidate projects queries
        void queryClient.invalidateQueries({
          queryKey: trpc.projects.getProjects.queryKey()
        })

        void queryClient.invalidateQueries({
          queryKey: trpc.projects.getRecentProjects.queryKey()
        })

        if (projectId) {
          void queryClient.invalidateQueries({
            queryKey: trpc.projects.getProjectById.queryKey({ id: projectId })
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
