import { auth } from '@/lib/auth'
import { PATH } from '@/utils/urls'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import '../../../styles/globals.css'

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const sessionData = await auth.api.getSession({ headers: headersList })

  const currentPath = headersList.get('x-current-path')

  if (!sessionData?.user?.id) {
    return redirect(PATH.authSignIn + '?redirectTo=' + currentPath)
  }

  return <>{children}</>
}
