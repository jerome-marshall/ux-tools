'use client'
import StudyCard from '@/components/study-card/study-card'
import { useSort } from '@/hooks/use-sort'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import NoStudies from './no-studies'
import { Skeleton } from '@/components/ui/skeleton'
import { type Project } from '@/server/db/schema'

const StudiesList = ({ project }: { project: Project }) => {
  const trpc = useTRPC()
  const { data: studies, isLoading } = useQuery(
    trpc.studies.getStudiesByProjectId.queryOptions({
      projectId: project.id
    })
  )

  const { sortedData } = useSort({ data: studies })

  if (isLoading || !studies) {
    return (
      <div className='grid grid-cols-1 gap-4'>
        <Skeleton className='h-[9.5rem] w-full' />
        <Skeleton className='h-[9.5rem] w-full' />
        <Skeleton className='h-[9.5rem] w-full' />
      </div>
    )
  }

  if (studies.length === 0) {
    return <NoStudies />
  }

  return (
    <div className='grid grid-cols-1 gap-4'>
      {sortedData?.map(study => (
        <StudyCard key={`study-${study.id}`} study={study} project={project} />
      ))}
    </div>
  )
}

export default StudiesList
