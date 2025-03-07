'use client'
import SortDropdown from '@/components/sort-dropdown'
import { revalidateProjectDetailsAction } from '../actions'

const StudiesSort = ({ projectId }: { projectId: number }) => {
  return (
    <SortDropdown
      onSort={async () => {
        await revalidateProjectDetailsAction({ projectId })
      }}
    />
  )
}

export default StudiesSort
