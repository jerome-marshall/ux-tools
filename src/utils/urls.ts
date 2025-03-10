import { HomeIcon, type LucideIcon } from 'lucide-react'

export const PATH = {
  dashboard: '/dashboard',
  projects: '/projects',
  tests: '/tests'
} as const

export const projectUrl = (projectId: string | number) => `${PATH.projects}/${projectId}`

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
  tests: { name: 'Tests', href: PATH.tests }
}
