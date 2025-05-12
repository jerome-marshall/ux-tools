import { createLoader, parseAsString } from 'nuqs/server'

export const sortSearchParams = {
  sort: parseAsString.withDefault('updated'),
  sort_dir: parseAsString.withDefault('desc')
}

export const loadSortSearchParams = createLoader(sortSearchParams)
