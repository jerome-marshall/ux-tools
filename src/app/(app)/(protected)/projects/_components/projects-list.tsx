'use client'
import ProjectCard from '@/components/project-card/project-card'
import { useSort } from '@/hooks/use-sort'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import useActiveStatus from '../_hooks/use-active-status'
import { cn } from '@/lib/utils'

const ProjectsList = () => {
  const { active } = useActiveStatus()

  const trpc = useTRPC()
  const { data: projects, isLoading } = useQuery(
    trpc.projects.getProjects.queryOptions({ active })
  )

  const { sortedData } = useSort({
    data: projects
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'
      )}
    >
      {sortedData?.map(project => (
        <ProjectCard key={`project-${project.id}`} project={project} />
      ))}
    </div>
  )
}

export default ProjectsList
