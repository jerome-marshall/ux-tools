'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import useActiveStatus from '../_hooks/use-active-status'

const options = [
  {
    label: 'Active Projects',
    value: 'active'
  },
  {
    label: 'Archived Projects',
    value: 'archived'
  }
]

const ProjectsActiveDropdown = () => {
  const { active, setActive } = useActiveStatus()

  const [isOpen, setIsOpen] = useState(false)
  const activeOption = active ? options[0] : options[1]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='muted' size={'sm'} className={cn({ 'bg-gray-300': isOpen })}>
          <span>{activeOption.label}</span>
          <ChevronDown className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        {options.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setActive(option.value === 'active')}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProjectsActiveDropdown
