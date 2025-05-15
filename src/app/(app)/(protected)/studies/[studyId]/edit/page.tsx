import { EditStudyForm } from '@/components/study/study-form'
import { auth } from '@/lib/auth'
import { makeQueryClient } from '@/trpc/query-client'
import { trpc } from '@/trpc/server'
import { AuthenticationError } from '@/utils/error-utils'
import { SECTION_TYPE } from '@/utils/study-utils'
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
    tests: data.tests.map(test => {
      if (test.type === SECTION_TYPE.TREE_TEST) {
        return {
          name: test.name,
          type: test.type,
          studyId: test.studyId,
          sectionId: test.id,
          testId: test.testId,
          randomized: test.randomized,
          treeStructure: test.treeStructure,
          taskInstructions: test.taskInstructions ?? '',
          correctPaths: test.correctPaths
        }
      }
      if (test.type === SECTION_TYPE.SURVEY) {
        return {
          name: test.name,
          type: test.type,
          studyId: test.studyId,
          // id will be same as testId as it doesnt have a separate table
          sectionId: test.id,
          testId: test.testId,
          randomized: test.randomized,
          questions: test.questions
        }
      }

      throw new Error('Invalid test type')
    }) satisfies StudyWithTestsInsert['tests']
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
          initialStudy={data.study}
          hasTestResults={hasTestResults}
        />
      </div>
    </HydrationBoundary>
  )
}
