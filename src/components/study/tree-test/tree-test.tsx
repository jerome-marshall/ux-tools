import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { getIcon, SECTION_TYPE } from '@/utils/study-utils'
import { type StudyWithTestsInsert } from '@/zod-schemas/study.schema'
import { type CorrectPath, type TreeItem } from '@/zod-schemas/tree.schema'
import { useEffect, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import StudyFormSectionCard from '../study-form-section-card'
import TreeBuilder from './tree-builder'

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

  // Sync with props if they change after initial render
  useEffect(() => {
    setTreeData(initialTreeData)
  }, [initialTreeData])

  useEffect(() => {
    setCorrectPaths(initialCorrectPaths)
  }, [initialCorrectPaths])

  // Update form data whenever tree data or correct paths change
  useEffect(() => {
    const currentTreeStructure = form.getValues(`tests.${index}.treeStructure`)
    const currentCorrectPaths = form.getValues(`tests.${index}.correctPaths`)

    // Only update if values have changed to avoid unnecessary rerenders
    const treeChanged = JSON.stringify(currentTreeStructure) !== JSON.stringify(treeData)
    const pathsChanged =
      JSON.stringify(currentCorrectPaths) !== JSON.stringify(correctPaths)

    if (treeChanged) {
      form.setValue(`tests.${index}.treeStructure`, treeData, {
        shouldDirty: true,
        shouldTouch: true
      })
    }

    if (pathsChanged) {
      form.setValue(`tests.${index}.correctPaths`, correctPaths, {
        shouldDirty: true,
        shouldTouch: true
      })
    }

    // Always ensure type is set correctly
    if (form.getValues(`tests.${index}.type`) !== SECTION_TYPE.TREE_TEST) {
      form.setValue(`tests.${index}.type`, SECTION_TYPE.TREE_TEST, {
        shouldDirty: true,
        shouldTouch: true
      })
    }
  }, [treeData, correctPaths, form, index])

  // Handle tree data changes from the TreeBuilder
  const handleTreeChange = (newTreeData: TreeItem[], newCorrectPaths: CorrectPath[]) => {
    setTreeData(newTreeData)
    setCorrectPaths(newCorrectPaths)
  }

  const sectionClasses = 'flex flex-col gap-3'

  return (
    <StudyFormSectionCard
      Icon={getIcon(SECTION_TYPE.TREE_TEST)}
      form={form}
      index={index}
      disableFields={disableFields}
      onRemoveSection={onRemoveSection}
      content={
        <div id={SECTION_TYPE.TREE_TEST + `-${index}`}>
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
