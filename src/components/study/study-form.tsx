'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '@/components/ui/form'
import StudyDetails from './study-details'

export const FormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  project: z.string().min(1, { message: 'Please select a project.' })
})

const StudyForm = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      project: ''
    }
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data)
    // Handle form submission
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
