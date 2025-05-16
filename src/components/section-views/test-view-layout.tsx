import { cn } from '@/lib/utils'

export const TestViewLayout = ({
  children,
  title,
  description,
  wrapperClassName,
  titleClassName,
  contentClassName
}: {
  children: React.ReactNode
  title: string
  description?: string
  wrapperClassName?: string
  titleClassName?: string
  contentClassName?: string
}) => {
  return (
    <div className='relative size-full'>
      <div
        className={cn(
          'mx-auto flex size-full max-w-xl flex-col items-center p-10',
          wrapperClassName
        )}
      >
        <div className={cn('flex flex-col gap-2 text-center', titleClassName)}>
          <h3 className='text-xl font-medium'>{title}</h3>
          {description && <p className='text-gray-500'>{description}</p>}
        </div>
        <div className={cn('mt-10 w-full', contentClassName)}>{children}</div>
      </div>
    </div>
  )
}
