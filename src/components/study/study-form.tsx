'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  type FieldArrayWithId,
  useFieldArray,
  useForm,
  type UseFormReturn
} from 'react-hook-form'

import Link from '@/components/link'
import { Form, FormField } from '@/components/ui/form'
import { useInvalidateProject } from '@/hooks/project/use-invalidate-project'
import { useUpdateArchiveStatus } from '@/hooks/project/use-update-archive-status'
import { useInvalidateStudy } from '@/hooks/study/use-invalidate-study'
import { useUpdateStudyStatus } from '@/hooks/study/use-update-study-status'
import { cn, generateId, scrollToSection } from '@/lib/utils'
import { type Project, type Study } from '@/server/db/schema'
import { useTRPC } from '@/trpc/client'
import { getIcon, SECTION_TYPE } from '@/utils/study-utils'
import { doStudyUrl, PATH, previewUrl, studyResultsUrl, studyUrl } from '@/utils/urls'
import {
  type StudyWithTestsInsert,
  studyWithTestsInsertSchema
} from '@/zod-schemas/study.schema'
import { type TestType } from '@/zod-schemas/test.schema'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DevTool } from '@hookform/devtools'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ChartColumnIncreasing,
  Clock,
  CopyIcon,
  GripVertical,
  Hand,
  LinkIcon,
  Loader2Icon,
  Text,
  Trash2,
  TriangleAlert
} from 'lucide-react'
import { useRouter } from 'nextjs-toploader/app'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import Tooltip from '../custom-tooltip'
import { Button, buttonVariants } from '../ui/button'
import { Separator } from '../ui/separator'
import { DeleteStudyDialog } from './delete-study-dialog'
import { DuplicateStudyDialog } from './duplicate-study-dialog'
import StudyAddSection from './study-add-section'
import StudyDetails from './study-details'
import StudyEditModeDialog from './study-edit-mode-dialog'
import { SurveyCard } from './survey/survey-card'
import TreeTest from './tree-test/tree-test'

type BaseStudyFormProps = {
  defaultValues: StudyWithTestsInsert
  onSubmit: (data: StudyWithTestsInsert) => void
  isEditMode?: boolean
  isEditPage: boolean
  isSubmitting: boolean
  project?: Project
  updateArchiveStatus?: (params: { id: string; archived: boolean }) => void
  isArchiveStatusPending?: boolean
  updateStudyStatus?: (params: { studyId: string; isActive: boolean }) => void
  isStudyStatusPending?: boolean
  hasTestResults?: boolean
  study?: Study
  onDeleteClick?: () => void
  onDuplicateClick?: () => void
}

const BaseStudyForm = ({
  defaultValues,
  onSubmit,
  isEditMode = false,
  isEditPage = false,
  isSubmitting = false,
  project,
  updateArchiveStatus,
  isArchiveStatusPending = false,
  updateStudyStatus,
  isStudyStatusPending = false,
  hasTestResults = false,
  study,
  onDeleteClick,
  onDuplicateClick
}: BaseStudyFormProps) => {
  const disableFields = (isEditPage && !isEditMode) || isSubmitting

  const isProjectArchived = isEditPage && project?.archived
  const isStudyActive = isEditPage && study?.isActive

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
    const testId = generateId()
    const sectionId = generateId()

    if (testType === SECTION_TYPE.TREE_TEST) {
      testsFieldArray.append({
        type: testType,
        name: 'Tree Test',
        treeStructure: [],
        taskInstructions: '',
        correctPaths: [],
        testId,
        sectionId,
        studyId
      })
    }

    if (testType === SECTION_TYPE.SURVEY) {
      testsFieldArray.append({
        type: testType,
        name: 'Survey',
        questions: [
          {
            type: 'short_text',
            testId,
            id: generateId(),
            text: '',
            position: 0,
            multipleChoiceOptions: []
          }
        ],
        testId,
        // id is same as testId as it doesnt have a separate table
        sectionId: testId,
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id && over) {
      const oldIndex = testsFieldArray.fields.findIndex(field => field.id === active.id)
      const newIndex = testsFieldArray.fields.findIndex(field => field.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        testsFieldArray.move(oldIndex, newIndex)

        const tests = form.getValues('tests')
        form.setValue('tests', tests, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        })
      }
    }
  }

  const onFormSubmit = (data: StudyWithTestsInsert) => {
    data.study.testsOrder = data.tests.map(test => test.testId)

    onSubmit(data)
  }

  const handleDeleteClick = useCallback(() => {
    onDeleteClick?.()
  }, [onDeleteClick])

  const handleDuplicateClick = useCallback(() => {
    onDuplicateClick?.()
  }, [onDuplicateClick])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <div className='m-4 grid grid-cols-[310px_1fr] gap-8'>
          <div className='sticky top-4 flex h-fit flex-col gap-2'>
            <div
              className={btnClasses}
              onClick={() => scrollToSection(SECTION_TYPE.STUDY_DETAILS, -120)}
            >
              <Text className='icon' />
              <p className=''>Study details</p>
            </div>
            {/* <div
              className={cn(btnClasses, 'mt-3')}
              onClick={() => scrollToSection(SECTION_TYPE.WELCOME_SCREEN)}
            >
              <Hand className='icon' />
              <p className=''>Welcome screen</p>
            </div> */}
            <div className='grid gap-2'>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToParentElement]}
                autoScroll={false}
              >
                <SortableContext
                  items={testsFieldArray.fields.map(field => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {testsFieldArray.fields.map((field, index) => (
                    <SortableItem
                      key={field.id}
                      field={field}
                      index={index}
                      form={form}
                      btnClasses={btnClasses}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            {/* <div
              className={cn(btnClasses)}
              onClick={() => scrollToSection(SECTION_TYPE.THANK_YOU_SCREEN)}
            >
              <ThumbsUp className='icon' />
              <p className=''>Thank you screen</p>
            </div>
            <div className='text-muted-foreground mt-3 flex items-center gap-2'>
              <Clock className='size-4' />
              <p className=''>Under a minute</p>
            </div> */}

            <div className='grid gap-2'>
              {isEditPage && (
                <>
                  <Separator className='my-2' />
                  <div className='grid gap-2'>
                    <Link
                      href={previewUrl(studyId)}
                      className={cn(
                        buttonVariants({ variant: 'secondary' }),
                        'w-full justify-start gap-2 bg-gray-200 hover:bg-gray-300'
                      )}
                    >
                      <Clock className='size-4' />
                      Preview Study
                    </Link>

                    {!isProjectArchived && isStudyActive && (
                      <div className='flex gap-1'>
                        <Link
                          href={doStudyUrl(studyId)}
                          className={cn(
                            buttonVariants({ variant: 'secondary' }),
                            'flex-1 justify-start gap-2 bg-gray-200 hover:bg-gray-300'
                          )}
                          target='_blank'
                        >
                          <Hand className='size-4' />
                          Start Study
                        </Link>
                        <Tooltip
                          content='Copy study link to clipboard'
                          trigger={
                            <Button
                              variant='secondary'
                              size='icon'
                              className='bg-gray-200 hover:bg-gray-300'
                              onClick={e => {
                                e.preventDefault()
                                const fullUrl = `${window.location.origin}${doStudyUrl(studyId)}`
                                navigator?.clipboard
                                  .writeText(fullUrl)
                                  .then(() => {
                                    toast.success('Study link copied to clipboard')
                                  })
                                  .catch(() => {
                                    toast.error('Failed to copy study link to clipboard')
                                  })
                              }}
                            >
                              <LinkIcon className='size-4' />
                            </Button>
                          }
                        />
                      </div>
                    )}

                    <Link
                      href={studyResultsUrl(studyId)}
                      className={cn(
                        buttonVariants({ variant: 'secondary' }),
                        'flex-1 justify-start gap-2 bg-gray-200 hover:bg-gray-300'
                      )}
                    >
                      <ChartColumnIncreasing className='size-4' />
                      View Results
                    </Link>
                  </div>

                  <Separator className='my-2' />

                  <div className='grid grid-cols-2 gap-2'>
                    <Button
                      variant='outline'
                      type='button'
                      className='gap-2 hover:border-gray-300 hover:bg-gray-200'
                      onClick={handleDuplicateClick}
                    >
                      <CopyIcon className='size-4' />
                      Duplicate
                    </Button>
                    <Button
                      variant='outline'
                      type='button'
                      className='gap-2 hover:border-gray-300 hover:bg-gray-200'
                      onClick={handleDeleteClick}
                    >
                      <Trash2 className='size-4' />
                      Delete
                    </Button>
                  </div>
                </>
              )}

              <Button
                className='mt-2 gap-2'
                type='submit'
                disabled={disableFields || !form.formState.isDirty}
              >
                {isSubmitting
                  ? 'Saving...'
                  : isEditPage
                    ? 'Save Changes'
                    : 'Save and Continue'}
              </Button>

              {isEditPage && isProjectArchived && (
                <div className='relative mt-2 flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 shadow-sm'>
                  <p className='text-sm font-medium text-gray-600'>
                    The project which contains this study is archived.
                  </p>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full gap-2'
                    type='button'
                    onClick={() => {
                      if (!project) return
                      updateArchiveStatus?.({ id: project.id, archived: false })
                    }}
                    disabled={isArchiveStatusPending}
                  >
                    {isArchiveStatusPending ? (
                      <Loader2Icon className='size-4 animate-spin' />
                    ) : null}
                    Unarchive Project
                  </Button>
                </div>
              )}

              {isEditPage && !isStudyActive && (
                <div className='relative mt-2 flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 shadow-sm'>
                  <p className='text-sm font-medium text-gray-600'>
                    The study is paused and will not receive any new responses.
                  </p>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full gap-2'
                    type='button'
                    onClick={() => {
                      if (!study) return
                      updateStudyStatus?.({ studyId: study.id, isActive: true })
                    }}
                    disabled={isStudyStatusPending}
                  >
                    {isStudyStatusPending ? (
                      <Loader2Icon className='size-4 animate-spin' />
                    ) : null}
                    Resume Study
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className=''>
            <div className='grid gap-4'>
              <StudyDetails form={form} disableFields={disableFields} />
              {testsFieldArray.fields.map((field, index) => {
                if (field.type === SECTION_TYPE.TREE_TEST) {
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

                if (field.type === SECTION_TYPE.SURVEY) {
                  return (
                    <SurveyCard
                      key={field.id}
                      form={form}
                      index={index}
                      onRemoveSection={onRemoveSection}
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
      <DevTool control={form.control} placement='top-left' />
    </Form>
  )
}

const SortableItem = ({
  field,
  index,
  form,
  btnClasses
}: {
  field: FieldArrayWithId<StudyWithTestsInsert, 'tests', 'id'>
  index: number
  form: UseFormReturn<StudyWithTestsInsert>
  btnClasses: string
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: field.id,
      data: {
        index,
        id: field.id
      }
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : 0
  }

  const Icon = getIcon(field.type)

  const errors = form.formState.errors

  return (
    <FormField
      control={form.control}
      name={`tests.${index}.name`}
      render={({ field: formField }) => (
        <div
          ref={setNodeRef}
          style={style}
          className={cn(
            btnClasses,
            'flex items-center justify-between',
            isDragging && 'opacity-75'
          )}
          onClick={() => scrollToSection(field.type + `-${index}`, -120)}
        >
          <div className='flex items-center gap-2'>
            <Icon className='icon' />
            <p className=''>
              {index + 1}. {formField.value}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {errors?.tests?.[index] && (
              <Tooltip
                trigger={
                  <TriangleAlert className='ml-auto size-7 fill-red-600 stroke-white' />
                }
                content={'This section has errors. Please fix them before saving.'}
              />
            )}
            <GripVertical
              className='text-muted-foreground ml-auto size-7 cursor-grab active:cursor-grabbing'
              {...listeners}
              {...attributes}
            />
          </div>
        </div>
      )}
    />
  )
}

export const CreateStudyForm = ({
  initialData
}: {
  initialData: StudyWithTestsInsert
}) => {
  const trpc = useTRPC()
  const router = useRouter()

  const invalidateProject = useInvalidateProject()
  const invalidateStudy = useInvalidateStudy()

  const { mutate, isPending: isCreateStudyPending } = useMutation(
    trpc.studies.createStudy.mutationOptions({
      onSuccess: data => {
        toast.success('Study created successfully', {
          description: data.name
        })

        invalidateProject({ id: data.projectId })
        invalidateStudy({ id: data.id, projectId: data.projectId })

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

  return (
    <BaseStudyForm
      defaultValues={initialData}
      onSubmit={onSubmit}
      isEditPage={false}
      isSubmitting={isCreateStudyPending}
    />
  )
}

export const EditStudyForm = ({
  initialData,
  initialStudy,
  hasTestResults
}: {
  initialData: StudyWithTestsInsert
  initialStudy: Study
  hasTestResults: boolean
}) => {
  const [isEditMode, setIsEditMode] = useState(!hasTestResults)
  const [isDuplicateStudyDialogOpen, setIsDuplicateStudyDialogOpen] = useState(false)
  const [isDeleteStudyDialogOpen, setIsDeleteStudyDialogOpen] = useState(false)

  const router = useRouter()
  const trpc = useTRPC()

  const { data: project, isLoading: isProjectLoading } = useQuery(
    trpc.projects.getProjectById.queryOptions({ id: initialData.study.projectId })
  )

  const { data: studyData, isLoading: isStudyLoading } = useQuery(
    trpc.studies.getStudyById.queryOptions({ studyId: initialStudy.id })
  )

  const { updateArchiveStatus, isArchiveStatusPending } = useUpdateArchiveStatus()
  const { updateStudyStatus, isStudyStatusPending } = useUpdateStudyStatus()
  const invalidateStudy = useInvalidateStudy()

  const { mutate, isPending: isUpdateStudyPending } = useMutation(
    trpc.studies.updateStudy.mutationOptions({
      onSuccess: data => {
        toast.success('Study updated successfully', {
          description: data.name
        })

        invalidateStudy({ id: initialStudy.id, projectId: initialStudy.projectId })
      }
    })
  )

  if (isProjectLoading || isStudyLoading) {
    return <div>Loading...</div>
  }

  if (!project || !studyData) {
    return <div>Error</div>
  }

  const onSubmit = (data: StudyWithTestsInsert) => {
    console.log('🚀 ~ EditStudyForm onSubmit ~ data:', data)

    mutate({
      studyId: studyData.study.id,
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
        project={project}
        updateArchiveStatus={updateArchiveStatus}
        isArchiveStatusPending={isArchiveStatusPending}
        updateStudyStatus={updateStudyStatus}
        isStudyStatusPending={isStudyStatusPending}
        hasTestResults={hasTestResults}
        study={studyData.study}
        isSubmitting={isUpdateStudyPending}
        onDeleteClick={() => {
          setIsDeleteStudyDialogOpen(true)
        }}
        onDuplicateClick={() => {
          setIsDuplicateStudyDialogOpen(true)
        }}
      />
      <StudyEditModeDialog
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        onDuplicateClick={() => {
          setIsDuplicateStudyDialogOpen(true)
        }}
      />
      <DuplicateStudyDialog
        isOpen={isDuplicateStudyDialogOpen}
        study={studyData.study}
        onOpenChange={setIsDuplicateStudyDialogOpen}
      />
      <DeleteStudyDialog
        isOpen={isDeleteStudyDialogOpen}
        study={studyData.study}
        onOpenChange={setIsDeleteStudyDialogOpen}
        onDeleteSuccess={() => {
          router.push(PATH.dashboard)
        }}
      />
    </>
  )
}
