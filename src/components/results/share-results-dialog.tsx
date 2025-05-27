import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useUpdateSharedStatus } from '@/hooks/study/use-update-shared-status'
import { type Study } from '@/server/db/schema'
import { studyResultOnlyUrl } from '@/utils/urls'
import { CopyIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '../ui/input'

const ShareResultsDialog = ({
  isOpen,
  onOpenChange,
  study
}: {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  study?: Study
}) => {
  const { updateSharedStatus, isSharedStatusPending } = useUpdateSharedStatus({
    onSuccess: () => {
      onOpenChange(false)
    }
  })

  if (!study) {
    return null
  }

  const isShared = study.isShared ?? false

  // Generate a sharing URL - In a real implementation, this would use proper routes
  const sharingUrl = `${window.location.origin}${studyResultOnlyUrl(study.id)}`

  const handleCopyLink = () => {
    if (isShared) {
      void navigator.clipboard
        .writeText(sharingUrl)
        .then(() => {
          toast.success('Link copied to clipboard')
        })
        .catch(() => {
          toast.error('Failed to copy link to clipboard')
        })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Share study results</DialogTitle>
          <DialogDescription className='text-base'>
            {isShared
              ? 'Results for this study are currently shared with anyone who has the link.'
              : 'Results for this study are currently private. Only project members can access them.'}
          </DialogDescription>
        </DialogHeader>
        {isShared && (
          <div className='flex w-full max-w-full items-center justify-between gap-2 text-sm'>
            <Input
              className='!border-input !h-9 !ring-0 !ring-offset-0'
              value={sharingUrl}
              readOnly
            />
            <Button
              variant={'outline'}
              size={'icon'}
              className='flex-shrink-0 p-0 text-gray-600 hover:text-gray-900'
              onClick={handleCopyLink}
              title='Copy link to clipboard'
              aria-label='Copy link to clipboard'
            >
              <CopyIcon className='size-4' />
            </Button>
          </div>
        )}
        <DialogFooter className='mt-2'>
          <Button type='button' variant='ghost' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              updateSharedStatus({ studyId: study.id, isShared: !isShared })
            }}
            disabled={isSharedStatusPending}
          >
            {isSharedStatusPending
              ? isShared
                ? 'Disabling sharing...'
                : 'Enabling sharing...'
              : isShared
                ? 'Disable sharing'
                : 'Enable sharing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ShareResultsDialog
