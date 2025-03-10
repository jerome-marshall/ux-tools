type PageProps = {
  params: Promise<{ studyId: string }>
}
export default async function StudyPage({ params }: PageProps) {
  const { studyId } = await params

  return (
    <div className='container'>
      <h1 className='text-2xl font-medium'>{studyId}</h1>
    </div>
  )
}
