import { type Project } from '@/server/db/schema'
import { AuthenticationError } from '@/utils/error-utils'

export const assertProjectOwner = (userId: string, project: Project) => {
  if (project.ownerId !== userId) {
    throw new AuthenticationError()
  }
}
