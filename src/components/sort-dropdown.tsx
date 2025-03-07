'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useSort } from '@/hooks/useSort'
import { cn } from '@/lib/utils'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import { useState } from 'react'

type SortDropdownProps = {
  onSort?: () => void
}

const SortDropdown = ({ onSort }: SortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const { options, handleSort, activeSortValue } = useSort({ onSort })

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant='muted' size={'sm'} className={cn({ 'bg-gray-300': isOpen })}>
          <ArrowUpDown className='size-4' />
          <span>Sort</span>
          <ChevronDown className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        {options.map(option => (
          <DropdownMenuItem
            key={option.sort + '_' + option.sortDir}
            onClick={() => handleSort(option)}
            className={cn({
              'bg-gray-200': activeSortValue === option.sort + '_' + option.sortDir
            })}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SortDropdown
