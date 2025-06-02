import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../../styles/globals.css'
import Providers from '@/components/providers'
import DeviceCheck from '@/components/device-check'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DeviceCheck>
          <Providers>{children}</Providers>
        </DeviceCheck>
      </body>
    </html>
  )
}
