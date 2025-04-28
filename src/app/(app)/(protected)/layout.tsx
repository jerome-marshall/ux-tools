import { RedirectToSignIn, SignedIn } from '@daveyplate/better-auth-ui'
import '../../../styles/globals.css'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {/* <RedirectToSignIn /> */}
      {/* <SignedIn>
        </SignedIn> */}
      {children}
    </>
  )
}
