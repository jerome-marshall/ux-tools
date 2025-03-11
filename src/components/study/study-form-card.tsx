import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const StudyFormCard = ({
  content,
  contentClassName,
  title,
  icon,
  className,
  CustomTitle
}: {
  content: React.ReactNode
  contentClassName?: string
  title?: string
  icon?: React.ReactNode
  className?: string
  CustomTitle?: React.ReactNode
}) => {
  return (
    <Card className={cn('border-none', className)}>
      <CardHeader>
        <div className='flex items-center gap-4'>
          {icon}
          {CustomTitle ?? <CardTitle>{title}</CardTitle>}
        </div>
      </CardHeader>
      <CardContent className={contentClassName}>{content}</CardContent>
    </Card>
  )
}

export default StudyFormCard
