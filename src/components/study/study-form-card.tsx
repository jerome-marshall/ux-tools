import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import React from 'react'

const StudySectionCard = ({
  content,
  contentClassName,
  title,
  icon,
  className,
  CustomHeader
}: {
  content: React.ReactNode
  contentClassName?: string
  title?: string
  icon?: React.ReactNode
  className?: string
  CustomHeader?: React.ReactNode
}) => {
  return (
    <Card className={cn('border-none', className)}>
      <CardHeader>
        {CustomHeader ?? (
          <div className='flex items-center gap-4'>
            {icon}
            <CardTitle>{title}</CardTitle>
          </div>
        )}
      </CardHeader>
      <CardContent className={contentClassName}>{content}</CardContent>
    </Card>
  )
}

export default StudySectionCard
