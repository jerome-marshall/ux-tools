import SortDropdown from '@/components/sort-dropdown'
import { getQueryClient, HydrateClient, trpc } from '@/trpc/server'
import { FolderClosed } from 'lucide-react'
import NoStudies from './_components/no-studies'

type PageProps = {
  params: Promise<{ projectId: string }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { projectId } = await params

  const queryClient = getQueryClient()
  const project = await queryClient.fetchQuery(
    trpc.projects.getProjectById.queryOptions({
      id: projectId
    })
  )

  return (
    <HydrateClient>
      <div className='container'>
        <div className='flex items-center justify-between'>
          <h1 className='flex items-center gap-3 text-xl font-medium'>
            <FolderClosed className='icon' />
            {project.name}
          </h1>
          <div className='flex items-center gap-2'>
            <SortDropdown />
          </div>
        </div>
        <div className='mt-4'>
          <NoStudies />
        </div>
      </div>
    </HydrateClient>
  )
}
