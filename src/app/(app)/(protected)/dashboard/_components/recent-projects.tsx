'use client'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PATH } from '@/utils/urls'
import { LayoutGrid } from 'lucide-react'
import RecentProjectsList from './recent-projects-list'
import Link from '@/components/link'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import NoProjectsCard from '@/components/no-projects-card'

const RecentProjects = () => {
  const trpc = useTRPC()
  const { data: projects = [], isLoading } = useQuery({
    ...trpc.projects.getRecentProjects.queryOptions()
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const hasProjects = projects.length > 0

  return (
    <div className=''>
      <div className='flex items-center justify-between'>
        <h3 className='text-xl font-medium'>Recent projects</h3>
        {hasProjects && (
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
        )}
      </div>
      <div className='mt-6'>
        {hasProjects ? <RecentProjectsList projects={projects} /> : <NoProjectsCard />}
      </div>
    </div>
  )
}

export default RecentProjects
