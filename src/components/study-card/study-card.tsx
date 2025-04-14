import { type Study } from '@/server/db/schema/schema'
import { format } from 'date-fns'
import { FlaskConical } from 'lucide-react'
import Link from '@/components/link'
import { studyUrl } from '@/utils/urls'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import { Suspense } from 'react'
const StudyCard = ({ study }: { study: Study }) => {
  return (
    <Link
      href={studyUrl(study.id)}
      className='relative flex h-[9.5rem] w-full flex-col justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md hover:ring-2 hover:ring-gray-300'
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center justify-center rounded-sm bg-gray-100 p-2'>
          <FlaskConical className='size-4' />
        </div>
        {/* <ProjectCardOptions /> */}
      </div>
      <div className='flex flex-col gap-1'>
        <p className='text-base font-medium'>{study.name}</p>
        <div className='flex items-center justify-between gap-2 text-xs text-gray-500'>
          <Suspense fallback={<p className=''>Loading...</p>}>
            <StudyResponseCount studyId={study.id} />
          </Suspense>
          <p className=''>{format(study.createdAt, 'MMM d, yyyy')}</p>
        </div>
      </div>
    </Link>
  )
}

const StudyResponseCount = ({ studyId }: { studyId: string }) => {
  const trpc = useTRPC()

  const {
    data: { resultsData: testResults }
  } = useSuspenseQuery(
    trpc.tests.getTestResults.queryOptions({
      studyId
    })
  )

  const responseCount = testResults.reduce((acc, curr) => acc + curr.results.length, 0)
  const responseCountText = responseCount === 1 ? 'response' : 'responses'

  return (
    <p className=''>
      {responseCount} {responseCountText}
    </p>
  )
}

export default StudyCard
