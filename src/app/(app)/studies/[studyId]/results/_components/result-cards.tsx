import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type TestResultsWithTest } from '@/types'
import { Link, type LucideIcon, MessageSquare, Users2, Zap } from 'lucide-react'
import React from 'react'

const ResultCards = ({ data }: { data: TestResultsWithTest }) => {
  const responsesCount = data.resultsData.flatMap(resultData => resultData.results).length

  const participantsSet = new Set(
    data.resultsData.flatMap(resultData =>
      resultData.results.map(result => result.userId)
    )
  )
  const participantsCount = participantsSet.size

  const isStudyActive = data.study.isActive

  return (
    <div className='flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm'>
      <div className='flex gap-4'>
        <ResultCard
          title='Status'
          Icon={Zap}
          cta={
            <Button className='text-sm' variant={'ghost'} size={'sm'}>
              Manage
            </Button>
          }
          content={
            <div className='flex items-center gap-2 py-0.5'>
              <div
                className={cn(
                  'h-3 w-3 rounded-full',
                  isStudyActive ? 'bg-emerald-500' : 'bg-red-500'
                )}
              />
              <span className='text-xl font-medium'>
                {isStudyActive ? 'Open for Responses' : 'Closed'}
              </span>
            </div>
          }
          description='Link active'
        />
        <ResultCard
          title='Participants'
          Icon={Users2}
          content={<p className='text-3xl font-medium'>{participantsCount}</p>}
          description='Total participants'
        />
        <ResultCard
          title='Responses'
          Icon={MessageSquare}
          content={<p className='text-3xl font-medium'>{responsesCount}</p>}
          description='Total responses'
        />
        {/* <ResultCard isActive={false} /> */}
      </div>
      <div className='flex self-end'>
        <Button>
          <Link className='size-4' />
          Share results
        </Button>
      </div>
    </div>
  )
}

const ResultCard = ({
  title,
  Icon,
  cta,
  content,
  description
}: {
  title: string
  Icon: LucideIcon
  cta?: React.ReactNode
  content: React.ReactNode
  description: string
}) => {
  return (
    <div className='w-full max-w-sm rounded-lg border bg-white'>
      <div className='flex h-full flex-col justify-between gap-5 p-4'>
        <div className='flex justify-between'>
          <div className='flex h-fit items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-500'>
            <Icon className='size-[10px] fill-gray-500' />
            <span className='text-xs font-medium'>{title}</span>
          </div>
          {cta}
        </div>
        <div className='flex flex-col gap-1'>
          {content}
          <span className='text-sm text-gray-600'>{description}</span>
        </div>
      </div>
    </div>
  )
}

export default ResultCards
