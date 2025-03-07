export const URL = {
  dashboard: '/dashboard',
  projects: '/projects'
}

export const projectUrl = (projectId: string) => `${URL.projects}/${projectId}`
