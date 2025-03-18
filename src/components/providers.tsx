'use client'

import { TRPCReactProvider } from '@/trpc/client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import NextTopLoader from 'nextjs-toploader'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from './ui/sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <NextTopLoader color='#000' />
      <NuqsAdapter>
        {children}
        <Toaster richColors />
      </NuqsAdapter>
      <ReactQueryDevtools initialIsOpen={false} />
    </TRPCReactProvider>
  )
}
