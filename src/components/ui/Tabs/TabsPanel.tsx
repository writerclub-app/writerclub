import { Tabs } from '@awakr/awake-ui/tabs'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof Tabs.Panel>

export function TabsPanel({ children, className = '', ...props }: Props) {
  return (
    <Tabs.Panel className={`tabs-panel ${className}`} {...props}>
      {children}
    </Tabs.Panel>
  )
}
