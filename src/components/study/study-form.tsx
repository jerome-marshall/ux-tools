'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { Form, FormField, FormMessage } from '@/components/ui/form'
import { useTRPC } from '@/trpc/client'
import { studyUrl } from '@/utils/urls'
import { type StudyWithTestsInsert, studyWithTestsInsertSchema } from '@/zod-schemas'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import StudyAddSection from './study-add-section'
import StudyDetails from './study-details'
import TreeTest from './tree-test/tree-test'
import { type TestType } from '@/server/db/schema'
import {
  Clock,
  FileQuestion,
  Hand,
  ListTree,
  type LucideIcon,
  Text,
  ThumbsUp,
  TriangleAlert
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import Tooltip from '../custom-tooltip'

export const SECTION_ID = {
  STUDY_DETAILS: 'study-details',
  WELCOME_SCREEN: 'welcome-screen',
  TREE_TEST: 'tree-test',
  THANK_YOU_SCREEN: 'thank-you-screen'
}

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
  const errors = form.formState.errors
  // console.log('🚀 ~ StudyForm ~ state:', form.watch())
  console.log('🚀 ~ StudyForm ~ errors:', form.formState.errors)

  const testsFieldArray = useFieldArray({
    control: form.control,
    name: 'tests'
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

  const onSubmit = (data: StudyWithTestsInsert) => {
    console.log('🚀 ~ onSubmit ~ data:', data)
    mutate(data)
  }

  const onAddSection = (testType: TestType) => {
    if (testType === 'TREE_TEST') {
      testsFieldArray.append({
        type: testType,
        name: 'New Tree Test',
        treeStructure: '',
        taskInstructions: '',
        correctPaths: ''
      })
    }
  }

  const onRemoveSection = (index: number) => {
    testsFieldArray.remove(index)
  }

  const btnClasses = cn(
    'flex w-full h-fit items-center gap-3 rounded-md bg-white p-2 text-base shadow-sm',
    'cursor-pointer hover:bg-gray-50 transition-colors'
  )

  const scrollToSection = (sectionId: string) => {
    if (typeof window === 'undefined') return

    const section = document.getElementById(sectionId)
    if (section) {
      const yOffset = -120
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    } else {
      console.warn(`Section with ID "${sectionId}" not found in the DOM`)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='m-4 grid grid-cols-[310px_1fr] gap-8'>
          <div className='sticky top-4 flex h-fit flex-col gap-2'>
            <div
              className={btnClasses}
              onClick={() => scrollToSection(SECTION_ID.STUDY_DETAILS)}
            >
              <Text className='icon' />
              <p className=''>Study details</p>
            </div>
            <div
              className={cn(btnClasses, 'mt-3')}
              onClick={() => scrollToSection(SECTION_ID.WELCOME_SCREEN)}
            >
              <Hand className='icon' />
              <p className=''>Welcome screen</p>
            </div>
            {testsFieldArray.fields.map((field, index) => {
              let Icon: LucideIcon = FileQuestion

              if (field.type === 'TREE_TEST') {
                Icon = ListTree
              }

              return (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`tests.${index}.name`}
                  render={({ field }) => (
                    <div
                      className={cn(btnClasses, '')}
                      onClick={() => scrollToSection(SECTION_ID.TREE_TEST + `-${index}`)}
                    >
                      <Icon className='icon' />
                      <p className=''>
                        {index + 1}. {field.value}
                      </p>
                      {errors?.tests?.[index] && (
                        <Tooltip
                          trigger={
                            <TriangleAlert className='ml-auto size-7 fill-red-600 stroke-white' />
                          }
                          content={
                            'This section has errors. Please fix them before saving.'
                          }
                        />
                      )}
                    </div>
                  )}
                />
              )
            })}
            <div
              className={cn(btnClasses)}
              onClick={() => scrollToSection(SECTION_ID.THANK_YOU_SCREEN)}
            >
              <ThumbsUp className='icon' />
              <p className=''>Thank you screen</p>
            </div>
            <div className='text-muted-foreground mt-3 flex items-center gap-2'>
              <Clock className='size-4' />
              <p className=''>Under a minute</p>
            </div>
            <Button
              className='mt-3 bg-gray-200 hover:bg-gray-300'
              variant={'secondary'}
              type='submit'
            >
              Save and preview
            </Button>
            <Button className='' type='submit'>
              Save and continue
            </Button>
          </div>
          <div className=''>
            <div className='grid gap-4'>
              <StudyDetails form={form} />
              {testsFieldArray.fields.map((field, index) => {
                if (field.type === 'TREE_TEST') {
                  return (
                    <TreeTest
                      key={field.id}
                      form={form}
                      index={index}
                      onRemoveSection={onRemoveSection}
                    />
                  )
                }
              })}
              <StudyAddSection onAddSection={onAddSection} form={form} />
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default StudyForm
