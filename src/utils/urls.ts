import { HomeIcon, type LucideIcon } from 'lucide-react'

export const PATH = {
  dashboard: '/dashboard',
  projects: '/projects',
  studies: '/studies',
  newStudy: '/studies/new',
  preview: '/preview',
  doStudy: '/do',
  studyResultOnly: '/study-result',
  auth: '/auth',
  authCallback: '/auth/callback',
  authForgotPassword: '/auth/forgot-password',
  authMagicLink: '/auth/magic-link',
  authResetPassword: '/auth/reset-password',
  authSettings: '/auth/settings',
  authSignIn: '/auth/sign-in',
  authSignOut: '/auth/sign-out',
  authSignUp: '/auth/sign-up'
} as const

export const projectUrl = (projectId: string) => `${PATH.projects}/${projectId}`
export const studyUrl = (studyId: string) => `${PATH.studies}/${studyId}`
export const studyEditUrl = (studyId: string) => `${PATH.studies}/${studyId}/edit`
export const studyResultsUrl = (studyId: string) => `${PATH.studies}/${studyId}/results`
export const studyPreviewUrl = (studyId: string) => `${PATH.preview}/${studyId}`
export const previewUrl = (studyId: string) => `${PATH.preview}/${studyId}`
export const doStudyUrl = (studyId: string) => `${PATH.doStudy}/${studyId}`
export const studyResultOnlyUrl = (studyId: string) =>
  `${PATH.studyResultOnly}/${studyId}`

export const getStudyEditBreadcrumbHref = (breadcrumb: string, ...args: string[]) => {
  return `${PATH.studies}/${args[0]}/edit`
}
export const getStudyResultsBreadcrumbHref = (breadcrumb: string, ...args: string[]) => {
  return `${PATH.studies}/${args[0]}/results`
}
export const getStudyResultOnlyBreadcrumbHref = (
  breadcrumb: string,
  ...args: string[]
) => {
  return `${PATH.studyResultOnly}/${args[0]}`
}

export const BREADCRUMBS_DATA: Record<
  string,
  {
    name: string
    href: string | ((...args: string[]) => string)
    icon?: LucideIcon
    disabled?: boolean
  }
> = {
  dashboard: { name: 'Dashboard', href: PATH.dashboard, icon: HomeIcon },
  projects: { name: 'Projects', href: PATH.projects },
  studies: { name: 'Studies', href: PATH.studies },
  newStudy: { name: 'New Study', href: PATH.newStudy },
  preview: { name: 'Preview', href: PATH.preview },
  doStudy: { name: 'Do Study', href: PATH.doStudy },
  edit: { name: 'Edit', href: getStudyEditBreadcrumbHref },
  results: { name: 'Results', href: getStudyResultsBreadcrumbHref },
  'study-result': {
    name: 'Study Result',
    href: PATH.studyResultOnly,
    disabled: true
  },
  auth: { name: 'Auth', href: PATH.auth },
  callback: { name: 'Callback', href: PATH.authCallback },
  'forgot-password': { name: 'Forgot Password', href: PATH.authForgotPassword },
  'magic-link': { name: 'Magic Link', href: PATH.authMagicLink },
  'reset-password': { name: 'Reset Password', href: PATH.authResetPassword },
  settings: { name: 'Settings', href: PATH.authSettings },
  'sign-in': { name: 'Sign In', href: PATH.authSignIn },
  'sign-out': { name: 'Sign Out', href: PATH.authSignOut },
  'sign-up': { name: 'Sign Up', href: PATH.authSignUp }
}
