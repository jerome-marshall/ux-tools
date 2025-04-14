import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ux Lab - Auth',
  description: 'Ux Lab - Auth'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
