import { type Project } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useInvalidateStudy } from '../study/use-invalidate-study'
import { useInvalidateProject } from './use-invalidate-project'

type UseDeleteProjectOptions = {
  onSuccess?: (project: Project) => void
  projectId?: string
}

/**
 * Hook for deleting a project
 */
export const useDeleteProject = ({
  onSuccess,
  projectId
}: UseDeleteProjectOptions = {}) => {
  const trpc = useTRPC()

  const invalidateProject = useInvalidateProject()
  const invalidateStudy = useInvalidateStudy()

  const { mutate, isPending } = useMutation(
    trpc.projects.deleteProject.mutationOptions({
      onSuccess: data => {
        toast.success('Project deleted', {
          description: data.name
        })

        invalidateProject({ id: projectId })
        invalidateStudy({ projectId })

        // Call custom onSuccess if provided
        onSuccess?.(data)
      },
      onError: error => {
        toast.error('Failed to delete project', {
          description: error.message
        })
      }
    })
  )

  return {
    deleteProject: mutate,
    isDeletePending: isPending
  }
}
