'use client'

import Link from '@/components/link'
import NoProjectsCard from '@/components/no-projects-card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { PATH } from '@/utils/urls'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid } from 'lucide-react'
import RecentProjectsList, { RecentProjectsListSkeleton } from './recent-projects-list'

const RecentProjects = () => {
  const trpc = useTRPC()
  const { data: projects = [], isLoading } = useQuery({
    ...trpc.projects.getRecentProjects.queryOptions()
  })

  const hasProjects = projects.length > 0

  return (
    <div className=''>
      <div className='flex items-center justify-between'>
        <h3 className='h-8 text-xl font-medium'>Recent projects</h3>
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
        {isLoading ? (
          <RecentProjectsListSkeleton />
        ) : hasProjects ? (
          <RecentProjectsList projects={projects} />
        ) : (
          <NoProjectsCard />
        )}
      </div>
    </div>
  )
}

export default RecentProjects
