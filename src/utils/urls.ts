import { HomeIcon, type LucideIcon } from 'lucide-react'

export const PATH = {
  dashboard: '/dashboard',
  projects: '/projects',
  studies: '/studies',
  newStudy: '/studies/new',
  preview: '/preview',
  doStudy: '/do'
} as const

export const projectUrl = (projectId: string) => `${PATH.projects}/${projectId}`
export const studyUrl = (studyId: string) => `${PATH.studies}/${studyId}`
export const studyEditUrl = (studyId: string) => `${PATH.studies}/${studyId}/edit`
export const previewUrl = (studyId: string) => `${PATH.preview}/${studyId}`
export const doStudyUrl = (studyId: string) => `${PATH.doStudy}/${studyId}`

export const getStudyEditBreadcrumbHref = (breadcrumb: string, ...args: string[]) => {
  return `${PATH.studies}/${args[0]}/edit`
}

export const BREADCRUMBS_DATA: Record<
  string,
  {
    name: string
    href: string | ((...args: string[]) => string)
    icon?: LucideIcon
  }
> = {
  dashboard: { name: 'Dashboard', href: PATH.dashboard, icon: HomeIcon },
  projects: { name: 'Projects', href: PATH.projects },
  studies: { name: 'Studies', href: PATH.studies },
  newStudy: { name: 'New Study', href: PATH.newStudy },
  preview: { name: 'Preview', href: PATH.preview },
  doStudy: { name: 'Do Study', href: PATH.doStudy },
  edit: { name: 'Edit Study', href: getStudyEditBreadcrumbHref }
}
