import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import SuperJSON from 'superjson'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: false,
        throwOnError: true
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: query =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending'
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize
      }
    }
  })
}
