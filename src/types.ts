import { type Project } from './server/db/schema'

export type ProjectWithStudiesCount = Project & {
  studiesCount: number
}
