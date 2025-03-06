import db from '@/db'

export const getProjects = async () => {
  const projects = await db.query.projects.findMany()
  return projects
}
