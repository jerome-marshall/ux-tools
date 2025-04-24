import { db } from '@/server/db'
import { type ProjectInsert, projects } from '@/server/db/schema'
import { type ProjectWithStudiesCount } from '@/types'

export const getProjects = async (): Promise<ProjectWithStudiesCount[]> => {
  const projects = await db.query.projects.findMany({
    orderBy: (fields, { desc }) => desc(fields.updatedAt),
    with: {
      studies: {
        columns: {
          id: true
        }
      }
    }
  })

  const projectsWithStudiesCount = projects.map(project => {
    const { studies, ...rest } = project
    return {
      ...rest,
      studiesCount: studies.length
    }
  })
  return projectsWithStudiesCount
}

export const getRecentProjects = async (): Promise<ProjectWithStudiesCount[]> => {
  const projects = await db.query.projects.findMany({
    orderBy: (fields, { desc }) => desc(fields.updatedAt),
    limit: 10,
    with: {
      studies: {
        columns: {
          id: true
        }
      }
    }
  })
  const projectsWithStudiesCount = projects.map(project => {
    const { studies, ...rest } = project
    return {
      ...rest,
      studiesCount: studies.length
    }
  })
  return projectsWithStudiesCount
}

export const createProject = async (userId: string, project: ProjectInsert) => {
  const [newProject] = await db
    .insert(projects)
    .values({ ...project, ownerId: userId })
    .returning()
  return newProject
}

export const getProjectById = async (projectId: string) => {
  const project = await db.query.projects.findFirst({
    where: (fields, { eq }) => eq(fields.id, projectId)
  })
  return project
}
