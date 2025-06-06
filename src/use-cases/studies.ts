import {
  deleteStudy,
  getAllStudies,
  getStudiesByProjectId,
  getStudyById,
  insertStudy,
  updateStudy
} from '@/data-access/studies'
import { type Db } from '@/server/db'
import { type Study, type StudyInsert } from '@/server/db/schema'
import { assertStudyOwner } from './authorization'

export const getAllStudiesUseCase = async (userId: string) => {
  const data = await getAllStudies(userId)
  if (!data) {
    throw new Error('Failed to get studies')
  }
  return data
}

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

export const getStudyByIdUseCase = async (userId: string, id: string, trx?: Db) => {
  const data = await getStudyById(id, trx)
  if (!data) {
    throw new Error('Failed to get study')
  }
  assertStudyOwner(userId, data)

  return data
}

export const getPublicStudyByIdUseCase = async (id: string) => {
  const data = await getStudyById(id)
  if (!data) {
    throw new Error('Failed to get study')
  }
  // No authorization check for public access
  return data
}

export const getStudiesByProjectIdUseCase = async (userId: string, projectId: string) => {
  const data = await getStudiesByProjectId(userId, projectId)
  if (!data) {
    throw new Error('Failed to get studies')
  }
  return data
}

export const updateStudyUseCase = async (
  userId: string,
  id: string,
  { id: _, ...study }: Partial<Study>,
  trx?: Db
) => {
  // Check if study exists and is owned by user
  await getStudyByIdUseCase(userId, id, trx)

  const data = await updateStudy(id, study, trx)
  if (!data) {
    throw new Error('Failed to update study')
  }
  return data
}

export const deleteStudyUseCase = async (userId: string, id: string, trx?: Db) => {
  // Check if study exists and is owned by user
  await getStudyByIdUseCase(userId, id, trx)

  const data = await deleteStudy(id, trx)
  if (!data) {
    throw new Error('Failed to delete study')
  }
  return data
}
