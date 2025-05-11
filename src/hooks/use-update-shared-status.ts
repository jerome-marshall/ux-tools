import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Hook for updating a study's shared status
 */
export const useUpdateSharedStatus = ({
  onSuccess
}: { onSuccess?: (isShared: boolean) => void } = {}) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate: updateSharedStatus, isPending } = useMutation(
    trpc.studies.updateSharedStatus.mutationOptions({
      onSuccess: data => {
        toast.success('Link sharing updated', {
          description: data.isShared ? 'Enabled' : 'Disabled'
        })

        void queryClient.invalidateQueries({
          queryKey: trpc.studies.getStudyById.queryKey({ studyId: data.id })
        })
        void queryClient.invalidateQueries({
          queryKey: trpc.studies.getStudiesByProjectId.queryKey({
            projectId: data.projectId
          })
        })

        // Call custom onSuccess if provided
        onSuccess?.(data.isShared)
      },
      onError: error => {
        toast.error('Failed to update sharing status', {
          description: error.message
        })
      }
    })
  )

  return {
    updateSharedStatus,
    isSharedStatusPending: isPending
  }
}
