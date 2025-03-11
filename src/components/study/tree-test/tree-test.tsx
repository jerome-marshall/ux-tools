import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { type StudyInsert } from '@/server/db/schema'
import { ListTree, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import StudyFormCard from '../study-form-card'
import TreeBuilder, { type CorrectPath, type TreeItem } from './tree-builder'
import { CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const TreeTest = ({ form }: { form: UseFormReturn<StudyInsert> }) => {
  const [treeData, setTreeData] = useState<TreeItem[]>([])
  const [correctPaths, setCorrectPaths] = useState<CorrectPath[]>([])

  const [testName, setTestName] = useState<string>('Tree test')
  const [isEditingName, setIsEditingName] = useState<boolean>(false)
  const [isHoveringTitle, setIsHoveringTitle] = useState<boolean>(false)

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
    // Update test name in form
    // form.setValue('name', testName)
  }, [treeData, correctPaths, testName, form])

  // Handle tree data changes from the TreeBuilder
  const handleTreeChange = (newTreeData: TreeItem[], newCorrectPaths: CorrectPath[]) => {
    setTreeData(newTreeData)
    setCorrectPaths(newCorrectPaths)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestName(e.target.value)
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
      CustomTitle={
        <div
          className='relative flex items-center gap-2'
          onMouseEnter={() => setIsHoveringTitle(true)}
          onMouseLeave={() => setIsHoveringTitle(false)}
        >
          {isEditingName ? (
            <Input
              value={testName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className='h-8 py-0 text-lg font-semibold'
            />
          ) : (
            <CardTitle onClick={() => setIsEditingName(true)} className='cursor-pointer'>
              {testName}
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
      }
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
