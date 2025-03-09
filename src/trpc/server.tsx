import 'server-only' // <-- ensure this file cannot be imported from the client

import { appRouter, createCaller } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { createTRPCOptionsProxy, type TRPCQueryOptions } from '@trpc/tanstack-react-query'
import { headers } from 'next/headers'
import { cache } from 'react'
import { makeQueryClient } from './query-client'
// import { httpLink } from '@trpc/client'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers())
  heads.set('x-trpc-source', 'rsc')

  return createTRPCContext({
    headers: heads
  })
})

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient)
export const caller = createCaller(createContext)

export const trpc = createTRPCOptionsProxy({
  ctx: createContext,
  router: appRouter,
  queryClient: getQueryClient
})

// If your router is on a separate server, pass a client:
// createTRPCOptionsProxy({
//   client: createTRPCClient({
//     links: [httpLink({ url: '...' })]
//   }),
//   queryClient: getQueryClient
// })

// helper functions to hydrate the client and prefetch queries
export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>
  )
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
  const queryClient = getQueryClient()
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    void queryClient.prefetchInfiniteQuery(queryOptions as any)
  } else {
    void queryClient.prefetchQuery(queryOptions)
  }
}
