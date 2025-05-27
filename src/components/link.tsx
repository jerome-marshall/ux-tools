import { cn } from '@/lib/utils'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import React from 'react'
export interface LinkProps extends NextLinkProps {
  children: React.ReactNode
  className?: string
}

/**
 * Custom Link component wrapper with prefetching always enabled
 */
const Link = ({
  children,
  className,
  prefetch = true,
  ...rest
}: LinkProps & { target?: string & {} }) => {
  return (
    <NextLink prefetch={prefetch} className={cn('cursor-pointer', className)} {...rest}>
      {children}
    </NextLink>
  )
}

export default Link
