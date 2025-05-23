import { cn } from '@/lib/utils'
import { CircleCheck, CircleUser } from 'lucide-react'

export const NodeTotals = ({
  percentage,
  nodeName,
  correct,
  muted,
  numUsers
}: {
  percentage: number
  nodeName: string
  correct: boolean
  muted?: boolean
  numUsers: number
}) => {
  return (
    <div className='relative overflow-hidden rounded-sm border p-3'>
      <div
        className='absolute top-0 left-0 h-full bg-gray-200'
        style={{ width: `${percentage}%` }}
      />
      <div className='relative flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <p className={cn(muted && 'text-gray-500')}>{nodeName}</p>
          {correct && <CircleCheck className='size-5 fill-green-600 text-white' />}
        </div>
        <div className='flex items-center gap-6'>
          <p className=''>{percentage}%</p>
          <div className='flex items-center gap-1 text-gray-500'>
            <CircleUser className='size-4' />
            <span>{numUsers}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
