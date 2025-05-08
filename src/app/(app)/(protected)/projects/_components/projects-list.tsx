'use client'
import ProjectCard, { ProjectCardSkeleton } from '@/components/project-card/project-card'
import { useSort } from '@/hooks/use-sort'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import useActiveStatus from '../_hooks/use-active-status'

const ProjectsList = () => {
  const { active } = useActiveStatus()

  const trpc = useTRPC()
  const { data: projects, isLoading } = useQuery(
    trpc.projects.getProjects.queryOptions({ active })
  )

  const { sortedData } = useSort({
    data: projects
  })

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'
      )}
    >
      {isLoading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <ProjectCardSkeleton key={`project-skeleton-${index}`} />
        ))
      ) : sortedData?.length === 0 ? (
        <div className='col-span-full flex items-center justify-center'>
          <p className='text-center text-sm text-gray-500'>No projects found</p>
        </div>
      ) : (
        sortedData?.map(project => (
          <ProjectCard key={`project-${project.id}`} project={project} />
        ))
      )}
    </div>
  )
}

export default ProjectsList
