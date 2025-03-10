import SortDropdown from '@/components/sort-dropdown'
import ProjectsActiveDropdown from './_components/projects-active-dropdown'
import ProjectsList from './_components/projects-list'
import { Suspense } from 'react'

export default async function ProjectsPage() {
  return (
    <div className='container'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold'>Projects</h1>
        <div className='flex items-center gap-2'>
          <Suspense fallback={<></>}>
            <ProjectsActiveDropdown />
          </Suspense>
          <Suspense
            fallback={
              <div className='h-8 w-24 animate-pulse rounded-md bg-gray-200'></div>
            }
          >
            <SortDropdown />
          </Suspense>
        </div>
      </div>
      <div className='mt-4'>
        <Suspense fallback={<></>}>
          <ProjectsList />
        </Suspense>
      </div>
    </div>
  )
}
