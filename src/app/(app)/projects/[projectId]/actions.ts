'use server'

import { actionClient } from '@/lib/safe-action'
import { projectUrl } from '@/utils/urls'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export const revalidateProjectDetailsAction = actionClient
  .schema(
    z.object({
      projectId: z.number()
    })
  )
  .action(async ({ parsedInput: { projectId } }) => {
    const url = projectUrl(projectId)
    revalidatePath(url)
  })
