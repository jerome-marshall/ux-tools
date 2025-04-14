'use client'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PATH } from '@/utils/urls'
import { Plus } from 'lucide-react'
import Link from '@/components/link'
import Breadcrumbs from './breadcrumbs'
import { CreateProjectDialog } from './create-project-dialog'
import { usePathname } from 'next/navigation'
import { UserButton } from '@daveyplate/better-auth-ui'

const Header = () => {
  const pathname = usePathname()
  const isNewStudy = pathname === PATH.newStudy

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
          {!isNewStudy && (
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
          <UserButton
            classNames={{
              trigger: {
                base: 'border-gray-300 flex items-center gap-2 justify-center'
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}

export default Header
