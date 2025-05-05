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
import { projectInsertSchema } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { type ProjectWithStudiesCount } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { type z } from 'zod'
import React, { useEffect } from 'react'

const projectRenameSchema = projectInsertSchema.pick({ name: true })
type ProjectRename = z.infer<typeof projectRenameSchema>

export function RenameProjectDialog({
  project,
  isOpen,
  onOpenChange
}: {
  project: ProjectWithStudiesCount
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

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

        void queryClient.invalidateQueries({
          queryKey: trpc.projects.getProjects.queryKey()
        })
        void queryClient.invalidateQueries({
          queryKey: trpc.projects.getRecentProjects.queryKey()
        })
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
