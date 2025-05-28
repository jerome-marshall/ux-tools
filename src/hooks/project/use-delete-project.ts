import { type Project } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useInvalidateStudy } from '../study/use-invalidate-study'

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
  const queryClient = useQueryClient()

  const invalidateStudy = useInvalidateStudy()

  const { mutate, isPending } = useMutation(
    trpc.projects.deleteProject.mutationOptions({
      onSuccess: data => {
        toast.success('Project deleted', {
          description: data.name
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

        invalidateStudy({ projectId })

        // Call custom onSuccess if provided
        onSuccess?.(data)
      }
    })
  )

  return {
    deleteProject: mutate,
    isDeletePending: isPending
  }
}
