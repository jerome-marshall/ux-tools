import { Button } from '@/components/ui/button'
import { LayoutGrid } from 'lucide-react'
import { Suspense } from 'react'
import RecentProjectsList from './recent-projects-list'

const RecentProjects = () => {
  return (
    <div className=''>
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-medium'>Recent projects</h3>
        <div className=''>
          <Button variant='ghost' size='sm' className='hover:bg-gray-200'>
            <LayoutGrid className='size-4' />
            <span>View all projects</span>
          </Button>
        </div>
      </div>
      <div className='mt-6'>
        <Suspense fallback={<div>Loading...</div>}>
          <RecentProjectsList />
        </Suspense>
      </div>
    </div>
  )
}

export default RecentProjects
