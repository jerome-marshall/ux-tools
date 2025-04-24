import { db } from '@/server/db'
import { studies, type Study, type StudyInsert } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export const insertStudy = async (userId: string, study: StudyInsert, trx = db) => {
  const [data] = await trx
    .insert(studies)
    .values({ ...study, ownerId: userId })
    .returning()
  return data
}

export const getStudyById = async (id: string) => {
  const data = await db.query.studies.findFirst({
    where: (fields, { eq }) => eq(fields.id, id)
  })
  return data
}

export const getStudiesByProjectId = async (userId: string, projectId: string) => {
  const data = await db.query.studies.findMany({
    where: (fields, { eq, and }) =>
      and(eq(fields.projectId, projectId), eq(fields.ownerId, userId))
  })
  return data
}

export const updateStudy = async (id: string, study: Partial<Study>, trx = db) => {
  const [data] = await trx
    .update(studies)
    .set(study)
    .where(eq(studies.id, id))
    .returning()
  return data
}
