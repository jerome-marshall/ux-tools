import ResultsPage from '@/components/results/study-results-page'

type PageProps = {
  params: Promise<{ studyId: string }>
}
export default async function StudyResultsPage({ params }: PageProps) {
  const { studyId } = await params

  return <ResultsPage studyId={studyId} isResultOnly />
}
