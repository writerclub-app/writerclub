import { Tabs } from '@awakr/awake-ui/tabs'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof Tabs.Root>

export function TabsRoot({ children, ...props }: Props) {
  return <Tabs.Root {...props}>{children}</Tabs.Root>
}
