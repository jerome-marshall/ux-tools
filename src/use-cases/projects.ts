import {
  createProject,
  getProjectById,
  getProjects,
  getRecentProjects
} from '@/data-access/projects'
import { type ProjectInsert } from '@/server/db/schema'
import { assertProjectOwner } from './authorization'
import { NotFoundError } from '@/utils/error-utils'

export const getProjectsUseCase = async (userId: string) => {
  const projects = await getProjects(userId)
  return projects
}

export const getRecentProjectsUseCase = async (userId: string) => {
  const projects = await getRecentProjects(userId)
  return projects
}

export const createProjectUseCase = async (userId: string, project: ProjectInsert) => {
  const newProject = await createProject(userId, project)
  return newProject
}

export const getProjectByIdUseCase = async (userId: string, projectId: string) => {
  const project = await getProjectById(projectId)
  if (!project) {
    throw new NotFoundError('Project not found')
  }

  assertProjectOwner(userId, project)

  return project
}
