import { getProjectsUseCase } from '@/use-cases/products'
import ProjectCard from './project-card'

const RecentProjectsList = async () => {
  const projects = await getProjectsUseCase()

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
      {projects.map(project => (
        <ProjectCard key={`recent-project-${project.id}`} project={project} />
      ))}
    </div>
  )
}

export default RecentProjectsList
