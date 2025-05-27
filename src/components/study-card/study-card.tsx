'use client'

import Link from '@/components/link'
import { type Study } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { projectUrl, studyEditUrl, studyResultsUrl } from '@/utils/urls'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { FlaskConical, FolderClosedIcon } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'
import { type Project } from '@/server/db/schema'
import { cn } from '@/lib/utils'
import { buttonVariants } from '../ui/button'
import { useRouter } from 'nextjs-toploader/app'
import StudyCardOptions from './study-card-options'

const StudyCard = ({
  study,
  project,
  hideProjectName
}: {
  study: Study
  project: Project
  hideProjectName?: boolean
}) => {
  const router = useRouter()

  const href = study.hasTestResults ? studyResultsUrl(study.id) : studyEditUrl(study.id)
  const isActive = study.isActive

  return (
    <div
      className='relative flex w-full cursor-pointer justify-between rounded-xl bg-white px-8 py-6 shadow-sm transition-shadow duration-200 hover:shadow-md hover:ring-2 hover:ring-gray-300'
      onClick={() => router.push(href)}
    >
      <div className='flex min-w-64 flex-col justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center justify-center gap-1 rounded-full bg-gray-200 px-1.5 py-0.5'>
            <FlaskConical className='size-2.5' strokeWidth={2} />
            <span className='text-xs'>Test</span>
          </div>
          {!hideProjectName && (
            <Link
              href={projectUrl(project.id)}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'text-muted-foreground !h-fit !rounded-sm !p-0 !px-1'
              )}
              onClick={e => {
                e.stopPropagation()
              }}
            >
              <FolderClosedIcon className='size-3.5' />
              <span className='text-sm'>{project.name}</span>
            </Link>
          )}
        </div>
        <p className='text-base font-medium'>{study.name}</p>
      </div>

      <div className='flex items-center gap-8'>
        <div className='flex min-w-32 flex-col justify-center gap-1'>
          <StudyResponseCount studyId={study.id} className='text-sm' />
          <p className='text-muted-foreground text-xs'>
            {isActive ? 'Link Active' : 'Link Disabled'}
          </p>
        </div>

        <div className='flex items-center gap-5'>
          <div className='flex items-center gap-2'>
            <p className='text-muted-foreground text-xs'>
              {format(study.createdAt, 'MMM d, yyyy')}
            </p>
          </div>

          <StudyCardOptions study={study} />
        </div>
      </div>
    </div>
  )
}

const StudyResponseCount = ({
  studyId,
  className
}: {
  studyId: string
  className?: string
}) => {
  const trpc = useTRPC()

  const { data: testResults, isLoading } = useQuery(
    trpc.tests.getTestResults.queryOptions({
      studyId
    })
  )

  if (isLoading || !testResults) {
    return <Skeleton className='h-5 w-24' />
  }

  const responseCount = testResults.resultsData.reduce(
    (acc, curr) => acc + curr.results.length,
    0
  )
  const responseCountText = responseCount === 1 ? 'response' : 'responses'

  return (
    <p className={cn(className)}>
      {responseCount} {responseCountText}
    </p>
  )
}

export const StudyCardSkeleton = () => {
  return (
    <div className='relative flex w-full justify-between rounded-xl bg-white px-8 py-6 shadow-sm'>
      <div className='flex min-w-64 flex-col justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-5 w-16 rounded-full' />
          <Skeleton className='h-5 w-28 rounded-sm' />
        </div>
        <Skeleton className='h-6 w-48' />
      </div>

      <div className='flex items-center gap-8'>
        <div className='flex min-w-32 flex-col justify-center gap-1'>
          <Skeleton className='h-5 w-24' />
          <Skeleton className='h-4 w-20' />
        </div>

        <div className='flex items-center gap-2'>
          <Skeleton className='h-4 w-24' />
        </div>
      </div>
    </div>
  )
}

export default StudyCard
