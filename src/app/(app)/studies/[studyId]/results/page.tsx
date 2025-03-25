import { caller } from '@/trpc/server'
import ResultCards from './_components/result-cards'

type PageProps = {
  params: Promise<{ studyId: string }>
}
export default async function StudyPage({ params }: PageProps) {
  const { studyId } = await params

  const data = await caller.tests.getTestResults({ studyId })

  return (
    <div className='container'>
      <ResultCards data={data} />
    </div>
  )
}
