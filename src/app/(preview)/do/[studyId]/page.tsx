import RenderViews from '@/components/section-views/render-views'
import { trpc } from '@/trpc/server'
import { QueryClient } from '@tanstack/react-query'
import { Clock } from 'lucide-react'

type PageProps = {
  params: Promise<{ studyId: string }>
}
export default async function PreviewStudyPage({ params }: PageProps) {
  const { studyId } = await params

  const queryClient = new QueryClient()
  const data = await queryClient.fetchQuery(
    trpc.studies.getStudyById.queryOptions({ studyId })
  )

  if (!data.study.isActive) {
    return (
      <div className='flex min-h-[80vh] flex-col items-center justify-center p-6 text-center'>
        <div className='max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm'>
          <div className='mb-6 flex justify-center'>
            <div className='rounded-full bg-amber-100 p-3'>
              <Clock className='size-8 text-amber-600' />
            </div>
          </div>
          <h1 className='mb-2 text-2xl font-bold'>Study Not Available</h1>
          <p className='text-muted-foreground mb-6'>
            This study is currently not active or has been completed. If you believe this
            is an error, please contact the study administrator.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='grid min-h-screen'>
      <RenderViews data={data} />
    </div>
  )
}
