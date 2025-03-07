'use client'
import SortDropdown from '@/components/sort-dropdown'
import React from 'react'
import { revalidateProjectsAction } from '../../actions'

const ProjectsSort = () => {
  return (
    <SortDropdown
      onSort={async () => {
        await revalidateProjectsAction()
      }}
    />
  )
}

export default ProjectsSort
