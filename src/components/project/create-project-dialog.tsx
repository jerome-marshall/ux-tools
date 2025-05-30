'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
import { Textarea } from '@/components/ui/textarea'
import { useInvalidateProject } from '@/hooks/project/use-invalidate-project'
import { type ProjectInsert, projectInsertSchema } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Folder } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function CreateProjectDialog({
  triggerVariant = 'ghost'
}: {
  triggerVariant?: 'ghost' | 'default'
}) {
  const trpc = useTRPC()
  const [isOpen, setIsOpen] = useState(false)

  const invalidateProject = useInvalidateProject()

  const form = useForm<ProjectInsert>({
    resolver: zodResolver(projectInsertSchema),
    defaultValues: {
      name: '',
      description: '',
      archived: false
    }
  })

  const { mutate: createProject, isPending } = useMutation(
    trpc.projects.createProject.mutationOptions({
      onSuccess: data => {
        toast.success('New project created', {
          description: data.name
        })

        invalidateProject({ id: data.id })

        setIsOpen(false)
        form.reset()
      },
      onError: () => {
        toast.error('Failed to create project')
      }
    })
  )

  const onSubmit = async (data: ProjectInsert) => {
    createProject(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size='sm'>
          <Folder className='size-4' />
          <span>Create project</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
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
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Project description'
                      {...field}
                      value={field.value ?? ''}
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
                onClick={() => {
                  setIsOpen(false)
                  form.reset()
                }}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Saving...' : 'Create project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
