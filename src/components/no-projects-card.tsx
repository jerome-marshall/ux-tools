import { FolderPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreateProjectDialog } from './project/create-project-dialog'

interface NoProjectsCardProps {
  className?: string
}

const NoProjectsCard = ({ className }: NoProjectsCardProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center',
        className
      )}
    >
      <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
        <FolderPlus className='h-6 w-6 text-gray-500' />
      </div>
      <h3 className='mt-4 text-lg font-medium text-gray-900'>No projects yet</h3>
      <p className='mt-1 text-sm text-gray-500'>
        Get started by creating your first project
      </p>
      <div className='mt-6'>
        <CreateProjectDialog triggerVariant='default' />
      </div>
    </div>
  )
}

export default NoProjectsCard
