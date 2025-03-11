'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Form } from '@/components/ui/form'
import { useTRPC } from '@/trpc/client'
import { studyUrl } from '@/utils/urls'
import { type StudyWithTestsInsert, studyWithTestsInsertSchema } from '@/zod-schemas'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import StudyAddSection from './study-add-section'
import StudyDetails from './study-details'
import TreeTest from './tree-test/tree-test'

const StudyForm = () => {
  const trpc = useTRPC()
  const router = useRouter()

  const form = useForm<StudyWithTestsInsert>({
    resolver: zodResolver(studyWithTestsInsertSchema),
    defaultValues: {
      study: {
        name: ''
      },
      tests: []
    }
  })
  // console.log('🚀 ~ StudyForm ~ state:', form.watch())
  // console.log('🚀 ~ StudyForm ~ errors:', form.formState.errors)

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

  function onSubmit(data: StudyWithTestsInsert) {
    console.log('🚀 ~ onSubmit ~ data:', data)
    mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-6' id='study-form'>
        <StudyDetails form={form} />
        <TreeTest form={form} />
        <StudyAddSection />
      </form>
    </Form>
  )
}

export default StudyForm
