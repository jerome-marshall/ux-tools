import {
  createProject,
  getProjectById,
  getProjects,
  getRecentProjects
} from '@/data-access/projects'
import { type ProjectInsert } from '@/server/db/schema'

export const getProjectsUseCase = async ({
  sort,
  sortDir
}: {
  sort: string
  sortDir: string
}) => {
  const projects = await getProjects({ sort, sortDir })
  return projects
}

export const getRecentProjectsUseCase = async () => {
  const projects = await getRecentProjects()
  return projects
}

export const createProjectUseCase = async (project: ProjectInsert) => {
  const newProject = await createProject(project)
  return newProject
}

export const getProjectByIdUseCase = async (projectId: string) => {
  const project = await getProjectById(projectId)
  if (!project) {
    throw new Error('Project not found')
  }
  return project
}
