'use client'

import { Layout, Typography } from 'antd'
import Link from 'next/link'

import { ROUTES } from '@/constants/routes'
import { COLORS } from '@/constants/ui'

const { Header, Content } = Layout
const { Title } = Typography

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: COLORS.headerBackground, padding: '0 24px' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', height: '100%' }}
        >
          <Link href={ROUTES.dashboard} style={{ textDecoration: 'none' }}>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              🤖 Robot Fleet Dashboard
            </Title>
          </Link>
        </div>
      </Header>

      <Content style={{ padding: 24 }}>{children}</Content>
    </Layout>
  )
}
