'use client'
import ProjectCard from '@/components/project-card/project-card'
import { useSort } from '@/hooks/useSort'
import { useTRPC } from '@/trpc/client'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

const ProjectsList = () => {
  const queryClient = useQueryClient()
  const {
    sortValue: { sort, sort_dir }
  } = useSort({
    onSort: () => {
      void queryClient.refetchQueries({
        queryKey: trpc.projects.getProjects.queryKey()
      })
    }
  })

  const trpc = useTRPC()
  const { data: projects } = useSuspenseQuery(
    trpc.projects.getProjects.queryOptions({
      sort: sort ?? undefined,
      sortDir: sort_dir ?? undefined
    })
  )

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
      {projects.map(project => (
        <ProjectCard key={`project-${project.id}`} project={project} />
      ))}
    </div>
  )
}

export default ProjectsList
