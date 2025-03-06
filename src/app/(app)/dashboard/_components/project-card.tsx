import { type Project } from '@/db/schema'
import { FolderClosed, FolderOpen } from 'lucide-react'
import React from 'react'
import ProjectCardOptions from './project-card-options'

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <div className='group relative flex h-[9.5rem] w-full flex-col justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md hover:ring-2 hover:ring-gray-300'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center justify-center rounded-sm bg-gray-100 p-2'>
          <FolderClosed className='size-4 group-hover:hidden' />
          <FolderOpen className='hidden size-4 group-hover:block' />
        </div>
        <ProjectCardOptions />
      </div>
      <div className='flex flex-col gap-1'>
        <p className='text-base font-medium'>{project.name}</p>
        <p className='text-xs text-gray-500'>{2} studies</p>
      </div>
    </div>
  )
}

export default ProjectCard
