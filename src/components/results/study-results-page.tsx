import ResultCards from '@/components/results/result-cards'
import TreeTestResultCard from '@/components/results/tree-test/tt-result-card'
import { makeQueryClient } from '@/trpc/query-client'
import { trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'

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
    testResultIds.forEach(result => {
      if (result.testType === 'TREE_TEST') {
        treeTestResultIds.push(result.id)
      }
    })

    await queryClient.prefetchQuery(
      trpc.tests.getTreeTestResults.queryOptions({ testResultIds: treeTestResultIds })
    )
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='container flex max-w-5xl flex-col gap-6'>
        <ResultCards data={data} isResultOnly={isResultOnly} />
        {data.resultsData.map(resultData => {
          if (resultData.test.type === 'TREE_TEST') {
            return (
              <Suspense
                key={resultData.test.id}
                fallback={<div>Loading Tree Test...</div>}
              >
                <TreeTestResultCard
                  key={resultData.test.id + 'test-card'}
                  testResults={resultData.results}
                  treeTestData={resultData.test.data}
                  testData={resultData.test}
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
