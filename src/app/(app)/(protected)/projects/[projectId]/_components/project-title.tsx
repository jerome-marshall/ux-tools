'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { FolderClosed } from 'lucide-react'

const ProjectTitle = ({ projectId }: { projectId: string }) => {
  const trpc = useTRPC()
  const { data: project, isLoading } = useQuery(
    trpc.projects.getProjectById.queryOptions({
      id: projectId
    })
  )

  return (
    <h1 className='flex items-center gap-3 text-xl font-medium'>
      <FolderClosed className='icon' />
      {isLoading ? <Skeleton className='h-6 w-24 bg-gray-200' /> : project?.name}
    </h1>
  )
}

export default ProjectTitle
