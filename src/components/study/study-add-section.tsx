import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListTree } from 'lucide-react'

const StudyAddSection = () => {
  return (
    <Card className=''>
      <CardHeader>
        <CardTitle>Add a section</CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-2 gap-4'>
        {studySections.map(section => (
          <StudySection key={section.id} section={section} />
        ))}
      </CardContent>
    </Card>
  )
}

const studySections = [
  {
    id: 'tree-test',
    name: 'Tree test',
    description:
      'Validate your information architecture by asking participants to locate specific items in a tree structure',
    icon: ListTree
  }
]

const StudySection = ({ section }: { section: (typeof studySections)[number] }) => {
  const Icon = section.icon

  return (
    <div className='flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors duration-100 hover:bg-gray-100'>
      <Icon className='icon' />
      <div className='flex flex-1 flex-col'>
        <p className='text-base font-medium'>{section.name}</p>
        <p className='text-muted-foreground text-sm'>{section.description}</p>
      </div>
    </div>
  )
}

export default StudyAddSection
