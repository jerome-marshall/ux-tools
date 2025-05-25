import { auth } from '@/lib/auth'
import { authViewPaths } from '@daveyplate/better-auth-ui/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthView } from './view'
import { cn } from '@/lib/utils'
import { PATH } from '@/utils/urls'

export function generateStaticParams() {
  return Object.values(authViewPaths).map(pathname => ({ pathname }))
}

export default async function AuthPage({
  params,
  searchParams
}: {
  params: Promise<{ pathname: string }>
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { pathname } = await params
  const { redirectTo } = await searchParams

  const sessionData = await auth.api.getSession({ headers: await headers() })

  // Validate if pathname is a valid auth path
  const validAuthPaths = Object.values(authViewPaths)
  const isValidAuthPath = validAuthPaths.includes(pathname)

  if (!isValidAuthPath) {
    redirect(PATH.authSignIn) // Redirect to sign-in for invalid paths
  }

  const isSettingsPage = pathname === 'settings'
  const isSignoutPage = pathname === 'sign-out'
  const isUserLoggedIn = !!sessionData

  // Redirect to login if trying to access settings while not logged in
  if (isSettingsPage && !isUserLoggedIn) {
    redirect(`${PATH.authSignIn}?redirectTo=${PATH.authSettings}`)
  }

  // Redirect to dashboard if user is logged in but trying to access other auth pages
  if (isUserLoggedIn && !isSettingsPage && !isSignoutPage) {
    redirect(redirectTo ?? PATH.dashboard)
  }

  return (
    <div
      className={cn(
        'flex size-full items-center justify-center',
        isSettingsPage && 'items-start'
      )}
    >
      <AuthView pathname={pathname} />
    </div>
  )
}
