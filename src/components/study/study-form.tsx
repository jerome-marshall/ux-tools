'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { Form, FormField } from '@/components/ui/form'
import { cn, generateId } from '@/lib/utils'
import { type TestType } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { previewUrl, studyUrl } from '@/utils/urls'
import {
  type StudyWithTestsInsert,
  studyWithTestsInsertSchema
} from '@/zod-schemas/study.schema'
import { useMutation } from '@tanstack/react-query'
import {
  Clock,
  FileQuestion,
  Hand,
  ListTree,
  LockKeyhole,
  type LucideIcon,
  Text,
  ThumbsUp,
  TriangleAlert
} from 'lucide-react'
import Link from '@/components/link'
import { useRouter } from 'nextjs-toploader/app'
import { toast } from 'sonner'
import Tooltip from '../custom-tooltip'
import { Button, buttonVariants } from '../ui/button'
import StudyAddSection from './study-add-section'
import StudyDetails from './study-details'
import TreeTest from './tree-test/tree-test'
import StudyEditModeDialog from './study-edit-mode-dialog'
import { useState } from 'react'

export const SECTION_ID = {
  STUDY_DETAILS: 'study-details',
  WELCOME_SCREEN: 'welcome-screen',
  TREE_TEST: 'tree-test',
  THANK_YOU_SCREEN: 'thank-you-screen'
}

interface BaseStudyFormProps {
  defaultValues: StudyWithTestsInsert
  onSubmit: (data: StudyWithTestsInsert) => void
  isEditMode?: boolean
  isEditPage?: boolean
}

const BaseStudyForm = ({
  defaultValues,
  onSubmit,
  isEditMode = false,
  isEditPage = false
}: BaseStudyFormProps) => {
  const disableFields = isEditPage && !isEditMode

  const { id: studyId } = defaultValues.study

  const form = useForm<StudyWithTestsInsert>({
    resolver: zodResolver(studyWithTestsInsertSchema),
    defaultValues
  })

  const errors = form.formState.errors
  console.log('🚀 ~ StudyForm ~ state:', form.watch())
  console.log('🚀 ~ StudyForm ~ errors:', form.formState.errors)

  const testsFieldArray = useFieldArray({
    control: form.control,
    name: 'tests'
  })

  const onAddSection = (testType: TestType) => {
    if (testType === 'TREE_TEST') {
      testsFieldArray.append({
        type: testType,
        name: 'New Tree Test',
        treeStructure: [],
        taskInstructions: '',
        correctPaths: [],
        testId: generateId(),
        sectionId: generateId(),
        studyId
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
            {/* <div
              className={cn(btnClasses, 'mt-3')}
              onClick={() => scrollToSection(SECTION_ID.WELCOME_SCREEN)}
            >
              <Hand className='icon' />
              <p className=''>Welcome screen</p>
            </div> */}
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
            {/* <div
              className={cn(btnClasses)}
              onClick={() => scrollToSection(SECTION_ID.THANK_YOU_SCREEN)}
            >
              <ThumbsUp className='icon' />
              <p className=''>Thank you screen</p>
            </div>
            <div className='text-muted-foreground mt-3 flex items-center gap-2'>
              <Clock className='size-4' />
              <p className=''>Under a minute</p>
            </div> */}
            {isEditPage && (
              <Link
                href={previewUrl(studyId)}
                className={cn(
                  buttonVariants({ variant: 'secondary' }),
                  'mt-3 bg-gray-200 hover:bg-gray-300'
                )}
              >
                Preview
              </Link>
            )}
            <Button className='' type='submit' disabled={disableFields}>
              Save and continue
            </Button>
          </div>
          <div className=''>
            <div className='grid gap-4'>
              <StudyDetails form={form} disableFields={disableFields} />
              {testsFieldArray.fields.map((field, index) => {
                if (field.type === 'TREE_TEST') {
                  return (
                    <TreeTest
                      key={field.id}
                      form={form}
                      index={index}
                      onRemoveSection={onRemoveSection}
                      initialTreeData={field.treeStructure}
                      initialCorrectPaths={field.correctPaths}
                      disableFields={disableFields}
                    />
                  )
                }
              })}
              {!disableFields && (
                <StudyAddSection
                  onAddSection={onAddSection}
                  form={form}
                  disableFields={disableFields}
                />
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

export const CreateStudyForm = ({
  initialData
}: {
  initialData: StudyWithTestsInsert
}) => {
  const trpc = useTRPC()
  const router = useRouter()

  const { mutate, isPending } = useMutation(
    trpc.studies.createStudy.mutationOptions({
      onSuccess: data => {
        toast.success('Study created successfully', {
          description: data.name
        })
        router.push(studyUrl(data.id))
      },
      onError: error => {
        console.error('🚀 ~ CreateStudyForm ~ error:', error)
        toast.error('Failed to create study', {
          description: error.message
        })
      }
    })
  )

  const onSubmit = (data: StudyWithTestsInsert) => {
    console.log('🚀 ~ CreateStudyForm onSubmit ~ data:', data)
    mutate(data)
  }

  return <BaseStudyForm defaultValues={initialData} onSubmit={onSubmit} />
}

export const EditStudyForm = ({
  initialData,
  studyId
}: {
  initialData: StudyWithTestsInsert
  studyId: string
}) => {
  const [isEditMode, setIsEditMode] = useState(false)

  const trpc = useTRPC()
  const router = useRouter()

  const { mutate, isPending } = useMutation(
    trpc.studies.updateStudy.mutationOptions({
      onSuccess: data => {
        toast.success('Study updated successfully', {
          description: data.name
        })
        router.push(studyUrl(data.id))
      }
    })
  )

  const onSubmit = (data: StudyWithTestsInsert) => {
    console.log('🚀 ~ EditStudyForm onSubmit ~ data:', data)

    mutate({
      studyId,
      data
    })
  }

  return (
    <>
      <BaseStudyForm
        defaultValues={initialData}
        onSubmit={onSubmit}
        isEditMode={isEditMode}
        isEditPage={true}
      />
      <StudyEditModeDialog isEditMode={isEditMode} setIsEditMode={setIsEditMode} />
    </>
  )
}
