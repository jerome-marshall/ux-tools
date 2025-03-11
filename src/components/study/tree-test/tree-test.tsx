import { type StudyInsert } from '@/server/db/schema'
import { ListTree } from 'lucide-react'
import { useEffect, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import StudyFormCard from '../study-form-card'
import TreeBuilder, { type TreeItem } from './tree-builder'

const TreeTest = ({ form }: { form: UseFormReturn<StudyInsert> }) => {
  const [treeData, setTreeData] = useState<TreeItem[]>([
    {
      id: 'root1',
      name: 'Root 1',
      children: [
        {
          id: 'test1',
          name: 'Test 1',
          children: [{ id: 'test2', name: 'Test2', children: [] }]
        }
      ]
    },
    { id: 'root2', name: 'Root2', children: [] }
  ])

  // Update form data whenever tree data changes
  useEffect(() => {
    // Convert tree data to the format expected by the form
    // const formattedData = JSON.stringify(treeData)
    // Update the form field
    // form.setValue('treeData', formattedData)
  }, [treeData, form])

  // Handle tree data changes from the TreeBuilder
  const handleTreeChange = (newTreeData: TreeItem[]) => {
    setTreeData(newTreeData)
  }

  return (
    <StudyFormCard
      title='Tree test'
      icon={<ListTree className='icon' />}
      content={
        <div className='rounded-md bg-gray-50 p-4'>
          <TreeBuilder initialItems={treeData} onChange={handleTreeChange} />
        </div>
      }
    />
  )
}

export default TreeTest
