'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { authClient } from '@/lib/auth-client'
import { isValidUUID } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { BREADCRUMBS_DATA, PATH, projectUrl, studyUrl } from '@/utils/urls'
import { useQuery } from '@tanstack/react-query'
import { HomeIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'
import { Separator } from './ui/separator'
import { Skeleton } from './ui/skeleton'
const Breadcrumbs = () => {
  const { data: session } = authClient.useSession()
  const pathname = usePathname()
  const breadcrumbs = pathname.split('/').filter(Boolean)

  const dynamicParams: string[] = []
  const homeHref = session ? PATH.dashboard : '/'

  const isHome = pathname === '/'
  if (isHome) {
    return null
  }

  const isAuth = pathname.includes('/auth')
  if (isAuth) {
    breadcrumbs.shift()
  }

  return (
    <>
      <Separator orientation='vertical' className='!h-5 !w-0.5' />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={homeHref}>
              <HomeIcon className='size-4' />
            </BreadcrumbLink>
          </BreadcrumbItem>

          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = breadcrumbs.length - 1 === index

            // Projects Detail Page
            if (breadcrumbs[0] === 'projects' && isValidUUID(breadcrumb)) {
              return (
                <ProjectBreadcrumb
                  key={breadcrumb}
                  projectId={breadcrumb}
                  isActive={!isLast}
                />
              )
            }

            // Studies Detail Page
            if (breadcrumbs[0] === 'studies' && isValidUUID(breadcrumb)) {
              dynamicParams.push(breadcrumb)
              return (
                <StudyBreadcrumb
                  key={breadcrumb}
                  studyId={breadcrumb}
                  isActive={!isLast}
                />
              )
            }

            const breadcrumbData = BREADCRUMBS_DATA[breadcrumb as keyof typeof PATH]

            if (!breadcrumbData) {
              return null
            }

            const href =
              typeof breadcrumbData.href === 'function'
                ? breadcrumbData.href(breadcrumb, ...dynamicParams)
                : breadcrumbData.href

            return (
              <Fragment key={breadcrumb}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    breadcrumbData.name || breadcrumb
                  ) : (
                    <BreadcrumbLink href={href}>
                      {breadcrumbData.name || breadcrumb}
                    </BreadcrumbLink>
                  )}
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
  const { data: project, isLoading } = useQuery(
    trpc.projects.getProjectById.queryOptions({ id: projectId })
  )
  if (isLoading) {
    return (
      <>
        <BreadcrumbSeparator />
        <Skeleton className='h-4 w-20' />
      </>
    )
  }

  return (
    <>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        {isActive ? (
          <BreadcrumbLink href={projectUrl(projectId)}>
            {project?.name ?? projectId}
          </BreadcrumbLink>
        ) : (
          (project?.name ?? projectId)
        )}
      </BreadcrumbItem>
    </>
  )
}

const StudyBreadcrumb = ({
  studyId,
  isActive
}: {
  studyId: string
  isActive: boolean
}) => {
  const { data: session } = authClient.useSession()
  const trpc = useTRPC()

  const { data: study, isLoading } = useQuery(
    trpc.studies.getStudyById.queryOptions(
      { studyId },
      { retry: 0, enabled: !!session?.user }
    )
  )

  if (isLoading) {
    return (
      <>
        <BreadcrumbSeparator />
        <Skeleton className='h-4 w-20' />
      </>
    )
  }

  return (
    <>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        {isActive ? (
          <BreadcrumbLink href={studyUrl(studyId)}>
            {study?.study?.name ?? studyId}
          </BreadcrumbLink>
        ) : (
          (study?.study?.name ?? studyId)
        )}
      </BreadcrumbItem>
    </>
  )
}

export default Breadcrumbs
