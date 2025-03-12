import StudyForm from '@/components/study/study-form'
import { trpc } from '@/trpc/server'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { QueryClient } from '@tanstack/react-query'

type PageProps = {
  params: Promise<{ studyId: string }>
}
export default async function StudyPage({ params }: PageProps) {
  const { studyId } = await params

  const queryClient = new QueryClient()
  const data = await queryClient.fetchQuery(
    trpc.studies.getStudyById.queryOptions({ studyId })
  )

  return (
    <div className='container'>
      <StudyForm initialData={data as StudyWithTestsInsert} />
    </div>
  )
}
