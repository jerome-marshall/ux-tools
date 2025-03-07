import { type SearchParams } from 'nuqs'
import { loadSortSearchParams } from '../../../utils/search-params'
import ProjectsActiveDropdown from './_components/projects-active-dropdown'
import ProjectsList from './_components/projects-list'
import ProjectsSort from './_components/projects-sort'

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { sort, sort_dir } = await loadSortSearchParams(searchParams)

  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold'>Projects</h1>
        <div className='flex items-center gap-2'>
          <ProjectsActiveDropdown />
          <ProjectsSort />
        </div>
      </div>
      <div className='mt-4'>
        <ProjectsList sort={sort} sortDir={sort_dir} />
      </div>
    </div>
  )
}
