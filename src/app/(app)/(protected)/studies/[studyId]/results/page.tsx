import { caller, trpc } from '@/trpc/server'
import ResultCards from './_components/result-cards'
import TreeTestResultCard from './_components/tt-result-card'
import { Suspense } from 'react'
import { makeQueryClient } from '@/trpc/query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

type PageProps = {
  params: Promise<{ studyId: string }>
}
export default async function StudyPage({ params }: PageProps) {
  const { studyId } = await params

  const data = await caller.tests.getTestResults({ studyId })

  const queryClient = makeQueryClient()
  await queryClient.prefetchQuery(trpc.studies.getStudyById.queryOptions({ studyId }))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='container flex max-w-5xl flex-col gap-6'>
        <ResultCards data={data} />
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
