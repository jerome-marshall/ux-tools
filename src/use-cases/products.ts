import { createProject, getProjects } from '@/data-access/products'
import { type ProjectInsert } from '@/db/schema'

export const getProjectsUseCase = async () => {
  const projects = await getProjects()
  return projects
}

export const createProjectUseCase = async (project: ProjectInsert) => {
  const newProject = await createProject(project)
  return newProject
}
