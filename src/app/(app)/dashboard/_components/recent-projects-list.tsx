'use client'
import ProjectCard from '@/components/project-card/project-card'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'

const RecentProjectsList = () => {
  const trpc = useTRPC()
  const { data: projects } = useSuspenseQuery(
    trpc.projects.getRecentProjects.queryOptions()
  )

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
      {projects.map(project => (
        <ProjectCard key={`recent-project-${project.id}`} project={project} />
      ))}
    </div>
  )
}

export default RecentProjectsList
