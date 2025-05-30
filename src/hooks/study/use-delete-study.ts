import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useInvalidateStudy } from './use-invalidate-study'
import { type Study } from '@/server/db/schema'
import { toast } from 'sonner'
import { useInvalidateProject } from '../project/use-invalidate-project'

export const useDeleteStudy = ({
  onSuccess
}: {
  onSuccess?: (study: Study) => void
} = {}) => {
  const trpc = useTRPC()

  const invalidateStudy = useInvalidateStudy()
  const invalidateProject = useInvalidateProject()

  const { mutate, isPending } = useMutation(
    trpc.studies.deleteStudy.mutationOptions({
      onSuccess: data => {
        toast.success('Study deleted', {
          description: data.name
        })

        invalidateStudy({ id: data.id })
        invalidateProject({ id: data.projectId })

        onSuccess?.(data)
      },
      onError: error => {
        toast.error('Failed to delete study', {
          description: error.message
        })
      }
    })
  )

  return { deleteStudy: mutate, isDeletePending: isPending }
}
