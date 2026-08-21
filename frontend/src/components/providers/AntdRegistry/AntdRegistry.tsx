'use client'

import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs'
import type Entity from '@ant-design/cssinjs/es/Cache'
import { useServerInsertedHTML } from 'next/navigation'
import { useMemo, useRef } from 'react'

export function AntdRegistry({ children }: { children: React.ReactNode }) {
  const cache = useMemo<Entity>(() => createCache(), [])
  const isServerInserted = useRef(false)

  useServerInsertedHTML(() => {
    if (isServerInserted.current) return
    isServerInserted.current = true

    return (
      <style
        id="antd-cssinjs"
        dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
      />
    )
  })

  return <StyleProvider cache={cache}>{children}</StyleProvider>
}
