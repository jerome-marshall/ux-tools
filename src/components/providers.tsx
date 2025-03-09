'use client'

import { TRPCReactProvider } from '@/trpc/client'
import { getQueryClient } from '@/utils/ts-query'
import { QueryClientProvider } from '@tanstack/react-query'

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </QueryClientProvider>
  )
}
