import { type Project } from '@/db/schema'
import { use } from 'react'
import ProjectCard from './project-card'

const RecentProjectsList = ({
  projectsPromise
}: {
  projectsPromise: Promise<Project[]>
}) => {
  const projects = use(projectsPromise)

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
      {projects.map(project => (
        <ProjectCard key={`recent-project-${project.id}`} project={project} />
      ))}
    </div>
  )
}

export default RecentProjectsList
