import { EditStudyForm } from '@/components/study/study-form'
import { auth } from '@/lib/auth'
import { makeQueryClient } from '@/trpc/query-client'
import { trpc } from '@/trpc/server'
import { AuthenticationError } from '@/utils/error-utils'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'

type PageProps = {
  params: Promise<{ studyId: string }>
}
export default async function StudyPageEdit({ params }: PageProps) {
  const sessionData = await auth.api.getSession({ headers: await headers() })
  const { studyId } = await params

  const queryClient = makeQueryClient()
  const data = await queryClient.fetchQuery(
    trpc.studies.getStudyById.queryOptions({ studyId }, { enabled: !!sessionData?.user })
  )
  await queryClient.prefetchQuery(
    trpc.projects.getProjectById.queryOptions({ id: data.study.projectId })
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

  const testResults = await queryClient.fetchQuery(
    trpc.tests.getTestResults.queryOptions({ studyId })
  )
  const hasTestResults = testResults.resultsData.some(
    testResult => testResult.results.length > 0
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='container'>
        <EditStudyForm
          initialData={transformedData}
          studyId={studyId}
          hasTestResults={hasTestResults}
        />
      </div>
    </HydrationBoundary>
  )
}
