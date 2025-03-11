import { type StudyInsert } from '@/server/db/schema'
import { CheckCircle, ListTree } from 'lucide-react'
import { useEffect, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import StudyFormCard from '../study-form-card'
import TreeBuilder, { type TreeItem, type CorrectPath } from './tree-builder'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

const TreeTest = ({ form }: { form: UseFormReturn<StudyInsert> }) => {
  const [treeData, setTreeData] = useState<TreeItem[]>([])
  const [correctPaths, setCorrectPaths] = useState<CorrectPath[]>([])

  // Update form data whenever tree data or correct paths change
  useEffect(() => {
    // Convert tree data and correct paths to the format expected by the form
    // const formattedData = {
    //   treeData: JSON.stringify(treeData),
    //   correctPaths: JSON.stringify(correctPaths)
    // }
    // Update the form fields
    // form.setValue('treeData', formattedData.treeData)
    // form.setValue('correctPaths', formattedData.correctPaths)
  }, [treeData, correctPaths, form])

  // Handle tree data changes from the TreeBuilder
  const handleTreeChange = (newTreeData: TreeItem[], newCorrectPaths: CorrectPath[]) => {
    setTreeData(newTreeData)
    setCorrectPaths(newCorrectPaths)
  }

  const sectionClasses = 'flex flex-col gap-3'

  return (
    <StudyFormCard
      title='Tree test'
      icon={<ListTree className='icon' />}
      content={
        <div>
          <div className={sectionClasses}>
            <Label>Task instructions</Label>
            <Textarea placeholder='Keep this short and concise.' className='' />
          </div>
          <Separator className='my-6' />
          <div className={sectionClasses}>
            <Label>Tree</Label>
            <TreeBuilder
              initialItems={treeData}
              initialCorrectPaths={correctPaths}
              onChange={handleTreeChange}
            />
          </div>
        </div>
      }
    />
  )
}

export default TreeTest
