'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { type StudyInsert, studyInsertSchema } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { studyUrl } from '@/utils/urls'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import StudyDetails from './study-details'

const StudyForm = () => {
  const trpc = useTRPC()
  const router = useRouter()

  const form = useForm<StudyInsert>({
    resolver: zodResolver(studyInsertSchema),
    defaultValues: {
      name: ''
    }
  })

  const { mutate, isPending } = useMutation(
    trpc.studies.createStudy.mutationOptions({
      onSuccess: data => {
        toast.success('Study created successfully', {
          description: data.name
        })
        form.reset()
        router.push(studyUrl(data.id))
      }
    })
  )

  function onSubmit(data: StudyInsert) {
    mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6' id='study-form'>
        <StudyDetails form={form} />
      </form>
    </Form>
  )
}

export default StudyForm
