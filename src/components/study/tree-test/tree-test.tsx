import { CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { ListTree, Pencil, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import StudyFormCard from '../study-form-card'
import TreeBuilder from './tree-builder'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { SECTION_ID } from '../study-form'
import { type CorrectPath, type TreeItem } from '@/zod-schemas/tree.schema'
import { cn } from '@/lib/utils'

const TreeTest = ({
  form,
  index,
  onRemoveSection,
  initialTreeData,
  initialCorrectPaths,
  disableFields
}: {
  form: UseFormReturn<StudyWithTestsInsert>
  index: number
  onRemoveSection: (index: number) => void
  initialTreeData: TreeItem[]
  initialCorrectPaths: CorrectPath[]
  disableFields: boolean
}) => {
  const [treeData, setTreeData] = useState<TreeItem[]>(initialTreeData)
  const [correctPaths, setCorrectPaths] = useState<CorrectPath[]>(initialCorrectPaths)

  const [testName, setTestName] = useState<string>('Tree test')
  const [isEditingName, setIsEditingName] = useState<boolean>(false)
  const [isHoveringTitle, setIsHoveringTitle] = useState<boolean>(false)

  // Update form data whenever tree data or correct paths change
  useEffect(() => {
    // Update the form fields
    form.setValue(`tests.${index}.treeStructure`, treeData)
    form.setValue(`tests.${index}.correctPaths`, correctPaths)

    form.setValue(`tests.${index}.type`, 'TREE_TEST')
  }, [treeData, correctPaths, testName, form, index])

  // Handle tree data changes from the TreeBuilder
  const handleTreeChange = (newTreeData: TreeItem[], newCorrectPaths: CorrectPath[]) => {
    setTreeData(newTreeData)
    setCorrectPaths(newCorrectPaths)
  }

  const handleNameBlur = () => {
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingName(false)
    }
  }

  const sectionClasses = 'flex flex-col gap-3'

  return (
    <StudyFormCard
      CustomHeader={
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <ListTree className='icon' />
            <FormField
              control={form.control}
              name={`tests.${index}.name`}
              render={({ field }) => (
                <div
                  className='relative flex items-center gap-2'
                  onMouseEnter={() => {
                    if (!disableFields) {
                      setIsHoveringTitle(true)
                    }
                  }}
                  onMouseLeave={() => {
                    if (!disableFields) {
                      setIsHoveringTitle(false)
                    }
                  }}
                >
                  {isEditingName ? (
                    <Input
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={handleNameBlur}
                      onKeyDown={handleNameKeyDown}
                      autoFocus
                      className='h-8 py-0 text-lg font-semibold'
                    />
                  ) : (
                    <CardTitle
                      onClick={() => {
                        if (!disableFields) {
                          setIsEditingName(true)
                        }
                      }}
                      className={cn(
                        'cursor-pointer',
                        disableFields && 'pointer-events-none cursor-default'
                      )}
                    >
                      {index + 1}. {field.value}
                    </CardTitle>
                  )}
                  {isHoveringTitle && !isEditingName && (
                    <Pencil
                      size={16}
                      className={cn(
                        'text-muted-foreground hover:text-for eground cursor-pointer transition-colors',
                        disableFields && 'pointer-events-none cursor-default'
                      )}
                      onClick={() => {
                        if (!disableFields) {
                          setIsEditingName(true)
                        }
                      }}
                    />
                  )}
                </div>
              )}
            />
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => onRemoveSection(index)}
              disabled={disableFields}
            >
              <Trash className='size-4' />
            </Button>
          </div>
        </div>
      }
      content={
        <div id={SECTION_ID.TREE_TEST + `-${index}`}>
          <div className={sectionClasses}>
            <FormField
              control={form.control}
              name={`tests.${index}.taskInstructions`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Keep this short and concise.'
                      className=''
                      {...field}
                      disabled={disableFields}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator className='my-6' />
          <div className={sectionClasses}>
            <Label>Tree</Label>
            <TreeBuilder
              initialItems={treeData}
              initialCorrectPaths={correctPaths}
              onChange={handleTreeChange}
              form={form}
              sectionIndex={index}
              disableFields={disableFields}
            />
          </div>
        </div>
      }
    />
  )
}

export default TreeTest
