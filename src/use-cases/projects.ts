import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  getRecentProjects,
  updateProject
} from '@/data-access/projects'
import { type Project, type ProjectInsert } from '@/server/db/schema'
import { NotFoundError } from '@/utils/error-utils'
import { assertProjectOwner } from './authorization'

export const getProjectsUseCase = async (
  userId: string,
  { active = true, getAll = false }: { active?: boolean; getAll?: boolean }
) => {
  const projects = await getProjects(userId, { active, getAll })
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

export const updateProjectUseCase = async (
  userId: string,
  projectId: string,
  projectData: Partial<Project>
) => {
  // handles authorization and returns the project
  const project = await getProjectByIdUseCase(userId, projectId)

  const updatedProject = await updateProject(projectId, {
    ...project,
    ...projectData
  })
  return updatedProject
}

export const deleteProjectUseCase = async (userId: string, projectId: string) => {
  // handles authorization and returns the project
  const project = await getProjectByIdUseCase(userId, projectId)

  const deletedProject = await deleteProject(project.id)
  return deletedProject
}
