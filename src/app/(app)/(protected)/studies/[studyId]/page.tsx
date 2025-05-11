import { caller } from '@/trpc/server'
import { studyEditUrl, studyResultsUrl } from '@/utils/urls'
import { notFound, redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ studyId: string }>
}
export default async function StudyPage({ params }: PageProps) {
  const { studyId } = await params

  const data = await caller.studies.getStudyById({ studyId })

  if (!data) {
    return notFound()
  }

  return redirect(
    data.study.hasTestResults ? studyResultsUrl(studyId) : studyEditUrl(studyId)
  )
}
