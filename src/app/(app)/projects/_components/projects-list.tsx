import ProjectCard from '@/components/project-card/project-card'
import { getProjectsUseCase } from '@/use-cases/products'
import React from 'react'

type ProjectsListProps = {
  sort?: string | null
  sortDir?: string | null
}

const ProjectsList = async ({ sort, sortDir }: ProjectsListProps) => {
  const projects = await getProjectsUseCase({ sort, sortDir })

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
      {projects.map(project => (
        <ProjectCard key={`project-${project.id}`} project={project} />
      ))}
    </div>
  )
}

export default ProjectsList
