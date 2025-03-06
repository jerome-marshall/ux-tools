'use server' // don't forget to add this!

import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'

// This schema is used to validate input from client.
const schema = z.object({
  number: z.number()
})

export const incrementNumber = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { number } }) => {
    return number + 1
  })
