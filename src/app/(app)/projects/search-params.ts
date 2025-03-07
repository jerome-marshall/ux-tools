import { createLoader, parseAsString } from 'nuqs/server'

export const projectsSortSearchParams = {
  sort: parseAsString,
  sort_dir: parseAsString
}

export const loadProjectsSortSearchParams = createLoader(projectsSortSearchParams)
