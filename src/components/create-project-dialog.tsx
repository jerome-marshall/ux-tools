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
import { type ProjectInsert, projectInsertSchema } from '@/db/schema'
import { createProjectAction } from '@/server-actions/projects.action'
import { zodResolver } from '@hookform/resolvers/zod'
import { Folder } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function CreateProjectDialog() {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<ProjectInsert>({
    resolver: zodResolver(projectInsertSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  })

  const { execute, isExecuting } = useAction(createProjectAction, {
    onSuccess({ data }) {
      if (data) {
        toast.success('New project created', {
          description: data.name
        })
      }

      setIsOpen(false)
      form.reset()
    },
    onError({ error }) {
      toast.error('Failed to create project')
    }
  })

  const onSubmit = async (data: ProjectInsert) => {
    execute(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm'>
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
              <Button type='submit' disabled={isExecuting}>
                {isExecuting ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
