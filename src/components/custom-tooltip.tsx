import React from 'react'
import { TooltipContent, Tooltip as TooltipRoot, TooltipTrigger } from './ui/tooltip'

const Tooltip = ({
  trigger,
  content,
  asChild = true
}: {
  trigger: React.ReactNode
  content: React.ReactNode
  asChild?: boolean
}) => {
  return (
    <TooltipRoot delayDuration={300}>
      <TooltipTrigger asChild={asChild}>{trigger}</TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </TooltipRoot>
  )
}

export default Tooltip
