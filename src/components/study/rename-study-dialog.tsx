'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useInvalidateStudy } from '@/hooks/study/use-invalidate-study'
import { type Study, studyInsertSchema } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { type z } from 'zod'

const studyRenameSchema = studyInsertSchema.pick({ name: true })
type StudyRename = z.infer<typeof studyRenameSchema>

export function RenameStudyDialog({
  study,
  isOpen,
  onOpenChange
}: {
  study: Study
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const trpc = useTRPC()
  const invalidateStudy = useInvalidateStudy()

  const form = useForm<StudyRename>({
    resolver: zodResolver(studyRenameSchema),
    defaultValues: {
      name: study.name
    }
  })

  // Reset form with current study name when study changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: study.name
      })
    }
  }, [study, isOpen, form])

  const nameValue = form.watch('name')
  const isNameValid = nameValue !== study.name && nameValue?.length > 0

  const { mutate: renameStudy, isPending } = useMutation(
    trpc.studies.renameStudy.mutationOptions({
      onSuccess: data => {
        toast.success('Study renamed', {
          description: data.name
        })

        invalidateStudy({ id: study.id, projectId: study.projectId })

        onOpenChange(false)
      },
      onError: () => {
        toast.error('Failed to rename study')
      }
    })
  )

  const onSubmit = (data: StudyRename) => {
    renameStudy({ studyId: study.id, name: data.name })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        onOpenChange(open)
      }}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Rename study</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Study name'
                      {...field}
                      onClick={e => e.stopPropagation()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='mt-6'>
              <Button
                type='button'
                variant='ghost'
                onClick={e => {
                  e.stopPropagation()
                  onOpenChange(false)
                  form.reset()
                }}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isPending || !isNameValid}
                onClick={e => {
                  e.stopPropagation()
                }}
              >
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
