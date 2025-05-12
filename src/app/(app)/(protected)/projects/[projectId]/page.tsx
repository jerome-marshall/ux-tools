import ProjectCardOptions from '@/components/project-card/project-card-options'
import SortDropdown from '@/components/sort-dropdown'
import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import ProjectTitle from './_components/project-title'
import StudiesList from './_components/studies-list'
import { PATH } from '@/utils/urls'

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

  await queryClient.prefetchQuery(
    trpc.studies.getStudiesByProjectId.queryOptions({
      projectId
    })
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='container'>
        <div className='flex items-center justify-between'>
          <ProjectTitle projectId={projectId} />
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-2'>
              <SortDropdown />
            </div>
            <ProjectCardOptions
              project={project}
              triggerVariant='muted'
              triggerClassName='size-8'
              triggerOpenClassName='bg-gray-300'
              deleteRedirectUrl={PATH.projects}
            />
          </div>
        </div>
        <div className='mt-4'>
          <StudiesList project={project} />
        </div>
      </div>
    </HydrationBoundary>
  )
}
