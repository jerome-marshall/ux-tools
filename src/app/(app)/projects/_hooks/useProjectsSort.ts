import { useQueryStates } from 'nuqs'
import { revalidateProjectsAction } from '../../actions'
import { projectsSortSearchParams } from '../search-params'

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

export const useProjectsSort = () => {
  const [sortValue, setSortValue] = useQueryStates(projectsSortSearchParams)

  const activeSortValue = sortValue.sort + '_' + sortValue.sort_dir

  const handleSort = async ({ sort, sortDir }: { sort: SortValue; sortDir: SortDir }) => {
    await setSortValue({
      sort,
      sort_dir: sortDir
    })
    await revalidateProjectsAction()
  }

  return { sortValue, setSortValue, options, handleSort, activeSortValue }
}
