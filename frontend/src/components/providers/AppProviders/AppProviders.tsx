'use client'

import { App as AntdApp, ConfigProvider } from 'antd'

import { AppShell } from '@/components/layouts/AppShell'
import { THEME_TOKENS } from '@/constants/ui'
import { FleetProvider } from '@/features/fleet/providers/FleetProvider'
import { AntdRegistry } from '../AntdRegistry'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={{ token: THEME_TOKENS }}>
        <AntdApp>
          <FleetProvider>
            <AppShell>{children}</AppShell>
          </FleetProvider>
        </AntdApp>
      </ConfigProvider>
    </AntdRegistry>
  )
}
