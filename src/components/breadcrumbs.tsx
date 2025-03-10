'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { isValidUUID } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { BREADCRUMBS_DATA, PATH, projectUrl } from '@/utils/urls'
import { useSuspenseQuery } from '@tanstack/react-query'
import { HomeIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Fragment, Suspense } from 'react'
import { Separator } from './ui/separator'

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
            if (breadcrumbs[0] === 'projects' && isValidUUID(breadcrumb)) {
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
    trpc.projects.getProjectById.queryOptions({ id: projectId })
  )
  return (
    <>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        {isActive ? (
          <BreadcrumbLink href={projectUrl(projectId)}>
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
