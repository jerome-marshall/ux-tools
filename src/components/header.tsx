'use client'
import Link from '@/components/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PATH } from '@/utils/urls'
import { UserButton } from '@daveyplate/better-auth-ui'
import { Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Breadcrumbs from './breadcrumbs'
import { CreateProjectDialog } from './project/create-project-dialog'
import { authClient } from '@/lib/auth-client'

const Header = ({ isHome = false }: { isHome?: boolean }) => {
  const pathname = usePathname()
  const { isPending, data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user

  const isNewStudy = pathname === PATH.newStudy
  const noActions = pathname.includes('/auth') || isPending

  return (
    <header className='w-full border-b bg-white shadow-sm'>
      <div className='flex items-center justify-between px-10 py-3'>
        <div className='flex items-center gap-4'>
          <Link href='/'>
            <p className='text-xl font-bold'>Ux Lab</p>
          </Link>
          <Breadcrumbs />
        </div>
        <div className='flex items-center gap-5'>
          {!noActions && isAuthenticated && !isNewStudy && !isHome && (
            <div className='flex items-center gap-3'>
              <CreateProjectDialog />
              <Link
                href={PATH.newStudy}
                className={cn(
                  buttonVariants({ variant: 'default', size: 'sm' }),
                  'gap-2'
                )}
              >
                <Plus className='size-4' />
                <span>Create study</span>
              </Link>
            </div>
          )}
          <UserButton />
        </div>
      </div>
    </header>
  )
}

export default Header
