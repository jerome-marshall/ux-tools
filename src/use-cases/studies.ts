import {
  getStudiesByProjectId,
  getStudyById,
  insertStudy,
  updateStudy
} from '@/data-access/studies'
import { type Db } from '@/server/db'
import { type Study, type StudyInsert } from '@/server/db/schema'

export const insertStudyUseCase = async (
  userId: string,
  study: StudyInsert,
  trx?: Db
) => {
  const data = await insertStudy(userId, study, trx)
  if (!data) {
    throw new Error('Failed to create study')
  }

  return data
}

export const getStudyByIdUseCase = async (id: string) => {
  const data = await getStudyById(id)
  if (!data) {
    throw new Error('Failed to get study')
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
  { id: _, ...study }: Partial<Study>,
  trx?: Db
) => {
  const data = await updateStudy(id, study, trx)
  if (!data) {
    throw new Error('Failed to update study')
  }
  return data
}
