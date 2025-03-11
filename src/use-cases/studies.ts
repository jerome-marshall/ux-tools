import { createStudy, getStudiesByProjectId, updateStudy } from '@/data-access/studies'
import { type Study, type StudyInsert } from '@/server/db/schema'

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

export const updateStudyUseCase = async (
  id: string,
  { id: _, ...study }: Partial<Study>
) => {
  const data = await updateStudy(id, study)
  if (!data) {
    throw new Error('Failed to update study')
  }
  return data
}
