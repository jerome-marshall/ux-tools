import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { getProjectByIdAction } from '@/server-actions/projects.action'
import { BREADCRUMBS_DATA, PATH } from '@/utils/urls'
import { HomeIcon } from 'lucide-react'
import { Fragment, use } from 'react'
import { Separator } from './ui/separator'

const Breadcrumbs = ({ pathname }: { pathname: string }) => {
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
                <ProjectBreadcrumb
                  key={breadcrumb}
                  projectId={breadcrumb}
                  isActive={!isLast}
                />
              )
            }

            const breadcrumbData = BREADCRUMBS_DATA[breadcrumb as keyof typeof PATH]

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
  console.log('🚀 ~ isActive:', isActive)
  const project = use(getProjectByIdAction({ id: Number(projectId) }))
  return (
    <>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        {isActive ? (
          <BreadcrumbLink href={`/projects/${projectId}`}>
            {project?.data?.name ?? projectId}
          </BreadcrumbLink>
        ) : (
          (project?.data?.name ?? projectId)
        )}
      </BreadcrumbItem>
    </>
  )
}

export default Breadcrumbs
