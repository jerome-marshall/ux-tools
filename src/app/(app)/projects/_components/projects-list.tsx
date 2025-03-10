'use client'
import ProjectCard from '@/components/project-card/project-card'
import { useSort } from '@/hooks/useSort'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'

const ProjectsList = () => {
  const trpc = useTRPC()
  const { data: projects } = useSuspenseQuery(trpc.projects.getProjects.queryOptions())

  const { sortedData } = useSort({
    data: projects
  })

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
      {sortedData?.map(project => (
        <ProjectCard key={`project-${project.id}`} project={project} />
      ))}
    </div>
  )
}

export default ProjectsList
