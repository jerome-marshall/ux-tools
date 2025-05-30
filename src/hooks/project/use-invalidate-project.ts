import { useTRPC } from '@/trpc/client'
import { useQueryClient } from '@tanstack/react-query'

export const useInvalidateProject = () => {
  const queryClient = useQueryClient()
  const trpc = useTRPC()

  const invalidateProject = ({ id }: { id?: string } = {}) => {
    void queryClient.invalidateQueries({
      queryKey: trpc.projects.getProjects.queryKey()
    })
    void queryClient.invalidateQueries({
      queryKey: trpc.projects.getRecentProjects.queryKey()
    })

    if (id) {
      void queryClient.invalidateQueries({
        queryKey: trpc.projects.getProjectById.queryKey({ id })
      })
    }
  }

  return invalidateProject
}
