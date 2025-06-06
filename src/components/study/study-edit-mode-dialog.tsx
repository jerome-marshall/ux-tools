'use client'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'

const StudyEditModeDialog = ({
  isEditMode,
  setIsEditMode,
  onDuplicateClick
}: {
  isEditMode: boolean
  setIsEditMode: (isEditMode: boolean) => void
  onDuplicateClick: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

  if (isEditMode) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className='fixed top-[200px] right-[50%] flex translate-x-[50%] items-center gap-6 rounded-lg border bg-white p-4 shadow-xl'>
        <div className='flex items-center gap-4'>
          <LockKeyhole className='size-6' />
          <p className='font-semibold'>You are in view-only mode.</p>
        </div>
        <DialogTrigger asChild>
          <Button size='sm'>Edit this study</Button>
        </DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Be careful — this study already has responses!
          </DialogTitle>
        </DialogHeader>
        <div className='text-gray-700'>
          <p className=''>
            Some participants have already completed this study, while others may
            currently be in the middle of taking it. Making changes now could disrupt
            their experience and invalidate their responses.
          </p>
        </div>
        <DialogFooter className='mt-4'>
          <Button
            variant='ghost'
            onClick={() => {
              setIsOpen(false)
              onDuplicateClick()
            }}
          >
            Duplicate this study instead
          </Button>
          <Button
            onClick={() => {
              setIsEditMode(true)
              setIsOpen(false)
            }}
          >
            I'll proceed with caution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default StudyEditModeDialog
