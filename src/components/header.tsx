'use client'

import { Button } from '@/components/ui/button'
import { Folder, Plus } from 'lucide-react'
import Link from 'next/link'

const Header = () => {
  return (
    <header className='w-full border-b bg-white shadow-sm'>
      <div className='flex items-center justify-between px-10 py-2'>
        {/* Logo */}
        <Link href='/'>
          <p className='text-xl font-bold'>Ux Lab</p>
        </Link>
        <div className='flex items-center gap-3'>
          <Button variant='ghost'>
            <Folder className='size-4' />
            <span>Create project</span>
          </Button>
          <Button>
            <Plus className='size-4' />
            <span>Create study</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
