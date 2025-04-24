import { type Study, type Project } from '@/server/db/schema'
import { AuthenticationError } from '@/utils/error-utils'

export const assertProjectOwner = (userId: string, project: Project) => {
  if (project.ownerId !== userId) {
    throw new AuthenticationError()
  }
}

export const assertStudyOwner = (userId: string, study: Study) => {
  if (study.ownerId !== userId) {
    throw new AuthenticationError()
  }
}
