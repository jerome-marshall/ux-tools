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

const TreeTest = ({
  form,
  index,
  onRemoveSection,
  initialTreeData,
  initialCorrectPaths
}: {
  form: UseFormReturn<StudyWithTestsInsert>
  index: number
  onRemoveSection: (index: number) => void
  initialTreeData: TreeItem[]
  initialCorrectPaths: CorrectPath[]
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
                  onMouseEnter={() => setIsHoveringTitle(true)}
                  onMouseLeave={() => setIsHoveringTitle(false)}
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
                      onClick={() => setIsEditingName(true)}
                      className='cursor-pointer'
                    >
                      {index + 1}. {field.value}
                    </CardTitle>
                  )}
                  {isHoveringTitle && !isEditingName && (
                    <Pencil
                      size={16}
                      className='text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
                      onClick={() => setIsEditingName(true)}
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
            />
          </div>
        </div>
      }
    />
  )
}

export default TreeTest
