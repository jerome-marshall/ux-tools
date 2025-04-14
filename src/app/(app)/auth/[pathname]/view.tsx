'use client'

import { AuthCard } from '@daveyplate/better-auth-ui'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AuthView({ pathname }: { pathname: string }) {
  const router = useRouter()

  useEffect(() => {
    // Clear router cache (protected routes)
    router.refresh()
  }, [router])

  return (
    <main className='flex grow flex-col items-center justify-center gap-4 p-4'>
      <AuthCard pathname={pathname} />
    </main>
  )
}
