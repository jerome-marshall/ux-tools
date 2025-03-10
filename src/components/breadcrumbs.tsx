'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { caller } from '@/trpc/server'
import { BREADCRUMBS_DATA, PATH } from '@/utils/urls'
import { HomeIcon } from 'lucide-react'
import { Fragment, Suspense, use } from 'react'
import { Separator } from './ui/separator'
import { usePathname } from 'next/navigation'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'

const Breadcrumbs = () => {
  const pathname = usePathname()
  const breadcrumbs = pathname.split('/').filter(Boolean)

  return (
    <>
      <Separator orientation='vertical' className='!h-5 !w-0.5' />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={PATH.dashboard}>
              <HomeIcon className='size-4' />
            </BreadcrumbLink>
          </BreadcrumbItem>

          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = breadcrumb.length - 1 == index

            // Projects Detail Page
            if (breadcrumbs[0] === 'projects' && !isNaN(Number(breadcrumb))) {
              return (
                <Suspense key={breadcrumb} fallback={'Loading...'}>
                  <ProjectBreadcrumb projectId={breadcrumb} isActive={!isLast} />
                </Suspense>
              )
            }

            const breadcrumbData = BREADCRUMBS_DATA[breadcrumb as keyof typeof PATH]

            if (!breadcrumbData) {
              return null
            }

            return (
              <Fragment key={breadcrumb}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={breadcrumbData.href}>
                    {breadcrumbData.name || breadcrumb}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  )
}

const ProjectBreadcrumb = ({
  projectId,
  isActive
}: {
  projectId: string
  isActive: boolean
}) => {
  const trpc = useTRPC()
  const { data: project } = useSuspenseQuery(
    trpc.projects.getProjectById.queryOptions({ id: Number(projectId) })
  )
  return (
    <>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        {isActive ? (
          <BreadcrumbLink href={`/projects/${projectId}`}>
            {project.name ?? projectId}
          </BreadcrumbLink>
        ) : (
          (project?.name ?? projectId)
        )}
      </BreadcrumbItem>
    </>
  )
}

export default Breadcrumbs
