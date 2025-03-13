import RenderViews from '@/components/section-views/render-views'
import { trpc } from '@/trpc/server'
import { QueryClient } from '@tanstack/react-query'

type PageProps = {
  params: Promise<{ studyId: string }>
}
export default async function PreviewStudyPage({ params }: PageProps) {
  const { studyId } = await params

  const queryClient = new QueryClient()
  const data = await queryClient.fetchQuery(
    trpc.studies.getStudyById.queryOptions({ studyId })
  )

  return (
    <div className='grid min-h-screen'>
      <RenderViews data={data} />
    </div>
  )
}
