import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { AppProviders } from '@/components/providers/AppProviders'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Robot Fleet Dashboard',
  description: 'Real-time robot fleet management and monitoring dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
