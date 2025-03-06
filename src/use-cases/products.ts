import { getProjects } from '@/data-access/products'

export const getProjectsUseCase = async () => {
  const projects = await getProjects()
  return projects
}
