import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useInvalidateStudy } from './use-invalidate-study'

/**
 * Hook for updating a study's status
 */
export const useUpdateStudyStatus = ({
  onSuccess
}: { onSuccess?: (isActive: boolean) => void } = {}) => {
  const trpc = useTRPC()

  const invalidateStudy = useInvalidateStudy()

  const { mutate: updateStudyStatus, isPending } = useMutation(
    trpc.studies.updateStudyStatus.mutationOptions({
      onSuccess: data => {
        toast.success('Study status updated', {
          description: data.isActive ? 'Active' : 'Inactive'
        })

        invalidateStudy({ id: data.id, projectId: data.projectId })

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
