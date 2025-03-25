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
import { useTRPC } from '@/trpc/client'
import { type DuplicateStudy, duplicateStudySchema } from '@/zod-schemas/study.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import ProjectsDropdown from './projects-dropdown'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { studyEditUrl } from '@/utils/urls'

export function DuplicateStudyDialog({
  isOpen,
  setIsOpen,
  study
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  study: { projectId: string; id: string; name: string }
}) {
  const trpc = useTRPC()
  const router = useRouter()

  const { mutate: duplicateStudy, isPending } = useMutation(
    trpc.studies.duplicateStudy.mutationOptions({
      onSuccess: ({ id }) => {
        toast.success(`Study "${study.name}" duplicated successfully`)
        router.push(studyEditUrl(id))
      },
      onError: error => {
        toast.error(`Failed to duplicate study "${study.name}"`)
        console.error(error)
      }
    })
  )

  const form = useForm<DuplicateStudy>({
    resolver: zodResolver(duplicateStudySchema),
    defaultValues: {
      name: '',
      projectId: study.projectId
    }
  })
  // console.log('🚀 ~ form:', form.formState.errors)
  // console.log('🚀 ~ form:', form.watch())

  const onSubmit = async (data: DuplicateStudy) => {
    duplicateStudy({
      studyId: study.id,
      projectId: data.projectId,
      newStudyName: data.name
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader className='mb-2'>
          <DialogTitle>Duplicate "{study.name}"</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study name</FormLabel>
                  <FormControl>
                    <Input placeholder='New study name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='projectId'
              render={({ field }) => (
                <FormItem className='items-start gap-0'>
                  <FormLabel className='mb-2'>Save to project</FormLabel>
                  <FormControl>
                    <ProjectsDropdown
                      ref={field.ref}
                      onSelectChange={field.onChange}
                      initialValue={field.value}
                      error={!!form.formState.errors.projectId}
                    />
                  </FormControl>
                  <FormMessage className='mt-2' />
                </FormItem>
              )}
            />

            <DialogFooter className='mt-6'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => {
                  setIsOpen(false)
                  form.reset()
                }}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={false}>
                {false ? 'Duplicating...' : 'Duplicate'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
