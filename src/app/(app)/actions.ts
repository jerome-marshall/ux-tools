'use server'

import { actionClient } from '@/lib/safe-action'
import { PATH } from '@/utils/urls'
import { revalidatePath } from 'next/cache'

export const revalidateProjectsAction = actionClient.action(async () => {
  revalidatePath(PATH.projects)
})
