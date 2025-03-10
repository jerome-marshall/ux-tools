import { db } from '@/server/db'
import { studies, type StudyInsert } from '@/server/db/schema'

export const createStudy = async (study: StudyInsert) => {
  const [data] = await db.insert(studies).values(study).returning()
  return data
}

export const getStudiesByProjectId = async (projectId: string) => {
  const data = await db.query.studies.findMany({
    where: (fields, { eq }) => eq(fields.projectId, projectId)
  })
  return data
}
