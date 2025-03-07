import { createProject, getProjects, getRecentProducts } from '@/data-access/products'
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

export const getRecentProductsUseCase = async () => {
  const products = await getRecentProducts()
  return products
}

export const createProjectUseCase = async (project: ProjectInsert) => {
  const newProject = await createProject(project)
  return newProject
}
