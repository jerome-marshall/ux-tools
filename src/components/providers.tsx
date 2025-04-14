'use client'

import { TRPCReactProvider } from '@/trpc/client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import NextTopLoader from 'nextjs-toploader'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from './ui/sonner'
import { AuthUIProvider } from '@daveyplate/better-auth-ui'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'nextjs-toploader/app'
import Link from './link'

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <TRPCReactProvider>
      <NextTopLoader color='#000' />
      <NuqsAdapter>
        <AuthUIProvider
          authClient={authClient}
          navigate={href => router.push(href)}
          replace={href => router.replace(href)}
          onSessionChange={() => {
            router.refresh()
          }}
          Link={Link}
        >
          {children}
        </AuthUIProvider>
        <Toaster richColors />
      </NuqsAdapter>
      <ReactQueryDevtools initialIsOpen={false} />
    </TRPCReactProvider>
  )
}
