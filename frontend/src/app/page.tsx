import type { Metadata } from 'next'

import { Dashboard } from '@/components/pages/dashboard'

export const metadata: Metadata = {
  title: 'Fleet overview · Robot Fleet Dashboard',
}

export default function DashboardPage() {
  return <Dashboard />
}
