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

const StudyCard = ({ study, project }: { study: Study; project: Project }) => {
  const href = study.hasTestResults ? studyResultsUrl(study.id) : studyEditUrl(study.id)
  const isActive = study.isActive

  return (
    <Link
      href={href}
      className='relative flex w-full justify-between rounded-xl bg-white px-8 py-6 shadow-sm transition-shadow duration-200 hover:shadow-md hover:ring-2 hover:ring-gray-300'
    >
      <div className='flex min-w-64 flex-col justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center justify-center gap-1 rounded-full bg-gray-200 px-1.5 py-0.5'>
            <FlaskConical className='size-2.5' strokeWidth={2} />
            <span className='text-xs'>Test</span>
          </div>
          <Link
            href={projectUrl(project.id)}
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'text-muted-foreground !h-fit !rounded-sm !p-0 !px-1'
            )}
          >
            <FolderClosedIcon className='size-3.5' />
            <span className='text-sm'>{project.name}</span>
          </Link>
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

        <div className='flex items-center gap-2'>
          <p className='text-muted-foreground text-xs'>
            {format(study.createdAt, 'MMM d, yyyy')}
          </p>
        </div>
      </div>
    </Link>
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
    return <Skeleton className='h-3 w-20' />
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

export default StudyCard
