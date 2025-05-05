import SortDropdown from '@/components/sort-dropdown'
import ProjectsActiveDropdown from './_components/projects-active-dropdown'
import ProjectsList from './_components/projects-list'

// This prevents Next.js from trying to prerender this page during build
export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  return (
    <div className='container'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold'>Projects</h1>
        <div className='flex items-center gap-2'>
          <ProjectsActiveDropdown />
          <SortDropdown />
        </div>
      </div>
      <div className='mt-4'>
        <ProjectsList />
      </div>
    </div>
  )
}
