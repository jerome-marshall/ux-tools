import db from '@/db'
import { type ProjectInsert, projects } from '@/db/schema'

export const getProjects = async () => {
  const projects = await db.query.projects.findMany()
  return projects
}

export const getRecentProducts = async () => {
  const products = await db.query.projects.findMany({
    orderBy: (fields, { desc }) => desc(fields.updatedAt),
    limit: 10
  })
  return products
}

export const createProject = async (project: ProjectInsert) => {
  const [newProject] = await db.insert(projects).values(project).returning()
  return newProject
}
