export const URL = {
  dashboard: '/dashboard',
  projects: '/projects'
}

export const projectUrl = (projectId: string | number) => `${URL.projects}/${projectId}`
