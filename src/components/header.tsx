import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import Breadcrumbs from './breadcrumbs'
import { CreateProjectDialog } from './create-project-dialog'
import { headers } from 'next/headers'

const Header = async () => {
  const headerList = await headers()
  const pathname = headerList.get('x-current-path')!

  return (
    <header className='w-full border-b bg-white shadow-sm'>
      <div className='flex items-center justify-between px-10 py-2'>
        <div className='flex items-center gap-4'>
          <Link href='/'>
            <p className='text-xl font-bold'>Ux Lab</p>
          </Link>
          <Breadcrumbs pathname={pathname} />
        </div>
        <div className='flex items-center gap-3'>
          <CreateProjectDialog />
          <Button size='sm'>
            <Plus className='size-4' />
            <span>Create study</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
