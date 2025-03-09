import { db } from '@/server/db'
import { type ProjectInsert, projects } from '@/server/db/schema'

export const getProjects = async ({
  sort,
  sortDir
}: {
  sort: string
  sortDir: string
}) => {
  const projects = await db.query.projects.findMany({
    orderBy: (fields, { desc, asc }) => {
      if (sort === 'created') {
        return sortDir === 'desc' ? desc(fields.createdAt) : asc(fields.createdAt)
      }
      if (sort === 'name') {
        return sortDir === 'desc' ? desc(fields.name) : asc(fields.name)
      }

      return sortDir === 'desc' ? desc(fields.updatedAt) : asc(fields.updatedAt)
    }
  })
  return projects
}

export const getRecentProjects = async () => {
  const projects = await db.query.projects.findMany({
    orderBy: (fields, { desc }) => desc(fields.updatedAt),
    limit: 10
  })
  return projects
}

export const createProject = async (project: ProjectInsert) => {
  const [newProject] = await db.insert(projects).values(project).returning()
  return newProject
}

export const getProjectById = async (projectId: number) => {
  const project = await db.query.projects.findFirst({
    where: (fields, { eq }) => eq(fields.id, projectId)
  })
  return project
}
