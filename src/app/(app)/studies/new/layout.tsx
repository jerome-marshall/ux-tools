import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Clock, Hand, Text, ThumbsUp } from 'lucide-react'

export default function NewTestLayout({ children }: { children: React.ReactNode }) {
  const btnClasses =
    'flex w-full h-fit items-center gap-3 rounded-md bg-white p-2 text-base shadow-sm'

  return (
    <div className='m-4 grid grid-cols-[310px_1fr] gap-8'>
      <div className='flex flex-col gap-2'>
        <div className={btnClasses}>
          <Text className='icon' />
          <p className=''>Study details</p>
        </div>
        <div className={cn(btnClasses, 'mt-3')}>
          <Hand className='icon' />
          <p className=''>Welcome screen</p>
        </div>
        <div className={cn(btnClasses)}>
          <ThumbsUp className='icon' />
          <p className=''>Thank you screen</p>
        </div>
        <div className='text-muted-foreground mt-3 flex items-center gap-2'>
          <Clock className='size-4' />
          <p className=''>Under a minute</p>
        </div>
        <Button className='mt-3 bg-gray-200 hover:bg-gray-300' variant={'secondary'}>
          Save and preview
        </Button>
        <Button className='' type='submit' form='study-form'>
          Save and continue
        </Button>
      </div>
      <div className=''>{children}</div>
    </div>
  )
}
