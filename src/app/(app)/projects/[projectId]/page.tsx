import { getProjectByIdUseCase } from '@/use-cases/projects'
import { FolderClosed } from 'lucide-react'
import NoStudies from './_components/no-studies'
import StudiesSort from './_components/studies-sort'

type PageProps = {
  params: Promise<{ projectId: string }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { projectId } = await params
  const project = await getProjectByIdUseCase(Number(projectId))

  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='flex items-center gap-3 text-xl font-medium'>
          <FolderClosed className='size-8 rounded-md bg-gray-200 p-2' />
          {project.name}
        </h1>
        <div className='flex items-center gap-2'>
          <StudiesSort projectId={project.id} />
        </div>
      </div>
      <div className='mt-4'>
        <NoStudies />
      </div>
    </div>
  )
}
