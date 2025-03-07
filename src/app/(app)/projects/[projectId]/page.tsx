import NoStudies from './_components/no-studies'

type PageProps = {
  params: Promise<{ projectId: string }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { projectId } = await params

  return (
    <div>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold'>Projects</h1>
        <div className='flex items-center gap-2'>{/* filters */}</div>
      </div>
      <div className='mt-4'>
        <NoStudies />
      </div>
    </div>
  )
}
