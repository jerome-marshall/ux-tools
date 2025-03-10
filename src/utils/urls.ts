import { HomeIcon, type LucideIcon } from 'lucide-react'

export const PATH = {
  dashboard: '/dashboard',
  projects: '/projects',
  studies: '/studies',
  newStudy: '/studies/new'
} as const

export const projectUrl = (projectId: string) => `${PATH.projects}/${projectId}`
export const studyUrl = (studyId: string) => `${PATH.studies}/${studyId}`

export const BREADCRUMBS_DATA: Record<
  keyof typeof PATH,
  {
    name: string
    href: string
    icon?: LucideIcon
  }
> = {
  dashboard: { name: 'Dashboard', href: PATH.dashboard, icon: HomeIcon },
  projects: { name: 'Projects', href: PATH.projects },
  studies: { name: 'Studies', href: PATH.studies },
  newStudy: { name: 'New Study', href: PATH.newStudy }
}
