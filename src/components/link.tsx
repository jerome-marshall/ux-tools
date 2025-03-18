import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import React from 'react'
export interface CustomLinkProps extends NextLinkProps {
  children: React.ReactNode
  className?: string
}

/**
 * Custom Link component wrapper with prefetching always enabled
 */
const Link = ({ children, prefetch = true, ...rest }: CustomLinkProps) => {
  return (
    <NextLink prefetch={prefetch} {...rest}>
      {children}
    </NextLink>
  )
}

export default Link
