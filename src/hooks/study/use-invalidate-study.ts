import { useTRPC } from '@/trpc/client'
import { useQueryClient } from '@tanstack/react-query'

export const useInvalidateStudy = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const invalidateStudy = ({ id, projectId }: { id?: string; projectId?: string }) => {
    if (id) {
      void queryClient.invalidateQueries({
        queryKey: trpc.studies.getStudyById.queryKey({ studyId: id })
      })

      void queryClient.invalidateQueries({
        queryKey: trpc.studies.getPublicStudyById.queryKey({ studyId: id })
      })
    }

    if (projectId) {
      void queryClient.invalidateQueries({
        queryKey: trpc.studies.getStudiesByProjectId.queryKey({
          projectId
        })
      })
    }

    if (id || projectId) {
      void queryClient.invalidateQueries({
        queryKey: trpc.studies.getAllStudiesWithProject.queryKey()
      })
    }
  }

  return invalidateStudy
}
