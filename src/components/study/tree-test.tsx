import { type StudyInsert } from '@/server/db/schema'
import { ListTree } from 'lucide-react'
import { type UseFormReturn } from 'react-hook-form'
import StudyFormCard from './study-form-card'

const TreeTest = ({ form }: { form: UseFormReturn<StudyInsert> }) => {
  return (
    <StudyFormCard
      title='Tree test'
      icon={<ListTree className='icon' />}
      content={<></>}
    />
  )
}

export default TreeTest
