import { EditStudyForm } from '@/components/study/study-form'
import { trpc } from '@/trpc/server'
import { getTestResultsByStudyIdUseCase } from '@/use-cases/tests'
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
  
  const transformedData: StudyWithTestsInsert = {
    study: {
      id: data.study.id,
      name: data.study.name,
      projectId: data.study.projectId,
      testsOrder: data.study.testsOrder
    },
    tests: data.tests.map(test => ({
      studyId: test.sectionData.studyId,
      testId: test.sectionData.testId,
      sectionId: test.sectionData.sectionId,
      name: test.name,
      type: test.type,
      treeStructure: test.treeStructure,
      taskInstructions: test.taskInstructions ?? '',
      correctPaths: test.correctPaths
    }))
  }

  const testResults = await getTestResultsByStudyIdUseCase(studyId)
  const hasTestResults = testResults.some(testResult => testResult.length > 0)

  return (
    <div className='container'>
      <EditStudyForm initialData={transformedData} studyId={studyId} hasTestResults={hasTestResults} />
    </div>
  )
}
