import { type Project } from '@/server/db/schema'
import { AuthenticationError } from '@/utils/error-utils'
import { type User } from 'better-auth'

export const assertProjectOwner = (user: User | undefined, project: Project) => {
  if (project.ownerId !== user?.id) {
    throw new AuthenticationError()
  }
}
