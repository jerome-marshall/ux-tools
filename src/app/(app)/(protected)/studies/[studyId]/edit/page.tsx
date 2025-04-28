import { EditStudyForm } from '@/components/study/study-form'
import { auth } from '@/lib/auth'
import { caller, trpc } from '@/trpc/server'
import { getTestResultsByStudyIdUseCase } from '@/use-cases/tests'
import { AuthenticationError } from '@/utils/error-utils'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { QueryClient } from '@tanstack/react-query'
import { headers } from 'next/headers'

type PageProps = {
  params: Promise<{ studyId: string }>
}
export default async function StudyPageEdit({ params }: PageProps) {
  const sessionData = await auth.api.getSession({ headers: await headers() })
  const { studyId } = await params

  const queryClient = new QueryClient()
  const data = await queryClient.fetchQuery(
    trpc.studies.getStudyById.queryOptions({ studyId }, { enabled: !!sessionData?.user })
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

  if (!sessionData?.user) {
    throw new AuthenticationError()
  }

  const testResults = await caller.tests.getTestResults({ studyId })
  const hasTestResults = testResults.resultsData.some(
    testResult => testResult.results.length > 0
  )

  return (
    <div className='container'>
      <EditStudyForm
        initialData={transformedData}
        studyId={studyId}
        hasTestResults={hasTestResults}
      />
    </div>
  )
}
