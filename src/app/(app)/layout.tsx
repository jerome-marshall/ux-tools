import Header from '@/components/header'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import '../../styles/globals.css'
import { Toaster } from '@/components/ui/sonner'
import Providers from '@/components/providers'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Ux Lab',
  description: 'Ux Lab'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} flex h-screen flex-col items-center bg-slate-100 antialiased`}
      >
        <Providers>
          <Header />
          <div className='container mx-auto py-6'>{children}</div>
          <Toaster richColors />
          <ReactQueryDevtools initialIsOpen={false} />
        </Providers>
      </body>
    </html>
  )
}
