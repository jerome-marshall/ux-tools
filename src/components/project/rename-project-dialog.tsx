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
import { useInvalidateProject } from '@/hooks/project/use-invalidate-project'
import { type Project, projectInsertSchema } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { type z } from 'zod'

const projectRenameSchema = projectInsertSchema.pick({ name: true })
type ProjectRename = z.infer<typeof projectRenameSchema>

export function RenameProjectDialog({
  project,
  isOpen,
  onOpenChange
}: {
  project: Project
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const trpc = useTRPC()
  const invalidateProject = useInvalidateProject()

  const form = useForm<ProjectRename>({
    resolver: zodResolver(projectRenameSchema),
    defaultValues: {
      name: project.name
    }
  })

  // Reset form with current project name when project changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: project.name
      })
    }
  }, [project, isOpen, form])

  const nameValue = form.watch('name')
  const isNameValid = nameValue !== project.name && nameValue?.length > 0

  const { mutate: renameProject, isPending } = useMutation(
    trpc.projects.renameProject.mutationOptions({
      onSuccess: data => {
        toast.success('Project renamed', {
          description: data.name
        })

        invalidateProject({ id: project.id })

        onOpenChange(false)
      },
      onError: () => {
        toast.error('Failed to rename project')
      }
    })
  )

  const onSubmit = async (data: ProjectRename) => {
    renameProject({ id: project.id, name: data.name })
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
          <DialogTitle>Rename project</DialogTitle>
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
                    <Input placeholder='Project name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='mt-6'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => {
                  onOpenChange(false)
                  form.reset()
                }}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending || !isNameValid}>
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
