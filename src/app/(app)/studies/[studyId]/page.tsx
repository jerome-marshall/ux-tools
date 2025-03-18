import { studyEditUrl } from '@/utils/urls'
import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ studyId: string }>
}
export default async function StudyPage({ params }: PageProps) {
  const { studyId } = await params

  return redirect(studyEditUrl(studyId))
}
