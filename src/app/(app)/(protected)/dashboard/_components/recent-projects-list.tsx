'use client'
import ProjectCard from '@/components/project-card/project-card'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'

const RecentProjectsList = () => {
  const trpc = useTRPC()
  const { data: projects = [], isLoading } = useQuery({
    ...trpc.projects.getRecentProjects.queryOptions()
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
      {projects.map(project => (
        <ProjectCard key={`recent-project-${project.id}`} project={project} />
      ))}
    </div>
  )
}

export default RecentProjectsList
