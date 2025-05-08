import ProjectCard, { ProjectCardSkeleton } from '@/components/project-card/project-card'
import { type ProjectWithStudiesCount } from '@/types'

const RecentProjectsList = ({ projects }: { projects: ProjectWithStudiesCount[] }) => {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
      {projects.map(project => (
        <ProjectCard key={`recent-project-${project.id}`} project={project} />
      ))}
    </div>
  )
}

export const RecentProjectsListSkeleton = () => {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
      {Array.from({ length: 5 }).map((_, index) => (
        <ProjectCardSkeleton key={`recent-project-skeleton-${index}`} />
      ))}
    </div>
  )
}

export default RecentProjectsList
