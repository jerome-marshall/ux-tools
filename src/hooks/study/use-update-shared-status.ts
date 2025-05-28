import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useInvalidateStudy } from './use-invalidate-study'

/**
 * Hook for updating a study's shared status
 */
export const useUpdateSharedStatus = ({
  onSuccess
}: { onSuccess?: (isShared: boolean) => void } = {}) => {
  const trpc = useTRPC()

  const invalidateStudy = useInvalidateStudy()

  const { mutate: updateSharedStatus, isPending } = useMutation(
    trpc.studies.updateSharedStatus.mutationOptions({
      onSuccess: data => {
        toast.success('Link sharing updated', {
          description: data.isShared ? 'Enabled' : 'Disabled'
        })

        invalidateStudy({ id: data.id, projectId: data.projectId })

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
