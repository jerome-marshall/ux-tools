'use server' // don't forget to add this!

import { projectInsertSchema } from '@/db/schema'
import { actionClient } from '@/lib/safe-action'
import { createProjectUseCase, getRecentProductsUseCase } from '@/use-cases/products'
import { URL } from '@/utils/urls'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// This schema is used to validate input from client.
const schema = z.object({
  number: z.number()
})

export const incrementNumber = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { number } }) => {
    return number + 1
  })

export const createProjectAction = actionClient
  .schema(projectInsertSchema)
  .action(async ({ parsedInput }) => {
    const newProject = await createProjectUseCase(parsedInput)

    revalidatePath(URL.dashboard)
    revalidatePath(URL.projects)
    return newProject
  })

export const getRecentProjectsAction = actionClient.action(async () => {
  const projects = await getRecentProductsUseCase()
  return projects
})

export const revalidateProjectsAction = actionClient.action(async () => {
  revalidatePath(URL.projects)
})
