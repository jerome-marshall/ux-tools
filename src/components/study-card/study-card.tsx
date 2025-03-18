import { type Study } from '@/server/db/schema'
import { format } from 'date-fns'
import { FlaskConical } from 'lucide-react'
import Link from '@/components/link'
import { studyUrl } from '@/utils/urls'
const StudyCard = ({ study }: { study: Study }) => {
  return (
    <Link
      href={studyUrl(study.id)}
      className='relative flex h-[9.5rem] w-full flex-col justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md hover:ring-2 hover:ring-gray-300'
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center justify-center rounded-sm bg-gray-100 p-2'>
          <FlaskConical className='size-4' />
        </div>
        {/* <ProjectCardOptions /> */}
      </div>
      <div className='flex flex-col gap-1'>
        <p className='text-base font-medium'>{study.name}</p>
        <div className='flex items-center justify-between gap-2 text-xs text-gray-500'>
          <p className=''>{2} reponses</p>
          <p className=''>{format(study.createdAt, 'MMM d, yyyy')}</p>
        </div>
      </div>
    </Link>
  )
}

export default StudyCard
