import { db } from '@/server/db'
import { studies, type Study, type StudyInsert } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export const insertStudy = async (study: StudyInsert) => {
  const [data] = await db.insert(studies).values(study).returning()
  return data
}

export const getStudyById = async (id: string) => {
  const data = await db.query.studies.findFirst({
    where: (fields, { eq }) => eq(fields.id, id)
  })
  return data
}

export const getStudiesByProjectId = async (projectId: string) => {
  const data = await db.query.studies.findMany({
    where: (fields, { eq }) => eq(fields.projectId, projectId)
  })
  return data
}

export const updateStudy = async (id: string, study: Partial<Study>) => {
  const [data] = await db.update(studies).set(study).where(eq(studies.id, id)).returning()
  return data
}
