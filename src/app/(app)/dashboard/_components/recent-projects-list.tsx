import ProjectCard from '@/components/project-card/project-card'
import { getRecentProjectsUseCase } from '@/use-cases/projects'

const RecentProjectsList = async () => {
  const projects = await getRecentProjectsUseCase()

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
      {projects.map(project => (
        <ProjectCard key={`recent-project-${project.id}`} project={project} />
      ))}
    </div>
  )
}

export default RecentProjectsList
