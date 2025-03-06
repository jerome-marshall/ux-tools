import db from '@/db'
import { type ProjectInsert, projects } from '@/db/schema'

export const getProjects = async () => {
  const projects = await db.query.projects.findMany()
  return projects
}

export const createProject = async (project: ProjectInsert) => {
  const [newProject] = await db.insert(projects).values(project).returning()
  return newProject
}
