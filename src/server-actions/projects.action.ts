'use server'

import { projectInsertSchema } from '@/db/schema'
import { actionClient } from '@/lib/safe-action'
import {
  createProjectUseCase,
  getProjectByIdUseCase,
  getRecentProjectsUseCase
} from '@/use-cases/projects'
import { PATH } from '@/utils/urls'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const createProjectAction = actionClient
  .schema(projectInsertSchema)
  .action(async ({ parsedInput }) => {
    const newProject = await createProjectUseCase(parsedInput)

    revalidatePath(PATH.dashboard)
    revalidatePath(PATH.projects)
    return newProject
  })

export const getRecentProjectsAction = actionClient.action(async () => {
  const projects = await getRecentProjectsUseCase()
  return projects
})

export const getProjectByIdAction = actionClient
  .schema(z.object({ id: z.coerce.number() }))
  .action(async ({ parsedInput: { id } }) => {
    const project = await getProjectByIdUseCase(id)
    return project
  })
