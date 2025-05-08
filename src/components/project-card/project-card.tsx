import Link from '@/components/link'
import { Skeleton } from '@/components/ui/skeleton'
import { type ProjectWithStudiesCount } from '@/types'
import { projectUrl } from '@/utils/urls'
import { FolderClosed, FolderOpen } from 'lucide-react'
import ProjectCardOptions from './project-card-options'

const ProjectCard = ({ project }: { project: ProjectWithStudiesCount }) => {
  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Link
      href={projectUrl(project.id.toString())}
      className='group relative flex h-[9.5rem] w-full flex-col justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md hover:ring-2 hover:ring-gray-300'
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center justify-center rounded-sm bg-gray-100 p-2'>
          <FolderClosed className='size-4 group-hover:hidden' />
          <FolderOpen className='hidden size-4 group-hover:block' />
        </div>
        <div onClick={handleOptionsClick}>
          <ProjectCardOptions
            project={project}
            triggerClassName='absolute top-3 right-2 size-8 text-muted-foreground'
          />
        </div>
      </div>
      <div className='flex flex-col gap-1'>
        <p className='text-base font-medium'>{project.name}</p>
        <p className='text-xs text-gray-500'>{project.studiesCount} studies</p>
      </div>
    </Link>
  )
}

export const ProjectCardSkeleton = () => {
  return (
    <div className='flex h-[9.5rem] w-full flex-col justify-between rounded-xl bg-white p-4 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center justify-center rounded-sm bg-gray-100 p-2'>
          <Skeleton className='size-4' />
        </div>
        <Skeleton className='size-8 rounded-full' />
      </div>
      <div className='flex flex-col gap-1'>
        <Skeleton className='h-6 w-3/4' />
        <Skeleton className='h-4 w-1/3' />
      </div>
    </div>
  )
}

export default ProjectCard
