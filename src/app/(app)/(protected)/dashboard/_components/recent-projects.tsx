import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PATH } from '@/utils/urls'
import { LayoutGrid } from 'lucide-react'
import RecentProjectsList from './recent-projects-list'
import Link from '@/components/link'

const RecentProjects = () => {
  return (
    <div className=''>
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-medium'>Recent projects</h3>
        <div className=''>
          <Link
            href={PATH.projects}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'hover:bg-gray-200'
            )}
          >
            <LayoutGrid className='size-4' />
            <span>View all projects</span>
          </Link>
        </div>
      </div>
      <div className='mt-6'>
        <RecentProjectsList />
      </div>
    </div>
  )
}

export default RecentProjects
