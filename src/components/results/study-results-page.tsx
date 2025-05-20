import ResultCards from '@/components/results/result-cards'
import TreeTestResultCard from '@/components/results/tree-test/tt-result-card'
import { makeQueryClient } from '@/trpc/query-client'
import { trpc } from '@/trpc/server'
import { SECTION_TYPE } from '@/utils/study-utils'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import SurveyResultsCard from './survey-questions/survey-results-card'

export default async function ResultsPage({
  studyId,
  isResultOnly = false
}: {
  studyId: string
  isResultOnly?: boolean
}) {
  const queryClient = makeQueryClient()
  const data = await queryClient.fetchQuery(
    trpc.tests.getTestResults.queryOptions({ studyId })
  )
  await queryClient.prefetchQuery(trpc.studies.getStudyById.queryOptions({ studyId }))

  // Prefetch tree test result data if any test results exist
  const testResultIds = data.resultsData.flatMap(resultData =>
    resultData.results.map(result => ({
      id: result.id,
      testType: resultData.test.type
    }))
  )
  if (testResultIds.length > 0) {
    const treeTestResultIds: string[] = []
    const surveyResultIds: string[] = []

    testResultIds.forEach(result => {
      if (result.testType === SECTION_TYPE.TREE_TEST) {
        treeTestResultIds.push(result.id)
      } else if (result.testType === SECTION_TYPE.SURVEY) {
        surveyResultIds.push(result.id)
      }
    })

    await queryClient.prefetchQuery(
      trpc.tests.getTreeTestResults.queryOptions({ testResultIds: treeTestResultIds })
    )
    await queryClient.prefetchQuery(
      trpc.tests.getSurveyResults.queryOptions({ testResultIds: surveyResultIds })
    )
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='container flex max-w-5xl flex-col gap-6'>
        <ResultCards data={data} isResultOnly={isResultOnly} />
        {data.resultsData.map((resultData, sectionIndex) => {
          if (resultData.test.type === SECTION_TYPE.TREE_TEST) {
            return (
              <Suspense
                key={resultData.test.id + sectionIndex}
                fallback={<div>Loading Tree Test...</div>}
              >
                <TreeTestResultCard
                  key={resultData.test.id + 'test-card'}
                  testResults={resultData.results}
                  treeTestData={resultData.test.data}
                  testData={resultData.test}
                  sectionIndex={sectionIndex}
                />
              </Suspense>
            )
          }
          if (resultData.test.type === SECTION_TYPE.SURVEY) {
            return (
              <Suspense
                key={resultData.test.id + sectionIndex}
                fallback={<div>Loading Survey...</div>}
              >
                <SurveyResultsCard
                  testData={resultData.test}
                  testResults={resultData.results}
                  questions={resultData.test.data.questions}
                  sectionIndex={sectionIndex}
                />
              </Suspense>
            )
          }
          return null
        })}
      </div>
    </HydrationBoundary>
  )
}
