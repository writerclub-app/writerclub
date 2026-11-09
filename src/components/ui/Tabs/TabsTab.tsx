import { Tabs } from '@awakr/awake-ui/tabs'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof Tabs.Tab>

export function TabsTab(props: Props) {
  return <Tabs.Tab {...props} />
}
