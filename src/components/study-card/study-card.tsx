import Link from '@/components/link'
import { type Study } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { studyUrl } from '@/utils/urls'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { FlaskConical } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'
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
          <StudyResponseCount studyId={study.id} />
          <p className=''>{format(study.createdAt, 'MMM d, yyyy')}</p>
        </div>
      </div>
    </Link>
  )
}

const StudyResponseCount = ({ studyId }: { studyId: string }) => {
  const trpc = useTRPC()

  const { data: testResults, isLoading } = useQuery(
    trpc.tests.getTestResults.queryOptions({
      studyId
    })
  )

  if (isLoading || !testResults) {
    return <Skeleton className='h-3 w-20' />
  }

  const responseCount = testResults.resultsData.reduce(
    (acc, curr) => acc + curr.results.length,
    0
  )
  const responseCountText = responseCount === 1 ? 'response' : 'responses'

  return (
    <p className=''>
      {responseCount} {responseCountText}
    </p>
  )
}

export default StudyCard
