import { useQueryStates } from 'nuqs'
import { sortSearchParams } from '@/utils/search-params'

type SortValue = 'updated' | 'created' | 'name'
type SortDir = 'asc' | 'desc'

const options: {
  label: string
  sort: SortValue
  sortDir: SortDir
}[] = [
  {
    label: 'Modified: Newest first',
    sort: 'updated',
    sortDir: 'desc'
  },
  {
    label: 'Modified: Oldest first',
    sort: 'updated',
    sortDir: 'asc'
  },
  {
    label: 'Created: Newest first',
    sort: 'created',
    sortDir: 'desc'
  },
  {
    label: 'Created: Oldest first',
    sort: 'created',
    sortDir: 'asc'
  },
  {
    label: 'Name: A to Z',
    sort: 'name',
    sortDir: 'asc'
  },
  {
    label: 'Name: Z to A',
    sort: 'name',
    sortDir: 'desc'
  }
]

export const useSort = <
  T extends { name: string; updatedAt: Date | string; createdAt: Date | string }
>({
  onSort,
  data
}: {
  onSort?: () => void
  data?: T[]
}) => {
  const [sortValue, setSortValue] = useQueryStates(sortSearchParams)

  const activeSortValue = sortValue.sort + '_' + sortValue.sort_dir

  const sortedData = [...(data ?? [])]
  if (data?.length) {
    const { sort, sort_dir: sortDir } = sortValue

    if (sort === 'name') {
      sortedData.sort((a, b) => {
        if (sortDir === 'asc') {
          return a.name.localeCompare(b.name)
        }
        return b.name.localeCompare(a.name)
      })
    } else if (sort === 'updated') {
      sortedData.sort((a, b) => {
        if (sortDir === 'asc') {
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
    } else if (sort === 'created') {
      sortedData.sort((a, b) => {
        if (sortDir === 'asc') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    }
  }

  const handleSort = async ({ sort, sortDir }: { sort: SortValue; sortDir: SortDir }) => {
    await setSortValue({
      sort,
      sort_dir: sortDir
    })

    onSort?.()
  }

  return { sortValue, setSortValue, options, handleSort, activeSortValue, sortedData }
}
