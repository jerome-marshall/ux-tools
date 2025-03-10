import { createStudy, getStudiesByProjectId } from '@/data-access/studies'
import { type StudyInsert } from '@/server/db/schema'

export const createStudyUseCase = async (study: StudyInsert) => {
  const data = await createStudy(study)
  if (!data) {
    throw new Error('Failed to create study')
  }

  return data
}

export const getStudiesByProjectIdUseCase = async (projectId: string) => {
  const data = await getStudiesByProjectId(projectId)
  if (!data) {
    throw new Error('Failed to get studies')
  }
  return data
}
