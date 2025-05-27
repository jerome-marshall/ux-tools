import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Hook for updating a study's status
 */
export const useUpdateStudyStatus = ({
  onSuccess
}: { onSuccess?: (isActive: boolean) => void } = {}) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { mutate: updateStudyStatus, isPending } = useMutation(
    trpc.studies.updateStudyStatus.mutationOptions({
      onSuccess: data => {
        toast.success('Study status updated', {
          description: data.isActive ? 'Active' : 'Inactive'
        })

        void queryClient.invalidateQueries({
          queryKey: trpc.studies.getStudyById.queryKey({ studyId: data.id })
        })
        void queryClient.invalidateQueries({
          queryKey: trpc.studies.getStudiesByProjectId.queryKey({
            projectId: data.projectId
          })
        })
        void queryClient.invalidateQueries({
          queryKey: trpc.studies.getAllStudiesWithProject.queryKey()
        })

        // Call custom onSuccess if provided
        onSuccess?.(data.isActive)
      },
      onError: error => {
        toast.error('Failed to update study status', {
          description: error.message
        })
      }
    })
  )

  return {
    updateStudyStatus,
    isStudyStatusPending: isPending
  }
}
