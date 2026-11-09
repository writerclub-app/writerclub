import { Tabs } from '@awakr/awake-ui/tabs'
import type { ComponentProps } from 'react'
import './TabsList.css'

type Props = ComponentProps<typeof Tabs.List>

export function TabsList({ children, className = '', ...props }: Props) {
  return (
    <Tabs.List className={`tabs-list ${className}`} {...props}>
      {children}
      <Tabs.Indicator />
    </Tabs.List>
  )
}
