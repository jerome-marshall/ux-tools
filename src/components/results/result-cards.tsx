'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { type Study } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { type TestResultsWithTest } from '@/types'
import { NotFoundError } from '@/utils/error-utils'
import { doStudyUrl, studyEditUrl } from '@/utils/urls'
import { useQuery } from '@tanstack/react-query'
import {
  CopyIcon,
  LinkIcon,
  type LucideIcon,
  MessageSquare,
  Users2,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from 'sonner'
import ManageStudyStatusDialog from './manage-study-status-dialog'
import ShareResultsDialog from './share-results-dialog'

const ResultCards = ({
  data,
  isResultOnly
}: {
  data: TestResultsWithTest
  isResultOnly?: boolean
}) => {
  const [isShareResultsDialogOpen, setIsShareResultsDialogOpen] = useState(false)
  const responsesCount = data.resultsData.flatMap(resultData => resultData.results).length

  const trpc = useTRPC()
  const { data: studyData, isLoading: isStudyLoading } = useQuery(
    trpc.studies.getStudyById.queryOptions({ studyId: data.study.id })
  )

  const participantsSet = new Set(
    data.resultsData.flatMap(resultData =>
      resultData.results.map(result => result.userId)
    )
  )
  const participantsCount = participantsSet.size

  if (isStudyLoading) {
    return <ResultCardsSkeleton />
  }
  if (!studyData) {
    throw new NotFoundError('Study not found')
  }

  return (
    <div className='flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm'>
      <div className='flex gap-4'>
        <ManageStudyResultCard study={studyData.study} isResultOnly={isResultOnly} />
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
      </div>
      {!isResultOnly && studyData && (
        <div className='flex items-end justify-end gap-2'>
          <Link
            href={studyEditUrl(studyData.study.id)}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            Edit Study
          </Link>
          <Button onClick={() => setIsShareResultsDialogOpen(true)}>
            <LinkIcon className='size-4' />
            Share results
          </Button>
        </div>
      )}
      <ShareResultsDialog
        isOpen={isShareResultsDialogOpen}
        onOpenChange={setIsShareResultsDialogOpen}
        study={studyData?.study}
      />
    </div>
  )
}

const ManageStudyResultCard = ({
  study,
  isResultOnly
}: {
  study: Study
  isResultOnly?: boolean
}) => {
  const [isManageStudyStatusDialogOpen, setIsManageStudyStatusDialogOpen] =
    useState(false)

  const trpc = useTRPC()
  const { data: prohect, isLoading: isProjectLoading } = useQuery(
    trpc.projects.getProjectById.queryOptions(
      { id: study.projectId },
      { enabled: !!study }
    )
  )

  if (isProjectLoading) {
    return <ResultCardSkeleton />
  }

  if (!prohect) {
    throw new NotFoundError('Project not found')
  }

  const isStudyActive = study.isActive
  const isProjectActive = !prohect.archived

  let statusText = ''
  if (isProjectActive) {
    if (isStudyActive) {
      statusText = 'Open for Responses'
    } else {
      statusText = 'Closed'
    }
  } else {
    statusText = 'Project Archived'
  }

  return (
    <>
      <ResultCard
        title='Status'
        Icon={Zap}
        cta={
          !isResultOnly && (
            <Button
              className='text-sm'
              variant={'ghost'}
              size={'sm'}
              onClick={() => setIsManageStudyStatusDialogOpen(true)}
            >
              Manage
            </Button>
          )
        }
        content={
          <div className='flex items-center gap-2 py-0.5'>
            <div
              className={cn(
                'h-3 w-3 rounded-full',
                isStudyActive && isProjectActive ? 'bg-emerald-500' : 'bg-red-500'
              )}
            />
            <span className='text-xl font-medium'>{statusText}</span>
          </div>
        }
        description={
          <div className='flex items-center gap-2'>
            {isStudyActive && isProjectActive ? 'Link active' : 'Link inactive'}
            {isStudyActive && isProjectActive && (
              <Button
                variant={'ghost'}
                size={'icon'}
                className='size-3.5 p-0'
                onClick={() => {
                  void navigator.clipboard
                    .writeText(`${window.location.origin}${doStudyUrl(study.id)}`)
                    .then(() => {
                      toast.success('Link copied to clipboard')
                    })
                }}
              >
                <CopyIcon className='size-3.5' />
              </Button>
            )}
          </div>
        }
      />
      <ManageStudyStatusDialog
        isOpen={isManageStudyStatusDialogOpen}
        onOpenChange={setIsManageStudyStatusDialogOpen}
        study={study}
        project={prohect}
      />
    </>
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
  description: string | React.ReactNode
}) => {
  return (
    <div className='w-full rounded-lg border bg-white'>
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

export const ResultCardSkeleton = () => {
  return (
    <div className='w-full rounded-lg border bg-white'>
      <div className='flex h-full flex-col justify-between gap-5 p-4'>
        <div className='flex justify-between'>
          <div className='flex h-fit items-center gap-1 rounded-full bg-gray-100 px-2 py-1'>
            <Skeleton className='size-[10px]' />
            <Skeleton className='h-3 w-12' />
          </div>
        </div>
        <div className='flex flex-col gap-1'>
          <Skeleton className='h-9 w-16' />
          <Skeleton className='h-4 w-28' />
        </div>
      </div>
    </div>
  )
}

export const ResultCardsSkeleton = () => {
  return (
    <div className='flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm'>
      <div className='flex gap-4'>
        <ResultCardSkeleton />
        <ResultCardSkeleton />
        <ResultCardSkeleton />
      </div>
      <div className='flex items-end justify-end gap-2'>
        <Skeleton className='h-9 w-24' />
        <Skeleton className='h-9 w-32' />
      </div>
    </div>
  )
}

export default ResultCards
