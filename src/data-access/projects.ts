import { db } from '@/server/db'
import { type Project, type ProjectInsert, projects } from '@/server/db/schema'
import { type ProjectWithStudiesCount } from '@/types'
import { eq } from 'drizzle-orm'

export const getProjects = async (
  userId: string,
  { active = true, getAll = false }: { active?: boolean; getAll?: boolean }
): Promise<ProjectWithStudiesCount[]> => {
  const projects = await db.query.projects.findMany({
    where: (fields, { eq, and }) => {
      if (getAll) {
        return and(eq(fields.ownerId, userId))
      }
      return and(eq(fields.ownerId, userId), eq(fields.archived, !active))
    },
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

export const getRecentProjects = async (
  userId: string
): Promise<ProjectWithStudiesCount[]> => {
  const projects = await db.query.projects.findMany({
    where: (fields, { eq, and }) =>
      and(eq(fields.ownerId, userId), eq(fields.archived, false)),
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

export const updateProject = async (projectId: string, project: Partial<Project>) => {
  const [updatedProject] = await db
    .update(projects)
    .set(project)
    .where(eq(projects.id, projectId))
    .returning()
  return updatedProject
}
