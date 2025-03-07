import { createLoader, parseAsString } from 'nuqs/server'

export const sortSearchParams = {
  sort: parseAsString,
  sort_dir: parseAsString
}

export const loadSortSearchParams = createLoader(sortSearchParams)
