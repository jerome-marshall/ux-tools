'use client'

import StudyCard, { StudyCardSkeleton } from '@/components/study-card/study-card'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'

export const AllStudiesList = () => {
  const trpc = useTRPC()
  const { data: studies, isLoading } = useQuery(
    trpc.studies.getAllStudiesWithProject.queryOptions({
      onlyActiveProjects: true
    })
  )

  if (isLoading || !studies) {
    return (
      <div className='mt-6 grid grid-cols-1 gap-4'>
        <StudyCardSkeleton />
        <StudyCardSkeleton />
        <StudyCardSkeleton />
      </div>
    )
  }

  if (studies.length === 0) {
    return <div className='mt-6 text-center text-sm text-gray-500'>No studies found</div>
  }

  return (
    <div className='mt-6 grid gap-4'>
      {studies.map(study => (
        <StudyCard key={study.id} study={study} project={study.project} />
      ))}
    </div>
  )
}
