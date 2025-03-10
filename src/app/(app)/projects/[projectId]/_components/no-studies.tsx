import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const NoStudies = () => {
  return (
    <div className='m-auto flex h-full w-full max-w-[320px] flex-col items-center justify-center'>
      <p className='text-center text-xl font-medium'>You have no studies</p>
      <p className='mt-3 text-center text-sm text-gray-600'>
        Looks like you haven’t created a study yet. You can create one by clicking the
        button below.
      </p>
      <Link
        href={'/tests/new'}
        className={cn(buttonVariants({ variant: 'default' }), 'mt-8')}
      >
        Create study
      </Link>
    </div>
  )
}

export default NoStudies
