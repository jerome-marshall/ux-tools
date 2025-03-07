import {
  createProject,
  getProjectById,
  getProjects,
  getRecentProjects
} from '@/data-access/projects'
import { type ProjectInsert } from '@/db/schema'

export const getProjectsUseCase = async ({
  sort,
  sortDir
}: {
  sort?: string | null
  sortDir?: string | null
}) => {
  if (!sort || !sortDir) {
    sort = 'updated'
    sortDir = 'desc'
  }
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

export const getProjectByIdUseCase = async (projectId: number) => {
  const project = await getProjectById(projectId)
  if (!project) {
    throw new Error('Project not found')
  }
  return project
}
