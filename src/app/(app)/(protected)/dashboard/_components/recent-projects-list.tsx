import ProjectCard, { ProjectCardSkeleton } from '@/components/project-card/project-card'
import { cn } from '@/lib/utils'
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

export const RecentProjectsListSkeleton = ({
  count = 5,
  className
}: {
  count?: number
  className?: string
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5',
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProjectCardSkeleton key={`recent-project-skeleton-${index}`} />
      ))}
    </div>
  )
}

export default RecentProjectsList
