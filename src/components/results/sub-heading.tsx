import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

export const SubHeading = ({
  heading,
  Icon,
  classNames
}: {
  heading: string
  Icon: LucideIcon
  classNames?: string
}) => {
  return (
    <div className={cn('flex items-center gap-2', classNames)}>
      <Icon className='size-4 stroke-3 text-gray-400' />
      <span className='font-medium'>{heading}</span>
    </div>
  )
}
