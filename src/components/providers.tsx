'use client'

import { TRPCReactProvider } from '@/trpc/client'
import { getQueryClient } from '@/utils/ts-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import NextTopLoader from 'nextjs-toploader'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from './ui/sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCReactProvider>
        <NextTopLoader color='#000' />
        <NuqsAdapter>
          {children}
          <Toaster richColors />
        </NuqsAdapter>
        <ReactQueryDevtools initialIsOpen={false} />
      </TRPCReactProvider>
    </QueryClientProvider>
  )
}
