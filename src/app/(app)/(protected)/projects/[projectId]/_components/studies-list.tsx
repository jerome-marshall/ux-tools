'use client'
import StudyCard from '@/components/study-card/study-card'
import { useSort } from '@/hooks/use-sort'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import NoStudies from './no-studies'

const StudiesList = ({ projectId }: { projectId: string }) => {
  const trpc = useTRPC()
  const { data: studies } = useSuspenseQuery(
    trpc.studies.getStudiesByProjectId.queryOptions({
      projectId
    })
  )

  const { sortedData } = useSort({ data: studies })

  if (studies.length === 0) {
    return <NoStudies />
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
      {sortedData?.map(study => <StudyCard key={`study-${study.id}`} study={study} />)}
    </div>
  )
}

export default StudiesList
