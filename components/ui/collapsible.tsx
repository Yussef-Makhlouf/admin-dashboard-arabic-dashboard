'use client'

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'

function Collapsible({
  ...props
}: any) {
  const Root = CollapsiblePrimitive.Root as any
  return <Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: any) {
  const Trigger = CollapsiblePrimitive.CollapsibleTrigger as any
  return (
    <Trigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: any) {
  const Content = CollapsiblePrimitive.CollapsibleContent as any
  return (
    <Content
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
