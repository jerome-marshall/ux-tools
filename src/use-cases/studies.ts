import { createStudy } from '@/data-access/studies'
import { type StudyInsert } from '@/server/db/schema'

export const createStudyUseCase = async (study: StudyInsert) => {
  const data = await createStudy(study)
  if (!data) {
    throw new Error('Failed to create study')
  }

  return data
}
