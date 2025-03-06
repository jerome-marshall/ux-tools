'use server' // don't forget to add this!

import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'
import { projectInsertSchema } from '@/db/schema'
import { createProjectUseCase, getProjectsUseCase } from '@/use-cases/products'
import { revalidatePath } from 'next/cache'
import { URL } from '@/utils/urls'

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
    return newProject
  })

export const getProjectsAction = actionClient.action(async () => {
  const projects = await getProjectsUseCase()
  return projects
})
